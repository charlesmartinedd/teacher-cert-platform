import { render, screen } from '@testing-library/react';
import ExamCard from '@/components/ui/ExamCard';

const mockExam = {
  id: 'test-exam',
  stateId: 'california',
  state: 'California',
  name: 'CSET',
  fullName: 'California Subject Examinations for Teachers',
  description: 'Test exam description',
  duration: '5 hours',
  modules: 3,
  totalLessons: 24,
  practiceQuestions: 500,
  studyHours: 80,
  thumbnail: 'https://images.unsplash.com/test',
};

describe('ExamCard Component', () => {
  it('renders exam information correctly', () => {
    render(<ExamCard {...mockExam} />);

    expect(screen.getByText('CSET')).toBeInTheDocument();
    expect(screen.getByText('Test exam description')).toBeInTheDocument();
    expect(screen.getByText('California')).toBeInTheDocument();
  });

  it('displays exam statistics', () => {
    render(<ExamCard {...mockExam} />);

    expect(screen.getByText('3 Modules')).toBeInTheDocument();
    expect(screen.getByText('500 Questions')).toBeInTheDocument();
    expect(screen.getByText('80h Study')).toBeInTheDocument();
  });

  it('renders link with correct href', () => {
    render(<ExamCard {...mockExam} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/states/california/test-exam');
  });

  it('renders thumbnail image with correct src', () => {
    render(<ExamCard {...mockExam} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', expect.stringContaining('test'));
    expect(img).toHaveAttribute('alt', 'CSET');
  });
});
