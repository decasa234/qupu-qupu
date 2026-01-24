import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { BarChart2, TrendingUp, Calendar, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface Score {
  id: string;
  score_percentage: number;
  created_at: string;
  contents: {
    title: string;
    code: string;
    subjects: {
      name: string;
      color_hex: string;
    };
  };
}

interface Analytics {
  totalQuizzes: number;
  averageScore: number;
  recentActivity: Score[];
}

const MyQuizzes = () => {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [analyticsRes, scoresRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get(`/scores/user/${user?.id}`)
      ]);
      setAnalytics(analyticsRes.data.data);
      setScores(scoresRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Progress</h1>
        <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full font-medium text-sm">
          {user?.name}'s Dashboard
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-purple-500"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Award className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Quizzes</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.totalQuizzes}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-orange-500"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Average Score</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.averageScore}%</h3>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-green-500"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Last Active</p>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {scores.length > 0 ? new Date(scores[0].created_at).toLocaleDateString() : 'N/A'}
              </h3>
            </div>
          </div>
        </motion.div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="text-purple-500" />
            Quiz History
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quiz</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {scores.map((score) => (
                <tr key={score.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900 dark:text-white">{score.contents.title}</div>
                    <div className="text-xs text-gray-500">{score.contents.code}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className="px-2 py-1 rounded-md text-xs font-bold text-white"
                      style={{ backgroundColor: score.contents.subjects.color_hex }}
                    >
                      {score.contents.subjects.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(score.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getScoreBg(Number(score.score_percentage))} ${getScoreColor(Number(score.score_percentage))}`}>
                      {score.score_percentage}%
                    </span>
                  </td>
                </tr>
              ))}
              
              {scores.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    No quizzes taken yet. Start learning today!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyQuizzes;
