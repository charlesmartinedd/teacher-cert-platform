import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { saveQuizAttempt, saveQuizAnswers, getEnrollmentByUserAndCourse } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      userId,
      courseId,
      moduleId,
      quizId,
      score,
      totalQuestions,
      correctAnswers,
      timeTakenMinutes,
      passed,
      answers,
    } = body;

    // Verify user matches session
    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get enrollment ID
    const enrollment = await getEnrollmentByUserAndCourse(userId, courseId);

    if (!enrollment) {
      return NextResponse.json(
        { error: 'User not enrolled in this course' },
        { status: 400 }
      );
    }

    // Save quiz attempt
    const attempt = await saveQuizAttempt(
      userId,
      enrollment.id,
      courseId,
      moduleId,
      quizId,
      score,
      totalQuestions,
      correctAnswers,
      timeTakenMinutes,
      passed
    );

    // Save individual answers
    if (answers && answers.length > 0) {
      await saveQuizAnswers(attempt.id, answers);
    }

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      score,
      passed,
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    );
  }
}
