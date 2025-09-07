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
  const [currentTeam, setCurrentTeam] = useState('red'); // الفريق الذي يلعب حالياً
  
  // شجرتان منفصلتان - واحدة لكل فريق
  const [teamBrackets, setTeamBrackets] = useState({
    red: {
      currentRound: 1, // الدور الحالي للفريق الأحمر
      positions: {
        round8: [
          { id: 'red_r8_1', status: 'active', name: 'ر1', reached: true },
          { id: 'red_r8_2', status: 'empty', name: '', reached: false },
          { id: 'red_r8_3', status: 'empty', name: '', reached: false },
          { id: 'red_r8_4', status: 'empty', name: '', reached: false },
          { id: 'red_r8_5', status: 'empty', name: '', reached: false },
          { id: 'red_r8_6', status: 'empty', name: '', reached: false },
          { id: 'red_r8_7', status: 'empty', name: '', reached: false },
          { id: 'red_r8_8', status: 'empty', name: '', reached: false }
        ],
        round4: [
          { id: 'red_r4_1', status: 'empty', name: '', reached: false },
          { id: 'red_r4_2', status: 'empty', name: '', reached: false },
          { id: 'red_r4_3', status: 'empty', name: '', reached: false },
          { id: 'red_r4_4', status: 'empty', name: '', reached: false }
        ],
        semi: [
          { id: 'red_semi_1', status: 'empty', name: '', reached: false },
          { id: 'red_semi_2', status: 'empty', name: '', reached: false }
        ],
        final: [
          { id: 'red_final', status: 'empty', name: '', reached: false }
        ]
      }
    },
    blue: {
      currentRound: 1, // الدور الحالي للفريق الأزرق
      positions: {
        round8: [
          { id: 'blue_r8_1', status: 'active', name: 'ز1', reached: true },
          { id: 'blue_r8_2', status: 'empty', name: '', reached: false },
          { id: 'blue_r8_3', status: 'empty', name: '', reached: false },
          { id: 'blue_r8_4', status: 'empty', name: '', reached: false },
          { id: 'blue_r8_5', status: 'empty', name: '', reached: false },
          { id: 'blue_r8_6', status: 'empty', name: '', reached: false },
          { id: 'blue_r8_7', status: 'empty', name: '', reached: false },
          { id: 'blue_r8_8', status: 'empty', name: '', reached: false }
        ],
        round4: [
          { id: 'blue_r4_1', status: 'empty', name: '', reached: false },
          { id: 'blue_r4_2', status: 'empty', name: '', reached: false },
          { id: 'blue_r4_3', status: 'empty', name: '', reached: false },
          { id: 'blue_r4_4', status: 'empty', name: '', reached: false }
        ],
        semi: [
          { id: 'blue_semi_1', status: 'empty', name: '', reached: false },
          { id: 'blue_semi_2', status: 'empty', name: '', reached: false }
        ],
        final: [
          { id: 'blue_final', status: 'empty', name: '', reached: false }
        ]
      }
    }
  });

  const [scores, setScores] = useState({ red: 0, blue: 0 });
  const [winner, setWinner] = useState(null);

  // إعدادات الأدوار
  const roundConfig = {
    1: { name: 'دور الـ8', points: 20, positions: 8 },
    2: { name: 'دور الـ4', points: 40, positions: 4 },
    3: { name: 'نصف النهائي', points: 80, positions: 2 },
    4: { name: 'النهائي', points: 160, positions: 1 }
  };

  // مكون دائرة اللاعب
  const PlayerCircle = ({ position, team, size = 'normal', isActive = false }) => {
    const sizeClasses = {
      small: 'w-10 h-10',
      normal: 'w-14 h-14',
      large: 'w-18 h-18'
    };

    const getCircleStyle = () => {
      if (!position.reached) {
        return 'bg-gray-600 border-gray-500 text-gray-400';
      }
      
      const colors = {
        red: 'bg-gradient-to-br from-red-500 to-red-700 border-red-400 text-white',
        blue: 'bg-gradient-to-br from-blue-500 to-blue-700 border-blue-400 text-white'
      };
      
      const baseStyle = colors[team] || 'bg-gray-600 border-gray-500 text-gray-400';
      
      if (isActive) {
        return `${baseStyle} ring-4 ring-yellow-400 animate-pulse shadow-2xl`;
      }
      
      return baseStyle;
    };

    return (
      <div className="flex flex-col items-center space-y-1">
        <div className={`${sizeClasses[size]} rounded-full border-4 flex items-center justify-center ${getCircleStyle()} transition-all duration-300 font-bold`}>
          {position.reached && (
            <span className={size === 'small' ? 'text-xs' : size === 'large' ? 'text-lg' : 'text-sm'}>
              {team === 'red' ? 'ر' : 'ز'}
            </span>
          )}
        </div>
        {position.name && (
          <div className="text-xs text-gray-300 text-center max-w-14 truncate">
            {position.name}
          </div>
        )}
      </div>
    );
  };

  // مكون خط الربط
  const ConnectingLine = ({ direction = 'horizontal', length = 'normal' }) => {
    const lengthClasses = {
      short: direction === 'horizontal' ? 'w-6' : 'h-6',
      normal: direction === 'horizontal' ? 'w-12' : 'h-12',
      long: direction === 'horizontal' ? 'w-16' : 'h-16'
    };

    const lineClass = direction === 'horizontal' 
      ? `${lengthClasses[length]} h-px` 
      : `w-px ${lengthClasses[length]}`;

    return (
      <div className={`${lineClass} bg-gradient-to-r from-gray-400 to-gray-600`}></div>
    );
  };

  // مكون الشجرة لفريق واحد
  const TeamBracket = ({ team, bracket, isCurrentTeam }) => {
    const teamColors = {
      red: 'border-red-500/50 bg-red-500/10',
      blue: 'border-blue-500/50 bg-blue-500/10'
    };

    const isCurrentPosition = (round) => {
      return isCurrentTeam && bracket.currentRound === round;
    };

    return (
      <div className={`border-2 rounded-2xl p-6 ${teamColors[team]} ${isCurrentTeam ? 'ring-2 ring-yellow-400 shadow-2xl' : ''}`}>
        <h2 className={`text-center text-2xl font-bold mb-6 ${team === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
          شجرة الفريق {team === 'red' ? 'الأحمر' : 'الأزرق'}
        </h2>
        
        <div className="overflow-x-auto">
          <div className="min-w-[600px] p-4">
            <div className="flex items-center justify-center space-x-6">
              
              {/* دور الـ8 */}
              <div className="flex flex-col space-y-4">
                <h4 className="text-center text-blue-400 font-bold mb-2 text-sm">دور الـ8</h4>
                {bracket.positions.round8.map((position, index) => (
                  <div key={position.id} className="flex items-center space-x-2">
                    <PlayerCircle 
                      position={position} 
                      team={team}
                      isActive={isCurrentPosition(1)}
                      size="small"
                    />
                    <ConnectingLine direction="horizontal" length="short" />
                  </div>
                ))}
              </div>

              {/* دور الـ4 */}
              <div className="flex flex-col space-y-8">
                <h4 className="text-center text-purple-400 font-bold mb-2 text-sm">دور الـ4</h4>
                {bracket.positions.round4.map((position, index) => (
                  <div key={position.id} className="flex items-center space-x-2">
                    <PlayerCircle 
                      position={position} 
                      team={team}
                      isActive={isCurrentPosition(2)}
                      size="small"
                    />
                    <ConnectingLine direction="horizontal" length="short" />
                  </div>
                ))}
              </div>

              {/* نصف النهائي */}
              <div className="flex flex-col space-y-16">
                <h4 className="text-center text-orange-400 font-bold mb-2 text-sm">نصف النهائي</h4>
                {bracket.positions.semi.map((position, index) => (
                  <div key={position.id} className="flex items-center space-x-2">
                    <PlayerCircle 
                      position={position} 
                      team={team}
                      isActive={isCurrentPosition(3)}
                    />
                    <ConnectingLine direction="horizontal" length="short" />
                  </div>
                ))}
              </div>

              {/* النهائي */}
              <div className="flex flex-col">
                <h4 className="text-center text-yellow-400 font-bold mb-6 text-sm">🏆 النهائي</h4>
                <PlayerCircle 
                  position={bracket.positions.final[0]} 
                  team={team}
                  size="large"
                  isActive={isCurrentPosition(4)}
                />
              </div>
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
    const currentRound = teamBrackets[currentTeam].currentRound;
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
    const team = currentTeam;
    const currentRound = teamBrackets[team].currentRound;
    
    // إضافة النقاط
    const newScores = { ...scores };
    newScores[team] += roundConfig[currentRound].points;
    setScores(newScores);

    // نقل الفريق للدور التالي
    moveTeamToNextRound(team);
  };

  // إجابة خاطئة - انتهاء دور الفريق
  const wrongAnswer = () => {
    // تبديل الدور للفريق الآخر
    switchTurn();
  };

  // نقل الفريق للدور التالي
  const moveTeamToNextRound = (team) => {
    const newBrackets = { ...teamBrackets };
    const currentRound = newBrackets[team].currentRound;
    
    if (currentRound < 4) {
      // نقل الفريق للدور التالي
      newBrackets[team].currentRound = currentRound + 1;
      
      // تحديث الموضع في الدور التالي
      const nextRoundKey = currentRound === 1 ? 'round4' : 
                           currentRound === 2 ? 'semi' : 'final';
      
      const nextPosition = Math.floor(Math.random() * newBrackets[team].positions[nextRoundKey].length);
      newBrackets[team].positions[nextRoundKey][nextPosition] = {
        ...newBrackets[team].positions[nextRoundKey][nextPosition],
        reached: true,
        name: `${team === 'red' ? 'ر' : 'ز'}${currentRound + 1}`
      };
      
      setTeamBrackets(newBrackets);
      
      // فحص الفوز
      if (currentRound === 3) { // وصل للنهائي
        setWinner(team);
        setGamePhase('finished');
        return;
      }
    }
    
    // تبديل الدور
    switchTurn();
  };

  // تبديل الدور بين الفريقين
  const switchTurn = () => {
    setCurrentTeam(currentTeam === 'red' ? 'blue' : 'red');
    setCurrentQuestion(null);
    setShowAnswer(false);
    
    // بدء سؤال جديد للفريق التالي
    setTimeout(() => {
      startNewQuestion();
    }, 1000);
  };

  // إعادة تعيين اللعبة
  const resetGame = () => {
    setGamePhase('setup');
    setCurrentQuestion(null);
    setShowAnswer(false);
    setCurrentTeam('red');
    setScores({ red: 0, blue: 0 });
    setWinner(null);
    
    // إعادة تعيين الشجرتين
    setTeamBrackets({
      red: {
        currentRound: 1,
        positions: {
          round8: Array(8).fill(null).map((_, i) => ({
            id: `red_r8_${i + 1}`,
            status: i === 0 ? 'active' : 'empty',
            name: i === 0 ? 'ر1' : '',
            reached: i === 0
          })),
          round4: Array(4).fill(null).map((_, i) => ({
            id: `red_r4_${i + 1}`,
            status: 'empty',
            name: '',
            reached: false
          })),
          semi: Array(2).fill(null).map((_, i) => ({
            id: `red_semi_${i + 1}`,
            status: 'empty',
            name: '',
            reached: false
          })),
          final: [{
            id: 'red_final',
            status: 'empty',
            name: '',
            reached: false
          }]
        }
      },
      blue: {
        currentRound: 1,
        positions: {
          round8: Array(8).fill(null).map((_, i) => ({
            id: `blue_r8_${i + 1}`,
            status: i === 0 ? 'active' : 'empty',
            name: i === 0 ? 'ز1' : '',
            reached: i === 0
          })),
          round4: Array(4).fill(null).map((_, i) => ({
            id: `blue_r4_${i + 1}`,
            status: 'empty',
            name: '',
            reached: false
          })),
          semi: Array(2).fill(null).map((_, i) => ({
            id: `blue_semi_${i + 1}`,
            status: 'empty',
            name: '',
            reached: false
          })),
          final: [{
            id: 'blue_final',
            status: 'empty',
            name: '',
            reached: false
          }]
        }
      }
    });
    
    // إعادة تعيين استخدام الأسئلة
    tournamentQuestions.forEach(q => q.used = false);
  };

  // مكون الإعدادات
  if (gamePhase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
              🏆 بطولة المعرفة
            </h1>
            <Link 
              href="/"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold text-sm md:text-base shadow-lg transition-all duration-300"
            >
              ← العودة للرئيسية
            </Link>
          </div>

          {/* معلومات اللعبة */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 mb-8 shadow-2xl border border-slate-700 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-6">
              بطولة المعرفة - شجرتان منفصلتان
            </h2>
            <p className="text-lg text-slate-300 mb-8">
              كل فريق له شجرة بطولة منفصلة! الهدف هو الوصول للنهائي في شجرتك قبل الفريق المنافس
            </p>
            
            {/* النقاط حسب الدور */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {Object.entries(roundConfig).map(([round, config]) => (
                <div key={round} className="bg-slate-700/50 rounded-xl p-4">
                  <h3 className="font-bold text-yellow-400 mb-2">{config.name}</h3>
                  <p className="text-2xl font-bold text-white">{config.points} نقطة</p>
                </div>
              ))}
            </div>

            <button
              onClick={startGame}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 md:px-12 py-4 md:py-6 rounded-2xl font-bold text-xl md:text-2xl shadow-2xl transition-all duration-300 hover:scale-105"
            >
              🏆 ابدأ البطولة!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // مكون اللعبة
  if (gamePhase === 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
        <div className="max-w-full mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
              🏆 بطولة المعرفة
            </h1>
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg transition-all duration-300"
            >
              إعادة تعيين
            </button>
          </div>

          {/* النتائج والدور الحالي */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-red-500/20 rounded-xl p-4 text-center border border-red-500/30">
              <h3 className="text-red-400 font-bold mb-2">الفريق الأحمر</h3>
              <p className="text-2xl font-bold text-white">{scores.red} نقطة</p>
              <p className="text-sm text-red-300">دور {roundConfig[teamBrackets.red.currentRound]?.name}</p>
            </div>
            
            <div className={`rounded-xl p-4 text-center border-2 ${
              currentTeam === 'red' 
                ? 'bg-red-500/30 border-red-400 ring-2 ring-red-400' 
                : 'bg-blue-500/30 border-blue-400 ring-2 ring-blue-400'
            }`}>
              <h3 className="text-yellow-400 font-bold mb-2">الدور الحالي</h3>
              <p className="text-lg font-bold text-white">
                الفريق {currentTeam === 'red' ? 'الأحمر' : 'الأزرق'}
              </p>
              <p className="text-sm text-gray-300">
                {roundConfig[teamBrackets[currentTeam].currentRound]?.name}
              </p>
            </div>
            
            <div className="bg-blue-500/20 rounded-xl p-4 text-center border border-blue-500/30">
              <h3 className="text-blue-400 font-bold mb-2">الفريق الأزرق</h3>
              <p className="text-2xl font-bold text-white">{scores.blue} نقطة</p>
              <p className="text-sm text-blue-300">دور {roundConfig[teamBrackets.blue.currentRound]?.name}</p>
            </div>
          </div>

          {/* الشجرتان */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <TeamBracket 
              team="red" 
              bracket={teamBrackets.red} 
              isCurrentTeam={currentTeam === 'red'}
            />
            <TeamBracket 
              team="blue" 
              bracket={teamBrackets.blue} 
              isCurrentTeam={currentTeam === 'blue'}
            />
          </div>

          {/* منطقة السؤال */}
          {currentQuestion && (
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-700">
              <div className="text-center mb-6">
                <div className={`inline-block px-6 py-3 rounded-full text-white font-bold text-lg ${
                  currentTeam === 'red' 
                    ? 'bg-gradient-to-r from-red-500 to-pink-500'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                }`}>
                  {roundConfig[teamBrackets[currentTeam].currentRound]?.name} - {roundConfig[teamBrackets[currentTeam].currentRound]?.points} نقطة
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
                    انتهينا من الإجابة
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
                      className={`px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 text-white ${
                        currentTeam === 'red'
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600'
                          : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600'
                      }`}
                    >
                      ✓ الفريق {currentTeam === 'red' ? 'الأحمر' : 'الأزرق'} أجاب صح
                    </button>
                    <button
                      onClick={wrongAnswer}
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300"
                    >
                      ✗ إجابة خاطئة
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

  // مكون النهاية
  if (gamePhase === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8 flex items-center justify-center">
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 md:p-12 shadow-2xl border border-slate-700 text-center max-w-2xl w-full">
          <div className="text-6xl md:text-8xl mb-6">🏆</div>
          <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-4">
            انتهت البطولة!
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">
            {winner ? `الفريق ${winner === 'red' ? 'الأحمر' : 'الأزرق'} هو البطل!` : 'تعادل!'}
          </h2>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-red-500/20 rounded-xl p-6 border border-red-500/30">
              <h3 className="text-red-400 font-bold mb-2">الفريق الأحمر</h3>
              <p className="text-3xl font-bold text-white">{scores.red}</p>
              <p className="text-sm text-red-300">نقطة</p>
            </div>
            <div className="bg-blue-500/20 rounded-xl p-6 border border-blue-500/30">
              <h3 className="text-blue-400 font-bold mb-2">الفريق الأزرق</h3>
              <p className="text-3xl font-bold text-white">{scores.blue}</p>
              <p className="text-sm text-blue-300">نقطة</p>
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300"
            >
              🏆 بطولة جديدة
            </button>
            <Link
              href="/"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300"
            >
              ← العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}