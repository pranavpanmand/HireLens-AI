import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Target, Activity } from "lucide-react";
import { API_URL } from "@/services/api";

export function RecruiterAnalytics() {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['hiring-stats'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/analytics/hiring-stats`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch hiring stats');
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <Card className="border-border shadow-sm mb-6 animate-pulse mt-6">
        <CardContent className="h-64 flex items-center justify-center">
          <span className="text-muted-foreground">Loading analytics...</span>
        </CardContent>
      </Card>
    );
  }

  const timeData = analyticsData?.data?.applicationsOverTime || [];
  const funnelData = analyticsData?.data?.pipelineFunnel || [];
  const jobsData = analyticsData?.data?.jobsBreakdown || [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium text-foreground mb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span className="font-bold text-primary">{entry.value}</span>
              <span className="text-muted-foreground">{entry.name}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (timeData.length === 0 && funnelData.every(f => f.count === 0)) {
    return (
      <Card className="border-border shadow-sm mb-6 mt-6 bg-muted/20">
        <CardContent className="h-48 flex flex-col items-center justify-center text-center p-6">
          <Activity className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
          <h3 className="font-semibold text-foreground">No Analytics Data Yet</h3>
          <p className="text-sm text-muted-foreground">Post jobs and start receiving applications to view hiring trends and pipeline funnel metrics.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Over Time */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Application Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}} tickLine={false} axisLine={false} />
                  <YAxis tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}} tickLine={false} axisLine={false} allowDecimals={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="applications" name="Applications" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Funnel */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-500" /> Hiring Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis dataKey="stage" type="category" tick={{fill: 'hsl(var(--foreground))', fontSize: 11}} tickLine={false} axisLine={false} width={80} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} />
                  <Bar dataKey="count" name="Candidates" fill="hsl(var(--emerald-500))" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown by Job */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" /> Applicants by Job
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jobsData.slice(0, 5)} margin={{ top: 20, right: 10, left: -20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="jobTitle" 
                  tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}} 
                  tickLine={false} 
                  axisLine={false}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis yAxisId="left" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}} tickLine={false} axisLine={false} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} />
                <Bar yAxisId="left" dataKey="applicants" name="Total Applicants" fill="hsl(var(--blue-500))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                <Bar yAxisId="right" dataKey="avgScore" name="Avg Match Score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
