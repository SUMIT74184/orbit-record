import { useMemo } from "react";
import { format, addDays, subDays, startOfWeek } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ActivityEntry {
  activity_date: string;
  count: number;
}

interface ContributionChartProps {
  activityData?: ActivityEntry[];
  weeks?: number;
  thresholds?: number[];
}

const ContributionChart = ({ activityData = [], weeks = 52, thresholds }: ContributionChartProps) => {
  const { grid, monthLabels, maxCount } = useMemo(() => {
    const today = new Date();
    const endDate = today;
    const startDate = subDays(endDate, weeks * 7 - 1);
    const gridStart = startOfWeek(startDate, { weekStartsOn: 0 });

    const dateMap = new Map<string, number>();
    activityData.forEach((entry) => {
      const key = entry.activity_date;
      dateMap.set(key, (dateMap.get(key) || 0) + entry.count);
    });

    const grid: { date: Date; count: number }[][] = [];
    const monthLabels: { label: string; weekIdx: number }[] = [];
    let lastMonth = -1;

    for (let w = 0; w < weeks; w++) {
      const week: { date: Date; count: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const date = addDays(gridStart, w * 7 + d);
        const dateStr = format(date, "yyyy-MM-dd");
        week.push({ date, count: dateMap.get(dateStr) || 0 });

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

    const maxCount = Math.max(0, ...dateMap.values());

    return { grid, monthLabels, maxCount };
  }, [activityData, weeks]);

  const getLevel = (count: number) => {
    if (count === 0) return 0;
    if (thresholds && thresholds.length >= 4) {
      if (count <= thresholds[0]) return 1;
      if (count <= thresholds[1]) return 2;
      if (count <= thresholds[2]) return 3;
      return 4;
    }
    if (maxCount === 0) return 1;
    const step = Math.ceil(maxCount / 4) || 1;
    if (count <= step) return 1;
    if (count <= step * 2) return 2;
    if (count <= step * 3) return 3;
    return 4;
  };

  const totalActivities = useMemo(() => grid.flat().reduce((sum, day) => sum + day.count, 0), [grid]);
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <TooltipProvider>
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground">Activity Overview</h3>
          <span className="text-xs text-muted-foreground">
            {totalActivities} activities in the last {weeks} weeks
          </span>
        </div>
        <div className="flex gap-2">
          <div className="flex flex-col gap-1 text-[10px] text-muted-foreground pt-4">
            {daysOfWeek.map((day) => (
              <div key={day} className="h-[12px] flex items-center">{day}</div>
            ))}
          </div>
          <div className="flex-1 overflow-x-auto">
            <div className="relative" style={{ height: '14px' }}>
              {monthLabels.map(({ label, weekIdx }) => (
                <div
                  key={weekIdx}
                  className="absolute text-[10px] text-muted-foreground"
                  style={{ left: `${(weekIdx / weeks) * 100}%` }}
                >
                  {label}
                </div>
              ))}
            </div>
            <div className="flex gap-[3px] min-w-fit mt-1">
              {grid.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-[3px]">
                  {week.map(({ date, count }, dayIdx) => {
                    const level = getLevel(count);
                    const isFutureDate = date > new Date();
                    const formattedDate = format(date, "MMM d, yyyy");
                    const activityLabel = count === 1 ? "1 activity" : `${count} activities`;

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
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-4 text-[10px] text-muted-foreground">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div key={level} className={`w-[12px] h-[12px] rounded-[2px] contribution-${level}`} />
          ))}
          <span>More</span>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ContributionChart;
