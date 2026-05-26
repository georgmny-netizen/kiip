import React, { useState, useEffect, useMemo } from 'react';
import { getChapter } from './data/chapters.js';
import { Clock, ChevronRight, ChevronLeft, RotateCcw, CheckCircle2 } from 'lucide-react';

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
const fmt = s => { const neg = s < 0; const a = Math.abs(s); return `${neg ? '-' : ''}${String(Math.floor(a / 60)).padStart(2,'0')}:${String(a % 60).padStart(2,'0')}`; };
const quizPts = i => i < 22 ? 2 : 1.5;

const ExamSimulation = ({ isDark, showRussian }) => {
  const [phase, setPhase] = useState('intro');
  const [examData, setExamData] = useState(null);
  const [sel, setSel] = useState({ quiz: true, essay: true, speaking: true });
  const [examMode, setExamMode] = useState('exam'); // 'exam' | 'workbook'

  // Quiz
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizRevealed, setQuizRevealed] = useState({});
  const [quizTime, setQuizTime] = useState(50 * 60);

  // Essay write + grade
  const [essayTexts, setEssayTexts] = useState(Array(4).fill(''));
  const [essayTime, setEssayTime] = useState(10 * 60);
  const [essayGradeIdx, setEssayGradeIdx] = useState(0);
  const [essayScores, setEssayScores] = useState(Array(4).fill(null));

  // Speaking write + grade
  const [speakingTexts, setSpeakingTexts] = useState(Array(5).fill(''));
  const [speakingTime, setSpeakingTime] = useState(10 * 60);
  const [speakingGradeIdx, setSpeakingGradeIdx] = useState(0);
  const [speakingScores, setSpeakingScores] = useState(Array(5).fill(null));
  const [speakingRevealed, setSpeakingRevealed] = useState(Array(5).fill(false));

  // Timers
  useEffect(() => {
    let t;
    if (phase === 'quiz') {
      t = setTimeout(() => setQuizTime(s => s - 1), 1000);
    } else if (phase === 'essay_write') {
      if (essayTime <= 0) { setPhase('essay_grade'); return; }
      t = setTimeout(() => setEssayTime(s => s - 1), 1000);
    } else if (phase === 'speaking_write') {
      if (speakingTime <= 0) { setPhase('speaking_grade'); return; }
      t = setTimeout(() => setSpeakingTime(s => s - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [phase, quizTime, essayTime, speakingTime]);

  const loadExam = async () => {
    setPhase('loading');
    const all = await Promise.all(Array.from({ length: 20 }, (_, i) => getChapter(i + 1)));
    let allQuiz = [], allEssay = [], allSpeaking = [];
    all.forEach((ch, i) => {
      if (!ch) return;
      const n = i + 1;
      if (ch.quiz) ch.quiz.forEach((q, j) => allQuiz.push({ ...q, chNum: n, chQIdx: j + 1 }));
      if (ch.jakmoohyung?.prompts) {
        ch.jakmoohyung.prompts.forEach((p, j) => allEssay.push({
          prompt: p, ruPrompt: ch.jakmoohyung.ruPrompts?.[j] || '',
          title: ch.jakmoohyung.title, ruTitle: ch.jakmoohyung.ruTitle, chNum: n,
        }));
      }
      if (ch.gusulhyung?.questions) {
        ch.gusulhyung.questions.forEach((q, j) => allSpeaking.push({
          question: q, ruQuestion: ch.gusulhyung.ruQuestions?.[j] || '',
          hints: null, passage: ch.gusulhyung.passage, ruPassage: ch.gusulhyung.ruPassage, chNum: n,
        }));
      }
      if (ch.interview?.question) {
        allSpeaking.push({
          question: ch.interview.question, ruQuestion: ch.interview.ru,
          hints: ch.interview.hints, passage: null, ruPassage: null, chNum: n,
        });
      }
    });
    setExamData({
      quizQs: shuffle(allQuiz).slice(0, 36),
      essayQs: shuffle(allEssay).slice(0, 4),
      speakingQs: shuffle(allSpeaking).slice(0, 5),
    });
    if (sel.quiz) setPhase('quiz');
    else if (sel.essay) { setPhase('essay_write'); setEssayTime(10 * 60); }
    else { setPhase('speaking_write'); setSpeakingTime(10 * 60); }
  };

  const goToEssay = () => {
    if (sel.essay) { setPhase('essay_write'); setEssayTime(10 * 60); }
    else if (sel.speaking) { setPhase('speaking_write'); setSpeakingTime(10 * 60); }
    else setPhase('results');
  };
  const goToSpeaking = () => {
    if (sel.speaking) { setPhase('speaking_write'); setSpeakingTime(10 * 60); }
    else setPhase('results');
  };
  const finish = () => setPhase('results');

  const resetExam = () => {
    setPhase('intro'); setExamData(null);
    setQuizIdx(0); setQuizAnswers({}); setQuizRevealed({}); setQuizTime(50 * 60);
    setEssayTexts(Array(4).fill('')); setEssayTime(10 * 60);
    setEssayGradeIdx(0); setEssayScores(Array(4).fill(null));
    setSpeakingTexts(Array(5).fill('')); setSpeakingTime(10 * 60);
    setSpeakingGradeIdx(0); setSpeakingScores(Array(5).fill(null));
    setSpeakingRevealed(Array(5).fill(false));
  };

  const quizScore = () => examData?.quizQs.reduce((s, q, i) => s + (quizAnswers[i] === q.correct ? quizPts(i) : 0), 0) ?? 0;
  const essayScore = () => essayScores.reduce((s, v) => s + (v ?? 0), 0);
  const speakingScore = () => speakingScores.reduce((s, v) => s + (v ?? 0), 0);

  const card = `rounded-3xl border p-6 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`;
  const timerCls = t => t <= 60 ? 'text-red-400 animate-pulse' : isDark ? 'text-zinc-300' : 'text-slate-700';
  const overTime = quizTime < 0;

  const shuffledOpts = useMemo(() => {
    const q = examData?.quizQs?.[quizIdx];
    if (!q) return [];
    return q.options
      .map((opt, i) => ({ opt, ruOpt: q.ruOptions?.[i] || '', origIdx: i }))
      .sort(() => Math.random() - 0.5);
  }, [quizIdx, examData]);

  // ── INTRO ──────────────────────────────────────────────
  if (phase === 'intro') {
    const sections = [
      { key: 'quiz',     label: '객관식', ru: 'Тест с выбором ответа', sub: '36문항 · 50분', pts: '65점', color: 'blue',    ring: 'ring-blue-500',    bg: 'bg-blue-500' },
      { key: 'essay',    label: '작문형', ru: 'Эссе',                  sub: '4문항 · 10분',  pts: '10점', color: 'violet',  ring: 'ring-violet-500',  bg: 'bg-violet-500' },
      { key: 'speaking', label: '구술형', ru: 'Устная часть',          sub: '5문항 · 10분',  pts: '25점', color: 'emerald', ring: 'ring-emerald-500', bg: 'bg-emerald-500' },
    ];
    const anySelected = sel.quiz || sel.essay || sel.speaking;
    return (
      <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto">
        <div className={`${card} text-center`}>
          <div className="text-5xl mb-3">🎓</div>
          <h2 className={`text-2xl font-black mb-1 ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>귀화용 종합평가</h2>
          <p className={`text-sm font-medium mb-5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Выберите режим и разделы</p>

          <div className={`flex p-1 rounded-2xl gap-1 mb-2 ${isDark ? 'bg-zinc-800' : 'bg-slate-100'}`}>
            <button onClick={() => setExamMode('exam')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${examMode === 'exam' ? isDark ? 'bg-zinc-600 text-white shadow-md' : 'bg-white text-slate-800 shadow-md' : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-500 hover:text-slate-700'}`}>
              🎓 Экзамен
            </button>
            <button onClick={() => setExamMode('workbook')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${examMode === 'workbook' ? isDark ? 'bg-indigo-600 text-white shadow-md' : 'bg-indigo-500 text-white shadow-md' : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-500 hover:text-slate-700'}`}>
              📓 Тетрадь
            </button>
          </div>
          <p className={`text-xs mb-6 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
            {examMode === 'exam' ? 'Все вопросы сначала — результат в конце' : 'После каждого ответа сразу показывается объяснение'}
          </p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {sections.map(s => {
              const active = sel[s.key];
              return (
                <button key={s.key}
                  onClick={() => setSel(v => ({ ...v, [s.key]: !v[s.key] }))}
                  className={`relative rounded-2xl p-4 text-left transition-all border-2 ${
                    active
                      ? `ring-2 ${s.ring} border-transparent ${isDark ? 'bg-zinc-800' : 'bg-white'}`
                      : `border-transparent opacity-40 ${isDark ? 'bg-zinc-800' : 'bg-slate-50'}`
                  }`}>
                  {active && (
                    <CheckCircle2 size={16} className={`absolute top-2.5 right-2.5 text-${s.color}-500`} />
                  )}
                  <div className={`inline-block text-xs font-black text-white px-2 py-0.5 rounded-lg mb-2 ${s.bg}`}>{s.label}</div>
                  <div className={`text-xl font-black ${isDark ? 'text-zinc-100' : 'text-slate-800'}`}>{s.pts}</div>
                  <div className={`text-xs mt-0.5 font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>{s.ru}</div>
                  <div className={`text-xs mt-1 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>{s.sub}</div>
                </button>
              );
            })}
          </div>

          <p className={`text-xs mb-6 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
            Итого: <b>100 баллов</b> · Проходной: <b>60 баллов</b> · Общее время: <b>70 минут</b>
          </p>

          <button onClick={loadExam} disabled={!anySelected}
            className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-base rounded-2xl transition-all hover:scale-105 shadow-lg">
            {sel.quiz && sel.essay && sel.speaking ? 'Полный экзамен' : 'Начать тренировку'} →
          </button>
        </div>
      </div>
    );
  }

  // ── LOADING ────────────────────────────────────────────
  if (phase === 'loading') return (
    <div className={`${card} text-center py-24 max-w-2xl mx-auto`}>
      <div className="text-5xl mb-4 animate-bounce">📝</div>
      <p className={`font-bold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>Загрузка вопросов из всех глав...</p>
    </div>
  );

  // ── QUIZ ───────────────────────────────────────────────
  if (phase === 'quiz') {
    const q = examData.quizQs[quizIdx];
    const answered = Object.keys(quizAnswers).length;
    const isWB = examMode === 'workbook';
    const revealed = isWB && !!quizRevealed[quizIdx];
    const picked = quizAnswers[quizIdx];

    const handlePick = (i) => {
      if (revealed) return;
      setQuizAnswers(a => ({ ...a, [quizIdx]: i }));
      if (isWB) setQuizRevealed(r => ({ ...r, [quizIdx]: true }));
    };

    const optCls = (i) => {
      const base = 'w-full text-left p-3.5 rounded-xl border font-medium text-sm transition-all flex items-center gap-2 ';
      if (!revealed) {
        return base + (picked === i
          ? 'bg-blue-500 border-blue-500 text-white'
          : isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-blue-500' : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400');
      }
      if (i === q.correct) return base + 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold';
      if (i === picked) return base + 'bg-red-500/20 border-red-400 text-red-400';
      return base + (isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-600' : 'bg-slate-50 border-slate-200 text-slate-400');
    };

    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-black text-xs uppercase tracking-widest ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>객관식 {isWB ? '· 📓 Тетрадь' : '· 🎓 Экзамен'}</span>
            <span className={`text-xs px-2 py-1 rounded-lg font-bold ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-500'}`}>{quizIdx + 1} / 36</span>
            {!isWB && <span className={`text-xs px-2 py-1 rounded-lg font-bold ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-500'}`}>답변 {answered}/36</span>}
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 font-black text-lg tabular-nums ${timerCls(quizTime)} ${overTime ? 'opacity-80' : ''}`}>
              <Clock size={16} /> {fmt(quizTime)}
              {overTime && <span className="text-xs font-bold opacity-70">overtime</span>}
            </div>
            <button onClick={goToEssay}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${isDark ? 'bg-zinc-700 hover:bg-red-900/40 hover:text-red-400 text-zinc-300' : 'bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-600'}`}>
              Завершить ✓
            </button>
          </div>
        </div>

        <div className={`w-full h-1.5 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`}>
          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${((quizIdx + 1) / 36) * 100}%` }} />
        </div>

        <div className={card}>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-xs font-black bg-blue-500 text-white px-2 py-0.5 rounded-lg">문 {quizIdx + 1} · {quizPts(quizIdx)}점</span>
            <span className={`text-xs px-2 py-0.5 rounded-lg ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-500'}`}>гл. {q.chNum}</span>
            <span className={`text-xs px-2 py-0.5 rounded-lg ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-500'}`}>тетрадь №{q.chQIdx}</span>
          </div>
          {q.prompt && (
            <div className={`mb-4 p-4 rounded-xl text-sm whitespace-pre-line leading-relaxed ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-50 text-slate-600'}`}>
              {showRussian && q.ruPrompt ? q.ruPrompt : q.prompt}
            </div>
          )}
          <p className={`text-base font-bold mb-1 leading-snug ${isDark ? 'text-zinc-100' : 'text-slate-800'}`}>{q.q}</p>
          {showRussian && q.ruQ && <p className={`text-sm mb-4 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>{q.ruQ}</p>}
          <div className="space-y-2 mt-4">
            {shuffledOpts.map((o, dispIdx) => (
              <button key={o.origIdx} onClick={() => handlePick(o.origIdx)} disabled={revealed && o.origIdx !== q.correct && o.origIdx !== picked}
                className={optCls(o.origIdx)}>
                <span className="font-black opacity-60 flex-shrink-0">{dispIdx + 1}.</span>
                <span className="flex-1">{showRussian && o.ruOpt ? o.ruOpt : o.opt}</span>
                {revealed && o.origIdx === q.correct && <span className="text-emerald-400 flex-shrink-0">✓</span>}
                {revealed && o.origIdx === picked && o.origIdx !== q.correct && <span className="text-red-400 flex-shrink-0">✗</span>}
              </button>
            ))}
          </div>

          {isWB && revealed && (
            <div className={`mt-4 p-4 rounded-xl text-sm border ${
              picked === q.correct
                ? isDark ? 'bg-emerald-900/20 border-emerald-800 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : isDark ? 'bg-red-900/20 border-red-900 text-red-300' : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <p className="font-black text-xs uppercase tracking-wider mb-2">
                {picked === q.correct ? '✓ Правильно!' : '✗ Неправильно'}
              </p>
              {picked !== q.correct && (
                <p className={`text-xs mb-2 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  Правильный ответ: <b>{q.options[q.correct]}</b>
                </p>
              )}
              {(q.explain || q.ruExplain) && <p className={`text-xs italic ${isDark ? 'opacity-70' : 'opacity-80'}`}>{showRussian && q.ruExplain ? q.ruExplain : q.explain}</p>}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          {!isWB && (
            <button onClick={() => setQuizIdx(i => i - 1)} disabled={quizIdx === 0}
              className={`flex items-center gap-1 px-4 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-30 ${isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
              <ChevronLeft size={16} /> Назад
            </button>
          )}
          {!isWB && quizIdx < 35 && (
            <button onClick={() => setQuizIdx(i => i + 1)}
              className="ml-auto flex items-center gap-1 px-4 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white transition-all">
              Далее <ChevronRight size={16} />
            </button>
          )}
          {!isWB && quizIdx === 35 && (
            <button onClick={goToEssay}
              className="ml-auto flex items-center gap-1 px-5 py-2.5 rounded-xl font-bold text-sm bg-violet-600 hover:bg-violet-500 text-white transition-all">
              Завершить → 작문형 <ChevronRight size={16} />
            </button>
          )}
          {isWB && (
            <button onClick={() => quizIdx < 35 ? setQuizIdx(i => i + 1) : goToEssay()}
              disabled={!revealed}
              className={`ml-auto flex items-center gap-1 px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-30 ${
                quizIdx < 35 ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-violet-600 hover:bg-violet-500 text-white'
              }`}>
              {quizIdx < 35 ? 'Следующий' : 'Завершить тест'} <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── ESSAY WRITE ────────────────────────────────────────
  if (phase === 'essay_write') return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className={`font-black text-xs uppercase tracking-widest ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>작문형 — напишите ответы</span>
        <div className={`flex items-center gap-1.5 font-black text-lg tabular-nums ${timerCls(essayTime)}`}>
          <Clock size={16} /> {fmt(essayTime)}
        </div>
      </div>
      <div className="space-y-5">
        {examData.essayQs.map((q, i) => (
          <div key={i} className={card}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-black bg-violet-500 text-white px-2 py-0.5 rounded-lg">작문 {i + 1} · 2.5점</span>
              <span className={`text-xs ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>гл. {q.chNum}</span>
            </div>
            <div className={`mb-3 p-3 rounded-xl text-sm ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-50 text-slate-700'}`}>
              <p className="font-bold">{showRussian && q.ruTitle ? q.ruTitle : q.title}</p>
              <p className="mt-1.5">{showRussian && q.ruPrompt ? q.ruPrompt : q.prompt}</p>
            </div>
            <textarea value={essayTexts[i]}
              onChange={e => { if (e.target.value.length > 200) return; const a = [...essayTexts]; a[i] = e.target.value; setEssayTexts(a); }}
              placeholder="여기에 답을 작성하세요 (최대 200자)..."
              rows={4}
              className={`w-full rounded-xl p-3 text-sm resize-none outline-none border transition-colors ${isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200 placeholder-zinc-600 focus:border-violet-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-violet-400'}`}
            />
            <div className={`text-right text-xs mt-1 ${essayTexts[i].length >= 200 ? 'text-red-400' : isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
              {essayTexts[i].length} / 200
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => setPhase('essay_grade')}
        className="w-full py-3.5 rounded-2xl font-black text-white bg-violet-600 hover:bg-violet-500 active:scale-95 transition-all text-sm">
        Завершить 작문형 → перейти к самооценке
      </button>
    </div>
  );

  // ── ESSAY GRADE ────────────────────────────────────────
  if (phase === 'essay_grade') {
    const q = examData.essayQs[essayGradeIdx];
    const SCORES = [0, 0.5, 1, 1.5, 2, 2.5];
    const allGraded = essayScores.every(s => s !== null);
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`font-black text-xs uppercase tracking-widest ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>작문형 — самооценка</span>
          <span className={`text-xs px-2 py-1 rounded-lg font-bold ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-500'}`}>{essayGradeIdx + 1} / 4</span>
        </div>
        <div className={card}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-black bg-violet-500 text-white px-2 py-0.5 rounded-lg">작문 {essayGradeIdx + 1} · 2.5점</span>
          </div>
          <div className={`mb-3 p-3 rounded-xl text-sm ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-50 text-slate-700'}`}>
            <p className="font-bold">{showRussian && q.ruTitle ? q.ruTitle : q.title}</p>
            <p className="mt-1">{showRussian && q.ruPrompt ? q.ruPrompt : q.prompt}</p>
          </div>
          <p className={`text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Ваш ответ</p>
          <div className={`mb-5 p-3 rounded-xl text-sm whitespace-pre-wrap min-h-16 ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-50 text-slate-700'}`}>
            {essayTexts[essayGradeIdx] || <span className="opacity-40 italic">Ответ не написан</span>}
          </div>
          <p className={`text-xs font-black uppercase tracking-wider mb-3 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Поставьте себе оценку</p>
          <div className="flex gap-2 flex-wrap">
            {SCORES.map(s => (
              <button key={s} onClick={() => { const a = [...essayScores]; a[essayGradeIdx] = s; setEssayScores(a); }}
                className={`px-4 py-2 rounded-xl font-black text-sm transition-all ${essayScores[essayGradeIdx] === s ? 'bg-violet-500 text-white' : isDark ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {s}점
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          {essayGradeIdx > 0 && (
            <button onClick={() => setEssayGradeIdx(i => i - 1)}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
              ← Назад
            </button>
          )}
          {essayGradeIdx < 3 ? (
            <button onClick={() => setEssayGradeIdx(i => i + 1)} disabled={essayScores[essayGradeIdx] === null}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-violet-600 hover:bg-violet-500 text-white transition-all disabled:opacity-40">
              Следующий →
            </button>
          ) : (
            <button onClick={goToSpeaking} disabled={!allGraded}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-all disabled:opacity-40">
              Перейти к 구술형 →
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── SPEAKING WRITE ─────────────────────────────────────
  if (phase === 'speaking_write') return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className={`font-black text-xs uppercase tracking-widest ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>구술형 — напишите ответы</span>
        <div className={`flex items-center gap-1.5 font-black text-lg tabular-nums ${timerCls(speakingTime)}`}>
          <Clock size={16} /> {fmt(speakingTime)}
        </div>
      </div>
      <div className="space-y-4">
        {examData.speakingQs.map((q, i) => (
          <div key={i} className={card}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-black bg-emerald-500 text-white px-2 py-0.5 rounded-lg">구술 {i + 1} · 5점</span>
              <span className={`text-xs ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>гл. {q.chNum}</span>
            </div>
            {q.passage && (
              <div className={`mb-3 p-3 rounded-xl text-sm leading-relaxed ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-50 text-slate-600'}`}>
                {showRussian && q.ruPassage ? q.ruPassage : q.passage}
              </div>
            )}
            <p className={`font-bold mb-3 ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
              {showRussian && q.ruQuestion ? q.ruQuestion : q.question}
            </p>
            <textarea value={speakingTexts[i]}
              onChange={e => { const a = [...speakingTexts]; a[i] = e.target.value; setSpeakingTexts(a); }}
              placeholder="여기에 답을 작성하세요..."
              rows={3}
              className={`w-full rounded-xl p-3 text-sm resize-none outline-none border transition-colors ${isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200 placeholder-zinc-600 focus:border-emerald-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-emerald-400'}`}
            />
          </div>
        ))}
      </div>
      <button onClick={() => setPhase('speaking_grade')}
        className="w-full py-3.5 rounded-2xl font-black text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all text-sm">
        Завершить 구술형 → перейти к самооценке
      </button>
    </div>
  );

  // ── SPEAKING GRADE ─────────────────────────────────────
  if (phase === 'speaking_grade') {
    const q = examData.speakingQs[speakingGradeIdx];
    const SCORES = [0, 1, 2, 3, 4, 5];
    const allGraded = speakingScores.every(s => s !== null);
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`font-black text-xs uppercase tracking-widest ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>구술형 — самооценка</span>
          <span className={`text-xs px-2 py-1 rounded-lg font-bold ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-500'}`}>{speakingGradeIdx + 1} / 5</span>
        </div>
        <div className={card}>
          <span className="text-xs font-black bg-emerald-500 text-white px-2 py-0.5 rounded-lg inline-block mb-4">구술 {speakingGradeIdx + 1} · 5점</span>
          {q.passage && (
            <div className={`mb-3 p-3 rounded-xl text-sm leading-relaxed ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-50 text-slate-600'}`}>
              {showRussian && q.ruPassage ? q.ruPassage : q.passage}
            </div>
          )}
          <p className={`font-bold mb-4 ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
            {showRussian && q.ruQuestion ? q.ruQuestion : q.question}
          </p>
          <p className={`text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Ваш ответ</p>
          <div className={`mb-4 p-3 rounded-xl text-sm whitespace-pre-wrap min-h-14 ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-50 text-slate-700'}`}>
            {speakingTexts[speakingGradeIdx] || <span className="opacity-40 italic">Ответ не написан</span>}
          </div>
          {!speakingRevealed[speakingGradeIdx] ? (
            <button onClick={() => { const a = [...speakingRevealed]; a[speakingGradeIdx] = true; setSpeakingRevealed(a); }}
              className={`w-full py-2.5 rounded-xl font-bold text-sm mb-4 transition-all ${isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
              Показать ключевые пункты →
            </button>
          ) : (
            <div className={`mb-4 p-4 rounded-xl text-sm ${isDark ? 'bg-emerald-900/30 border border-emerald-800 text-emerald-300' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'}`}>
              <p className="font-black text-xs uppercase tracking-wider mb-2 opacity-60">Ключевые пункты</p>
              {q.hints
                ? q.hints.map((h, i) => <p key={i} className="mb-1">• {h}</p>)
                : <p className="leading-relaxed">{showRussian && q.ruPassage ? q.ruPassage : q.passage}</p>}
            </div>
          )}
          <p className={`text-xs font-black uppercase tracking-wider mb-3 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Поставьте себе оценку (0–5)</p>
          <div className="flex gap-2">
            {SCORES.map(s => (
              <button key={s} onClick={() => { const a = [...speakingScores]; a[speakingGradeIdx] = s; setSpeakingScores(a); }}
                className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all ${speakingScores[speakingGradeIdx] === s ? 'bg-emerald-500 text-white' : isDark ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          {speakingGradeIdx > 0 && (
            <button onClick={() => setSpeakingGradeIdx(i => i - 1)}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
              ← Назад
            </button>
          )}
          {speakingGradeIdx < 4 ? (
            <button onClick={() => setSpeakingGradeIdx(i => i + 1)} disabled={speakingScores[speakingGradeIdx] === null}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-all disabled:opacity-40">
              Следующий →
            </button>
          ) : (
            <button onClick={finish} disabled={!allGraded}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-40">
              Результаты →
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── RESULTS ────────────────────────────────────────────
  if (phase === 'results') {
    const qs = sel.quiz ? quizScore() : null;
    const es = sel.essay ? essayScore() : null;
    const ss = sel.speaking ? speakingScore() : null;
    const tot = (qs ?? 0) + (es ?? 0) + (ss ?? 0);
    const maxPts = (sel.quiz ? 65 : 0) + (sel.essay ? 10 : 0) + (sel.speaking ? 25 : 0);
    const fullExam = sel.quiz && sel.essay && sel.speaking;
    const passed = fullExam && tot >= 60;
    const allSections = [
      { key: 'quiz',     label: '객관식', score: qs, max: 65, color: 'blue' },
      { key: 'essay',    label: '작문형', score: es, max: 10, color: 'violet' },
      { key: 'speaking', label: '구술형', score: ss, max: 25, color: 'emerald' },
    ].filter(s => sel[s.key]);
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className={`${card} text-center`}>
          <div className="text-6xl mb-4">{fullExam ? (passed ? '🎉' : '📚') : '✅'}</div>
          <h2 className={`text-5xl font-black mb-2 ${fullExam ? (passed ? 'text-emerald-500' : 'text-red-400') : 'text-indigo-500'}`}>
            {tot.toFixed(1)}<span className="text-2xl opacity-50"> / {maxPts}</span>
          </h2>
          <p className={`text-xl font-black mb-8 ${fullExam ? (passed ? 'text-emerald-400' : 'text-red-400') : isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
            {fullExam ? (passed ? '합격 · Сдан!' : '불합격 · Не сдан') : 'Тренировка завершена'}
          </p>
          <div className={`grid gap-3 max-w-md mx-auto mb-8 grid-cols-${allSections.length}`}>
            {allSections.map(s => (
              <div key={s.label} className={`rounded-2xl p-4 ${isDark ? 'bg-zinc-800' : 'bg-slate-50'}`}>
                <div className={`text-xs font-black text-${s.color}-500 mb-1`}>{s.label}</div>
                <div className={`text-2xl font-black ${isDark ? 'text-zinc-100' : 'text-slate-800'}`}>{s.score.toFixed(1)}</div>
                <div className={`text-xs ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>/ {s.max}점</div>
                <div className={`mt-2 h-1.5 rounded-full ${isDark ? 'bg-zinc-700' : 'bg-slate-200'}`}>
                  <div className={`h-full rounded-full bg-${s.color}-500 transition-all`} style={{ width: `${(s.score / s.max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <button onClick={resetExam}
            className={`flex items-center gap-2 mx-auto px-6 py-3 rounded-xl font-bold text-sm transition-all ${isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
            <RotateCcw size={15} /> Начать заново
          </button>
        </div>

        {sel.quiz && <div className={card}>
          <h3 className={`font-black text-base mb-4 ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>Разбор 객관식</h3>
          <div className="space-y-2">
            {examData.quizQs.map((q, i) => {
              const correct = quizAnswers[i] === q.correct;
              return (
                <div key={i} className={`p-3 rounded-xl text-sm ${correct
                  ? isDark ? 'bg-emerald-900/30 border border-emerald-800' : 'bg-emerald-50 border border-emerald-200'
                  : isDark ? 'bg-red-900/30 border border-red-900' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-start gap-2">
                    <span className={`font-black mt-0.5 flex-shrink-0 ${correct ? 'text-emerald-500' : 'text-red-400'}`}>{correct ? '✓' : '✗'}</span>
                    <div>
                      <p className={`font-medium mb-1 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>{i + 1}. {q.q}</p>
                      {!correct && (
                        <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                          Правильный: <b>{q.options[q.correct]}</b>
                          {quizAnswers[i] !== undefined && <> · Ваш: <b className="text-red-400">{q.options[quizAnswers[i]]}</b></>}
                        </p>
                      )}
                      {(q.explain || q.ruExplain) && <p className={`text-xs mt-1 italic ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>{showRussian && q.ruExplain ? q.ruExplain : q.explain}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>}
      </div>
    );
  }

  return null;
};

export default ExamSimulation;
