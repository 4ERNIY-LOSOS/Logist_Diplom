import React, { useEffect, useState } from 'react';
import { ltlShipmentService } from '../../services/ltl-shipment.service';
import { shipmentService } from '../../services/shipment.service';
import type { Shipment, LtlShipment } from '../../types';
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

const LtlManagement: React.FC = () => {
  const [availableShipments, setAvailableShipments] = useState<Shipment[]>([]);
  const [ltlShipments, setLtlShipments] = useState<LtlShipment[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [shipmentsData, ltlData] = await Promise.all([
        shipmentService.getAll(),
        ltlShipmentService.getAll(),
      ]);

      // Only shipments in 'Запланирована' that are NOT already in LTL
      setAvailableShipments(shipmentsData.filter((s) =>
        s.status.name === 'Запланирована' && !s.ltlShipment
      ));
      setLtlShipments(ltlData);
    } catch (err) {
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
      await ltlShipmentService.create({
        shipmentIds: selectedIds,
        voyageCode: `V-${Date.now()}`,
        departureDate: new Date().toISOString(),
        arrivalDate: new Date(Date.now() + 86400000).toISOString(),
        status: 'CONSOLIDATING',
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
          await ltlShipmentService.updateStatus(id, status);
          setMessage(`LTL Shipment status updated to ${status}`);
          fetchData();
      } catch (err) {
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
