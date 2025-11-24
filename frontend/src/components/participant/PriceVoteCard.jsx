import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { IconMoney, IconCheck, IconLoader } from '../../lib/icons';
import { Card } from '../ui';
import { apiClient } from '../../lib/api-client';
import toast from 'react-hot-toast';

/**
 * PriceVoteCard Component
 *
 * Allows participants to vote on price range
 * Shows current vote distribution
 */

// Predefined price ranges (in CLP)
const PRICE_RANGES = [
  { min: 5000, max: 10000, label: '$5.000 - $10.000' },
  { min: 10000, max: 15000, label: '$10.000 - $15.000' },
  { min: 15000, max: 20000, label: '$15.000 - $20.000' },
  { min: 20000, max: 30000, label: '$20.000 - $30.000' },
  { min: 30000, max: 50000, label: '$30.000 - $50.000' },
];

export default function PriceVoteCard({
  groupId,
  userId,
  currentVotes = [],
  onVoteUpdate,
}) {
  const [selectedRange, setSelectedRange] = useState(null);
  const [voting, setVoting] = useState(false);

  // Check if user already voted
  useEffect(() => {
    const myVote = currentVotes.find((v) => v.user_id === userId);
    if (myVote) {
      // Find matching range
      const matchingRange = PRICE_RANGES.find(
        (r) => r.min === myVote.min_price && r.max === myVote.max_price
      );
      setSelectedRange(matchingRange || { min: myVote.min_price, max: myVote.max_price });
    }
  }, [currentVotes, userId]);

  // Calculate vote counts for each range
  const getVoteCounts = () => {
    return PRICE_RANGES.map((range) => {
      const count = currentVotes.filter(
        (v) => v.min_price === range.min && v.max_price === range.max
      ).length;
      return { ...range, count };
    });
  };

  // Handle vote
  const handleVote = async (range) => {
    try {
      setVoting(true);
      await apiClient.voteForPriceRange(groupId, userId, range.min, range.max);
      setSelectedRange(range);
      toast.success('Voto registrado');
      onVoteUpdate?.();
    } catch (err) {
      console.error('Error voting:', err);
      toast.error('Error al registrar tu voto');
    } finally {
      setVoting(false);
    }
  };

  const voteCounts = getVoteCounts();
  const totalVotes = currentVotes.length;
  const maxVotes = Math.max(...voteCounts.map((v) => v.count), 1);

  return (
    <Card padding="md">
      <Card.Header>
        <Card.Title className="flex items-center gap-2">
          <IconMoney className="w-5 h-5 text-brand-terracota" />
          Votar Presupuesto
        </Card.Title>
      </Card.Header>

      <Card.Body>
        <p className="text-sm text-accent-piedra dark:text-dark-text-secondary mb-4">
          Vota por el rango de precio que prefieres. El rango más votado será el presupuesto final.
        </p>

        {/* Vote Options */}
        <div className="space-y-2">
          {voteCounts.map((range) => {
            const isSelected = selectedRange?.min === range.min && selectedRange?.max === range.max;
            const percentage = totalVotes > 0 ? Math.round((range.count / totalVotes) * 100) : 0;
            const barWidth = maxVotes > 0 ? (range.count / maxVotes) * 100 : 0;

            return (
              <button
                key={`${range.min}-${range.max}`}
                onClick={() => handleVote(range)}
                disabled={voting}
                className={`
                  w-full relative overflow-hidden rounded-soft-lg border transition-all
                  ${
                    isSelected
                      ? 'border-accent-oliva bg-accent-oliva/10'
                      : 'border-brand-arena dark:border-dark-border hover:border-brand-terracota/50'
                  }
                `}
              >
                {/* Background Bar */}
                <div
                  className={`absolute inset-y-0 left-0 transition-all ${
                    isSelected ? 'bg-accent-oliva/20' : 'bg-brand-arena/30 dark:bg-dark-surface-hover'
                  }`}
                  style={{ width: `${barWidth}%` }}
                />

                {/* Content */}
                <div className="relative flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <IconCheck className="w-4 h-4 text-accent-oliva" />
                    )}
                    <span className={`font-medium ${isSelected ? 'text-accent-oliva' : 'text-brand-carbon dark:text-dark-text-primary'}`}>
                      {range.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    {range.count > 0 && (
                      <>
                        <span className="text-accent-piedra dark:text-dark-text-secondary">{range.count} voto{range.count !== 1 ? 's' : ''}</span>
                        <span className="text-accent-piedra/70 dark:text-dark-text-secondary/70">({percentage}%)</span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Loading Indicator */}
        {voting && (
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-accent-piedra dark:text-dark-text-secondary">
            <IconLoader className="w-4 h-4 animate-spin" />
            Registrando voto...
          </div>
        )}

        {/* Total Votes */}
        <p className="text-xs text-accent-piedra dark:text-dark-text-secondary mt-4 text-center">
          {totalVotes} voto{totalVotes !== 1 ? 's' : ''} en total
        </p>
      </Card.Body>
    </Card>
  );
}

PriceVoteCard.propTypes = {
  groupId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  currentVotes: PropTypes.arrayOf(
    PropTypes.shape({
      min_price: PropTypes.number.isRequired,
      max_price: PropTypes.number.isRequired,
      user_id: PropTypes.string.isRequired,
    })
  ),
  onVoteUpdate: PropTypes.func,
};
