import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

// Interfaces can be more detailed
interface Driver { id: string; firstName: string; lastName: string; }
interface Vehicle { id: string; licensePlate: string; model: string; }
interface Request {
  id: string;
  pickupDate: string;
  deliveryDate: string;
  company: { name: string };
  pickupAddress: { city: string; street: string; };
  deliveryAddress: { city: string; street: string; };
}

const ProcessRequestForm: React.FC = () => {
    // ... (state and handlers remain the same)
    const { requestId } = useParams<{ requestId: string }>();
    const navigate = useNavigate();
  
    const [request, setRequest] = useState<Request | null>(null);
    const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
    const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
    const [selectedDriver, setSelectedDriver] = useState<string>('');
    const [selectedVehicle, setSelectedVehicle] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchData = async () => {
        if (!requestId) {
          setError('ID заявки отсутствует.');
          setLoading(false);
          return;
        }
        try {
          const [reqRes, driversRes, vehiclesRes] = await Promise.all([
            api.get(`/request/${requestId}`),
            api.get('/driver?isAvailable=true'),
            api.get('/vehicle?isAvailable=true'),
          ]);
          setRequest(reqRes.data);
          setAvailableDrivers(driversRes.data);
          setAvailableVehicles(vehiclesRes.data);
        } catch (err: any) {
          setError(err.response?.data?.message || 'Не удалось загрузить данные.');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [requestId]);
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setMessage(null);
      if (!selectedDriver || !selectedVehicle || !request) {
        setError('Пожалуйста, выберите водителя и транспортное средство.');
        return;
      }
      try {
        await api.post('/shipment', {
          requestId,
          driverId: selectedDriver,
          vehicleId: selectedVehicle,
          plannedPickupDate: request.pickupDate,
          plannedDeliveryDate: request.deliveryDate,
        });
        setMessage('Перевозка успешно создана! Перенаправление...');
        setTimeout(() => navigate('/logistician/dashboard'), 2000);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Не удалось создать перевозку.');
      }
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
    }
    
    if (error && !request) { // Show fatal error if request couldn't be loaded
        return <Alert severity="error">{error}</Alert>;
    }


  return (
    <Box component={Paper} sx={{ p: 4, my: 2, maxWidth: '800px', mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Обработка заявки: {request?.id.substring(0, 8)}...
      </Typography>
      {request && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6">Детали заявки</Typography>
            <Typography><strong>Клиент:</strong> {request.company.name}</Typography>
            <Typography><strong>Забор:</strong> {request.pickupAddress.city}, {request.pickupAddress.street} on {new Date(request.pickupDate).toLocaleDateString()}</Typography>
            <Typography><strong>Доставка:</strong> {request.deliveryAddress.city}, {request.deliveryAddress.street} on {new Date(request.deliveryDate).toLocaleDateString()}</Typography>
        </Paper>
      )}
      
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        <FormControl fullWidth required>
            <InputLabel id="driver-select-label">Выберите водителя</InputLabel>
            <Select labelId="driver-select-label" value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)} label="Выберите водителя">
            <MenuItem value=""><em>-- Выберите водителя --</em></MenuItem>
            {availableDrivers.map((driver) => (
                <MenuItem key={driver.id} value={driver.id}>
                {driver.firstName} {driver.lastName}
                </MenuItem>
            ))}
            </Select>
        </FormControl>
        
        <FormControl fullWidth required>
            <InputLabel id="vehicle-select-label">Выберите транспорт</InputLabel>
            <Select labelId="vehicle-select-label" value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)} label="Выберите транспорт">
            <MenuItem value=""><em>-- Выберите транспорт --</em></MenuItem>
            {availableVehicles.map((vehicle) => (
                <MenuItem key={vehicle.id} value={vehicle.id}>
                {vehicle.model} ({vehicle.licensePlate})
                </MenuItem>
            ))}
            </Select>
        </FormControl>

        <Button type="submit" fullWidth variant="contained" size="large">Создать перевозку</Button>
        
      </Box>
    </Box>
  );
};

export default ProcessRequestForm;
