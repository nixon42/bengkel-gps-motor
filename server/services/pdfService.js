import PDFDocument from 'pdfkit';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Format currency to Indonesian Rupiah (Rp X.XXX)
 */
export function formatRupiah(amount) {
  const num = Math.round(Number(amount) || 0);
  return 'Rp ' + num.toLocaleString('id-ID');
}

/**
 * Format date string to Indonesian localized format
 */
export function formatDateIndo(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return String(dateStr);
  }
}

/**
 * Helper to build PDF buffer from a PDFKit document
 */
function streamToBuffer(doc) {
  return new Promise((resolve, reject) => {
    const buffers = [];
    doc.on('data', chunk => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', err => reject(err));
  });
}

/**
 * Draw standard workshop header on PDF document
 */
function drawHeader(doc, tenant, reportTitle, subtitle = '') {
  const workshopName = tenant?.name || 'Bengkel Mobil GPS Motor Kediri';
  const address = tenant?.address || 'Sambiresik, Kec. Gampengrejo, Kab. Kediri, Jawa Timur';
  const phone = tenant?.phone_wa || tenant?.phoneWa || '0856-0330-7330';
  const hours = tenant?.business_hours || tenant?.businessHours || 'Senin - Sabtu: 08:00 - 17:00 WIB';

  // Check for logo
  let logoDrawn = false;
  if (tenant?.logo_url) {
    try {
      const cleanUrl = tenant.logo_url.replace(/^\//, '');
      const possiblePath = path.join(__dirname, '../../', cleanUrl);
      if (fs.existsSync(possiblePath)) {
        doc.image(possiblePath, 40, 35, { width: 50 });
        logoDrawn = true;
      }
    } catch {
      logoDrawn = false;
    }
  }

  const leftMargin = logoDrawn ? 100 : 40;

  doc.fillColor('#0f172a')
     .font('Helvetica-Bold')
     .fontSize(14)
     .text(workshopName.toUpperCase(), leftMargin, 35, { width: 470 - (logoDrawn ? 60 : 0) });

  doc.font('Helvetica')
     .fontSize(8)
     .fillColor('#475569')
     .text(`${address} | WA: ${phone} | ${hours}`, leftMargin, doc.y + 2, { width: 470 - (logoDrawn ? 60 : 0) });

  // Divider
  const headerBottom = Math.max(doc.y + 8, 75);
  doc.strokeColor('#cbd5e1')
     .lineWidth(1)
     .moveTo(40, headerBottom)
     .lineTo(555, headerBottom)
     .stroke();

  // Report Title
  doc.y = headerBottom + 12;
  doc.font('Helvetica-Bold')
     .fontSize(12)
     .fillColor('#1e293b')
     .text(reportTitle, 40, doc.y, { align: 'center', width: 515 });

  if (subtitle) {
    doc.font('Helvetica')
       .fontSize(8)
       .fillColor('#64748b')
       .text(subtitle, 40, doc.y + 3, { align: 'center', width: 515 });
  }

  const nowStr = new Date().toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  doc.font('Helvetica')
     .fontSize(7)
     .fillColor('#94a3b8')
     .text(`Dicetak pada: ${nowStr} WIB`, 40, doc.y + 2, { align: 'right', width: 515 });

  doc.y = doc.y + 10;
}

/**
 * Generate full inventory PDF report
 */
export async function generateInventoryPdf(tenant, items = [], options = {}) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const bufferPromise = streamToBuffer(doc);

  const title = options.title || 'LAPORAN DAFTAR INVENTARIS & SPAREPART';
  const subtitle = `Total: ${items.length} item sparepart`;

  drawHeader(doc, tenant, title, subtitle);

  // Table Configuration
  const startX = 40;
  const colWidths = [70, 160, 65, 45, 65, 65, 45]; // Total = 515
  const colHeaders = ['SKU', 'Nama Sparepart', 'Kategori', 'Stok', 'Harga Beli', 'Harga Jual', 'Status'];

  let currentY = doc.y + 6;

  function renderTableHeader(y) {
    doc.rect(startX, y, 515, 18).fill('#1e293b');
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8);

    let x = startX;
    doc.text(colHeaders[0], x + 4, y + 5, { width: colWidths[0] - 6, align: 'left' }); x += colWidths[0];
    doc.text(colHeaders[1], x + 4, y + 5, { width: colWidths[1] - 6, align: 'left' }); x += colWidths[1];
    doc.text(colHeaders[2], x + 4, y + 5, { width: colWidths[2] - 6, align: 'left' }); x += colWidths[2];
    doc.text(colHeaders[3], x + 2, y + 5, { width: colWidths[3] - 4, align: 'right' }); x += colWidths[3];
    doc.text(colHeaders[4], x + 2, y + 5, { width: colWidths[4] - 4, align: 'right' }); x += colWidths[4];
    doc.text(colHeaders[5], x + 2, y + 5, { width: colWidths[5] - 4, align: 'right' }); x += colWidths[5];
    doc.text(colHeaders[6], x + 2, y + 5, { width: colWidths[6] - 4, align: 'center' });
    return y + 18;
  }

  currentY = renderTableHeader(currentY);

  items.forEach((item, index) => {
    // Check page break
    if (currentY > 760) {
      doc.addPage();
      drawHeader(doc, tenant, title, subtitle);
      currentY = renderTableHeader(doc.y + 6);
    }

    const rowBg = index % 2 === 0 ? '#f8fafc' : '#ffffff';
    doc.rect(startX, currentY, 515, 16).fill(rowBg);

    doc.fillColor('#334155').font('Helvetica').fontSize(7.5);

    let statusText = 'Aman';
    let statusColor = '#16a34a';
    if (item.stock === 0) {
      statusText = 'Habis';
      statusColor = '#dc2626';
    } else if (item.stock <= (item.min_stock || 0)) {
      statusText = 'Menipis';
      statusColor = '#d97706';
    }

    let x = startX;
    doc.fillColor('#0f172a').font('Helvetica-Bold').text(item.sku || '-', x + 4, currentY + 4, { width: colWidths[0] - 6, ellipsis: true });
    x += colWidths[0];

    doc.fillColor('#1e293b').font('Helvetica').text(item.name || '-', x + 4, currentY + 4, { width: colWidths[1] - 6, ellipsis: true });
    x += colWidths[1];

    doc.fillColor('#475569').text(item.category || '-', x + 4, currentY + 4, { width: colWidths[2] - 6, ellipsis: true });
    x += colWidths[2];

    const stockStr = `${item.stock} ${item.unit || 'pcs'}`;
    doc.fillColor('#0f172a').font('Helvetica-Bold').text(stockStr, x + 2, currentY + 4, { width: colWidths[3] - 4, align: 'right' });
    x += colWidths[3];

    doc.fillColor('#334155').font('Helvetica').text(formatRupiah(item.buy_price), x + 2, currentY + 4, { width: colWidths[4] - 4, align: 'right' });
    x += colWidths[4];

    doc.fillColor('#0f172a').font('Helvetica-Bold').text(formatRupiah(item.sell_price), x + 2, currentY + 4, { width: colWidths[5] - 4, align: 'right' });
    x += colWidths[5];

    doc.fillColor(statusColor).font('Helvetica-Bold').text(statusText, x + 2, currentY + 4, { width: colWidths[6] - 4, align: 'center' });

    currentY += 16;
  });

  // Footer summary
  if (currentY > 740) {
    doc.addPage();
    currentY = 50;
  }
  doc.rect(startX, currentY + 4, 515, 1).fill('#cbd5e1');

  doc.end();
  return bufferPromise;
}

