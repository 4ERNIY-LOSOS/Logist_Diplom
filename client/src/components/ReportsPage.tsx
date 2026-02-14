import React, { useEffect, useState } from 'react';
import type { Kpis } from '../services/reports.service';
import { reportsService } from '../services/reports.service';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';


const ReportsPage: React.FC = () => {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const data = await reportsService.getKpis();
        setKpis(data);
      } catch (err) {
        setError('Failed to load analytical data');
      } finally {
        setLoading(false);
      }
    };
    fetchKpis();
  }, []);

  if (loading) return <Box sx={{ p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!kpis) return null;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const chartData = [
    { name: 'On-Time Delivery (%)', value: kpis.onTimeDeliveryRate },
    { name: 'Vehicle Utilization (%)', value: kpis.vehicleUtilizationRate },
  ];

  const pieData = [
    { name: 'Busy Vehicles', value: Math.round(kpis.totalVehicles * kpis.vehicleUtilizationRate / 100) },
    { name: 'Available Vehicles', value: kpis.totalVehicles - Math.round(kpis.totalVehicles * kpis.vehicleUtilizationRate / 100) },
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Analytics & KPI Dashboard</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>On-Time Delivery Rate</Typography>
              <Typography variant="h3">{kpis.onTimeDeliveryRate}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ bgcolor: '#f1f8e9' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Vehicle Utilization</Typography>
              <Typography variant="h3">{kpis.vehicleUtilizationRate}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Avg. Cost per KM</Typography>
              <Typography variant="h3">${kpis.averageCostPerKm}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#1976d2" name="Percentage (%)" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Fleet Status</Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportsPage;
