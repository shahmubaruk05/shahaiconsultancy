import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FlaskConical,
  Target,
  FileText,
  Library,
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

const tools = [
  {
    title: 'Startup Validator',
    description: 'Get AI feedback on your business idea.',
    href: '/tools/startup-validator',
    icon: <FlaskConical className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Business Strategy',
    description: 'Generate a full business strategy.',
    href: '/tools/business-strategy',
    icon: <Target className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Pitch Deck Assistant',
    description: 'Create a winning pitch deck outline.',
    href: '/tools/pitch-deck',
    icon: <FileText className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Company Formation',
    description: 'Guides for USA & Bangladesh.',
    href: '/tools/company-formation',
    icon: <Library className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Ask Shah',
    description: 'Your AI startup advisor chatbot.',
    href: '/tools/ask-shah',
    icon: <MessageCircle className="h-8 w-8 text-primary" />,
  },
];

export function QuickLinks() {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight mb-4">Get Started</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link href={tool.href} key={tool.title} className="group">
            <Card className="flex h-full flex-col justify-between transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
              <CardHeader>
                <div className="mb-4">{tool.icon}</div>
                <CardTitle>{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <div className="px-6 pb-4 text-sm font-medium text-primary flex items-center gap-2">
                Use Tool <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
