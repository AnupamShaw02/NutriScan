// Rule-based verdict calculator
// Thresholds based on FSSAI daily recommended values

const THRESHOLDS = {
  sugar: {
    moderation: 22.5,  // g per 100g
    caution: 30,
  },
  sodium: {
    moderation: 600,   // mg per 100g
    caution: 800,
  },
  saturatedFat: {
    moderation: 5,     // g per 100g
  },
  diabeticSugar: 15,   // g per 100g — for diabetic profile
}

export function calculateVerdict(nutriments = {}, allergenTags = [], healthProfile = {}) {
  const sugar   = nutriments['sugars_100g'] || 0
  const sodiumG = nutriments['sodium_100g'] || 0
  const sodium  = sodiumG * 1000  // convert g → mg
  const satFat  = nutriments['saturated-fat_100g'] || 0

  // Allergen checks (profile-based)
  if (healthProfile.nutAllergy && allergenTags.some(t => t.includes('nut'))) {
    return 'caution'
  }
  if (healthProfile.glutenFree && allergenTags.some(t => t.includes('gluten'))) {
    return 'caution'
  }
  if (healthProfile.lactoseIntolerant && allergenTags.some(t => t.includes('milk'))) {
    return 'caution'
  }

  // Diabetic profile
  if (healthProfile.diabetic && sugar > THRESHOLDS.diabeticSugar) {
    return 'caution'
  }

  // General FSSAI thresholds
  if (sugar > THRESHOLDS.sugar.caution || sodium > THRESHOLDS.sodium.caution) {
    return 'caution'
  }
  if (
    sugar > THRESHOLDS.sugar.moderation ||
    sodium > THRESHOLDS.sodium.moderation ||
    satFat > THRESHOLDS.saturatedFat.moderation
  ) {
    return 'moderation'
  }

  return 'safe'
}

export const VERDICT_CONFIG = {
  safe: {
    label: 'SAFE TO EAT',
    emoji: '🟢',
    color: '#4ADE80',
    bg: 'rgba(22,163,74,0.10)',
    border: 'rgba(34,197,94,0.25)',
    glow: 'rgba(34, 197, 94, 0.15)',
  },
  moderation: {
    label: 'EAT IN MODERATION',
    emoji: '🟡',
    color: '#FACC15',
    bg: 'rgba(202,138,4,0.10)',
    border: 'rgba(234,179,8,0.25)',
    glow: 'rgba(234, 179, 8, 0.15)',
  },
  caution: {
    label: 'AVOID',
    emoji: '🔴',
    color: '#F87171',
    bg: 'rgba(220,38,38,0.10)',
    border: 'rgba(239,68,68,0.25)',
    glow: 'rgba(239, 68, 68, 0.15)',
  },
}
