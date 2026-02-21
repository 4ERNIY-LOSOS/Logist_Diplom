import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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

const loginSchema = z.object({
  username: z.string().min(3, 'Имя пользователя должно быть не менее 3 символов'),
  password: z.string().min(5, 'Пароль должен быть не менее 5 символов'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    try {
      await login(data.username, data.password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Ошибка входа. Пожалуйста, проверьте ваши данные.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Card sx={{ width: '100%', padding: 2, borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography component="h1" variant="h5" align="center" gutterBottom fontWeight="bold">
              Вход в AXIS
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              sx={{ mt: 1 }}
            >
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Имя пользователя"
                {...register('username')}
                error={!!errors.username}
                helperText={errors.username?.message}
                autoComplete="username"
                autoFocus
                disabled={isSubmitting}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Пароль"
                type="password"
                id="password"
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                autoComplete="current-password"
                disabled={isSubmitting}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Войти'}
              </Button>
              <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                Новый клиент?{' '}
                <Link
                  to="/register"
                  style={{ textDecoration: 'none', color: '#1976d2', fontWeight: '500' }}
                >
                  Зарегистрируйтесь здесь
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default LoginPage;
