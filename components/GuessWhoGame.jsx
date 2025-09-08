// components/GuessWhoGame.jsx - نسخة محدثة مع نظام الأدوار ومنع التكرار
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Pusher from 'pusher-js';
import { guessWhoCharacters, getMatch1Characters, getMatch2Characters } from '../app/data/guessWhoData';

export default function GuessWhoGame({ roomId, onGoBack }) {
  // Game States
  const [gamePhase, setGamePhase] = useState('waiting'); // 'waiting', 'playing', 'finished'
  const [myCharacter, setMyCharacter] = useState(null);
  const [opponentCharacter, setOpponentCharacter] = useState(null);
  const [eliminatedCharacters, setEliminatedCharacters] = useState([]); // فقط لي
  const [currentTurn, setCurrentTurn] = useState(null);
  const [winner, setWinner] = useState(null);
  const [turnTimeLeft, setTurnTimeLeft] = useState(30); // 30 ثانية لكل دور
  const [gameMessages, setGameMessages] = useState([]); // رسائل اللعبة
  
  // Match System - نظام الأدوار
  const [currentMatch, setCurrentMatch] = useState(1); // 1 أو 2
  const [availableCharacters, setAvailableCharacters] = useState([]);
  const [usedMatches, setUsedMatches] = useState([]); // المباريات المستخدمة
  
  // Player Management
  const [playerId] = useState(() => Math.random().toString(36).substr(2, 9));
  const [opponentId, setOpponentId] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [opponentJoined, setOpponentJoined] = useState(false);
  
  // Refs
  const channelRef = useRef(null);
  const turnTimerRef = useRef(null);

  // تحميل البيانات المحفوظة من localStorage
  useEffect(() => {
    try {
      const savedUsedMatches = localStorage.getItem('guess-who-used-matches');
      const savedCurrentMatch = localStorage.getItem('guess-who-current-match');
      
      if (savedUsedMatches) {
        const used = JSON.parse(savedUsedMatches);
        setUsedMatches(used);
        
        // تحديد المباراة التالية
        if (!used.includes(1)) {
          setCurrentMatch(1);
        } else if (!used.includes(2)) {
          setCurrentMatch(2);
        } else {
          // تمت جميع المباريات - إعادة تعيين
          setCurrentMatch(1);
          setUsedMatches([]);
          localStorage.removeItem('guess-who-used-matches');
        }
      } else if (savedCurrentMatch) {
        setCurrentMatch(JSON.parse(savedCurrentMatch));
      }
    } catch (error) {
      console.log('localStorage error:', error);
    }
  }, []);

  // حفظ البيانات في localStorage
  useEffect(() => {
    try {
      localStorage.setItem('guess-who-used-matches', JSON.stringify(usedMatches));
    } catch (error) {}
  }, [usedMatches]);

  useEffect(() => {
    try {
      localStorage.setItem('guess-who-current-match', JSON.stringify(currentMatch));
    } catch (error) {}
  }, [currentMatch]);

  // تحديد الشخصيات المتاحة حسب المباراة الحالية
  useEffect(() => {
    if (currentMatch === 1) {
      setAvailableCharacters(getMatch1Characters());
    } else if (currentMatch === 2) {
      setAvailableCharacters(getMatch2Characters());
    }
  }, [currentMatch]);

  // Initialize Pusher connection
  useEffect(() => {
    const pusher = new Pusher('39e929ae966aeeea6ca3', {
      cluster: 'us2'
    });

    const channel = pusher.subscribe(`guess-who-${roomId}`);
    channelRef.current = channel;

    // Event listeners
    channel.bind('player-joined', (data) => {
      if (data.playerId !== playerId) {
        setOpponentId(data.playerId);
        setOpponentJoined(true);
        setIsHost(!data.isHost);
        console.log('Opponent joined. I am host:', !data.isHost);
      }
    });

    channel.bind('character-selected', (data) => {
      if (data.playerId !== playerId) {
        console.log('Opponent selected character:', data.character.name);
        setOpponentCharacter(data.character);
      }
    });

    // بدء اللعبة
    channel.bind('game-started', (data) => {
      console.log('Game started! Moving to playing phase');
      setGamePhase('playing');
      setCurrentTurn(data.hostId); // المضيف يبدأ
      setTurnTimeLeft(30);
      startTurnTimer();
    });

    // تغيير الدور
    channel.bind('turn-changed', (data) => {
      setCurrentTurn(data.nextPlayerId);
      setTurnTimeLeft(30);
      startTurnTimer();
    });

    // رسائل اللعبة
    channel.bind('game-message', (data) => {
      if (data.playerId !== playerId) {
        setGameMessages(prev => [...prev, {
          text: data.message,
          type: data.type,
          timestamp: Date.now()
        }]);
      }
    });

    // فوز في اللعبة
    channel.bind('game-won', (data) => {
      setWinner(data.winnerId === playerId ? 'me' : 'opponent');
      setGamePhase('finished');
      stopTurnTimer();

      // إضافة المباراة الحالية للمستخدمة
      setUsedMatches(prev => {
        const newUsed = [...prev, currentMatch];
        return newUsed;
      });
    });

    // Announce presence
    setTimeout(() => {
      fetch('/api/pusher/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: `guess-who-${roomId}`,
          event: 'player-joined',
          data: { playerId, isHost: !opponentJoined }
        })
      });
    }, 1000);

    return () => {
      pusher.unsubscribe(`guess-who-${roomId}`);
      stopTurnTimer();
    };
  }, [roomId, playerId, opponentJoined]);

  // Timer للدور
  const startTurnTimer = () => {
    stopTurnTimer();
    turnTimerRef.current = setInterval(() => {
      setTurnTimeLeft(prev => {
        if (prev <= 1) {
          // انتهى الوقت - تغيير الدور
          if (currentTurn === playerId) {
            changeTurn();
          }
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTurnTimer = () => {
    if (turnTimerRef.current) {
      clearInterval(turnTimerRef.current);
      turnTimerRef.current = null;
    }
  };

  // تغيير الدور
  const changeTurn = () => {
    const nextPlayerId = currentTurn === playerId ? opponentId : playerId;
    
    fetch('/api/pusher/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: `guess-who-${roomId}`,
        event: 'turn-changed',
        data: { 
          nextPlayerId,
          changedBy: playerId
        }
      })
    });
  };

  // إرسال رسالة للعبة
  const sendGameMessage = (message, type) => {
    setGameMessages(prev => [...prev, {
      text: message,
      type: type,
      timestamp: Date.now()
    }]);

    fetch('/api/pusher/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: `guess-who-${roomId}`,
        event: 'game-message',
        data: { 
          playerId,
          message,
          type
        }
      })
    });
  };

  // تحقق من بدء اللعبة
  useEffect(() => {
    if (myCharacter && opponentCharacter && opponentJoined && gamePhase === 'waiting') {
      console.log('Both characters selected! Starting game...');
      
      if (isHost) {
        console.log('I am host, sending game start signal...');
        setTimeout(() => {
          fetch('/api/pusher/trigger', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              channel: `guess-who-${roomId}`,
              event: 'game-started',
              data: { 
                hostId: playerId
              }
            })
          });
        }, 500);
      }
    }
  }, [myCharacter, opponentCharacter, opponentJoined, gamePhase, isHost, playerId, roomId]);

  // Select character
  const selectCharacter = (character) => {
    console.log('Selecting character:', character.name);
    setMyCharacter(character);
    
    fetch('/api/pusher/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: `guess-who-${roomId}`,
        event: 'character-selected',
        data: { playerId, character }
      })
    });
  };

  // Eliminate character - محلي فقط
  const eliminateCharacter = (characterId) => {
    if (currentTurn !== playerId) return; // فقط في دوري
    setEliminatedCharacters(prev => [...prev, characterId]);
  };

  // Make final guess
  const makeGuess = (character) => {
    if (currentTurn !== playerId) {
      alert('ليس دورك الآن!');
      return;
    }

    if (!opponentCharacter) {
      
      return;
    }

    console.log('Making competitive guess:', character.name);
    console.log('Opponent character:', opponentCharacter?.name);
    console.log('Character IDs match:', character.id === opponentCharacter?.id);
    
    const isCorrect = character.id === opponentCharacter?.id;
    
    if (isCorrect) {
      // تخمين صحيح - فوز فوري!
      console.log('✅ Correct guess! I won immediately!');
      sendGameMessage(`خمن ${character.name} بشكل صحيح!`, 'correct');
      
      setWinner('me');
      setGamePhase('finished');
      
      fetch('/api/pusher/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: `guess-who-${roomId}`,
          event: 'game-won',
          data: { 
            winnerId: playerId,
            reason: 'correct_guess',
            guessedCharacter: character.name,
            actualCharacter: opponentCharacter.name
          }
        })
      });
    } else {
      // تخمين خاطئ - تستمر اللعبة!
      console.log('❌ Wrong guess, but game continues!');
      sendGameMessage(`خمن ${character.name} - خطأ!`, 'wrong');
      
      // تغيير الدور
      changeTurn();
    }
  };

  // بدء مباراة جديدة
  const startNewMatch = () => {
    // تحديد المباراة التالية
    let nextMatch;
    if (!usedMatches.includes(1)) {
      nextMatch = 1;
    } else if (!usedMatches.includes(2)) {
      nextMatch = 2;
    } else {
      // إعادة تعيين - بدء من المباراة الأولى
      nextMatch = 1;
      setUsedMatches([]);
    }

    setCurrentMatch(nextMatch);
    setGamePhase('waiting');
    setMyCharacter(null);
    setOpponentCharacter(null);
    setEliminatedCharacters([]);
    setWinner(null);
    setGameMessages([]);

    // إعادة تعيين الدور للمضيف
    setCurrentTurn(isHost ? playerId : opponentId);
  };

  // Character selection screen
  if (gamePhase === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header مع معلومات المباراة */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
                من هو 
              </h1>
              {/* <p className="text-slate-400 text-sm">
                {currentMatch === 1 ? 'الشخصيات 1-10' : 'الشخصيات 11-20'}
                {usedMatches.length > 0 && (
                  <span className="ml-2">
                    | مباريات مكتملة: {usedMatches.join(', ')}
                  </span>
                )}
              </p> */}
            </div>
            
            {usedMatches.length > 0 && (
              <button
                onClick={startNewMatch}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm"
              >
                مباراة جديدة
              </button>
            )}
          </div>

          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 text-center">
            {!myCharacter ? (
              <>
                <h2 className="text-2xl font-bold text-center text-white mb-4">اختر شخصيتك السرية</h2>
                <p className="text-center text-slate-300 mb-6">اختر الشخصية التي سيحاول خصمك تخمينها</p>
                {/* <p className="text-center text-yellow-400 text-sm mb-4">
                  🎯 المباراة {currentMatch}: {currentMatch === 1 ? 'الشخصيات الأولى (1-10)' : 'الشخصيات الثانية (11-20)'}
                </p> */}
              </>
            ) : !opponentCharacter ? (
              <>
                <h2 className="text-2xl font-bold text-center text-white mb-4">انتظار اختيار الخصم...</h2>
                <p className="text-center text-slate-300">لقد اخترت: <span className="text-green-400 font-bold">{myCharacter.name}</span></p>
                {/* <p className="text-center text-yellow-400 text-sm mt-2">
                  المباراة {currentMatch} - {currentMatch === 1 ? 'الشخصيات 1-10' : 'الشخصيات 11-20'}
                </p> */}
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-center text-white mb-4">جاري بدء اللعبة...</h2>
                <p className="text-center text-slate-300">شخصيتك: <span className="text-green-400 font-bold">{myCharacter.name}</span></p>
                <div className="flex justify-center mt-4">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              </>
            )}
          </div>

          {!myCharacter && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              {availableCharacters.map(character => (
                <button
                  key={character.id}
                  onClick={() => selectCharacter(character)}
                  className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 hover:bg-slate-700/50 transition-all duration-300 border border-slate-600 hover:border-blue-400"
                >
<img
  src={character.image}
  alt={character.name}
  className="w-full h-32 object-cover object-top rounded-lg mb-2"
  onError={(e) => {
    e.target.src = 'https://via.placeholder.com/150x150/6366F1/FFFFFF?text=' + character.name;
  }}
/>
                  <p className="text-white font-bold text-center">{character.name}</p>
                  {/* <p className="text-slate-400 text-xs text-center">{character.id}</p> */}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Game finished screen
  if (gamePhase === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-white">
            {winner === 'me' ? ' أنت الفائز' : ' خسرت'}
          </h2>

          <div className="space-y-4 mb-6">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-slate-300 mb-2">المباراة  انتهت</p>
              <p className="text-slate-300 mb-2">شخصيتك كانت:</p>
              <div className="flex items-center gap-3 justify-center">
                <img
                  src={myCharacter?.image}
                  alt={myCharacter?.name}
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/50x50/6366F1/FFFFFF?text=' + myCharacter?.name;
                  }}
                />
                <span className="text-white font-bold">{myCharacter?.name}</span>
              </div>
            </div>
            
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-slate-300 mb-2">شخصية الخصم كانت:</p>
              <div className="flex items-center gap-3 justify-center">
                <img
                  src={opponentCharacter?.image}
                  alt={opponentCharacter?.name}
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/50x50/6366F1/FFFFFF?text=' + opponentCharacter?.name;
                  }}
                />
                <span className="text-white font-bold">{opponentCharacter?.name}</span>
              </div>
            </div>

            {/* معلومات التقدم */}
   
          </div>

          <div className="space-y-3">
            <button
              onClick={startNewMatch}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-bold"
            >
              {usedMatches.length + 1 < 2 ? 'المباراة التالية' : 'مباراة جديدة'}
            </button>
            
            <button
              onClick={onGoBack}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl font-bold"
            >
              العودة للقائمة
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main game screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
            من هو 
          </h1>
          {/* <p className="text-slate-400 text-xs">
            {currentMatch === 1 ? 'الشخصيات 1-10' : 'الشخصيات 11-20'}
          </p> */}
        </div>
        
        {/* معلومات الدور */}
        <div className="text-center">
          <div className={`px-4 py-2 rounded-lg font-bold text-lg ${
            currentTurn === playerId 
              ? 'bg-green-500 text-white animate-pulse' 
              : 'bg-gray-600 text-gray-300'
          }`}>
            {currentTurn === playerId ? '✅ دورك' : '❌ دور الخصم'}
          </div>
          
          <div className="flex gap-2 mt-2">
            {/* زر تغيير الدور */}
            {currentTurn === playerId && (
              <button
                onClick={changeTurn}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-2 rounded-lg font-bold text-sm"
              >
                إنهاء الدور
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
        
        {/* Characters Grid */}
        <div className="lg:col-span-3">
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6">
            {/* <h3 className="text-white font-bold text-2xl mb-6 text-center">
              الشخصيات - المباراة {currentMatch}
            </h3> */}
            
            {/* تعليمات */}
            <div className="mb-6 text-center">
              <div className={`text-lg font-bold mb-2 p-3 rounded-lg ${
                currentTurn === playerId 
                  ? 'text-green-400 bg-green-500/20' 
                  : 'text-red-400 bg-red-500/20'
              }`}>
                {currentTurn === playerId 
                  ? '✅ دورك: اضغط الشخصية لاستبعادها • اضغط التخمين للفوز!' 
                  : '❌ دور الخصم: انتظر دورك'
                }
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {availableCharacters.map(character => {
                const isEliminated = eliminatedCharacters.includes(character.id);
                const canInteract = currentTurn === playerId;
                
                return (
                  <div
                    key={character.id}
                    className={`relative transition-all duration-300 ${
                      isEliminated ? 'opacity-30 grayscale' : ''
                    } ${canInteract ? '' : 'opacity-60'}`}
                  >
                    <img
                      src={character.image}
                      alt={character.name}
className={`w-full h-32 object-cover object-top rounded-lg border border-slate-600 ${
  canInteract && !isEliminated ? 'cursor-pointer hover:opacity-80 hover:border-slate-400' : 'cursor-not-allowed'
}`}
                      onClick={() => canInteract && !isEliminated && eliminateCharacter(character.id)}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150x150/6366F1/FFFFFF?text=' + character.name;
                      }}
                    />
                    <p className="text-white text-sm text-center mt-2 font-bold">
                      {character.name}
                    </p>
                    {/* <p className="text-slate-400 text-xs text-center">{character.id}</p> */}
                    
                    {/* X للاستبعاد */}
                    {isEliminated && (
                      <div className="absolute inset-0 bg-red-500/30 rounded-lg flex items-center justify-center">
                        <span className="text-red-500 text-3xl font-bold">✗</span>
                      </div>
                    )}
                    
                    {/* مؤشر عدم القدرة على اللعب */}
                    {!canInteract && (
                      <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs bg-red-500 px-2 py-1 rounded font-bold">
                          ليس دورك
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* قائمة الشخصيات للتخمين النهائي */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-4 flex flex-col h-96">
          <h3 className="text-white font-bold text-lg mb-4 text-center">التخمين النهائي</h3>
          
          <div className="flex-1 overflow-y-auto space-y-2">
            {availableCharacters.map(character => {
              const canGuess = currentTurn === playerId;
              return (
                <div
                  key={character.id}
                  className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg"
                >
                  <div>
                    <span className="text-white font-medium">{character.name}</span>
                    {/* <span className="text-slate-400 text-xs ml-2">({character.id})</span> */}
                  </div>
                  <button
                    onClick={() => makeGuess(character)}
                    disabled={!canGuess}
                    className={`px-3 py-1 text-sm font-bold rounded transition-all duration-200 ${
                      canGuess 
                        ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    تخمين
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}