/**
 * Generate Critical Low-Stock PDF report
 */
export async function generateLowStockPdf(tenant, items = []) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const bufferPromise = streamToBuffer(doc);

  const title = 'LAPORAN STOK KRITIS / PERLU SEGERA RESTOCK';
  const subtitle = `Daftar suku cadang yang stoknya berada di bawah ambang minimum (${items.length} item)`;

  drawHeader(doc, tenant, title, subtitle);

  const startX = 40;
  const colWidths = [75, 165, 75, 50, 50, 100]; // Total = 515
  const colHeaders = ['SKU', 'Nama Sparepart', 'Kategori', 'Stok Saat Ini', 'Min Stok', 'Supplier Rekomendasi'];

  let currentY = doc.y + 6;

  function renderTableHeader(y) {
    doc.rect(startX, y, 515, 18).fill('#b91c1c'); // Crimson red for critical warning
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8);

    let x = startX;
    doc.text(colHeaders[0], x + 4, y + 5, { width: colWidths[0] - 6 }); x += colWidths[0];
    doc.text(colHeaders[1], x + 4, y + 5, { width: colWidths[1] - 6 }); x += colWidths[1];
    doc.text(colHeaders[2], x + 4, y + 5, { width: colWidths[2] - 6 }); x += colWidths[2];
    doc.text(colHeaders[3], x + 2, y + 5, { width: colWidths[3] - 4, align: 'right' }); x += colWidths[3];
    doc.text(colHeaders[4], x + 2, y + 5, { width: colWidths[4] - 4, align: 'right' }); x += colWidths[4];
    doc.text(colHeaders[5], x + 4, y + 5, { width: colWidths[5] - 6 });
    return y + 18;
  }

  currentY = renderTableHeader(currentY);

  if (items.length === 0) {
    doc.rect(startX, currentY, 515, 25).fill('#f0fdf4');
    doc.fillColor('#166534').font('Helvetica-Bold').fontSize(9)
       .text('Alhamdulillah, semua stok sparepart saat ini aman di atas batas minimum.', startX + 10, currentY + 8, { align: 'center', width: 495 });
    currentY += 25;
  } else {
    items.forEach((item, index) => {
      if (currentY > 760) {
        doc.addPage();
        drawHeader(doc, tenant, title, subtitle);
        currentY = renderTableHeader(doc.y + 6);
      }

      const rowBg = index % 2 === 0 ? '#fef2f2' : '#ffffff';
      doc.rect(startX, currentY, 515, 17).fill(rowBg);

      let x = startX;
      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(7.5).text(item.sku || '-', x + 4, currentY + 4, { width: colWidths[0] - 6 });
      x += colWidths[0];

      doc.fillColor('#1e293b').font('Helvetica').fontSize(7.5).text(item.name || '-', x + 4, currentY + 4, { width: colWidths[1] - 6 });
      x += colWidths[1];

      doc.fillColor('#475569').text(item.category || '-', x + 4, currentY + 4, { width: colWidths[2] - 6 });
      x += colWidths[2];

      const isZero = item.stock === 0;
      doc.fillColor(isZero ? '#dc2626' : '#d97706').font('Helvetica-Bold').text(`${item.stock} ${item.unit || 'pcs'}`, x + 2, currentY + 4, { width: colWidths[3] - 4, align: 'right' });
      x += colWidths[3];

      doc.fillColor('#64748b').font('Helvetica').text(`${item.min_stock || 0} ${item.unit || 'pcs'}`, x + 2, currentY + 4, { width: colWidths[4] - 4, align: 'right' });
      x += colWidths[4];

      doc.fillColor('#334155').font('Helvetica').text(item.supplier || 'Belum ada supplier', x + 4, currentY + 4, { width: colWidths[5] - 6 });

      currentY += 17;
    });
  }

  doc.end();
  return bufferPromise;
}

/**
 * Generate Inventory Valuation PDF report
 */
