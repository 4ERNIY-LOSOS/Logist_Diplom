import React, { useEffect, useState } from 'react';
import api from '../../api/api';
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
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip as MuiTooltip,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import { MapContainer, TileLayer, Marker, Tooltip as LeafletTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import moment from 'moment'; // Assuming moment is installed for date formatting

// Fix for default Leaflet icon not showing up
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Interfaces
interface Address { id: string; country: string; city: string; street: string; houseNumber: string; }
interface Cargo { id: string; name: string; weight: number; volume: number; }
interface RequestStatus { id: string; name: string; }
interface Document {
  id: string;
  originalName: string;
  mimeType: string;
}
interface ShipmentStatus { id: string; name: string; }
interface Shipment {
    id: string;
    status: ShipmentStatus;
}
interface GpsLog {
    id: string;
    latitude: number;
    longitude: number;
    timestamp: string;
}
interface Request {
  id: string;
  pickupDate: string;
  deliveryDate: string;
  pickupAddress: Address;
  deliveryAddress: Address;
  cargos: Cargo[];
  status: RequestStatus;
  preliminaryCost?: number;
  createdAt: string;
  documents?: Document[];
  shipment?: Shipment; // Add shipment to the Request interface
}

const getStatusChipColor = (statusName: string) => {
  switch (statusName) {
    case 'Новая': return 'primary';
    case 'В обработке': return 'info';
    case 'Завершена': return 'success';
    case 'Отклонена': return 'error';
    case 'Запланирована': return 'warning'; // For Shipment status
    case 'В пути': return 'secondary'; // For Shipment status
    case 'На выгрузке': return 'info'; // For Shipment status
    case 'Доставлена': return 'success'; // For Shipment status
    default: return 'default';
  }
};

interface ShipmentTrackingMapProps {
    shipmentId: string;
    open: boolean;
    onClose: () => void;
}

const ShipmentTrackingMap: React.FC<ShipmentTrackingMapProps> = ({ shipmentId, open, onClose }) => {
    const [latestGpsLog, setLatestGpsLog] = useState<GpsLog | null>(null);
    const [loadingGps, setLoadingGps] = useState(true);
    const [gpsError, setGpsError] = useState<string | null>(null);

    useEffect(() => {
        if (open && shipmentId) {
            const fetchLatestGpsLog = async () => {
                setLoadingGps(true);
                setGpsError(null);
                try {
                    const response = await api.get(`/gps-log/shipment/${shipmentId}/latest`);
                    setLatestGpsLog(response.data);
                } catch (err: any) {
                    setGpsError(err.response?.data?.message || 'Не удалось загрузить данные GPS.');
                    console.error(err);
                } finally {
                    setLoadingGps(false);
                }
            };
            fetchLatestGpsLog();
        }
    }, [open, shipmentId]);

    if (!open) return null;

    const MapContainerAny = MapContainer as any;
    const TileLayerAny = TileLayer as any;
    const MarkerAny = Marker as any;
    const LeafletTooltipAny = LeafletTooltip as any;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Отслеживание перевозки: {shipmentId.substring(0,8)}...</DialogTitle>
            <DialogContent>
                {loadingGps ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>
                ) : gpsError ? (
                    <Alert severity="error">{gpsError}</Alert>
                ) : latestGpsLog ? (
                    <Box sx={{ height: '400px', width: '100%' }}>
                        <MapContainerAny center={[latestGpsLog.latitude, latestGpsLog.longitude]} zoom={13} style={{ height: '100%', width: '100%' }}>
                            <TileLayerAny
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <MarkerAny position={[latestGpsLog.latitude, latestGpsLog.longitude]}>
                                <LeafletTooltipAny permanent>
                                    Текущее местоположение: {latestGpsLog.latitude}, {latestGpsLog.longitude} <br/> ({moment(latestGpsLog.timestamp).format('HH:mm DD.MM.YYYY')})
                                </LeafletTooltipAny>
                            </MarkerAny>
                        </MapContainerAny>
                    </Box>
                ) : (
                    <Typography>Данные GPS не найдены для этой перевозки.</Typography>
                )}
            </DialogContent>
        </Dialog>
    );
};


