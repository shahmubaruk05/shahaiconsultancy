'use client';
import { useParams } from 'next/navigation';
import { ACADEMY_MODULES } from '@/lib/academy-data';
import { LessonView } from '@/components/academy/lesson-view';

export default function AcademyModulePage() {
  const params = useParams();
  const slug = params.slug as string;
  const module = ACADEMY_MODULES[slug];

  if (!module) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold">Module not found</h1>
        <p className="text-muted-foreground">The module you are looking for does not exist.</p>
      </div>
    );
  }

  return <LessonView module={module} />;
}
