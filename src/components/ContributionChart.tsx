import { useMemo } from "react";
import { format, addDays, subDays, startOfWeek } from "date-fns";

interface ActivityEntry {
  activity_date: string;
  count: number;
}

interface ContributionChartProps {
  activityData?: ActivityEntry[];
  weeks?: number;
}

const ContributionChart = ({ activityData, weeks = 26 }: ContributionChartProps) => {
  const { grid, monthLabels } = useMemo(() => {
    const today = new Date();
    const totalDays = weeks * 7;

    // Start from the beginning of the week (Sunday) so columns align like GitHub
    const start = startOfWeek(subDays(today, totalDays - 1), { weekStartsOn: 0 });

    // Build a map of date -> count from passed-in activity data
    const dateMap = new Map<string, number>();
    if (activityData) {
      activityData.forEach((entry) => {
        const key = entry.activity_date;
        dateMap.set(key, (dateMap.get(key) || 0) + entry.count);
      });
    }

    // Build grid: array of weeks (columns), each containing 7 days (rows)
    const grid: { date: Date; count: number; dateStr: string }[][] = [];
    const monthLabels: { label: string; weekIdx: number }[] = [];
    let lastMonth = -1;

    for (let w = 0; w < weeks; w++) {
      const week: { date: Date; count: number; dateStr: string }[] = [];
      for (let d = 0; d < 7; d++) {
        const idx = w * 7 + d;
        const date = addDays(start, idx);
        const dateStr = format(date, "yyyy-MM-dd");
        const count = dateMap.get(dateStr) || 0;
        week.push({ date, count, dateStr });

        // Track month labels on the first row of each week (Sunday)
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

    return { grid, monthLabels };
  }, [activityData, weeks]);

  const getLevel = (count: number) => {
    if (count === 0) return 0;
    if (count <= 1) return 1;
    if (count <= 2) return 2;
    if (count <= 3) return 3;
    return 4;
  };

  // Show weekday labels on the left (Sun-Sat) to match GitHub style
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const totalActivities = useMemo(
    () => grid.flat().reduce((sum, d) => sum + d.count, 0),
    [grid]
  );

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground">Activity Overview</h3>
        <span className="text-xs text-muted-foreground">{totalActivities} activities in the last {weeks} weeks</span>
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
                  const isFuture = day.date > new Date();
                  return (
                    <div
                      key={dayIdx}
                      className={`w-[12px] h-[12px] rounded-[2px] transition-colors hover:ring-1 hover:ring-primary/50 ${
                        isFuture ? "opacity-20 contribution-0" : `contribution-${level}`
                      }`}
                      title={`${format(day.date, "MMM d, yyyy")}: ${day.count} activit${day.count === 1 ? "y" : "ies"}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          {/* Month labels */}
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
      {/* Debug panel to help verify data from DB in development */}
      {process.env.NODE_ENV !== "production" && (
        <details className="mt-4 text-xs text-muted-foreground">
          <summary className="cursor-pointer">Debug: raw activity data</summary>
          <pre className="mt-2 p-2 bg-secondary rounded text-[11px] overflow-auto max-h-40">{JSON.stringify(activityData || [], null, 2)}</pre>
        </details>
      )}
      <div className="flex items-center gap-2 mt-4 text-[10px] text-muted-foreground">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <div key={l} className={`w-[12px] h-[12px] rounded-[2px] contribution-${l}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
};

export default ContributionChart;
