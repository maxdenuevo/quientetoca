import { IconChevronUp, IconChevronDown } from '../../lib/icons';
import { formatPrice } from '../../utils/formatters';

/**
 * PriceRangeSlider - Neon Editorial Design
 *
 * Dual slider with up/down arrows for budget selection.
 * Steps of $1.000 CLP.
 */

const STEP = 1000;
const MIN_ALLOWED = 0;
const MAX_ALLOWED = 100000;

export default function PriceRangeSlider({
  minPrice,
  maxPrice,
  onMinChange,
  onMaxChange,
  disabled = false,
}) {
  const incrementMin = () => onMinChange(Math.min(minPrice + STEP, maxPrice - STEP));
  const decrementMin = () => onMinChange(Math.max(minPrice - STEP, MIN_ALLOWED));
  const incrementMax = () => onMaxChange(Math.min(maxPrice + STEP, MAX_ALLOWED));
  const decrementMax = () => onMaxChange(Math.max(maxPrice - STEP, minPrice + STEP));

  // Calculate slider positions
  const minPercent = ((minPrice - MIN_ALLOWED) / (MAX_ALLOWED - MIN_ALLOWED)) * 100;
  const maxPercent = ((maxPrice - MIN_ALLOWED) / (MAX_ALLOWED - MIN_ALLOWED)) * 100;

  return (
    <div className="space-y-6">
      {/* Visual Slider */}
      <div className="relative h-2 bg-neon-elevated">
        {/* Active range */}
        <div
          className="absolute h-full"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
            backgroundColor: 'var(--accent-color)',
          }}
        />

        {/* Min slider track (invisible but interactive) */}
        <input
          type="range"
          min={MIN_ALLOWED}
          max={MAX_ALLOWED}
          step={STEP}
          value={minPrice}
          onChange={(e) => onMinChange(Math.min(Number(e.target.value), maxPrice - STEP))}
          disabled={disabled}
          className="absolute w-full h-full opacity-0 cursor-pointer z-10"
          style={{ pointerEvents: 'auto' }}
        />

        {/* Max slider track (invisible but interactive) */}
        <input
          type="range"
          min={MIN_ALLOWED}
          max={MAX_ALLOWED}
          step={STEP}
          value={maxPrice}
          onChange={(e) => onMaxChange(Math.max(Number(e.target.value), minPrice + STEP))}
          disabled={disabled}
          className="absolute w-full h-full opacity-0 cursor-pointer z-20"
          style={{ pointerEvents: 'auto' }}
        />

        {/* Min thumb indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-accent bg-neon-base z-30 pointer-events-none"
          style={{ left: `calc(${minPercent}% - 8px)` }}
        />

        {/* Max thumb indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-accent bg-neon-base z-30 pointer-events-none"
          style={{ left: `calc(${maxPercent}% - 8px)` }}
        />
      </div>

      {/* Price scale markers */}
      <div className="flex justify-between text-xs font-mono text-text-muted">
        <span>$0</span>
        <span>$25k</span>
        <span>$50k</span>
        <span>$75k</span>
        <span>$100k</span>
      </div>

      {/* Price Inputs with Arrows */}
      <div className="grid grid-cols-2 gap-4">
        {/* Min Price Input */}
        <div>
          <label className="block text-xs font-mono text-text-secondary uppercase mb-2">
            Desde
          </label>
          <div className="flex items-center border border-neon-border bg-neon-elevated">
            <button
              type="button"
              onClick={decrementMin}
              disabled={minPrice <= MIN_ALLOWED || disabled}
              className="p-3 hover:bg-neon-surface transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Disminuir mínimo"
            >
              <IconChevronDown className="w-5 h-5 text-text-secondary" />
            </button>
            <div className="flex-1 text-center font-mono text-lg text-text-primary py-2">
              {formatPrice(minPrice)}
            </div>
            <button
              type="button"
              onClick={incrementMin}
              disabled={minPrice >= maxPrice - STEP || disabled}
              className="p-3 hover:bg-neon-surface transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Aumentar mínimo"
            >
              <IconChevronUp className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Max Price Input */}
        <div>
          <label className="block text-xs font-mono text-text-secondary uppercase mb-2">
            Hasta
          </label>
          <div className="flex items-center border border-neon-border bg-neon-elevated">
            <button
              type="button"
              onClick={decrementMax}
              disabled={maxPrice <= minPrice + STEP || disabled}
              className="p-3 hover:bg-neon-surface transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Disminuir máximo"
            >
              <IconChevronDown className="w-5 h-5 text-text-secondary" />
            </button>
            <div className="flex-1 text-center font-mono text-lg text-text-primary py-2">
              {formatPrice(maxPrice)}
            </div>
            <button
              type="button"
              onClick={incrementMax}
              disabled={maxPrice >= MAX_ALLOWED || disabled}
              className="p-3 hover:bg-neon-surface transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Aumentar máximo"
            >
              <IconChevronUp className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
