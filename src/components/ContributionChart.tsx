import { useMemo } from "react";

interface ContributionChartProps {
  data?: number[];
  weeks?: number;
}

const ContributionChart = ({ data, weeks = 52 }: ContributionChartProps) => {
  const contributions = useMemo(() => {
    if (data) return data;
    // Generate mock data
    return Array.from({ length: weeks * 7 }, () =>
      Math.random() > 0.3 ? Math.floor(Math.random() * 5) : 0
    );
  }, [data, weeks]);

  const getLevel = (count: number) => {
    if (count === 0) return 0;
    if (count <= 1) return 1;
    if (count <= 2) return 2;
    if (count <= 3) return 3;
    return 4;
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const days = ["Mon", "", "Wed", "", "Fri", "", ""];

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-medium text-foreground mb-4">Activity Overview</h3>
      <div className="flex gap-1">
        <div className="flex flex-col gap-1 mr-2 text-[10px] text-muted-foreground">
          {days.map((d, i) => (
            <div key={i} className="h-[12px] flex items-center">{d}</div>
          ))}
        </div>
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-[3px] min-w-fit">
            {Array.from({ length: weeks }, (_, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-[3px]">
                {Array.from({ length: 7 }, (_, dayIdx) => {
                  const idx = weekIdx * 7 + dayIdx;
                  const level = getLevel(contributions[idx] || 0);
                  return (
                    <div
                      key={dayIdx}
                      className={`w-[12px] h-[12px] rounded-[2px] contribution-${level} transition-colors hover:ring-1 hover:ring-primary/50`}
                      title={`${contributions[idx] || 0} activities`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex mt-2 text-[10px] text-muted-foreground">
            {months.map((m, i) => (
              <div key={i} className="flex-1 text-center">{m}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4 text-[10px] text-muted-foreground">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map(l => (
          <div key={l} className={`w-[12px] h-[12px] rounded-[2px] contribution-${l}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
};

export default ContributionChart;
