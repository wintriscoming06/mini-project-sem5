import { calculateAge, PRESET_CLUBS, getClubTheme } from './utils/clubTheme';
import { CARD_DESIGNS } from './utils/cardDesigns';

describe('Frontend Core Utilities & Logic', () => {
  test('calculateAge computes correct age from birth year', () => {
    const currentYear = new Date().getFullYear();
    const dob = `${currentYear - 22}-05-15`;
    expect(calculateAge(dob)).toBe(22);
  });

  test('calculateAge handles invalid dates gracefully', () => {
    expect(calculateAge(null)).toBeNull();
    expect(calculateAge('')).toBeNull();
    expect(calculateAge('invalid-date')).toBeNull();
  });

  test('PRESET_CLUBS contains standard club definitions', () => {
    expect(PRESET_CLUBS.length).toBeGreaterThan(0);
    const freeAgent = PRESET_CLUBS.find((c) => c.id === 'free_agent');
    expect(freeAgent).toBeDefined();
    expect(freeAgent.name).toBe('Free Agent');
  });

  test('getClubTheme retrieves correct theme by identifier', () => {
    const club = getClubTheme('Real Madrid');
    expect(club).toBeDefined();
    expect(club.id).toBe('real_madrid');
    expect(club.short).toBe('RMA');
  });

  test('CARD_DESIGNS contains valid card design presets', () => {
    expect(CARD_DESIGNS).toHaveProperty('Bronze');
    expect(CARD_DESIGNS).toHaveProperty('Silver');
    expect(CARD_DESIGNS).toHaveProperty('Gold');
    expect(CARD_DESIGNS.Gold.accent).toBeDefined();
    expect(CARD_DESIGNS.Gold.gradient).toBeDefined();
    expect(CARD_DESIGNS.Gold.border).toBeDefined();
  });
});
