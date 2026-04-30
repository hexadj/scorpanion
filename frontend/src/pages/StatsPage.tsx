import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PieChartIcon from '@mui/icons-material/PieChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { Box, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { PageContainer } from '../components';
import { DistributionSection } from '../components/stats/sections/DistributionSection';
import { RankingsSection } from '../components/stats/sections/RankingsSection';
import { TimeseriesSection } from '../components/stats/sections/TimeseriesSection';
import { StatsFilterBar } from '../components/stats/StatsFilterBar';
import { useStatsFilters } from '../hooks';

const TABS = [
  { icon: <ShowChartIcon />, label: 'Évolution temporelle' },
  { icon: <EmojiEventsIcon />, label: 'Classement' },
  { icon: <PieChartIcon />, label: 'Distribution' },
] as const;

export const StatsPage = () => {
  const [tab, setTab] = useState(0);
  const { filters, period, setPeriod } = useStatsFilters();

  return (
    <PageContainer title="Statistiques">
      <StatsFilterBar period={period} onPeriodChange={setPeriod} />
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        {TABS.map((t) => (
          <Tooltip key={t.label} title={t.label} placement="bottom">
            <Tab icon={t.icon} aria-label={t.label} />
          </Tooltip>
        ))}
      </Tabs>
      {tab === 0 && <TimeseriesSection globalFilters={filters} period={period} />}
      {tab === 1 && <RankingsSection globalFilters={filters} />}
      {tab === 2 && <DistributionSection globalFilters={filters} />}
    </PageContainer>
  );
};
