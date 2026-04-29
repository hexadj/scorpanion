import { useTheme } from '@mui/material';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type BarChartRow = {
  label: string;
  count: number;
  share: number;
};

type DistributionBarChartProps = {
  rows: BarChartRow[];
  color?: string;
};

export const DistributionBarChart = ({ rows, color }: DistributionBarChartProps) => {
  const theme = useTheme();
  const barColor = color ?? theme.palette.secondary.main;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={rows} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          formatter={(value: number, _name: string, props: { payload?: { share: number } }) => {
            const share = props.payload?.share ?? 0;
            return [`${value.toLocaleString('fr-FR')} (${share} %)`, 'Effectif'];
          }}
          labelStyle={{ color: theme.palette.text.primary }}
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 4,
          }}
        />
        <Bar dataKey="count" fill={barColor} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
