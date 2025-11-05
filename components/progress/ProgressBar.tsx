'use client';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProgressBar({
  current,
  total,
  label,
  showPercentage = true,
  size = 'md',
}: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  const heightClass = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  }[size];

  return (
    <div className="space-y-2">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-sm">
          {label && <span className="font-medium text-gray-700">{label}</span>}
          {showPercentage && (
            <span className="text-gray-600">
              {current} / {total} ({percentage.toFixed(0)}%)
            </span>
          )}
        </div>
      )}
      <div className={`progress-bar ${heightClass}`}>
        <div
          className="h-full bg-primary-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
