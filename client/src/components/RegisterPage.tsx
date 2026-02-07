import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
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
} from '@mui/material';

const steps = ['Создание аккаунта', 'Информация о компании'];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // User details
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Company details
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');

  // Store created user info temporarily
  const [createdUser, setCreatedUser] = useState<{ id: string } | null>(null);

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const userResponse = await api.post('/auth/register', {
        username,
        email,
        password,
        role: 'CLIENT',
      });
      setCreatedUser(userResponse.data);
      const loginResponse = await api.post('/auth/login', { username, password });
      login(loginResponse.data.access_token);
      setActiveStep(1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось зарегистрировать пользователя.');
      console.error(err);
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!createdUser) {
      setError('Данные пользователя отсутствуют. Пожалуйста, начните регистрацию заново.');
      return;
    }
    try {
      const companyResponse = await api.post('/company', {
        name: companyName,
        taxId,
        phone: companyPhone,
        email: companyEmail,
      });
      const companyId = companyResponse.data.id;
      await api.patch(`/user/${createdUser.id}`, { companyId });
      navigate('/client/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось зарегистрировать компанию.');
      console.error(err);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Card sx={{ width: '100%', padding: 2 }}>
          <CardContent>
            <Typography component="h1" variant="h5" align="center" sx={{ mb: 3 }}>
              Регистрация клиента
            </Typography>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {activeStep === 0 && (
              <Box component="form" onSubmit={handleUserSubmit} noValidate>
                <TextField label="Имя пользователя" value={username} onChange={(e) => setUsername(e.target.value)} required fullWidth />
                <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
                <TextField label="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth />
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                  Далее: Информация о компании
                </Button>
              </Box>
            )}

            {activeStep === 1 && (
              <Box component="form" onSubmit={handleCompanySubmit} noValidate>
                <Typography>Добро пожаловать, {username}! Теперь, пожалуйста, укажите данные вашей компании.</Typography>
                <TextField label="Название компании" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required fullWidth />
                <TextField label="ИНН" value={taxId} onChange={(e) => setTaxId(e.target.value)} required fullWidth />
                <TextField label="Телефон компании" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} fullWidth />
                <TextField label="Email компании" type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} fullWidth />
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                  Завершить регистрацию
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

