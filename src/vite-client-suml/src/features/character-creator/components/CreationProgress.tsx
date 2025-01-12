import { Progress } from "@/components/ui/progress";
import { ReactElement } from "react";

/**
 * Props dla komponentu CreationProgress
 * @interface
 * @property {number} currentStep - Aktualny krok
 * @property {number} totalSteps - Wszystkie kroki
 */
interface CreationProgressProps {
    /**
     * Aktualny krok
     * @type {number}
     */
    currentStep: number;
    /**
     * Wszystkie kroki
     * @type {number}
     */
    totalSteps: number;
}

/**
 * Komponent wyświetlający postęp tworzenia postaci
 * @param {CreationProgressProps} props - Props komponentu
 * @returns {JSX.Element} - Element JSX
 */
export function CreationProgress({ currentStep, totalSteps }: CreationProgressProps): ReactElement {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
                <span>Krok {currentStep} z {totalSteps}</span>
                <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
        </div>
    );
}