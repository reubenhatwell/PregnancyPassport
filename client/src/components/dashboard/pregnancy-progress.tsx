import { PregnancyStats, Trimester } from "@/types";
import { getTrimesterLabel } from "@/lib/utils";

interface PregnancyProgressProps {
  stats: PregnancyStats;
  dueDate: string;
}

export default function PregnancyProgress({ stats, dueDate }: PregnancyProgressProps) {
  return (
    <div className="bg-card rounded-xl shadow-md p-6 border border-primary/10">
      <h2 className="text-xl font-heading font-semibold text-primary mb-5">Your Pregnancy Progress</h2>
      
      <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8">
        <div className="relative w-40 h-40 flex-shrink-0">
          <div className="absolute inset-0 rounded-full border-8 border-primary/20"></div>
          <div 
            className="absolute inset-0 rounded-full border-8 border-primary border-opacity-80"
            style={{ 
              clipPath: `polygon(0 0, 50% 0, 50% 50%, 0 50%)`,
              transform: `rotate(${Math.min(stats.progress * 3.6, 360)}deg)`
            }}
          ></div>
          <div className="absolute inset-3 rounded-full bg-card flex items-center justify-center flex-col shadow-inner">
            <span className="text-4xl font-bold text-primary">{stats.currentWeek}</span>
            <span className="text-sm text-foreground/70">weeks</span>
          </div>
        </div>
        
        <div className="flex-grow">
          <div className="relative pt-1 w-full">
            <div className="overflow-hidden h-6 text-xs flex rounded-full bg-secondary/30">
              <div 
                style={{ width: `${stats.progress}%` }} 
                className="shadow-sm flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary rounded-full transition-all duration-500"
              ></div>
            </div>
            <div className="flex justify-between mt-3 text-sm text-foreground/70 font-medium">
              <span>{Trimester.First}</span>
              <span>{Trimester.Second}</span>
              <span>{Trimester.Third}</span>
            </div>
          </div>
          
          <div className="mt-6 space-y-3 bg-secondary/20 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground/80">Baby's size</span>
              <span className="text-sm text-primary font-semibold px-3 py-1 bg-primary/10 rounded-full">Size of {stats.babySize}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground/80">Estimated due date</span>
              <span className="text-sm text-foreground font-medium">{dueDate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground/80">Days remaining</span>
              <span className="text-sm text-foreground font-medium">{stats.daysRemaining}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
