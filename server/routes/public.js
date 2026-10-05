import { Router } from 'express';
import { 
  maskPlate, 
  maskCustomerName, 
  normalizePlate, 
  sanitizeTrackingPayload 
} from '../services/maskingService.js';

const STAGE_DEFINITIONS = [
  { key: 'MASUK', step: 1, label: 'Masuk', description: 'Penerimaan unit & pencatatan keluhan awal' },
  { key: 'DIAGNOSA', step: 2, label: 'Pemeriksaan / Diagnosa', description: 'Pemeriksaan fisik, scan OBD2 & estimasi perbaikan' },
  { key: 'PENGERJAAN', step: 3, label: 'Pengerjaan / Servis', description: 'Proses perbaikan atau servis oleh mekanik' },
  { key: 'MENUNGGU_PART', step: 4, label: 'Menunggu Sparepart', description: 'Menunggu ketersediaan atau konfirmasi suku cadang' },
  { key: 'SELESAI', step: 5, label: 'Selesai', description: 'Pengerjaan rampung, quality control & uji jalan' },
  { key: 'DIAMBIL', step: 6, label: 'Sudah Diambil', description: 'Kendaraan telah diserahkan kembali kepada pemilik' }
];

const DEFAULT_SERVICES = [
  {
    id: 'tune-up',
    title: 'Tune Up Mesin & Carbon Clean',
    category: 'Tune Up',
    icon: 'Gauge',
    description: 'Pembersihan ruang bakar, kalibrasi injektor & celah busi, pembersihan throttle body, serta reset komputer ECU untuk mengembalikan performa mesin prima dan irit BBM.',
    features: ['Scan Diagnostik OBD2', 'Pembersihan Ruang Bakar (Carbon Clean)', 'Kalibrasi Injektor & Busi', 'Reset Throttle Position Sensor']
  },
  {
    id: 'servis-injeksi',
    title: 'Servis Mobil Injeksi & EFI',
    category: 'Injeksi',
    icon: 'Cpu',
    description: 'Penanganan komprehensif sistem injeksi bensin modern, trouble code check engine (MIL), sensor MAF/MAP, O2 sensor, dan kalibrasi sistem bahan bakar bertekanan tinggi.',
    features: ['Diagnosa Error Sensor ECU', 'Pembersihan Injektor Ultrasonik', 'Pemeriksaan Fuel Pump & Tekanan BBM', 'Kalibrasi Idle Speed Control']
  },
  {
    id: 'overhaul-mesin',
    title: 'Overhaul Mesin (Turun Mesin)',
    category: 'Overhaul',
    icon: 'Wrench',
    description: 'Solusi tuntas masalah mesin ngebul, oli berkurang drastis, overheat, atau bunyi kasar. Pengerjaan presisi dengan pengukuran mikrometer dan suku cadang presisi.',
    features: ['Turun Mesin Semi / Total', 'Skir Klep & Ganti Seal Klep', 'Ganti Ring Piston & Metal Duduk/Jalan', 'Gasket Mesin & Packing Full Set']
  },
  {
    id: 'kaki-kaki',
    title: 'Perbaikan Kaki-Kaki & Suspensi',
    category: 'Kaki-kaki',
    icon: 'ShieldCheck',
    description: 'Hilangkan bunyi glodakan saat melibas jalan berlubang. Rekondisi atau penggantian tierod, balljoint, link stabilizer, bushing arm, rack end, dan shockbreaker.',
    features: ['Pengecekan Tierod & Balljoint', 'Penggantian Bushing Arm Presisi', 'Servis / Ganti Shock Absorber', 'Cek Bearing Roda & Link Stabilizer']
  },
  {
    id: 'kelistrikan',
    title: 'Kelistrikan Mobil & Starter',
    category: 'Kelistrikan',
    icon: 'Zap',
    description: 'Perbaikan urut kabel bodi korsleting, perbaikan dinamo starter tidak mau memutar, dinamo ampere (alternator) lemah pengisian, sistem lampu, dan kelistrikan audio.',
    features: ['Urut Kabel Bodi & Sekring Fuse', 'Servis Dinamo Starter & Solenoid', 'Servis Dinamo Alternator Pengisian', 'Pemeriksaan Drop Tegangan & Aki']
  },
  {
    id: 'perawatan-berkala',
    title: 'Perawatan Berkala & Ganti Fluida',
    category: 'Perawatan Berkala',
    icon: 'Clock',
    description: 'Paket ganti oli mesin berkualitas, kuras oli transmisi matic/manual, ganti oli gardan, kuras minyak rem, radiator coolant flushing, dan filter komplit.',
    features: ['Ganti Oli Mesin & Filter Oli', 'Kuras / Kuras Oli Transmisi ATF/CVT', 'Ganti Filter Udara & Filter AC Kabin', 'Flushing Radiator Coolant']
  }
];

