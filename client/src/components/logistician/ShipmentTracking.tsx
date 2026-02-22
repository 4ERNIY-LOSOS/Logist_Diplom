import React, { useEffect, useState } from 'react';
import { shipmentService } from '../../services/shipment.service';
import api from '../../api/api';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
} from '@mui/material';
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet icons are now globally setup in utils/leaflet-setup.ts

// Helper to center map
const RecenterMap = ({ coords }: { coords: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 10);
  }, [coords, map]);
  return null;
};

interface Shipment {
  id: string;
  status: { name: string };
  request: {
    company: { name: string };
    pickupAddress: any;
    deliveryAddress: any;
  };
}

const ShipmentTracking: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [shipmentPositions, setShipmentPositions] = useState<Record<string, [number, number]>>({});
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapKey, setMapKey] = useState(() => `map-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const data = await shipmentService.getAll();
        setShipments(data.filter((s) => s.status.name === 'В пути'));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchShipments();
  }, []);

  useEffect(() => {
    if (shipments.length === 0) return;

    const fetchAllPositions = async () => {
        const newPositions: Record<string, [number, number]> = {};
        await Promise.all(shipments.map(async (s) => {
            try {
                const res = await api.get(`/gps-log/shipment/${s.id}/latest`);
                if (res.data) {
                    newPositions[s.id] = [Number(res.data.latitude), Number(res.data.longitude)];
                }
            } catch (err) {
                console.error(`Error fetching GPS for ${s.id}`, err);
            }
        }));
        setShipmentPositions(newPositions);
    };

    fetchAllPositions();
    const interval = setInterval(fetchAllPositions, 10000);
    return () => clearInterval(interval);
  }, [shipments]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  // React 19 compatibility casts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MapContainerAny = MapContainer as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TileLayerAny = TileLayer as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MarkerAny = Marker as any;

  const russiaCenter = [61.524, 105.318];

  const handleTrackClick = (id: string) => {
    setSelectedShipmentId(id);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>Глобальный мониторинг флота</Typography>

      <Box sx={{ height: '500px', width: '100%', mb: 4, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <MapContainerAny
            key={mapKey}
            center={russiaCenter}
            zoom={3}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayerAny url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
            {shipments.map(s => shipmentPositions[s.id] && (
                <MarkerAny key={s.id} position={shipmentPositions[s.id]}>
                    <Popup>
                        <strong>Заказ #{s.id.substring(0,8)}</strong><br/>
                        Компания: {s.request.company.name}<br/>
                        Статус: {s.status.name}
                    </Popup>
                </MarkerAny>
            ))}
            {selectedShipmentId && shipmentPositions[selectedShipmentId] && (
              <RecenterMap coords={shipmentPositions[selectedShipmentId]} />
            )}
          </MapContainerAny>
      </Box>

      <Typography variant="h6" gutterBottom>Список активных перевозок</Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shipments.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.id.substring(0, 8)}</TableCell>
                <TableCell>{s.request.company.name}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    startIcon={<LocationSearchingIcon />}
                    size="small"
                    onClick={() => handleTrackClick(s.id)}
                    disabled={!shipmentPositions[s.id]}
                  >
                    Показать
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {shipments.length === 0 && (
                <TableRow><TableCell colSpan={3} align="center">No shipments currently in transit</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

    </Box>
  );
};

export default ShipmentTracking;
