'use client';

import { motion } from 'framer-motion';
import { SkillsVisualization } from '../SkillsVisualization';
import { FormattedResult } from './types';

interface DashboardPanelProps {
  result: FormattedResult;
}

export function DashboardPanel({ result }: DashboardPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <SkillsVisualization
        matchingSkills={result.matchingSkills}
        missingSkills={result.missingSkills}
        matchScore={result.matchScore}
      />
    </motion.div>
  );
}
