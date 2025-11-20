import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validateGroup, validateRestrictions } from './validation';

describe('validateGroup', () => {
  let validGroupData;

  beforeEach(() => {
    // Reset to a valid group data for each test
    validGroupData = {
      name: 'Test Group',
      adminEmail: 'admin@test.com',
      participants: [
        { id: 1, name: 'Alice', email: 'alice@test.com' },
        { id: 2, name: 'Bob', email: 'bob@test.com' },
      ],
      priceRange: {
        min: '10',
        max: '50',
        currency: 'USD',
      },
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    };
  });

  describe('Participant validation', () => {
    it('should pass validation for valid group data', () => {
      const result = validateGroup(validGroupData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when less than 2 participants', () => {
      validGroupData.participants = [{ id: 1, name: 'Alice', email: 'alice@test.com' }];

      const result = validateGroup(validGroupData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Minimum two participants required');
    });

    it('should fail when more than 20 participants', () => {
      validGroupData.participants = Array.from({ length: 21 }, (_, i) => ({
        id: i + 1,
        name: `Person ${i + 1}`,
        email: `person${i + 1}@test.com`,
      }));

      const result = validateGroup(validGroupData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Maximum 20 participants allowed');
    });

    it('should fail when participant name is missing', () => {
      validGroupData.participants[0].name = '';

      const result = validateGroup(validGroupData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Participant 1 name is required');
    });

    it('should fail when participant name is only whitespace', () => {
      validGroupData.participants[0].name = '   ';

      const result = validateGroup(validGroupData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Participant 1 name is required');
    });

    it('should fail when participant email is missing', () => {
      validGroupData.participants[0].email = '';

      const result = validateGroup(validGroupData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Participant 1 email is required');
    });

    it('should fail when participant email is invalid', () => {
      validGroupData.participants[0].email = 'invalid-email';

      const result = validateGroup(validGroupData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Participant 1 email is invalid');
    });

    it('should fail when duplicate emails exist', () => {
      validGroupData.participants[1].email = 'alice@test.com';

      const result = validateGroup(validGroupData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Duplicate email addresses found');
    });

    it('should detect duplicate emails case-insensitively', () => {
      validGroupData.participants[1].email = 'ALICE@TEST.COM';

      const result = validateGroup(validGroupData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Duplicate email addresses found');
    });
  });

  describe('Price range validation', () => {
    it('should fail when minimum price is negative', () => {
      validGroupData.priceRange.min = '-10';

      const result = validateGroup(validGroupData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Minimum price must be a positive number');
    });

    it('should fail when maximum price is zero or negative', () => {
      validGroupData.priceRange.max = '0';

      const result = validateGroup(validGroupData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Maximum price must be greater than zero');
    });

    it('should fail when maximum price is less than minimum price', () => {
      validGroupData.priceRange.min = '100';
      validGroupData.priceRange.max = '50';

      const result = validateGroup(validGroupData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Maximum price must be greater than minimum price');
    });

    it('should fail when maximum price equals minimum price', () => {
      validGroupData.priceRange.min = '50';
      validGroupData.priceRange.max = '50';

      const result = validateGroup(validGroupData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Maximum price must be greater than minimum price');
    });

    it('should fail when currency is missing', () => {
      validGroupData.priceRange.currency = '';

      const result = validateGroup(validGroupData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Currency is required');
    });

    it('should fail when priceRange is missing', () => {
      delete validGroupData.priceRange;

      const result = validateGroup(validGroupData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Price range is required');
    });
  });

  describe('Deadline validation', () => {
    it('should fail when deadline is missing', () => {
      delete validGroupData.deadline;

      const result = validateGroup(validGroupData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Event date is required');
    });

    it('should fail when deadline is in the past', () => {
      validGroupData.deadline = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days ago

      const result = validateGroup(validGroupData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Event date must be in the future');
    });

    it('should fail when deadline is now', () => {
      validGroupData.deadline = new Date().toISOString();

      const result = validateGroup(validGroupData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Event date must be in the future');
    });

    it('should pass when deadline is in the future', () => {
      validGroupData.deadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Tomorrow

      const result = validateGroup(validGroupData);

      expect(result.isValid).toBe(true);
    });
  });

  describe('Multiple validation errors', () => {
    it('should return all validation errors at once', () => {
      validGroupData.participants = []; // Too few
      validGroupData.priceRange.min = '-10'; // Negative
      validGroupData.deadline = ''; // Missing

      const result = validateGroup(validGroupData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});

describe('validateRestrictions', () => {
  let participants;

  beforeEach(() => {
    participants = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' },
      { id: 4, name: 'Diana' },
    ];
  });

  it('should pass validation for valid restrictions', () => {
    const restrictions = [
      { participant1: 1, participant2: 2 },
      { participant1: 3, participant2: 4 },
    ];

    const result = validateRestrictions(participants, restrictions);

    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('should pass validation when no restrictions', () => {
    const restrictions = [];

    const result = validateRestrictions(participants, restrictions);

    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('should fail when restrictions is not an array', () => {
    const restrictions = 'invalid';

    const result = validateRestrictions(participants, restrictions);

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Invalid restrictions format');
  });

  it('should fail when restriction contains invalid participant ID', () => {
    const restrictions = [{ participant1: 1, participant2: 999 }];

    const result = validateRestrictions(participants, restrictions);

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Restriction contains invalid participant ID');
  });

  it('should fail when restriction has self-restriction', () => {
    const restrictions = [{ participant1: 1, participant2: 1 }];

    const result = validateRestrictions(participants, restrictions);

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Self-restrictions are not allowed');
  });

  it('should fail when restrictions make matching impossible', () => {
    // Participant 1 is restricted from everyone else
    const restrictions = [
      { participant1: 1, participant2: 2 },
      { participant1: 1, participant2: 3 },
      { participant1: 1, participant2: 4 },
    ];

    const result = validateRestrictions(participants, restrictions);

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Restrictions make matching impossible');
  });

  it('should handle bidirectional restrictions correctly', () => {
    // Couples in a group of 4 should be valid
    const restrictions = [
      { participant1: 1, participant2: 2 },
      { participant1: 3, participant2: 4 },
    ];

    const result = validateRestrictions(participants, restrictions);

    expect(result.isValid).toBe(true);
  });

  it('should handle complex restriction scenarios', () => {
    participants = [
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
      { id: 3, name: 'C' },
      { id: 4, name: 'D' },
      { id: 5, name: 'E' },
      { id: 6, name: 'F' },
    ];

    const restrictions = [
      { participant1: 1, participant2: 2 },
      { participant1: 3, participant2: 4 },
      { participant1: 5, participant2: 6 },
    ];

    const result = validateRestrictions(participants, restrictions);

    expect(result.isValid).toBe(true);
  });

  it('should detect impossible scenarios with 2 participants', () => {
    participants = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ];

    // In a 2-person group, any restriction makes it impossible
    const restrictions = [{ participant1: 1, participant2: 2 }];

    const result = validateRestrictions(participants, restrictions);

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Restrictions make matching impossible');
  });
});