export async function generateValuationPdf(tenant, valuation, items = []) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const bufferPromise = streamToBuffer(doc);

  const title = 'LAPORAN VALUASI NILAI INVENTARIS BENGKEL';
  const subtitle = `Ringkasan Total Modal Pembelian & Potensi Keuntungan Penjualan`;

  drawHeader(doc, tenant, title, subtitle);

  const startX = 40;
  let currentY = doc.y + 8;

  // KPI Boxes
  const boxWidth = 122;
  const boxHeight = 44;
  const kpis = [
    { label: 'Total Item SKU', val: `${valuation.total_items || valuation.totalItems || 0} Item`, color: '#0284c7' },
    { label: 'Total Modal Beli', val: formatRupiah(valuation.total_buy_value || valuation.totalBuyValue || 0), color: '#475569' },
    { label: 'Total Nilai Jual', val: formatRupiah(valuation.total_sell_value || valuation.totalSellValue || 0), color: '#059669' },
    { label: 'Potensi Laba Kotor', val: formatRupiah(valuation.potential_gross_profit || valuation.potentialGrossProfit || 0), color: '#16a34a' }
  ];

  kpis.forEach((kpi, idx) => {
    const bx = startX + (idx * (boxWidth + 9));
    doc.rect(bx, currentY, boxWidth, boxHeight).fill('#f8fafc').strokeColor('#cbd5e1').stroke();
    doc.fillColor('#64748b').font('Helvetica').fontSize(7.5).text(kpi.label, bx + 6, currentY + 8);
    doc.fillColor(kpi.color).font('Helvetica-Bold').fontSize(9.5).text(kpi.val, bx + 6, currentY + 22, { width: boxWidth - 12 });
  });

  currentY += boxHeight + 14;

  // Section: Breakdown Table
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10).text('Rincian Valuasi per Item Sparepart', startX, currentY);
  currentY += 14;

  const colWidths = [70, 155, 60, 45, 60, 60, 65]; // Total = 515
  const colHeaders = ['SKU', 'Nama Sparepart', 'Kategori', 'Stok', 'Total Beli', 'Total Jual', 'Potensi Margin'];

  function renderTableHeader(y) {
    doc.rect(startX, y, 515, 18).fill('#334155');
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8);

    let x = startX;
    doc.text(colHeaders[0], x + 4, y + 5, { width: colWidths[0] - 6 }); x += colWidths[0];
    doc.text(colHeaders[1], x + 4, y + 5, { width: colWidths[1] - 6 }); x += colWidths[1];
    doc.text(colHeaders[2], x + 4, y + 5, { width: colWidths[2] - 6 }); x += colWidths[2];
    doc.text(colHeaders[3], x + 2, y + 5, { width: colWidths[3] - 4, align: 'right' }); x += colWidths[3];
    doc.text(colHeaders[4], x + 2, y + 5, { width: colWidths[4] - 4, align: 'right' }); x += colWidths[4];
    doc.text(colHeaders[5], x + 2, y + 5, { width: colWidths[5] - 4, align: 'right' }); x += colWidths[5];
    doc.text(colHeaders[6], x + 2, y + 5, { width: colWidths[6] - 4, align: 'right' });
    return y + 18;
  }

  currentY = renderTableHeader(currentY);

  items.forEach((item, index) => {
    if (currentY > 760) {
      doc.addPage();
      drawHeader(doc, tenant, title, subtitle);
      currentY = renderTableHeader(doc.y + 6);
    }

    const rowBg = index % 2 === 0 ? '#f8fafc' : '#ffffff';
    doc.rect(startX, currentY, 515, 16).fill(rowBg);

    const totalBuy = (item.stock || 0) * (item.buy_price || 0);
    const totalSell = (item.stock || 0) * (item.sell_price || 0);
    const profit = totalSell - totalBuy;

    let x = startX;
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(7.5).text(item.sku || '-', x + 4, currentY + 4, { width: colWidths[0] - 6 });
    x += colWidths[0];

    doc.fillColor('#1e293b').font('Helvetica').fontSize(7.5).text(item.name || '-', x + 4, currentY + 4, { width: colWidths[1] - 6 });
    x += colWidths[1];

    doc.fillColor('#475569').text(item.category || '-', x + 4, currentY + 4, { width: colWidths[2] - 6 });
    x += colWidths[2];

    doc.fillColor('#0f172a').font('Helvetica-Bold').text(`${item.stock}`, x + 2, currentY + 4, { width: colWidths[3] - 4, align: 'right' });
    x += colWidths[3];

    doc.fillColor('#475569').font('Helvetica').text(formatRupiah(totalBuy), x + 2, currentY + 4, { width: colWidths[4] - 4, align: 'right' });
    x += colWidths[4];

    doc.fillColor('#0f172a').font('Helvetica-Bold').text(formatRupiah(totalSell), x + 2, currentY + 4, { width: colWidths[5] - 4, align: 'right' });
    x += colWidths[5];

    doc.fillColor(profit >= 0 ? '#16a34a' : '#dc2626').font('Helvetica-Bold').text(formatRupiah(profit), x + 2, currentY + 4, { width: colWidths[6] - 4, align: 'right' });

    currentY += 16;
  });

  doc.end();
  return bufferPromise;
}

/**
 * Generate Stock Movements PDF report
 */
export async function generateStockMovementsPdf(tenant, movements = [], filterInfo = {}) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const bufferPromise = streamToBuffer(doc);

  const title = 'LAPORAN RIWAYAT MUTASI STOK SPAREPART';
  const subtitle = `Total: ${movements.length} transaksi mutasi | Filter: ${filterInfo.type || 'Semua Tipe'}`;

  drawHeader(doc, tenant, title, subtitle);

  const startX = 40;
  const colWidths = [60, 50, 70, 145, 45, 75, 70]; // Total = 515
  const colHeaders = ['Tanggal', 'Tipe', 'SKU', 'Nama Sparepart', 'Jumlah', 'No. Faktur/RO', 'Catatan'];

  let currentY = doc.y + 6;

  function renderTableHeader(y) {
    doc.rect(startX, y, 515, 18).fill('#0f172a');
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8);

    let x = startX;
    doc.text(colHeaders[0], x + 4, y + 5, { width: colWidths[0] - 6 }); x += colWidths[0];
    doc.text(colHeaders[1], x + 4, y + 5, { width: colWidths[1] - 6 }); x += colWidths[1];
    doc.text(colHeaders[2], x + 4, y + 5, { width: colWidths[2] - 6 }); x += colWidths[2];
    doc.text(colHeaders[3], x + 4, y + 5, { width: colWidths[3] - 6 }); x += colWidths[3];
    doc.text(colHeaders[4], x + 2, y + 5, { width: colWidths[4] - 4, align: 'right' }); x += colWidths[4];
    doc.text(colHeaders[5], x + 4, y + 5, { width: colWidths[5] - 6 }); x += colWidths[5];
    doc.text(colHeaders[6], x + 4, y + 5, { width: colWidths[6] - 6 });
    return y + 18;
  }

  currentY = renderTableHeader(currentY);

  movements.forEach((m, index) => {
    if (currentY > 760) {
      doc.addPage();
      drawHeader(doc, tenant, title, subtitle);
      currentY = renderTableHeader(doc.y + 6);
    }

    const rowBg = index % 2 === 0 ? '#f8fafc' : '#ffffff';
    doc.rect(startX, currentY, 515, 16).fill(rowBg);

    let typeColor = '#0284c7';
    let typeLabel = m.type;
    let qtySign = '';
    if (m.type === 'IN') {
      typeColor = '#16a34a';
      typeLabel = 'MASUK';
      qtySign = '+';
    } else if (m.type === 'OUT') {
      typeColor = '#dc2626';
      typeLabel = 'KELUAR';
      qtySign = '-';
    } else {
      typeColor = '#475569';
      typeLabel = 'OPNAME';
      qtySign = m.quantity > 0 ? '+' : '';
    }

    let x = startX;
    doc.fillColor('#475569').font('Helvetica').fontSize(7.5).text(formatDateIndo(m.date), x + 4, currentY + 4, { width: colWidths[0] - 6 });
    x += colWidths[0];

    doc.fillColor(typeColor).font('Helvetica-Bold').fontSize(7.5).text(typeLabel, x + 4, currentY + 4, { width: colWidths[1] - 6 });
    x += colWidths[1];

    doc.fillColor('#0f172a').font('Helvetica-Bold').text(m.sparepart_sku || m.sku || '-', x + 4, currentY + 4, { width: colWidths[2] - 6 });
    x += colWidths[2];

    doc.fillColor('#1e293b').font('Helvetica').text(m.sparepart_name || m.name || '-', x + 4, currentY + 4, { width: colWidths[3] - 6, ellipsis: true });
    x += colWidths[3];

    doc.fillColor(typeColor).font('Helvetica-Bold').text(`${qtySign}${m.quantity}`, x + 2, currentY + 4, { width: colWidths[4] - 4, align: 'right' });
    x += colWidths[4];

    const ref = m.invoice_number || m.repair_order_id || '-';
    doc.fillColor('#64748b').font('Helvetica').text(ref, x + 4, currentY + 4, { width: colWidths[5] - 6, ellipsis: true });
    x += colWidths[5];

    doc.fillColor('#64748b').text(m.notes || '-', x + 4, currentY + 4, { width: colWidths[6] - 6, ellipsis: true });

    currentY += 16;
  });

  doc.end();
  return bufferPromise;
}

