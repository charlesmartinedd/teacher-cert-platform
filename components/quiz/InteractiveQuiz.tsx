'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CheckCircle2, XCircle, Clock, Trophy, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';

interface Question {
  id: string;
  type: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface InteractiveQuizProps {
  questions: Question[];
  moduleId: string;
  courseId: string;
  quizTitle?: string;
  passingScore?: number;
}

export default function InteractiveQuiz({
  questions,
  moduleId,
  courseId,
  quizTitle = 'Module Quiz',
  passingScore = 70,
}: InteractiveQuizProps) {
  const { data: session } = useSession();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    if (!showResults) {
      const timer = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [startTime, showResults]);

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    setShowExplanation(false);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setShowExplanation(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
      setShowExplanation(false);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return (correct / questions.length) * 100;
  };

  const handleSubmit = async () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResults(true);

    // Save quiz results to database if user is logged in
    if (session?.user?.id) {
      try {
        const response = await fetch('/api/quiz/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: session.user.id,
            courseId,
            moduleId,
            quizId: `${moduleId}-quiz`,
            score: finalScore,
            totalQuestions: questions.length,
            correctAnswers: Math.round((finalScore / 100) * questions.length),
            timeTakenMinutes: Math.round(timeElapsed / 60),
            passed: finalScore >= passingScore,
            answers: questions.map((q) => ({
              questionId: q.id,
              userAnswer: answers[q.id] || '',
              correctAnswer: q.correctAnswer,
              isCorrect: answers[q.id] === q.correctAnswer,
            })),
          }),
        });

        if (response.ok) {
          toast.success('Quiz results saved!');
        }
      } catch (error) {
        console.error('Error saving quiz results:', error);
      }
    }
  };

  const handleRetake = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
    setShowExplanation(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentQuestion];
  const userAnswer = answers[currentQ?.id];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (showResults) {
    const correctCount = Math.round((score / 100) * questions.length);
    const passed = score >= passingScore;

    return (
      <div className="card p-8">
        <div className="text-center">
          {/* Result Icon */}
          <div className="flex justify-center mb-6">
            {passed ? (
              <div className="w-24 h-24 bg-success-100 rounded-full flex items-center justify-center">
                <Trophy className="w-12 h-12 text-success-600" />
              </div>
            ) : (
              <div className="w-24 h-24 bg-warning-100 rounded-full flex items-center justify-center">
                <RotateCcw className="w-12 h-12 text-warning-600" />
              </div>
            )}
          </div>

          {/* Result Title */}
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {passed ? 'Congratulations!' : 'Keep Practicing!'}
          </h2>
          <p className="text-gray-600 mb-8">
            {passed
              ? "You've successfully passed this quiz!"
              : 'You need more practice. Try again!'}
          </p>

          {/* Score Card */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {score.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Your Score</div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {correctCount}/{questions.length}
              </div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {formatTime(timeElapsed)}
              </div>
              <div className="text-sm text-gray-600">Time Taken</div>
            </div>
          </div>

          {/* Passing Status */}
          <div
            className={`p-4 rounded-lg mb-8 ${
              passed
                ? 'bg-success-50 border border-success-200'
                : 'bg-warning-50 border border-warning-200'
            }`}
          >
            <p
              className={`font-semibold ${
                passed ? 'text-success-900' : 'text-warning-900'
              }`}
            >
              {passed
                ? `You passed! (Required: ${passingScore}%)`
                : `Passing score: ${passingScore}% - You scored ${score.toFixed(0)}%`}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button onClick={handleRetake} variant="outline" size="lg">
              <RotateCcw className="w-5 h-5" />
              Retake Quiz
            </Button>
            <Button onClick={() => window.location.reload()} variant="primary" size="lg">
              Continue Learning
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{quizTitle}</h2>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-5 h-5" />
            <span className="font-mono text-lg">{formatTime(timeElapsed)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span>{progress.toFixed(0)}% Complete</span>
          </div>
          <div className="progress-bar">
            <div
              className="h-full bg-primary-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="card p-8">
        <div className="mb-8">
          <div className="badge badge-primary mb-4">
            Question {currentQuestion + 1}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQ.question}
          </h3>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQ.options.map((option, index) => {
              const optionLetter = option.charAt(0);
              const isSelected = userAnswer === optionLetter;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQ.id, optionLetter)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected
                          ? 'border-primary-600 bg-primary-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="text-gray-900">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Show Explanation Button */}
        {userAnswer && (
          <div className="mb-6">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              {showExplanation ? 'Hide' : 'Show'} Explanation
            </button>
            {showExplanation && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Correct Answer: {currentQ.correctAnswer}</strong>
                </p>
                <p className="text-sm text-blue-900 mt-2">{currentQ.explanation}</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            variant="outline"
            size="lg"
          >
            Previous
          </Button>

          {currentQuestion === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== questions.length}
              variant="primary"
              size="lg"
            >
              Submit Quiz
            </Button>
          ) : (
            <Button onClick={handleNext} variant="primary" size="lg">
              Next Question
            </Button>
          )}
        </div>

        {/* Answer Status */}
        <div className="mt-6 text-center text-sm text-gray-600">
          {Object.keys(answers).length} of {questions.length} questions answered
        </div>
      </div>
    </div>
  );
}
