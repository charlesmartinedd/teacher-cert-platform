import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import {
  markLessonComplete,
  getEnrollmentByUserAndCourse,
  updateStudyStreak,
  grantAchievement,
  getLessonProgress,
} from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, moduleId, lessonId, timeSpentMinutes } = body;

    const userId = session.user.id;

    // Get or create enrollment
    let enrollment = await getEnrollmentByUserAndCourse(userId, courseId);

    if (!enrollment) {
      // Auto-enroll user if they're not enrolled yet
      return NextResponse.json(
        { error: 'User not enrolled in this course' },
        { status: 400 }
      );
    }

    // Mark lesson as complete
    const progress = await markLessonComplete(
      userId,
      enrollment.id,
      courseId,
      moduleId,
      lessonId,
      timeSpentMinutes || 0
    );

    // Update study streak
    await updateStudyStreak(userId, 1, 0, timeSpentMinutes || 0);

    // Check for first lesson achievement
    const allProgress = await getLessonProgress(userId, courseId);
    if (allProgress.length === 1) {
      await grantAchievement(
        userId,
        'first_lesson',
        'First Lesson Complete',
        'Completed your first lesson!'
      );
    }

    return NextResponse.json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error('Error completing lesson:', error);
    return NextResponse.json(
      { error: 'Failed to complete lesson' },
      { status: 500 }
    );
  }
}
