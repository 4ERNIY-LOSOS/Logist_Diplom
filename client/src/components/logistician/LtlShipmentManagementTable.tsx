import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  CircularProgress,
  Box,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import api from '../../api/api';
import moment from 'moment';

interface Shipment {
    id: string;
    request: {
        id: string;
        pickupAddress: { city: string; street: string; };
        deliveryAddress: { city: string; street: string; };
    };
    driver: { firstName: string; lastName: string; };
    vehicle: { licensePlate: string; model: string; };
}

interface LtlShipment {
  id: string;
  voyageCode: string;
  departureDate: string;
  arrivalDate: string;
  shipments: Shipment[];
}

export const LtlShipmentManagementTable: React.FC = () => {
  const [ltlShipments, setLtlShipments] = useState<LtlShipment[]>([]);
  const [availableShipments, setAvailableShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentLtlShipment, setCurrentLtlShipment] = useState<LtlShipment | null>(null);
  const [isNewLtlShipment, setIsNewLtlShipment] = useState(false);
  const [selectedShipmentsToAdd, setSelectedShipmentsToAdd] = useState<string[]>([]);
  const [selectedShipmentsToRemove, setSelectedShipmentsToRemove] = useState<string[]>([]);


  useEffect(() => {
    fetchLtlShipmentsAndShipments();
  }, []);

  const fetchLtlShipmentsAndShipments = async () => {
    setLoading(true);
    try {
      const [ltlRes, shipmentsRes] = await Promise.all([
        api.get<LtlShipment[]>('/ltl-shipment'),
        api.get<Shipment[]>('/shipment', { params: { ltlShipmentId: 'null' } }) // Fetch shipments not yet assigned to an LTL shipment
      ]);
      setLtlShipments(ltlRes.data);
      setAvailableShipments(shipmentsRes.data.filter(s => !s.ltlShipment)); // Filter out shipments already in an LTL shipment
    } catch (err) {
      setError('Failed to fetch data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setCurrentLtlShipment({ id: '', voyageCode: '', departureDate: moment().format('YYYY-MM-DD'), arrivalDate: moment().format('YYYY-MM-DD'), shipments: [] });
    setIsNewLtlShipment(true);
    setOpenDialog(true);
  };

  const handleEditClick = (ltlShipment: LtlShipment) => {
    setCurrentLtlShipment({ ...ltlShipment });
    setIsNewLtlShipment(false);
    setSelectedShipmentsToAdd([]);
    setSelectedShipmentsToRemove([]);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setCurrentLtlShipment(null);
    setIsNewLtlShipment(false);
    setSelectedShipmentsToAdd([]);
    setSelectedShipmentsToRemove([]);
  };

  const handleDialogSave = async () => {
    if (!currentLtlShipment) return;
    try {
      if (isNewLtlShipment) {
        await api.post('/ltl-shipment', {
            ...currentLtlShipment,
            shipmentIds: selectedShipmentsToAdd,
        });
      } else {
        await api.patch(`/ltl-shipment/${currentLtlShipment.id}`, {
            ...currentLtlShipment,
            shipmentIdsToAdd: selectedShipmentsToAdd.length > 0 ? selectedShipmentsToAdd : undefined,
            shipmentIdsToRemove: selectedShipmentsToRemove.length > 0 ? selectedShipmentsToRemove : undefined,
        });
      }
      handleDialogClose();
      fetchLtlShipmentsAndShipments();
    } catch (err) {
      setError(`Failed to ${isNewLtlShipment ? 'create' : 'update'} LTL shipment.`);
      console.error(err);
    }
  };

  const handleDeleteLtlShipment = async (ltlShipmentId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту сборную перевозку? Это также отменит связь с включенными перевозками.')) {
      try {
        await api.delete(`/ltl-shipment/${ltlShipmentId}`);
        fetchLtlShipmentsAndShipments();
      } catch (err) {
        setError('Failed to delete LTL shipment.');
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <TableContainer component={Paper}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
          Создать сборную перевозку
        </Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Код рейса</TableCell>
            <TableCell>Дата отправления</TableCell>
            <TableCell>Дата прибытия</TableCell>
            <TableCell>Перевозки</TableCell>
            <TableCell>Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ltlShipments.map((ltl) => (
            <TableRow key={ltl.id}>
              <TableCell>{ltl.id.substring(0, 8)}...</TableCell>
              <TableCell>{ltl.voyageCode}</TableCell>
              <TableCell>{moment(ltl.departureDate).format('DD.MM.YYYY')}</TableCell>
              <TableCell>{moment(ltl.arrivalDate).format('DD.MM.YYYY')}</TableCell>
              <TableCell>
                {ltl.shipments.map(s => (
                  <Chip key={s.id} label={`${s.request.id.substring(0,4)}... (${s.driver.firstName} ${s.driver.lastName})`} sx={{ m: 0.5 }} />
                ))}
              </TableCell>
              <TableCell>
                <IconButton color="primary" onClick={() => handleEditClick(ltl)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDeleteLtlShipment(ltl.id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>{isNewLtlShipment ? 'Создать сборную перевозку' : 'Редактировать сборную перевозку'}</DialogTitle>
        <DialogContent>
          {currentLtlShipment && (
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Код рейса"
                value={currentLtlShipment.voyageCode}
                onChange={(e) => setCurrentLtlShipment({ ...currentLtlShipment, voyageCode: e.target.value })}
                fullWidth
                margin="dense"
              />
              <TextField
                label="Дата отправления"
                type="date"
                value={moment(currentLtlShipment.departureDate).format('YYYY-MM-DD')}
                onChange={(e) => setCurrentLtlShipment({ ...currentLtlShipment, departureDate: e.target.value })}
                fullWidth
                margin="dense"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Дата прибытия"
                type="date"
                value={moment(currentLtlShipment.arrivalDate).format('YYYY-MM-DD')}
                onChange={(e) => setCurrentLtlShipment({ ...currentLtlShipment, arrivalDate: e.target.value })}
                fullWidth
                margin="dense"
                InputLabelProps={{ shrink: true }}
              />

              {!isNewLtlShipment && (
                <Box>
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Текущие перевозки</Typography>
                    {currentLtlShipment.shipments.length === 0 ? (
                        <Typography variant="body2">Нет связанных перевозок.</Typography>
                    ) : (
                        currentLtlShipment.shipments.map(s => (
                            <Chip
                                key={s.id}
                                label={`${s.request.id.substring(0,4)}... (${s.driver.firstName} ${s.driver.lastName})`}
                                onDelete={() => setSelectedShipmentsToRemove([...selectedShipmentsToRemove, s.id])}
                                color={selectedShipmentsToRemove.includes(s.id) ? "error" : "default"}
                                sx={{ m: 0.5 }}
                            />
                        ))
                    )}
                </Box>
              )}

              <FormControl fullWidth margin="dense">
                <InputLabel>Добавить перевозки</InputLabel>
                <Select
                  multiple
                  value={selectedShipmentsToAdd}
                  onChange={(e) => setSelectedShipmentsToAdd(e.target.value as string[])}
                  label="Добавить перевозки"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const shipment = availableShipments.find(s => s.id === value);
                        return shipment ? <Chip key={value} label={`${shipment.request.id.substring(0,4)}... (${shipment.driver.firstName} ${shipment.driver.lastName})`} /> : null;
                      })}
                    </Box>
                  )}
                >
                  {availableShipments
                    .filter(s => !currentLtlShipment?.shipments.some(cs => cs.id === s.id) && !selectedShipmentsToAdd.includes(s.id))
                    .map((shipment) => (
                      <MenuItem key={shipment.id} value={shipment.id}>
                        {`${shipment.request.id.substring(0,8)}... (${shipment.driver.firstName} ${shipment.driver.lastName} - ${shipment.vehicle.model})`}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Отмена</Button>
          <Button onClick={handleDialogSave} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>
    </TableContainer>
  );
};
