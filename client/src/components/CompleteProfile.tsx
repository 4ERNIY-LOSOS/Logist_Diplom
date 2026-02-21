import React, { useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';

const companySchema = zod.object({
  name: zod.string().min(2, 'Название компании слишком короткое'),
  taxId: zod.string().min(10, 'ИНН должен содержать не менее 10 цифр'),
  phone: zod.string().optional(),
  email: zod.string().email('Некорректный email').optional().or(zod.literal('')),
});

type CompanyFormValues = zod.infer<typeof companySchema>;

const CompleteProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
  });

  const onSubmit = async (data: CompanyFormValues) => {
    setError(null);
    if (!user) return;
    try {
      const companyResponse = await api.post('/company', data);
      const companyId = companyResponse.data.id;
      // Update user with companyId via the /user/me endpoint
      await api.patch('/user/me', { companyId });

      // Force reload to update context or just navigate
      // Since context fetches /auth/me on mount, it's better to just refresh or update context
      window.location.href = '/client/dashboard';
    } catch (err: any) {
      setError(err.message || 'Не удалось сохранить данные компании.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Card sx={{ width: '100%', p: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom fontWeight="bold" align="center">
              Завершение регистрации
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }} align="center">
              Пожалуйста, введите данные вашей компании, чтобы начать работу с системой.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <TextField
                margin="normal"
                fullWidth
                label="Название компании"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
                disabled={isSubmitting}
              />
              <TextField
                margin="normal"
                fullWidth
                label="ИНН"
                {...register('taxId')}
                error={!!errors.taxId}
                helperText={errors.taxId?.message}
                disabled={isSubmitting}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Телефон компании"
                {...register('phone')}
                disabled={isSubmitting}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Email компании"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isSubmitting}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, py: 1.5 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} /> : 'Завершить'}
              </Button>

              <Button
                fullWidth
                variant="text"
                sx={{ mt: 1 }}
                onClick={() => logout()}
              >
                Выйти
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default CompleteProfile;
