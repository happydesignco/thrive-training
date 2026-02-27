export const SLOT_TYPES = ['rest', '531', 'conditioning', 'metcon', 'accessory']

export const DEFAULT_SCHEDULES = {
  hybrid: {
    id: 'hybrid',
    name: 'Hybrid',
    description: 'Balanced strength + conditioning',
    days: {
      monday: 'conditioning',
      tuesday: '531',
      wednesday: 'metcon',
      thursday: 'accessory',
      friday: '531',
      saturday: 'rest',
      sunday: 'rest',
    },
  },
  conditioning: {
    id: 'conditioning',
    name: 'Conditioning',
    description: 'Conditioning focus, no barbell days',
    days: {
      monday: 'conditioning',
      tuesday: 'rest',
      wednesday: 'metcon',
      thursday: 'accessory',
      friday: 'rest',
      saturday: 'rest',
      sunday: 'rest',
    },
  },
  strength: {
    id: 'strength',
    name: 'Strength',
    description: '3x 5/3/1 + conditioning',
    days: {
      monday: '531',
      tuesday: 'rest',
      wednesday: '531',
      thursday: 'accessory',
      friday: '531',
      saturday: 'rest',
      sunday: 'rest',
    },
  },
}
