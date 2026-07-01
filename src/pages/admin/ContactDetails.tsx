import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ContactDetailsAdmin = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    id: "",
    email: "",
    phone: "",
    address: "",
    instagram: "",
    linkedin: "",
    twitter: "",
  });

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("contact_details").select("*").limit(1).single();
      if (data) {
        const sl = (data.social_links as any) || {};
        setForm({
          id: data.id,
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          instagram: sl.instagram || "",
          linkedin: sl.linkedin || "",
          twitter: sl.twitter || "",
        });
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase.from("contact_details").update({
      email: form.email,
      phone: form.phone,
      address: form.address,
      social_links: { instagram: form.instagram, linkedin: form.linkedin, twitter: form.twitter },
    }).eq("id", form.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Contact details updated" });
    }
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl space-y-6">
      <h2 className="text-xl font-bold text-foreground">Contact Details</h2>
      <p className="text-muted-foreground text-sm">Changes will reflect on the Contact page instantly.</p>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <Input placeholder="Company Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-muted border-border h-11" />
        <Input placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-muted border-border h-11" />
        <Input placeholder="Office Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="bg-muted border-border h-11" />

        <div className="pt-2">
          <p className="text-sm font-medium text-foreground mb-3">Social Links</p>
          <div className="space-y-3">
            <Input placeholder="Instagram URL" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} className="bg-muted border-border h-10" />
            <Input placeholder="LinkedIn URL" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} className="bg-muted border-border h-10" />
            <Input placeholder="Twitter / X URL" value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} className="bg-muted border-border h-10" />
          </div>
        </div>

        <Button variant="lime" onClick={handleSave} disabled={loading} className="w-full">
          <Save className="w-4 h-4 mr-2" /> {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </motion.div>
  );
};

export default ContactDetailsAdmin;
