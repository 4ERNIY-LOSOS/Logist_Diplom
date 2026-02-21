import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { userService, companyService } from '../../services/admin.service';
import type { User, Company } from '../../types';

const ClientProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, companyData] = await Promise.all([
          userService.getMe(),
          companyService.getMyCompany(),
        ]);
        setUser(userData);
        setCompany(companyData);
      } catch (err: any) {
        setError(err.message || 'Ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUserUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSuccess(null);
    setError(null);
    try {
      const updatedUser = await userService.updateMe({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
      });
      setUser(updatedUser);
      setSuccess('Личные данные успешно обновлены');
    } catch (err: any) {
      setError(err.message || 'Ошибка при обновлении личных данных');
    }
  };

  const handleCompanyUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    setSuccess(null);
    setError(null);
    try {
      const updatedCompany = await companyService.updateMyCompany({
        name: company.name,
        taxId: company.taxId,
        phone: company.phone,
        email: company.email,
        address: company.address,
      });
      setCompany(updatedCompany);
      setSuccess('Данные компании успешно обновлены');
    } catch (err: any) {
      setError(err.message || 'Ошибка при обновлении данных компании');
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Личный кабинет
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={4}>
        {/* User Profile */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 2 }} variant="outlined">
            <Typography variant="h6" gutterBottom>Личная информация</Typography>
            <Box component="form" onSubmit={handleUserUpdate}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Имя пользователя (логин)"
                    value={user?.username || ''}
                    disabled
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={user?.email || ''}
                    disabled
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Имя"
                    value={user?.firstName || ''}
                    onChange={(e) => setUser(u => u ? { ...u, firstName: e.target.value } : null)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Фамилия"
                    value={user?.lastName || ''}
                    onChange={(e) => setUser(u => u ? { ...u, lastName: e.target.value } : null)}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Телефон"
                    value={user?.phone || ''}
                    onChange={(e) => setUser(u => u ? { ...u, phone: e.target.value } : null)}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button type="submit" variant="contained">Сохранить изменения</Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Company Info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 2 }} variant="outlined">
            <Typography variant="h6" gutterBottom>Информация о компании</Typography>
            <Box component="form" onSubmit={handleCompanyUpdate}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Название компании"
                    value={company?.name || ''}
                    onChange={(e) => setCompany(c => c ? { ...c, name: e.target.value } : null)}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="ИНН"
                    value={company?.taxId || ''}
                    onChange={(e) => setCompany(c => c ? { ...c, taxId: e.target.value } : null)}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Телефон компании"
                    value={company?.phone || ''}
                    onChange={(e) => setCompany(c => c ? { ...c, phone: e.target.value } : null)}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Email компании"
                    value={company?.email || ''}
                    onChange={(e) => setCompany(c => c ? { ...c, email: e.target.value } : null)}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Адрес"
                    multiline
                    rows={2}
                    value={company?.address || ''}
                    onChange={(e) => setCompany(c => c ? { ...c, address: e.target.value } : null)}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button type="submit" variant="contained" color="secondary">Обновить данные компании</Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClientProfile;
