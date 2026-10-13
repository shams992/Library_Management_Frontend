import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { SectionHeading } from '../common/SectionHeading.jsx';
import { PAIN_POINTS } from '../../utils/constants.js';
import { useSettings } from '../../hooks/useSettings.js';
import * as Icons from 'lucide-react';

const Card = ({ point, index, brandName }) => {
  const Icon = Icons[point.icon] || Icons.Circle;
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className="surface surface-hover p-5"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <XCircle className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium leading-snug text-foreground">{point.problem}</p>
        </div>
      </div>

      <div className="my-4 flex items-center gap-2 pl-1 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <ArrowRight className="h-3.5 w-3.5" />
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/12 text-success">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="text-sm leading-relaxed text-muted-foreground">{point.solution}</p>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        Handled end-to-end in {brandName}
      </div>
    </motion.article>
  );
};

export const ProblemSection = () => {
  const { brand } = useSettings();

  return (
    <section id="why" className="section" aria-labelledby="why-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Why it matters"
          title={<span id="why-heading">Running a private library on paper costs you money every month</span>}
          description={`These are the problems we hear from library owners every week — and exactly how ${brand.name} removes each one of them.`}
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PAIN_POINTS.map((point, index) => (
            <Card key={point.problem} point={point} index={index} brandName={brand.name} />
          ))}
        </div>
      </div>
    </section>
  );
};
