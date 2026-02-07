import React, { useState } from 'react';
import api from '../../api/api';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  MenuItem,
  IconButton,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';

// Interfaces remain the same for now
interface CargoItem {
  name: string;
  description?: string;
  weight: number;
  volume: number;
  type: string;
}
interface Address {
  country: string;
  city: string;
  street: string;
  houseNumber: string;
  apartment?: string;
  postalCode: string;
}

interface CreateRequestFormProps {
  onSuccess: () => void;
}

const CreateRequestForm: React.FC<CreateRequestFormProps> = ({ onSuccess }) => {
    // ... (state and handlers remain the same)
    const [pickupDate, setPickupDate] = useState('');
    const [deliveryDate, setDeliveryDate] = useState('');
    const [pickupAddress, setPickupAddress] = useState<Address>({ country: '', city: '', street: '', houseNumber: '', postalCode: '' });
    const [deliveryAddress, setDeliveryAddress] = useState<Address>({ country: '', city: '', street: '', houseNumber: '', postalCode: '' });
    const [cargos, setCargos] = useState<CargoItem[]>([{ name: '', weight: 0, volume: 0, type: 'General' }]);
    const [notes, setNotes] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
  
    const handleCargoChange = (index: number, field: keyof CargoItem, value: string | number) => {
      const newCargos = [...cargos];
      if (field === 'weight' || field === 'volume') {
        newCargos[index][field] = Number(value) < 0 ? 0 : Number(value);
      } else {
        newCargos[index][field] = value as string;
      }
      setCargos(newCargos);
    };
  
    const addCargo = () => setCargos([...cargos, { name: '', weight: 0, volume: 0, type: 'General' }]);
    const removeCargo = (index: number) => setCargos(cargos.filter((_, i) => i !== index));
  
    const handleAddressChange = (type: 'pickup' | 'delivery', field: keyof Address, value: string) => {
      const setter = type === 'pickup' ? setPickupAddress : setDeliveryAddress;
      setter(prev => ({ ...prev, [field]: value }));
    };
    
    const resetForm = () => {
      setPickupDate('');
      setDeliveryDate('');
      setPickupAddress({ country: '', city: '', street: '', houseNumber: '', postalCode: '' });
      setDeliveryAddress({ country: '', city: '', street: '', houseNumber: '', postalCode: '' });
      setCargos([{ name: '', weight: 0, volume: 0, type: 'General' }]);
      setNotes('');
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage(null);
      setError(null);
      try {
        await api.post('/request', { pickupDate, deliveryDate, pickupAddress, deliveryAddress, cargos, notes });
        setMessage('Заявка успешно создана!');
        resetForm();
        onSuccess(); // Call the success handler
      } catch (err: any) {
        setError(err.response?.data?.message || 'Не удалось создать заявку.');
      }
    };


  const AddressFields: React.FC<{ type: 'pickup' | 'delivery' }> = ({ type }) => {
    const address = type === 'pickup' ? pickupAddress : deliveryAddress;
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField fullWidth label="Страна" value={address.country} onChange={e => handleAddressChange(type, 'country', e.target.value)} required />
        <TextField fullWidth label="Город" value={address.city} onChange={e => handleAddressChange(type, 'city', e.target.value)} required />
        <TextField fullWidth label="Улица" value={address.street} onChange={e => handleAddressChange(type, 'street', e.target.value)} required />
        <TextField fullWidth label="Номер дома" value={address.houseNumber} onChange={e => handleAddressChange(type, 'houseNumber', e.target.value)} required />
        <TextField fullWidth label="Квартира/офис (необязательно)" value={address.apartment || ''} onChange={e => handleAddressChange(type, 'apartment', e.target.value)} />
        <TextField fullWidth label="Почтовый индекс" value={address.postalCode} onChange={e => handleAddressChange(type, 'postalCode', e.target.value)} required />
      </Box>
    );
  };

  return (
    <Box component={Paper} sx={{ p: 4, my: 2 }}>
      <Typography variant="h5" gutterBottom>Создание новой заявки</Typography>
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        
        <Box>
          <Typography variant="h6">Даты</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField fullWidth type="date" label="Дата забора" value={pickupDate} onChange={e => setPickupDate(e.target.value)} required InputLabelProps={{ shrink: true }} />
            <TextField fullWidth type="date" label="Дата доставки" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} required InputLabelProps={{ shrink: true }} />
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
            <Box sx={{ flex: 1 }}>
                <Typography variant="h6">Адрес забора</Typography>
                <AddressFields type="pickup" />
            </Box>
            <Box sx={{ flex: 1 }}>
                <Typography variant="h6">Адрес доставки</Typography>
                <AddressFields type="delivery" />
            </Box>
        </Box>

        <Box>
          <Typography variant="h6">Информация о грузе</Typography>
          {cargos.map((cargo, index) => (
            <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2, position: 'relative' }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <TextField sx={{ flex: '1 1 48%'}} label="Наименование" value={cargo.name} onChange={e => handleCargoChange(index, 'name', e.target.value)} required />
                    <TextField sx={{ flex: '1 1 48%'}} label="Описание (необязательно)" value={cargo.description || ''} onChange={e => handleCargoChange(index, 'description', e.target.value)} />
                    <TextField sx={{ flex: '1 1 23%'}} type="number" label="Вес (кг)" value={cargo.weight} onChange={e => handleCargoChange(index, 'weight', e.target.value)} required />
                    <TextField sx={{ flex: '1 1 23%'}} type="number" label="Объем (м³)" value={cargo.volume} onChange={e => handleCargoChange(index, 'volume', e.target.value)} required />
                    <TextField sx={{ flex: '1 1 48%'}} select label="Тип" value={cargo.type} onChange={e => handleCargoChange(index, 'type', e.target.value)} required>
                      <MenuItem value="General">Обычный</MenuItem>
                      <MenuItem value="Dangerous">Опасный</MenuItem>
                      <MenuItem value="Perishable">Скоропортящийся</MenuItem>
                    </TextField>
                </Box>
              {cargos.length > 1 && (
                  <IconButton onClick={() => removeCargo(index)} size="small" sx={{ position: 'absolute', top: 8, right: 8 }}>
                      <DeleteIcon />
                  </IconButton>
              )}
            </Paper>
          ))}
          <Button startIcon={<AddCircleIcon />} onClick={addCargo}>Добавить груз</Button>
        </Box>

        <Box>
          <Typography variant="h6">Примечания</Typography>
          <TextField fullWidth multiline rows={3} label="Примечания (необязательно)" value={notes} onChange={e => setNotes(e.target.value)} />
        </Box>
        
        <Button type="submit" fullWidth variant="contained" size="large">Отправить заявку</Button>
        
      </Box>
    </Box>
  );
};

export default CreateRequestForm;
