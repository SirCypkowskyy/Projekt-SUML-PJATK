import { cn } from "@/lib/utils";

interface LoadingAnimProps {
  className?: string;
}


export function LoadingAnim({ className }: LoadingAnimProps) {
  return (
    <div className={cn("flex w-full items-center justify-center", className)}>
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin ease-linear rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900 dark:border-gray-100" />
        <p className="text-gray-900 dark:text-gray-100">Ładowanie...</p>
      </div>
    </div>
  );
}

// export function LoadingAnim({ className }: LoadingAnimProps) {
//   return (
//     <div className={cn("relative", className)}>
//       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400 w-[10vw] min-w-[100px] text-center font-sans text-xl">
//         ŁADOWANIE
//       </div>
      
//       <div className="relative left-1/2 top-1/2 w-[15vw] h-[15vw] min-w-[170px] min-h-[170px] -translate-x-1/2 -translate-y-1/2">
//         {/* Outer ring */}
//         <div className="absolute inset-0 border-4 border-transparent border-t-[#4D658D] border-b-[#4D658D] rounded-full animate-[spin_2s_linear_infinite]" />
        
//         {/* Middle ring */}
//         <div className="absolute inset-[1vw] min-[170px]:inset-[12px] border-4 border-transparent border-t-[#D4CC6A] border-b-[#D4CC6A] rounded-full animate-[spin_3s_linear_infinite]" />
        
//         {/* Inner ring */}
//         <div className="absolute inset-[2vw] min-[170px]:inset-[24px] border-4 border-transparent border-t-[#84417C] border-b-[#84417C] rounded-full animate-[spin_1.5s_linear_infinite]" />
//       </div>
//     </div>
//   );
// }