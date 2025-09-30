import React from 'react';
import Card from '../ui/Card';

interface UsageDataPoint {
  date: string;
  usage: number;
  additions: number;
  reductions: number;
}

interface UsageChartProps {
  data: UsageDataPoint[];
  title: string;
  period: 'daily' | 'weekly' | 'monthly';
}

const UsageChart: React.FC<UsageChartProps> = ({ data, title, period }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-500">No usage data available for the selected period</p>
        </div>
      </Card>
    );
  }

  const maxValue = Math.max(...data.map(d => Math.max(d.usage, d.additions, d.reductions)));
  const chartHeight = 200;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    switch (period) {
      case 'daily':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'weekly':
        return `Week ${Math.ceil(date.getDate() / 7)}`;
      case 'monthly':
        return date.toLocaleDateString('en-US', { month: 'short' });
      default:
        return date.toLocaleDateString();
    }
  };

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <div className="flex space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Usage</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Additions</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Reductions</span>
            </div>
          </div>
        </div>

        {/* Simple bar chart */}
        <div className="relative" style={{ height: chartHeight + 40 }}>
          <div className="flex items-end justify-between h-full space-x-1">
            {data.map((point, index) => {
              const usageHeight = (point.usage / maxValue) * chartHeight;
              const additionsHeight = (point.additions / maxValue) * chartHeight;
              const reductionsHeight = (point.reductions / maxValue) * chartHeight;

              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="flex items-end space-x-1 mb-2" style={{ height: chartHeight }}>
                    {/* Usage bar */}
                    <div
                      className="bg-blue-500 rounded-t w-2 hover:bg-blue-600 transition-colors"
                      style={{ height: usageHeight }}
                      title={`Usage: ${point.usage}`}
                    ></div>
                    {/* Additions bar */}
                    <div
                      className="bg-green-500 rounded-t w-2 hover:bg-green-600 transition-colors"
                      style={{ height: additionsHeight }}
                      title={`Additions: ${point.additions}`}
                    ></div>
                    {/* Reductions bar */}
                    <div
                      className="bg-red-500 rounded-t w-2 hover:bg-red-600 transition-colors"
                      style={{ height: reductionsHeight }}
                      title={`Reductions: ${point.reductions}`}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 text-center whitespace-nowrap">
                    {formatDate(point.date)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
            <span>{maxValue}</span>
            <span>{Math.round(maxValue * 0.75)}</span>
            <span>{Math.round(maxValue * 0.5)}</span>
            <span>{Math.round(maxValue * 0.25)}</span>
            <span>0</span>
          </div>
        </div>

        {/* Summary statistics */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
              {data.reduce((sum, point) => sum + point.usage, 0)}
            </div>
            <div className="text-sm text-gray-500">Total Usage</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {data.reduce((sum, point) => sum + point.additions, 0)}
            </div>
            <div className="text-sm text-gray-500">Total Additions</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-red-600">
              {data.reduce((sum, point) => sum + point.reductions, 0)}
            </div>
            <div className="text-sm text-gray-500">Total Reductions</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UsageChart;