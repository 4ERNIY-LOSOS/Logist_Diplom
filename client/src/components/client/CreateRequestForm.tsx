import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  IconButton,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { requestService } from '../../services/request.service';

const addressSchema = z.object({
  country: z.string().min(2, 'Обязательное поле'),
  city: z.string().min(2, 'Обязательное поле'),
  street: z.string().min(2, 'Обязательное поле'),
  houseNumber: z.string().min(1, 'Обязательное поле'),
  apartment: z.string().optional(),
  postalCode: z.string().min(3, 'Обязательное поле'),
});

const cargoSchema = z.object({
  name: z.string().min(2, 'Название груза обязательно'),
  description: z.string().optional(),
  weight: z.number().min(0, 'Вес должен быть положительным'),
  volume: z.number().min(0, 'Объем должен быть положительным'),
  type: z.string().min(1, 'Выберите тип груза'),
});

const requestSchema = z.object({
  pickupDate: z.string().min(1, 'Дата забора обязательна'),
  deliveryDate: z.string().min(1, 'Дата доставки обязательна'),
  pickupAddress: addressSchema,
  deliveryAddress: addressSchema,
  cargos: z.array(cargoSchema).min(1, 'Добавьте хотя бы один груз'),
  notes: z.string().optional(),
});

type RequestFormValues = z.infer<typeof requestSchema>;

interface CreateRequestFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CreateRequestForm: React.FC<CreateRequestFormProps> = ({ onSuccess, onCancel }) => {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      pickupDate: new Date().toISOString().split('T')[0],
      deliveryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      cargos: [{ name: '', weight: 0, volume: 0, type: 'Обычный' }],
      pickupAddress: { country: 'Россия', city: '', street: '', houseNumber: '', postalCode: '' },
      deliveryAddress: { country: 'Россия', city: '', street: '', houseNumber: '', postalCode: '' },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'cargos',
  });

  const onSubmit = async (data: RequestFormValues) => {
    setError(null);
    try {
      await requestService.create({
        ...data,
        pickupDate: new Date(data.pickupDate).toISOString(),
        deliveryDate: new Date(data.deliveryDate).toISOString(),
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Ошибка при создании заявки');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Новая заявка на перевозку
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={4}>
        {/* Dates */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>Сроки</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="Дата забора"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    {...register('pickupDate')}
                    error={!!errors.pickupDate}
                    helperText={errors.pickupDate?.message}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="Дата доставки"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    {...register('deliveryDate')}
                    error={!!errors.deliveryDate}
                    helperText={errors.deliveryDate?.message}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
           <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>Дополнительно</Typography>
              <TextField
                fullWidth
                label="Примечания"
                multiline
                rows={2}
                {...register('notes')}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Addresses */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" gutterBottom sx={{ ml: 1 }}>Пункт отправления</Typography>
          <Card variant="outlined">
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Страна" {...register('pickupAddress.country')} error={!!errors.pickupAddress?.country} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Город" {...register('pickupAddress.city')} error={!!errors.pickupAddress?.city} />
                </Grid>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <TextField fullWidth label="Улица" {...register('pickupAddress.street')} error={!!errors.pickupAddress?.street} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField fullWidth label="Дом" {...register('pickupAddress.houseNumber')} error={!!errors.pickupAddress?.houseNumber} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Индекс" {...register('pickupAddress.postalCode')} error={!!errors.pickupAddress?.postalCode} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" gutterBottom sx={{ ml: 1 }}>Пункт назначения</Typography>
          <Card variant="outlined">
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Страна" {...register('deliveryAddress.country')} error={!!errors.deliveryAddress?.country} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Город" {...register('deliveryAddress.city')} error={!!errors.deliveryAddress?.city} />
                </Grid>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <TextField fullWidth label="Улица" {...register('deliveryAddress.street')} error={!!errors.deliveryAddress?.street} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField fullWidth label="Дом" {...register('deliveryAddress.houseNumber')} error={!!errors.deliveryAddress?.houseNumber} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Индекс" {...register('deliveryAddress.postalCode')} error={!!errors.deliveryAddress?.postalCode} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cargos */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Грузы</Typography>
            <Button startIcon={<AddIcon />} onClick={() => append({ name: '', weight: 0, volume: 0, type: 'Обычный' })}>
              Добавить груз
            </Button>
          </Box>

          {fields.map((field, index) => (
            <Card key={field.id} variant="outlined" sx={{ mb: 2, position: 'relative' }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <TextField fullWidth label="Наименование" {...register(`cargos.${index}.name` as const)} error={!!errors.cargos?.[index]?.name} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 2 }}>
                    <TextField fullWidth label="Вес (кг)" type="number" {...register(`cargos.${index}.weight` as const, { valueAsNumber: true })} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 2 }}>
                    <TextField fullWidth label="Объем (м³)" type="number" {...register(`cargos.${index}.volume` as const, { valueAsNumber: true })} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <TextField select fullWidth label="Тип" {...register(`cargos.${index}.type` as const)} defaultValue="Обычный">
                      <MenuItem value="Обычный">Обычный</MenuItem>
                      <MenuItem value="Опасный">Опасный</MenuItem>
                      <MenuItem value="Температурный">Температурный</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 2 }}>
                    <IconButton color="error" onClick={() => remove(index)} disabled={fields.length === 1}>
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
          {errors.cargos?.root && <Typography color="error">{errors.cargos.root.message}</Typography>}
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="outlined" onClick={onCancel}>Отмена</Button>
        <Button variant="contained" type="submit" disabled={isSubmitting}>
          {isSubmitting ? <CircularProgress size={24} /> : 'Создать заявку'}
        </Button>
      </Box>
    </Box>
  );
};

export default CreateRequestForm;
