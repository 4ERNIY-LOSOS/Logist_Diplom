import React, { useState } from 'react';
import { authService } from '../services/auth.service';
import { userService, companyService } from '../services/admin.service';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
} from '@mui/material';

// Fix z import
import * as zod from 'zod';

const userSchema = zod.object({
  username: zod.string().min(3, 'Имя пользователя должно быть не менее 3 символов'),
  email: zod.string().email('Некорректный email'),
  password: zod.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

const companySchema = zod.object({
  name: zod.string().min(2, 'Название компании слишком короткое'),
  taxId: zod.string().min(10, 'ИНН должен содержать не менее 10 цифр'),
  phone: zod.string().optional(),
  email: zod.string().email('Некорректный email').optional().or(zod.literal('')),
});

type UserFormValues = zod.infer<typeof userSchema>;
type CompanyFormValues = zod.infer<typeof companySchema>;

const steps = ['Создание аккаунта', 'Информация о компании'];

const RegisterPage: React.FC = () => {
  const { login } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);

  const {
    register: registerUser,
    handleSubmit: handleUserSubmit,
    formState: { errors: userErrors, isSubmitting: isUserSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
  });

  const {
    register: registerCompany,
    handleSubmit: handleCompanySubmit,
    formState: { errors: companyErrors, isSubmitting: isCompanySubmitting },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
  });

  const onUserSubmit = async (data: UserFormValues) => {
    setError(null);
    try {
      const userResponse = await authService.register({
        ...data,
        role: 'CLIENT',
      });
      setCreatedUserId(userResponse.id);

      // We need the user to be able to login to continue.
      // In this specific flow, since it's a mock email verification, we might have issues if we strictly check verification.
      // But the user said "make it secure". In a secure app, they'd have to verify first.
      // However, for UX in this demo, I'll assume we can proceed or show a message.

      // Let's try to login. If it fails due to verification, we show a specific message.
      try {
        await login(data.username, data.password);
        setActiveStep(1);
      } catch (loginErr: any) {
        if (loginErr.message?.includes('verify')) {
          setError('Аккаунт создан! Пожалуйста, проверьте почту для подтверждения, прежде чем продолжить ввод данных компании.');
          // For the sake of the task, I will mock verification or allow bypass if it's a dev env
          // But I'll stick to the current logic which might require verification.
        } else {
          throw loginErr;
        }
      }
    } catch (err: any) {
      setError(err.message || 'Не удалось зарегистрировать пользователя.');
    }
  };

  const onCompanySubmit = async (data: CompanyFormValues) => {
    setError(null);
    if (!createdUserId) {
      setError('Данные пользователя отсутствуют. Пожалуйста, начните регистрацию заново.');
      return;
    }
    try {
      const company = await companyService.create(data);
      await userService.updateMe({ companyId: company.id });
      // Force refresh session to get the new companyId in AuthContext
      window.location.href = '/client/dashboard';
    } catch (err: any) {
      setError(err.message || 'Не удалось зарегистрировать компанию.');
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Card sx={{ width: '100%', padding: 3, borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography component="h1" variant="h5" align="center" sx={{ mb: 3, fontWeight: 'bold' }}>
              Регистрация в AXIS
            </Typography>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity={error.includes('Аккаунт создан') ? 'info' : 'error'} sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {activeStep === 0 && (
              <Box component="form" onSubmit={handleUserSubmit(onUserSubmit)} noValidate>
                <TextField
                  margin="normal"
                  fullWidth
                  label="Имя пользователя"
                  {...registerUser('username')}
                  error={!!userErrors.username}
                  helperText={userErrors.username?.message}
                  disabled={isUserSubmitting}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  label="Email"
                  type="email"
                  {...registerUser('email')}
                  error={!!userErrors.email}
                  helperText={userErrors.email?.message}
                  disabled={isUserSubmitting}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  label="Пароль"
                  type="password"
                  {...registerUser('password')}
                  error={!!userErrors.password}
                  helperText={userErrors.password?.message}
                  disabled={isUserSubmitting}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                  disabled={isUserSubmitting}
                >
                  {isUserSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Далее: Данные компании'}
                </Button>
              </Box>
            )}

            {activeStep === 1 && (
              <Box component="form" onSubmit={handleCompanySubmit(onCompanySubmit)} noValidate>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Почти готово! Введите данные вашей организации.
                </Typography>
                <TextField
                  margin="normal"
                  fullWidth
                  label="Название компании"
                  {...registerCompany('name')}
                  error={!!companyErrors.name}
                  helperText={companyErrors.name?.message}
                  disabled={isCompanySubmitting}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  label="ИНН"
                  {...registerCompany('taxId')}
                  error={!!companyErrors.taxId}
                  helperText={companyErrors.taxId?.message}
                  disabled={isCompanySubmitting}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  label="Телефон компании"
                  {...registerCompany('phone')}
                  disabled={isCompanySubmitting}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  label="Email компании"
                  {...registerCompany('email')}
                  error={!!companyErrors.email}
                  helperText={companyErrors.email?.message}
                  disabled={isCompanySubmitting}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                  disabled={isCompanySubmitting}
                >
                  {isCompanySubmitting ? <CircularProgress size={24} color="inherit" /> : 'Завершить регистрацию'}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default RegisterPage;
