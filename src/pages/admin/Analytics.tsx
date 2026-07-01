import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { BarChart3, Eye, TrendingUp, FolderGit, MessageSquare, Globe, ArrowUpRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card } from "@/components/ui/card";

interface Stats {
  totalViews: number;
  viewsThisMonth: number;
  uniqueProjects: number;
  mostViewedProject: string;
}

interface ProjectViewItem {
  id: string;
  project_id: string;
  viewed_at: string;
  referrer: string | null;
  projects: {
    title: string;
  } | null;
}

interface ChartDataItem {
  date: string;
  views: number;
}

interface TopProjectItem {
  title: string;
  views: number;
}

const COLORS = ["#80ff00", "#8b5cf6", "#6b7280"]; // lime, purple, muted gray

const Analytics = () => {
  const [stats, setStats] = useState<Stats>({
    totalViews: 0,
    viewsThisMonth: 0,
    uniqueProjects: 0,
    mostViewedProject: "None",
  });
  const [viewsData, setViewsData] = useState<ChartDataItem[]>([]);
  const [topProjects, setTopProjects] = useState<TopProjectItem[]>([]);
  const [inquiryStatus, setInquiryStatus] = useState<any[]>([]);
  const [recentViews, setRecentViews] = useState<ProjectViewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        // 1. Fetch Views with Projects joined
        const { data: views, error: viewsError } = await supabase
          .from("project_views")
          .select("*, projects(title)")
          .order("viewed_at", { ascending: false });

        if (viewsError) throw viewsError;

        const allViews = views || [];

        // 2. Fetch Inquiries to build status distribution
        const { data: inquiries } = await supabase
          .from("inquiries")
          .select("status");

        // Calculate stat counters
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const totalViews = allViews.length;
        const viewsThisMonth = allViews.filter(
          (v) => new Date(v.viewed_at) >= startOfMonth
        ).length;

        const uniqueProjectIds = new Set(allViews.map((v) => v.project_id));
        const uniqueProjects = uniqueProjectIds.size;

        // Calculate most viewed project
        const projectCounts: Record<string, { title: string; count: number }> = {};
        allViews.forEach((v) => {
          if (v.project_id && v.projects) {
            if (!projectCounts[v.project_id]) {
              projectCounts[v.project_id] = { title: v.projects.title, count: 0 };
            }
            projectCounts[v.project_id].count++;
          }
        });

        let mostViewed = "None";
        let maxViews = 0;
        const topProjectsList: TopProjectItem[] = [];

        Object.keys(projectCounts).forEach((id) => {
          const item = projectCounts[id];
          if (item.count > maxViews) {
            maxViews = item.count;
            mostViewed = item.title;
          }
          topProjectsList.push({ title: item.title, views: item.count });
        });

        // Sort top projects
        topProjectsList.sort((a, b) => b.views - a.views);
        setTopProjects(topProjectsList.slice(0, 5));
        setStats({
          totalViews,
          viewsThisMonth,
          uniqueProjects,
          mostViewedProject: mostViewed + (maxViews > 0 ? ` (${maxViews} views)` : ""),
        });

        // 3. Build last 30 days chart data
        const last30Days: ChartDataItem[] = [];
        for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
          
          // count views on this date
          const count = allViews.filter((v) => {
            const vDate = new Date(v.viewed_at);
            return (
              vDate.getDate() === d.getDate() &&
              vDate.getMonth() === d.getMonth() &&
              vDate.getFullYear() === d.getFullYear()
            );
          }).length;

          last30Days.push({ date: dateStr, views: count });
        }
        setViewsData(last30Days);

        // 4. Build inquiry status distribution
        const statusCounts: Record<string, number> = { New: 0, Contacted: 0, Closed: 0 };
        (inquiries || []).forEach((inq) => {
          const s = inq.status || "New";
          statusCounts[s] = (statusCounts[s] || 0) + 1;
        });

        setInquiryStatus([
          { name: "New", value: statusCounts["New"] || 0 },
          { name: "Contacted", value: statusCounts["Contacted"] || 0 },
          { name: "Closed", value: statusCounts["Closed"] || 0 },
        ]);

        // Recent views (last 10)
        setRecentViews(allViews.slice(0, 10) as any);
      } catch (err) {
        console.error("Failed to load analytics data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const statCards = [
    { label: "Total Project Views", value: stats.totalViews, icon: Eye, color: "text-lime", bg: "bg-lime/10" },
    { label: "Views This Month", value: stats.viewsThisMonth, icon: TrendingUp, color: "text-purple", bg: "bg-purple/10" },
    { label: "Projects Viewed", value: stats.uniqueProjects, icon: FolderGit, color: "text-lime", bg: "bg-lime/10" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-2 border-lime border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stat counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-xl p-5 hover:border-muted-foreground/20 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">{card.label}</p>
                <p className="text-3xl font-bold text-foreground mt-1.5">{card.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Most viewed banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card border border-border rounded-xl p-5 flex items-center justify-between gap-4"
      >
        <div>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Most Popular Case Study</p>
          <h3 className="text-lg font-bold text-lime mt-1">{stats.mostViewedProject}</h3>
        </div>
        <div className="w-10 h-10 rounded-lg bg-lime/10 flex items-center justify-center text-lime">
          <ArrowUpRight className="w-5 h-5" />
        </div>
      </motion.div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Views over time */}
        <Card className="lg:col-span-2 bg-card border-border p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Traffic Analysis</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Project views over the last 30 days</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viewsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#80ff00" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#80ff00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="hsl(195 20% 55%)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(195 20% 55%)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(195 55% 16%)",
                    borderColor: "hsl(195 30% 25%)",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#ffffff" }}
                  labelStyle={{ color: "hsl(195 20% 65%)" }}
                />
                <Area type="monotone" dataKey="views" stroke="#80ff00" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Inquiry status Pie */}
        <Card className="bg-card border-border p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Inquiry Pipeline</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Distribution of inquiry statuses</p>
          </div>
          <div className="h-44 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inquiryStatus.filter((item) => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {inquiryStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(195 55% 16%)",
                    borderColor: "hsl(195 30% 25%)",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {inquiryStatus.every((item) => item.value === 0) && (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                No inquiry data
              </div>
            )}
          </div>
          <div className="flex justify-around text-xs mt-2 border-t border-border pt-4">
            {inquiryStatus.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                <span className="text-muted-foreground">{entry.name}:</span>
                <span className="font-bold text-foreground">{entry.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Projects */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 lg:col-span-1">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Top Performing Projects</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Ranked by case study page views</p>
          </div>
          <div className="space-y-3.5 pt-2">
            {topProjects.length === 0 && (
              <p className="text-xs text-muted-foreground italic py-4">No project views logged yet.</p>
            )}
            {topProjects.map((p, i) => (
              <div key={p.title} className="flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-5 text-xs text-muted-foreground font-bold">#{i + 1}</span>
                  <span className="text-foreground font-medium truncate max-w-[150px]">{p.title}</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-lime font-bold">{p.views}</span>
                  <span className="text-muted-foreground">views</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Traffic Table */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 lg:col-span-2 overflow-hidden">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Real-time Visitors</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Latest case study page hits</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border pb-2">
                  <th className="font-semibold py-2">Project</th>
                  <th className="font-semibold py-2">Referrer</th>
                  <th className="font-semibold py-2 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {recentViews.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-muted-foreground text-center py-6 italic">No traffic recorded</td>
                  </tr>
                )}
                {recentViews.map((v) => (
                  <tr key={v.id} className="text-foreground/95 hover:bg-muted/10">
                    <td className="py-2.5 font-medium max-w-[150px] truncate text-lime">
                      {v.projects?.title || "Unknown"}
                    </td>
                    <td className="py-2.5 max-w-[180px] truncate text-muted-foreground">
                      {v.referrer ? v.referrer.replace(/(^\w+:|^)\/\//, "") : "Direct"}
                    </td>
                    <td className="py-2.5 text-right text-muted-foreground">
                      {new Date(v.viewed_at).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
