/**
 * Privacy Masking Service for Bengkel Mobil GPS Motor Kediri
 * Covers R6, E01 (plate normalization), E03 (short plates),
 * E04 (single-word names), E05 (ultra-short names), and E06 (attribute stripping).
 */

/**
 * Normalizes license plate string for consistent matching and hashing.
 * Removes spaces, hyphens, and converts to uppercase.
 * Example: 'ag-1234-xx' -> 'AG1234XX'
 */
export function normalizePlate(plate) {
  if (!plate || typeof plate !== 'string') return '';
  return plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * Masks a license plate number for public viewing (R6, E01, E03).
 * Examples:
 * - 'AG 1234 XX'  -> 'AG 12** XX'
 * - 'AG1234XX'    -> 'AG 12** XX'
 * - 'ag-1234-xx'  -> 'AG 12** XX'
 * - 'AG   1234 XX'-> 'AG 12** XX'
 * - 'AG 1 X'      -> 'AG 1* X'
 * - 'B 12 A'      -> 'B 1* A'
 * - 'N 890 ZZ'    -> 'N 89* ZZ'
 */
export function maskPlate(plate) {
  if (!plate || typeof plate !== 'string') return '';

  // Normalize spaces, hyphens, and dots, uppercase
  const normalized = plate.toUpperCase().replace(/[-_.]/g, ' ').replace(/\s+/g, ' ').trim();

  // Pattern with spaces: [Region] [Digits] [Suffix]
  const matchWithSpaces = normalized.match(/^([A-Z]{1,2})\s+(\d+)\s+([A-Z]+)$/);
  if (matchWithSpaces) {
    const [, region, digits, suffix] = matchWithSpaces;
    const len = digits.length;
    let maskedDigits = '';
    if (len >= 4) {
      maskedDigits = digits.slice(0, 2) + '*'.repeat(len - 2);
    } else if (len === 3) {
      maskedDigits = digits.slice(0, 2) + '*';
    } else if (len === 2) {
      maskedDigits = digits.slice(0, 1) + '*'; // E03 Short 2-digit plate (e.g. B 12 A -> B 1* A)
    } else {
      maskedDigits = digits.slice(0, 1) + '*'; // E03 Short 1-digit plate (e.g. AG 1 X -> AG 1* X)
    }
    return `${region} ${maskedDigits} ${suffix}`;
  }

  // Compact pattern without spaces: [Region][Digits][Suffix] (e.g. AG1234XX -> AG 12** XX)
  const matchCompact = normalized.match(/^([A-Z]{1,2})(\d+)([A-Z]+)$/);
  if (matchCompact) {
    const [, region, digits, suffix] = matchCompact;
    const len = digits.length;
    let maskedDigits = '';
    if (len >= 4) {
      maskedDigits = digits.slice(0, 2) + '*'.repeat(len - 2);
    } else if (len === 3) {
      maskedDigits = digits.slice(0, 2) + '*';
    } else {
      maskedDigits = digits.slice(0, 1) + '*';
    }
    return `${region} ${maskedDigits} ${suffix}`;
  }

  return normalized;
}

/**
 * Masks customer name for public viewing (R6, E04, E05).
 * Examples:
 * - 'Budi Santoso'         -> 'Budi S******'
 * - 'Agus Bambang Wijaya'  -> 'Agus B****** W*****'
 * - 'Slamet'               -> 'Sla***'
 * - 'Ed'                   -> 'E*'
 * - 'Bo'                   -> 'B*'
 * - 'A'                    -> 'A*'
 */
export function maskCustomerName(name) {
  if (!name || typeof name !== 'string') return '';
  const trimmed = name.trim();
  if (!trimmed) return '';
  const tokens = trimmed.split(/\s+/);

  if (tokens.length === 1) {
    const single = tokens[0];
    if (single.length <= 1) return single + '*';
    if (single.length === 2) return single[0] + '*';
    // Single word name like "Slamet" (E04) -> first 3 chars preserved or first 3 + ***
    return single.slice(0, 3) + '*'.repeat(Math.max(1, single.length - 3));
  }

  const first = tokens[0];
  const rest = tokens.slice(1).map(t => {
    if (t.length <= 1) return t + '*';
    return t[0] + '*'.repeat(Math.max(t.length - 1, 3));
  }).join(' ');

  return `${first} ${rest}`;
}

/**
 * Strips all sensitive data fields and ensures privacy masking (E06).
 * Explicitly removes:
 * - customer phone number, mobile number
 * - home address
 * - parts wholesale buy price
 * - mechanic internal private notes
 */
export function sanitizeTrackingPayload(ro, photos = [], logs = [], spareparts = []) {
  if (!ro) return null;

  const maskedPlate = maskPlate(ro.plate_number || ro.platNomor);
  const maskedCustomerName = maskCustomerName(ro.customer_name || ro.namaPemilik);

  const safeRo = {
    id: ro.id,
    ro_number: ro.ro_number,
    roNumber: ro.ro_number,
    tracking_token: ro.tracking_token,
    trackingToken: ro.tracking_token,
    maskedPlate,
    plate_masked: maskedPlate,
    maskedCustomerName,
    customer_name_masked: maskedCustomerName,
    // Set plate_number & customer_name to masked variants as defense-in-depth
    plate_number: maskedPlate,
    customer_name: maskedCustomerName,
    car_brand: ro.car_brand || ro.merek,
    carBrand: ro.car_brand || ro.merek,
    car_model: ro.car_model || ro.model,
    carModel: ro.car_model || ro.model,
    car_year: ro.car_year || ro.tahun,
    carYear: ro.car_year || ro.tahun,
    car_color: ro.car_color || ro.warna,
    carColor: ro.car_color || ro.warna,
    odometer_in: ro.odometer_in || ro.odometer || null,
    odometerIn: ro.odometer_in || ro.odometer || null,
    entry_date: ro.entry_date || ro.tanggalMasuk,
    entryDate: ro.entry_date || ro.tanggalMasuk,
    complaint: ro.complaint || ro.keluhan,
    status: ro.status,
    service_fee: ro.service_fee || ro.biayaJasa || 0,
    serviceFee: ro.service_fee || ro.biayaJasa || 0,
    sparepart_fee: ro.sparepart_fee || 0,
    sparepartFee: ro.sparepart_fee || 0,
    discount: ro.discount || 0,
    total_cost: ro.total_cost || ro.totalBiaya || 0,
    totalCost: ro.total_cost || ro.totalBiaya || 0,
    estimated_completion: ro.estimated_completion || ro.estimasiSelesai || null,
    estimatedCompletion: ro.estimated_completion || ro.estimasiSelesai || null,
    notes: ro.notes || null,
    created_at: ro.created_at,
    updated_at: ro.updated_at
  };

  const safePhotos = (photos || []).map(p => ({
    id: p.id,
    photo_url: p.photo_url || p.url,
    photoUrl: p.photo_url || p.url,
    stage: p.stage,
    caption: p.caption,
    created_at: p.created_at
  }));

  const safeLogs = (logs || []).map(l => ({
    id: l.id,
    previous_status: l.previous_status,
    previousStatus: l.previous_status,
    new_status: l.new_status,
    newStatus: l.new_status,
    notes: l.notes,
    actor_name: l.actor_name,
    created_at: l.created_at
  }));

  // Explicitly strip buy prices (E06)
  const safeParts = (spareparts || []).map(s => ({
    id: s.id,
    item_name: s.item_name || s.name,
    itemName: s.item_name || s.name,
    quantity: s.quantity || s.qty || 1,
    unit_price: s.unit_price || s.sell_price || s.price || 0,
    unitPrice: s.unit_price || s.sell_price || s.price || 0,
    subtotal: s.subtotal || ((s.quantity || s.qty || 1) * (s.unit_price || s.sell_price || s.price || 0))
  }));

  return {
    repairOrder: safeRo,
    plate_masked: maskedPlate,
    customer_name_masked: maskedCustomerName,
    photos: safePhotos,
    logs: safeLogs,
    spareparts: safeParts
  };
}

export default {
  normalizePlate,
  maskPlate,
  maskCustomerName,
  sanitizeTrackingPayload
};
