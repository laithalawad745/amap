// components/GameSetup.jsx
import React from 'react';

export default function GameSetup({ startAbsiMatch }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 select-none flex flex-col">
      {/* Header */}
      <div className='flex justify-between p-4 md:p-8'>
        <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
          Absi
        </h1>
        <a 
          href="/contact" 
          className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400 hover:scale-105 transition-transform duration-300 cursor-pointer"
        >
          Contact
        </a>
      </div>

      {/* Main Content - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8">
        <div className="text-center space-y-8">
          {/* العنوان الرئيسي */}
          <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
            قومبز جيم 
          </h1>
          
          {/* أزرار الألعاب */}
          <div className="flex flex-col gap-6">
            {/* المباراة الكاملة */}
            <button
              onClick={startAbsiMatch}
              className="bg-gradient-to-r cursor-pointer from-purple-600 via-pink-500 to-blue-500 hover:from-purple-700 hover:via-pink-600 hover:to-blue-600 text-white px-8 md:px-12 lg:px-16 py-4 md:py-6 lg:py-8 rounded-2xl font-bold text-xl md:text-3xl lg:text-4xl shadow-2xl shadow-purple-500/30 transition-all duration-300 hover:scale-105 transform border-2 border-purple-400/50 hover:border-pink-400/70"
            >
              🏆 المباراة الكاملة
            </button>

            {/* فقرة من أسرع */}
            <button
              onClick={() => window.location.href = '/fastest'}
              className="bg-gradient-to-r cursor-pointer from-orange-500 via-red-500 to-yellow-500 hover:from-orange-600 hover:via-red-600 hover:to-yellow-600 text-white px-8 md:px-12 lg:px-16 py-4 md:py-6 lg:py-8 rounded-2xl font-bold text-xl md:text-3xl lg:text-4xl shadow-2xl shadow-orange-500/30 transition-all duration-300 hover:scale-105 transform border-2 border-orange-400/50 hover:border-red-400/70"
            >
              🏃‍♂️ فقرة من أسرع
            </button>

            {/* بطولة المعرفة - الجديدة */}
            <button
              onClick={() => window.location.href = '/tournament'}
              className="bg-gradient-to-r cursor-pointer from-yellow-600 via-orange-500 to-red-500 hover:from-yellow-700 hover:via-orange-600 hover:to-red-600 text-white px-8 md:px-12 lg:px-16 py-4 md:py-6 lg:py-8 rounded-2xl font-bold text-xl md:text-3xl lg:text-4xl shadow-2xl shadow-yellow-500/30 transition-all duration-300 hover:scale-105 transform border-2 border-yellow-400/50 hover:border-orange-400/70"
            >
              🏆 بطولة المعرفة
            </button>

            {/* لعبة النرد */}
            <button
              onClick={() => window.location.href = '/dice'}
              className="bg-gradient-to-r cursor-pointer from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white px-8 md:px-12 lg:px-16 py-4 md:py-6 lg:py-8 rounded-2xl font-bold text-xl md:text-3xl lg:text-4xl shadow-2xl shadow-emerald-500/30 transition-all duration-300 hover:scale-105 transform border-2 border-emerald-400/50 hover:border-teal-400/70"
            >
              🎲 لعبة النرد
            </button>

            {/* حول أوروبا */}
            <button
              onClick={() => window.location.href = '/europe'}
              className="bg-gradient-to-r cursor-pointer from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white px-8 md:px-12 lg:px-16 py-4 md:py-6 lg:py-8 rounded-2xl font-bold text-xl md:text-3xl lg:text-4xl shadow-2xl shadow-green-500/30 transition-all duration-300 hover:scale-105 transform border-2 border-green-400/50 hover:border-emerald-400/70"
            >
                أوروبا
            </button>

            {/* حول الوطن العربي */}
            <button
              onClick={() => window.location.href = '/arab'}
              className="bg-gradient-to-r cursor-pointer from-amber-600 via-yellow-600 to-orange-600 hover:from-amber-700 hover:via-yellow-700 hover:to-orange-700 text-white px-8 md:px-12 lg:px-16 py-4 md:py-6 lg:py-8 rounded-2xl font-bold text-xl md:text-3xl lg:text-4xl shadow-2xl shadow-amber-500/30 transition-all duration-300 hover:scale-105 transform border-2 border-amber-400/50 hover:border-yellow-400/70"
            >
                الوطن العربي
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}