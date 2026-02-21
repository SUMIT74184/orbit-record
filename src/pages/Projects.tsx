import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FolderKanban, MoreHorizontal, Clock, CheckCircle, Plus, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
      await supabase.from("activity_log").insert({ user_id: user.id, activity_type: "project_created" });
    }
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setProjects(projects.filter((p) => p.id !== id));
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
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-1.5" />
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
