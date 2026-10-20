/**
 * Client-Side Privacy Masking Utility
 * Masks vehicle plate numbers and customer names for public tracking.
 */

export function normalizePlate(plate) {
  if (!plate || typeof plate !== 'string') return '';
  return plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function maskPlate(plate) {
  if (!plate || typeof plate !== 'string') return '';

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
      maskedDigits = digits.slice(0, 1) + '*';
    } else {
      maskedDigits = digits.slice(0, 1) + '*';
    }
    return `${region} ${maskedDigits} ${suffix}`;
  }

  // Compact pattern without spaces: [Region][Digits][Suffix]
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

export function maskCustomerName(name) {
  if (!name || typeof name !== 'string') return '';
  const trimmed = name.trim();
  if (!trimmed) return '';
  const tokens = trimmed.split(/\s+/);

  if (tokens.length === 1) {
    const single = tokens[0];
    if (single.length <= 1) return single + '*';
    if (single.length === 2) return single[0] + '*';
    return single.slice(0, 3) + '*'.repeat(Math.max(1, single.length - 3));
  }

  const first = tokens[0];
  const rest = tokens.slice(1).map(t => {
    if (t.length <= 1) return t + '*';
    return t[0] + '*'.repeat(Math.max(t.length - 1, 3));
  }).join(' ');

  return `${first} ${rest}`;
}

export function sanitizeTrackingPayload(ro, photos = [], logs = [], spareparts = []) {
  if (!ro) return null;

  const maskedPlate = maskPlate(ro.plate_number || ro.platNomor);
  const maskedCustomerName = maskCustomerName(ro.customer_name || ro.namaPemilik);

  return {
    ...ro,
    maskedPlate,
    plate_masked: maskedPlate,
    maskedCustomerName,
    customer_name_masked: maskedCustomerName,
    plate_number: maskedPlate,
    customer_name: maskedCustomerName,
    photos: (photos || []).map(p => ({
      id: p.id,
      photo_url: p.photo_url || p.url,
      stage: p.stage,
      caption: p.caption,
      created_at: p.created_at
    })),
    logs: (logs || []).map(l => ({
      id: l.id,
      previous_status: l.previous_status,
      new_status: l.new_status,
      notes: l.notes,
      actor_name: l.actor_name,
      created_at: l.created_at
    })),
    spareparts: (spareparts || []).map(s => ({
      id: s.id,
      item_name: s.item_name || s.name,
      quantity: s.quantity,
      unit_price: s.unit_price || s.sell_price || 0,
      subtotal: s.subtotal || ((s.unit_price || 0) * (s.quantity || 1))
    }))
  };
}
