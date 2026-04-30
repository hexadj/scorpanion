import { FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import type { StatsPeriod } from '../types';
import { STATS_PERIODS, STATS_PERIOD_LABELS } from '../types';

type StatsFilterBarProps = {
  period: StatsPeriod;
  onPeriodChange: (period: StatsPeriod) => void;
};

export const StatsFilterBar = ({ period, onPeriodChange }: StatsFilterBarProps) => (
  <Stack
    direction={{ xs: 'column', sm: 'row' }}
    spacing={2}
    sx={{
      mb: 3,
      p: 2,
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1,
      backgroundColor: 'background.paper',
    }}
  >
    <FormControl size="small" sx={{ width: { xs: '100%', sm: 200 } }}>
      <InputLabel>Période</InputLabel>
      <Select
        value={period}
        label="Période"
        onChange={(e) => onPeriodChange(e.target.value as StatsPeriod)}
      >
        {Object.values(STATS_PERIODS).map((p) => (
          <MenuItem key={p} value={p}>
            {STATS_PERIOD_LABELS[p]}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Stack>
);
