import { useState, useMemo } from "react";
import { format, addDays, subDays, startOfWeek, startOfDay } from "date-fns";
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
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const availableYears = [2026, 2025, 2024, 2023]; 

  const { grid, monthLabels, maxCount } = useMemo(() => {
    const targetDate = selectedYear === new Date().getFullYear()
      ? startOfDay(new Date())
      : new Date(selectedYear, 11, 31);

    const currentWeekStart = startOfWeek(targetDate, { weekStartsOn: 0 }); 
    const gridStart = subDays(currentWeekStart, (weeks - 1) * 7); 

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
            // Only add label if it's not the very first column (to avoid clipping)
            if (w > 0) {
              monthLabels.push({ label: format(date, "MMM"), weekIdx: w });
            }
            lastMonth = month;
          }
        }
      }
      grid.push(week);
    }

    const maxCount = Math.max(0, ...dateMap.values());

    return { grid, monthLabels, maxCount };
  }, [activityData, weeks, selectedYear]);

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

  const getColorClass = (level: number) => {
    switch (level) {
      case 1: return "contribution-1";
      case 2: return "contribution-2";
      case 3: return "contribution-3";
      case 4: return "contribution-4";
      default: return "contribution-0";
    }
  };

  const totalContributions = useMemo(() => grid.flat().reduce((sum, day) => sum + day.count, 0), [grid]);
  
  // Only render text for Mon (1), Wed (3), and Fri (5)
  const daysOfWeek = ["", "Mon", "", "Wed", "", "Fri", ""];
  const today = startOfDay(new Date());

  return (
    <TooltipProvider>
      <div className="flex flex-col md:flex-row gap-8 w-full">
        
        {/* Left Side: Header & Chart Card */}
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-normal text-foreground mb-4">
            {totalContributions} contributions in {selectedYear === new Date().getFullYear() ? "the last year" : selectedYear}
          </h2>
          
          <div className="border border-border rounded-lg p-5 bg-card overflow-hidden">
            <div className="overflow-x-auto pb-4">
              <div className="min-w-max">
                
                {/* Month Labels */}
                <div className="relative h-5 ml-8"> {/* ml-8 offsets the day labels width */}
                  {monthLabels.map(({ label, weekIdx }) => (
                    <div
                      key={weekIdx}
                      className="absolute text-[10px] text-muted-foreground"
                      // 15px = 12px (square width) + 3px (gap)
                      style={{ left: `${weekIdx * 15}px` }} 
                    >
                      {label}
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  {/* Day Labels (Y-axis) */}
                  <div className="flex flex-col gap-[3px] text-[10px] text-muted-foreground w-6">
                    {daysOfWeek.map((day, i) => (
                      <div key={i} className="h-[12px] leading-[12px] text-left">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Grid */}
                  <div className="flex gap-[3px]">
                    {grid.map((week, weekIdx) => (
                      <div key={weekIdx} className="flex flex-col gap-[3px]">
                        {week.map(({ date, count }, dayIdx) => {
                          const level = getLevel(count);
                          const isFutureDate = date > today;
                          const formattedDate = format(date, "MMM d, yyyy");
                          const contributionLabel = count === 1 ? "1 contribution" : `${count} contributions`;

                          return (
                            <Tooltip key={dayIdx} delayDuration={150}>
                              <TooltipTrigger asChild>
                                <div
                                  className={`w-[12px] h-[12px] rounded-[2px] transition-colors hover:ring-1 hover:ring-primary/50 ${
                                    isFutureDate ? "opacity-0" : getColorClass(level)
                                  }`}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs font-semibold">{contributionLabel} on {formattedDate}</p>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer / Legend */}
            <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Learn how we count contributions
              </a>
              <div className="flex items-center gap-1.5">
                <span>Less</span>
                {[0, 1, 2, 3, 4].map((level) => (
                  <div key={level} className={`w-[12px] h-[12px] rounded-[2px] ${getColorClass(level)}`} />
                ))}
                <span>More</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: GitHub-style Year Selector Sidebar */}
        <div className="w-full md:w-32 flex flex-row md:flex-col gap-2 pt-[44px]"> {/* pt aligns it with the top of the card */}
          {availableYears.map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`text-sm px-4 py-2 text-left rounded-md transition-colors ${
                selectedYear === year 
                  // Tailwind equivalent for the GitHub blue active state
                  ? "bg-blue-600 text-white font-medium" 
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {year}
            </button>
          ))}
        </div>

      </div>
    </TooltipProvider>
  );
};

export default ContributionChart;