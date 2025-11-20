import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#8b5cf6', '#6366f1', '#ec4899', '#f43f5e', '#f59e0b'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {data.name}
        </p>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {`${data.value.toFixed(1)}% (${data.count} ${data.votes})`}
        </p>
      </div>
    );
  }
  return null;
};

function PriceRangePieChart({ votes }) {
  const { t } = useTranslation();

  // Process votes data for the chart
  const chartData = useMemo(() => {
    const totalVotes = votes.reduce((sum, range) => sum + range.count, 0);

    return votes.map(range => ({
      name: `${range.min} - ${range.max} ${range.currency}`,
      value: (range.count / totalVotes) * 100,
      count: range.count,
      votes: t('priceRange.votes')
    }));
  }, [votes, t]);

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
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

PriceRangePieChart.propTypes = {
  votes: PropTypes.arrayOf(
    PropTypes.shape({
      min: PropTypes.number.isRequired,
      max: PropTypes.number.isRequired,
      currency: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    })
  ).isRequired,
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
};

export default PriceRangePieChart;