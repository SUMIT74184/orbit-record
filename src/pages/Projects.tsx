import { motion } from "framer-motion";
import { FolderKanban, MoreHorizontal, Clock, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/DashboardLayout";

const projects = [
  { id: 1, name: "Website Redesign", description: "Complete overhaul of the company website", progress: 75, tasks: 24, completed: 18, color: "hsl(160, 84%, 39%)" },
  { id: 2, name: "Mobile App MVP", description: "Build the first version of our mobile app", progress: 45, tasks: 32, completed: 14, color: "hsl(200, 70%, 50%)" },
  { id: 3, name: "API Integration", description: "Connect third-party services to our platform", progress: 90, tasks: 12, completed: 11, color: "hsl(280, 65%, 60%)" },
  { id: 4, name: "Marketing Campaign", description: "Q1 digital marketing initiatives", progress: 30, tasks: 16, completed: 5, color: "hsl(35, 92%, 60%)" },
  { id: 5, name: "Database Migration", description: "Migrate from legacy DB to cloud", progress: 60, tasks: 8, completed: 5, color: "hsl(340, 75%, 55%)" },
  { id: 6, name: "Security Audit", description: "Annual security review and compliance", progress: 15, tasks: 20, completed: 3, color: "hsl(160, 60%, 45%)" },
];

const Projects = () => {
  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">{projects.length} active projects</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="glass-card p-5 hover:border-primary/20 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${project.color}20` }}>
                <FolderKanban size={18} style={{ color: project.color }} />
              </div>
              <button className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal size={18} />
              </button>
            </div>
            <h3 className="font-semibold mb-1">{project.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
            
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-foreground font-medium">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-1.5" />
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                {project.tasks} tasks
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle size={12} />
                {project.completed} done
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Projects;
