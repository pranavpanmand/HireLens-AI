import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, Activity } from "lucide-react";
import { API_URL } from "@/services/api";

export function StudentAnalytics() {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['match-trend'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/analytics/match-trend`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <Card className="border-border shadow-sm mb-6 animate-pulse">
        <CardContent className="h-64 flex items-center justify-center">
          <span className="text-muted-foreground">Loading analytics...</span>
        </CardContent>
      </Card>
    );
  }

  const trendData = analyticsData?.data?.trend || [];
  const funnelData = analyticsData?.data?.applications || [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium text-foreground mb-1">{label}</p>
          {payload[0].payload.jobTitle && (
            <p className="text-xs text-muted-foreground mb-2 truncate max-w-[200px]">{payload[0].payload.jobTitle}</p>
          )}
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-primary">{payload[0].value}{payload[0].name === "Score" ? "%" : ""}</span>
            <span className="text-muted-foreground">{payload[0].name}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (trendData.length === 0 && funnelData.every(f => f.count === 0)) {
    return null; // Don't show if no data at all
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Resume Match Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trendData.length > 0 ? (
            <div className="h-[200px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMatch" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}} tickLine={false} axisLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="score" name="Score" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorMatch)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
               Analyze a job to see your match score trend.
             </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500" /> Application Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis dataKey="status" type="category" tick={{fill: 'hsl(var(--foreground))', fontSize: 11}} tickLine={false} axisLine={false} width={80} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} />
                <Bar dataKey="count" name="Applications" fill="hsl(var(--emerald-500))" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
