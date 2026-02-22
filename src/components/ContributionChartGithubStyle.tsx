import { useMemo } from "react";
import { format, addDays, subDays, startOfWeek } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ActivityEntry {
  activity_date: string;
  count: number;
}

interface ContributionChartProps {
  activityData: ActivityEntry[];
  weeks?: number;
}

const ContributionChartGithubStyle = ({ activityData, weeks = 52 }: ContributionChartProps) => {
  const today = new Date();
  const totalDays = weeks * 7;
  const start = startOfWeek(subDays(today, totalDays - 1), { weekStartsOn: 0 });
  const dateMap = new Map<string, number>();
  activityData.forEach((entry) => {
    dateMap.set(entry.activity_date, (dateMap.get(entry.activity_date) || 0) + entry.count);
  });
  const grid: { date: Date; count: number }[][] = [];
  const monthLabels: { label: string; weekIdx: number }[] = [];
  let lastMonth = -1;
  for (let w = 0; w < weeks; w++) {
    const week: { date: Date; count: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const idx = w * 7 + d;
      const date = addDays(start, idx);
      const dateStr = format(date, "yyyy-MM-dd");
      const count = dateMap.get(dateStr) || 0;
      week.push({ date, count });
      if (d === 0) {
        const month = date.getMonth();
        if (month !== lastMonth) {
          monthLabels.push({ label: format(date, "MMM"), weekIdx: w });
          lastMonth = month;
        }
      }
    }
    grid.push(week);
  }

  const getLevel = (count: number) => {
    if (count === 0) return 0;
    if (count <= 1) return 1;
    if (count <= 3) return 2;
    if (count <= 5) return 3;
    return 4;
  };

  const totalActivities = grid.flat().reduce((sum, day) => sum + day.count, 0);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <TooltipProvider>
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground">Activity Overview (GitHub Style)</h3>
          <span className="text-xs text-muted-foreground">
            {totalActivities} activities in the last {weeks} weeks
          </span>
        </div>
        <div className="flex gap-1">
          <div className="flex flex-col gap-1 mr-2 text-[10px] text-muted-foreground">
            {days.map((d, i) => (
              <div key={i} className="h-[12px] flex items-center">{d}</div>
            ))}
          </div>
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-[3px] min-w-fit">
              {grid.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-[3px]">
                  {week.map((day, dayIdx) => {
                    const level = getLevel(day.count);
                    const today = new Date();
                    const formattedDate = format(day.date, "MMM d, yyyy");
                    const activityLabel = day.count === 1 ? "1 activity" : `${day.count} activities`;

                    // Only fade cells for dates after today
                    const isFutureDate = day.date > today;
                    return (
                      <Tooltip key={dayIdx} delayDuration={150}>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-[12px] h-[12px] rounded-[2px] transition-colors hover:ring-1 hover:ring-primary/50 ${
                              isFutureDate ? "opacity-20 contribution-0" : `contribution-${level}`
                            }`}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs font-semibold">{activityLabel} on {formattedDate}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex mt-2 text-[10px] text-muted-foreground relative" style={{ height: 14 }}>
              {monthLabels.map((m, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{ left: `${(m.weekIdx / weeks) * 100}%` }}
                >
                  {m.label}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-4 text-[10px] text-muted-foreground">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((l) => (
            <div key={l} className={`w-[12px] h-[12px] rounded-[2px] contribution-${l}`} />
          ))}
          <span>More</span>
        </div>

        {process.env.NODE_ENV !== "production" && (
          <details className="mt-4 text-xs text-muted-foreground">
            <summary className="cursor-pointer">Debug: raw activity data</summary>
            <pre className="mt-2 p-2 bg-secondary rounded text-[11px] overflow-auto max-h-40">
              {JSON.stringify(activityData || [], null, 2)}
            </pre>
          </details>
        )}
      </div>
    </TooltipProvider>
  );
};

export default ContributionChartGithubStyle;
