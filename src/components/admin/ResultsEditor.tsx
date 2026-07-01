import { Plus, X, Quote } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Zap,
  TrendingUp,
  Shield,
  Clock,
  Users,
  Star,
  Globe,
  Percent,
} from "lucide-react";

interface ResultMetric {
  label: string;
  value: string;
  icon: string;
}

interface ResultsEditorProps {
  results: ResultMetric[];
  testimonialText: string;
  testimonialAuthor: string;
  testimonialRole: string;
  onResultsChange: (results: ResultMetric[]) => void;
  onTestimonialChange: (field: "testimonial_text" | "testimonial_author" | "testimonial_role", value: string) => void;
}

const ICON_OPTIONS = [
  { value: "zap", label: "Zap", Icon: Zap },
  { value: "trending-up", label: "Trending Up", Icon: TrendingUp },
  { value: "shield", label: "Shield", Icon: Shield },
  { value: "clock", label: "Clock", Icon: Clock },
  { value: "users", label: "Users", Icon: Users },
  { value: "star", label: "Star", Icon: Star },
  { value: "globe", label: "Globe", Icon: Globe },
  { value: "percent", label: "Percent", Icon: Percent },
] as const;

const getIconComponent = (iconName: string) => {
  const found = ICON_OPTIONS.find((o) => o.value === iconName);
  if (!found) return Zap;
  return found.Icon;
};

const ResultsEditor = ({
  results,
  testimonialText,
  testimonialAuthor,
  testimonialRole,
  onResultsChange,
  onTestimonialChange,
}: ResultsEditorProps) => {
  const addMetric = () => {
    onResultsChange([...results, { label: "", value: "", icon: "zap" }]);
  };

  const removeMetric = (index: number) => {
    onResultsChange(results.filter((_, i) => i !== index));
  };

  const updateMetric = (index: number, field: keyof ResultMetric, fieldValue: string) => {
    const updated = results.map((m, i) =>
      i === index ? { ...m, [field]: fieldValue } : m
    );
    onResultsChange(updated);
  };

  return (
    <div className="space-y-8">
      {/* ───────────────────── Metrics Section ───────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Key Results & Metrics</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Showcase the impact with measurable results
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addMetric}
            className="rounded-lg border-border text-foreground hover:bg-lime/10 hover:text-lime hover:border-lime/30"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Metric
          </Button>
        </div>

        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 rounded-xl border border-dashed border-border bg-muted/20">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No metrics yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Add metrics like "3x faster" or "99.9% uptime"
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((metric, index) => {
              const IconComp = getIconComponent(metric.icon);
              return (
                <div
                  key={index}
                  className="flex items-start gap-3 bg-card border border-border rounded-xl p-4 group hover:border-muted-foreground/30 transition-all"
                >
                  {/* Icon preview */}
                  <div className="w-10 h-10 rounded-lg bg-lime/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <IconComp className="w-5 h-5 text-lime" />
                  </div>

                  {/* Fields */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      value={metric.value}
                      onChange={(e) => updateMetric(index, "value", e.target.value)}
                      placeholder="Value (e.g., 3x)"
                      className="rounded-lg bg-muted border-border text-foreground placeholder:text-muted-foreground/60 h-10"
                    />
                    <Input
                      value={metric.label}
                      onChange={(e) => updateMetric(index, "label", e.target.value)}
                      placeholder="Label (e.g., Performance Boost)"
                      className="rounded-lg bg-muted border-border text-foreground placeholder:text-muted-foreground/60 h-10"
                    />
                    <Select
                      value={metric.icon}
                      onValueChange={(val) => updateMetric(index, "icon", val)}
                    >
                      <SelectTrigger className="rounded-lg bg-muted border-border text-foreground h-10">
                        <SelectValue placeholder="Icon" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {ICON_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <span className="flex items-center gap-2">
                              <opt.Icon className="w-4 h-4 text-lime" />
                              {opt.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => removeMetric(index)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                    title="Remove metric"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* ───────────────────── Testimonial Section ───────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple/15 flex items-center justify-center">
            <Quote className="w-4 h-4 text-purple" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Client Testimonial</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add a quote from the client about the project
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <Textarea
            value={testimonialText}
            onChange={(e) => onTestimonialChange("testimonial_text", e.target.value)}
            placeholder="What the client said about the project..."
            className="rounded-lg bg-muted border-border text-foreground placeholder:text-muted-foreground/60 min-h-[100px] resize-none"
            rows={4}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              value={testimonialAuthor}
              onChange={(e) => onTestimonialChange("testimonial_author", e.target.value)}
              placeholder="Author name (e.g., John Doe)"
              className="rounded-lg bg-muted border-border text-foreground placeholder:text-muted-foreground/60 h-10"
            />
            <Input
              value={testimonialRole}
              onChange={(e) => onTestimonialChange("testimonial_role", e.target.value)}
              placeholder="Role (e.g., CEO at Company)"
              className="rounded-lg bg-muted border-border text-foreground placeholder:text-muted-foreground/60 h-10"
            />
          </div>

          {/* Testimonial preview */}
          {testimonialText && (
            <div className="mt-3 p-4 bg-muted/30 rounded-lg border border-border/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Preview
              </p>
              <blockquote className="text-sm text-foreground italic leading-relaxed border-l-2 border-lime pl-3">
                "{testimonialText}"
              </blockquote>
              {(testimonialAuthor || testimonialRole) && (
                <p className="text-xs text-muted-foreground mt-2">
                  — {testimonialAuthor}
                  {testimonialRole && (
                    <span className="text-lime"> · {testimonialRole}</span>
                  )}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsEditor;
