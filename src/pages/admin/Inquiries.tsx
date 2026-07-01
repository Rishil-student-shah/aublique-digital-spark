import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Inquiry = Tables<"inquiries">;

const statuses = ["All", "New", "Contacted", "Closed"] as const;

const InquiriesAdmin = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const { toast } = useToast();

  const load = async () => {
    let q = supabase.from("inquiries").select("*").order("created_at", { ascending: false });
    if (filter !== "All") q = q.eq("status", filter);
    const { data } = await q;
    setInquiries(data || []);
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("inquiries").update({ status }).eq("id", id);
    toast({ title: `Status updated to ${status}` });
    load();
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this inquiry?")) return;
    await supabase.from("inquiries").delete().eq("id", id);
    toast({ title: "Inquiry deleted" });
    setSelected(null);
    load();
  };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Business Type", "Message", "Status", "Date"];
    const rows = inquiries.map((i) => [i.name, i.email, i.business_type, `"${i.message.replace(/"/g, '""')}"`, i.status, new Date(i.created_at).toLocaleDateString()]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inquiries.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-bold text-foreground">Client Inquiries</h2>
        <Button variant="outline" onClick={exportCSV} size="sm">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === s ? "bg-lime text-lime-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="p-4 text-left font-medium">Name</th>
                <th className="p-4 text-left font-medium hidden sm:table-cell">Email</th>
                <th className="p-4 text-left font-medium hidden md:table-cell">Date</th>
                <th className="p-4 text-left font-medium">Status</th>
                <th className="p-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {inquiries.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No inquiries.</td></tr>
              )}
              {inquiries.map((inq) => (
                <tr key={inq.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setSelected(inq)}>
                  <td className="p-4 font-medium text-foreground">{inq.name}</td>
                  <td className="p-4 text-muted-foreground hidden sm:table-cell">{inq.email}</td>
                  <td className="p-4 text-muted-foreground hidden md:table-cell">{new Date(inq.created_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      inq.status === "New" ? "bg-lime/10 text-lime" :
                      inq.status === "Contacted" ? "bg-purple/10 text-purple" :
                      "bg-muted text-muted-foreground"
                    }`}>{inq.status}</span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(inq.id); }} className="p-1 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">{selected.name}</h3>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3 text-sm">
                <p><span className="text-muted-foreground">Email:</span> <span className="text-foreground">{selected.email}</span></p>
                <p><span className="text-muted-foreground">Business:</span> <span className="text-foreground">{selected.business_type || "N/A"}</span></p>
                <p><span className="text-muted-foreground">Date:</span> <span className="text-foreground">{new Date(selected.created_at).toLocaleString()}</span></p>
                <div>
                  <p className="text-muted-foreground mb-1">Message:</p>
                  <p className="text-foreground bg-muted rounded-lg p-3">{selected.message}</p>
                </div>
                <div className="pt-2">
                  <p className="text-muted-foreground mb-2">Change Status:</p>
                  <div className="flex gap-2">
                    {["New", "Contacted", "Closed"].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(selected.id, s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          selected.status === s ? "bg-lime text-lime-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InquiriesAdmin;
