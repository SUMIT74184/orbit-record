import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Todo {
  completed: boolean;
}

interface TodosStatusChartProps {
  todos: Todo[];
}

const TodosStatusChart = ({ todos }: TodosStatusChartProps) => {
  const completedCount = todos.filter(t => t.completed).length;
  const pendingCount = todos.length - completedCount;

  const data = [
    { name: 'Completed', value: completedCount, color: 'hsl(var(--chart-1))' },
    { name: 'Pending', value: pendingCount, color: 'hsl(var(--chart-4))' },
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Todo Status</CardTitle>
      </CardHeader>
      <CardContent>
        {todos.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent) / 0.1)' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">No todo data to display. Add a todo to see the status breakdown.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodosStatusChart;
