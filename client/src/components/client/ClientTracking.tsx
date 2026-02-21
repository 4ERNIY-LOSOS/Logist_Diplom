import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Alert,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SettingsIcon from '@mui/icons-material/Settings';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import MovingIcon from '@mui/icons-material/Moving';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import { requestService } from '../../services/request.service';
import type { LogisticRequest } from '../../types';
import { DateTime } from 'luxon';

const steps = [
  { label: 'Заявка принята', icon: AssignmentIcon },
  { label: 'В обработке', icon: SettingsIcon },
  { label: 'Рейс запланирован', icon: EventAvailableIcon },
  { label: 'Погрузка', icon: LocalShippingIcon },
  { label: 'В пути', icon: MovingIcon },
  { label: 'Груз доставлен', icon: CheckCircleIcon },
];

const ClientTracking: React.FC = () => {
  const [requests, setRequests] = useState<LogisticRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<LogisticRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await requestService.getAll();
        // Filter out cancelled requests if any (assuming 'Отклонена' is cancelled)
        const active = data.filter(r => r.status.name !== 'Отклонена');
        setRequests(active);
        if (active.length > 0 && !selectedRequest) {
          setSelectedRequest(active[0]);
        }
      } catch (err: any) {
        setError(err.message || 'Ошибка при загрузке заявок');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, [selectedRequest]);

  const getActiveStep = (request: LogisticRequest) => {
    if (request.status.name === 'Завершена') return 6;
    if (!request.shipment) {
      if (request.status.name === 'В обработке') return 1;
      return 0; // Новая
    }

    const shipment = request.shipment;
    if (shipment.status.name === 'Доставлена') return 6;
    if (shipment.status.name === 'В пути') return 4;

    const hasLoadingMilestone = shipment.milestones?.some(m =>
      ['ARRIVED_AT_PICKUP', 'LOADING_STARTED', 'LOADING_COMPLETED'].includes(m.type)
    );
    if (hasLoadingMilestone) return 3;

    if (shipment.status.name === 'Запланирована' || shipment.status.name === 'Консолидирована') return 2;

    return 1;
  };

  const getTimelineEvents = (request: LogisticRequest) => {
    const events: { time: string; text: string; subtext?: string; icon?: React.ReactNode }[] = [];

    // Base event: Creation
    events.push({
      time: DateTime.fromISO(request.createdAt).toLocaleString(DateTime.DATETIME_SHORT),
      text: 'Заявка создана',
      icon: <AssignmentIcon fontSize="small" />,
    });

    if (request.status.name === 'В обработке' || request.shipment) {
      events.push({
        time: DateTime.fromISO(request.updatedAt).toLocaleString(DateTime.DATETIME_SHORT),
        text: 'Заявка передана в отдел логистики',
        icon: <SettingsIcon fontSize="small" />,
      });
    }

    if (request.shipment) {
      const s = request.shipment;
      events.push({
        time: DateTime.fromISO(s.createdAt).toLocaleString(DateTime.DATETIME_SHORT),
        text: 'Назначен транспорт и водитель',
        subtext: `${s.driver.firstName} ${s.driver.lastName} | ${s.vehicle.licensePlate} (${s.vehicle.model})`,
        icon: <EventAvailableIcon fontSize="small" />,
      });

      // Milestones
      if (s.milestones) {
        // Sort milestones by timestamp
        const sorted = [...s.milestones].sort((a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        sorted.forEach(m => {
          let text = m.type;
          switch(m.type) {
            case 'ARRIVED_AT_PICKUP': text = 'Водитель прибыл на место забора'; break;
            case 'LOADING_STARTED': text = 'Начата погрузка'; break;
            case 'LOADING_COMPLETED': text = 'Погрузка завершена'; break;
            case 'DEPARTED_FROM_PICKUP': text = 'Транспорт выехал из пункта отправления'; break;
            case 'IN_TRANSIT': text = 'Груз следует по маршруту'; break;
            case 'ARRIVED_AT_DELIVERY': text = 'Водитель прибыл на место выгрузки'; break;
            case 'UNLOADING_STARTED': text = 'Начата выгрузка'; break;
            case 'UNLOADING_COMPLETED': text = 'Выгрузка завершена'; break;
            case 'POD_UPLOADED': text = 'Документы (POD) загружены'; break;
            case 'DELIVERED': text = 'Груз успешно доставлен'; break;
          }
          events.push({
            time: DateTime.fromISO(m.timestamp).toLocaleString(DateTime.DATETIME_SHORT),
            text: text,
            subtext: m.location || m.notes,
            icon: m.type === 'DELIVERED' ? <CheckCircleIcon fontSize="small" /> : <AccessTimeIcon fontSize="small" />,
          });
        });
      }

      if (s.status.name === 'В пути' && !s.milestones?.some(m => m.type === 'IN_TRANSIT')) {
         events.push({
            time: DateTime.fromISO(s.updatedAt).toLocaleString(DateTime.DATETIME_SHORT),
            text: 'Груз в пути',
            icon: <MovingIcon fontSize="small" />,
         });
      }

      if (s.status.name === 'Доставлена' && !s.milestones?.some(m => m.type === 'DELIVERED')) {
        events.push({
          time: DateTime.fromISO(s.actualDeliveryDate || s.updatedAt).toLocaleString(DateTime.DATETIME_SHORT),
          text: 'Доставлено',
          icon: <CheckCircleIcon fontSize="small" />,
        });
      }
    }

    // Return unique events by text+time to avoid duplicates during status transitions, reverse for log view
    return events.reverse();
  };

  if (loading && requests.length === 0) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Отслеживание грузов
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {requests.length === 0 ? (
        <Alert severity="info">У вас пока нет активных заявок для отслеживания.</Alert>
      ) : (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ height: '70vh', overflow: 'auto', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ p: 2, bgcolor: 'grey.50' }}>Активные заказы ({requests.length})</Typography>
              <Divider />
              <List>
                {requests.map((r) => (
                  <ListItem key={r.id} disablePadding>
                    <ListItemButton
                      selected={selectedRequest?.id === r.id}
                      onClick={() => setSelectedRequest(r)}
                      sx={{
                        borderLeft: selectedRequest?.id === r.id ? '4px solid' : '4px solid transparent',
                        borderColor: 'primary.main',
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" fontWeight="bold">#{r.id.substring(0,8)}</Typography>
                            <Chip
                              label={r.status.name}
                              size="small"
                              color={r.status.name === 'Завершена' ? 'success' : 'primary'}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                            {r.pickupAddress.city} &rarr; {r.deliveryAddress.city}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            {selectedRequest ? (
              <Box>
                {/* Stepper Card */}
                <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ mb: 4, mt: 2 }}>
                      <Stepper activeStep={getActiveStep(selectedRequest)} alternativeLabel>
                        {steps.map((step, index) => {
                          const Icon = step.icon;
                          return (
                            <Step key={step.label}>
                              <StepLabel StepIconComponent={() => (
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: getActiveStep(selectedRequest) >= index ? 'primary.main' : 'grey.300',
                                    fontSize: 16
                                  }}
                                >
                                  <Icon fontSize="inherit" />
                                </Avatar>
                              )}>
                                <Typography variant="caption" fontWeight={getActiveStep(selectedRequest) === index ? 'bold' : 'normal'}>
                                  {step.label}
                                </Typography>
                              </StepLabel>
                            </Step>
                          );
                        })}
                      </Stepper>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Маршрут</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {selectedRequest.pickupAddress.city} &rarr; {selectedRequest.deliveryAddress.city}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>План доставки</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {DateTime.fromISO(selectedRequest.deliveryDate).toLocaleString(DateTime.DATE_MED)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Info Card */}
                {selectedRequest.shipment && (
                  <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, bgcolor: 'primary.50' }}>
                    <CardContent>
                       <Grid container spacing={2} alignItems="center">
                          <Grid size={{ xs: "auto" }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}><PersonIcon /></Avatar>
                          </Grid>
                          <Grid size={{ xs: 4 }}>
                            <Typography variant="subtitle2" color="primary.main">Ваш водитель</Typography>
                            <Typography variant="h6">{selectedRequest.shipment.driver.firstName} {selectedRequest.shipment.driver.lastName}</Typography>
                          </Grid>
                          <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                          <Grid size={{ xs: "auto" }}>
                            <Avatar sx={{ bgcolor: 'secondary.main' }}><DirectionsCarIcon /></Avatar>
                          </Grid>
                          <Grid size={{ xs: 4 }}>
                            <Typography variant="subtitle2" color="secondary.main">Транспорт</Typography>
                            <Typography variant="h6">{selectedRequest.shipment.vehicle.licensePlate}</Typography>
                            <Typography variant="caption" color="text.secondary">{selectedRequest.shipment.vehicle.model}</Typography>
                          </Grid>
                       </Grid>
                    </CardContent>
                  </Card>
                )}

                {/* Timeline Card */}
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 4 }}>История событий</Typography>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Timeline position="right">
                    {getTimelineEvents(selectedRequest).map((event, idx) => (
                      <TimelineItem key={idx}>
                        <TimelineOppositeContent sx={{ m: 'auto 0', flex: 0.2 }} align="right" variant="caption" color="text.secondary">
                          {event.time}
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                          <TimelineDot color={idx === 0 ? 'primary' : 'grey'}>
                            {event.icon}
                          </TimelineDot>
                          {idx !== getTimelineEvents(selectedRequest).length - 1 && <TimelineConnector />}
                        </TimelineSeparator>
                        <TimelineContent sx={{ py: '12px', px: 2 }}>
                          <Typography variant="subtitle2" component="span" fontWeight="bold">
                            {event.text}
                          </Typography>
                          {event.subtext && (
                            <Typography variant="body2" color="text.secondary">
                              {event.subtext}
                            </Typography>
                          )}
                        </TimelineContent>
                      </TimelineItem>
                    ))}
                  </Timeline>
                </Paper>
              </Box>
            ) : (
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">Выберите заказ для просмотра деталей</Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ClientTracking;
