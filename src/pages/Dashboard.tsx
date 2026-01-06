import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formService } from '@/services/form.service';
import { agentService } from '@/services/agent.service';
import { responseService } from '@/services/response.service';
import { adminService } from '@/services/admin.service';
import { ROUTES } from '@/utils/routes';
import {
  Users,
  FileText,
  ClipboardList,
  MapPin,
  TrendingUp,
  Activity,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface DashboardStats {
  totalForms: number;
  totalAgents: number;
  totalAdmins: number;
  totalResponses: number;
  responsesWithLocation: number;
  recentResponses: number;
}

interface AgentStats {
  name: string;
  forms: number;
  responses: number;
}

interface MonthlyData {
  month: string;
  responses: number;
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalForms: 0,
    totalAgents: 0,
    totalAdmins: 0,
    totalResponses: 0,
    responsesWithLocation: 0,
    recentResponses: 0,
  });
  const [agentStats, setAgentStats] = useState<AgentStats[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [mapLocations, setMapLocations] = useState<Array<{ lat: number; lng: number; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [forms, agents, responses, responsesWithLoc, admins] = await Promise.all([
        formService.getForms(),
        agentService.getAgents(),
        responseService.getAllResponses(),
        responseService.getResponsesWithLocation().catch(() => []),
        user?.role?.toLowerCase() === 'superadmin' ? adminService.getAdmins() : Promise.resolve([]),
      ]);

      // Calculate recent responses (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentResponses = responses.filter(
        (r) => new Date(r.createdAt) >= sevenDaysAgo
      ).length;

      setStats({
        totalForms: forms.length,
        totalAgents: agents.length,
        totalAdmins: admins.length,
        totalResponses: responses.length,
        responsesWithLocation: responsesWithLoc.length,
        recentResponses,
      });

      // Calculate agent statistics
      const agentStatsMap = new Map<string, { name: string; forms: number; responses: number }>();
      
      agents.forEach((agent) => {
        const agentId = agent.userId || agent._id;
        const agentName = `${agent.firstName} ${agent.lastName}`;
        
        // Count forms assigned to this agent
        const agentForms = forms.filter((form) => 
          form.agents?.includes(agentId) || form.assignedAgents?.includes(agentId)
        ).length;
        
        // Count responses from this agent
        const agentResponses = responses.filter((response) => 
          response.agent_user_id === agentId || response.filledBy?._id === agentId
        ).length;
        
        agentStatsMap.set(agentId, {
          name: agentName,
          forms: agentForms,
          responses: agentResponses,
        });
      });

      setAgentStats(Array.from(agentStatsMap.values()));

      // Calculate monthly data for the chart (last 12 months)
      const monthlyMap = new Map<string, number>();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Initialize last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = `${monthNames[date.getMonth()]}`;
        monthlyMap.set(monthKey, 0);
      }

      // Count responses per month
      responses.forEach((response) => {
        const date = new Date(response.createdAt);
        const monthKey = `${monthNames[date.getMonth()]}`;
        if (monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1);
        }
      });

      const monthlyDataArray = Array.from(monthlyMap.entries()).map(([month, responses]) => ({
        month,
        responses,
      }));

      setMonthlyData(monthlyDataArray);

      // Parse GPS locations for map
      const locations = responsesWithLoc
        .map((response: any) => {
          const gpsField = response.responseObject?.gps || 
                          response.responseObject?.gps_stamp || 
                          response.responseObject?.location;
          
          if (gpsField && typeof gpsField === 'string') {
            const [lat, lng] = gpsField.split(',').map(s => parseFloat(s.trim()));
            if (!isNaN(lat) && !isNaN(lng)) {
              return {
                lat,
                lng,
                name: response.form?.title || 'Response',
              };
            }
          }
          return null;
        })
        .filter(Boolean) as Array<{ lat: number; lng: number; name: string }>;

      setMapLocations(locations);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Forms',
      value: stats.totalForms,
      description: 'Active forms in the system',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      route: ROUTES.FORMS,
    },
    {
      title: 'Total Agents',
      value: stats.totalAgents,
      description: 'Field agents registered',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      route: ROUTES.AGENTS,
    },
    {
      title: 'Total Responses',
      value: stats.totalResponses,
      description: 'Form submissions received',
      icon: ClipboardList,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      route: ROUTES.RESPONSES,
    },
    {
      title: 'GPS Locations',
      value: stats.responsesWithLocation,
      description: 'Responses with GPS data',
      icon: MapPin,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      route: ROUTES.MAPS,
    },
  ];

  if (user?.role?.toLowerCase() === 'superadmin') {
    statCards.splice(1, 0, {
      title: 'Total Admins',
      value: stats.totalAdmins,
      description: 'System administrators',
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      route: ROUTES.ADMINS,
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {user?.firstName || 'Admin'}! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(stat.route)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Activity Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">New Responses</span>
                <span className="text-2xl font-bold">{stats.recentResponses}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Response Rate</span>
                <span className="text-2xl font-bold">
                  {stats.totalResponses > 0
                    ? Math.round((stats.recentResponses / stats.totalResponses) * 100)
                    : 0}
                  %
                </span>
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => navigate(ROUTES.RESPONSES)}
              >
                View All Responses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate(ROUTES.ADD_FORM)}
              >
                <FileText className="mr-2 h-4 w-4" />
                Create New Form
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate(ROUTES.ADD_AGENT)}
              >
                <Users className="mr-2 h-4 w-4" />
                Add New Agent
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate(ROUTES.MAPS)}
              >
                <MapPin className="mr-2 h-4 w-4" />
                View Response Map
              </Button>
              {user?.role?.toLowerCase() === 'superadmin' && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate(ROUTES.ADD_ADMIN)}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Add New Admin
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Three Column Layout: Chart, Table, Map */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Monthly Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Monthly Responses</CardTitle>
            <CardDescription>Response submissions over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="responses" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Agent Statistics Table */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Agent Performance</CardTitle>
            <CardDescription>Forms assigned and responses submitted</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background border-b">
                  <tr>
                    <th className="text-left py-2 px-2 font-medium">Agent</th>
                    <th className="text-center py-2 px-2 font-medium">Forms</th>
                    <th className="text-center py-2 px-2 font-medium">Responses</th>
                  </tr>
                </thead>
                <tbody>
                  {agentStats.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-muted-foreground">
                        No agent data available
                      </td>
                    </tr>
                  ) : (
                    agentStats.map((agent, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-2">{agent.name}</td>
                        <td className="text-center py-2 px-2">{agent.forms}</td>
                        <td className="text-center py-2 px-2">{agent.responses}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        <Card className="lg:col-span-1 overflow-hidden">
          <CardHeader>
            <CardTitle>Response Locations</CardTitle>
            <CardDescription>GPS coordinates from submissions</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[400px] w-full">
              {mapLocations.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No GPS data available</p>
                  </div>
                </div>
              ) : (
                <MapContainer
                  center={[9.0820, 8.6753]}
                  zoom={6}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {mapLocations.map((location, index) => (
                    <Marker key={index} position={[location.lat, location.lng]}>
                      <Popup>{location.name}</Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>Key metrics and statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Forms Coverage</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {stats.totalAgents > 0
                    ? (stats.totalForms / stats.totalAgents).toFixed(1)
                    : '0'}
                </span>
                <span className="text-sm text-muted-foreground">forms per agent</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {stats.totalForms > 0
                    ? (stats.totalResponses / stats.totalForms).toFixed(1)
                    : '0'}
                </span>
                <span className="text-sm text-muted-foreground">responses per form</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">GPS Coverage</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {stats.totalResponses > 0
                    ? Math.round((stats.responsesWithLocation / stats.totalResponses) * 100)
                    : 0}
                  %
                </span>
                <span className="text-sm text-muted-foreground">with location data</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
