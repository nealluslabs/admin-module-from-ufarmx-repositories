import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import { responseService, type ResponseWithLocation } from '@/services/response.service';
import { formService, type Form } from '@/services/form.service';
import { agentService, type Agent } from '@/services/agent.service';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, MapPin, Eye, Calendar, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { ROUTES } from '@/utils/routes';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Component to fit map bounds to markers
function FitBounds({ locations }: { locations: Array<{ lat: number; lng: number }> }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {
      const bounds = new LatLngBounds(locations.map(loc => [loc.lat, loc.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [locations, map]);

  return null;
}

export default function Maps() {
  const navigate = useNavigate();
  const [responses, setResponses] = useState<ResponseWithLocation[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [responsesData, formsData, agentsData] = await Promise.all([
        responseService.getResponsesWithLocation(),
        formService.getForms(),
        agentService.getAgents(),
      ]);
      
      // Parse GPS data from responses
      const responsesWithParsedLocation = responsesData.map(response => {
        const gpsField = response.responseObject?.gps || 
                        response.responseObject?.gps_stamp || 
                        response.responseObject?.location;
        
        if (gpsField && typeof gpsField === 'string') {
          const [lat, lng] = gpsField.split(',').map(s => parseFloat(s.trim()));
          if (!isNaN(lat) && !isNaN(lng)) {
            return { ...response, location: { lat, lng } };
          }
        }
        return response;
      });

      setResponses(responsesWithParsedLocation.filter(r => r.location));
      setForms(formsData);
      setAgents(agentsData);
    } catch (error) {
      toast.error('Failed to load map data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResponses = useMemo(() => {
    return responses.filter((response) => {
      const matchForm = selectedFormId
        ? response.form_id === selectedFormId || response.form?._id === selectedFormId
        : true;
      const matchAgent = selectedAgentId
        ? response.filledBy?._id === selectedAgentId || response.agent_user_id === selectedAgentId
        : true;
      return matchForm && matchAgent && response.location;
    });
  }, [responses, selectedFormId, selectedAgentId]);

  const handleViewResponse = (responseId: string) => {
    navigate(ROUTES.RESPONSE_DETAIL.replace(':id', responseId));
  };

  const defaultCenter: [number, number] = [9.0820, 8.6753]; // Nigeria center
  const defaultZoom = 6;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Response Locations</h1>
        <p className="text-muted-foreground">
          View form responses on a map based on GPS coordinates
        </p>
      </div>

      {/* Filters */}
      <Card className="relative z-10">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-1 gap-4">
              <Select
                value={selectedFormId || 'all'}
                onValueChange={(val) => setSelectedFormId(val === 'all' ? null : val)}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by Form" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="all">All Forms</SelectItem>
                  {forms.map((form) => (
                    <SelectItem key={form._id || form.id} value={form._id || form.id || 'unknown'}>
                      {form.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedAgentId || 'all'}
                onValueChange={(val) => setSelectedAgentId(val === 'all' ? null : val)}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by Agent" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="all">All Agents</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.userId || agent._id} value={agent.userId || agent._id}>
                      {agent.firstName} {agent.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(selectedFormId || selectedAgentId) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedFormId(null);
                    setSelectedAgentId(null);
                  }}
                >
                  Clear
                </Button>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              Showing {filteredResponses.length} location{filteredResponses.length !== 1 ? 's' : ''}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      {filteredResponses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No locations found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              {responses.length === 0
                ? 'No responses with GPS data available yet.'
                : 'Try adjusting filters to see more locations.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden relative z-0">
          <div className="h-[600px] w-full">
            <MapContainer
              center={defaultCenter}
              zoom={defaultZoom}
              style={{ height: '100%', width: '100%', position: 'relative', zIndex: 0 }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {filteredResponses.map((response) => {
                if (!response.location) return null;
                
                const { lat, lng } = response.location;
                const agentName = response.filledBy
                  ? `${response.filledBy.firstName} ${response.filledBy.lastName}`
                  : 'Unknown';
                const formTitle = response.form?.title || 'Unknown Form';
                const date = new Date(response.createdAt).toLocaleDateString();

                return (
                  <Marker key={response._id} position={[lat, lng]}>
                    <Popup>
                      <div className="p-2 min-w-[200px]">
                        <h3 className="font-semibold text-sm mb-2">{formTitle}</h3>
                        
                        <div className="space-y-1 text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3" />
                            <span>{agentName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            <span>{date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            <span>{lat.toFixed(6)}, {lng.toFixed(6)}</span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => handleViewResponse(response._id)}
                        >
                          <Eye className="w-3 h-3 mr-2" />
                          View Response
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              <FitBounds locations={filteredResponses.map(r => r.location!)} />
            </MapContainer>
          </div>
        </Card>
      )}
    </div>
  );
}
