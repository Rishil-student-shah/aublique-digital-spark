import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Eye, EyeOff, X, ArrowLeft, Star, Settings2, FileText, Image as ImageIcon, Milestone, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

// Custom Admin Components
import RichTextEditor from "@/components/admin/RichTextEditor";
import ImageUploader from "@/components/admin/ImageUploader";
import TimelineBuilder from "@/components/admin/TimelineBuilder";
import ResultsEditor from "@/components/admin/ResultsEditor";
import GalleryManager from "@/components/admin/GalleryManager";

type Project = Tables<"projects">;

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const emptyProject = {
  title: "",
  slug: "",
  thumbnail: "",
  client_name: "",
  technologies: [] as string[],
  short_description: "",
  full_description: "",
  challenges: "",
  solution: "",
  published: false,
  is_featured: false,
  category: "web-development",
  timeline: [] as any[],
  results: [] as any[],
  gallery: [] as any[],
  testimonial_text: "",
  testimonial_author: "",
  testimonial_role: "",
  display_order: 0,
};

const AdminProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Partial<Project> | null>(null);
  const [activeTab, setActiveTab] = useState<"basic" | "content" | "media" | "timeline" | "results">("basic");
  const [techInput, setTechInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const load = async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });
    setProjects(data || []);
  };

  useEffect(() => {
    load();
    if (searchParams.get("new") === "true") {
      setEditing({ ...emptyProject });
      setSearchParams({});
    }
  }, []);

  const handleSave = async () => {
    if (!editing?.title) {
      toast({ title: "Validation Error", description: "Title is required", variant: "destructive" });
      return;
    }
    setLoading(true);
    const slug = editing.slug || slugify(editing.title);
    
    // Clean up fields to match schema and safety
    const payload = {
      ...editing,
      slug,
      timeline: editing.timeline || [],
      results: editing.results || [],
      gallery: editing.gallery || [],
    };

    let error;
    if (editing.id) {
      ({ error } = await supabase.from("projects").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("projects").insert(payload as any));
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editing.id ? "Project updated successfully" : "Project created successfully" });
      setEditing(null);
      load();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project? This will also delete uploaded assets.")) return;
    
    // Load project first to get images to delete from Storage
    const { data: project } = await supabase.from("projects").select("*").eq("id", id).single();
    if (project) {
      const pathsToDelete: string[] = [];
      
      const extractPath = (url: string) => {
        try {
          const parsed = new URL(url);
          const parts = parsed.pathname.split("/storage/v1/object/public/project-images/");
          return parts[1] || null;
        } catch {
          return null;
        }
      };

      if (project.thumbnail) {
        const path = extractPath(project.thumbnail);
        if (path) pathsToDelete.push(path);
      }

      if (project.gallery && Array.isArray(project.gallery)) {
        project.gallery.forEach((item: any) => {
          if (item?.url) {
            const path = extractPath(item.url);
            if (path) pathsToDelete.push(path);
          }
        });
      }

      if (pathsToDelete.length > 0) {
        await supabase.storage.from("project-images").remove(pathsToDelete);
      }
    }

    await supabase.from("projects").delete().eq("id", id);
    toast({ title: "Project deleted" });
    load();
  };

  const togglePublish = async (p: Project) => {
    const { error } = await supabase.from("projects").update({ published: !p.published }).eq("id", p.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      load();
    }
  };

  const toggleFeatured = async (p: Project) => {
    const { error } = await supabase.from("projects").update({ is_featured: !p.is_featured }).eq("id", p.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      load();
    }
  };

  const addTech = () => {
    if (techInput.trim() && editing) {
      const currentTechs = editing.technologies || [];
      if (!currentTechs.includes(techInput.trim())) {
        setEditing({ ...editing, technologies: [...currentTechs, techInput.trim()] });
      }
      setTechInput("");
    }
  };

  const removeTech = (idx: number) => {
    if (editing) {
      const techs = [...(editing.technologies || [])];
      techs.splice(idx, 1);
      setEditing({ ...editing, technologies: techs });
    }
  };

  const handleTestimonialChange = (
    field: "testimonial_text" | "testimonial_author" | "testimonial_role",
    val: string
  ) => {
    if (editing) {
      setEditing({ ...editing, [field]: val });
    }
  };

  return (
    <div className="space-y-6">
      {!editing ? (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Projects Showcase</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Manage your digital portfolio and client case studies</p>
            </div>
            <Button variant="lime" className="rounded-lg" onClick={() => setEditing({ ...emptyProject })}>
              <Plus className="w-4 h-4 mr-2" /> Add Project
            </Button>
          </div>

          {/* Project list */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
            <div className="divide-y divide-border">
              {projects.length === 0 && <p className="p-10 text-center text-muted-foreground text-sm">No projects added yet.</p>}
              {projects.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-muted/10 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Thumbnail preview */}
                    <div className="w-14 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                      {p.thumbnail ? (
                        <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground truncate text-sm">{p.title}</p>
                        {p.is_featured && <Star className="w-3.5 h-3.5 fill-lime text-lime flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {p.client_name || "Internal"} · <span className="capitalize">{p.category?.replace("-", " ")}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Featured toggle */}
                    <button
                      onClick={() => toggleFeatured(p)}
                      className={cn(
                        "p-2 rounded-lg transition-colors hover:bg-muted",
                        p.is_featured ? "text-lime" : "text-muted-foreground"
                      )}
                      title={p.is_featured ? "Unmark Featured" : "Mark Featured"}
                    >
                      <Star className="w-4 h-4" />
                    </button>

                    {/* Publish toggle */}
                    <button
                      onClick={() => togglePublish(p)}
                      className={cn(
                        "p-2 rounded-lg transition-colors hover:bg-muted",
                        p.published ? "text-lime" : "text-muted-foreground"
                      )}
                      title={p.published ? "Unpublish (Draft)" : "Publish (Live)"}
                    >
                      {p.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => {
                        setEditing(p);
                        setActiveTab("basic");
                        setTechInput("");
                      }}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title="Edit Case Study"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Edit view (Back/Edit layout) */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setEditing(null)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to List
            </button>
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-lg" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button variant="lime" className="rounded-lg" onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save Case Study"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Tabs */}
            <div className="lg:col-span-1 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
              <button
                type="button"
                onClick={() => setActiveTab("basic")}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 border border-transparent w-full text-left whitespace-nowrap",
                  activeTab === "basic"
                    ? "bg-lime/10 text-lime border-lime/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Settings2 className="w-4 h-4" />
                Basic Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("content")}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 border border-transparent w-full text-left whitespace-nowrap",
                  activeTab === "content"
                    ? "bg-lime/10 text-lime border-lime/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <FileText className="w-4 h-4" />
                Case Study Text
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("media")}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 border border-transparent w-full text-left whitespace-nowrap",
                  activeTab === "media"
                    ? "bg-lime/10 text-lime border-lime/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <ImageIcon className="w-4 h-4" />
                Thumb & Gallery
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("timeline")}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 border border-transparent w-full text-left whitespace-nowrap",
                  activeTab === "timeline"
                    ? "bg-lime/10 text-lime border-lime/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Milestone className="w-4 h-4" />
                Project Timeline
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("results")}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 border border-transparent w-full text-left whitespace-nowrap",
                  activeTab === "results"
                    ? "bg-lime/10 text-lime border-lime/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <BarChart className="w-4 h-4" />
                Metrics & Quotes
              </button>
            </div>

            {/* Tab Panels */}
            <div className="lg:col-span-3 bg-card border border-border rounded-xl p-6 shadow-xl min-h-[400px]">
              {/* Basic Tab */}
              {activeTab === "basic" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">
                    Basic Project Settings
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground font-semibold">Project Title</label>
                      <Input
                        placeholder="Project Title (e.g., Spark Finance Portal)"
                        value={editing.title || ""}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            title: e.target.value,
                            slug: slugify(e.target.value),
                          })
                        }
                        className="bg-muted border-border h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground font-semibold">Slug (Auto-generated)</label>
                      <Input
                        placeholder="slug-url"
                        value={editing.slug || ""}
                        onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                        className="bg-muted border-border h-11 text-muted-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground font-semibold">Client Name</label>
                      <Input
                        placeholder="Client / Brand Name"
                        value={editing.client_name || ""}
                        onChange={(e) => setEditing({ ...editing, client_name: e.target.value })}
                        className="bg-muted border-border h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground font-semibold">Project Category</label>
                      <select
                        value={editing.category || "web-development"}
                        onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                        className="flex h-11 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-lime"
                      >
                        <option value="web-development">Web Development</option>
                        <option value="mobile-apps">Mobile Apps</option>
                        <option value="crm-erp">CRM / ERP Systems</option>
                        <option value="cyber-security">Cyber Security</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground font-semibold">Completion Date</label>
                      <Input
                        type="date"
                        value={editing.completion_date || ""}
                        onChange={(e) => setEditing({ ...editing, completion_date: e.target.value })}
                        className="bg-muted border-border h-11 text-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground font-semibold">Display Order (for sorting)</label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={editing.display_order ?? ""}
                        onChange={(e) => setEditing({ ...editing, display_order: parseInt(e.target.value) || 0 })}
                        className="bg-muted border-border h-11 text-foreground"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs text-muted-foreground font-semibold">Technologies / Tools Stack</label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Add tool/tech (e.g. React, Docker) and press Enter"
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
                        className="bg-muted border-border h-10"
                      />
                      <Button type="button" variant="outline" onClick={addTech} size="sm" className="h-10 border-border">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(editing.technologies || []).map((t, i) => (
                        <span
                          key={i}
                          className="bg-muted border border-border text-foreground px-3 py-1 rounded-full text-xs flex items-center gap-1.5 font-medium"
                        >
                          {t}
                          <button
                            type="button"
                            onClick={() => removeTech(i)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-8 pt-4 border-t border-border mt-4">
                    <label className="flex items-center gap-2.5 text-sm text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editing.published || false}
                        onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
                        className="w-4 h-4 rounded border-border bg-muted accent-lime cursor-pointer"
                      />
                      Publish Project (make public)
                    </label>
                    <label className="flex items-center gap-2.5 text-sm text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editing.is_featured || false}
                        onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })}
                        className="w-4 h-4 rounded border-border bg-muted accent-lime cursor-pointer"
                      />
                      Highlight as Featured (shows at top of Works grid)
                    </label>
                  </div>
                </div>
              )}

              {/* Content Tab */}
              {activeTab === "content" && (
                <div className="space-y-5">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">
                    Case Study Description & Analysis
                  </h3>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-semibold">Short Summary / Tagline</label>
                    <Textarea
                      placeholder="Brief one-sentence description showing in cards"
                      value={editing.short_description || ""}
                      onChange={(e) => setEditing({ ...editing, short_description: e.target.value })}
                      className="bg-muted border-border min-h-[60px] resize-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-semibold">Full Overview Description</label>
                    <RichTextEditor
                      value={editing.full_description || ""}
                      onChange={(val) => setEditing({ ...editing, full_description: val })}
                      placeholder="Write detail project overview narrative..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-semibold">Challenges Encountered</label>
                    <RichTextEditor
                      value={editing.challenges || ""}
                      onChange={(val) => setEditing({ ...editing, challenges: val })}
                      placeholder="Detail the technical or business challenges..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-semibold">Solutions Implemented</label>
                    <RichTextEditor
                      value={editing.solution || ""}
                      onChange={(val) => setEditing({ ...editing, solution: val })}
                      placeholder="Describe the solution architecture and engineering process..."
                    />
                  </div>
                </div>
              )}

              {/* Media Tab */}
              {activeTab === "media" && (
                <div className="space-y-6">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">
                    Thumbnail & Mockups
                  </h3>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-semibold">Cover Thumbnail Image</label>
                    <ImageUploader
                      value={editing.thumbnail || ""}
                      onChange={(url) => setEditing({ ...editing, thumbnail: url })}
                      folder="covers"
                    />
                  </div>
                  <div className="border-t border-border pt-4">
                    <GalleryManager
                      value={editing.gallery || []}
                      onChange={(items) => setEditing({ ...editing, gallery: items })}
                    />
                  </div>
                </div>
              )}

              {/* Timeline Tab */}
              {activeTab === "timeline" && (
                <TimelineBuilder
                  value={editing.timeline || []}
                  onChange={(items) => setEditing({ ...editing, timeline: items })}
                />
              )}

              {/* Results Tab */}
              {activeTab === "results" && (
                <ResultsEditor
                  results={editing.results || []}
                  testimonialText={editing.testimonial_text || ""}
                  testimonialAuthor={editing.testimonial_author || ""}
                  testimonialRole={editing.testimonial_role || ""}
                  onResultsChange={(items) => setEditing({ ...editing, results: items })}
                  onTestimonialChange={handleTestimonialChange}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProjects;
