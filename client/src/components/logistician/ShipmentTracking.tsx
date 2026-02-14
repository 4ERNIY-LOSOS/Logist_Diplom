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
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon not showing up
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

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
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);

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
    let interval: ReturnType<typeof setInterval> | undefined;
    if (selectedShipmentId) {
      const fetchCoords = async () => {
        try {
          const res = await api.get(`/gps-log/shipment/${selectedShipmentId}/latest`);
          if (res.data) {
            setCurrentCoords([Number(res.data.latitude), Number(res.data.longitude)]);
          }
        } catch (err) {
          console.error('Error fetching GPS', err);
        }
      };
      fetchCoords();
      interval = setInterval(fetchCoords, 5000); // Polling every 5s
    }
    return () => clearInterval(interval);
  }, [selectedShipmentId]);

  if (loading) return <CircularProgress />;

  // React 19 compatibility casts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MapContainerAny = MapContainer as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TileLayerAny = TileLayer as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MarkerAny = Marker as any;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Active Shipments Tracking</Typography>
      <TableContainer component={Paper}>
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
                  <Button variant="outlined" onClick={() => setSelectedShipmentId(s.id)}>
                    Track on Map
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

      <Dialog open={!!selectedShipmentId} onClose={() => setSelectedShipmentId(null)} fullWidth maxWidth="md">
        <DialogTitle>Live Tracking: {selectedShipmentId?.substring(0, 8)}</DialogTitle>
        <DialogContent sx={{ height: '500px' }}>
          {selectedShipmentId && currentCoords ? (
            <MapContainerAny key={`map-log-${selectedShipmentId}`} center={currentCoords} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayerAny url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MarkerAny position={currentCoords}>
                <Popup>Current Location</Popup>
              </MarkerAny>
            </MapContainerAny>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography>Waiting for GPS signal...</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ShipmentTracking;
