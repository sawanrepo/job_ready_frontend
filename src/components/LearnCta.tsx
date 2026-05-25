import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LEARN_LINKS } from '@/lib/learnLinks';
import { BookOpen, ExternalLink } from 'lucide-react';

interface LearnCtaProps {
  description: string;
  actionText?: string;
  href?: string;
  title?: string;
  className?: string;
  compact?: boolean;
}

export const LearnCta = ({
  description,
  actionText = 'Read Articles',
  href = LEARN_LINKS.articles,
  title = 'Career Guides',
  className,
  compact = false,
}: LearnCtaProps) => (
  <div
    className={cn(
      'rounded-xl border border-primary/15 bg-white/70 p-4 shadow-sm backdrop-blur-sm',
      !compact && 'sm:p-5',
      className
    )}
  >
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3 text-left">
        <div className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
          <BookOpen className="h-4 w-4" />
        </div>
        <div>
          <p className="font-poppins text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
      <Button
        asChild
        variant="outline"
        size="sm"
        className="shrink-0 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
      >
        <a href={href} target="_blank" rel="noopener noreferrer">
          {actionText}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </Button>
    </div>
  </div>
);
