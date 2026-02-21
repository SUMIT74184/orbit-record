import { motion } from "framer-motion";
import { Users, Activity, TrendingUp, AlertTriangle, MoreHorizontal, Shield } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";

const userActivity = [
  { day: "Mon", users: 120 },
  { day: "Tue", users: 180 },
  { day: "Wed", users: 150 },
  { day: "Thu", users: 220 },
  { day: "Fri", users: 200 },
  { day: "Sat", users: 90 },
  { day: "Sun", users: 75 },
];

const recentUsers = [
  { id: 1, name: "Sarah Johnson", email: "sarah@example.com", status: "active", tasks: 45, joined: "2 days ago" },
  { id: 2, name: "Mike Chen", email: "mike@example.com", status: "active", tasks: 32, joined: "5 days ago" },
  { id: 3, name: "Emily Davis", email: "emily@example.com", status: "inactive", tasks: 12, joined: "1 week ago" },
  { id: 4, name: "Alex Wilson", email: "alex@example.com", status: "active", tasks: 67, joined: "2 weeks ago" },
  { id: 5, name: "Lisa Park", email: "lisa@example.com", status: "suspended", tasks: 3, joined: "3 weeks ago" },
];

const statusColors: Record<string, string> = {
  active: "bg-primary/15 text-primary border-primary/30",
  inactive: "bg-muted text-muted-foreground border-border",
  suspended: "bg-destructive/15 text-destructive border-destructive/30",
};

const Admin = () => {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={20} className="text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="text-muted-foreground">Monitor users, activity, and system health.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={Users} title="Total Users" value="1,284" change="+48 this week" delay={0} />
        <StatsCard icon={Activity} title="Active Now" value="342" change="26.6% active" delay={0.1} />
        <StatsCard icon={TrendingUp} title="Tasks Created" value="8,421" change="+1.2k this month" delay={0.2} />
        <StatsCard icon={AlertTriangle} title="Flagged" value="3" change="Needs attention" delay={0.3} />
      </div>

      {/* User Activity Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 mb-8">
        <h3 className="text-sm font-medium mb-4">User Activity (This Week)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={userActivity}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
            <XAxis dataKey="day" stroke="hsl(215, 15%, 55%)" fontSize={12} />
            <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222, 18%, 11%)",
                border: "1px solid hsl(220, 15%, 18%)",
                borderRadius: "8px",
                color: "hsl(210, 20%, 92%)",
              }}
            />
            <Bar dataKey="users" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Users Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <h3 className="text-sm font-medium">Recent Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 text-xs text-muted-foreground">
                <th className="text-left p-4 font-medium">User</th>
                <th className="text-left p-4 font-medium hidden sm:table-cell">Status</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Tasks</th>
                <th className="text-left p-4 font-medium hidden lg:table-cell">Joined</th>
                <th className="p-4 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr key={user.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-medium">
                        {user.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <Badge variant="outline" className={`capitalize text-xs ${statusColors[user.status]}`}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">{user.tasks}</td>
                  <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">{user.joined}</td>
                  <td className="p-4">
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Admin;
