import React, { useMemo } from 'react';
import type { HeatmapData } from '../../api/client';

interface HeatmapProps {
  data: HeatmapData[];
}

export const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
  // Generate 365 days array (from today backwards)
  const days = useMemo(() => {
    const arr = [];
    const today = new Date();
    // Start from 364 days ago to today (total 365 days)
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      arr.push({
        date: dateStr,
        count: 0,
        label: d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' }),
        dayOfWeek: d.getDay(), // 0 = Sunday, 1 = Monday, etc.
      });
    }

    // Map backend counts to our days array
    const dataMap = new Map<string, number>();
    if (Array.isArray(data)) {
      data.forEach((item) => {
        if (item && item.date) {
          dataMap.set(item.date, item.count);
        }
      });
    }

    return arr.map((day) => ({
      ...day,
      count: dataMap.get(day.date) || 0,
    }));
  }, [data]);

  // Find max completed count in the year
  const maxCompleted = useMemo(() => {
    if (!days.length) return 0;
    const counts = days.map((d) => d.count);
    return Math.max(...counts, 0);
  }, [days]);

  // Determine color class based on intensity
  const getColorClass = (count: number) => {
    if (count === 0 || maxCompleted === 0) {
      return 'bg-zinc-800/40 hover:bg-zinc-700/60 border border-zinc-700/20';
    }
    const ratio = count / maxCompleted;
    if (ratio <= 0.25) {
      return 'bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-900/20 text-emerald-300';
    } else if (ratio <= 0.5) {
      return 'bg-emerald-800/60 hover:bg-emerald-700/80 border border-emerald-700/30 text-emerald-200';
    } else if (ratio <= 0.75) {
      return 'bg-emerald-600/80 hover:bg-emerald-500 border border-emerald-500/30 text-emerald-100';
    } else {
      return 'bg-emerald-400 hover:bg-emerald-300 border border-emerald-300/40 text-emerald-950 font-bold';
    }
  };

  // Label months on top of the grid
  const monthLabels = useMemo(() => {
    const labels: { text: string; index: number }[] = [];
    let lastMonth = '';
    
    // We group days by columns (each column has 7 days)
    // 365 days / 7 = 52.1 columns
    for (let col = 0; col < 53; col++) {
      const dayIndex = col * 7;
      if (dayIndex < days.length) {
        const dateObj = new Date(days[dayIndex].date);
        const monthName = dateObj.toLocaleDateString('vi-VN', { month: 'short' });
        if (monthName !== lastMonth) {
          labels.push({ text: monthName, index: col });
          lastMonth = monthName;
        }
      }
    }
    return labels;
  }, [days]);

  return (
    <div className="w-full bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-6 transition-all duration-300 hover:border-white/10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Lịch Sử Đóng Góp</h2>
          <p className="text-xs text-zinc-400">Số lượng công việc hoàn thành trong 365 ngày qua</p>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span>Ít</span>
          <div className="w-3 h-3 rounded bg-zinc-800/40 border border-zinc-700/20" />
          <div className="w-3 h-3 rounded bg-emerald-950/40 border border-emerald-900/20" />
          <div className="w-3 h-3 rounded bg-emerald-800/60 border border-emerald-700/30" />
          <div className="w-3 h-3 rounded bg-emerald-600/80 border border-emerald-500/30" />
          <div className="w-3 h-3 rounded bg-emerald-400 border border-emerald-300/40" />
          <span>Nhiều</span>
        </div>
      </div>

      {/* Scrollable Container */}
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="min-w-[760px] flex flex-col">
          {/* Month headers */}
          <div className="h-6 relative text-[10px] text-zinc-500 font-medium">
            {monthLabels.map((label, i) => (
              <span 
                key={i} 
                className="absolute" 
                style={{ left: `${(label.index * 13) + 24}px` }}
              >
                {label.text}
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            {/* Weekdays Labels */}
            <div className="flex flex-col justify-between text-[9px] text-zinc-500 h-[92px] py-1 font-medium w-4">
              <span>T2</span>
              <span>T4</span>
              <span>T6</span>
              <span>CN</span>
            </div>

            {/* Heatmap Grid */}
            <div className="grid grid-flow-col grid-rows-7 gap-[2px] h-[92px]">
              {days.map((day) => (
                <div
                  key={day.date}
                  className={`w-[11px] h-[11px] rounded-[2px] transition-all duration-200 cursor-pointer relative group ${getColorClass(day.count)}`}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-30 bg-zinc-950 text-zinc-100 text-[10px] py-1.5 px-2.5 rounded-lg border border-zinc-800 shadow-xl whitespace-nowrap pointer-events-none">
                    <span className="font-semibold">{day.count} công việc</span> hoàn thành
                    <div className="text-[9px] text-zinc-400 mt-0.5">{day.label}</div>
                    {/* Tooltip Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-[5px] border-4 border-transparent border-t-zinc-950" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
