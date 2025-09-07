'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// بيانات الأسئلة التجريبية
const tournamentQuestions = [
  // دور الـ8 - 8 أسئلة لكل فريق
  ...Array(16).fill(null).map((_, i) => ({
    id: `r8_${i + 1}`,
    round: 1,
    question: `سؤال دور الـ8 رقم ${i + 1}`,
    answer: `إجابة السؤال ${i + 1}`,
    used: false
  })),
  // دور الـ4 - 4 أسئلة لكل فريق  
  ...Array(8).fill(null).map((_, i) => ({
    id: `r4_${i + 1}`,
    round: 2,
    question: `سؤال دور الـ4 رقم ${i + 1}`,
    answer: `إجابة السؤال ${i + 1}`,
    used: false
  })),
  // نصف النهائي - 2 أسئلة لكل فريق
  ...Array(4).fill(null).map((_, i) => ({
    id: `semi_${i + 1}`,
    round: 3,
    question: `سؤال نصف النهائي رقم ${i + 1}`,
    answer: `إجابة السؤال ${i + 1}`,
    used: false
  })),
  // النهائي - سؤال واحد لكل فريق
  ...Array(2).fill(null).map((_, i) => ({
    id: `final_${i + 1}`,
    round: 4,
    question: `سؤال النهائي رقم ${i + 1}`,
    answer: `إجابة السؤال ${i + 1}`,
    used: false
  }))
];

