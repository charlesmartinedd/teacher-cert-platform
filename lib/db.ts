import { supabase } from './supabase';

// User operations
export async function createUser(email: string, name?: string, image?: string) {
  const { data, error } = await supabase
    .from('users')
    .insert([{ email, name, image }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data;
}

export async function updateUserSubscription(
  userId: string,
  status: string,
  tier: string,
  endDate?: Date
) {
  const { data, error } = await supabase
    .from('users')
    .update({
      subscription_status: status,
      subscription_tier: tier,
      subscription_end_date: endDate?.toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Enrollment operations
export async function enrollUserInCourse(
  userId: string,
  stateId: string,
  examId: string,
  courseId: string
) {
  const { data, error } = await supabase
    .from('enrollments')
    .insert([
      {
        user_id: userId,
        state_id: stateId,
        exam_id: examId,
        course_id: courseId,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserEnrollments(userId: string) {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getEnrollmentByUserAndCourse(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// Lesson progress operations
export async function markLessonComplete(
  userId: string,
  enrollmentId: string,
  courseId: string,
  moduleId: string,
  lessonId: string,
  timeSpentMinutes: number = 0
) {
  const { data, error } = await supabase
    .from('lesson_progress')
    .upsert(
      {
        user_id: userId,
        enrollment_id: enrollmentId,
        course_id: courseId,
        module_id: moduleId,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
        time_spent_minutes: timeSpentMinutes,
      },
      { onConflict: 'user_id,course_id,lesson_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getLessonProgress(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId);

  if (error) throw error;
  return data || [];
}

export async function getModuleProgress(
  userId: string,
  courseId: string,
  moduleId: string
) {
  const { data, error } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('module_id', moduleId);

  if (error) throw error;
  return data || [];
}

// Quiz operations
export async function saveQuizAttempt(
  userId: string,
  enrollmentId: string,
  courseId: string,
  moduleId: string,
  quizId: string,
  score: number,
  totalQuestions: number,
  correctAnswers: number,
  timeTakenMinutes: number,
  passed: boolean
) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert([
      {
        user_id: userId,
        enrollment_id: enrollmentId,
        course_id: courseId,
        module_id: moduleId,
        quiz_id: quizId,
        score,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        time_taken_minutes: timeTakenMinutes,
        passed,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function saveQuizAnswers(
  attemptId: string,
  answers: Array<{
    questionId: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>
) {
  const { data, error } = await supabase.from('quiz_answers').insert(
    answers.map((a) => ({
      attempt_id: attemptId,
      question_id: a.questionId,
      user_answer: a.userAnswer,
      correct_answer: a.correctAnswer,
      is_correct: a.isCorrect,
    }))
  );

  if (error) throw error;
  return data;
}

export async function getUserQuizAttempts(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .order('attempted_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getQuizAttemptDetails(attemptId: string) {
  const { data: attempt, error: attemptError } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('id', attemptId)
    .single();

  if (attemptError) throw attemptError;

  const { data: answers, error: answersError } = await supabase
    .from('quiz_answers')
    .select('*')
    .eq('attempt_id', attemptId);

  if (answersError) throw answersError;

  return { attempt, answers: answers || [] };
}

// Bookmark operations
export async function addBookmark(
  userId: string,
  courseId: string,
  moduleId: string,
  lessonId: string,
  notes?: string
) {
  const { data, error } = await supabase
    .from('bookmarks')
    .insert([
      {
        user_id: userId,
        course_id: courseId,
        module_id: moduleId,
        lesson_id: lessonId,
        notes,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeBookmark(userId: string, lessonId: string) {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('lesson_id', lessonId);

  if (error) throw error;
}

export async function getUserBookmarks(userId: string) {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Achievement operations
export async function grantAchievement(
  userId: string,
  achievementType: string,
  achievementName: string,
  description?: string
) {
  const { data, error } = await supabase
    .from('achievements')
    .insert([
      {
        user_id: userId,
        achievement_type: achievementType,
        achievement_name: achievementName,
        achievement_description: description,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserAchievements(userId: string) {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Certificate operations
export async function createCertificate(
  userId: string,
  enrollmentId: string,
  courseId: string,
  courseName: string,
  certificateNumber: string,
  pdfUrl?: string
) {
  const { data, error } = await supabase
    .from('certificates')
    .insert([
      {
        user_id: userId,
        enrollment_id: enrollmentId,
        course_id: courseId,
        course_name: courseName,
        certificate_number: certificateNumber,
        pdf_url: pdfUrl,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserCertificates(userId: string) {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', userId)
    .order('issued_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Study streak operations
export async function updateStudyStreak(
  userId: string,
  lessonsCompleted: number = 0,
  quizzesTaken: number = 0,
  minutesStudied: number = 0
) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const { data, error } = await supabase
    .from('study_streaks')
    .upsert(
      {
        user_id: userId,
        streak_date: today,
        lessons_completed: lessonsCompleted,
        quizzes_taken: quizzesTaken,
        minutes_studied: minutesStudied,
      },
      { onConflict: 'user_id,streak_date' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserStreakDays(userId: string, days: number = 30) {
  const { data, error } = await supabase
    .from('study_streaks')
    .select('*')
    .eq('user_id', userId)
    .order('streak_date', { ascending: false })
    .limit(days);

  if (error) throw error;
  return data || [];
}

// Payment history
export async function savePaymentHistory(
  userId: string,
  stripePaymentId: string,
  amount: number,
  currency: string,
  subscriptionTier: string,
  paymentStatus: string
) {
  const { data, error } = await supabase
    .from('payment_history')
    .insert([
      {
        user_id: userId,
        stripe_payment_id: stripePaymentId,
        amount,
        currency,
        subscription_tier: subscriptionTier,
        payment_status: paymentStatus,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserPaymentHistory(userId: string) {
  const { data, error } = await supabase
    .from('payment_history')
    .select('*')
    .eq('user_id', userId)
    .order('payment_date', { ascending: false });

  if (error) throw error;
  return data || [];
}
