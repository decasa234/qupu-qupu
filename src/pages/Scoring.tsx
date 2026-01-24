import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { CheckCircle, AlertCircle, Save, ArrowRight, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Content {
  id: string;
  title: string;
  code: string;
  youtube_url: string;
  number_of_questions: number;
  subjects: {
    name: string;
    color_hex: string;
  };
}

const Scoring = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const contentId = searchParams.get('content');
  
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [correctAnswers, setCorrectAnswers] = useState<number | ''>('');
  const [score, setScore] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (contentId) {
      fetchContent(contentId);
    } else {
      setLoading(false);
    }
  }, [contentId]);

  const fetchContent = async (id: string) => {
    try {
      const response = await api.get(`/contents/${id}`);
      setContent(response.data.data);
    } catch (error) {
      console.error('Error fetching content:', error);
      setError('Failed to load quiz content');
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = () => {
    if (!content || correctAnswers === '') return;
    
    const numCorrect = Number(correctAnswers);
    if (numCorrect < 0 || numCorrect > content.number_of_questions) {
      setError(`Please enter a number between 0 and ${content.number_of_questions}`);
      return;
    }
    
    const percentage = (numCorrect / content.number_of_questions) * 100;
    setScore(percentage);
    setError('');
  };

  const handleSave = async () => {
    if (!content || score === null || correctAnswers === '') return;

    try {
      await api.post('/scores', {
        contentId: content.id,
        correctAnswers: Number(correctAnswers),
        totalQuestions: content.number_of_questions
      });
      setSaved(true);
    } catch (error) {
      console.error('Error saving score:', error);
      setError('Failed to save score. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Select a Quiz</h2>
        <p className="text-gray-500 mb-8">Please select a quiz from the homepage to start scoring.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-purple-600 text-white px-6 py-3 rounded-full font-bold hover:bg-purple-700 transition-colors"
        >
          Go to Homepage
        </button>
      </div>
    );
  }

  const getYoutubeEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1];
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Video Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-black rounded-xl overflow-hidden shadow-2xl aspect-video">
            <iframe
              width="100%"
              height="100%"
              src={getYoutubeEmbedUrl(content.youtube_url)}
              title={content.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{content.title}</h1>
                <div className="flex items-center gap-3">
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: content.subjects.color_hex }}
                  >
                    {content.subjects.name}
                  </span>
                  <span className="text-gray-500 font-mono font-medium">{content.code}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-sm text-gray-500">Total Questions</span>
                <span className="text-2xl font-bold text-purple-600">{content.number_of_questions}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scoring Section */}
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl sticky top-24"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <CheckCircle className="text-green-500" />
              Score Your Quiz
            </h2>

            {saved ? (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Great Job!</h3>
                <p className="text-gray-500 mb-6">Your score has been saved successfully.</p>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/my-quizzes')}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors"
                  >
                    View Progress
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold py-3 rounded-lg transition-colors"
                  >
                    Take Another Quiz
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    How many did you get correct?
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={content.number_of_questions}
                    value={correctAnswers}
                    onChange={(e) => {
                      setCorrectAnswers(e.target.value === '' ? '' : Number(e.target.value));
                      setScore(null);
                      setError('');
                    }}
                    className="w-full text-center text-4xl font-bold p-4 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-0 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="0"
                  />
                  <p className="text-center text-sm text-gray-500 mt-2">
                    out of {content.number_of_questions} questions
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <AnimatePresence>
                  {score !== null && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-center bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl"
                    >
                      <span className="text-sm text-gray-500 uppercase tracking-wide font-bold">Your Score</span>
                      <div className={`text-5xl font-black my-2 ${getScoreColor(score)}`}>
                        {score.toFixed(0)}%
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button
                    onClick={calculateScore}
                    disabled={correctAnswers === ''}
                    className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Calculate
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={score === null}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Save size={18} />
                    Save Score
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Scoring;
