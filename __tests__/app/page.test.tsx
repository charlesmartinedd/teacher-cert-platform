import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

// Mock the exam data
jest.mock('@/data/exams/index.json', () => ({
  states: [
    {
      id: 'california',
      name: 'California',
      exams: [
        {
          id: 'cset',
          name: 'CSET',
          fullName: 'California Subject Examinations for Teachers',
          description: 'Test description',
          duration: '5 hours',
          modules: 3,
          totalLessons: 24,
          practiceQuestions: 500,
          studyHours: 80,
          thumbnail: 'https://images.unsplash.com/test',
        },
      ],
    },
  ],
}));

describe('HomePage', () => {
  it('renders hero section', () => {
    render(<HomePage />);

    expect(screen.getByText(/Master Your Teacher Certification Exam/i)).toBeInTheDocument();
    expect(screen.getByText(/Comprehensive courses, practice tests, and expert guidance/i)).toBeInTheDocument();
  });

  it('renders stats section', () => {
    render(<HomePage />);

    expect(screen.getByText('50,000+')).toBeInTheDocument();
    expect(screen.getByText('Students Trained')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
    expect(screen.getByText('Pass Rate')).toBeInTheDocument();
  });

  it('renders featured exams section', () => {
    render(<HomePage />);

    expect(screen.getByText('Popular Certification Exams')).toBeInTheDocument();
    expect(screen.getByText(/Start preparing for your state's teaching certification exam/i)).toBeInTheDocument();
  });

  it('renders features section', () => {
    render(<HomePage />);

    expect(screen.getByText('Why Choose TeachCertPro?')).toBeInTheDocument();
    expect(screen.getByText('Comprehensive Content')).toBeInTheDocument();
    expect(screen.getByText('Practice Tests')).toBeInTheDocument();
    expect(screen.getByText('Track Progress')).toBeInTheDocument();
    expect(screen.getByText('Expert Support')).toBeInTheDocument();
  });

  it('renders benefits section', () => {
    render(<HomePage />);

    expect(screen.getByText('Your Success Is Our Priority')).toBeInTheDocument();
    expect(screen.getByText(/Self-paced learning with lifetime access/i)).toBeInTheDocument();
  });

  it('renders CTA section', () => {
    render(<HomePage />);

    expect(screen.getByText(/Ready to Start Your Teaching Journey/i)).toBeInTheDocument();
  });

  it('contains navigation links', () => {
    render(<HomePage />);

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });
});
