import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

export function dashboardRoutes(db) {
  const router = Router();

  // Enforce authentication on all dashboard endpoints
  router.use(requireAuth);

  // Helper handler for dashboard stats & summary
  const getDashboardData = (req, res, next) => {
    try {
      const tenantId = req.tenantId || req.tenant?.id;
      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant context required' });
      }

      // 1. Operational summary widgets
      // Active ROs (status NOT IN ('DIAMBIL'))
      const activeRoRow = db.prepare(`
        SELECT COUNT(*) as count 
        FROM repair_orders 
        WHERE tenant_id = ? AND status != 'DIAMBIL'
      `).get(tenantId);
      const activeRos = activeRoRow ? Number(activeRoRow.count) : 0;

      // Active ROs entered today (entry_date = date('now', 'localtime'))
      const roTodayRow = db.prepare(`
        SELECT COUNT(*) as count 
        FROM repair_orders 
        WHERE tenant_id = ? AND entry_date = date('now', 'localtime')
      `).get(tenantId);
      const carsEnteredToday = roTodayRow ? Number(roTodayRow.count) : 0;

      // Completed ROs today
      const completedTodayRow = db.prepare(`
        SELECT COUNT(*) as count 
        FROM repair_orders 
        WHERE tenant_id = ? 
          AND status IN ('SELESAI', 'DIAMBIL') 
          AND date(updated_at, 'localtime') = date('now', 'localtime')
      `).get(tenantId);
      const completedRosToday = completedTodayRow ? Number(completedTodayRow.count) : 0;

      // Monthly Revenue & Expense (current calendar month)
      const monthlyFinanceRow = db.prepare(`
        SELECT 
          COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) as monthly_revenue,
          COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) as monthly_expense
        FROM transactions 
        WHERE tenant_id = ? 
          AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now', 'localtime')
      `).get(tenantId);
      const monthlyRevenue = monthlyFinanceRow ? Number(monthlyFinanceRow.monthly_revenue) : 0;
      const monthlyExpense = monthlyFinanceRow ? Number(monthlyFinanceRow.monthly_expense) : 0;
      const monthlyNet = monthlyRevenue - monthlyExpense;

      // Monthly Revenue Target from tenant_settings
      const settingsRow = db.prepare(`
        SELECT monthly_revenue_target 
        FROM tenant_settings 
        WHERE tenant_id = ?
      `).get(tenantId);
      const monthlyTarget = settingsRow ? Number(settingsRow.monthly_revenue_target || 15000000) : 15000000;
      const targetProgressPercent = monthlyTarget > 0 ? Math.min(100, Math.round((monthlyRevenue / monthlyTarget) * 100)) : 0;

      // Low stock counts (stock <= min_stock) & out of stock (stock = 0)
      const stockAlertRow = db.prepare(`
        SELECT 
          COUNT(CASE WHEN stock <= min_stock THEN 1 END) as low_stock_count,
          COUNT(CASE WHEN stock = 0 THEN 1 END) as out_of_stock_count,
          COUNT(*) as total_parts
        FROM spareparts 
        WHERE tenant_id = ? AND is_active = 1
      `).get(tenantId);
      const lowStockCount = stockAlertRow ? Number(stockAlertRow.low_stock_count) : 0;
      const outOfStockCount = stockAlertRow ? Number(stockAlertRow.out_of_stock_count) : 0;
      const totalSpareparts = stockAlertRow ? Number(stockAlertRow.total_parts) : 0;

      // 2. RO Status Distribution counts for all 6 stages
      const statusCounts = {
        MASUK: 0,
        DIAGNOSA: 0,
        PENGERJAAN: 0,
        MENUNGGU_PART: 0,
        SELESAI: 0,
        DIAMBIL: 0
      };

      const roDistributionRows = db.prepare(`
        SELECT status, COUNT(*) as count 
        FROM repair_orders 
        WHERE tenant_id = ? 
        GROUP BY status
      `).all(tenantId);

      for (const row of roDistributionRows) {
        if (statusCounts.hasOwnProperty(row.status)) {
          statusCounts[row.status] = Number(row.count);
        }
      }

      const statusLabels = {
        MASUK: 'Mobil Masuk',
        DIAGNOSA: 'Pemeriksaan / Diagnosa',
        PENGERJAAN: 'Pengerjaan Servis',
        MENUNGGU_PART: 'Menunggu Sparepart',
        SELESAI: 'Selesai Dikerjakan',
        DIAMBIL: 'Sudah Diambil'
      };

      const statusColors = {
        MASUK: '#3B82F6',       // Blue
        DIAGNOSA: '#F59E0B',    // Amber
        PENGERJAAN: '#8B5CF6',  // Purple
        MENUNGGU_PART: '#EC4899',// Pink
        SELESAI: '#10B981',     // Emerald
        DIAMBIL: '#6B7280'      // Gray
      };

      const statusDistributionArray = Object.keys(statusCounts).map(key => ({
        status: key,
        label: statusLabels[key],
        count: statusCounts[key],
        color: statusColors[key]
      }));

      // 3. 30-Day Daily Revenue Trend Array: [{ date: 'YYYY-MM-DD', revenue: number, expense: number }]
      // Generate last 30 dates ending today
      const trendMap = new Map();
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        trendMap.set(dateStr, { date: dateStr, revenue: 0, expense: 0 });
      }

      const earliestDate = Array.from(trendMap.keys())[0];
      const dailyTransactions = db.prepare(`
        SELECT 
          date,
          COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) as daily_revenue,
          COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) as daily_expense
        FROM transactions 
        WHERE tenant_id = ? AND date >= ?
        GROUP BY date
      `).all(tenantId, earliestDate);

      for (const row of dailyTransactions) {
        if (trendMap.has(row.date)) {
          const entry = trendMap.get(row.date);
          entry.revenue = Number(row.daily_revenue);
          entry.expense = Number(row.daily_expense);
        }
      }

      const revenueTrend30d = Array.from(trendMap.values());

      // 4. Top 5 Most Used / Fast-Moving Spareparts
      let topSpareparts = db.prepare(`
        SELECT 
          s.id,
          s.name,
          s.sku,
          s.category,
          s.unit,
          s.sell_price,
          COALESCE(SUM(ro_sp.quantity), 0) as total_used,
          COALESCE(SUM(ro_sp.subtotal), 0) as total_revenue
        FROM ro_spareparts ro_sp
        JOIN spareparts s ON s.id = ro_sp.sparepart_id
        WHERE ro_sp.tenant_id = ?
        GROUP BY s.id
        ORDER BY total_used DESC, total_revenue DESC
        LIMIT 5
      `).all(tenantId);

      // If no ro_spareparts records yet, fallback to stock_movements OUT
      if (topSpareparts.length === 0) {
        topSpareparts = db.prepare(`
          SELECT 
            s.id,
            s.name,
            s.sku,
            s.category,
            s.unit,
            s.sell_price,
            COALESCE(SUM(sm.quantity), 0) as total_used,
            COALESCE(SUM(sm.total_price), 0) as total_revenue
          FROM stock_movements sm
          JOIN spareparts s ON s.id = sm.sparepart_id
          WHERE sm.tenant_id = ? AND sm.type = 'OUT'
          GROUP BY s.id
          ORDER BY total_used DESC, total_revenue DESC
          LIMIT 5
        `).all(tenantId);
      }

      // 5. Recent Activity Feed (10 most recent events combining RO status changes and transactions)
      const recentRoLogs = db.prepare(`
        SELECT 
          l.id,
          'RO' as activity_type,
          l.repair_order_id,
          l.previous_status,
          l.new_status,
          l.notes,
          l.actor_name,
          l.created_at,
          ro.plate_number,
          ro.customer_name,
          ro.car_brand,
          ro.car_model
        FROM ro_status_logs l
        JOIN repair_orders ro ON ro.id = l.repair_order_id
        WHERE l.tenant_id = ?
        ORDER BY l.created_at DESC
        LIMIT 10
      `).all(tenantId);

      const recentTransactions = db.prepare(`
        SELECT 
          t.id,
          t.type as activity_type,
          t.amount,
          t.date,
          t.description,
          t.payment_method,
          t.created_at,
          tc.name as category_name
        FROM transactions t
        LEFT JOIN transaction_categories tc ON tc.id = t.category_id
        WHERE t.tenant_id = ?
        ORDER BY t.created_at DESC
        LIMIT 10
      `).all(tenantId);

      const combinedActivities = [];

      for (const log of recentRoLogs) {
        const vehicleInfo = `${log.car_brand || ''} ${log.car_model || ''}`.trim();
        const stageLabel = statusLabels[log.new_status] || log.new_status;
        combinedActivities.push({
          id: `ro-${log.id}`,
          type: 'RO',
          title: `Status Servis: ${log.plate_number} (${stageLabel})`,
          description: log.notes ? log.notes : `Kendaraan ${vehicleInfo} oleh ${log.customer_name}`,
          meta: {
            repair_order_id: log.repair_order_id,
            plate_number: log.plate_number,
            new_status: log.new_status,
            previous_status: log.previous_status,
            actor: log.actor_name
          },
          amount: null,
          timestamp: log.created_at,
          icon: 'wrench'
        });
      }

      for (const tx of recentTransactions) {
        const isIncome = tx.activity_type === 'INCOME';
        combinedActivities.push({
          id: `tx-${tx.id}`,
          type: tx.activity_type,
          title: `${isIncome ? 'Pemasukan' : 'Pengeluaran'}: ${tx.category_name || 'Kas'}`,
          description: tx.description || `${tx.payment_method} - ${tx.date}`,
          meta: {
            payment_method: tx.payment_method,
            category: tx.category_name,
            date: tx.date
          },
          amount: Number(tx.amount),
          timestamp: tx.created_at || `${tx.date}T12:00:00Z`,
          icon: isIncome ? 'arrow-up-right' : 'arrow-down-right'
        });
      }

      // Sort combined descending by timestamp, take top 10
      combinedActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const recentActivities = combinedActivities.slice(0, 10);

      const summary = {
        active_ros: activeRos,
        active_ros_today: activeRos,
        cars_entered_today: carsEnteredToday,
        completed_ros_today: completedRosToday,
        monthly_revenue: monthlyRevenue,
        monthly_expense: monthlyExpense,
        monthly_net: monthlyNet,
        monthly_target: monthlyTarget,
        target_progress_percent: targetProgressPercent,
        low_stock_count: lowStockCount,
        out_of_stock_count: outOfStockCount,
        total_spareparts: totalSpareparts
      };

      res.json({
        success: true,
        summary,
        ...summary,
        status_distribution: statusCounts,
        status_distribution_array: statusDistributionArray,
        revenue_trend_30d: revenueTrend30d,
        revenue_trend: revenueTrend30d,
        top_spareparts: topSpareparts,
        top_parts: topSpareparts,
        recent_activities: recentActivities,
        recent_activity: recentActivities
      });
    } catch (err) {
      next(err);
    }
  };

  // GET /api/dashboard/summary
  router.get('/summary', getDashboardData);

  // GET /api/dashboard/stats
  router.get('/stats', getDashboardData);

  // GET /api/dashboard
  router.get('/', getDashboardData);

  return router;
}

export default dashboardRoutes;
