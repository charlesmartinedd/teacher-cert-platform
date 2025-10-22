import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import ExamCard from '@/components/ui/ExamCard';
import examsData from '@/data/exams/index.json';

export default function StatesPage() {
  return (
    <div className="min-h-screen py-12 md:py-16">
      {/* Hero Section */}
      <section className="container-custom mb-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Teacher Certification Exams by State
          </h1>
          <p className="text-xl text-gray-600">
            Select your state to view available certification exams and start preparing today
          </p>
        </div>
      </section>

      {/* States Grid */}
      <section className="container-custom">
        <div className="space-y-16">
          {examsData.states.map((state) => (
            <div key={state.id} className="animate-fade-in">
              {/* State Header */}
              <div className="mb-8">
                <Link
                  href={`/states/${state.id}`}
                  className="inline-flex items-center gap-3 group mb-3"
                >
                  <MapPin className="w-8 h-8 text-primary-600" />
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {state.name}
                  </h2>
                  <ArrowRight className="w-6 h-6 text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <p className="text-gray-600 text-lg ml-11">
                  {state.description}
                </p>
              </div>

              {/* Exams Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.exams.map((exam) => (
                  <ExamCard
                    key={exam.id}
                    {...exam}
                    stateId={state.id}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-custom mt-16 md:mt-24">
        <div className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-3xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Don't See Your State?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            We're constantly adding new states and exams. Let us know which certification you're preparing for!
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-white text-primary-600 hover:bg-gray-100 font-semibold px-8 py-4 rounded-lg transition-colors"
          >
            Request Your State
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
