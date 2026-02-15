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
  // React 19 compatibility casts
  const MapContainerAny = MapContainer as any;
  const TileLayerAny = TileLayer as any;
  const MarkerAny = Marker as any;

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [shipmentPositions, setShipmentPositions] = useState<Record<string, [number, number]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveShipments = async () => {
      try {
        const data = await shipmentService.getAll();
        const active = data.filter(s => s.status.name === 'В пути');
        setShipments(active);
      } catch (err: any) {
        setError(err.message || 'Ошибка при загрузке перевозок');
      } finally {
        setLoading(false);
      }
    };
    fetchActiveShipments();
  }, []);

  useEffect(() => {
    if (shipments.length === 0) return;

    const fetchAllLatestPositions = async () => {
      const newPositions: Record<string, [number, number]> = {};
      await Promise.all(shipments.map(async (s) => {
        try {
          const response = await api.get(`/gps-log/shipment/${s.id}/latest`);
          if (response.data) {
            newPositions[s.id] = [Number(response.data.latitude), Number(response.data.longitude)];
          }
        } catch (err) {
          console.error(`Failed to fetch GPS for ${s.id}`, err);
        }
      }));
      setShipmentPositions(newPositions);
    };

    fetchAllLatestPositions();
    const interval = setInterval(fetchAllLatestPositions, 10000);
    return () => clearInterval(interval);
  }, [shipments]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  const russiaCenter = [61.524, 105.318]; // Geographical center of Russia
  const initialZoom = 3;

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Мониторинг перевозок по России
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {shipments.length === 0 ? (
        <Alert severity="info">На данный момент у вас нет активных перевозок в пути.</Alert>
      ) : (
        <Grid container spacing={2} sx={{ height: '75vh' }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ height: '100%', overflow: 'auto' }}>
              <Typography variant="h6" sx={{ p: 2 }}>Активные перевозки ({shipments.length})</Typography>
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
                        secondary={
                          <Typography variant="caption" display="block">
                            {s.request?.pickupAddress.city} → {s.request?.deliveryAddress.city}<br/>
                            {shipmentPositions[s.id] ? '📡 Сигнал активен' : '⏳ Ожидание GPS'}
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
            <Paper variant="outlined" sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
              <MapContainerAny
                center={russiaCenter}
                zoom={initialZoom}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayerAny
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {shipments.map(s => shipmentPositions[s.id] && (
                  <MarkerAny key={s.id} position={shipmentPositions[s.id]}>
                    <Popup>
                      <strong>Заказ #{s.id.substring(0,8)}</strong><br/>
                      Маршрут: {s.request?.pickupAddress.city} &rarr; {s.request?.deliveryAddress.city}<br/>
                      Статус: {s.status.name}
                    </Popup>
                  </MarkerAny>
                ))}

                {selectedShipment && shipmentPositions[selectedShipment.id] && (
                  <RecenterMap coords={shipmentPositions[selectedShipment.id]} />
                )}
              </MapContainerAny>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ClientTracking;
