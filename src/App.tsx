import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Camera, Heart, Book, Lightbulb, CheckCircle, ArrowRight, TrendingUp, Calendar } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface JournalEntry {
  id: string;
  date: string;
  initialMood: number;
  finalMood: number;
  journalText: string;
  photos: string[];
  reflections: string[];
}

const moodEmojis = ['😢', '😞', '😐', '🙂', '😊', '😄', '🤗', '😁', '🥰', '🌟'];
const moodLabels = [
  'Terrible', 'Very Bad', 'Bad', 'Not Great', 'Okay', 
  'Good', 'Very Good', 'Great', 'Amazing', 'Fantastic'
];

const reflectionPrompts = [
  "What is one thing I learned from this experience?",
  "How might this challenge help me grow as a person?",
  "What would I tell a friend going through the same thing?",
  "What positive aspects can I find in this situation?",
  "How will this matter in 5 years from now?",
  "What strengths did I show in handling this situation?"
];

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [initialMood, setInitialMood] = useState(5);
  const [finalMood, setFinalMood] = useState(5);
  const [journalText, setJournalText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [reflections, setReflections] = useState<string[]>(['']);
  const [currentReflectionIndex, setCurrentReflectionIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  const steps = [
    'Initial Mood',
    'Journal Entry',
    'Self-Reflection',
    'Final Mood & Summary'
  ];

  useEffect(() => {
    const saved = localStorage.getItem('currentJournalEntry');
    if (saved) {
      const data = JSON.parse(saved);
      setInitialMood(data.initialMood || 5);
      setFinalMood(data.finalMood || 5);
      setJournalText(data.journalText || '');
      setPhotos(data.photos || []);
      setReflections(data.reflections || ['']);
      setCurrentReflectionIndex(data.currentReflectionIndex || 0);
      setCurrentStep(data.currentStep || 0);
    }
  }, []);

  useEffect(() => {
    const data = {
      initialMood,
      finalMood,
      journalText,
      photos,
      reflections,
      currentReflectionIndex,
      currentStep
    };
    localStorage.setItem('currentJournalEntry', JSON.stringify(data));
  }, [initialMood, finalMood, journalText, photos, reflections, currentReflectionIndex, currentStep]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const result = event.target?.result as string;
        setPhotos((prev: string[]) => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleReflectionChange = (index: number, value: string) => {
    const newReflections = [...reflections];
    newReflections[index] = value;
    setReflections(newReflections);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeJournal = () => {
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      initialMood,
      finalMood,
      journalText,
      photos,
      reflections
    };
    
    const savedEntries = localStorage.getItem('journalEntries');
    const entries = savedEntries ? JSON.parse(savedEntries) : [];
    entries.push(entry);
    localStorage.setItem('journalEntries', JSON.stringify(entries));
    localStorage.removeItem('currentJournalEntry');
    
    setIsCompleted(true);
  };

  const startNewEntry = () => {
    setCurrentStep(0);
    setInitialMood(5);
    setFinalMood(5);
    setJournalText('');
    setPhotos([]);
    setReflections(['']);
    setCurrentReflectionIndex(0);
    setIsCompleted(false);
    setShowProgress(false);
  };

  const getHistoricalData = () => {
    const savedEntries = localStorage.getItem('journalEntries');
    const entries: JournalEntry[] = savedEntries ? JSON.parse(savedEntries) : [];
    
    return entries
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30) // Show last 30 entries
      .map((entry, index) => ({
        day: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: new Date(entry.date).toLocaleDateString(),
        initialMood: entry.initialMood + 1, // Convert to 1-10 scale
        finalMood: entry.finalMood + 1,
        improvement: (entry.finalMood - entry.initialMood),
        index: index + 1
      }));
  };

  if (showProgress) {
    const data = getHistoricalData();
    const totalEntries = data.length;
    const averageImprovement = totalEntries > 0 ? data.reduce((sum, entry) => sum + entry.improvement, 0) / totalEntries : 0;
    const currentStreak = data.slice(-7).filter(entry => entry.improvement >= 0).length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <TrendingUp className="w-12 h-12 text-green-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-800">Your Progress</h1>
            </div>
            <p className="text-lg text-gray-600">Track your emotional growth over time</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-blue-500 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Total Entries</h3>
                  <p className="text-3xl font-bold text-blue-600">{totalEntries}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-green-500 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Avg Improvement</h3>
                  <p className="text-3xl font-bold text-green-600">
                    {averageImprovement > 0 ? '+' : ''}{averageImprovement.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center">
                <Heart className="w-8 h-8 text-pink-500 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Positive Streak</h3>
                  <p className="text-3xl font-bold text-pink-600">{currentStreak}/7 days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          {data.length > 0 ? (
            <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Mood Trends Over Time</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis domain={[1, 10]} />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        `${value}/10`, 
                        name === 'initialMood' ? 'Before Reflection' : 'After Reflection'
                      ]}
                      labelFormatter={(label) => `Date: ${data.find(d => d.day === label)?.fullDate}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="initialMood" 
                      stackId="1"
                      stroke="#ef4444" 
                      fill="#fecaca" 
                      name="initialMood"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="finalMood" 
                      stackId="2"
                      stroke="#10b981" 
                      fill="#86efac" 
                      name="finalMood"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex justify-center space-x-8 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-300 rounded mr-2"></div>
                  <span>Before Reflection</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-300 rounded mr-2"></div>
                  <span>After Reflection</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow-lg mb-8 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Data Yet</h2>
              <p className="text-gray-600">Complete a few journal entries to see your progress!</p>
            </div>
          )}

          {/* Back Button */}
          <div className="text-center">
            <button
              onClick={() => setShowProgress(false)}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Back to Journal
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Reflection Complete!</h1>
            <p className="text-lg text-gray-600">You've taken an important step in your personal growth journey.</p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Mood Journey</h2>
            <div className="flex justify-center items-center space-x-8">
              <div className="text-center">
                <div className="text-4xl mb-2">{moodEmojis[initialMood]}</div>
                <p className="text-sm text-gray-600">Before</p>
                <p className="font-semibold">{moodLabels[initialMood]}</p>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-400" />
              <div className="text-center">
                <div className="text-4xl mb-2">{moodEmojis[finalMood]}</div>
                <p className="text-sm text-gray-600">After</p>
                <p className="font-semibold">{moodLabels[finalMood]}</p>
              </div>
            </div>
            {finalMood > initialMood && (
              <div className="mt-4 p-3 bg-green-100 rounded-lg">
                <p className="text-green-800 font-semibold">
                  Great job! Your mood improved by {finalMood - initialMood} points through reflection.
                </p>
              </div>
            )}
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => setShowProgress(true)}
              className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              View Progress
            </button>
            <button
              onClick={startNewEntry}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Start New Reflection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <div></div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Self-Reflection Journal</h1>
              <p className="text-lg text-gray-600">Transform challenges into growth opportunities</p>
            </div>
            <button
              onClick={() => setShowProgress(true)}
              className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-2 rounded-full font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center"
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Progress
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="ml-2 text-sm font-medium hidden md:block">{step}</span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          {currentStep === 0 && (
            <div className="text-center">
              <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">How are you feeling right now?</h2>
              <p className="text-gray-600 mb-8">Before we start, let's check in with your current mood.</p>
              
              <div className="space-y-6">
                <div className="flex justify-center space-x-2 flex-wrap">
                  {moodEmojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => setInitialMood(index)}
                      className={`text-4xl p-3 rounded-full transition-all duration-200 hover:scale-110 ${
                        initialMood === index ? 'bg-blue-100 ring-2 ring-blue-400' : 'hover:bg-gray-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-800">{moodLabels[initialMood]}</p>
                  <p className="text-sm text-gray-500">Rating: {initialMood + 1}/10</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div>
              <div className="flex items-center mb-6">
                <Book className="w-8 h-8 text-blue-500 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Share Your Story</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Write about what happened today. Don't worry about grammar or structure - just let your thoughts flow.
              </p>
              
              <div className="space-y-6">
                <textarea
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  placeholder="Today was difficult because..."
                  className="w-full h-64 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                
                <div>
                  <label htmlFor="photo-upload" className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors">
                    <Camera className="w-6 h-6 text-gray-400 mr-2" />
                    <span className="text-gray-600">Add photos (optional)</span>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                
                {photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={photo}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg shadow-md"
                        />
                        <button
                          onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <div className="flex items-center mb-6">
                <Lightbulb className="w-8 h-8 text-yellow-500 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Self-Reflection</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Now let's reframe this experience. Choose a prompt and write your reflection to help shift your perspective.
              </p>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl overflow-hidden">
                  <div className="border-b border-yellow-200 bg-yellow-100/50 flex items-center justify-between">
                    <select
                      value={currentReflectionIndex}
                      onChange={(e) => setCurrentReflectionIndex(Number(e.target.value))}
                      className="flex-1 p-4 bg-transparent border-none focus:ring-0 focus:outline-none font-semibold text-gray-800 cursor-pointer appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 1rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '3rem'
                      }}
                    >
                      {reflectionPrompts.map((prompt, index) => (
                        <option key={index} value={index}>
                          {prompt}
                        </option>
                      ))}
                    </select>
                    {reflections.length > 1 && (
                      <div className="flex items-center space-x-2 px-4">
                        <span className="text-sm text-gray-600">
                          {currentReflectionIndex + 1} of {reflections.length}
                        </span>
                        <button
                          onClick={() => {
                            const newReflections = reflections.filter((_, i) => i !== currentReflectionIndex);
                            setReflections(newReflections);
                            setCurrentReflectionIndex(Math.max(0, currentReflectionIndex - 1));
                          }}
                          className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                          title="Delete this reflection"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <textarea
                      value={reflections[currentReflectionIndex] || ''}
                      onChange={(e) => handleReflectionChange(currentReflectionIndex, e.target.value)}
                      placeholder="Write your reflection here..."
                      className="w-full h-32 p-0 border-none focus:ring-0 focus:outline-none resize-none bg-transparent placeholder-gray-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  {reflections.length > 1 && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentReflectionIndex(Math.max(0, currentReflectionIndex - 1))}
                        disabled={currentReflectionIndex === 0}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          currentReflectionIndex === 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300'
                        }`}
                      >
                        ← Previous
                      </button>
                      <button
                        onClick={() => setCurrentReflectionIndex(Math.min(reflections.length - 1, currentReflectionIndex + 1))}
                        disabled={currentReflectionIndex === reflections.length - 1}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          currentReflectionIndex === reflections.length - 1
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300'
                        }`}
                      >
                        Next →
                      </button>
                    </div>
                  )}
                  
                  <button
                    onClick={() => {
                      setReflections([...reflections, '']);
                      setCurrentReflectionIndex(reflections.length);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <span className="mr-2 text-lg">+</span>
                    Add Another Reflection
                  </button>
                  
                  {reflections.length <= 1 && <div></div>}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <div className="text-center mb-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-4">How do you feel now?</h2>
                <p className="text-gray-600">After reflecting on your experience, rate your current mood.</p>
              </div>
              
              <div className="space-y-6">
                <div className="flex justify-center space-x-2 flex-wrap">
                  {moodEmojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => setFinalMood(index)}
                      className={`text-4xl p-3 rounded-full transition-all duration-200 hover:scale-110 ${
                        finalMood === index ? 'bg-green-100 ring-2 ring-green-400' : 'hover:bg-gray-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-800">{moodLabels[finalMood]}</p>
                  <p className="text-sm text-gray-500">Rating: {finalMood + 1}/10</p>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Reflection Summary</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Initial Mood:</p>
                    <p className="text-gray-600">{moodEmojis[initialMood]} {moodLabels[initialMood]}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Current Mood:</p>
                    <p className="text-gray-600">{moodEmojis[finalMood]} {moodLabels[finalMood]}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Journal Words:</p>
                    <p className="text-gray-600">{journalText.split(' ').filter(word => word.length > 0).length} words</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Reflections:</p>
                    <p className="text-gray-600">{reflections.filter(r => r.length > 0).length}/{reflections.length} completed</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              currentStep === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700 hover:shadow-lg'
            }`}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </button>
          
          {currentStep < steps.length - 1 ? (
            <button
              onClick={nextStep}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Next
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          ) : (
            <button
              onClick={completeJournal}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Complete Reflection
              <CheckCircle className="w-5 h-5 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;