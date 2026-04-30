import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import type { RankingRow, StatsMetric } from '../types';
import { STATS_METRIC_LABELS } from '../types';

type RankingsTableProps = {
  rows: RankingRow[];
  metric: StatsMetric;
  total: number;
  limit: number;
  offset: number;
  onPageChange: (newOffset: number) => void;
  onRowsPerPageChange: (newLimit: number) => void;
};

const formatValue = (value: number | null, metric: StatsMetric): string => {
  if (value === null) return '—';
  if (metric === 'winRate') return `${value} %`;
  if (metric === 'averageRank') return value.toLocaleString('fr-FR');
  return value.toLocaleString('fr-FR');
};

export const RankingsTable = ({
  rows,
  metric,
  total,
  limit,
  offset,
  onPageChange,
  onRowsPerPageChange,
}: RankingsTableProps) => {
  const showParticipationCount = metric === 'winRate' || metric === 'winCount';

  return (
    <>
      <Box sx={{ overflowX: 'auto' }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 48, color: 'text.secondary' }}>#</TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>Joueur</TableCell>
              <TableCell align="right" sx={{ color: 'text.secondary' }}>
                {STATS_METRIC_LABELS[metric]}
              </TableCell>
              {showParticipationCount ? (
                <TableCell align="right" sx={{ color: 'text.secondary' }}>
                  Participations
                </TableCell>
              ) : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.player.id}
                sx={{ opacity: row.hasValue ? 1 : 0.45 }}
              >
                <TableCell>
                  <Typography
                    variant="body2"
                    color={row.rank === 1 ? 'primary' : 'text.primary'}
                    sx={{ fontWeight: row.rank === 1 ? 'bold' : 'normal' }}
                  >
                    {row.rank ?? '—'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{row.player.name}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">{formatValue(row.value, metric)}</Typography>
                </TableCell>
                {showParticipationCount ? (
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">
                      {row.participationCount != null ? row.participationCount.toLocaleString('fr-FR') : '—'}
                    </Typography>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      </Box>
      <TablePagination
        component="div"
        count={total}
        page={limit > 0 ? Math.floor(offset / limit) : 0}
        rowsPerPage={limit}
        rowsPerPageOptions={[10, 20, 50]}
        onPageChange={(_, page) => onPageChange(page * limit)}
        onRowsPerPageChange={(e) => onRowsPerPageChange(Number(e.target.value))}
        labelRowsPerPage="Lignes :"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
      />
    </>
  );
};
