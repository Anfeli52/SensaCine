import { LucideIcon, Sparkles } from "lucide-react";

export interface StatItem {
  title: string;
  value: string | number;
  label: string;
  icon: LucideIcon;
  bgIcon: string;
}

interface StatCardProps {
  item: StatItem;
}

export function StatCard({ item }: Readonly<StatCardProps>) {
  const Icon = item.icon;
  return (
    <div className="p-5 rounded-appleXl bg-white border border-[#e5e5ea] shadow-appleCard hover:shadow-appleCardHover transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-semibold text-[#86868b] tracking-tight uppercase">
          {item.title}
        </span>
        <div className={`p-2 rounded-appleMd ${item.bgIcon}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-[#1d1d1f]">
          {item.value}
        </span>
      </div>
      <p className="text-[12px] text-[#86868b] mt-1 font-normal flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-[#0071e3] opacity-60" />
        <span>{item.label}</span>
      </p>
    </div>
  );
}

interface StatsGridProps {
  stats: StatItem[];
}

export function StatsGrid({ stats }: Readonly<StatsGridProps>) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((item) => (
        <StatCard key={item.title} item={item} />
      ))}
    </div>
  );
}
