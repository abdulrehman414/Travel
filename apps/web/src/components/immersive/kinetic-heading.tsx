'use client';

import { motion } from 'framer-motion';

const EASE = [0.16, 1, 0.3, 1] as const;

/** Splits a headline into words and reveals them with a staggered rise + settle. */
export function KineticHeading({
  text,
  className,
  wordClassName,
  delay = 0.1,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
}) {
  const words = text.split(' ');
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}
        >
          <motion.span
            className={wordClassName}
            style={{ display: 'inline-block', paddingRight: '0.26em' }}
            initial={{ y: '115%', rotate: 4, opacity: 0 }}
            animate={{ y: '0%', rotate: 0, opacity: 1 }}
            transition={{ delay: delay + i * 0.075, duration: 0.85, ease: EASE }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
