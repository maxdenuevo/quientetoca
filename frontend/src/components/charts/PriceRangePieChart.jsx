import { useMemo } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * PriceRangePieChart - Neon Editorial Design
 *
 * Pie chart for vote distribution with neon colors.
 */

// Neon accent colors
const COLORS = ['#7B5CFF', '#C8FF00', '#FF4444', '#00FFFF', '#FF00FF'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-neon-surface p-3 border border-neon-border">
        <p className="text-sm text-text-secondary font-mono">
          {data.name}
        </p>
        <p className="text-sm font-headline font-semibold text-text-primary">
          {`${data.value.toFixed(1)}% (${data.count} ${data.votes})`}
        </p>
      </div>
    );
  }
  return null;
};

function PriceRangePieChart({ votes = [] }) {
  const chartData = useMemo(() => {
    if (!votes || votes.length === 0) {
      return [];
    }

    const totalVotes = votes.reduce((sum, range) => sum + range.count, 0);

    if (totalVotes === 0) {
      return [];
    }

    return votes.map(range => ({
      name: `${range.min} - ${range.max} ${range.currency}`,
      value: (range.count / totalVotes) * 100,
      count: range.count,
      votes: 'votos'
    }));
  }, [votes]);

  if (chartData.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <p className="text-text-secondary text-sm font-mono">
          No hay votos aun
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            formatter={(value) => (
              <span className="text-sm text-text-secondary font-mono">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PriceRangePieChart;