export default function VisualTournamentGame() {
  // حالة اللعبة
  const [gamePhase, setGamePhase] = useState('setup');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentTeam, setCurrentTeam] = useState('red');
  const [winner, setWinner] = useState(null);
  
  // حالة الأسئلة والنقاط
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [teamStatus, setTeamStatus] = useState({
    red: { active: true, withdrawn: false },
    blue: { active: true, withdrawn: false }
  });
  
  // عدد الأسئلة لكل دور
  const questionsPerRound = {
    1: 8, // دور الـ8
    2: 4, // دور الـ4  
    3: 2, // نصف النهائي
    4: 1  // النهائي
  };
  
  // شجرتان منفصلتان
  const [teamBrackets, setTeamBrackets] = useState({
    red: {
      currentRound: 1,
      questionsAnswered: 0,
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
      questionsAnswered: 0,
      positions: {
        round8: Array(8).fill(null).map((_, i) => ({
          id: `blue_r8_${i + 1}`,
          status: i === 7 ? 'active' : 'empty', // ✅ الأزرق يبدأ من اليمين (الموضع 7)
          name: i === 7 ? 'ز1' : '',
          reached: i === 7
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

  const [scores, setScores] = useState({ red: 0, blue: 0 });

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

  // مكون الشجرة لفريق واحد - محسّن مع التناظر
  const TeamBracket = ({ team, bracket, isCurrentTeam }) => {
    const teamColors = {
      red: 'border-red-500/50 bg-red-500/10',
      blue: 'border-blue-500/50 bg-blue-500/10'
    };

    const isCurrentPosition = (round) => {
      return isCurrentTeam && bracket.currentRound === round && !teamStatus[team].withdrawn;
    };

    // ✅ ترتيب مختلف للفريق الأزرق (معكوس)
    const getPositions = (positions) => {
      if (team === 'blue') {
        return [...positions].reverse();
      }
      return positions;
    };

    return (
      <div className={`border-2 rounded-2xl p-6 ${teamColors[team]} ${isCurrentTeam && teamStatus[team].active ? 'ring-2 ring-yellow-400 shadow-2xl' : ''} ${teamStatus[team].withdrawn ? 'opacity-50' : ''}`}>
        <h2 className={`text-center text-2xl font-bold mb-6 ${team === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
          شجرة الفريق {team === 'red' ? 'الأحمر' : 'الأزرق'}
          {teamStatus[team].withdrawn && <span className="text-yellow-400 text-sm mr-2">(منسحب)</span>}
        </h2>
        
        <div className="overflow-x-auto">
          <div className="min-w-[600px] p-4">
            <div className={`flex items-center justify-center space-x-6 ${team === 'blue' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              
              {/* دور الـ8 */}
              <div className="flex flex-col space-y-4">
                <h4 className="text-center text-blue-400 font-bold mb-2 text-sm">دور الـ8</h4>
                {getPositions(bracket.positions.round8).map((position, index) => (
                  <div key={position.id} className={`flex items-center space-x-2 ${team === 'blue' ? 'flex-row-reverse space-x-reverse' : ''}`}>
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
                {getPositions(bracket.positions.round4).map((position, index) => (
                  <div key={position.id} className={`flex items-center space-x-2 ${team === 'blue' ? 'flex-row-reverse space-x-reverse' : ''}`}>
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
                {getPositions(bracket.positions.semi).map((position, index) => (
                  <div key={position.id} className={`flex items-center space-x-2 ${team === 'blue' ? 'flex-row-reverse space-x-reverse' : ''}`}>
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
    const activeTeam = teamStatus.red.active && !teamStatus.red.withdrawn ? 'red' : 
                      teamStatus.blue.active && !teamStatus.blue.withdrawn ? 'blue' : null;
    
    if (!activeTeam) {
      setGamePhase('finished');
      return;
    }
    
    setCurrentTeam(activeTeam);
    const currentRound = teamBrackets[activeTeam].currentRound;
    
    const availableQuestions = tournamentQuestions.filter(q => 
      q.round === currentRound && !q.used
    );
    
    if (availableQuestions.length === 0) {
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

  // إجابة صحيحة
  const correctAnswer = () => {
    const team = currentTeam;
    const currentRound = teamBrackets[team].currentRound;
    
    // إضافة النقاط
    const newScores = { ...scores };
    newScores[team] += roundConfig[currentRound].points;
    setScores(newScores);
    
    // زيادة عدد الأسئلة المجاب عليها
    const newBrackets = { ...teamBrackets };
    newBrackets[team].questionsAnswered += 1;
    
    // التحقق من إكمال الدور
    const requiredQuestions = questionsPerRound[currentRound];
    if (newBrackets[team].questionsAnswered >= requiredQuestions) {
      // الانتقال للدور التالي
      if (currentRound < 4) {
        newBrackets[team].currentRound += 1;
        newBrackets[team].questionsAnswered = 0;
        
        // تحديث الموضع في الشجرة
        const nextRoundKey = currentRound === 1 ? 'round4' : 
                           currentRound === 2 ? 'semi' : 'final';
        
        // للفريق الأزرق: نختار موضع من اليمين
        const nextPosition = team === 'blue' 
          ? newBrackets[team].positions[nextRoundKey].length - 1 - Math.floor(Math.random() * newBrackets[team].positions[nextRoundKey].length)
          : Math.floor(Math.random() * newBrackets[team].positions[nextRoundKey].length);
          
        newBrackets[team].positions[nextRoundKey][nextPosition] = {
          ...newBrackets[team].positions[nextRoundKey][nextPosition],
          reached: true,
          name: `${team === 'red' ? 'ر' : 'ز'}${currentRound + 1}`
        };
      } else {
        // وصل للنهائي وأجاب صح
        setWinner(team);
        setGamePhase('finished');
        setTeamBrackets(newBrackets);
        return;
      }
    }
    
    setTeamBrackets(newBrackets);
    setCurrentQuestionNumber(newBrackets[team].questionsAnswered + 1);
    
    // تبديل الدور للفريق الآخر
    switchTurn();
  };

  // إجابة خاطئة - يخسر الفريق كل نقاطه ولا يمكنه اللعب
  const wrongAnswer = () => {
    const newScores = { ...scores };
    newScores[currentTeam] = 0;
    setScores(newScores);
    
    const newStatus = { ...teamStatus };
    newStatus[currentTeam].active = false;
    setTeamStatus(newStatus);
    
    // التحقق من الفريق الآخر
    const otherTeam = currentTeam === 'red' ? 'blue' : 'red';
    if (teamStatus[otherTeam].active && !teamStatus[otherTeam].withdrawn) {
      setCurrentTeam(otherTeam);
      setTimeout(() => {
        startNewQuestion();
      }, 1000);
    } else {
      setGamePhase('finished');
    }
  };

  // الانسحاب - الفريق يحتفظ بنقاطه
  const withdraw = () => {
    const newStatus = { ...teamStatus };
    newStatus[currentTeam].withdrawn = true;
    newStatus[currentTeam].active = false;
    setTeamStatus(newStatus);
    
    // التحقق من الفريق الآخر
    const otherTeam = currentTeam === 'red' ? 'blue' : 'red';
    if (teamStatus[otherTeam].active && !teamStatus[otherTeam].withdrawn) {
      setCurrentTeam(otherTeam);
      setTimeout(() => {
        startNewQuestion();
      }, 1000);
    } else {
      setGamePhase('finished');
    }
  };

  // تبديل الدور بين الفريقين
  const switchTurn = () => {
    const otherTeam = currentTeam === 'red' ? 'blue' : 'red';
    
    // التحقق من حالة الفريق الآخر
    if (teamStatus[otherTeam].active && !teamStatus[otherTeam].withdrawn) {
      setCurrentTeam(otherTeam);
      setTimeout(() => {
        startNewQuestion();
      }, 1000);
    } else {
      // الفريق الآخر منسحب أو خاسر، يستمر نفس الفريق
      setTimeout(() => {
        startNewQuestion();
      }, 1000);
    }
  };

  // إعادة تعيين اللعبة
  const resetGame = () => {
    setGamePhase('setup');
    setCurrentQuestion(null);
    setShowAnswer(false);
    setCurrentTeam('red');
    setScores({ red: 0, blue: 0 });
    setWinner(null);
    setCurrentQuestionNumber(1);
    setTeamStatus({
      red: { active: true, withdrawn: false },
      blue: { active: true, withdrawn: false }
    });
    
    // إعادة تعيين الشجرتين
    setTeamBrackets({
      red: {
        currentRound: 1,
        questionsAnswered: 0,
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
        questionsAnswered: 0,
        positions: {
          round8: Array(8).fill(null).map((_, i) => ({
            id: `blue_r8_${i + 1}`,
            status: i === 7 ? 'active' : 'empty',
            name: i === 7 ? 'ز1' : '',
            reached: i === 7
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

          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 mb-8 shadow-2xl border border-slate-700 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-6">
              بطولة المعرفة - النظام الجديد
            </h2>
            
            <div className="text-lg text-slate-300 mb-8 text-right">
              <p className="mb-4">📋 قواعد اللعبة:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>كل فريق له شجرة بطولة منفصلة</li>
                <li>دور الـ8: يجب الإجابة على 8 أسئلة للانتقال للدور التالي</li>
                <li>دور الـ4: يجب الإجابة على 4 أسئلة</li>
                <li>نصف النهائي: يجب الإجابة على سؤالين</li>
                <li>النهائي: سؤال واحد فقط</li>
                <li className="text-yellow-400">⚠️ إجابة خاطئة = خسارة كل النقاط وإيقاف اللعب</li>
                <li className="text-green-400">✅ يمكن الانسحاب والاحتفاظ بالنقاط</li>
              </ul>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {Object.entries(roundConfig).map(([round, config]) => (
                <div key={round} className="bg-slate-700/50 rounded-xl p-4">
                  <h3 className="font-bold text-yellow-400 mb-2">{config.name}</h3>
                  <p className="text-2xl font-bold text-white">{config.points} نقطة</p>
                  <p className="text-sm text-gray-400">لكل سؤال</p>
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
            <div className={`rounded-xl p-4 text-center border ${
              teamStatus.red.withdrawn ? 'bg-yellow-500/20 border-yellow-500/30' :
              !teamStatus.red.active ? 'bg-gray-500/20 border-gray-500/30' :
              'bg-red-500/20 border-red-500/30'
            }`}>
              <h3 className="text-red-400 font-bold mb-2">
                الفريق الأحمر
                {teamStatus.red.withdrawn && <span className="text-yellow-400 text-xs mr-2"> (منسحب)</span>}
                {!teamStatus.red.active && !teamStatus.red.withdrawn && <span className="text-gray-400 text-xs mr-2"> (خسر)</span>}
              </h3>
              <p className="text-2xl font-bold text-white">{scores.red} نقطة</p>
              <p className="text-sm text-red-300">
                {roundConfig[teamBrackets.red.currentRound]?.name} 
                ({teamBrackets.red.questionsAnswered}/{questionsPerRound[teamBrackets.red.currentRound]})
              </p>
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
                سؤال {currentQuestionNumber} من {questionsPerRound[teamBrackets[currentTeam].currentRound]}
              </p>
            </div>
            
            <div className={`rounded-xl p-4 text-center border ${
              teamStatus.blue.withdrawn ? 'bg-yellow-500/20 border-yellow-500/30' :
              !teamStatus.blue.active ? 'bg-gray-500/20 border-gray-500/30' :
              'bg-blue-500/20 border-blue-500/30'
            }`}>
              <h3 className="text-blue-400 font-bold mb-2">
                الفريق الأزرق
                {teamStatus.blue.withdrawn && <span className="text-yellow-400 text-xs mr-2"> (منسحب)</span>}
                {!teamStatus.blue.active && !teamStatus.blue.withdrawn && <span className="text-gray-400 text-xs mr-2"> (خسر)</span>}
              </h3>
              <p className="text-2xl font-bold text-white">{scores.blue} نقطة</p>
              <p className="text-sm text-blue-300">
                {roundConfig[teamBrackets.blue.currentRound]?.name}
                ({teamBrackets.blue.questionsAnswered}/{questionsPerRound[teamBrackets.blue.currentRound]})
              </p>
            </div>
          </div>

          {/* الشجرتان */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <TeamBracket 
              team="red" 
              bracket={teamBrackets.red} 
              isCurrentTeam={currentTeam === 'red' && teamStatus.red.active}
            />
            <TeamBracket 
              team="blue" 
              bracket={teamBrackets.blue} 
              isCurrentTeam={currentTeam === 'blue' && teamStatus.blue.active}
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
                  {roundConfig[teamBrackets[currentTeam].currentRound]?.name} - 
                  سؤال {currentQuestionNumber}/{questionsPerRound[teamBrackets[currentTeam].currentRound]} - 
                  {roundConfig[teamBrackets[currentTeam].currentRound]?.points} نقطة
                </div>
              </div>
              
              <h3 className="text-xl md:text-2xl font-bold text-center mb-8 text-slate-100">
                {currentQuestion.question}
              </h3>
              
              {!showAnswer ? (
                <div className="flex justify-center gap-4">
                  <button
                    onClick={finishAnswering}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300"
                  >
                    انتهينا من الإجابة
                  </button>
                  {teamBrackets[currentTeam].questionsAnswered >= 5 && (
                    <button
                      onClick={withdraw}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300"
                    >
                      🚪 انسحاب (احتفظ بالنقاط)
                    </button>
                  )}
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
                      className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300"
                    >
                      ✓ إجابة صحيحة (+{roundConfig[teamBrackets[currentTeam].currentRound]?.points} نقطة)
                    </button>
                    <button
                      onClick={wrongAnswer}
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300"
                    >
                      ✗ إجابة خاطئة (خسارة كل النقاط)
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
    const determineWinner = () => {
      if (winner) return winner;
      if (scores.red > scores.blue) return 'red';
      if (scores.blue > scores.red) return 'blue';
      return null;
    };
    
    const finalWinner = determineWinner();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8 flex items-center justify-center">
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 md:p-12 shadow-2xl border border-slate-700 text-center max-w-2xl w-full">
          <div className="text-6xl md:text-8xl mb-6">🏆</div>
          <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-4">
            انتهت البطولة!
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">
            {finalWinner ? `الفريق ${finalWinner === 'red' ? 'الأحمر' : 'الأزرق'} هو البطل!` : 'تعادل!'}
          </h2>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className={`rounded-xl p-6 border ${
              teamStatus.red.withdrawn ? 'bg-yellow-500/20 border-yellow-500/30' :
              !teamStatus.red.active ? 'bg-gray-500/20 border-gray-500/30' :
              'bg-red-500/20 border-red-500/30'
            }`}>
              <h3 className="text-red-400 font-bold mb-2">
                الفريق الأحمر
                {teamStatus.red.withdrawn && <span className="text-yellow-400 text-xs block"> (منسحب)</span>}
                {!teamStatus.red.active && !teamStatus.red.withdrawn && <span className="text-gray-400 text-xs block"> (خسر)</span>}
              </h3>
              <p className="text-3xl font-bold text-white">{scores.red}</p>
              <p className="text-sm text-red-300">نقطة</p>
            </div>
            <div className={`rounded-xl p-6 border ${
              teamStatus.blue.withdrawn ? 'bg-yellow-500/20 border-yellow-500/30' :
              !teamStatus.blue.active ? 'bg-gray-500/20 border-gray-500/30' :
              'bg-blue-500/20 border-blue-500/30'
            }`}>
              <h3 className="text-blue-400 font-bold mb-2">
                الفريق الأزرق
                {teamStatus.blue.withdrawn && <span className="text-yellow-400 text-xs block"> (منسحب)</span>}
                {!teamStatus.blue.active && !teamStatus.blue.withdrawn && <span className="text-gray-400 text-xs block"> (خسر)</span>}
              </h3>
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