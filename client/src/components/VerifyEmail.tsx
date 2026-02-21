import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Токен подтверждения отсутствует.');
        return;
      }

      try {
        await authService.verifyEmail(token);
        setStatus('success');
        setMessage('Ваш email успешно подтвержден! Теперь вы можете войти в систему.');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Ошибка при подтверждении email. Возможно, ссылка устарела.');
      }
    };

    verify();
  }, [token]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Card sx={{ width: '100%', textAlign: 'center', p: 3 }}>
          <CardContent>
            {status === 'loading' && (
              <>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="h6">Проверка токена...</Typography>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" gutterBottom fontWeight="bold">Успешно!</Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>{message}</Typography>
                <Button variant="contained" onClick={() => navigate('/login')} fullWidth>
                  Перейти ко входу
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" gutterBottom fontWeight="bold">Ошибка</Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>{message}</Typography>
                <Button variant="outlined" component={Link} to="/register" fullWidth>
                  Вернуться к регистрации
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default VerifyEmail;
