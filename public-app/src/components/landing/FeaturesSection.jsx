import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { SectionHeading } from '../common/SectionHeading.jsx';
import { PLATFORM_FEATURES } from '../../utils/constants.js';
import { cn } from '../../utils/cn.js';

const ACCENTS = [
  'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  'bg-violet-500/10 text-violet-600 dark:text-violet-400',
];

export const FeaturesSection = () => (
  <section id="features" className="section border-y border-border bg-muted/30" aria-labelledby="features-heading">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Everything included"
        title={<span id="features-heading">One platform for the whole library operation</span>}
        description="No add-ons, no per-module pricing. Every library gets the complete toolkit from day one."
      />

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PLATFORM_FEATURES.map((feature, index) => {
          const Icon = Icons[feature.icon] || Icons.Sparkles;
          return (
            <motion.article
              key={feature.key}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: Math.min((index % 3) * 0.06 + Math.floor(index / 3) * 0.04, 0.32), ease: [0.16, 1, 0.3, 1] }}
              className="group surface surface-hover flex flex-col gap-4 p-6"
            >
              <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105', ACCENTS[index % ACCENTS.length])}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold">{feature.name}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  </section>
);
