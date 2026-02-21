import { motion } from "framer-motion";
import { CheckCircle, FolderKanban, Flame, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import ContributionChart from "@/components/ContributionChart";

const pieData = [
  { name: "Completed", value: 42, color: "hsl(160, 84%, 39%)" },
  { name: "In Progress", value: 18, color: "hsl(200, 70%, 50%)" },
  { name: "Pending", value: 8, color: "hsl(35, 92%, 60%)" },
  { name: "Overdue", value: 4, color: "hsl(0, 72%, 51%)" },
];

const progressData = [
  { month: "Jan", tasks: 12, projects: 2 },
  { month: "Feb", tasks: 18, projects: 3 },
  { month: "Mar", tasks: 25, projects: 3 },
  { month: "Apr", tasks: 22, projects: 4 },
  { month: "May", tasks: 35, projects: 5 },
  { month: "Jun", tasks: 42, projects: 6 },
  { month: "Jul", tasks: 38, projects: 5 },
];

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your progress overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={CheckCircle} title="Tasks Done" value={42} change="+12 this week" delay={0} />
        <StatsCard icon={FolderKanban} title="Active Projects" value={6} change="2 near deadline" delay={0.1} />
        <StatsCard icon={Flame} title="Day Streak" value={23} change="Personal best!" delay={0.2} />
        <StatsCard icon={TrendingUp} title="Completion Rate" value="87%" change="+5% vs last month" delay={0.3} />
      </div>

      {/* Contribution Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <ContributionChart />
      </motion.div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Progress Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h3 className="text-sm font-medium mb-4">Progress Over Time</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={progressData}>
              <defs>
                <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
              <XAxis dataKey="month" stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222, 18%, 11%)",
                  border: "1px solid hsl(220, 15%, 18%)",
                  borderRadius: "8px",
                  color: "hsl(210, 20%, 92%)",
                }}
              />
              <Area type="monotone" dataKey="tasks" stroke="hsl(160, 84%, 39%)" fill="url(#colorTasks)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="text-sm font-medium mb-4">Task Distribution</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
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
                  <div className="flex-1">
                    <div className="text-sm">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.value} tasks</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
