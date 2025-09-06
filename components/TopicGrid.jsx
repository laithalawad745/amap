// components/TopicGrid.jsx
import React from 'react';

export default function TopicGrid({ 
  selectedTopics,
  currentTurn,
  currentQuestion,
  currentChoiceQuestion,
  currentWorldQuestion,
  usedChoiceQuestions,
  selectChoiceQuestion,
  selectRandomQuestionForTeam,
  isQuestionAvailable,
  getAvailableQuestionsCount,
  hasUsedQuestionsInLevel,
  setShowConfirmReset,
  occupiedCountries,
  teamCountries,
  startWorldTour, // ✅ استقبال الوظيفة الجديدة
  showWorldMap    // ✅ استقبال حالة العرض
}) {
  return (
    <>
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-3 md:p-8 shadow-2xl border border-slate-700">
        <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
          {selectedTopics.map(topic => {
            if (topic.id === 'choices') {
              // عرض أسئلة الاختيارات
              return (
                <div key={topic.id} className="text-center">
                  <h3 className="font-bold mb-4 p-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-xl shadow-lg text-sm md:text-base">
                    {topic.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-red-400 mb-1">أحمر</div>
                      {[1, 3, 5, 7].map(order => {
                        const isUsed = usedChoiceQuestions.includes(order);
                        const canSelect = currentTurn === 'red' && !isUsed && !currentQuestion && !currentChoiceQuestion && !showWorldMap;
                        
                        return (
                          <button
                            key={`choice-red-${order}`}
                            onClick={() => selectChoiceQuestion(order)}
                            disabled={!canSelect}
                            className={`w-full p-2 md:p-3 text-xs md:text-sm rounded-lg font-bold transition-all duration-300 border-2 ${
                              isUsed
                                ? 'bg-red-800/60 text-red-200 border-red-600/40 opacity-80 cursor-not-allowed' 
                                : canSelect
                                ? 'bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg border-red-400 hover:scale-105'
                                : 'bg-red-500/30 text-red-300 cursor-not-allowed border-red-500/30 opacity-75'
                            }`}
                          >
                            {isUsed ? '✓' : order}
                          </button>
                        );
                      })}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-blue-400 mb-1">أزرق</div>
                      {[2, 4, 6, 8].map(order => {
                        const isUsed = usedChoiceQuestions.includes(order);
                        const canSelect = currentTurn === 'blue' && !isUsed && !currentQuestion && !currentChoiceQuestion && !showWorldMap;
                        
                        return (
                          <button
                            key={`choice-blue-${order}`}
                            onClick={() => selectChoiceQuestion(order)}
                            disabled={!canSelect}
                            className={`w-full p-2 md:p-3 text-xs md:text-sm rounded-lg font-bold transition-all duration-300 border-2 ${
                              isUsed
                                ? 'bg-blue-800/60 text-blue-200 border-blue-600/40 opacity-80 cursor-not-allowed'
                                : canSelect
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md hover:shadow-lg border-blue-400 hover:scale-105'
                                : 'bg-blue-500/30 text-blue-300 cursor-not-allowed border-blue-500/30 opacity-75'
                            }`}
                          >
                            {isUsed ? '✓' : order}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            } else if (topic.id === 'world_tour') {
              // ✅ عرض فقرة حول العالم مع زر ابدأ
              return (
                <div key={topic.id} className="text-center">
                  <h3 className="font-bold mb-4 p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl shadow-lg text-sm md:text-base">
                    🌍 {topic.name}
                  </h3>
                  
                  {/* ✅ زر ابدأ بدلاً من معلومات الدول */}
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <button
                      onClick={startWorldTour}
                      disabled={showWorldMap || currentQuestion || currentChoiceQuestion}
                      className={`px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-lg md:text-xl shadow-lg transition-all duration-300 transform ${
                        showWorldMap || currentQuestion || currentChoiceQuestion
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white hover:scale-105'
                      }`}
                    >
                      🗺️ ابدأ
                    </button>

                    {/* ✅ شريط التقدم فقط */}
                    <div className="w-full p-3 bg-slate-700/50 rounded-lg">
                      <div className="text-xs text-slate-300 mb-2">
                        التقدم: {occupiedCountries ? occupiedCountries.length : 0}/{topic.countries.length} دولة
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${occupiedCountries && topic.countries ? (occupiedCountries.length / topic.countries.length) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* ✅ عرض عدد النقاط لكل فريق */}
                    {(teamCountries.red.length > 0 || teamCountries.blue.length > 0) && (
                      <div className="grid grid-cols-2 gap-2 w-full">
                        <div className="bg-red-500/20 rounded-lg p-2">
                          <div className="text-xs font-bold text-red-400">الأحمر</div>
                          <div className="text-sm text-white font-bold">
                            {teamCountries && teamCountries.red ? teamCountries.red.reduce((total, countryId) => {
                              const country = topic.countries.find(c => c.id === countryId);
                              return total + (country ? country.points : 0);
                            }, 0) : 0} نقطة
                          </div>
                        </div>
                        
                        <div className="bg-blue-500/20 rounded-lg p-2">
                          <div className="text-xs font-bold text-blue-400">الأزرق</div>
                          <div className="text-sm text-white font-bold">
                            {teamCountries && teamCountries.blue ? teamCountries.blue.reduce((total, countryId) => {
                              const country = topic.countries.find(c => c.id === countryId);
                              return total + (country ? country.points : 0);
                            }, 0) : 0} نقطة
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            } else {
              // عرض الأسئلة العادية
              return (
                <div key={topic.id} className="text-center">
                  <h3 className="font-bold mb-4 p-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl shadow-lg text-sm md:text-base">
                    {topic.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-red-400 mb-1">أحمر</div>
                      {['easy', 'medium', 'hard'].map(difficulty => {
                        const points = difficulty === 'easy' ? 200 : difficulty === 'medium' ? 400 : 600;
                        const hasTeamUsedThisLevel = hasUsedQuestionsInLevel(topic.id, difficulty, 'red');
                        const isAvailable = isQuestionAvailable(topic.id, difficulty, 'red');
                        const availableCount = getAvailableQuestionsCount(topic.id, difficulty, 'red');
                        const isDisabled = !isAvailable || currentQuestion !== null || currentChoiceQuestion !== null || currentTurn !== 'red' || hasTeamUsedThisLevel || showWorldMap;
                        
                        return (
                          <button
                            key={`${topic.id}-red-${difficulty}`}
                            onClick={() => selectRandomQuestionForTeam(topic.id, difficulty, 'red')}
                            disabled={isDisabled}
                            className={`w-full p-2 md:p-3 text-xs md:text-sm rounded-lg font-bold transition-all duration-300 border-2 ${
                              hasTeamUsedThisLevel
                                ? 'bg-red-800/60 text-red-200 border-red-600/40 opacity-80 cursor-not-allowed' 
                                : !isAvailable
                                ? 'bg-slate-700/70 text-slate-400 cursor-not-allowed border-slate-500/50 opacity-60'
                                : currentTurn === 'red' && currentQuestion === null && currentChoiceQuestion === null && !showWorldMap
                                ? 'bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg border-red-400 hover:scale-105'
                                : 'bg-red-500/30 text-red-300 cursor-not-allowed border-red-500/30 opacity-75'
                            }`}
                            title={hasTeamUsedThisLevel ? 'تم استخدامه' : `أسئلة متاحة: ${availableCount}`}
                          >
                            {hasTeamUsedThisLevel ? '✓' : !isAvailable ? '🚫' : `${points}`}
                          </button>
                        );
                      })}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-blue-400 mb-1">أزرق</div>
                      {['easy', 'medium', 'hard'].map(difficulty => {
                        const points = difficulty === 'easy' ? 200 : difficulty === 'medium' ? 400 : 600;
                        const hasTeamUsedThisLevel = hasUsedQuestionsInLevel(topic.id, difficulty, 'blue');
                        const isAvailable = isQuestionAvailable(topic.id, difficulty, 'blue');
                        const availableCount = getAvailableQuestionsCount(topic.id, difficulty, 'blue');
                        const isDisabled = !isAvailable || currentQuestion !== null || currentChoiceQuestion !== null || currentTurn !== 'blue' || hasTeamUsedThisLevel || showWorldMap;
                        
                        return (
                          <button
                            key={`${topic.id}-blue-${difficulty}`}
                            onClick={() => selectRandomQuestionForTeam(topic.id, difficulty, 'blue')}
                            disabled={isDisabled}
                            className={`w-full p-2 md:p-3 text-xs md:text-sm rounded-lg font-bold transition-all duration-300 border-2 ${
                              hasTeamUsedThisLevel
                                ? 'bg-blue-800/60 text-blue-200 border-blue-600/40 opacity-80 cursor-not-allowed'
                                : !isAvailable
                                ? 'bg-slate-700/70 text-slate-400 cursor-not-allowed border-slate-500/50 opacity-60'
                                : currentTurn === 'blue' && currentQuestion === null && currentChoiceQuestion === null && !showWorldMap
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md hover:shadow-lg border-blue-400 hover:scale-105'
                                : 'bg-blue-500/30 text-blue-300 cursor-not-allowed border-blue-500/30 opacity-75'
                            }`}
                            title={hasTeamUsedThisLevel ? 'تم استخدامه' : `أسئلة متاحة: ${availableCount}`}
                          >
                            {hasTeamUsedThisLevel ? '✓' : !isAvailable ? '🚫' : `${points}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>

      <div className="text-center mt-4 md:mt-8">
        <button
          onClick={() => setShowConfirmReset(true)}
          className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-6 md:px-8 py-2 md:py-3 rounded-xl font-bold text-sm md:text-base shadow-lg transition-all duration-300"
        >
          إعادة تشغيل اللعبة
        </button>
      </div>
    </>
  );
}