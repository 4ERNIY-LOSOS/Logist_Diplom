import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  CircularProgress,
  Box,
  Switch,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { userService, companyService, roleService } from '../../services/admin.service';
import type { User, Role, Company } from '../../types';
import { RoleName } from '../../types';

export const UserManagementTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsersAndData();
  }, []);

  const fetchUsersAndData = async () => {
    setLoading(true);
    try {
      const [usersData, rolesData, companiesData] = await Promise.all([
        userService.getAll(),
        roleService.getAll(),
        companyService.getAll(),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
      setCompanies(companiesData);
    } catch (err) {
      setError('Failed to fetch data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user: User) => {
    setCurrentUser({ ...user }); // Create a shallow copy to edit
    setOpenEditDialog(true);
  };

  const handleDialogClose = () => {
    setOpenEditDialog(false);
    setCurrentUser(null);
  };

  const handleDialogSave = async () => {
    if (!currentUser) return;
    try {
      await userService.update(currentUser.id, {
        username: currentUser.username,
        email: currentUser.email,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        phone: currentUser.phone,
        isActive: currentUser.isActive,
        role: currentUser.role.name, // Send role name
        companyId: currentUser.company?.id, // Send company ID
      });
      handleDialogClose();
      fetchUsersAndData(); // Refresh list
    } catch (err) {
      setError('Failed to update user.');
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      try {
        await userService.delete(userId);
        fetchUsersAndData(); // Refresh list
      } catch (err) {
        setError('Failed to delete user.');
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Имя пользователя</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Имя</TableCell>
            <TableCell>Фамилия</TableCell>
            <TableCell>Телефон</TableCell>
            <TableCell>Активен</TableCell>
            <TableCell>Роль</TableCell>
            <TableCell>Компания</TableCell>
            <TableCell>Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.firstName || '-'}</TableCell>
              <TableCell>{user.lastName || '-'}</TableCell>
              <TableCell>{user.phone || '-'}</TableCell>
              <TableCell>
                <Switch
                  checked={user.isActive}
                  onChange={async (e) => {
                    // Optimistic update
                    const originalIsActive = user.isActive;
                    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: e.target.checked } : u));
                    try {
                      await userService.update(user.id, { isActive: e.target.checked });
                    } catch (err) {
                      setError('Failed to update user status.');
                      console.error(err);
                      // Revert on error
                      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: originalIsActive } : u));
                    }
                  }}
                  color="primary"
                />
              </TableCell>
              <TableCell>{user.role?.name || '-'}</TableCell>
              <TableCell>{user.company?.name || '-'}</TableCell>
              <TableCell>
                <IconButton color="primary" onClick={() => handleEditClick(user)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDeleteUser(user.id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={openEditDialog} onClose={handleDialogClose}>
        <DialogTitle>Редактировать пользователя</DialogTitle>
        <DialogContent>
          {currentUser && (
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Имя пользователя"
                value={currentUser.username}
                onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
                fullWidth
                margin="dense"
              />
              <TextField
                label="Email"
                value={currentUser.email}
                onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                fullWidth
                margin="dense"
              />
              <TextField
                label="Имя"
                value={currentUser.firstName || ''}
                onChange={(e) => setCurrentUser({ ...currentUser, firstName: e.target.value })}
                fullWidth
                margin="dense"
              />
              <TextField
                label="Фамилия"
                value={currentUser.lastName || ''}
                onChange={(e) => setCurrentUser({ ...currentUser, lastName: e.target.value })}
                fullWidth
                margin="dense"
              />
              <TextField
                label="Телефон"
                value={currentUser.phone || ''}
                onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })}
                fullWidth
                margin="dense"
              />
              <FormControl fullWidth margin="dense">
                <InputLabel>Роль</InputLabel>
                <Select
                  value={currentUser.role?.name || ''}
                  label="Роль"
                  onChange={(e) => {
                    const selectedRole = roles.find(r => r.name === e.target.value);
                    if (selectedRole) {
                      setCurrentUser({ ...currentUser, role: { id: selectedRole.id, name: selectedRole.name as RoleName } });
                    }
                  }}
                >
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.name}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="dense">
                <InputLabel>Компания</InputLabel>
                <Select
                  value={currentUser.company?.id || ''}
                  label="Компания"
                  onChange={(e) => {
                    const selectedCompany = companies.find(c => c.id === e.target.value);
                    setCurrentUser({ ...currentUser, company: selectedCompany || undefined });
                  }}
                >
                  <MenuItem value=""><em>Нет</em></MenuItem>
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography>Активен:</Typography>
                <Switch
                  checked={currentUser.isActive}
                  onChange={(e) => setCurrentUser({ ...currentUser, isActive: e.target.checked })}
                  color="primary"
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Отмена</Button>
          <Button onClick={handleDialogSave} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>
    </TableContainer>
  );
};