import { Box, Typography, useTheme } from '@mui/material';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

type DonutRow = {
  label: string;
  count: number;
  share: number;
  isOthers: boolean;
};

type DistributionDonutChartProps = {
  rows: DonutRow[];
  totalCount: number;
};

const PALETTE = [
  '#1d4ed8',
  '#059669',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#0891b2',
  '#65a30d',
  '#db2777',
];

const OTHERS_COLOR = '#9ca3af';

export const DistributionDonutChart = ({ rows, totalCount }: DistributionDonutChartProps) => {
  const theme = useTheme();

  const data = rows.map((row) => ({
    name: row.label,
    value: row.count,
    share: row.share,
    isOthers: row.isOthers,
  }));

  return (
    <Box sx={{ position: 'relative' }}>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="75%"
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={entry.isOthers ? OTHERS_COLOR : PALETTE[index % PALETTE.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, _name: string, props: { payload?: { share: number } }) => {
              const share = props.payload?.share ?? 0;
              return [`${value.toLocaleString('fr-FR')} (${share} %)`, 'Parties'];
            }}
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 4,
            }}
          />
          <Legend
            iconType="circle"
            iconSize={10}
            wrapperStyle={{ fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -60%)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <Typography variant="h5" component="span" fontWeight="bold">
          {totalCount.toLocaleString('fr-FR')}
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          parties
        </Typography>
      </Box>
    </Box>
  );
};
