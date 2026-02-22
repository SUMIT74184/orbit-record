import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, FolderKanban, Flame, TrendingUp, GitCommit, GitBranch } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import ContributionChart from "@/components/ContributionChart";
import ContributionChartGithubStyle from "@/components/ContributionChartGithubStyle";
import ProjectsProgressChart from "@/components/ProjectsProgressChart";
import TodosStatusChart from "@/components/TodosStatusChart";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ActivityEntry {
  activity_date: string;
  count: number;
}

interface Todo {
  completed: boolean;
}

interface Project {
  id: string;
  name: string;
  progress: number;
}

const calculateStreak = (activeDates: Set<string>): number => {
  if (activeDates.size === 0) return 0;

  const today = format(new Date(), "yyyy-MM-dd");
  
  let streak = 0;
  let checkDate = new Date();
  
  if (!activeDates.has(today)) {
    checkDate = subDays(checkDate, 1);
    if (!activeDates.has(format(checkDate, "yyyy-MM-dd"))) return 0;
  }

  while (activeDates.has(format(checkDate, "yyyy-MM-dd"))) {
    streak++;
    checkDate = subDays(checkDate, 1);
  }

  return streak;
};

type ChartStyle = "default" | "github";
type Theme = "default" | "github" | "gitlab" | "halloween";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalTodos: 0, completedTodos: 0, totalProjects: 0, streak: 0 });
  const [todos, setTodos] = useState<Todo[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activityData, setActivityData] = useState<ActivityEntry[]>([]);
  const [chartStyle, setChartStyle] = useState<ChartStyle>("default");
  const [theme, setTheme] = useState<Theme>("default");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    const [todosRes, projectsRes, activityRes] = await Promise.all([
      supabase.from("todos").select("completed").eq("user_id", user.id),
      supabase.from("projects").select("id, name, progress").eq("user_id", user.id).order('created_at', { ascending: false }),
      supabase
        .from("activity_log")
        .select("activity_date, count")
        .eq("user_id", user.id)
        .gte("activity_date", format(subDays(new Date(), 365), "yyyy-MM-dd"))
        .order("activity_date", { ascending: true }),
    ]);

    const todosData = todosRes.data || [];
    const projectsData = projectsRes.data || [];
    const completed = todosData.filter((t) => t.completed).length;
    const activities = (activityRes.data || []) as ActivityEntry[];

    const map = new Map<string, number>();
    activities.forEach((a) => {
      const d = a.activity_date;
      map.set(d, (map.get(d) || 0) + (a.count || 0));
    });
    const aggregated = Array.from(map.entries()).map(([activity_date, count]) => ({ activity_date, count } as ActivityEntry))
      .sort((a, b) => a.activity_date.localeCompare(b.activity_date));

    const activeDates = new Set(aggregated.map((a) => a.activity_date));

    setTodos(todosData);
    setProjects(projectsData);
    setActivityData(aggregated);

    setStats({
      totalTodos: todosData.length,
      completedTodos: completed,
      totalProjects: projectsData.length || 0,
      streak: calculateStreak(activeDates),
    });
  };

  useEffect(() => {
    if (!user) return;
    
    fetchDashboardData();

    const channel = supabase.channel(`public:activity_log:user=${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_log', filter: `user_id=eq.${user.id}` }, () => {
        fetchDashboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos', filter: `user_id=eq.${user.id}` }, () => {
        fetchDashboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects', filter: `user_id=eq.${user.id}` }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch (e) { /* ignore */ }
    };
  }, [user]);

  const completionRate = stats.totalTodos > 0 ? Math.round((stats.completedTodos / stats.totalTodos) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your progress overview.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={CheckCircle} title="Tasks Done" value={stats.completedTodos} change={`${stats.totalTodos} total`} delay={0} />
        <StatsCard icon={FolderKanban} title="Projects" value={stats.totalProjects} delay={0.1} />
        <StatsCard icon={Flame} title="Day Streak" value={stats.streak} change={stats.streak > 0 ? "🔥 Keep going!" : "Start today!"} delay={0.2} />
        <StatsCard icon={TrendingUp} title="Completion" value={`${completionRate}%`} delay={0.3} />
      </div>

      <div className="flex justify-end items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="chart-style-switch" className="flex gap-2 items-center text-sm">
            <GitCommit size={16} /> Default
          </Label>
          <Switch
            id="chart-style-switch"
            checked={chartStyle === 'github'}
            onCheckedChange={(checked) => setChartStyle(checked ? 'github' : 'default')}
          />
          <Label htmlFor="chart-style-switch" className="flex gap-2 items-center text-sm">
            <GitBranch size={16} /> GitHub Style
          </Label>
        </div>
        <div className="w-48">
          <Select value={theme} onValueChange={(value) => setTheme(value as Theme)}>
            <SelectTrigger>
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="github">GitHub</SelectItem>
              <SelectItem value="gitlab">GitLab</SelectItem>
              <SelectItem value="halloween">Halloween</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
        {chartStyle === 'default' ? (
          <ContributionChart activityData={activityData} weeks={52} />
        ) : (
          <ContributionChartGithubStyle activityData={activityData} weeks={52} />
        )}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.4 }} 
        className="grid lg:grid-cols-2 gap-8 mt-8"
      >
        <ProjectsProgressChart projects={projects} />
        <TodosStatusChart todos={todos} />
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
