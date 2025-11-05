import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { enrollUserInCourse, getEnrollmentByUserAndCourse } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { stateId, examId, courseId } = body;

    if (!stateId || !examId || !courseId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Check if already enrolled
    const existing = await getEnrollmentByUserAndCourse(userId, courseId);
    if (existing) {
      return NextResponse.json({
        success: true,
        enrollment: existing,
        message: 'Already enrolled',
      });
    }

    // Enroll user
    const enrollment = await enrollUserInCourse(
      userId,
      stateId,
      examId,
      courseId
    );

    return NextResponse.json({
      success: true,
      enrollment,
      message: 'Successfully enrolled!',
    });
  } catch (error) {
    console.error('Error enrolling user:', error);
    return NextResponse.json(
      { error: 'Failed to enroll' },
      { status: 500 }
    );
  }
}
