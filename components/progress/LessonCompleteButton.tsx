'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';

interface LessonCompleteButtonProps {
  courseId: string;
  moduleId: string;
  lessonId: string;
  isCompleted?: boolean;
  onComplete?: () => void;
}

export default function LessonCompleteButton({
  courseId,
  moduleId,
  lessonId,
  isCompleted: initialCompleted = false,
  onComplete,
}: LessonCompleteButtonProps) {
  const { data: session } = useSession();
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    if (!session?.user?.id) {
      toast.error('Please sign in to track your progress');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/progress/complete-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          moduleId,
          lessonId,
          timeSpentMinutes: 30, // Default estimate
        }),
      });

      if (response.ok) {
        setIsCompleted(true);
        toast.success('Lesson marked as complete! 🎉');
        onComplete?.();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update progress');
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
        <p className="text-sm text-blue-900">
          Sign in to track your progress and earn achievements!
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {isCompleted ? (
        <div className="flex items-center gap-2 text-success-600 bg-success-50 px-4 py-3 rounded-lg border border-success-200">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-semibold">Lesson Complete</span>
        </div>
      ) : (
        <Button
          onClick={handleComplete}
          disabled={isLoading}
          variant="primary"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Mark as Complete
            </>
          )}
        </Button>
      )}
    </div>
  );
}
