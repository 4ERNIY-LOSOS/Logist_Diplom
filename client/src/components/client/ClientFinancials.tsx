import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import api from '../../api/api';
import { DateTime } from 'luxon';

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  taxAmount: number;
  status: string;
  dueDate: string;
  paidDate?: string;
}

const ClientFinancials: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await api.get('/finance/invoices/me');
        setInvoices(response.data);
      } catch (err: any) {
        setError(err.message || 'Ошибка при загрузке финансовых данных');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'success';
      case 'DRAFT': return 'default';
      case 'SENT': return 'info';
      case 'OVERDUE': return 'error';
      default: return 'default';
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Финансы и счета
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {invoices.length === 0 ? (
        <Alert severity="info">У вас пока нет выставленных счетов.</Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Номер счета</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Срок оплаты</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Сумма</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Статус</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Дата оплаты</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell sx={{ fontWeight: 'medium' }}>{inv.invoiceNumber}</TableCell>
                  <TableCell>
                    {DateTime.fromISO(inv.dueDate).toLocaleString(DateTime.DATE_MED)}
                  </TableCell>
                  <TableCell>
                    {(Number(inv.amount) + Number(inv.taxAmount)).toLocaleString()} ₽
                    <Typography variant="caption" display="block" color="text.secondary">
                      вкл. НДС: {Number(inv.taxAmount).toLocaleString()} ₽
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={inv.status}
                      color={getStatusColor(inv.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {inv.paidDate ? DateTime.fromISO(inv.paidDate).toLocaleString(DateTime.DATE_MED) : '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      startIcon={<DownloadIcon />}
                      size="small"
                      onClick={() => alert('Скачивание счета в PDF (в разработке)')}
                    >
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ClientFinancials;
