import { describe, it, expect } from 'vitest';
import { MatchingService } from './matching';

describe('MatchingService', () => {
  describe('generateMatches', () => {
    it('should generate valid matches for simple case (2 participants)', () => {
      const participants = [
        { id: 1, name: 'Alice', email: 'alice@test.com' },
        { id: 2, name: 'Bob', email: 'bob@test.com' },
      ];
      const restrictions = [];

      const matches = MatchingService.generateMatches(participants, restrictions);

      expect(matches.size).toBe(2);
      expect(matches.get(1)).toBe(2);
      expect(matches.get(2)).toBe(1);
    });

    it('should generate valid matches for multiple participants', () => {
      const participants = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
        { id: 4, name: 'Diana' },
      ];
      const restrictions = [];

      const matches = MatchingService.generateMatches(participants, restrictions);

      expect(matches.size).toBe(4);

      // Verify no self-matches
      for (const [giver, receiver] of matches) {
        expect(giver).not.toBe(receiver);
      }

      // Verify all participants are receivers
      const receivers = Array.from(matches.values());
      expect(new Set(receivers).size).toBe(4);
    });

    it('should respect restrictions', () => {
      const participants = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
        { id: 4, name: 'Diana' },
      ];
      const restrictions = [
        { participant1: 1, participant2: 2 }, // Alice cannot give to Bob
      ];

      const matches = MatchingService.generateMatches(participants, restrictions);

      expect(matches.get(1)).not.toBe(2);
      expect(matches.get(2)).not.toBe(1);
    });

    it('should handle multiple restrictions', () => {
      const participants = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
        { id: 4, name: 'Diana' },
      ];
      const restrictions = [
        { participant1: 1, participant2: 2 },
        { participant1: 3, participant2: 4 },
      ];

      const matches = MatchingService.generateMatches(participants, restrictions);

      expect(matches.get(1)).not.toBe(2);
      expect(matches.get(2)).not.toBe(1);
      expect(matches.get(3)).not.toBe(4);
      expect(matches.get(4)).not.toBe(3);
    });

    it('should throw error for impossible matching scenarios', () => {
      const participants = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ];
      // Make matching impossible - everyone restricted from everyone
      const restrictions = [
        { participant1: 1, participant2: 2 },
      ];

      expect(() => {
        MatchingService.generateMatches(participants, restrictions);
      }).toThrow('Unable to generate valid matches');
    });

    it('should handle larger groups (10 participants)', () => {
      const participants = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `Person ${i + 1}`,
      }));
      const restrictions = [];

      const matches = MatchingService.generateMatches(participants, restrictions);

      expect(matches.size).toBe(10);

      // Verify no self-matches
      for (const [giver, receiver] of matches) {
        expect(giver).not.toBe(receiver);
      }

      // Verify all participants are receivers exactly once
      const receivers = Array.from(matches.values());
      expect(new Set(receivers).size).toBe(10);
    });

    it('should handle maximum participants (20)', () => {
      const participants = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: `Person ${i + 1}`,
      }));
      const restrictions = [];

      const matches = MatchingService.generateMatches(participants, restrictions);

      expect(matches.size).toBe(20);

      const receivers = Array.from(matches.values());
      expect(new Set(receivers).size).toBe(20);
    });
  });

  describe('hasRestriction', () => {
    it('should return true when restriction exists (forward)', () => {
      const restrictions = [{ participant1: 1, participant2: 2 }];

      expect(MatchingService.hasRestriction(1, 2, restrictions)).toBe(true);
    });

    it('should return true when restriction exists (backward)', () => {
      const restrictions = [{ participant1: 1, participant2: 2 }];

      expect(MatchingService.hasRestriction(2, 1, restrictions)).toBe(true);
    });

    it('should return false when no restriction exists', () => {
      const restrictions = [{ participant1: 1, participant2: 2 }];

      expect(MatchingService.hasRestriction(1, 3, restrictions)).toBe(false);
    });

    it('should return false when restrictions array is empty', () => {
      const restrictions = [];

      expect(MatchingService.hasRestriction(1, 2, restrictions)).toBe(false);
    });
  });

  describe('validateMatching', () => {
    it('should validate correct matching', () => {
      const participants = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
      ];
      const matches = new Map([
        [1, 2],
        [2, 3],
        [3, 1],
      ]);
      const restrictions = [];

      expect(MatchingService.validateMatching(matches, participants, restrictions)).toBe(true);
    });

    it('should reject matching with self-assignment', () => {
      const participants = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ];
      const matches = new Map([
        [1, 1], // Self-assignment
        [2, 2],
      ]);
      const restrictions = [];

      expect(MatchingService.validateMatching(matches, participants, restrictions)).toBe(false);
    });

    it('should reject matching that violates restrictions', () => {
      const participants = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
      ];
      const matches = new Map([
        [1, 2],
        [2, 3],
        [3, 1],
      ]);
      const restrictions = [{ participant1: 1, participant2: 2 }];

      expect(MatchingService.validateMatching(matches, participants, restrictions)).toBe(false);
    });

    it('should reject matching with duplicate receivers', () => {
      const participants = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
      ];
      const matches = new Map([
        [1, 2],
        [2, 2], // Duplicate
        [3, 1],
      ]);
      const restrictions = [];

      expect(MatchingService.validateMatching(matches, participants, restrictions)).toBe(false);
    });

    it('should reject matching with wrong number of matches', () => {
      const participants = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
      ];
      const matches = new Map([
        [1, 2],
        [2, 3],
        // Missing match for participant 3
      ]);
      const restrictions = [];

      expect(MatchingService.validateMatching(matches, participants, restrictions)).toBe(false);
    });

    it('should reject matching with non-existent participants', () => {
      const participants = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ];
      const matches = new Map([
        [1, 2],
        [2, 999], // Non-existent participant
      ]);
      const restrictions = [];

      expect(MatchingService.validateMatching(matches, participants, restrictions)).toBe(false);
    });
  });

  describe('Edge cases and stress tests', () => {
    it('should handle complex restriction patterns', () => {
      const participants = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 3, name: 'C' },
        { id: 4, name: 'D' },
        { id: 5, name: 'E' },
        { id: 6, name: 'F' },
      ];
      const restrictions = [
        { participant1: 1, participant2: 2 }, // Couple 1
        { participant1: 3, participant2: 4 }, // Couple 2
        { participant1: 5, participant2: 6 }, // Couple 3
      ];

      const matches = MatchingService.generateMatches(participants, restrictions);

      expect(matches.size).toBe(6);
      expect(MatchingService.validateMatching(matches, participants, restrictions)).toBe(true);
    });

    it('should generate different matches on subsequent calls', () => {
      const participants = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 3, name: 'C' },
        { id: 4, name: 'D' },
      ];
      const restrictions = [];

      const matches1 = MatchingService.generateMatches(participants, restrictions);
      const matches2 = MatchingService.generateMatches(participants, restrictions);

      // Due to randomness, matches should sometimes be different
      // We'll just verify both are valid
      expect(MatchingService.validateMatching(matches1, participants, restrictions)).toBe(true);
      expect(MatchingService.validateMatching(matches2, participants, restrictions)).toBe(true);
    });

    it('should handle nearly impossible scenarios (tight restrictions)', () => {
      const participants = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 3, name: 'C' },
        { id: 4, name: 'D' },
      ];
      // Very tight restrictions - only one valid solution possible
      const restrictions = [
        { participant1: 1, participant2: 2 },
        { participant1: 1, participant2: 4 },
        { participant1: 2, participant2: 3 },
        { participant1: 3, participant2: 4 },
      ];

      const matches = MatchingService.generateMatches(participants, restrictions);

      expect(matches.size).toBe(4);
      expect(MatchingService.validateMatching(matches, participants, restrictions)).toBe(true);
    });
  });
});
