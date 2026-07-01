import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FolderOpen, MessageSquare, Plus, Clock, Eye, Star, Layout, ArrowUpRight, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Stats {
  projects: number;
  published: number;
  inquiries: number;
  newInquiries: number;
}

interface ProjectViewCount {
  title: string;
  category: string;
  views: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({ projects: 0, published: 0, inquiries: 0, newInquiries: 0 });
  const [recentInquiries, setRecentInquiries] = useState<any[]>([]);
  const [inquiryChartData, setInquiryChartData] = useState<any[]>([]);
  const [popularProjects, setPopularProjects] = useState<ProjectViewCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [{ count: totalPc }, { count: pubPc }, { count: totalIc }, { data: recentIc }] = await Promise.all([
          supabase.from("projects").select("*", { count: "exact", head: true }),
          supabase.from("projects").select("*", { count: "exact", head: true }).eq("published", true),
          supabase.from("inquiries").select("*", { count: "exact", head: true }),
          supabase.from("inquiries").select("*").order("created_at", { ascending: false }).limit(5),
        ]);

        // Calculate new inquiries in last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { count: newIc } = await supabase
          .from("inquiries")
          .select("*", { count: "exact", head: true })
          .gte("created_at", sevenDaysAgo.toISOString());

        setStats({
          projects: totalPc || 0,
          published: pubPc || 0,
          inquiries: totalIc || 0,
          newInquiries: newIc || 0,
        });
        setRecentInquiries(recentIc || []);

        // 30 day inquiry trend data
        const { data: trendData } = await supabase
          .from("inquiries")
          .select("created_at")
          .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        const days = [];
        for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
          const count = (trendData || []).filter((inq) => {
            const inqDate = new Date(inq.created_at);
            return (
              inqDate.getDate() === d.getDate() &&
              inqDate.getMonth() === d.getMonth() &&
              inqDate.getFullYear() === d.getFullYear()
            );
          }).length;
          days.push({ date: dateStr, inquiries: count });
        }
        setInquiryChartData(days);

        // Fetch top viewed projects
        const { data: viewsData } = await supabase
          .from("project_views")
          .select("project_id, projects(title, category)");

        const counts: Record<string, { title: string; category: string; views: number }> = {};
        (viewsData || []).forEach((v) => {
          if (v.project_id && v.projects) {
            if (!counts[v.project_id]) {
              counts[v.project_id] = {
                title: v.projects.title,
                category: v.projects.category || "web-development",
                views: 0,
              };
            }
            counts[v.project_id].views++;
          }
        });

        const sorted = Object.values(counts)
          .sort((a, b) => b.views - a.views)
          .slice(0, 3);
        setPopularProjects(sorted);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const statCards = [
    { label: "Total Projects", value: stats.projects, icon: FolderOpen, to: "/admin/projects", color: "text-purple", bg: "bg-purple/10" },
    { label: "Live Works", value: stats.published, icon: Layout, to: "/admin/projects", color: "text-lime", bg: "bg-lime/10" },
    { label: "Inquiries Box", value: stats.inquiries, icon: MessageSquare, to: "/admin/inquiries", color: "text-purple", bg: "bg-purple/10" },
    { label: "New (Last 7d)", value: stats.newInquiries, icon: Clock, to: "/admin/inquiries", color: "text-lime", bg: "bg-lime/10" },
  ];

  const exportInquiries = async () => {
    const { data } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false });
    if (!data || data.length === 0) return;
    const headers = ["Name", "Email", "Business Type", "Message", "Status", "Created At"];
    const csvRows = [headers.join(",")];
    data.forEach((inq) => {
      const row = [
        `"${inq.name.replace(/"/g, '""')}"`,
        `"${inq.email}"`,
        `"${(inq.business_type || "").replace(/"/g, '""')}"`,
        `"${inq.message.replace(/"/g, '""')}"`,
        `"${inq.status}"`,
        `"${new Date(inq.created_at).toLocaleString()}"`,
      ];
      csvRows.push(row.join(","));
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inquiries_export_${Date.now()}.csv`;
    a.click();
  };

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            className="bg-card border border-border rounded-xl p-5 cursor-pointer shadow-md hover:border-muted-foreground/20 transition-all duration-200"
          >
            <Link to={s.to} className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">{s.label}</p>
                <p className="text-3xl font-bold text-foreground mt-1.5">{s.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Action row */}
      <div className="flex flex-wrap gap-3">
        <Link to="/admin/projects?new=true">
          <Button variant="lime" className="rounded-lg">
            <Plus className="w-4 h-4 mr-2" /> Add Project
          </Button>
        </Link>
        <Link to="/admin/analytics">
          <Button variant="outline" className="rounded-lg border-border hover:bg-purple/10 hover:text-purple hover:border-purple/30">
            <BarChart2 className="w-4 h-4 mr-2" /> View Analytics
          </Button>
        </Link>
        <Button
          variant="outline"
          onClick={exportInquiries}
          className="rounded-lg border-border hover:bg-lime/10 hover:text-lime hover:border-lime/30"
        >
          <ArrowUpRight className="w-4 h-4 mr-2" /> Export CSV
        </Button>
        <a href="/" target="_blank" rel="noreferrer">
          <Button variant="outline" className="rounded-lg border-border hover:bg-muted">
            <Eye className="w-4 h-4 mr-2" /> View Public Site
          </Button>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 space-y-4 shadow-md">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Inquiry Intake Trends</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Submissions count over the last 30 days</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={inquiryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInquiries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="hsl(195 20% 55%)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(195 20% 55%)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(195 55% 16%)",
                    borderColor: "hsl(195 30% 25%)",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#ffffff" }}
                  labelStyle={{ color: "hsl(195 20% 65%)" }}
                />
                <Area type="monotone" dataKey="inquiries" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorInquiries)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular list */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-md">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Star className="w-4 h-4 text-lime" /> Trending Case Studies
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Most viewed public projects</p>
          </div>
          <div className="space-y-4 pt-2">
            {popularProjects.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-4">No hits logged yet.</p>
            ) : (
              popularProjects.map((p, i) => (
                <div key={p.title} className="flex items-center justify-between text-sm gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">{p.category.replace("-", " ")}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs bg-lime/10 text-lime px-2 py-1 rounded-md font-bold">
                    <span>{p.views}</span>
                    <span>hits</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Inquiries */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-md">
        <div className="p-5 border-b border-border flex items-center gap-2">
          <Clock className="w-4 h-4 text-lime" />
          <h2 className="text-sm font-semibold text-foreground">Recent Client Inquiries</h2>
        </div>
        <div className="divide-y divide-border">
          {recentInquiries.length === 0 && (
            <p className="p-8 text-center text-muted-foreground text-sm">No client inquiries received yet.</p>
          )}
          {recentInquiries.map((inq) => (
            <div key={inq.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
              <div>
                <p className="font-semibold text-foreground text-sm">{inq.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{inq.email}</p>
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${
                inq.status === "New" ? "bg-lime/15 text-lime border border-lime/20" :
                inq.status === "Contacted" ? "bg-purple/15 text-purple border border-purple/20" :
                "bg-muted text-muted-foreground border border-border"
              }`}>
                {inq.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
