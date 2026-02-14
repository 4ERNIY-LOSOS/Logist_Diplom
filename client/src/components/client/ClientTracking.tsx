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
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { shipmentService } from '../../services/shipment.service';
import api from '../../api/api';
import type { Shipment } from '../../types';

// Fix Leaflet marker icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper to center map
const RecenterMap = ({ coords }: { coords: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 10);
  }, [coords, map]);
  return null;
};

const ClientTracking: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [latestPos, setLatestPos] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchActiveShipments = async () => {
      try {
        const data = await shipmentService.getAll();
        const active = data.filter(s => s.status.name === 'В пути');
        setShipments(active);
        if (active.length > 0) {
          setSelectedShipment(active[0]);
        }
      } catch (err: any) {
        setError(err.message || 'Ошибка при загрузке перевозок');
      } finally {
        setLoading(false);
      }
    };
    fetchActiveShipments();
  }, []);

  useEffect(() => {
    if (!selectedShipment) return;

    const fetchLatestPos = async () => {
      try {
        const response = await api.get(`/gps-log/shipment/${selectedShipment.id}/latest`);
        if (response.data) {
          setLatestPos([Number(response.data.latitude), Number(response.data.longitude)]);
        } else {
          setLatestPos(null);
        }
      } catch (err) {
        console.error('Failed to fetch GPS log', err);
        setLatestPos(null);
      }
    };

    fetchLatestPos();
    const interval = setInterval(fetchLatestPos, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, [selectedShipment]);

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Отслеживание в реальном времени
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {shipments.length === 0 ? (
        <Alert severity="info">На данный момент у вас нет активных перевозок в пути.</Alert>
      ) : (
        <Grid container spacing={2} sx={{ height: '70vh' }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ height: '100%', overflow: 'auto' }}>
              <Typography variant="h6" sx={{ p: 2 }}>Активные перевозки</Typography>
              <Divider />
              <List>
                {shipments.map((s) => (
                  <ListItem key={s.id} disablePadding>
                    <ListItemButton
                      selected={selectedShipment?.id === s.id}
                      onClick={() => setSelectedShipment(s)}
                    >
                      <ListItemText
                        primary={`Заказ #${s.id.substring(0,8)}`}
                        secondary={`${s.request?.pickupAddress.city} → ${s.request?.deliveryAddress.city}`}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper variant="outlined" sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
              <MapContainer
                center={[55.751244, 37.618423] as any}
                zoom={5}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {latestPos && (
                  <>
                    <Marker position={latestPos}>
                      <Popup>
                        Груз в пути<br />
                        Заказ: {selectedShipment?.id.substring(0,8)}
                      </Popup>
                    </Marker>
                    <RecenterMap coords={latestPos} />
                  </>
                )}
              </MapContainer>
              {!latestPos && selectedShipment && (
                <Box sx={{ position: 'absolute', top: 10, left: 50, zIndex: 1000, bgcolor: 'rgba(255,255,255,0.8)', p: 1, borderRadius: 1 }}>
                  <Typography variant="caption">Данные GPS временно недоступны для этой перевозки</Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ClientTracking;
