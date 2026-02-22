import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FolderKanban, Plus, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Project {
  id: string;
  name: string;
  description: string | null;
  progress: number;
  created_at: string;
}

const projectColors = [
  "hsl(160, 84%, 39%)", "hsl(200, 70%, 50%)", "hsl(280, 65%, 60%)",
  "hsl(35, 92%, 60%)", "hsl(340, 75%, 55%)", "hsl(160, 60%, 45%)",
];

const Projects = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchProjects = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setProjects(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, [user]);

  const logActivity = async (activityType: string) => {
    if (!user) return;
    const today = format(new Date(), "yyyy-MM-dd");
    const { data: existing } = await supabase
      .from("activity_log")
      .select("count")
      .eq("user_id", user.id)
      .eq("activity_date", today)
      .maybeSingle();
    
    if (existing) {
      await supabase
        .from("activity_log")
        .update({ count: (existing.count || 0) + 1 })
        .eq("user_id", user.id)
        .eq("activity_date", today);
    } else {
      await supabase.from("activity_log").insert({
        user_id: user.id,
        activity_type: activityType,
        activity_date: today,
        count: 1,
      });
    }
  };

  const createProject = async () => {
    if (!newName.trim() || !user) return;
    const { data, error } = await supabase
      .from("projects")
      .insert({ name: newName.trim(), description: newDesc.trim() || null, user_id: user.id })
      .select()
      .single();
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else if (data) {
      setProjects([data, ...projects]);
      setNewName("");
      setNewDesc("");
      setDialogOpen(false);
      await logActivity("project_created");
    }
  };

  const deleteProject = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this project?");
    if (!confirmed) return;

    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setProjects(projects.filter((p) => p.id !== id));
  };

  const updateProgress = async (id: string, progress: number) => {
    // Optimistic update
    setProjects(projects.map((p) => (p.id === id ? { ...p, progress } : p)));
    
    const { error } = await supabase
      .from("projects")
      .update({ progress })
      .eq("id", id);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      fetchProjects(); // revert
    } else if (progress === 100 && user) {
      // Log completion activity so the contribution chart can show it
      await logActivity("project_completed");
      toast({ title: "🎉 Project completed!", description: "Great job finishing this project!" });
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero"><Plus size={16} /> New Project</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <Input placeholder="Project name" value={newName} onChange={(e) => setNewName(e.target.value)} className="bg-secondary border-border" />
              <Textarea placeholder="Description (optional)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="bg-secondary border-border" />
              <Button variant="hero" className="w-full" onClick={createProject}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <FolderKanban size={48} className="mx-auto mb-4 opacity-50" />
          <p>No projects yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project, i) => {
            const color = projectColors[i % projectColors.length];
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="glass-card p-5 hover:border-primary/20 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
                    <FolderKanban size={18} style={{ color }} />
                  </div>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <h3 className="font-semibold mb-1">{project.name}</h3>
                {project.description && <p className="text-sm text-muted-foreground mb-4">{project.description}</p>}
                
                {/* Progress with interactive slider */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className={`font-medium ${project.progress === 100 ? "text-primary" : "text-foreground"}`}>
                      {project.progress}%{project.progress === 100 && " ✓"}
                    </span>
                  </div>
                  <Progress value={project.progress} className="h-2 mb-2" />
                  <Slider
                    value={[project.progress]}
                    onValueCommit={(val) => updateProgress(project.id, val[0])}
                    max={100}
                    step={5}
                    className="cursor-pointer"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Projects;
