import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';

interface Shipment {
  id: string;
  request: {
    id: string;
    company: { name: string };
    pickupAddress: { city: string };
    deliveryAddress: { city: string };
    cargos: any[];
  };
  status: { name: string };
}

interface LtlShipment {
    id: string;
    status: string;
    consolidatedWeight: number;
    consolidatedVolume: number;
    shipments: Shipment[];
}

const LtlManagement: React.FC = () => {
  const [availableShipments, setAvailableShipments] = useState<Shipment[]>([]);
  const [ltlShipments, setLtlShipments] = useState<LtlShipment[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [shipRes, ltlRes] = await Promise.all([
        api.get('/shipment'),
        api.get('/ltl-shipment'),
      ]);

      // Only shipments in 'Запланирована' that are NOT already in LTL
      setAvailableShipments(shipRes.data.filter((s: any) =>
        s.status.name === 'Запланирована' && !s.ltlShipment
      ));
      setLtlShipments(ltlRes.data);
    } catch (err: any) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggle = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCreateLtl = async () => {
    if (selectedIds.length === 0) return;
    try {
      await api.post('/ltl-shipment', {
        shipmentIds: selectedIds,
        notes: `Created from UI at ${new Date().toLocaleString()}`,
      });
      setMessage('LTL Shipment created successfully!');
      setSelectedIds([]);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create LTL Shipment');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
      try {
          await api.patch(`/ltl-shipment/${id}/status`, { status });
          setMessage(`LTL Shipment status updated to ${status}`);
          fetchData();
      } catch (err: any) {
          setError('Failed to update status');
      }
  }

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>LTL Management (Consolidation)</Typography>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" onClose={() => setMessage(null)} sx={{ mb: 2 }}>{message}</Alert>}

      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Available Shipments for Consolidation</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox"></TableCell>
                <TableCell>Shipment ID</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Route</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {availableShipments.map((s) => (
                <TableRow key={s.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                        checked={selectedIds.includes(s.id)}
                        onChange={() => handleToggle(s.id)}
                    />
                  </TableCell>
                  <TableCell>{s.id.substring(0, 8)}...</TableCell>
                  <TableCell>{s.request.company.name}</TableCell>
                  <TableCell>{s.request.pickupAddress.city} — {s.request.deliveryAddress.city}</TableCell>
                  <TableCell>{s.status.name}</TableCell>
                </TableRow>
              ))}
              {availableShipments.length === 0 && (
                  <TableRow><TableCell colSpan={5} align="center">No shipments available for consolidation</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Button
            variant="contained"
            sx={{ mt: 2 }}
            disabled={selectedIds.length === 0}
            onClick={handleCreateLtl}
        >
            Consolidate Selected ({selectedIds.length})
        </Button>
      </Paper>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" gutterBottom>Active LTL Shipments (Consolidated)</Typography>
      {ltlShipments.map(ltl => (
          <Paper key={ltl.id} sx={{ p: 2, mb: 2, borderLeft: '5px solid #1976d2' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1"><strong>LTL ID: {ltl.id.substring(0,8)}</strong></Typography>
                <Typography>Status: <strong>{ltl.status}</strong></Typography>
              </Box>
              <Typography variant="body2">Weight: {ltl.consolidatedWeight} kg | Volume: {ltl.consolidatedVolume} m³</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>Contains {ltl.shipments.length} shipments</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                  {ltl.status === 'Формируется' && (
                      <Button size="small" variant="outlined" onClick={() => handleUpdateStatus(ltl.id, 'В пути')}>Start Transit</Button>
                  )}
                  {ltl.status === 'В пути' && (
                      <Button size="small" variant="outlined" color="success" onClick={() => handleUpdateStatus(ltl.id, 'Завершен')}>Complete Delivery</Button>
                  )}
              </Box>
          </Paper>
      ))}
    </Box>
  );
};

export default LtlManagement;
