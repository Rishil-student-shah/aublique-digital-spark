import { Plus, X, ChevronUp, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Milestone {
  phase: string;
  date: string;
  description: string;
}

interface TimelineBuilderProps {
  value: Milestone[];
  onChange: (milestones: Milestone[]) => void;
}

const TimelineBuilder = ({ value, onChange }: TimelineBuilderProps) => {
  const addMilestone = () => {
    onChange([...value, { phase: "", date: "", description: "" }]);
  };

  const removeMilestone = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: keyof Milestone, fieldValue: string) => {
    const updated = value.map((m, i) =>
      i === index ? { ...m, [field]: fieldValue } : m
    );
    onChange(updated);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...value];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onChange(updated);
  };

  const moveDown = (index: number) => {
    if (index === value.length - 1) return;
    const updated = [...value];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Project Timeline</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add milestones to show the project progression
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addMilestone}
          className="rounded-lg border-border text-foreground hover:bg-lime/10 hover:text-lime hover:border-lime/30"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Phase
        </Button>
      </div>

      {value.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed border-border bg-muted/20">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
            <Plus className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No milestones yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Click "Add Phase" to create your first milestone
          </p>
        </div>
      ) : (
        <div className="space-y-0">
          {/* Editor list */}
          {value.map((milestone, index) => (
            <div key={index} className="flex gap-4 group">
              {/* Timeline visual */}
              <div className="flex flex-col items-center pt-4 flex-shrink-0">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                    milestone.phase
                      ? "bg-lime/15 border-lime text-lime"
                      : "bg-muted border-border text-muted-foreground"
                  )}
                >
                  {index + 1}
                </div>
                {index < value.length - 1 && (
                  <div className="w-0.5 flex-1 min-h-[24px] bg-border mt-2" />
                )}
              </div>

              {/* Milestone form */}
              <div className="flex-1 pb-6">
                <div className="bg-card border border-border rounded-xl p-4 space-y-3 transition-all hover:border-muted-foreground/30">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        value={milestone.phase}
                        onChange={(e) => updateMilestone(index, "phase", e.target.value)}
                        placeholder="Phase name (e.g., Discovery)"
                        className="rounded-lg bg-muted border-border text-foreground placeholder:text-muted-foreground/60 h-10"
                      />
                      <Input
                        value={milestone.date}
                        onChange={(e) => updateMilestone(index, "date", e.target.value)}
                        placeholder="Date / Duration (e.g., Week 1-2)"
                        className="rounded-lg bg-muted border-border text-foreground placeholder:text-muted-foreground/60 h-10"
                      />
                    </div>

                    {/* Reorder & delete controls */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveDown(index)}
                        disabled={index === value.length - 1}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeMilestone(index)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Remove milestone"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <Textarea
                    value={milestone.description}
                    onChange={(e) => updateMilestone(index, "description", e.target.value)}
                    placeholder="Describe what happens in this phase..."
                    className="rounded-lg bg-muted border-border text-foreground placeholder:text-muted-foreground/60 min-h-[72px] resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live preview */}
      {value.length > 0 && value.some((m) => m.phase) && (
        <div className="mt-6">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Preview
          </h4>
          <div className="bg-muted/30 rounded-xl p-5 border border-border">
            <div className="space-y-0">
              {value
                .filter((m) => m.phase)
                .map((milestone, index, arr) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-7 h-7 rounded-full bg-lime/15 border border-lime/40 flex items-center justify-center">
                        <span className="text-xs font-bold text-lime">{index + 1}</span>
                      </div>
                      {index < arr.length - 1 && (
                        <div className="w-px flex-1 min-h-[20px] bg-lime/20 mt-1" />
                      )}
                    </div>
                    <div className="pb-5 flex-1">
                      <p className="text-sm font-semibold text-foreground">{milestone.phase}</p>
                      {milestone.date && (
                        <p className="text-xs text-lime mt-0.5">{milestone.date}</p>
                      )}
                      {milestone.description && (
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {milestone.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineBuilder;