/**
 * Generate Profit & Loss (P&L) PDF report (R4, F29)
 */
export async function generatePnlPdf(tenant, reportData = {}) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const bufferPromise = streamToBuffer(doc);

  const periodStr = reportData.periodLabel || reportData.period || 'Semua Periode';
  const subtitle = `Periode: ${periodStr} | Mata Uang: Indonesian Rupiah (IDR)`;
  drawHeader(doc, tenant, 'LAPORAN LABA RUGI OPERASIONAL (PROFIT & LOSS STATEMENT)', subtitle);

  const startX = 40;
  let currentY = doc.y + 6;

  const totalIncome = Number(reportData.total_income ?? reportData.totalIncome ?? 0);
  const totalExpense = Number(reportData.total_expense ?? reportData.totalExpense ?? 0);
  const netBalance = Number(reportData.net_balance ?? reportData.netBalance ?? (totalIncome - totalExpense));
  const marginPercent = totalIncome > 0 ? ((netBalance / totalIncome) * 100) : 0;

  // Executive KPI Cards (4-column grid)
  const boxWidth = 122;
  const boxHeight = 44;
  const kpis = [
    { label: 'Total Pendapatan', val: formatRupiah(totalIncome), color: '#16a34a' },
    { label: 'Total Beban Operasional', val: formatRupiah(totalExpense), color: '#dc2626' },
    { label: netBalance >= 0 ? 'Laba Bersih' : 'Rugi Bersih', val: formatRupiah(netBalance), color: netBalance >= 0 ? '#0284c7' : '#dc2626' },
    { label: 'Margin Laba Bersih', val: `${marginPercent >= 0 ? '+' : ''}${marginPercent.toFixed(1)}%`, color: marginPercent >= 0 ? '#0284c7' : '#dc2626' }
  ];

  kpis.forEach((kpi, idx) => {
    const bx = startX + (idx * (boxWidth + 9));
    doc.rect(bx, currentY, boxWidth, boxHeight).fill('#f8fafc').strokeColor('#cbd5e1').stroke();
    doc.fillColor('#64748b').font('Helvetica').fontSize(7.5).text(kpi.label, bx + 6, currentY + 8);
    doc.fillColor(kpi.color).font('Helvetica-Bold').fontSize(9.5).text(kpi.val, bx + 6, currentY + 22, { width: boxWidth - 12 });
  });

  currentY += boxHeight + 14;

  // Helper for rendering category table
  function renderCategorySection(sectionTitle, categories = [], sectionTotal, titleColor = '#0f172a', headerBg = '#334155') {
    if (currentY > 680) {
      doc.addPage();
      drawHeader(doc, tenant, 'LAPORAN LABA RUGI OPERASIONAL (PROFIT & LOSS STATEMENT)', subtitle);
      currentY = doc.y + 6;
    }

    doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(10).text(sectionTitle, startX, currentY);
    currentY += 14;

    const colWidths = [230, 85, 110, 90]; // total 515
    doc.rect(startX, currentY, 515, 18).fill(headerBg);
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8);
    doc.text('Kategori', startX + 6, currentY + 5, { width: colWidths[0] - 10 });
    doc.text('Jumlah Transaksi', startX + colWidths[0] + 4, currentY + 5, { width: colWidths[1] - 8, align: 'right' });
    doc.text('Nominal (Rp)', startX + colWidths[0] + colWidths[1] + 4, currentY + 5, { width: colWidths[2] - 8, align: 'right' });
    doc.text('% Kontribusi', startX + colWidths[0] + colWidths[1] + colWidths[2] + 4, currentY + 5, { width: colWidths[3] - 8, align: 'right' });
    currentY += 18;

    if (categories.length === 0) {
      doc.rect(startX, currentY, 515, 16).fill('#f8fafc');
      doc.fillColor('#94a3b8').font('Helvetica-Oblique').fontSize(8).text('Tidak ada data transaksi pada periode ini', startX + 6, currentY + 4, { align: 'center', width: 503 });
      currentY += 16;
    } else {
      categories.forEach((c, idx) => {
        if (currentY > 740) {
          doc.addPage();
          drawHeader(doc, tenant, 'LAPORAN LABA RUGI OPERASIONAL (PROFIT & LOSS STATEMENT)', subtitle);
          currentY = doc.y + 6;
        }
        const rowBg = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
        doc.rect(startX, currentY, 515, 16).fill(rowBg);

        const catName = c.name || c.kategori || '-';
        const count = c.count || c.jumlah || 1;
        const total = Number(c.total || c.nominal || 0);
        const percent = sectionTotal > 0 ? ((total / sectionTotal) * 100).toFixed(1) : '0.0';

        doc.fillColor('#1e293b').font('Helvetica-Bold').fontSize(8).text(catName, startX + 6, currentY + 4, { width: colWidths[0] - 10, ellipsis: true });
        doc.fillColor('#475569').font('Helvetica').fontSize(8).text(`${count} trx`, startX + colWidths[0] + 4, currentY + 4, { width: colWidths[1] - 8, align: 'right' });
        doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8).text(formatRupiah(total), startX + colWidths[0] + colWidths[1] + 4, currentY + 4, { width: colWidths[2] - 8, align: 'right' });
        doc.fillColor('#475569').font('Helvetica').fontSize(8).text(`${percent}%`, startX + colWidths[0] + colWidths[1] + colWidths[2] + 4, currentY + 4, { width: colWidths[3] - 8, align: 'right' });
        currentY += 16;
      });
    }

    // Subtotal Row
    doc.rect(startX, currentY, 515, 18).fill('#e2e8f0');
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8.5);
    doc.text(`Subtotal ${sectionTitle}`, startX + 6, currentY + 5, { width: colWidths[0] + colWidths[1] - 10 });
    doc.text(formatRupiah(sectionTotal), startX + colWidths[0] + colWidths[1] + 4, currentY + 5, { width: colWidths[2] - 8, align: 'right' });
    doc.text('100.0%', startX + colWidths[0] + colWidths[1] + colWidths[2] + 4, currentY + 5, { width: colWidths[3] - 8, align: 'right' });
    currentY += 26;
  }

  // 1. Income Breakdown
  const incomeCats = reportData.incomeCategories || reportData.category_breakdown?.income || [];
  renderCategorySection('1. Rincian Pendapatan Operasional', incomeCats, totalIncome, '#15803d', '#166534');

  // 2. Expense Breakdown
  const expenseCats = reportData.expenseCategories || reportData.category_breakdown?.expense || [];
  renderCategorySection('2. Rincian Beban Operasional', expenseCats, totalExpense, '#b91c1c', '#991b1b');

  // 3. Payment Methods Distribution
  if (currentY > 660) {
    doc.addPage();
    drawHeader(doc, tenant, 'LAPORAN LABA RUGI OPERASIONAL (PROFIT & LOSS STATEMENT)', subtitle);
    currentY = doc.y + 6;
  }

  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10).text('3. Distribusi Metode Pembayaran', startX, currentY);
  currentY += 14;

  const pmWidths = [155, 120, 120, 120];
  doc.rect(startX, currentY, 515, 18).fill('#475569');
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8);
  doc.text('Metode Pembayaran', startX + 6, currentY + 5, { width: pmWidths[0] - 10 });
  doc.text('Pemasukan (Rp)', startX + pmWidths[0] + 4, currentY + 5, { width: pmWidths[1] - 8, align: 'right' });
  doc.text('Pengeluaran (Rp)', startX + pmWidths[0] + pmWidths[1] + 4, currentY + 5, { width: pmWidths[2] - 8, align: 'right' });
  doc.text('Saldo Kas (Rp)', startX + pmWidths[0] + pmWidths[1] + pmWidths[2] + 4, currentY + 5, { width: pmWidths[3] - 8, align: 'right' });
  currentY += 18;

  const pms = reportData.payment_methods || reportData.paymentMethods || {
    CASH: { income: 0, expense: 0, total: 0 },
    TRANSFER: { income: 0, expense: 0, total: 0 },
    QRIS: { income: 0, expense: 0, total: 0 }
  };

  const pmLabels = {
    CASH: 'Uang Tunai (CASH - Laci Kasir)',
    TRANSFER: 'Transfer Bank (Rekening Bengkel)',
    QRIS: 'QRIS (Settlement Digital)'
  };

  ['CASH', 'TRANSFER', 'QRIS'].forEach((k, idx) => {
    const rowBg = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
    doc.rect(startX, currentY, 515, 16).fill(rowBg);
    const item = pms[k] || { income: 0, expense: 0, total: 0 };
    const inc = Number(item.income || 0);
    const exp = Number(item.expense || 0);
    const net = inc - exp;

    doc.fillColor('#1e293b').font('Helvetica-Bold').fontSize(8).text(pmLabels[k] || k, startX + 6, currentY + 4, { width: pmWidths[0] - 10 });
    doc.fillColor('#16a34a').font('Helvetica').fontSize(8).text(formatRupiah(inc), startX + pmWidths[0] + 4, currentY + 4, { width: pmWidths[1] - 8, align: 'right' });
    doc.fillColor('#dc2626').font('Helvetica').fontSize(8).text(formatRupiah(exp), startX + pmWidths[0] + pmWidths[1] + 4, currentY + 4, { width: pmWidths[2] - 8, align: 'right' });
    doc.fillColor(net >= 0 ? '#0284c7' : '#dc2626').font('Helvetica-Bold').fontSize(8).text(formatRupiah(net), startX + pmWidths[0] + pmWidths[1] + pmWidths[2] + 4, currentY + 4, { width: pmWidths[3] - 8, align: 'right' });
    currentY += 16;
  });

  currentY += 20;

  // Signatures Section
  if (currentY > 680) {
    doc.addPage();
    drawHeader(doc, tenant, 'LAPORAN LABA RUGI OPERASIONAL (PROFIT & LOSS STATEMENT)', subtitle);
    currentY = doc.y + 10;
  }

  const signY = currentY;
  doc.fillColor('#475569').font('Helvetica').fontSize(8).text('Dibuat oleh (Kasir / Admin Keuangan):', startX + 20, signY);
  doc.rect(startX + 20, signY + 14, 180, 45).strokeColor('#cbd5e1').stroke();
  doc.fillColor('#94a3b8').fontSize(7).text('(Tanda tangan & Nama Terang)', startX + 20, signY + 45, { width: 180, align: 'center' });

  doc.fillColor('#475569').font('Helvetica').fontSize(8).text('Diketahui & Disetujui oleh:', startX + 315, signY);
  doc.rect(startX + 315, signY + 14, 180, 45).strokeColor('#cbd5e1').stroke();
  doc.fillColor('#94a3b8').fontSize(7).text('(Pemilik Bengkel / Workshop Manager)', startX + 315, signY + 45, { width: 180, align: 'center' });

  doc.end();
  return bufferPromise;
}