const ClientRequestsTable: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingShipmentId, setTrackingShipmentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get('/request', {
            params: { relations: 'shipment.status,documents' } // Eager load shipment status and documents
        });
        setRequests(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Не удалось загрузить заявки.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleDownloadDocument = async (documentId: string, originalName: string) => {
    try {
      const response = await api.get(`/document/${documentId}`, {
        responseType: 'blob', // Important for downloading files
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalName); // Or any other extension
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось скачать документ.');
      console.error(err);
    }
  };

  const handleOpenTrackingMap = (shipmentId: string) => {
    setTrackingShipmentId(shipmentId);
  };

  const handleCloseTrackingMap = () => {
    setTrackingShipmentId(null);
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h5" gutterBottom>Мои заявки</Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="client requests table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Забор</TableCell>
              <TableCell>Доставка</TableCell>
              <TableCell>Груз</TableCell>
              <TableCell>Стоимость</TableCell>
              <TableCell>Документы</TableCell>
              <TableCell>Отслеживание</TableCell> {/* New column for tracking */}
              <TableCell>Создана</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={9} align="center">Заявки не найдены.</TableCell> {/* Updated colSpan */}
                </TableRow>
            ) : (
                requests.map((request) => (
                  <TableRow key={request.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row" title={request.id}>
                      {request.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Chip label={request.status?.name || 'N/A'} color={getStatusChipColor(request.status?.name)} size="small" />
                      {request.shipment && (
                          <Chip label={`Перевозка: ${request.shipment.status?.name || 'N/A'}`} color={getStatusChipColor(request.shipment.status?.name)} size="small" sx={{ ml: 0.5 }} />
                      )}
                    </TableCell>
                    <TableCell>
                        {`${request.pickupAddress?.city}, ${request.pickupAddress?.street}`}<br/>
                        <Typography variant="caption">{new Date(request.pickupDate).toLocaleDateString()}</Typography>
                    </TableCell>
                    <TableCell>
                        {`${request.deliveryAddress?.city}, ${request.deliveryAddress?.street}`}<br/>
                        <Typography variant="caption">{new Date(request.deliveryDate).toLocaleDateString()}</Typography>
                    </TableCell>
                    <TableCell>
                      {request.cargos.map(c => c.name).join(', ')} ({request.cargos.reduce((acc, c) => acc + c.weight, 0)} кг)
                    </TableCell>
                    <TableCell>{request.preliminaryCost ? `${request.preliminaryCost.toFixed(2)} ₽` : 'N/A'}</TableCell>
                    <TableCell> {/* Documents Cell */}
                      {request.documents && request.documents.length > 0 ? (
                        request.documents.map((doc) => (
                          <MuiTooltip key={doc.id} title={doc.originalName}>
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadDocument(doc.id, doc.originalName)}
                              color="primary"
                            >
                              <FileDownloadIcon fontSize="small" />
                            </IconButton>
                          </MuiTooltip>
                        ))
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell> {/* Tracking Cell */}
                        {request.shipment && request.shipment.status?.name !== 'Доставлена' && (
                            <IconButton
                                size="small"
                                onClick={() => handleOpenTrackingMap(request.shipment!.id)}
                                color="secondary"
                            >
                                <GpsFixedIcon />
                            </IconButton>
                        )}
                    </TableCell>
                    <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {trackingShipmentId && (
          <ShipmentTrackingMap
              shipmentId={trackingShipmentId}
              open={Boolean(trackingShipmentId)}
              onClose={handleCloseTrackingMap}
          />
      )}
    </Box>
  );
};

export default ClientRequestsTable;
