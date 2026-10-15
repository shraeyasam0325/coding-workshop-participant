import PropTypes from 'prop-types';
import {
  Box, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import useApi from '../hooks/useApi';
import { api } from '../services/api';
import PageHeader from '../components/PageHeader';
import { EmptyState, ErrorState, Loading } from '../components/StateViews';
import { formatDate, ROLE_LABEL } from '../utils/format';

function DetailsCell({ value }) {
  if (!value || typeof value !== 'object') return '—';
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {Object.entries(value).map(([key, val]) => (
        <Chip key={key} label={`${key}: ${String(val)}`} size="small" variant="outlined" />
      ))}
    </Box>
  );
}

DetailsCell.propTypes = { value: PropTypes.object };

export default function ActivityPage() {
  const { data, loading, error, reload } = useApi(() => api.get('/activity'), []);

  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading && !data) return <Loading label="Loading activity log" />;

  return (
    <>
      <PageHeader
        title="Activity log"
        subtitle="Admin-only audit trail of major actions across the tracker."
      />
      {!data?.length ? (
        <EmptyState title="No activity yet">Actions will appear here as people create projects, log time and update records.</EmptyState>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Actor</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Milestone</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id} sx={{ verticalAlign: 'top' }}>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(row.created_at)}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 700 }}>{row.actor_name}</Typography>
                    <Typography variant="body2" color="text.secondary">{row.actor_username} · {ROLE_LABEL[row.actor_role]}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={row.action.replace(/_/g, ' ')} size="small" />
                  </TableCell>
                  <TableCell>{row.project_name || row.project_id || '—'}</TableCell>
                  <TableCell>{row.milestone_name || row.milestone_id || '—'}</TableCell>
                  <TableCell><DetailsCell value={row.details} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}