/**
 * Generate Daily Cashbook Recap PDF (R4, F30)
 */
export async function generateDailyRecapPdf(tenant, recapData = {}) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const bufferPromise = streamToBuffer(doc);

  const dateStr = recapData.date || new Date().toISOString().split('T')[0];
  const dateFormatted = formatDateIndo(dateStr);
  const subtitle = `Tanggal: ${dateFormatted} | Total Transaksi: ${(recapData.transactions || []).length}`;

  drawHeader(doc, tenant, 'REKAPITULASI ARUS KAS HARIAN (DAILY CASH RECAP)', subtitle);

  const startX = 40;
  let currentY = doc.y + 6;

  const totalIncome = Number(recapData.total_income ?? recapData.totalIncome ?? 0);
  const totalExpense = Number(recapData.total_expense ?? recapData.totalExpense ?? 0);
  const netBalance = Number(recapData.net_balance ?? recapData.netBalance ?? (totalIncome - totalExpense));

  // 3 KPI Boxes
  const boxWidth = 165;
  const boxHeight = 44;
  const kpis = [
    { label: 'Total Kas Masuk', val: formatRupiah(totalIncome), color: '#16a34a' },
    { label: 'Total Kas Keluar', val: formatRupiah(totalExpense), color: '#dc2626' },
    { label: netBalance >= 0 ? 'Surplus Kas Harian' : 'Defisit Kas Harian', val: formatRupiah(netBalance), color: netBalance >= 0 ? '#0284c7' : '#dc2626' }
  ];

  kpis.forEach((kpi, idx) => {
    const bx = startX + (idx * (boxWidth + 10));
    doc.rect(bx, currentY, boxWidth, boxHeight).fill('#f8fafc').strokeColor('#cbd5e1').stroke();
    doc.fillColor('#64748b').font('Helvetica').fontSize(7.5).text(kpi.label, bx + 8, currentY + 8);
    doc.fillColor(kpi.color).font('Helvetica-Bold').fontSize(10).text(kpi.val, bx + 8, currentY + 22, { width: boxWidth - 16 });
  });

  currentY += boxHeight + 14;

  // Transactions list
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10).text('Rincian Transaksi Kas', startX, currentY);
  currentY += 14;

  const colWidths = [50, 55, 95, 175, 55, 85]; // total 515
  const colHeaders = ['Waktu', 'Tipe', 'Kategori', 'Deskripsi', 'Metode', 'Nominal (Rp)'];

  function renderTableHeader(y) {
    doc.rect(startX, y, 515, 18).fill('#0f172a');
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8);
    let x = startX;
    doc.text(colHeaders[0], x + 4, y + 5, { width: colWidths[0] - 6 }); x += colWidths[0];
    doc.text(colHeaders[1], x + 4, y + 5, { width: colWidths[1] - 6 }); x += colWidths[1];
    doc.text(colHeaders[2], x + 4, y + 5, { width: colWidths[2] - 6 }); x += colWidths[2];
    doc.text(colHeaders[3], x + 4, y + 5, { width: colWidths[3] - 6 }); x += colWidths[3];
    doc.text(colHeaders[4], x + 4, y + 5, { width: colWidths[4] - 6 }); x += colWidths[4];
    doc.text(colHeaders[5], x + 2, y + 5, { width: colWidths[5] - 4, align: 'right' });
    return y + 18;
  }

  currentY = renderTableHeader(currentY);

  const transactions = recapData.transactions || [];
  if (transactions.length === 0) {
    doc.rect(startX, currentY, 515, 16).fill('#f8fafc');
    doc.fillColor('#94a3b8').font('Helvetica-Oblique').fontSize(8).text('Tidak ada transaksi yang tercatat pada hari ini', startX + 6, currentY + 4, { align: 'center', width: 503 });
    currentY += 16;
  } else {
    transactions.forEach((t, idx) => {
      if (currentY > 740) {
        doc.addPage();
        drawHeader(doc, tenant, 'REKAPITULASI ARUS KAS HARIAN (DAILY CASH RECAP)', subtitle);
        currentY = renderTableHeader(doc.y + 6);
      }

      const rowBg = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
      doc.rect(startX, currentY, 515, 16).fill(rowBg);

      const isIncome = (t.type === 'INCOME' || t.tipe === 'INCOME');
      const typeLabel = isIncome ? 'MASUK' : 'KELUAR';
      const typeColor = isIncome ? '#16a34a' : '#dc2626';
      const amount = Number(t.amount || t.nominal || 0);

      let x = startX;
      const timeStr = t.time || (t.created_at ? new Date(t.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-');
      doc.fillColor('#64748b').font('Helvetica').fontSize(7.5).text(timeStr, x + 4, currentY + 4, { width: colWidths[0] - 6 });
      x += colWidths[0];

      doc.fillColor(typeColor).font('Helvetica-Bold').fontSize(7.5).text(typeLabel, x + 4, currentY + 4, { width: colWidths[1] - 6 });
      x += colWidths[1];

      doc.fillColor('#1e293b').font('Helvetica-Bold').text(t.category_name || t.kategori || '-', x + 4, currentY + 4, { width: colWidths[2] - 6, ellipsis: true });
      x += colWidths[2];

      doc.fillColor('#334155').font('Helvetica').text(t.description || t.deskripsi || '-', x + 4, currentY + 4, { width: colWidths[3] - 6, ellipsis: true });
      x += colWidths[3];

      doc.fillColor('#475569').text(t.payment_method || t.metodePembayaran || 'CASH', x + 4, currentY + 4, { width: colWidths[4] - 6 });
      x += colWidths[4];

      doc.fillColor(typeColor).font('Helvetica-Bold').text(formatRupiah(amount), x + 2, currentY + 4, { width: colWidths[5] - 4, align: 'right' });

      currentY += 16;
    });
  }

  currentY += 24;

  // Closing Signatures
  if (currentY > 700) {
    doc.addPage();
    drawHeader(doc, tenant, 'REKAPITULASI ARUS KAS HARIAN (DAILY CASH RECAP)', subtitle);
    currentY = doc.y + 10;
  }

  const signY = currentY;
  doc.fillColor('#475569').font('Helvetica').fontSize(8).text('Petugas Kasir Harian:', startX + 20, signY);
  doc.rect(startX + 20, signY + 14, 180, 45).strokeColor('#cbd5e1').stroke();
  doc.fillColor('#94a3b8').fontSize(7).text('(Tanda tangan & Paraf Uang Kas)', startX + 20, signY + 45, { width: 180, align: 'center' });

  doc.fillColor('#475569').font('Helvetica').fontSize(8).text('Verifikasi / Penanggung Jawab:', startX + 315, signY);
  doc.rect(startX + 315, signY + 14, 180, 45).strokeColor('#cbd5e1').stroke();
  doc.fillColor('#94a3b8').fontSize(7).text('(Owner / Kepala Bengkel)', startX + 315, signY + 45, { width: 180, align: 'center' });

  doc.end();
  return bufferPromise;
}

/**
 * Generate Category Breakdown PDF (R4, F31)
 */
export async function generateCategoryBreakdownPdf(tenant, breakdownData = {}) {
  return generatePnlPdf(tenant, breakdownData);
}

/**
 * Generate Repair Order Invoice / Nota Servis PDF (R5, F37)
 */
export async function generateInvoicePdf(tenant, ro = {}, spareparts = [], options = {}) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const bufferPromise = streamToBuffer(doc);

  const title = 'NOTA / INVOICE REPAIR ORDER';
  const subtitle = `No. Order: ${ro.ro_number || '-'} | Tanggal: ${formatDateIndo(ro.entry_date)}`;

  drawHeader(doc, tenant, title, subtitle);

  const startX = 40;
  let currentY = doc.y + 6;

  // 1. Customer & Vehicle Info Box (2-column layout)
  const infoBoxWidth = 515;
  const infoBoxHeight = 80;
  doc.rect(startX, currentY, infoBoxWidth, infoBoxHeight)
     .fill('#f8fafc')
     .strokeColor('#cbd5e1')
     .lineWidth(1)
     .stroke();

  const col1X = startX + 12;
  const col2X = startX + 265;
  let infoY = currentY + 10;

  // Column 1: Kendaraan
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8.5).text('INFORMASI KENDARAAN', col1X, infoY);
  infoY += 13;

  doc.fillColor('#475569').font('Helvetica').fontSize(8).text('No. Polisi:', col1X, infoY);
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9).text(ro.plate_number || ro.platNomor || '-', col1X + 65, infoY);
  infoY += 13;

  const vehicleDesc = `${ro.car_brand || ''} ${ro.car_model || ''} ${ro.car_year ? `(${ro.car_year})` : ''} ${ro.car_color ? `- ${ro.car_color}` : ''}`.trim() || '-';
  doc.fillColor('#475569').font('Helvetica').fontSize(8).text('Kendaraan:', col1X, infoY);
  doc.fillColor('#1e293b').font('Helvetica').fontSize(8).text(vehicleDesc, col1X + 65, infoY, { width: 175, ellipsis: true });
  infoY += 13;

  const odometerStr = ro.odometer_in ? `${Number(ro.odometer_in).toLocaleString('id-ID')} km` : '-';
  doc.fillColor('#475569').font('Helvetica').fontSize(8).text('Odometer:', col1X, infoY);
  doc.fillColor('#1e293b').font('Helvetica').fontSize(8).text(odometerStr, col1X + 65, infoY);
  infoY += 13;

  doc.fillColor('#475569').font('Helvetica').fontSize(8).text('Keluhan:', col1X, infoY);
  doc.fillColor('#1e293b').font('Helvetica-Oblique').fontSize(8).text(ro.complaint || ro.keluhan || '-', col1X + 65, infoY, { width: 175, ellipsis: true });

  // Column 2: Pelanggan & Order
  let infoY2 = currentY + 10;
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8.5).text('DATA PELANGGAN & ORDER', col2X, infoY2);
  infoY2 += 13;

  doc.fillColor('#475569').font('Helvetica').fontSize(8).text('Nama Pemilik:', col2X, infoY2);
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8.5).text(ro.customer_name || ro.namaPemilik || '-', col2X + 75, infoY2, { width: 165, ellipsis: true });
  infoY2 += 13;

  doc.fillColor('#475569').font('Helvetica').fontSize(8).text('No. Telp / WA:', col2X, infoY2);
  doc.fillColor('#1e293b').font('Helvetica').fontSize(8).text(ro.customer_phone || ro.noHp || '-', col2X + 75, infoY2);
  infoY2 += 13;

  doc.fillColor('#475569').font('Helvetica').fontSize(8).text('Mekanik PJ:', col2X, infoY2);
  doc.fillColor('#1e293b').font('Helvetica').fontSize(8).text(ro.mechanic_name || ro.mekanikPj || '-', col2X + 75, infoY2);
  infoY2 += 13;

  const isCompleted = ro.status === 'DIAMBIL' || ro.status === 'SELESAI';
  const statusLabel = ro.status === 'DIAMBIL' ? 'LUNAS (SUDAH DIAMBIL)' : (ro.status || 'MASUK');
  doc.fillColor('#475569').font('Helvetica').fontSize(8).text('Status Servis:', col2X, infoY2);
  doc.fillColor(isCompleted ? '#16a34a' : '#0284c7').font('Helvetica-Bold').fontSize(8).text(statusLabel, col2X + 75, infoY2);

  currentY += infoBoxHeight + 14;

  // 2. Table: Rincian Jasa & Pekerjaan
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9.5).text('1. Rincian Jasa & Pekerjaan Bengkel', startX, currentY);
  currentY += 13;

  const jasaColWidths = [30, 365, 120]; // 515
  doc.rect(startX, currentY, 515, 18).fill('#1e293b');
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8);
  doc.text('No', startX + 6, currentY + 5, { width: jasaColWidths[0] - 8, align: 'center' });
  doc.text('Deskripsi Jasa / Pengerjaan', startX + jasaColWidths[0] + 6, currentY + 5, { width: jasaColWidths[1] - 12 });
  doc.text('Biaya Jasa (Rp)', startX + jasaColWidths[0] + jasaColWidths[1] + 4, currentY + 5, { width: jasaColWidths[2] - 8, align: 'right' });
  currentY += 18;

  const serviceFee = Number(ro.service_fee || ro.biayaJasa || 0);
  doc.rect(startX, currentY, 515, 17).fill('#ffffff');
  doc.fillColor('#475569').font('Helvetica').fontSize(8).text('1', startX + 6, currentY + 4, { width: jasaColWidths[0] - 8, align: 'center' });
  doc.fillColor('#1e293b').font('Helvetica').fontSize(8).text(`Jasa Servis, Tune Up & Perbaikan (${ro.complaint || 'Perawatan Berkala'})`, startX + jasaColWidths[0] + 6, currentY + 4, { width: jasaColWidths[1] - 12, ellipsis: true });
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8).text(formatRupiah(serviceFee), startX + jasaColWidths[0] + jasaColWidths[1] + 4, currentY + 4, { width: jasaColWidths[2] - 8, align: 'right' });
  currentY += 17;

  // Subtotal Jasa Row
  doc.rect(startX, currentY, 515, 16).fill('#f1f5f9');
  doc.fillColor('#334155').font('Helvetica-Bold').fontSize(8).text('Subtotal Jasa Servis', startX + 6, currentY + 4, { width: jasaColWidths[0] + jasaColWidths[1] - 10, align: 'right' });
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8).text(formatRupiah(serviceFee), startX + jasaColWidths[0] + jasaColWidths[1] + 4, currentY + 4, { width: jasaColWidths[2] - 8, align: 'right' });
  currentY += 24;

  // 3. Table: Rincian Sparepart & Suku Cadang
  if (currentY > 640) {
    doc.addPage();
    drawHeader(doc, tenant, title, subtitle);
    currentY = doc.y + 6;
  }

  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9.5).text('2. Rincian Suku Cadang & Sparepart', startX, currentY);
  currentY += 13;

  const partColWidths = [30, 245, 55, 95, 90]; // 515
  doc.rect(startX, currentY, 515, 18).fill('#1e293b');
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8);
  doc.text('No', startX + 6, currentY + 5, { width: partColWidths[0] - 8, align: 'center' });
  doc.text('Nama Suku Cadang', startX + partColWidths[0] + 6, currentY + 5, { width: partColWidths[1] - 12 });
  doc.text('Qty', startX + partColWidths[0] + partColWidths[1] + 2, currentY + 5, { width: partColWidths[2] - 4, align: 'center' });
  doc.text('Harga Satuan', startX + partColWidths[0] + partColWidths[1] + partColWidths[2] + 4, currentY + 5, { width: partColWidths[3] - 8, align: 'right' });
  doc.text('Subtotal (Rp)', startX + partColWidths[0] + partColWidths[1] + partColWidths[2] + partColWidths[3] + 4, currentY + 5, { width: partColWidths[4] - 8, align: 'right' });
  currentY += 18;

  let sparepartTotal = 0;
  if (!spareparts || spareparts.length === 0) {
    doc.rect(startX, currentY, 515, 18).fill('#f8fafc');
    doc.fillColor('#94a3b8').font('Helvetica-Oblique').fontSize(8).text('Tidak ada pemakaian suku cadang / sparepart pada pengerjaan ini.', startX + 6, currentY + 5, { width: 503, align: 'center' });
    currentY += 18;
  } else {
    spareparts.forEach((sp, idx) => {
      if (currentY > 740) {
        doc.addPage();
        drawHeader(doc, tenant, title, subtitle);
        currentY = doc.y + 6;
      }
      const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      doc.rect(startX, currentY, 515, 16).fill(rowBg);

      const qty = Number(sp.quantity || sp.qty || 1);
      const unitPrice = Number(sp.unit_price || sp.hargaSatuan || 0);
      const sub = Number(sp.subtotal || (qty * unitPrice));
      sparepartTotal += sub;

      doc.fillColor('#475569').font('Helvetica').fontSize(8).text(String(idx + 1), startX + 6, currentY + 4, { width: partColWidths[0] - 8, align: 'center' });
      doc.fillColor('#1e293b').font('Helvetica-Bold').fontSize(8).text(sp.item_name || sp.nama || '-', startX + partColWidths[0] + 6, currentY + 4, { width: partColWidths[1] - 12, ellipsis: true });
      doc.fillColor('#334155').font('Helvetica').fontSize(8).text(String(qty), startX + partColWidths[0] + partColWidths[1] + 2, currentY + 4, { width: partColWidths[2] - 4, align: 'center' });
      doc.fillColor('#475569').font('Helvetica').fontSize(8).text(formatRupiah(unitPrice), startX + partColWidths[0] + partColWidths[1] + partColWidths[2] + 4, currentY + 4, { width: partColWidths[3] - 8, align: 'right' });
      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8).text(formatRupiah(sub), startX + partColWidths[0] + partColWidths[1] + partColWidths[2] + partColWidths[3] + 4, currentY + 4, { width: partColWidths[4] - 8, align: 'right' });
      currentY += 16;
    });
  }

  // Subtotal Spareparts Row
  const finalSparepartFee = (spareparts && spareparts.length > 0) ? sparepartTotal : Number(ro.sparepart_fee || 0);
  doc.rect(startX, currentY, 515, 16).fill('#f1f5f9');
  doc.fillColor('#334155').font('Helvetica-Bold').fontSize(8).text('Subtotal Suku Cadang', startX + 6, currentY + 4, { width: partColWidths[0] + partColWidths[1] + partColWidths[2] + partColWidths[3] - 10, align: 'right' });
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8).text(formatRupiah(finalSparepartFee), startX + partColWidths[0] + partColWidths[1] + partColWidths[2] + partColWidths[3] + 4, currentY + 4, { width: partColWidths[4] - 8, align: 'right' });
  currentY += 22;

  // 4. Financial Summary & Total Box
  if (currentY > 660) {
    doc.addPage();
    drawHeader(doc, tenant, title, subtitle);
    currentY = doc.y + 6;
  }

  const sumBoxWidth = 240;
  const sumBoxX = startX + 515 - sumBoxWidth;
  const discount = Number(ro.discount || ro.diskon || 0);
  const totalCost = Number(ro.total_cost || ro.totalBiaya || (serviceFee + finalSparepartFee - discount));

  doc.rect(sumBoxX, currentY, sumBoxWidth, 68).fill('#f8fafc').strokeColor('#cbd5e1').stroke();
  let sumY = currentY + 6;

  doc.fillColor('#475569').font('Helvetica').fontSize(8).text('Subtotal Biaya Jasa:', sumBoxX + 10, sumY);
  doc.fillColor('#1e293b').font('Helvetica').fontSize(8).text(formatRupiah(serviceFee), sumBoxX + 110, sumY, { width: 120, align: 'right' });
  sumY += 12;

  doc.fillColor('#475569').font('Helvetica').fontSize(8).text('Subtotal Suku Cadang:', sumBoxX + 10, sumY);
  doc.fillColor('#1e293b').font('Helvetica').fontSize(8).text(formatRupiah(finalSparepartFee), sumBoxX + 110, sumY, { width: 120, align: 'right' });
  sumY += 12;

  if (discount > 0) {
    doc.fillColor('#dc2626').font('Helvetica').fontSize(8).text('Potongan / Diskon:', sumBoxX + 10, sumY);
    doc.fillColor('#dc2626').font('Helvetica-Bold').fontSize(8).text(`-${formatRupiah(discount)}`, sumBoxX + 110, sumY, { width: 120, align: 'right' });
    sumY += 12;
  }

  doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(sumBoxX + 10, sumY + 2).lineTo(sumBoxX + sumBoxWidth - 10, sumY + 2).stroke();
  sumY += 6;

  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10).text('TOTAL TAGIHAN:', sumBoxX + 10, sumY);
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(11).text(formatRupiah(totalCost), sumBoxX + 100, sumY, { width: 130, align: 'right' });

  // Left Note box
  const noteBoxWidth = 250;
  doc.rect(startX, currentY, noteBoxWidth, 68).fill('#f8fafc').strokeColor('#cbd5e1').stroke();
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8).text('CATATAN / KETENTUAN GARANSI:', startX + 10, currentY + 8);
  const footerNote = options.settings?.invoice_footer || 'Garansi servis berkala & pemasangan suku cadang berlaku sesuai nota ini. Simpan nota ini sebagai bukti pengerjaan resmi.';
  doc.fillColor('#475569').font('Helvetica').fontSize(7.5).text(footerNote, startX + 10, currentY + 22, { width: noteBoxWidth - 20 });

  currentY += 80;

  // 5. Signatures Block
  if (currentY > 710) {
    doc.addPage();
    drawHeader(doc, tenant, title, subtitle);
    currentY = doc.y + 10;
  }

  const signY = currentY;
  doc.fillColor('#475569').font('Helvetica').fontSize(8).text('Tanda Terima Pelanggan / Pemilik:', startX + 25, signY);
  doc.rect(startX + 25, signY + 14, 180, 45).strokeColor('#cbd5e1').stroke();
  doc.fillColor('#94a3b8').fontSize(7).text(`( ${ro.customer_name || ro.namaPemilik || 'Tanda Tangan Pelanggan'} )`, startX + 25, signY + 46, { width: 180, align: 'center' });

  doc.fillColor('#475569').font('Helvetica').fontSize(8).text('Hormat Kami, Bengkel GPS Motor Kediri:', startX + 310, signY);
  doc.rect(startX + 310, signY + 14, 180, 45).strokeColor('#cbd5e1').stroke();
  doc.fillColor('#94a3b8').fontSize(7).text(`( ${ro.mechanic_name || ro.mekanikPj || 'Mas Agus Santoso'} / Kasir )`, startX + 310, signY + 46, { width: 180, align: 'center' });

  doc.end();
  return bufferPromise;
}

