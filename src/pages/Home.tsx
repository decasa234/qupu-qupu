import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Search, Play, BookOpen, Clock, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';

interface Content {
  id: string;
  title: string;
  code: string;
  youtube_url: string;
  thumbnail_url: string;
  number_of_questions: number;
  subjects: {
    name: string;
    color_hex: string;
  };
  age_groups: {
    name: string;
  };
}

const Home = () => {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    fetchContents();
  }, [selectedSubject, searchTerm]);

  const fetchContents = async () => {
    try {
      let url = '/contents?';
      if (searchTerm) url += `search=${searchTerm}&`;
      if (selectedSubject) url += `subject=${selectedSubject}&`;
      
      const response = await api.get(url);
      setContents(response.data.data.contents);
    } catch (error) {
      console.error('Error fetching contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const subjects = [
    { name: 'Mathematics', color: 'bg-purple-500' },
    { name: 'Literacy', color: 'bg-orange-500' },
    { name: 'Biology', color: 'bg-green-500' },
    { name: 'Chemistry', color: 'bg-indigo-500' },
    { name: 'Physics', color: 'bg-yellow-500' },
    { name: 'History', color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-800 to-indigo-900 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] opacity-10 bg-cover bg-center"></div>
        <div className="relative z-10 px-8 py-16 md:py-20 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6 tracking-tight"
          >
            Learning is an <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">Adventure!</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto"
          >
            Watch videos, take quizzes, and track your progress. Select a subject below to get started!
          </motion.p>
          
          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-xl mx-auto relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by code or title..."
              className="w-full pl-12 pr-4 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-orange-500 shadow-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </motion.div>
        </div>
      </section>

      {/* Subject Filters */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => setSelectedSubject('')}
          className={`px-6 py-2 rounded-full font-medium transition-all ${
            selectedSubject === ''
              ? 'bg-gray-800 text-white shadow-lg scale-105'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          All
        </button>
        {subjects.map((sub) => (
          <button
            key={sub.name}
            onClick={() => setSelectedSubject(sub.name)}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              selectedSubject === sub.name
                ? `${sub.color} text-white shadow-lg scale-105`
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {sub.name}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {contents.map((content) => (
            <motion.div
              key={content.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all"
            >
              <div className="relative aspect-video">
                <img
                  src={content.thumbnail_url || `https://img.youtube.com/vi/${content.youtube_url.split('v=')[1]}/0.jpg`}
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2">
                  <span 
                    className="px-2 py-1 rounded-md text-xs font-bold text-white shadow-sm"
                    style={{ backgroundColor: content.subjects?.color_hex || '#6B46C1' }}
                  >
                    {content.subjects?.name}
                  </span>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <Clock size={12} />
                  <span>10m</span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                    {content.age_groups?.name}
                  </span>
                  <span className="text-xs font-mono text-purple-600 dark:text-purple-400 font-bold">
                    {content.code}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 h-14">
                  {content.title}
                </h3>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <BookOpen size={16} />
                    <span>{content.number_of_questions} Questions</span>
                  </div>
                  
                  <Link
                    to={`/scoring?content=${content.id}`}
                    className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
                  >
                    <Play size={16} fill="currentColor" />
                    Start
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {!loading && contents.length === 0 && (
        <div className="text-center py-20">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Search className="text-gray-400 w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No quizzes found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default Home;
