import { PregnancyStats, Trimester } from "@/types";
import { getTrimesterLabel } from "@/lib/utils";

interface PregnancyProgressProps {
  stats: PregnancyStats;
  dueDate: string;
}

export default function PregnancyProgress({ stats, dueDate }: PregnancyProgressProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">Your Pregnancy Progress</h2>
      
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="relative w-36 h-36 flex-shrink-0">
          <div className="absolute inset-0 rounded-full border-8 border-primary-100"></div>
          <div 
            className="absolute inset-0 rounded-full border-8 border-primary-500 border-opacity-90"
            style={{ 
              clipPath: `polygon(0 0, 50% 0, 50% 50%, 0 50%)`,
              transform: `rotate(${Math.min(stats.progress * 3.6, 360)}deg)`
            }}
          ></div>
          <div className="absolute inset-3 rounded-full bg-white flex items-center justify-center flex-col">
            <span className="text-3xl font-bold text-primary-600">{stats.currentWeek}</span>
            <span className="text-sm text-gray-500">weeks</span>
          </div>
        </div>
        
        <div className="flex-grow">
          <div className="relative pt-1 w-full">
            <div className="overflow-hidden h-4 text-xs flex rounded-full bg-primary-100">
              <div 
                style={{ width: `${stats.progress}%` }} 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 rounded-full"
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>{Trimester.First}</span>
              <span>{Trimester.Second}</span>
              <span>{Trimester.Third}</span>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Baby's size</span>
              <span className="text-sm text-primary-600 font-semibold">Size of {stats.babySize}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Estimated due date</span>
              <span className="text-sm text-gray-900">{dueDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Days remaining</span>
              <span className="text-sm text-gray-900">{stats.daysRemaining}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
