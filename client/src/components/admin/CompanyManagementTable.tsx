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
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import api from '../../api/api';

interface Company {
  id: string;
  name: string;
  taxId: string;
  email: string;
  phone?: string;
  address?: string;
}

export const CompanyManagementTable: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [isNewCompany, setIsNewCompany] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await api.get<Company[]>('/company');
      setCompanies(response.data);
    } catch (err) {
      setError('Failed to fetch companies.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setCurrentCompany({ id: '', name: '', taxId: '', email: '' });
    setIsNewCompany(true);
    setOpenDialog(true);
  };

  const handleEditClick = (company: Company) => {
    setCurrentCompany({ ...company });
    setIsNewCompany(false);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setCurrentCompany(null);
    setIsNewCompany(false);
  };

  const handleDialogSave = async () => {
    if (!currentCompany) return;

    // Build a clean data object based on the DTO
    const companyData = {
      name: currentCompany.name,
      taxId: currentCompany.taxId,
      email: currentCompany.email,
      phone: currentCompany.phone,
      // Do not include 'id' or 'address'
    };

    try {
      if (isNewCompany) {
        await api.post('/company', companyData);
      } else {
        await api.patch(`/company/${currentCompany.id}`, companyData);
      }
      handleDialogClose();
      fetchCompanies();
    } catch (err) {
      setError(`Failed to ${isNewCompany ? 'create' : 'update'} company.`);
      console.error(err);
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту компанию?')) {
      try {
        await api.delete(`/company/${companyId}`);
        fetchCompanies();
      } catch (err) {
        setError('Failed to delete company.');
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
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
          Добавить компанию
        </Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Название</TableCell>
            <TableCell>ИНН</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Телефон</TableCell>
            <TableCell>Адрес</TableCell>
            <TableCell>Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id}>
              <TableCell>{company.id}</TableCell>
              <TableCell>{company.name}</TableCell>
              <TableCell>{company.taxId}</TableCell>
              <TableCell>{company.email}</TableCell>
              <TableCell>{company.phone || '-'}</TableCell>
              <TableCell>{company.address || '-'}</TableCell>
              <TableCell>
                <IconButton color="primary" onClick={() => handleEditClick(company)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDeleteCompany(company.id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>{isNewCompany ? 'Добавить компанию' : 'Редактировать компанию'}</DialogTitle>
        <DialogContent>
          {currentCompany && (
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Название"
                value={currentCompany.name}
                onChange={(e) => setCurrentCompany({ ...currentCompany, name: e.target.value })}
                fullWidth
                margin="dense"
              />
              <TextField
                label="ИНН"
                value={currentCompany.taxId}
                onChange={(e) => setCurrentCompany({ ...currentCompany, taxId: e.target.value })}
                fullWidth
                margin="dense"
              />
              <TextField
                label="Email"
                value={currentCompany.email}
                onChange={(e) => setCurrentCompany({ ...currentCompany, email: e.target.value })}
                fullWidth
                margin="dense"
              />
              <TextField
                label="Телефон"
                value={currentCompany.phone || ''}
                onChange={(e) => setCurrentCompany({ ...currentCompany, phone: e.target.value })}
                fullWidth
                margin="dense"
              />
              <TextField
                label="Адрес"
                value={currentCompany.address || ''}
                onChange={(e) => setCurrentCompany({ ...currentCompany, address: e.target.value })}
                fullWidth
                margin="dense"
              />
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
