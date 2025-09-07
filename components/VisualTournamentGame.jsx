// components/VisualTournamentGame.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { tournamentQuestions } from '../app/data/tournamentData';

export default function VisualTournamentGame() {
  // حالة اللعبة
  const [gamePhase, setGamePhase] = useState('setup'); // 'setup', 'playing', 'finished'
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentTurn, setCurrentTurn] = useState('red');
  
  // مواضع اللاعبين في الشجرة
  const [tournamentTree, setTournamentTree] = useState({
    // دور الـ8 (8 مواضع)
    round8: [
      { id: 'r8_1', player: 'red', status: 'waiting' },    // اللاعب الأحمر في الموضع الأول
      { id: 'r8_2', player: null, status: 'empty' },
      { id: 'r8_3', player: null, status: 'empty' },
      { id: 'r8_4', player: null, status: 'empty' },
      { id: 'r8_5', player: null, status: 'empty' },
      { id: 'r8_6', player: null, status: 'empty' },
      { id: 'r8_7', player: null, status: 'empty' },
      { id: 'r8_8', player: 'blue', status: 'waiting' }    // اللاعب الأزرق في الموضع الأخير
    ],
    // دور الـ4 (4 مواضع)
    round4: [
      { id: 'r4_1', player: null, status: 'empty' },
      { id: 'r4_2', player: null, status: 'empty' },
      { id: 'r4_3', player: null, status: 'empty' },
      { id: 'r4_4', player: null, status: 'empty' }
    ],
    // نصف النهائي (2 مواضع)
    semi: [
      { id: 'semi_1', player: null, status: 'empty' },
      { id: 'semi_2', player: null, status: 'empty' }
    ],
    // النهائي (1 موضع)
    final: [
      { id: 'final_1', player: null, status: 'empty' }
    ]
  });

  const [playerScores, setPlayerScores] = useState({
    red: 0,
    blue: 0
  });

  const [currentRound, setCurrentRound] = useState('round8');
  const [activePosition, setActivePosition] = useState('r8_1'); // الموضع النشط حالياً

  // إعدادات الأدوار
  const roundConfig = {
    round8: { name: 'دور الـ8', points: 20, nextRound: 'round4' },
    round4: { name: 'دور الـ4', points: 40, nextRound: 'semi' },
    semi: { name: 'نصف النهائي', points: 80, nextRound: 'final' },
    final: { name: 'النهائي', points: 160, nextRound: null }
  };

  // بدء اللعبة
  const startGame = () => {
    setGamePhase('playing');
    startNewQuestion();
  };

  // بدء سؤال جديد
  const startNewQuestion = () => {
    const currentRoundIndex = currentRound === 'round8' ? 1 : 
                             currentRound === 'round4' ? 2 : 
                             currentRound === 'semi' ? 3 : 4;
    
    const availableQuestions = tournamentQuestions.filter(q => 
      q.round === currentRoundIndex && !q.used
    );
    
    if (availableQuestions.length === 0) {
      console.error('No questions available for round', currentRound);
      return;
    }

    const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    randomQuestion.used = true;
    
    setCurrentQuestion(randomQuestion);
    setShowAnswer(false);
  };

  // إنهاء الإجابة
  const finishAnswering = () => {
    setShowAnswer(true);
  };

  // إجابة صحيحة - الانتقال للدور التالي
  const correctAnswer = () => {
    const currentConfig = roundConfig[currentRound];
    
    // إضافة النقاط
    const newScores = { ...playerScores };
    newScores[currentTurn] += currentConfig.points;
    setPlayerScores(newScores);

    // تحديث الشجرة
    movePlayerToNextRound();
  };

  // إجابة خاطئة - الخروج من البطولة
  const wrongAnswer = () => {
    eliminatePlayer();
  };

  // انسحاب اللاعب
  const withdrawPlayer = () => {
    const currentConfig = roundConfig[currentRound];
    
    // إضافة نقاط الانسحاب
    const newScores = { ...playerScores };
    newScores[currentTurn] += currentConfig.points;
    setPlayerScores(newScores);

    eliminatePlayer();
  };

  // إزالة اللاعب من البطولة
  const eliminatePlayer = () => {
    const newTree = { ...tournamentTree };
    
    // العثور على موضع اللاعب الحالي وإزالته
    Object.keys(newTree).forEach(round => {
      newTree[round].forEach(position => {
        if (position.id === activePosition && position.player === currentTurn) {
          position.player = null;
          position.status = 'eliminated';
        }
      });
    });

    setTournamentTree(newTree);
    
    // التحقق من وجود لاعب آخر
    switchToOtherPlayer();
  };

  // الانتقال للاعب الآخر
  const switchToOtherPlayer = () => {
    const otherPlayer = currentTurn === 'red' ? 'blue' : 'red';
    
    // البحث عن موضع اللاعب الآخر في الدور الحالي
    const currentRoundPositions = tournamentTree[currentRound];
    const otherPlayerPosition = currentRoundPositions.find(pos => pos.player === otherPlayer);
    
    if (otherPlayerPosition) {
      setCurrentTurn(otherPlayer);
      setActivePosition(otherPlayerPosition.id);
      setTimeout(() => {
        startNewQuestion();
      }, 1500);
    } else {
      // لا يوجد لاعب آخر - انتهاء البطولة
      setGamePhase('finished');
    }
  };

  // نقل اللاعب للدور التالي
  const movePlayerToNextRound = () => {
    const currentConfig = roundConfig[currentRound];
    const nextRound = currentConfig.nextRound;
    
    if (!nextRound) {
      // وصل للنهائي
      setGamePhase('finished');
      return;
    }

    const newTree = { ...tournamentTree };
    
    // العثور على أول موضع فارغ في الدور التالي
    const nextRoundPositions = newTree[nextRound];
    const emptyPosition = nextRoundPositions.find(pos => pos.player === null);
    
    if (emptyPosition) {
      // نقل اللاعب للموضع الجديد
      emptyPosition.player = currentTurn;
      emptyPosition.status = 'advancing';
      
      // تحديث الموضع القديم
      Object.keys(newTree).forEach(round => {
        newTree[round].forEach(position => {
          if (position.id === activePosition) {
            position.status = 'completed';
          }
        });
      });
      
      setTournamentTree(newTree);
      
      // تحديث الدور الحالي إذا انتهى
      checkRoundCompletion(nextRound);
    }

    // الانتقال للاعب الآخر
    switchToOtherPlayer();
  };

  // التحقق من اكتمال الدور
  const checkRoundCompletion = (nextRound) => {
    const currentRoundPositions = tournamentTree[currentRound];
    const playersInCurrentRound = currentRoundPositions.filter(pos => 
      pos.player && pos.status !== 'completed' && pos.status !== 'eliminated'
    );

    if (playersInCurrentRound.length === 0) {
      // انتهى الدور الحالي
      setCurrentRound(nextRound);
    }
  };

  // إعادة تشغيل اللعبة
  const resetGame = () => {
    setGamePhase('setup');
    setCurrentQuestion(null);
    setShowAnswer(false);
    setCurrentTurn('red');
    setCurrentRound('round8');
    setActivePosition('r8_1');
    
    setPlayerScores({ red: 0, blue: 0 });
    
    setTournamentTree({
      round8: [
        { id: 'r8_1', player: 'red', status: 'waiting' },
        { id: 'r8_2', player: null, status: 'empty' },
        { id: 'r8_3', player: null, status: 'empty' },
        { id: 'r8_4', player: null, status: 'empty' },
        { id: 'r8_5', player: null, status: 'empty' },
        { id: 'r8_6', player: null, status: 'empty' },
        { id: 'r8_7', player: null, status: 'empty' },
        { id: 'r8_8', player: 'blue', status: 'waiting' }
      ],
      round4: [
        { id: 'r4_1', player: null, status: 'empty' },
        { id: 'r4_2', player: null, status: 'empty' },
        { id: 'r4_3', player: null, status: 'empty' },
        { id: 'r4_4', player: null, status: 'empty' }
      ],
      semi: [
        { id: 'semi_1', player: null, status: 'empty' },
        { id: 'semi_2', player: null, status: 'empty' }
      ],
      final: [
        { id: 'final_1', player: null, status: 'empty' }
      ]
    });
    
    // إعادة تعيين الأسئلة
    tournamentQuestions.forEach(q => q.used = false);
  };

  // مكون دائرة اللاعب
  const PlayerCircle = ({ position, roundName, index }) => {
    const getCircleStyle = () => {
      if (position.player === 'red') {
        return position.id === activePosition 
          ? 'bg-gradient-to-br from-red-400 to-red-600 ring-4 ring-red-300 shadow-2xl shadow-red-500/50 animate-pulse'
          : 'bg-gradient-to-br from-red-500 to-red-700 shadow-xl';
      } else if (position.player === 'blue') {
        return position.id === activePosition 
          ? 'bg-gradient-to-br from-blue-400 to-blue-600 ring-4 ring-blue-300 shadow-2xl shadow-blue-500/50 animate-pulse'
          : 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-xl';
      } else {
        return position.status === 'eliminated' 
          ? 'bg-gray-800 border-2 border-gray-600 opacity-50'
          : 'bg-gray-700 border-2 border-gray-500 hover:border-gray-400';
      }
    };

    const getCircleSize = () => {
      switch (roundName) {
        case 'round8': return 'w-12 h-12 md:w-16 md:h-16';
        case 'round4': return 'w-14 h-14 md:w-18 md:h-18';
        case 'semi': return 'w-16 h-16 md:w-20 md:h-20';
        case 'final': return 'w-20 h-20 md:w-24 md:h-24';
        default: return 'w-12 h-12';
      }
    };

    return (
      <div className={`
        ${getCircleSize()}
        ${getCircleStyle()}
        rounded-full
        flex items-center justify-center
        transition-all duration-500
        cursor-pointer
        relative
      `}>
        {position.player && (
          <span className="text-white font-bold text-xs md:text-sm">
            {position.player === 'red' ? 'أ' : 'ز'}
          </span>
        )}
        
        {position.id === activePosition && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <div className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold animate-bounce">
              الدور الحالي
            </div>
          </div>
        )}
      </div>
    );
  };

  // صفحة الإعداد
  if (gamePhase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-yellow-900 to-slate-900 select-none flex flex-col">
        <div className="flex justify-between p-4 md:p-8">
          <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
            🏆 بطولة المعرفة
          </h1>
          <Link 
            href="/"
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold text-sm md:text-base shadow-lg transition-all duration-300"
          >
            ← العودة للرئيسية
          </Link>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8">
          <div className="text-center space-y-8 max-w-4xl">
            <h1 className="text-3xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              🏆 بطولة المعرفة التفاعلية
            </h1>
            
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-slate-700">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-6">نظام البطولة الجديد:</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-yellow-400">🎯</span>
                    <span className="text-slate-300">شجرة بطولة تفاعلية مثل البطولات الحقيقية</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-green-400">⚡</span>
                    <span className="text-slate-300">إجابة صحيحة = تقدم للدور التالي</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-blue-400">🏃</span>
                    <span className="text-slate-300">يمكن الانسحاب والحفاظ على النقاط</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-red-400">❌</span>
                    <span className="text-slate-300">إجابة خاطئة = الخروج من البطولة</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-purple-400">🔄</span>
                    <span className="text-slate-300">تناوب بين اللاعبين</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-orange-400">👑</span>
                    <span className="text-slate-300">الهدف: الوصول للنهائي</span>
                  </div>
                </div>
              </div>

              {/* جدول النقاط */}
              <div className="mt-8 bg-slate-700/30 rounded-xl p-4">
                <h3 className="text-center text-yellow-400 font-bold text-lg mb-4">نظام النقاط:</h3>
                <div className="grid grid-cols-4 gap-2 text-center text-sm">
                  <div className="bg-blue-500/20 rounded-lg p-2">
                    <div className="font-bold text-blue-400">دور الـ8</div>
                    <div className="text-white">20 نقطة</div>
                  </div>
                  <div className="bg-purple-500/20 rounded-lg p-2">
                    <div className="font-bold text-purple-400">دور الـ4</div>
                    <div className="text-white">40 نقطة</div>
                  </div>
                  <div className="bg-orange-500/20 rounded-lg p-2">
                    <div className="font-bold text-orange-400">نصف نهائي</div>
                    <div className="text-white">80 نقطة</div>
                  </div>
                  <div className="bg-yellow-500/20 rounded-lg p-2">
                    <div className="font-bold text-yellow-400">النهائي</div>
                    <div className="text-white">160 نقطة</div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={startGame}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-12 py-6 rounded-2xl font-bold text-2xl shadow-2xl shadow-yellow-500/30 transition-all duration-300 hover:scale-105 transform border-2 border-yellow-400/50"
            >
              🏆 ابدأ البطولة التفاعلية!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // صفحة انتهاء اللعبة
  if (gamePhase === 'finished') {
    const winner = playerScores.red > playerScores.blue ? 'red' : 
                   playerScores.blue > playerScores.red ? 'blue' : null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-yellow-900 to-slate-900 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Link 
              href="/"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold text-sm md:text-base shadow-lg transition-all duration-300"
            >
              ← العودة للرئيسية
            </Link>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 text-center shadow-2xl border border-slate-700">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              🏆 انتهت البطولة!
            </h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className={`p-6 rounded-xl transition-all duration-500 ${
                winner === 'red'
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 ring-4 ring-yellow-400/50 shadow-2xl' 
                  : 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg'
              }`}>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">اللاعب الأحمر</h2>
                <p className="text-3xl md:text-4xl font-bold text-white">{playerScores.red}</p>
                {winner === 'red' && <p className="text-yellow-200 font-bold mt-2">🏆 بطل المعرفة</p>}
              </div>
              
              <div className={`p-6 rounded-xl transition-all duration-500 ${
                winner === 'blue'
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 ring-4 ring-yellow-400/50 shadow-2xl' 
                  : 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg'
              }`}>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">اللاعب الأزرق</h2>
                <p className="text-3xl md:text-4xl font-bold text-white">{playerScores.blue}</p>
                {winner === 'blue' && <p className="text-yellow-200 font-bold mt-2">🏆 بطل المعرفة</p>}
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">
                {winner ? `اللاعب ${winner === 'red' ? 'الأحمر' : 'الأزرق'} هو بطل المعرفة!` : 'تعادل!'}
              </h2>
              <p className="text-lg text-slate-300">
                الأحمر: {playerScores.red} • الأزرق: {playerScores.blue}
              </p>
            </div>
            
            <div className="flex justify-center gap-4">
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300"
              >
                بطولة جديدة 🏆
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // صفحة اللعب - شجرة البطولة التفاعلية
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-yellow-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
            🏆 بطولة المعرفة
          </h1>
          <div className="flex gap-4">
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg transition-all duration-300"
            >
              إعادة تشغيل
            </button>
            <Link 
              href="/"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold text-sm md:text-base shadow-lg transition-all duration-300"
            >
              ← العودة للرئيسية
            </Link>
          </div>
        </div>

        {/* نتائج اللاعبين */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className={`p-6 rounded-2xl text-center transition-all duration-500 ${
            currentTurn === 'red'
              ? 'bg-gradient-to-br from-red-500 to-pink-500 shadow-2xl shadow-red-500/25 ring-4 ring-red-400/50'
              : 'bg-gradient-to-br from-red-500/70 to-pink-500/70 shadow-lg'
          }`}>
            <h2 className="text-lg md:text-2xl font-bold text-white mb-2">اللاعب الأحمر</h2>
            <p className="text-3xl md:text-4xl font-bold text-white">{playerScores.red}</p>
          </div>
          
          <div className={`p-6 rounded-2xl text-center transition-all duration-500 ${
            currentTurn === 'blue'
              ? 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-2xl shadow-blue-500/25 ring-4 ring-blue-400/50'
              : 'bg-gradient-to-br from-blue-500/70 to-indigo-500/70 shadow-lg'
          }`}>
            <h2 className="text-lg md:text-2xl font-bold text-white mb-2">اللاعب الأزرق</h2>
            <p className="text-3xl md:text-4xl font-bold text-white">{playerScores.blue}</p>
          </div>
        </div>

        {/* شجرة البطولة */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 mb-8 shadow-2xl border border-slate-700">
          <h3 className="text-center text-yellow-400 font-bold text-xl mb-8">شجرة البطولة</h3>
          
          <div className="space-y-8">
            {/* النهائي */}
            <div className="text-center">
              <h4 className="text-yellow-400 font-bold mb-4">🏆 النهائي</h4>
              <div className="flex justify-center">
                <PlayerCircle position={tournamentTree.final[0]} roundName="final" index={0} />
              </div>
            </div>

            {/* خط ربط */}
            <div className="flex justify-center">
              <div className="w-px h-8 bg-gradient-to-b from-yellow-400 to-orange-400"></div>
            </div>

            {/* نصف النهائي */}
            <div className="text-center">
              <h4 className="text-orange-400 font-bold mb-4">نصف النهائي</h4>
              <div className="flex justify-center gap-16">
                {tournamentTree.semi.map((position, index) => (
                  <PlayerCircle key={position.id} position={position} roundName="semi" index={index} />
                ))}
              </div>
            </div>

            {/* خط ربط */}
            <div className="flex justify-center">
              <div className="w-32 h-px bg-gradient-to-r from-orange-400 to-purple-400"></div>
            </div>

            {/* دور الـ4 */}
            <div className="text-center">
              <h4 className="text-purple-400 font-bold mb-4">دور الـ4</h4>
              <div className="flex justify-center gap-8">
                {tournamentTree.round4.map((position, index) => (
                  <PlayerCircle key={position.id} position={position} roundName="round4" index={index} />
                ))}
              </div>
            </div>

            {/* خط ربط */}
            <div className="flex justify-center">
              <div className="w-64 h-px bg-gradient-to-r from-purple-400 to-blue-400"></div>
            </div>

            {/* دور الـ8 */}
            <div className="text-center">
              <h4 className="text-blue-400 font-bold mb-4">دور الـ8</h4>
              <div className="flex justify-center gap-4 flex-wrap">
                {tournamentTree.round8.map((position, index) => (
                  <PlayerCircle key={position.id} position={position} roundName="round8" index={index} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* منطقة السؤال */}
        {currentQuestion && (
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-700">
            <div className="text-center mb-6">
              <div className={`inline-block px-6 py-3 rounded-full text-white font-bold text-lg ${
                currentTurn === 'red' 
                  ? 'bg-gradient-to-r from-red-500 to-pink-500'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500'
              }`}>
                دور اللاعب {currentTurn === 'red' ? 'الأحمر' : 'الأزرق'} • {roundConfig[currentRound].name} • {roundConfig[currentRound].points} نقطة
              </div>
            </div>
            
            <h3 className="text-xl md:text-2xl font-bold text-center mb-8 text-slate-100">
              {currentQuestion.question}
            </h3>
            
            {!showAnswer ? (
              <div className="text-center">
                <button
                  onClick={finishAnswering}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300"
                >
                  انتهيت من الإجابة
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-emerald-500/20 border border-emerald-400/50 rounded-xl p-6 mb-8 backdrop-blur-sm">
                  <h4 className="text-lg font-bold text-emerald-400 mb-3">الإجابة الصحيحة:</h4>
                  <p className="text-xl md:text-2xl text-white font-semibold">{currentQuestion.answer}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={correctAnswer}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300"
                  >
                    ✅ إجابة صحيحة - تقدم للدور التالي
                  </button>
                  
                  <button
                    onClick={withdrawPlayer}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300"
                  >
                    🏃 انسحاب (+{roundConfig[currentRound].points} نقطة)
                  </button>
                  
                  <button
                    onClick={wrongAnswer}
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300"
                  >
                    ❌ إجابة خاطئة - خروج من البطولة
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}