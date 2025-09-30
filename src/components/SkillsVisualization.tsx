'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface SkillsVisualizationProps {
  matchingSkills: string[];
  missingSkills: string[];
  matchScore: number;
}

export function SkillsVisualization({ matchingSkills, missingSkills, matchScore }: SkillsVisualizationProps) {
  const skillsData = {
    labels: [...matchingSkills.slice(0, 8), ...missingSkills.slice(0, 4)],
    datasets: [
      {
        label: 'Skill Match Status',
        data: [
          ...matchingSkills.slice(0, 8).map(() => 100),
          ...missingSkills.slice(0, 4).map(() => 0)
        ],
        backgroundColor: [
          ...matchingSkills.slice(0, 8).map(() => 'rgba(34, 197, 94, 0.8)'),
          ...missingSkills.slice(0, 4).map(() => 'rgba(239, 68, 68, 0.8)')
        ],
        borderColor: [
          ...matchingSkills.slice(0, 8).map(() => 'rgba(34, 197, 94, 1)'),
          ...missingSkills.slice(0, 4).map(() => 'rgba(239, 68, 68, 1)')
        ],
        borderWidth: 1,
      },
    ],
  };

  const skillsOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Skills Match Analysis',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: { label: string; parsed: { y: number } }) {
            const skill = context.label;
            const isMatching = context.parsed.y === 100;
            return `${skill}: ${isMatching ? 'Matching' : 'Missing'}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function (value: number | string) {
            return value === 100 ? 'Match' : value === 0 ? 'Missing' : '';
          }
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        }
      }
    },
  };

  const matchScoreData = {
    labels: ['Match Score', 'Gap'],
    datasets: [
      {
        data: [matchScore, 100 - matchScore],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(229, 231, 235, 0.8)',
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(229, 231, 235, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const matchScoreOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Overall Match Score',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: { label: string; parsed: number }) {
            const label = context.label;
            const value = context.parsed;
            return `${label}: ${value}%`;
          }
        }
      }
    },
    cutout: '60%',
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return 'Excellent match! Your resume aligns well with the job requirements.';
    if (score >= 60) return 'Good match! Consider highlighting more relevant skills.';
    return 'Needs improvement. Focus on developing the missing skills.';
  };

  return (
    <div className="space-y-8">
      {/* Score Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Resume Analysis Dashboard</h2>
          <div className={`text-6xl font-bold mb-2 ${getScoreColor(matchScore)}`}>
            {matchScore}%
          </div>
          <p className="text-gray-600 mb-4">{getScoreMessage(matchScore)}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-600">{matchingSkills.length}</div>
              <div className="text-sm text-gray-600">Matching Skills</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-red-600">{missingSkills.length}</div>
              <div className="text-sm text-gray-600">Missing Skills</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-indigo-600">
                {Math.round((matchingSkills.length / (matchingSkills.length + missingSkills.length)) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Skill Coverage</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Skills Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <Bar data={skillsData} options={skillsOptions} />
        </motion.div>

        {/* Match Score Doughnut Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <div className="relative">
            <Doughnut data={matchScoreData} options={matchScoreOptions} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(matchScore)}`}>
                  {matchScore}%
                </div>
                <div className="text-sm text-gray-500">Match</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Skill Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matching Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            Matching Skills ({matchingSkills.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {matchingSkills.map((skill, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
              >
                <span className="text-green-800 font-medium">{skill}</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Missing Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            Missing Skills ({missingSkills.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {missingSkills.map((skill, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
              >
                <span className="text-red-800 font-medium">{skill}</span>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Recommendations</h3>
        <div className="space-y-3 text-sm text-gray-700">
          {matchScore < 60 && (
            <div className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span>Consider adding more relevant keywords from the job description to your resume</span>
            </div>
          )}
          {missingSkills.length > 0 && (
            <div className="flex items-start">
              <span className="text-yellow-500 mr-2">•</span>
              <span>Focus on developing the missing skills: {missingSkills.slice(0, 3).join(', ')}</span>
            </div>
          )}
          {matchingSkills.length > 0 && (
            <div className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              <span>Highlight your strong skills: {matchingSkills.slice(0, 3).join(', ')}</span>
            </div>
          )}
          <div className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>Use specific examples and metrics to demonstrate your skills in action</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
