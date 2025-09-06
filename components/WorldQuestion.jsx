// components/WorldQuestion.jsx
import React from 'react';

export default function WorldQuestion({ 
  currentWorldQuestion,
  showWorldAnswer,
  finishWorldAnswering,
  awardWorldPoints,
  noCorrectWorldAnswer
}) {
  if (!currentWorldQuestion) return null;

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-4 md:p-8 mb-4 md:mb-8 shadow-2xl border border-slate-700">
      <div className="text-center mb-4 md:mb-6">
        {/* معلومات الدولة */}
        <div className="flex justify-center items-center gap-4 mb-4">
          <span className="text-6xl">{currentWorldQuestion.country.flag}</span>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {currentWorldQuestion.country.name}
            </h2>
            <span className="inline-block px-4 md:px-6 py-2 md:py-3 rounded-full text-white font-bold text-base md:text-lg bg-gradient-to-r from-green-500 to-emerald-500">
              {currentWorldQuestion.country.points} نقطة
            </span>
          </div>
        </div>

        {/* مؤشر صعوبة السؤال */}
        <div className="mb-4">
          <span className={`inline-block px-4 py-2 rounded-full text-white font-bold text-sm ${
            currentWorldQuestion.difficulty === 'easy' ? 'bg-green-500' :
            currentWorldQuestion.difficulty === 'medium' ? 'bg-yellow-500' : 
            'bg-red-500'
          }`}>
            {currentWorldQuestion.difficulty === 'easy' ? 'سهل' :
             currentWorldQuestion.difficulty === 'medium' ? 'متوسط' : 
             'صعب'}
          </span>
        </div>
      </div>
      
      <h3 className="text-lg md:text-2xl font-bold text-center mb-6 md:mb-8 text-slate-100">
        {currentWorldQuestion.question}
      </h3>
      
      {!showWorldAnswer ? (
        <div className="text-center">
          <button
            onClick={finishWorldAnswering}
            className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white px-6 md:px-8 py-2 md:py-3 rounded-xl font-bold text-base md:text-lg shadow-lg transition-all duration-300"
          >
            انتهينا من الإجابة
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="bg-emerald-500/20 border border-emerald-400/50 rounded-xl p-4 md:p-6 mb-4 md:mb-8 backdrop-blur-sm">
            <h4 className="text-base md:text-lg font-bold text-emerald-400 mb-2 md:mb-3">الإجابة الصحيحة:</h4>
            <p className="text-lg md:text-2xl text-white font-semibold">{currentWorldQuestion.answer}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-2 md:gap-6">
            <button
              onClick={() => awardWorldPoints('red')}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold text-sm md:text-base shadow-lg transition-all duration-300"
            >
              الفريق الأحمر أجاب صح
            </button>
            <button
              onClick={noCorrectWorldAnswer}
              className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold text-sm md:text-base shadow-lg transition-all duration-300"
            >
              لا أحد أجاب صح
            </button>
            <button
              onClick={() => awardWorldPoints('blue')}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold text-sm md:text-base shadow-lg transition-all duration-300"
            >
              الفريق الأزرق أجاب صح
            </button>
          </div>
        </div>
      )}
    </div>
  );
}