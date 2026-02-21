import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, FolderKanban, Flame, TrendingUp } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import ContributionChart from "@/components/ContributionChart";
import ProjectsProgressChart from "@/components/ProjectsProgressChart";
import TodosStatusChart from "@/components/TodosStatusChart";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";

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

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalTodos: 0, completedTodos: 0, totalProjects: 0, streak: 0 });
  const [todos, setTodos] = useState<Todo[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activityData, setActivityData] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
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
      const activeDates = new Set(activities.map((a) => a.activity_date));

      setTodos(todosData);
      setProjects(projectsData);
      setActivityData(activities);

      setStats({
        totalTodos: todosData.length,
        completedTodos: completed,
        totalProjects: projectsData.length || 0,
        streak: calculateStreak(activeDates),
      });
    };
    fetchData();
    // Subscribe to realtime inserts on activity_log so the chart updates immediately
    const channel = supabase.channel(`public:activity_log:user=${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log', filter: `user_id=eq.${user.id}` }, (payload) => {
        const newRow = payload.new as unknown as ActivityEntry;
        setActivityData((prev) => {
          const next = [...prev, newRow];
          // Update streak based on the new list of activity dates
          const activeDates = new Set(next.map((a) => a.activity_date));
          setStats((s) => ({ ...s, streak: calculateStreak(activeDates) }));
          return next;
        });
      })
      .subscribe();

    return () => {
      // cleanup subscription
      // supabase.channel().unsubscribe is available; using removeChannel
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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
        <ContributionChart activityData={activityData} weeks={52} />
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
