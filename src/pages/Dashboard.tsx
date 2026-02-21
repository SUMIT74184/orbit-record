import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, FolderKanban, Flame, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import ContributionChart from "@/components/ContributionChart";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";

interface ActivityEntry {
  activity_date: string;
  count: number;
}

const calculateStreak = (activities: ActivityEntry[]): number => {
  if (!activities.length) return 0;

  // Build a set of dates that have activity
  const activeDates = new Set(activities.map((a) => a.activity_date));
  const today = format(new Date(), "yyyy-MM-dd");
  
  // Start counting from today or yesterday
  let streak = 0;
  let checkDate = new Date();
  
  // If no activity today, start from yesterday
  if (!activeDates.has(today)) {
    checkDate = subDays(checkDate, 1);
    if (!activeDates.has(format(checkDate, "yyyy-MM-dd"))) return 0;
  }

  // Count consecutive days backwards
  while (activeDates.has(format(checkDate, "yyyy-MM-dd"))) {
    streak++;
    checkDate = subDays(checkDate, 1);
  }

  return streak;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalTodos: 0, completedTodos: 0, totalProjects: 0, streak: 0 });
  const [pieData, setPieData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [activityData, setActivityData] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      // Fetch todos, projects, and activity in parallel
      const [todosRes, projectsRes, activityRes] = await Promise.all([
        supabase.from("todos").select("completed").eq("user_id", user.id),
        supabase.from("projects").select("id").eq("user_id", user.id),
        supabase
          .from("activity_log")
          .select("activity_date, count")
          .eq("user_id", user.id)
          .gte("activity_date", format(subDays(new Date(), 182), "yyyy-MM-dd"))
          .order("activity_date", { ascending: true }),
      ]);

      const todos = todosRes.data || [];
      const completed = todos.filter((t) => t.completed).length;
      const active = todos.length - completed;
      const activities = (activityRes.data || []) as ActivityEntry[];

      setActivityData(activities);

      setStats({
        totalTodos: todos.length,
        completedTodos: completed,
        totalProjects: projectsRes.data?.length || 0,
        streak: calculateStreak(activities),
      });

      setPieData([
        { name: "Completed", value: completed, color: "hsl(160, 84%, 39%)" },
        { name: "Active", value: active, color: "hsl(200, 70%, 50%)" },
      ]);
    };
    fetchData();
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
        <ContributionChart activityData={activityData} />
      </motion.div>

      {pieData.some((d) => d.value > 0) && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h3 className="text-sm font-medium mb-4">Task Distribution</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 flex-1">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <div>
                    <div className="text-sm">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.value} tasks</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
