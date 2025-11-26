import { useState, useEffect } from 'react';
import { IconMoney, IconChevronUp, IconChevronDown, IconLoader } from '../../lib/icons';
import { Card, Button } from '../ui';
import { apiClient } from '../../lib/api-client';
import { formatPrice } from '../../utils/formatters';
import toast from 'react-hot-toast';

/**
 * PriceVoteCard - Neon Editorial Design
 *
 * Allows participants to vote on price range with up/down arrows.
 * Steps of $1.000 CLP.
 */

const STEP = 1000;
const MIN_ALLOWED = 0;
const MAX_ALLOWED = 100000;

// Group votes into ranges for visualization
const VOTE_RANGES = [
  { min: 0, max: 5000, label: 'Hasta $5.000' },
  { min: 5000, max: 10000, label: '$5.000 - $10.000' },
  { min: 10000, max: 15000, label: '$10.000 - $15.000' },
  { min: 15000, max: 20000, label: '$15.000 - $20.000' },
  { min: 20000, max: 30000, label: '$20.000 - $30.000' },
  { min: 30000, max: 50000, label: '$30.000 - $50.000' },
  { min: 50000, max: MAX_ALLOWED, label: 'Más de $50.000' },
];

export default function PriceVoteCard({
  groupId,
  userId,
  currentVotes = [],
  suggestedMin = 10000,
  suggestedMax = 20000,
  onVoteUpdate,
}) {
  const [minPrice, setMinPrice] = useState(suggestedMin);
  const [maxPrice, setMaxPrice] = useState(suggestedMax);
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // Load user's existing vote
  useEffect(() => {
    const myVote = currentVotes.find((v) => v.user_id === userId);
    if (myVote) {
      setMinPrice(myVote.min_price);
      setMaxPrice(myVote.max_price);
      setHasVoted(true);
    }
  }, [currentVotes, userId]);

  const incrementMin = () => setMinPrice(prev => Math.min(prev + STEP, maxPrice - STEP, MAX_ALLOWED - STEP));
  const decrementMin = () => setMinPrice(prev => Math.max(prev - STEP, MIN_ALLOWED));
  const incrementMax = () => setMaxPrice(prev => Math.min(prev + STEP, MAX_ALLOWED));
  const decrementMax = () => setMaxPrice(prev => Math.max(prev - STEP, minPrice + STEP, STEP));

  const handleVote = async () => {
    if (maxPrice <= minPrice) {
      toast.error('El máximo debe ser mayor al mínimo');
      return;
    }

    try {
      setVoting(true);
      await apiClient.voteForPriceRange(groupId, userId, minPrice, maxPrice);
      setHasVoted(true);
      toast.success('Voto registrado');
      onVoteUpdate?.();
    } catch (err) {
      console.error('Error voting:', err);
      toast.error('Error al registrar tu voto');
    } finally {
      setVoting(false);
    }
  };

  // Group votes into ranges for visualization
  const getVoteDistribution = () => {
    return VOTE_RANGES.map(range => {
      // Count votes where the average of min_price and max_price falls in this range
      const count = currentVotes.filter(v => {
        const avg = (v.min_price + v.max_price) / 2;
        return avg >= range.min && avg < range.max;
      }).length;
      return { ...range, count };
    }).filter(r => r.count > 0); // Only show ranges with votes
  };

  const voteDistribution = getVoteDistribution();
  const totalVotes = currentVotes.length;
  const maxVotes = Math.max(...voteDistribution.map(v => v.count), 1);

  return (
    <Card padding="md" variant="outlined">
      <Card.Header>
        <Card.Title className="flex items-center gap-2">
          <IconMoney className="w-5 h-5 text-accent-pernod" />
          Votar Presupuesto
        </Card.Title>
      </Card.Header>

      <Card.Body>
        <p className="text-sm text-text-secondary mb-6 font-body">
          Indica tu rango de precio preferido. El promedio de todos los votos definirá el presupuesto final.
        </p>

        {/* Price Inputs */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Min Price */}
          <div>
            <label className="block text-xs font-mono text-text-secondary uppercase mb-2">
              Mínimo
            </label>
            <div className="flex items-center border border-neon-border bg-neon-elevated">
              <button
                onClick={decrementMin}
                disabled={minPrice <= MIN_ALLOWED || voting}
                className="p-3 hover:bg-neon-surface transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Disminuir mínimo"
              >
                <IconChevronDown className="w-5 h-5 text-text-secondary" />
              </button>
              <div className="flex-1 text-center font-mono text-lg text-text-primary py-2">
                {formatPrice(minPrice)}
              </div>
              <button
                onClick={incrementMin}
                disabled={minPrice >= maxPrice - STEP || voting}
                className="p-3 hover:bg-neon-surface transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Aumentar mínimo"
              >
                <IconChevronUp className="w-5 h-5 text-text-secondary" />
              </button>
            </div>
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-xs font-mono text-text-secondary uppercase mb-2">
              Máximo
            </label>
            <div className="flex items-center border border-neon-border bg-neon-elevated">
              <button
                onClick={decrementMax}
                disabled={maxPrice <= minPrice + STEP || voting}
                className="p-3 hover:bg-neon-surface transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Disminuir máximo"
              >
                <IconChevronDown className="w-5 h-5 text-text-secondary" />
              </button>
              <div className="flex-1 text-center font-mono text-lg text-text-primary py-2">
                {formatPrice(maxPrice)}
              </div>
              <button
                onClick={incrementMax}
                disabled={maxPrice >= MAX_ALLOWED || voting}
                className="p-3 hover:bg-neon-surface transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Aumentar máximo"
              >
                <IconChevronUp className="w-5 h-5 text-text-secondary" />
              </button>
            </div>
          </div>
        </div>

        {/* Vote Button */}
        <Button
          variant="primary"
          fullWidth
          onClick={handleVote}
          disabled={voting || maxPrice <= minPrice}
          loading={voting}
          icon={voting ? IconLoader : undefined}
        >
          {voting ? 'Registrando...' : hasVoted ? 'Actualizar voto' : 'Votar'}
        </Button>

        {/* Vote Distribution */}
        {totalVotes > 0 && (
          <div className="mt-6 pt-6 border-t border-neon-border">
            <p className="text-xs font-mono text-text-secondary uppercase mb-3">
              Distribución de votos ({totalVotes} voto{totalVotes !== 1 ? 's' : ''})
            </p>
            <div className="space-y-2">
              {voteDistribution.map((range) => {
                const percentage = Math.round((range.count / totalVotes) * 100);
                const barWidth = (range.count / maxVotes) * 100;

                return (
                  <div key={range.label} className="relative">
                    {/* Background Bar */}
                    <div
                      className="absolute inset-y-0 left-0 bg-accent-pernod/20 transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                    {/* Content */}
                    <div className="relative flex items-center justify-between px-3 py-2">
                      <span className="text-sm font-body text-text-primary">
                        {range.label}
                      </span>
                      <span className="text-xs font-mono text-text-secondary">
                        {range.count} ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
