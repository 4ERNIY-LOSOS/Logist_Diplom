import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { requestService } from '../../services/request.service';
import { shipmentService } from '../../services/shipment.service';
import type { LogisticRequest } from '../../types';

const processSchema = z.object({
  driverId: z.string().uuid('Выберите водителя'),
  vehicleId: z.string().uuid('Выберите транспорт'),
  plannedPickupDate: z.string().min(1, 'Дата обязательна'),
  plannedDeliveryDate: z.string().min(1, 'Дата обязательна'),
  finalCost: z.number().min(0, 'Цена должна быть положительной'),
});

type ProcessFormValues = z.infer<typeof processSchema>;

const ProcessRequestForm: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<LogisticRequest | null>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProcessFormValues>({
    resolver: zodResolver(processSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!requestId) return;
      try {
        const [reqData, driversData, vehiclesData] = await Promise.all([
          requestService.getById(requestId),
          shipmentService.getDrivers(),
          shipmentService.getVehicles(),
        ]);
        setRequest(reqData);
        setDrivers(driversData);
        setVehicles(vehiclesData);

        setValue('plannedPickupDate', new Date(reqData.pickupDate).toISOString().split('T')[0]);
        setValue('plannedDeliveryDate', new Date(reqData.deliveryDate).toISOString().split('T')[0]);
        setValue('finalCost', Number(reqData.preliminaryCost) || 0);
      } catch (err: any) {
        setError(err.message || 'Ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [requestId, setValue]);

  const onSubmit = async (data: ProcessFormValues) => {
    if (!requestId) return;
    setError(null);
    try {
      // Single atomic call to create shipment from request with final cost
      await shipmentService.create({
        requestId,
        driverId: data.driverId,
        vehicleId: data.vehicleId,
        plannedPickupDate: new Date(data.plannedPickupDate).toISOString(),
        plannedDeliveryDate: new Date(data.plannedDeliveryDate).toISOString(),
        finalCost: data.finalCost,
      } as any);

      navigate('/logistician/dashboard');
    } catch (err: any) {
      setError(err.message || 'Ошибка при обработке заявки');
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>;
  if (!request) return <Typography>Заявка не найдена</Typography>;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Обработка заявки #{request.id.slice(0, 8)}
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Детали заявки</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">Компания</Typography>
                <Typography variant="body1">{request.company.name}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">Маршрут</Typography>
                <Typography variant="body1">{request.pickupAddress.city} → {request.deliveryAddress.city}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">Груз</Typography>
                {request.cargos.map(c => (
                  <Typography key={c.id} variant="body2">• {c.name} ({c.weight} кг, {c.volume} м³)</Typography>
                ))}
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Предварительная цена</Typography>
                <Typography variant="h6" color="primary">{request.preliminaryCost} ₽</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined">
            <CardContent component="form" onSubmit={handleSubmit(onSubmit)}>
              <Typography variant="h6" gutterBottom>Назначение ресурсов</Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    select
                    fullWidth
                    label="Водитель"
                    {...register('driverId')}
                    error={!!errors.driverId}
                    helperText={errors.driverId?.message}
                    defaultValue=""
                  >
                    {drivers.filter(d => d.status === 'AVAILABLE').map(d => (
                      <MenuItem key={d.id} value={d.id}>{d.firstName} {d.lastName}</MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    select
                    fullWidth
                    label="Транспортное средство"
                    {...register('vehicleId')}
                    error={!!errors.vehicleId}
                    helperText={errors.vehicleId?.message}
                    defaultValue=""
                  >
                    {vehicles.filter(v => v.status === 'AVAILABLE').map(v => (
                      <MenuItem key={v.id} value={v.id}>{v.model} ({v.licensePlate})</MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="План. дата забора"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    {...register('plannedPickupDate')}
                    error={!!errors.plannedPickupDate}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="План. дата доставки"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    {...register('plannedDeliveryDate')}
                    error={!!errors.plannedDeliveryDate}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Финальная стоимость (₽)"
                    type="number"
                    {...register('finalCost', { valueAsNumber: true })}
                    error={!!errors.finalCost}
                    helperText={errors.finalCost?.message}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button variant="contained" type="submit" fullWidth disabled={isSubmitting}>
                  {isSubmitting ? <CircularProgress size={24} /> : 'Подтвердить и создать рейс'}
                </Button>
                <Button variant="outlined" fullWidth onClick={() => navigate(-1)}>Отмена</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProcessRequestForm;