const DEFAULT_TESTIMONIALS = [
  {
    id: 1,
    name: 'Bambang Sudibyo',
    car: 'Toyota Avanza Veloz (Kediri)',
    text: 'Sangat puas servis di Bengkel GPS Motor Kediri! Fitur cek status online via WhatsApp ini sangat transparan, ada foto sebelum dan sesudah diganti businya. Jadi tahu persis apa yang dikerjakan tanpa perlu nunggu seharian di bengkel.',
    rating: 5,
    date: 'September 2026'
  },
  {
    id: 2,
    name: 'Hj. Siti Mahmudah',
    car: 'Honda Brio Satya (Gampengrejo)',
    text: 'Mekaniknya Mas Agus sangat teliti dan ramah. Keluhan mesin brebet dan AC kurang dingin langsung beres di hari yang sama. Harga transparan dan nota rinciannya jelas sekali. Recommended untuk warga Sambiresik dan sekitarnya!',
    rating: 5,
    date: 'September 2026'
  },
  {
    id: 3,
    name: 'Agus Purnomo',
    car: 'Daihatsu Xenia 1.3 (Ngasem)',
    text: 'Bengkel jujur dan bertanggung jawab. Sparepart lama yang diganti selalu disertakan dan ditunjukkan ke pemilik. Tracking via web plat nomor sangat memudahkan saya memantau dari kantor.',
    rating: 5,
    date: 'Agustus 2026'
  }
];

const DEFAULT_FAQS = [
  {
    id: 1,
    question: 'Bagaimana cara melacak proses servis mobil saya secara online?',
    answer: 'Cukup masukkan plat nomor kendaraan Anda (contoh: AG 1822 AB) pada menu "Cek Status Servis" di halaman ini tanpa perlu login. Sistem akan menampilkan tahapan pengerjaan secara real-time, foto sebelum & sesudah, serta estimasi waktu selesai.'
  },
  {
    id: 2,
    question: 'Apakah data nomor HP atau alamat rumah saya terlihat oleh publik saat dicek?',
    answer: 'Tidak sama sekali. Sistem kami menerapkan sensor privasi ketat (Privacy Masking). Nomor telepon, alamat rumah, dan harga beli grosir bengkel disensor dan dihapus secara otomatis dari data pelacakan publik.'
  },
  {
    id: 3,
    question: 'Apakah melayani panggilan darurat atau servis di rumah (home service)?',
    answer: 'Ya, untuk wilayah sekitar Sambiresik, Gampengrejo, dan Kediri Kota kami dapat membantu evakuasi darurat atau pengecekan ringan. Silakan hubungi WhatsApp kami di 0856-0330-7330.'
  },
  {
    id: 4,
    question: 'Apakah ada garansi setelah servis di Bengkel Mobil GPS Motor?',
    answer: 'Setiap pekerjaan servis berkala, tune up, dan perbaikan komponen mesin kami sertai dengan garansi pengerjaan agar Anda dapat berkendara dengan tenang dan aman.'
  },
  {
    id: 5,
    question: 'Metode pembayaran apa saja yang diterima di bengkel?',
    answer: 'Kami menerima pembayaran tunai (Cash), transfer antar bank, dan scan QRIS instan dari semua e-wallet maupun mobile banking.'
  }
];

