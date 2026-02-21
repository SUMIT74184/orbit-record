import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Project {
  name: string;
  progress: number;
}

interface ProjectsProgressChartProps {
  projects: Project[];
}

const ProjectsProgressChart = ({ projects }: ProjectsProgressChartProps) => {
  const chartData = projects.slice(0, 5).map(p => ({ name: p.name, progress: p.progress }));

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Project Progress</CardTitle>
      </CardHeader>
      <CardContent>
        {projects.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: 'hsl(var(--accent) / 0.1)' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                }}
              />
              <Bar dataKey="progress" fill="hsl(var(--primary))" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">No project data to display. Create a project to see its progress here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectsProgressChart;
