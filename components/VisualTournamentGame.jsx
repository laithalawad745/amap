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
  const [currentRound, setCurrentRound] = useState(1); // 1=دور8, 2=دور4, 3=نصف, 4=نهائي
  
  // شجرة البطولة - 8 لاعبين في البداية
  const [bracket, setBracket] = useState({
    // دور الـ8 - 8 مواضع
    round8: [
      { id: 'r8_1', player: 'red', status: 'active', name: 'أحمر 1' },
      { id: 'r8_2', player: null, status: 'empty', name: 'فارغ' },
      { id: 'r8_3', player: null, status: 'empty', name: 'فارغ' },
      { id: 'r8_4', player: null, status: 'empty', name: 'فارغ' },
      { id: 'r8_5', player: null, status: 'empty', name: 'فارغ' },
      { id: 'r8_6', player: null, status: 'empty', name: 'فارغ' },
      { id: 'r8_7', player: null, status: 'empty', name: 'فارغ' },
      { id: 'r8_8', player: 'blue', status: 'waiting', name: 'أزرق 1' }
    ],
    // دور الـ4 - 4 مواضع
    round4: [
      { id: 'r4_1', player: null, status: 'empty', name: '' },
      { id: 'r4_2', player: null, status: 'empty', name: '' },
      { id: 'r4_3', player: null, status: 'empty', name: '' },
      { id: 'r4_4', player: null, status: 'empty', name: '' }
    ],
    // نصف النهائي - 2 مواضع
    semi: [
      { id: 'semi_1', player: null, status: 'empty', name: '' },
      { id: 'semi_2', player: null, status: 'empty', name: '' }
    ],
    // النهائي - 1 موضع
    final: [
      { id: 'final_1', player: null, status: 'empty', name: '' }
    ]
  });

  const [currentMatch, setCurrentMatch] = useState({ round: 1, position: 0 }); // الماتش الحالي
  const [scores, setScores] = useState({ red: 0, blue: 0 });
  const [winner, setWinner] = useState(null);

  // إعدادات الأدوار
  const roundConfig = {
    1: { name: 'دور الـ8', points: 20, positions: 8 },
    2: { name: 'دور الـ4', points: 40, positions: 4 },
    3: { name: 'نصف النهائي', points: 80, positions: 2 },
    4: { name: 'النهائي', points: 160, positions: 1 }
  };

  // الحصول على اللاعب النشط حالياً
  const getCurrentPlayer = () => {
    const currentRoundKey = `round${currentRound === 1 ? '8' : currentRound === 2 ? '4' : currentRound === 3 ? 'semi' : 'final'}`;
    const currentPosition = bracket[currentRoundKey][currentMatch.position];
    return currentPosition?.player;
  };

  // مكون دائرة اللاعب
  const PlayerCircle = ({ position, size = 'normal', isActive = false }) => {
    const sizeClasses = {
      small: 'w-12 h-12',
      normal: 'w-16 h-16',
      large: 'w-20 h-20'
    };

    const getCircleStyle = () => {
      if (!position.player) {
        return 'bg-gray-600 border-gray-500 text-gray-400';
      }
      
      const colors = {
        red: 'bg-gradient-to-br from-red-500 to-red-700 border-red-400 text-white',
        blue: 'bg-gradient-to-br from-blue-500 to-blue-700 border-blue-400 text-white'
      };
      
      const baseStyle = colors[position.player] || 'bg-gray-600 border-gray-500 text-gray-400';
      
      if (isActive) {
        return `${baseStyle} ring-4 ring-yellow-400 animate-pulse shadow-2xl`;
      }
      
      return baseStyle;
    };

    return (
      <div className="flex flex-col items-center space-y-1">
        <div className={`${sizeClasses[size]} rounded-full border-4 flex items-center justify-center ${getCircleStyle()} transition-all duration-300 font-bold`}>
          {position.player && (
            <span className={size === 'small' ? 'text-sm' : size === 'large' ? 'text-xl' : 'text-lg'}>
              {position.player === 'red' ? 'ر' : 'ز'}
            </span>
          )}
        </div>
        {position.name && (
          <div className="text-xs text-gray-300 text-center max-w-16 truncate">
            {position.name}
          </div>
        )}
      </div>
    );
  };

  // مكون خط الربط
  const ConnectingLine = ({ direction = 'horizontal', length = 'normal' }) => {
    const lengthClasses = {
      short: direction === 'horizontal' ? 'w-8' : 'h-8',
      normal: direction === 'horizontal' ? 'w-16' : 'h-16',
      long: direction === 'horizontal' ? 'w-24' : 'h-24'
    };

    const lineClass = direction === 'horizontal' 
      ? `${lengthClasses[length]} h-px` 
      : `w-px ${lengthClasses[length]}`;

    return (
      <div className={`${lineClass} bg-gradient-to-r from-gray-400 to-gray-600`}></div>
    );
  };

  // مكون الشجرة الكاملة
  const TournamentBracket = () => {
    const isCurrentRound = (round) => currentRound === round;
    const isCurrentPosition = (round, pos) => 
      isCurrentRound(round) && currentMatch.position === pos;

    return (
      <div className="w-full overflow-x-auto">
        <div className="min-w-[800px] p-8">
          <div className="flex items-center justify-center space-x-8">
            
            {/* دور الـ8 - العمود الأيسر */}
            <div className="flex flex-col space-y-6">
              <h4 className="text-center text-blue-400 font-bold mb-4">دور الـ8</h4>
              {bracket.round8.map((position, index) => (
                <div key={position.id} className="flex items-center space-x-4">
                  <PlayerCircle 
                    position={position} 
                    isActive={isCurrentPosition(1, index)}
                  />
                  <ConnectingLine direction="horizontal" length="short" />
                </div>
              ))}
            </div>

            {/* دور الـ4 */}
            <div className="flex flex-col space-y-12">
              <h4 className="text-center text-purple-400 font-bold mb-4">دور الـ4</h4>
              {bracket.round4.map((position, index) => (
                <div key={position.id} className="flex items-center space-x-4">
                  <PlayerCircle 
                    position={position} 
                    isActive={isCurrentPosition(2, index)}
                  />
                  <ConnectingLine direction="horizontal" length="short" />
                </div>
              ))}
            </div>

            {/* نصف النهائي */}
            <div className="flex flex-col space-y-24">
              <h4 className="text-center text-orange-400 font-bold mb-4">نصف النهائي</h4>
              {bracket.semi.map((position, index) => (
                <div key={position.id} className="flex items-center space-x-4">
                  <PlayerCircle 
                    position={position} 
                    isActive={isCurrentPosition(3, index)}
                  />
                  <ConnectingLine direction="horizontal" length="short" />
                </div>
              ))}
            </div>

            {/* النهائي */}
            <div className="flex flex-col">
              <h4 className="text-center text-yellow-400 font-bold mb-8">🏆 النهائي</h4>
              <PlayerCircle 
                position={bracket.final[0]} 
                size="large"
                isActive={isCurrentPosition(4, 0)}
              />
            </div>
          </div>

          {/* خطوط الربط بين الأدوار */}
          <div className="mt-8 flex justify-center">
            <div className="flex items-center space-x-8 text-sm text-gray-400">
              <span>8 لاعبين</span>
              <span>→</span>
              <span>4 لاعبين</span>
              <span>→</span>
              <span>2 لاعبين</span>
              <span>→</span>
              <span>1 فائز</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // بدء اللعبة
  const startGame = () => {
    setGamePhase('playing');
    startNewQuestion();
  };

  // بدء سؤال جديد
  const startNewQuestion = () => {
    const availableQuestions = tournamentQuestions.filter(q => 
      q.round === currentRound && !q.used
    );
    
    if (availableQuestions.length === 0) {
      console.error('No questions available for round', currentRound);
      setGamePhase('finished');
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
    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer) return;

    // إضافة النقاط
    const newScores = { ...scores };
    newScores[currentPlayer] += roundConfig[currentRound].points;
    setScores(newScores);

    // نقل اللاعب للدور التالي
    movePlayerToNextRound(currentPlayer);
  };

  // إجابة خاطئة - إقصاء اللاعب
  const wrongAnswer = () => {
    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer) return;

    // تحديد الفائز بالبطولة
    const otherPlayer = currentPlayer === 'red' ? 'blue' : 'red';
    setWinner(otherPlayer);
    setGamePhase('finished');
  };

  // نقل اللاعب للدور التالي
  const movePlayerToNextRound = (player) => {
    const newBracket = { ...bracket };
    
    if (currentRound < 4) {
      // نقل اللاعب للدور التالي
      const nextRound = currentRound + 1;
      const nextRoundKey = nextRound === 2 ? 'round4' : nextRound === 3 ? 'semi' : 'final';
      const nextPosition = Math.floor(currentMatch.position / 2);
      
      newBracket[nextRoundKey][nextPosition] = {
        ...newBracket[nextRoundKey][nextPosition],
        player: player,
        status: 'active',
        name: player === 'red' ? 'أحمر' : 'أزرق'
      };
      
      setBracket(newBracket);
      
      // الانتقال للماتش التالي
      moveToNextMatch();
    } else {
      // انتهت البطولة
      setWinner(player);
      setGamePhase('finished');
    }
  };

  // الانتقال للماتش التالي
  const moveToNextMatch = () => {
    const currentRoundPositions = roundConfig[currentRound].positions;
    
    if (currentMatch.position < currentRoundPositions - 1) {
      // الانتقال للموضع التالي في نفس الدور
      setCurrentMatch(prev => ({ ...prev, position: prev.position + 1 }));
    } else {
      // الانتقال للدور التالي
      setCurrentRound(prev => prev + 1);
      setCurrentMatch({ round: currentRound + 1, position: 0 });
    }
    
    startNewQuestion();
  };

  // إعادة تشغيل اللعبة
  const resetGame = () => {
    setGamePhase('setup');
    setCurrentQuestion(null);
    setShowAnswer(false);
    setCurrentRound(1);
    setCurrentMatch({ round: 1, position: 0 });
    setWinner(null);
    setScores({ red: 0, blue: 0 });
    
    // إعادة تعيين الشجرة
    setBracket({
      round8: [
        { id: 'r8_1', player: 'red', status: 'active', name: 'أحمر 1' },
        { id: 'r8_2', player: null, status: 'empty', name: 'فارغ' },
        { id: 'r8_3', player: null, status: 'empty', name: 'فارغ' },
        { id: 'r8_4', player: null, status: 'empty', name: 'فارغ' },
        { id: 'r8_5', player: null, status: 'empty', name: 'فارغ' },
        { id: 'r8_6', player: null, status: 'empty', name: 'فارغ' },
        { id: 'r8_7', player: null, status: 'empty', name: 'فارغ' },
        { id: 'r8_8', player: 'blue', status: 'waiting', name: 'أزرق 1' }
      ],
      round4: [
        { id: 'r4_1', player: null, status: 'empty', name: '' },
        { id: 'r4_2', player: null, status: 'empty', name: '' },
        { id: 'r4_3', player: null, status: 'empty', name: '' },
        { id: 'r4_4', player: null, status: 'empty', name: '' }
      ],
      semi: [
        { id: 'semi_1', player: null, status: 'empty', name: '' },
        { id: 'semi_2', player: null, status: 'empty', name: '' }
      ],
      final: [
        { id: 'final_1', player: null, status: 'empty', name: '' }
      ]
    });

    // إعادة تعيين الأسئلة
    tournamentQuestions.forEach(q => q.used = false);
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
              🏆 بطولة المعرفة المتقدمة
            </h1>
            
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-slate-700">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-6">قواعد البطولة</h2>
              <div className="text-gray-300 space-y-4 text-lg">
                <p>• نظام بطولة حقيقي: 8 → 4 → 2 → 1</p>
                <p>• الإجابة الصحيحة = التقدم للدور التالي</p>
                <p>• الإجابة الخاطئة = الخروج من البطولة</p>
                <p>• النقاط: دور الـ8 (20) - دور الـ4 (40) - نصف النهائي (80) - النهائي (160)</p>
              </div>
              
              <button
                onClick={startGame}
                className="mt-8 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-bold text-xl shadow-lg transition-all duration-300 hover:scale-105"
              >
                🏁 بدء البطولة
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // صفحة النتائج
  if (gamePhase === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-yellow-900 to-slate-900 select-none flex flex-col items-center justify-center p-4">
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 max-w-2xl w-full text-center shadow-2xl border border-slate-700">
          <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
            🏆 انتهت البطولة!
          </h1>
          
          <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
            winner === 'red' ? 'bg-red-500' : 'bg-blue-500'
          } shadow-2xl`}>
            <span className="text-4xl text-white font-bold">
              {winner === 'red' ? 'ر' : 'ز'}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-6">
            🎉 بطل البطولة: {winner === 'red' ? 'الفريق الأحمر' : 'الفريق الأزرق'}!
          </h2>

          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-red-400 font-bold text-lg">الفريق الأحمر</div>
              <div className="text-3xl font-bold text-white">{scores.red}</div>
            </div>
            <div className="text-center">
              <div className="text-blue-400 font-bold text-lg">الفريق الأزرق</div>
              <div className="text-3xl font-bold text-white">{scores.blue}</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300"
            >
              🔄 بطولة جديدة
            </button>
            <Link 
              href="/"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 text-center"
            >
              ← العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // صفحة اللعب
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 select-none">
      {/* الهيدر */}
      <div className="flex justify-between items-center p-4 md:p-6 border-b border-slate-700">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
            🏆 بطولة المعرفة
          </h1>
          <div className="flex space-x-4 text-sm">
            <div className="bg-red-500/20 px-3 py-1 rounded-lg border border-red-400/30">
              <span className="text-red-400 font-bold">أحمر: {scores.red}</span>
            </div>
            <div className="bg-blue-500/20 px-3 py-1 rounded-lg border border-blue-400/30">
              <span className="text-blue-400 font-bold">أزرق: {scores.blue}</span>
            </div>
          </div>
        </div>
        
        <Link 
          href="/"
          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg transition-all duration-300"
        >
          ← الرئيسية
        </Link>
      </div>

      {/* منطقة السؤال - في الأعلى */}
      {currentQuestion && (
        <div className="p-4 md:p-6">
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-700">
            <div className="text-center mb-6">
              <div className={`inline-block px-6 py-3 rounded-full text-white font-bold text-lg ${
                getCurrentPlayer() === 'red' 
                  ? 'bg-gradient-to-r from-red-500 to-pink-500'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500'
              }`}>
                {getCurrentPlayer() === 'red' ? 'الفريق الأحمر' : 'الفريق الأزرق'} • {roundConfig[currentRound].name} • {roundConfig[currentRound].points} نقطة
              </div>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-8 text-slate-100">
              {currentQuestion.question}
            </h3>
            
            {!showAnswer ? (
              <div className="text-center">
                <button
                  onClick={finishAnswering}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-xl shadow-lg transition-all duration-300 hover:scale-105"
                >
                  ⏱️ انتهيت من الإجابة
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-slate-700/50 backdrop-blur-lg rounded-xl p-6 border border-slate-600">
                  <h4 className="text-green-400 font-bold text-lg mb-3">الإجابة الصحيحة:</h4>
                  <p className="text-white text-xl">{currentQuestion.answer}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={correctAnswer}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300"
                  >
                    ✅ إجابة صحيحة
                  </button>
                  <button
                    onClick={wrongAnswer}
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300"
                  >
                    ❌ إجابة خاطئة
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* شجرة البطولة - تحت السؤال */}
      <div className="flex-1 p-4 md:p-6">
        <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-6 border border-slate-700">
          <h3 className="text-center text-2xl font-bold text-yellow-400 mb-6">شجرة البطولة</h3>
          <TournamentBracket />
        </div>
      </div>
    </div>
  );
}