export function publicRoutes(db) {
  const router = Router();

  function findTenantBySlug(slug) {
    if (!slug) slug = 'bengkel-gps-motor';
    let tenant = db.prepare('SELECT * FROM tenants WHERE slug = ?').get(slug);
    if (!tenant && slug === 'bengkel-gps-motor') {
      tenant = db.prepare('SELECT * FROM tenants LIMIT 1').get();
    }
    return tenant;
  }

  // GET /api/public/:slug/info or /api/public/info
  async function handleGetInfo(req, res, next) {
    try {
      const slug = req.params.slug || req.query.slug || 'bengkel-gps-motor';
      const tenant = findTenantBySlug(slug);

      if (!tenant) {
        return res.status(404).json({ error: 'Bengkel tidak ditemukan' });
      }

      const settings = db.prepare('SELECT * FROM tenant_settings WHERE tenant_id = ?').get(tenant.id) || {};

      res.json({
        success: true,
        tenant: {
          id: tenant.id,
          slug: tenant.slug,
          name: tenant.name,
          address: tenant.address,
          phone_wa: tenant.phone_wa,
          phoneWa: tenant.phone_wa,
          business_hours: tenant.business_hours,
          businessHours: tenant.business_hours,
          logo_url: tenant.logo_url,
          logoUrl: tenant.logo_url,
          invoice_footer: settings.invoice_footer || 'Terima kasih atas kunjungan Anda.'
        },
        services: DEFAULT_SERVICES,
        testimonials: DEFAULT_TESTIMONIALS,
        faqs: DEFAULT_FAQS,
        location: {
          address: tenant.address,
          district: 'Gampengrejo',
          city: 'Kediri',
          province: 'Jawa Timur',
          googleMapsUrl: 'https://maps.google.com/?q=Bengkel+Mobil+GPS+Motor+Kediri+Sambiresik',
          embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.07663248318!2d112.0305!3d-7.7812!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwNDYnNTIuMyJTIDExMsKwMDEnNTAuMCJF!5e0!3m2!1sid!2sid!4v1620000000000!5m2!1sid!2sid'
        }
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/public/:slug/tracking or /api/public/tracking
  async function handleGetTracking(req, res, next) {
    try {
      const slug = req.params.slug || req.query.slug || 'bengkel-gps-motor';
      const tenant = findTenantBySlug(slug);

      if (!tenant) {
        return res.status(404).json({ error: 'Bengkel tidak ditemukan' });
      }

      const rawQuery = (req.query.plate || req.query.token || req.query.q || req.query.search || '').trim();
      if (!rawQuery) {
        return res.status(400).json({ error: 'Plat nomor atau token tracking wajib diisi.' });
      }

      const normalizedQuery = rawQuery.toUpperCase().replace(/[\s\-_.]/g, '');

      // Search repair orders by token or plate number
      let ro = null;
      if (req.query.token) {
        ro = db.prepare(`
          SELECT * FROM repair_orders 
          WHERE tenant_id = ? AND (tracking_token = ? OR ro_number = ?)
          LIMIT 1
        `).get(tenant.id, req.query.token, req.query.token);
      }

      if (!ro) {
        // Query by normalized plate number or raw plate variation
        ro = db.prepare(`
          SELECT * FROM repair_orders
          WHERE tenant_id = ?
            AND (
              REPLACE(REPLACE(REPLACE(UPPER(plate_number), ' ', ''), '-', ''), '.', '') = ?
              OR UPPER(plate_number) = ?
              OR tracking_token = ?
              OR ro_number = ?
            )
          ORDER BY created_at DESC
          LIMIT 1
        `).get(tenant.id, normalizedQuery, rawQuery.toUpperCase(), rawQuery, rawQuery);
      }

      if (!ro) {
        return res.status(404).json({
          success: false,
          error: `Data perbaikan tidak ditemukan untuk plat nomor "${rawQuery}". Silakan pastikan plat nomor yang Anda masukkan benar.`,
          repairOrder: null
        });
      }

      // Fetch related photos, logs, and spareparts
      const photos = db.prepare(`
        SELECT * FROM ro_photos
        WHERE tenant_id = ? AND repair_order_id = ?
        ORDER BY created_at ASC
      `).all(tenant.id, ro.id);

      const logs = db.prepare(`
        SELECT * FROM ro_status_logs
        WHERE tenant_id = ? AND repair_order_id = ?
        ORDER BY created_at ASC
      `).all(tenant.id, ro.id);

      const spareparts = db.prepare(`
        SELECT * FROM ro_spareparts
        WHERE tenant_id = ? AND repair_order_id = ?
        ORDER BY created_at ASC
      `).all(tenant.id, ro.id);

      // Fetch service history for this vehicle
      const historyRows = db.prepare(`
        SELECT id, ro_number, entry_date, status, total_cost, complaint, car_brand, car_model
        FROM repair_orders
        WHERE tenant_id = ?
          AND id != ?
          AND (
            REPLACE(REPLACE(REPLACE(UPPER(plate_number), ' ', ''), '-', ''), '.', '') = ?
            OR UPPER(plate_number) = ?
          )
        ORDER BY entry_date DESC
        LIMIT 5
      `).all(tenant.id, ro.id, normalizedQuery, rawQuery.toUpperCase());

      // Sanitize payload using privacy masking service (E01-E06)
      const sanitized = sanitizeTrackingPayload(ro, photos, logs, spareparts);

      // Construct milestone stages (6-stage status lifecycle)
      const stageOrder = ['MASUK', 'DIAGNOSA', 'PENGERJAAN', 'MENUNGGU_PART', 'SELESAI', 'DIAMBIL'];
      const currentIdx = stageOrder.indexOf(ro.status);

      const milestones = STAGE_DEFINITIONS.map((def, idx) => {
        const logForStage = logs.find(l => l.new_status === def.key);
        return {
          key: def.key,
          step: def.step,
          label: def.label,
          description: def.description,
          isCompleted: idx <= currentIdx,
          isCurrent: def.key === ro.status,
          timestamp: logForStage ? logForStage.created_at : null,
          notes: logForStage ? logForStage.notes : null
        };
      });

      // Construct WhatsApp share link and direct tracking link
      const relativeTrackingUrl = ro.tracking_token
        ? `/${tenant.slug}/cek-status?token=${encodeURIComponent(ro.tracking_token)}`
        : `/${tenant.slug}/cek-status?plate=${encodeURIComponent(ro.plate_number || rawQuery)}`;
      const baseUrl = process.env.APP_URL || (req.get('host') ? `${req.protocol}://${req.get('host')}` : '');
      const trackingUrl = baseUrl ? `${baseUrl}${relativeTrackingUrl}` : relativeTrackingUrl;

      const cleanPhone = (tenant.phone_wa || '085603307330').replace(/[^0-9]/g, '');
      const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
      
      const shareMessage = `Halo, pantau proses servis kendaraan *${sanitized.plate_masked}* di *${tenant.name}* secara live di link berikut:\n\n${trackingUrl}`;
      const waShareUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
      const waContactUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Halo ${tenant.name}, saya ingin menanyakan status servis kendaraan saya dengan plat ${sanitized.plate_masked}.`)}`;

      const sanitizedHistory = historyRows.map(h => ({
        id: h.id,
        ro_number: h.ro_number,
        entry_date: h.entry_date,
        status: h.status,
        complaint: h.complaint,
        total_cost: h.total_cost
      }));

      res.json({
        success: true,
        tenant: {
          id: tenant.id,
          slug: tenant.slug,
          name: tenant.name,
          address: tenant.address,
          phone_wa: tenant.phone_wa,
          phoneWa: tenant.phone_wa,
          business_hours: tenant.business_hours,
          businessHours: tenant.business_hours
        },
        repairOrder: sanitized.repairOrder,
        vehicle: sanitized.repairOrder,
        plate_masked: sanitized.plate_masked,
        customer_name_masked: sanitized.customer_name_masked,
        milestones,
        stages: milestones,
        photos: sanitized.photos,
        logs: sanitized.logs,
        spareparts: sanitized.spareparts,
        history: sanitizedHistory,
        trackingUrl,
        shareUrl: trackingUrl,
        waShareUrl,
        whatsappUrl: waShareUrl,
        waContactUrl
      });
    } catch (err) {
      next(err);
    }
  }

  // Mounted routes
  router.get('/info', handleGetInfo);
  router.get('/tracking', handleGetTracking);
  router.get('/:slug/info', handleGetInfo);
  router.get('/:slug/tracking', handleGetTracking);

  return router;
}

export default publicRoutes;
