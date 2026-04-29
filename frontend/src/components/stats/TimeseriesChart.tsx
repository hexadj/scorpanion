import { useTheme } from '@mui/material';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TimeseriesPoint } from '../../types';

type TimeseriesChartProps = {
  series: TimeseriesPoint[];
  interval: 'week' | 'month';
};

const formatBucketStart = (bucketStart: string, interval: 'week' | 'month'): string => {
  const date = new Date(bucketStart);
  if (interval === 'month') {
    return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
  }
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
};

export const TimeseriesChart = ({ series, interval }: TimeseriesChartProps) => {
  const theme = useTheme();

  const data = series.map((point) => ({
    bucketStart: point.bucketStart,
    value: point.value,
    sampleSize: point.sampleSize,
    label: formatBucketStart(point.bucketStart, interval),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          formatter={(value: number | null, _name: string, props: { payload?: { sampleSize: number } }) => {
            const sampleSize = props.payload?.sampleSize ?? 0;
            return [
              value === null ? '—' : value.toLocaleString('fr-FR'),
              `Valeur (${sampleSize} entrées)`,
            ];
          }}
          labelStyle={{ color: theme.palette.text.primary }}
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 4,
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={theme.palette.primary.main}
          strokeWidth={2}
          dot={false}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
