import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  BookOpen, FileText, CheckCircle, ChevronRight, Menu, Brain, Mic, Search,
  Languages, ArrowRight, Globe, Award, Sun, Moon, Lightbulb, Target,
  Link2, Newspaper, Scale, RotateCcw, GraduationCap
} from 'lucide-react';
import { parts, chapterTitles, getChapter, chaptersData } from './data/chapters.js';
import { getPartReview } from './data/partReviews/index.js';
import ExamSimulation from './ExamSimulation.jsx';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const partColorMap = {
  emerald: { bg: 'bg-emerald-500', soft: 'bg-emerald-50 text-emerald-700', softDark: 'bg-zinc-800 text-zinc-300' },
  amber: { bg: 'bg-amber-500', soft: 'bg-amber-50 text-amber-700', softDark: 'bg-zinc-800 text-zinc-300' },
  sky: { bg: 'bg-sky-500', soft: 'bg-sky-50 text-sky-700', softDark: 'bg-zinc-800 text-zinc-300' },
  orange: { bg: 'bg-orange-500', soft: 'bg-orange-50 text-orange-700', softDark: 'bg-zinc-800 text-zinc-300' },
  violet: { bg: 'bg-violet-500', soft: 'bg-violet-50 text-violet-700', softDark: 'bg-zinc-800 text-zinc-300' },
  indigo: { bg: 'bg-indigo-500', soft: 'bg-indigo-50 text-indigo-700', softDark: 'bg-zinc-800 text-zinc-300' },
  rose:   { bg: 'bg-rose-500',   soft: 'bg-rose-50 text-rose-700',     softDark: 'bg-zinc-800 text-zinc-300' },
  teal:   { bg: 'bg-teal-500',   soft: 'bg-teal-50 text-teal-700',     softDark: 'bg-zinc-800 text-zinc-300' },
};

const TabButton = ({ active, isDark, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-4 md:px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
      active
        ? isDark ? 'bg-zinc-700 text-zinc-300 shadow-lg' : 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200'
        : isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-500 hover:text-slate-800'
    }`}
  >
    <span className="mr-2">{icon}</span>
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const SectionCard = ({ isDark, children, className = '' }) => (
  <section
    className={`rounded-3xl border shadow-sm transition-colors ${
      isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
    } ${className}`}
  >
    {children}
  </section>
);

const GniInfoCard = ({ infoCard, showRussian, isDark }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) { chartRef.current.destroy(); }
    const ctx = canvasRef.current.getContext('2d');
    const gridColor = isDark ? '#27272a' : '#e2e8f0';
    const tickColor = isDark ? '#71717a' : '#64748b';
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: infoCard.chart.labels,
        datasets: [
          { label: '남한', data: infoCard.chart.south, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', borderWidth: 2, pointRadius: 4, tension: 0.3, fill: true },
          { label: '북한', data: infoCard.chart.north, borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.08)', borderWidth: 2, pointRadius: 4, tension: 0.3, fill: true }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { color: tickColor, font: { size: 10 }, callback: (v) => v.toLocaleString() }, grid: { color: gridColor } },
          x: { ticks: { color: tickColor, font: { size: 10 } }, grid: { color: gridColor } }
        }
      }
    });
    return () => { chartRef.current?.destroy(); };
  }, [isDark, infoCard]);

  return (
    <div className={`rounded-3xl border overflow-hidden shadow-xl ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
      <div className={`p-6 md:p-8 border-b ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
        <h4 className={`font-black text-lg mb-1 ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>{infoCard.constitutionTitle.ko}</h4>
        {showRussian && <p className="text-xs text-zinc-500 italic mb-5">{infoCard.constitutionTitle.ru}</p>}
        <div className="space-y-4 mt-4">
          {infoCard.constitution.map((a, i) => (
            <div key={i}>
              <p className={`text-sm ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                <span className="font-black">{a.article}: </span>{a.ko}
              </p>
              {showRussian && <p className="text-xs text-zinc-500 mt-1">{a.ru}</p>}
            </div>
          ))}
        </div>
      </div>
      <div className="p-6 md:p-8">
        <div className="grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="bg-indigo-500 text-white text-xs font-black px-3 py-1 rounded-lg">알아두면 좋아요</span>
              <p className={`font-bold text-sm ${isDark ? 'text-rose-400' : 'text-red-600'}`}>{infoCard.tipTitle.ko}</p>
            </div>
            {showRussian && <p className="text-xs text-zinc-500 italic">{infoCard.tipTitle.ru}</p>}
            <div className="space-y-3">
              {infoCard.tipParagraphs.map((p, i) => (
                <div key={i}>
                  <p className={`text-sm leading-relaxed ${p.bold ? 'font-semibold ' + (isDark ? 'text-blue-400' : 'text-blue-700') : isDark ? 'text-zinc-300' : 'text-slate-700'}`}>{p.ko}</p>
                  {showRussian && <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{p.ru}</p>}
                </div>
              ))}
            </div>
          </div>
          <div className={`md:col-span-5 rounded-2xl p-4 border ${isDark ? 'bg-zinc-800/50 border-zinc-700' : 'bg-slate-50 border-slate-200'}`}>
            <div className="text-center mb-3">
              <p className={`text-xs font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{infoCard.chartTitle.ko}</p>
              {showRussian && <p className="text-[10px] text-zinc-500 mt-0.5">{infoCard.chartTitle.ru}</p>}
            </div>
            <div className="relative h-52">
              <canvas ref={canvasRef} />
            </div>
            <div className="mt-3 flex justify-center gap-6 text-[11px] text-zinc-500">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> 남한 (Юг)</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block" /> 북한 (Север)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Textbook = ({ chapter, chapterNum, showRussian, isDark }) => {
  const [tbMode, setTbMode] = useState('content');
  useEffect(() => { setTbMode('content'); }, [chapterNum]);

  const tbBtnCls = (m) => `px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-1.5 ${
    tbMode === m
      ? isDark ? 'bg-zinc-700 text-zinc-300 shadow-md' : 'bg-white text-blue-600 shadow-md'
      : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-500 hover:text-slate-700'
  }`;

  const tbModeToggle = (
    <div className={`flex gap-1 p-1 rounded-2xl w-fit mb-6 ${isDark ? 'bg-zinc-800' : 'bg-slate-100'}`}>
      <button onClick={() => setTbMode('content')} className={tbBtnCls('content')}><FileText size={14} /> Содержание</button>
      <button onClick={() => setTbMode('original')} className={tbBtnCls('original')}><BookOpen size={14} /> Оригинал</button>
    </div>
  );

  if (tbMode === 'original') {
    return (
      <div>
        {tbModeToggle}
        <TextbookImages chapterNum={chapterNum} isDark={isDark} />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div>
        {tbModeToggle}
        <div className={`rounded-3xl border p-12 text-center ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200 text-zinc-500'}`}>
          <BookOpen size={40} className="mx-auto mb-4 opacity-40" />
          <p className="font-bold text-lg">Контент этой главы пока в разработке</p>
          <p className="text-sm mt-2">Подробно проработана только Глава 1.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {tbModeToggle}
      <header className="mb-4">
        <div className={`font-bold mb-2 tracking-wider uppercase text-sm ${isDark ? 'text-zinc-400' : 'text-blue-500'}`}>
          제 {chapter.number} 과
        </div>
        <h2 className={`text-4xl font-black mb-2 ${isDark ? 'text-zinc-300' : 'text-slate-900'}`}>{chapter.title}</h2>
        {showRussian && <h3 className="text-xl text-zinc-500 font-medium">{chapter.russianTitle}</h3>}
      </header>

      {/* ?앷컖??遊낆떆??*/}
      <SectionCard isDark={isDark}>
        <div className={`p-6 border-b flex items-center ${isDark ? 'bg-zinc-800/50 border-zinc-800' : 'bg-rose-50 border-slate-200'}`}>
          <Lightbulb className="text-rose-500 mr-3" />
          <h4 className={`text-xl font-bold ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>{chapter.intro.title}</h4>
          {showRussian && <span className="ml-3 text-zinc-500 text-sm">({chapter.intro.ruTitle})</span>}
        </div>
        <div className="p-6 space-y-4">
          <p className={`font-medium ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>{chapter.intro.description}</p>
          {showRussian && <p className="text-sm text-zinc-500 italic">{chapter.intro.ruDescription}</p>}
          <div className="grid md:grid-cols-2 gap-3 pt-2">
            {chapter.intro.questions.map((q, i) => (
              <div key={i} className={`p-4 rounded-2xl border-l-4 border-rose-400 ${isDark ? 'bg-zinc-800' : 'bg-rose-50/60'}`}>
                <div className="text-xs font-black text-rose-500 mb-1">Q{i + 1}</div>
                <p className={`font-bold text-sm ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>{q.q}</p>
                {showRussian && <p className="text-xs text-zinc-500 mt-1">{q.ru}</p>}
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* ?숈뒿紐⑺몴 + 愿???⑥썝 */}
      <div className="grid md:grid-cols-2 gap-6">
        <SectionCard isDark={isDark}>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Target className="text-amber-500 mr-3" />
              <h4 className={`text-lg font-bold ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>학습목표</h4>
              {showRussian && <span className="ml-2 text-zinc-500 text-xs">(Цели обучения)</span>}
            </div>
            <ol className="space-y-3">
              {chapter.objectives.map((o, i) => (
                <li key={i} className="flex">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">{i + 1}</span>
                  <div>
                    <p className={`font-bold text-sm ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>{o.ko}</p>
                    {showRussian && <p className="text-xs text-zinc-500 mt-1">{o.ru}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </SectionCard>

        <SectionCard isDark={isDark}>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Link2 className="text-sky-500 mr-3" />
              <h4 className={`text-lg font-bold ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>관련 단원 확인하기</h4>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-zinc-800' : 'bg-sky-50'}`}>
              <div className="text-xs font-bold text-sky-600 uppercase tracking-wider">{chapter.related.area}</div>
              <div className={`font-bold mt-1 ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>{chapter.related.topic}</div>
              <div className="text-sm text-zinc-500 mt-1">{chapter.related.detail}</div>
              {showRussian && <div className="text-xs text-zinc-500 italic mt-2 pt-2 border-t border-dashed border-slate-300">{chapter.related.ru}</div>}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Lessons */}
      {chapter.sections.map((s) => (
        <React.Fragment key={s.id}>
        <SectionCard isDark={isDark}>
          <div className={`p-6 border-b flex items-start gap-4 ${isDark ? 'bg-zinc-800/50 border-zinc-800' : 'bg-emerald-50 border-slate-200'}`}>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white font-black text-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30">{s.number}</div>
            <div>
              <h4 className={`text-2xl font-black ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>{s.title}</h4>
              {showRussian && <p className="text-zinc-500 text-sm mt-1 font-medium">{s.ruTitle}</p>}
            </div>
          </div>
          <div className="p-6 md:p-8 space-y-8">
            {s.blocks.map((b, i) => (
              <div key={i}>
                <h5 className={`text-lg font-black mb-3 pl-3 border-l-4 border-emerald-500 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{b.heading}</h5>
                {showRussian && <p className="text-xs text-zinc-500 italic mb-3 pl-3">{b.ruHeading}</p>}
                {b.text && (
                  <>
                    <p className={`leading-relaxed ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>{b.text}</p>
                    {showRussian && (
                      <p className={`mt-3 leading-relaxed text-sm border-t pt-3 ${isDark ? 'text-zinc-400 border-zinc-800' : 'text-zinc-500 border-slate-100'}`}>
                        {b.ru}
                      </p>
                    )}
                  </>
                )}
                {b.table && (
                  <div className="mt-4 overflow-x-auto">
                    <table className={`w-full text-sm border-collapse rounded-xl overflow-hidden ${isDark ? 'border-zinc-700' : 'border-slate-200'}`}>
                      <thead>
                        <tr className={isDark ? 'bg-zinc-800' : 'bg-slate-100'}>
                          {b.table.headers.map((h, i) => (
                            <th key={i} className={`px-4 py-3 text-left font-black border ${isDark ? 'border-zinc-700 text-zinc-300' : 'border-slate-200 text-slate-700'}`}>
                              <div>{h.ko}</div>
                              {showRussian && <div className="text-xs font-medium text-zinc-500 mt-0.5">{h.ru}</div>}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {b.table.rows.map((row, ri) => (
                          <tr key={ri} className={isDark ? (ri % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-800/50') : (ri % 2 === 0 ? 'bg-white' : 'bg-slate-50')}>
                            {row.map((cell, ci) => (
                              <td key={ci} className={`px-4 py-3 border align-top ${isDark ? 'border-zinc-700 text-zinc-300' : 'border-slate-200 text-slate-700'}`}>
                                <div className={cell.bold ? 'font-bold' : ''}>{cell.ko}</div>
                                {showRussian && <div className="text-xs text-zinc-500 mt-0.5">{cell.ru}</div>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {b.list && (
                  <ul className="space-y-3">
                    {b.list.map((it, j) => (
                      <li key={j} className={`p-4 rounded-xl ${isDark ? 'bg-zinc-800' : 'bg-slate-50'}`}>
                        <div className="flex">
                          <span className="text-emerald-500 font-black mr-3">{j + 1}.</span>
                          <div>
                            <p className={`font-medium ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>{it.ko}</p>
                            {showRussian && <p className="text-xs text-zinc-500 italic mt-2">{it.ru}</p>}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
        {s.infoCard && <GniInfoCard infoCard={s.infoCard} showRussian={showRussian} isDark={isDark} />}
        </React.Fragment>
      ))}

      {chapter.summary && (
        <SectionCard isDark={isDark}>
          <div className={`p-6 border-b flex items-center ${isDark ? 'bg-zinc-800/50 border-zinc-800' : 'bg-pink-50 border-slate-200'}`}>
            <CheckCircle className="text-pink-500 mr-3" />
            <div>
              <h4 className="text-xl font-bold">{chapter.summary.title}</h4>
              {showRussian && <p className="text-zinc-500 text-sm mt-1">{chapter.summary.ruTitle}</p>}
            </div>
          </div>
          <div className="p-6 md:p-8 space-y-6">
            {chapter.summary.sections.map((section, i) => (
              <div key={i} className={`p-5 rounded-2xl ${isDark ? 'bg-zinc-800' : 'bg-slate-50'}`}>
                <h5 className={`font-black mb-1 ${isDark ? 'text-pink-300' : 'text-pink-700'}`}>{section.number} {section.title}</h5>
                {showRussian && <p className="text-xs text-zinc-500 mb-4">{section.ruTitle}</p>}
                <ul className="space-y-3">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex gap-3">
                      <span className="w-2 h-2 rounded-full bg-pink-500 mt-2 flex-shrink-0" />
                      <div>
                        <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>{item.ko}</p>
                        {showRussian && <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{item.ru}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* ?뚯븘?먮㈃ 醫뗭븘??*/}
      {chapter.didYouKnow && (
        <SectionCard isDark={isDark}>
          <div className={`p-6 border-b flex items-center ${isDark ? 'bg-zinc-800/50 border-zinc-800' : 'bg-blue-50 border-slate-200'}`}>
            <Globe className="text-blue-500 mr-3" />
            <div>
              <h4 className="text-xl font-bold">알아두면 좋아요 — {chapter.didYouKnow.title}</h4>
              {showRussian && <p className="text-zinc-500 text-sm mt-1">{chapter.didYouKnow.ruTitle}</p>}
            </div>
          </div>
          <div className="p-6 md:p-8">
            <p className={`mb-2 font-medium ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>{chapter.didYouKnow.intro}</p>
            {showRussian && <p className="text-sm text-zinc-500 italic mb-6">{chapter.didYouKnow.ruIntro}</p>}
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              {chapter.didYouKnow.items.map((it, i) => (
                <div key={i} className={`p-5 rounded-2xl border-l-4 border-blue-500 ${isDark ? 'bg-zinc-800' : 'bg-slate-50'}`}>
                  <div className="font-black text-base mb-2">{it.country}</div>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>{it.ko}</p>
                  {showRussian && <p className="text-xs text-zinc-500 italic mt-2 pt-2 border-t border-dashed border-slate-300">{it.ru}</p>}
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      )}

      {/* ?댁빞湲??섎늻湲?*/}
      {chapter.storyBox && (
        <div className="bg-gradient-to-br from-zinc-700 to-zinc-900 rounded-3xl p-8 text-zinc-300 shadow-xl relative overflow-hidden">
          <Newspaper size={120} className="absolute -right-6 -bottom-6 opacity-10" />
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <Newspaper className="mr-2" />
              <span className="text-xs font-black uppercase tracking-widest opacity-80">이야기 나누기 · Кейс</span>
            </div>
            <h4 className="text-2xl font-black mb-3 leading-tight">{chapter.storyBox.title}</h4>
            {showRussian && <p className="text-zinc-300 text-sm font-medium mb-5">{chapter.storyBox.ruTitle}</p>}
            <p className="leading-relaxed opacity-95">{chapter.storyBox.text}</p>
            {showRussian && <p className="leading-relaxed text-sm opacity-80 mt-4 pt-4 border-t border-white/20">{chapter.storyBox.ru}</p>}
            <div className="text-xs opacity-60 mt-4">[출처] {chapter.storyBox.source}</div>
          </div>
        </div>
      )}
    </div>
  );
};

const tbPagesMap = {
  // 제1편 사회
  1:  ['tb-016','tb-017','tb-018','tb-019'],
  2:  ['tb-020','tb-021','tb-022','tb-023'],
  3:  ['tb-024','tb-025','tb-026','tb-027'],
  4:  ['tb-028','tb-029','tb-030','tb-031'],
  5:  ['tb-032','tb-033','tb-034','tb-035'],
  6:  ['tb-036','tb-037','tb-038','tb-039'],
  7:  ['tb-040','tb-041','tb-042','tb-043'],
  8:  ['tb-044','tb-045','tb-046','tb-047'],
  // 제2편 교육
  9:  ['tb-054','tb-055','tb-056','tb-057'],
  10: ['tb-058','tb-059','tb-060','tb-061'],
  11: ['tb-062','tb-063','tb-064','tb-065'],
  12: ['tb-066','tb-067','tb-068','tb-069'],
  // 제3편 문화
  13: ['tb-076','tb-077','tb-078','tb-079'],
  14: ['tb-080','tb-081','tb-082','tb-083'],
  15: ['tb-084','tb-085','tb-086','tb-087'],
  16: ['tb-088','tb-089','tb-090','tb-091'],
  17: ['tb-092','tb-093','tb-094','tb-095'],
  18: ['tb-096','tb-097','tb-098','tb-099'],
  19: ['tb-100','tb-101','tb-102','tb-103'],
  // 제4편 정치
  20: ['tb-110','tb-111','tb-112','tb-113'],
  21: ['tb-114','tb-115','tb-116','tb-117'],
  22: ['tb-118','tb-119','tb-120','tb-121'],
  23: ['tb-122','tb-123','tb-124','tb-125'],
  24: ['tb-126','tb-127','tb-128','tb-129'],
  // 제5편 경제
  25: ['tb-136','tb-137','tb-138','tb-139'],
  26: ['tb-140','tb-141','tb-142','tb-143'],
  27: ['tb-144','tb-145','tb-146','tb-147'],
  28: ['tb-148','tb-149','tb-150','tb-151'],
  29: ['tb-152','tb-153','tb-154','tb-155'],
  // 제6편 법
  30: ['tb-162','tb-163','tb-164','tb-165'],
  31: ['tb-166','tb-167','tb-168','tb-169'],
  32: ['tb-170','tb-171','tb-172','tb-173'],
  33: ['tb-174','tb-175','tb-176','tb-177'],
  34: ['tb-178','tb-179','tb-180','tb-181'],
  35: ['tb-182','tb-183','tb-184','tb-185'],
  36: ['tb-186','tb-187','tb-188','tb-189'],
  37: ['tb-190','tb-191','tb-192','tb-193'],
  // 제7편 역사
  38: ['tb-200','tb-201','tb-202','tb-203'],
  39: ['tb-204','tb-205','tb-206','tb-207'],
  40: ['tb-208','tb-209','tb-210','tb-211'],
  41: ['tb-212','tb-213','tb-214','tb-215'],
  42: ['tb-216','tb-217','tb-218','tb-219'],
  43: ['tb-220','tb-221','tb-222','tb-223'],
  44: ['tb-224','tb-225','tb-226','tb-227'],
  // 제8편 지리
  45: ['tb-234','tb-235','tb-236','tb-237'],
  46: ['tb-238','tb-239','tb-240','tb-241'],
  47: ['tb-242','tb-243','tb-244','tb-245'],
  48: ['tb-246','tb-247','tb-248','tb-249'],
  49: ['tb-250','tb-251','tb-252','tb-253'],
  50: ['tb-254','tb-255','tb-256','tb-257'],
};
const tbImg = (name) => `/img2/${name}.png`;

const lruSave = (key, value) => {
  const LRU = 'kiip_lru';
  let lru = [];
  try { lru = JSON.parse(localStorage.getItem(LRU) || '[]'); } catch(e) {}
  lru = lru.filter(k => k !== key);
  lru.push(key);
  const attempt = () => {
    try {
      localStorage.setItem(key, value);
      localStorage.setItem(LRU, JSON.stringify(lru));
    } catch(e) {
      const oldest = lru.shift();
      if (oldest) { localStorage.removeItem(oldest); attempt(); }
    }
  };
  attempt();
};

const DRAW_COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899','#ffffff','#000000'];
const DRAW_SIZES = [2, 5, 10, 18];

const TextbookImages = ({ chapterNum, pages: pagesProp, isDark }) => {
  const pages = pagesProp !== undefined ? pagesProp : (tbPagesMap[chapterNum] || []);
  const [pageIdx, setPageIdx] = useState(0);
  const [drawMode, setDrawMode] = useState(true);
  const [color, setColor] = useState('#ef4444');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState('pen');
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPos = useRef(null);
  const store = useRef({});
  const [textBox, setTextBox] = useState(null);
  const [textVal, setTextVal] = useState('');
  const textRef = useRef(null);

  useEffect(() => {
    store.current = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith('kiip_draw_tb_')) store.current[k.slice(13)] = localStorage.getItem(k);
    }
  }, []);

  useEffect(() => { setPageIdx(0); }, [chapterNum]);

  const pageName = pages[pageIdx];

  const saveCanvas = () => {
    if (canvasRef.current && pageName) {
      const d = canvasRef.current.toDataURL();
      store.current[pageName] = d;
      lruSave(`kiip_draw_tb_${pageName}`, d);
      window.dispatchEvent(new CustomEvent('kiip_draw_update'));
    }
  };

  const restoreCanvas = (name) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const saved = store.current[name];
    if (saved) { const i = new Image(); i.onload = () => ctx.drawImage(i, 0, 0); i.src = saved; }
  };

  const handleImgLoad = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    canvas.width = img.naturalWidth || img.offsetWidth;
    canvas.height = img.naturalHeight || img.offsetHeight;
    restoreCanvas(pageName);
  };

  useEffect(() => { restoreCanvas(pageName); }, [pageName]);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.ch !== chapterNum) return;
      store.current = {};
      restoreCanvas(pageName);
    };
    window.addEventListener('kiip_draw_clear', handler);
    return () => window.removeEventListener('kiip_draw_clear', handler);
  }, [chapterNum, pageName]);

  const goTo = (newIdx) => { saveCanvas(); setPageIdx(newIdx); };

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width, sy = canvas.height / rect.height;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (cx - rect.left) * sx, y: (cy - rect.top) * sy };
  };

  const startDraw = (e) => {
    if (!drawMode) return;
    e.preventDefault();
    if (tool === 'text') {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      const pos = getPos(e);
      setTextBox({ screenX: cx - rect.left, screenY: cy - rect.top, canvasX: pos.x, canvasY: pos.y });
      setTextVal('');
      return;
    }
    isDrawingRef.current = true;
    lastPos.current = getPos(e);
  };

  const doDraw = (e) => {
    if (!drawMode || !isDrawingRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 5;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
    }
    ctx.stroke();
    lastPos.current = pos;
  };

  const endDraw = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    saveCanvas();
  };

  const clearPage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    delete store.current[pageName];
    localStorage.removeItem(`kiip_draw_tb_${pageName}`);
    window.dispatchEvent(new CustomEvent('kiip_draw_update'));
  };

  const displayFontSize = {2: 12, 5: 18, 10: 28, 18: 44}[brushSize] || 18;

  const commitText = () => {
    if (!textVal.trim() || !textBox) { setTextBox(null); setTextVal(''); return; }
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    const scale = canvas.width / rect.width;
    const canvasFontSize = displayFontSize * scale;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = color;
    ctx.font = `bold ${canvasFontSize}px sans-serif`;
    ctx.textBaseline = 'top';
    textVal.split('\n').forEach((line, i) => {
      ctx.fillText(line, textBox.canvasX, textBox.canvasY + i * canvasFontSize * 1.2);
    });
    setTextBox(null);
    setTextVal('');
    saveCanvas();
  };

  if (!pages.length) return (
    <div className={`rounded-3xl border p-12 text-center ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200 text-zinc-500'}`}>
      <BookOpen size={40} className="mx-auto mb-4 opacity-40" />
      <p className="font-bold">Страницы для этой главы не найдены</p>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-300">
      <div className={`rounded-3xl border overflow-hidden shadow-xl ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
        {/* Navigation bar */}
        <div className={`px-6 py-4 border-b flex items-center justify-between gap-3 flex-wrap ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
          <span className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Стр. {pageIdx + 1} / {pages.length} · {pageName}
          </span>
          <div className="flex gap-2">
            <button onClick={() => goTo(pageIdx - 1)} disabled={pageIdx === 0}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-slate-100 hover:bg-slate-200'}`}>
              ← Назад
            </button>
            <button onClick={() => goTo(pageIdx + 1)} disabled={pageIdx === pages.length - 1}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white ${isDark ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
              Далее →
            </button>
          </div>
        </div>

        {/* Drawing toolbar */}
        <div className={`px-5 py-3 border-b flex items-center gap-3 flex-wrap ${isDark ? 'border-zinc-800 bg-zinc-800/40' : 'border-slate-200 bg-slate-50'}`}>
          <button onClick={() => setDrawMode(v => !v)}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${drawMode ? 'bg-indigo-500 text-white shadow-md' : isDark ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
            ✏️ {drawMode ? 'Режим рисования' : 'Рисовать'}
          </button>
          {drawMode && <>
            <div className="flex gap-1.5 items-center">
              {DRAW_COLORS.map(c => (
                <button key={c} onClick={() => { setColor(c); if (tool !== 'text') setTool('pen'); }}
                  style={{ backgroundColor: c }}
                  className={`w-5 h-5 rounded-full border transition-transform ${color === c && tool !== 'eraser' ? 'scale-125 ring-2 ring-indigo-400 ring-offset-1' : 'hover:scale-110 border-transparent'} ${c === '#ffffff' ? 'border-zinc-400' : ''}`}
                />
              ))}
            </div>
            <div className={`w-px h-5 ${isDark ? 'bg-zinc-600' : 'bg-slate-300'}`} />
            <div className="flex gap-1">
              {DRAW_SIZES.map(s => (
                <button key={s} onClick={() => { setBrushSize(s); if (tool !== 'text') setTool('pen'); }}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${brushSize === s && tool !== 'eraser' ? 'bg-indigo-500 text-white' : isDark ? 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}>
                  <span className="rounded-full bg-current block" style={{ width: Math.min(s + 2, 14), height: Math.min(s + 2, 14) }} />
                </button>
              ))}
            </div>
            <div className={`w-px h-5 ${isDark ? 'bg-zinc-600' : 'bg-slate-300'}`} />
            <button onClick={() => setTool(t => t === 'eraser' ? 'pen' : 'eraser')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${tool === 'eraser' ? 'bg-amber-500 text-white' : isDark ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
              🧹 Ластик
            </button>
            <button onClick={() => setTool(t => t === 'text' ? 'pen' : 'text')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${tool === 'text' ? 'bg-blue-500 text-white' : isDark ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
              T Текст
            </button>
            <button onClick={clearPage}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${isDark ? 'bg-zinc-700 text-zinc-300 hover:bg-red-900/50 hover:text-red-400' : 'bg-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-500'}`}>
              🗑 Очистить
            </button>
          </>}
        </div>

        {/* Image + canvas overlay */}
        <div className="relative">
          <img ref={imgRef} src={tbImg(pageName)} alt={`Учебник гл.${chapterNum} стр.${pageIdx + 1}`}
            className="w-full block" onLoad={handleImgLoad} />
          <canvas ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ cursor: drawMode ? (tool === 'eraser' ? 'cell' : tool === 'text' ? 'text' : 'crosshair') : 'default', touchAction: drawMode ? 'none' : 'auto', pointerEvents: drawMode && !textBox ? 'auto' : 'none' }}
            onMouseDown={startDraw} onMouseMove={doDraw} onMouseUp={endDraw} onMouseLeave={endDraw}
            onTouchStart={startDraw} onTouchMove={doDraw} onTouchEnd={endDraw}
          />
          {textBox && (
            <textarea
              ref={textRef}
              autoFocus
              value={textVal}
              onChange={e => setTextVal(e.target.value)}
              onBlur={commitText}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitText(); }
                if (e.key === 'Escape') { setTextBox(null); setTextVal(''); }
              }}
              style={{
                position: 'absolute',
                left: textBox.screenX,
                top: textBox.screenY,
                fontSize: `${displayFontSize}px`,
                color: color,
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: `1.5px dashed ${color}`,
                padding: '2px 6px',
                resize: 'none',
                outline: 'none',
                zIndex: 20,
                minWidth: 80,
                fontWeight: 'bold',
                lineHeight: 1.3,
                fontFamily: 'sans-serif',
              }}
              rows={2}
            />
          )}
        </div>
      </div>

      {pages.length > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <button onClick={() => goTo(pageIdx - 1)} disabled={pageIdx === 0}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'}`}>
            ← Назад
          </button>
          <div className="flex gap-2">
            {pages.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${pageIdx === i ? (isDark ? 'bg-white scale-125' : 'bg-blue-600 scale-125') : (isDark ? 'bg-zinc-700' : 'bg-slate-300')}`}
              />
            ))}
          </div>
          <button onClick={() => goTo(pageIdx + 1)} disabled={pageIdx === pages.length - 1}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white ${isDark ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
            Далее →
          </button>
        </div>
      )}
    </div>
  );
};

const wbPagesMap = {};
const wbImg = (n) => `/img2/wb-${String(n).padStart(3,'0')}.png`;

const wbReviewPagesMap = {};
const prTitlePagesMap = {
  1: ['tb-014'], 2: ['tb-052'], 3: ['tb-074'],
  4: ['tb-108'], 5: ['tb-134'], 6: ['tb-160'],
  7: ['tb-198'], 8: ['tb-232'],
};
const prTbPagesMap = {
  1: ['tb-048','tb-049','tb-050','tb-051','tb-052','tb-053'],
  2: ['tb-070','tb-071','tb-072','tb-073','tb-074','tb-075'],
  3: ['tb-104','tb-105','tb-106','tb-107','tb-108','tb-109'],
  4: ['tb-130','tb-131','tb-132','tb-133','tb-134','tb-135'],
  5: ['tb-156','tb-157','tb-158','tb-159','tb-160','tb-161'],
  6: ['tb-194','tb-195','tb-196','tb-197','tb-198','tb-199'],
  7: ['tb-228','tb-229','tb-230','tb-231','tb-232','tb-233'],
  8: ['tb-258','tb-259','tb-260','tb-261'],
};

const WorkbookImages = ({ chapterNum, pages: pagesProp, isDark }) => {
  const pages = pagesProp !== undefined ? pagesProp : (wbPagesMap[chapterNum] || []);
  const [pageIdx, setPageIdx] = useState(0);
  const [drawMode, setDrawMode] = useState(true);
  const [color, setColor] = useState('#ef4444');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState('pen');
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPos = useRef(null);
  const store = useRef({});
  const [textBox, setTextBox] = useState(null);
  const [textVal, setTextVal] = useState('');
  const textRef = useRef(null);

  useEffect(() => {
    store.current = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith('kiip_draw_wb_')) store.current[k.slice(13)] = localStorage.getItem(k);
    }
  }, []);

  useEffect(() => { setPageIdx(0); }, [chapterNum]);

  const pageNum = pages[pageIdx];
  const pageKey = pageNum != null ? String(pageNum) : null;

  const saveCanvas = () => {
    if (canvasRef.current && pageKey) {
      const d = canvasRef.current.toDataURL();
      store.current[pageKey] = d;
      lruSave(`kiip_draw_wb_${pageKey}`, d);
      window.dispatchEvent(new CustomEvent('kiip_draw_update'));
    }
  };

  const restoreCanvas = (key) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const saved = store.current[key];
    if (saved) { const i = new Image(); i.onload = () => ctx.drawImage(i, 0, 0); i.src = saved; }
  };

  const handleImgLoad = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    canvas.width = img.naturalWidth || img.offsetWidth;
    canvas.height = img.naturalHeight || img.offsetHeight;
    restoreCanvas(pageKey);
  };

  useEffect(() => { restoreCanvas(pageKey); }, [pageKey]);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.ch !== chapterNum) return;
      store.current = {};
      restoreCanvas(pageKey);
    };
    window.addEventListener('kiip_draw_clear', handler);
    return () => window.removeEventListener('kiip_draw_clear', handler);
  }, [chapterNum, pageKey]);

  const goTo = (newIdx) => { saveCanvas(); setPageIdx(newIdx); };

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width, sy = canvas.height / rect.height;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (cx - rect.left) * sx, y: (cy - rect.top) * sy };
  };

  const startDraw = (e) => {
    if (!drawMode) return;
    e.preventDefault();
    if (tool === 'text') {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      const pos = getPos(e);
      setTextBox({ screenX: cx - rect.left, screenY: cy - rect.top, canvasX: pos.x, canvasY: pos.y });
      setTextVal('');
      return;
    }
    isDrawingRef.current = true;
    lastPos.current = getPos(e);
  };

  const doDraw = (e) => {
    if (!drawMode || !isDrawingRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 5;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
    }
    ctx.stroke();
    lastPos.current = pos;
  };

  const endDraw = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    saveCanvas();
  };

  const clearPage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    delete store.current[pageKey];
    localStorage.removeItem(`kiip_draw_wb_${pageKey}`);
    window.dispatchEvent(new CustomEvent('kiip_draw_update'));
  };

  const displayFontSize = {2: 12, 5: 18, 10: 28, 18: 44}[brushSize] || 18;

  const commitText = () => {
    if (!textVal.trim() || !textBox) { setTextBox(null); setTextVal(''); return; }
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    const scale = canvas.width / rect.width;
    const canvasFontSize = displayFontSize * scale;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = color;
    ctx.font = `bold ${canvasFontSize}px sans-serif`;
    ctx.textBaseline = 'top';
    textVal.split('\n').forEach((line, i) => {
      ctx.fillText(line, textBox.canvasX, textBox.canvasY + i * canvasFontSize * 1.2);
    });
    setTextBox(null);
    setTextVal('');
    saveCanvas();
  };

  if (!pages.length) return (
    <div className={`rounded-3xl border p-12 text-center ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200 text-zinc-500'}`}>
      <FileText size={40} className="mx-auto mb-4 opacity-40" />
      <p className="font-bold">Страницы для этой главы не найдены</p>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-300">
      <div className={`rounded-3xl border overflow-hidden shadow-xl ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
        <div className={`px-6 py-4 border-b flex items-center justify-between gap-3 flex-wrap ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
          <span className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Стр. {pageIdx + 1} / {pages.length} · wb-{String(pageNum).padStart(3,'0')}
          </span>
          <div className="flex gap-2">
            <button onClick={() => goTo(pageIdx - 1)} disabled={pageIdx === 0}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-slate-100 hover:bg-slate-200'}`}>
              ← Назад
            </button>
            <button onClick={() => goTo(pageIdx + 1)} disabled={pageIdx === pages.length - 1}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white ${isDark ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
              Далее →
            </button>
          </div>
        </div>

        <div className={`px-5 py-3 border-b flex items-center gap-3 flex-wrap ${isDark ? 'border-zinc-800 bg-zinc-800/40' : 'border-slate-200 bg-slate-50'}`}>
          <button onClick={() => setDrawMode(v => !v)}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${drawMode ? 'bg-indigo-500 text-white shadow-md' : isDark ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
            ✏️ {drawMode ? 'Режим рисования' : 'Рисовать'}
          </button>
          {drawMode && <>
            <div className="flex gap-1.5 items-center">
              {DRAW_COLORS.map(c => (
                <button key={c} onClick={() => { setColor(c); if (tool !== 'text') setTool('pen'); }}
                  style={{ backgroundColor: c }}
                  className={`w-5 h-5 rounded-full border transition-transform ${color === c && tool !== 'eraser' ? 'scale-125 ring-2 ring-indigo-400 ring-offset-1' : 'hover:scale-110 border-transparent'} ${c === '#ffffff' ? 'border-zinc-400' : ''}`}
                />
              ))}
            </div>
            <div className={`w-px h-5 ${isDark ? 'bg-zinc-600' : 'bg-slate-300'}`} />
            <div className="flex gap-1">
              {DRAW_SIZES.map(s => (
                <button key={s} onClick={() => { setBrushSize(s); if (tool !== 'text') setTool('pen'); }}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${brushSize === s && tool !== 'eraser' ? 'bg-indigo-500 text-white' : isDark ? 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}>
                  <span className="rounded-full bg-current block" style={{ width: Math.min(s + 2, 14), height: Math.min(s + 2, 14) }} />
                </button>
              ))}
            </div>
            <div className={`w-px h-5 ${isDark ? 'bg-zinc-600' : 'bg-slate-300'}`} />
            <button onClick={() => setTool(t => t === 'eraser' ? 'pen' : 'eraser')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${tool === 'eraser' ? 'bg-amber-500 text-white' : isDark ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
              🧹 Ластик
            </button>
            <button onClick={() => setTool(t => t === 'text' ? 'pen' : 'text')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${tool === 'text' ? 'bg-blue-500 text-white' : isDark ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
              T Текст
            </button>
            <button onClick={clearPage}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${isDark ? 'bg-zinc-700 text-zinc-300 hover:bg-red-900/50 hover:text-red-400' : 'bg-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-500'}`}>
              🗑 Очистить
            </button>
          </>}
        </div>

        <div className="relative">
          <img ref={imgRef} src={wbImg(pageNum)} alt={`Тетрадь стр. ${pageNum}`}
            className="w-full block" onLoad={handleImgLoad} />
          <canvas ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ cursor: drawMode ? (tool === 'eraser' ? 'cell' : tool === 'text' ? 'text' : 'crosshair') : 'default', touchAction: drawMode ? 'none' : 'auto', pointerEvents: drawMode && !textBox ? 'auto' : 'none' }}
            onMouseDown={startDraw} onMouseMove={doDraw} onMouseUp={endDraw} onMouseLeave={endDraw}
            onTouchStart={startDraw} onTouchMove={doDraw} onTouchEnd={endDraw}
          />
          {textBox && (
            <textarea
              ref={textRef}
              autoFocus
              value={textVal}
              onChange={e => setTextVal(e.target.value)}
              onBlur={commitText}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitText(); }
                if (e.key === 'Escape') { setTextBox(null); setTextVal(''); }
              }}
              style={{
                position: 'absolute',
                left: textBox.screenX,
                top: textBox.screenY,
                fontSize: `${displayFontSize}px`,
                color: color,
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: `1.5px dashed ${color}`,
                padding: '2px 6px',
                resize: 'none',
                outline: 'none',
                zIndex: 20,
                minWidth: 80,
                fontWeight: 'bold',
                lineHeight: 1.3,
                fontFamily: 'sans-serif',
              }}
              rows={2}
            />
          )}
        </div>
      </div>

      {pages.length > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <button onClick={() => goTo(pageIdx - 1)} disabled={pageIdx === 0}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'}`}>
            ← Назад
          </button>
          <div className="flex gap-2">
            {pages.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${pageIdx === i ? (isDark ? 'bg-white scale-125' : 'bg-blue-600 scale-125') : (isDark ? 'bg-zinc-700' : 'bg-slate-300')}`}
              />
            ))}
          </div>
          <button onClick={() => goTo(pageIdx + 1)} disabled={pageIdx === pages.length - 1}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white ${isDark ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
            Далее →
          </button>
        </div>
      )}
    </div>
  );
};

const Workbook = ({ chapter, showRussian, isDark }) => {
  const [wbMode, setWbMode] = useState('quiz');
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const switchMode = (m) => { setWbMode(m); setStep(0); setSelected(null); setScore(0); setDone(false); };

  const btnCls = (m) => `px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-1.5 ${
    wbMode === m
      ? isDark ? 'bg-zinc-700 text-zinc-300 shadow-md' : 'bg-white text-blue-600 shadow-md'
      : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-500 hover:text-slate-700'
  }`;

  const modeToggle = (
    <div className={`flex flex-wrap gap-1 p-1 rounded-2xl w-fit ${isDark ? 'bg-zinc-800' : 'bg-slate-100'}`}>
      <button onClick={() => switchMode('quiz')} className={btnCls('quiz')}><FileText size={14} /> Тест</button>
      <button onClick={() => switchMode('speaking')} className={btnCls('speaking')}><Mic size={14} /> 구술형</button>
      <button onClick={() => switchMode('writing')} className={btnCls('writing')}><Languages size={14} /> 작문형</button>
      <button onClick={() => switchMode('original')} className={btnCls('original')}><BookOpen size={14} /> Оригинал</button>
    </div>
  );

  const currentQ = chapter?.quiz?.[step];
  const shuffledOpts = useMemo(() => {
    if (!currentQ) return [];
    return currentQ.options
      .map((opt, i) => ({ opt, ru: currentQ.ruOptions?.[i] || '', origIdx: i }))
      .sort(() => Math.random() - 0.5);
  }, [step, wbMode]);

  if (wbMode === 'speaking') {
    if (!chapter?.gusulhyung) return (
      <div className="max-w-2xl mx-auto space-y-6">
        {modeToggle}
        <div className={`rounded-3xl border p-12 text-center ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200 text-zinc-500'}`}>
          <Mic size={40} className="mx-auto mb-4 opacity-40" />
          <p className="font-bold text-lg">구술형 문제가 아직 없습니다</p>
        </div>
      </div>
    );
    const gs = chapter.gusulhyung;
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {modeToggle}
        <SectionCard isDark={isDark}>
          <div className={`p-5 border-b flex items-center gap-3 ${isDark ? 'bg-zinc-800/50 border-zinc-800' : 'bg-sky-50 border-slate-200'}`}>
            <Mic className="text-sky-500" size={20} />
            <div>
              <h4 className="font-black text-lg">구술형</h4>
              {showRussian && <p className="text-xs text-zinc-500">Устная практика</p>}
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div className={`p-5 rounded-2xl text-sm leading-relaxed ${isDark ? 'bg-zinc-800 text-zinc-200' : 'bg-sky-50 text-slate-700'}`}>
              <p className="font-black text-xs text-sky-500 mb-2 uppercase tracking-wide">읽기 지문</p>
              <p>{gs.passage}</p>
              {showRussian && <p className="mt-3 text-xs text-zinc-500 border-t border-dashed border-slate-300/50 pt-3">{gs.ruPassage}</p>}
            </div>
            <div className="space-y-3">
              {gs.questions.map((q, i) => (
                <div key={i} className={`p-4 rounded-2xl border-l-4 border-sky-400 ${isDark ? 'bg-zinc-800' : 'bg-white border border-slate-200'}`}>
                  <p className="font-black text-xs text-sky-500 mb-1">{i + 1}번</p>
                  <p className={`font-bold text-sm ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>{q}</p>
                  {showRussian && <p className="text-xs text-zinc-500 mt-1">{gs.ruQuestions[i]}</p>}
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
    );
  }

  if (wbMode === 'writing') {
    if (!chapter?.jakmoohyung) return (
      <div className="max-w-2xl mx-auto space-y-6">
        {modeToggle}
        <div className={`rounded-3xl border p-12 text-center ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200 text-zinc-500'}`}>
          <Languages size={40} className="mx-auto mb-4 opacity-40" />
          <p className="font-bold text-lg">작문형 문제가 아직 없습니다</p>
        </div>
      </div>
    );
    const jk = chapter.jakmoohyung;
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {modeToggle}
        <SectionCard isDark={isDark}>
          <div className={`p-5 border-b flex items-center gap-3 ${isDark ? 'bg-zinc-800/50 border-zinc-800' : 'bg-violet-50 border-slate-200'}`}>
            <Languages className="text-violet-500" size={20} />
            <div>
              <h4 className="font-black text-lg">작문형</h4>
              {showRussian && <p className="text-xs text-zinc-500">Письменная практика</p>}
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div className={`p-4 rounded-2xl ${isDark ? 'bg-zinc-800' : 'bg-violet-50'}`}>
              <p className="font-black text-xs text-violet-500 mb-1 uppercase tracking-wide">제목 / Тема сочинения</p>
              <p className={`text-lg font-black ${isDark ? 'text-zinc-300' : 'text-slate-900'}`}>「{jk.title}」</p>
              {showRussian && <p className="text-sm text-zinc-500 mt-1">«{jk.ruTitle}»</p>}
            </div>
            <div>
              <p className={`text-xs font-black uppercase tracking-wide mb-3 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>포함할 내용 / Включите следующее:</p>
              <ul className="space-y-2">
                {jk.prompts.map((p, i) => (
                  <li key={i} className={`flex items-start gap-3 p-3 rounded-xl ${isDark ? 'bg-zinc-800' : 'bg-slate-50'}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5 ${isDark ? 'bg-violet-800 text-violet-300' : 'bg-violet-100 text-violet-700'}`}>{i + 1}</span>
                    <div>
                      <p className={`font-bold text-sm ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>{p}</p>
                      {showRussian && <p className="text-xs text-zinc-500 mt-0.5">{jk.ruPrompts[i]}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <textarea
              rows={8}
              placeholder={`여기에 글을 쓰세요 (작문 답안지에는 제목을 생략하고 본문만 쓰세요)`}
              className={`w-full rounded-2xl border p-4 text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 ${isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-200 placeholder-zinc-600' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'}`}
            />
          </div>
        </SectionCard>
      </div>
    );
  }

  if (wbMode === 'original') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {modeToggle}
        <WorkbookImages chapterNum={chapter?.number} isDark={isDark} />
      </div>
    );
  }

  if (!chapter || !chapter.quiz) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {modeToggle}
        <div className={`rounded-3xl border p-12 text-center ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200 text-zinc-500'}`}>
          <FileText size={40} className="mx-auto mb-4 opacity-40" />
          <p className="font-bold text-lg">Задания этой главы пока в разработке</p>
        </div>
      </div>
    );
  }

  const total = chapter.quiz.length;
  const q = chapter.quiz[step];

  const onPick = (origIdx) => {
    if (selected !== null) return;
    setSelected(origIdx);
    if (origIdx === q.correct) setScore((s) => s + 1);
  };

  const onNext = () => {
    if (step + 1 >= total) {
      setDone(true);
    } else {
      setStep((s) => s + 1);
      setSelected(null);
    }
  };

  const onRestart = () => {
    setStep(0); setSelected(null); setScore(0); setDone(false);
  };

  if (done) {
    const pct = Math.round((score / total) * 100);
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {modeToggle}
        <div className="animate-in zoom-in-95 duration-300">
          <div className={`rounded-3xl border shadow-xl p-10 text-center ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'} text-white shadow-2xl`}>
              <Award size={48} />
            </div>
            <h3 className={`text-3xl font-black mb-2 ${isDark ? 'text-zinc-300' : 'text-slate-900'}`}>Результат: {score} / {total}</h3>
            <p className="text-zinc-500 mb-8">{pct}% правильных ответов</p>
            <button onClick={onRestart} className={`text-white font-bold px-8 py-4 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all inline-flex items-center ${isDark ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
              <RotateCcw size={18} className="mr-2" /> Пройти ещё раз
            </button>
          </div>
        </div>
      </div>
    );
  }

  const optClass = (i) => {
    const base = 'w-full text-left p-5 rounded-2xl border-2 transition-all font-bold flex items-center group';
    if (selected === null) {
      return `${base} ${isDark ? 'border-zinc-800 hover:border-zinc-500 hover:bg-zinc-800 text-zinc-300' : 'border-slate-100 hover:border-blue-400 hover:bg-blue-50 text-slate-700'}`;
    }
    if (i === q.correct) return `${base} border-green-500 bg-green-500/10 text-green-500`;
    if (i === selected) return `${base} border-red-500 bg-red-500/10 text-red-500`;
    return `${base} ${isDark ? 'border-zinc-800 text-zinc-500' : 'border-slate-100 text-zinc-400'}`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {modeToggle}
      <div className="animate-in zoom-in-95 duration-300">
        <div className={`rounded-3xl border shadow-xl p-8 md:p-10 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-6">
            <span className={`text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-blue-50 text-blue-600'}`}>주요 내용 정리</span>
            <span className="text-zinc-500 text-sm font-bold">Вопрос {step + 1} / {total}</span>
          </div>

          <div className={`w-full h-1.5 rounded-full overflow-hidden mb-8 ${isDark ? 'bg-zinc-800' : 'bg-slate-100'}`}>
            <div className={`${isDark ? 'bg-zinc-500' : 'bg-blue-500'} h-full transition-all duration-300`} style={{ width: `${((step + (selected !== null ? 1 : 0)) / total) * 100}%` }} />
          </div>

          <h3 className={`text-xl md:text-2xl font-bold mb-3 leading-snug ${isDark ? 'text-zinc-300' : 'text-slate-900'}`}>{q.q}</h3>
          {showRussian && <p className="text-zinc-500 mb-8 font-medium">{q.ruQ}</p>}
          {q.prompt && (
            <div className={`mb-6 p-5 rounded-2xl border leading-relaxed text-sm font-medium ${isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
              <div className={`text-xs font-black mb-2 ${isDark ? 'text-zinc-400' : 'text-blue-500'}`}>보기</div>
              <p>{q.prompt}</p>
              {showRussian && q.ruPrompt && <p className="mt-3 pt-3 border-t border-dashed border-slate-500/30 text-zinc-500">{q.ruPrompt}</p>}
            </div>
          )}

          <div className="space-y-3">
            {shuffledOpts.map((o, i) => (
              <button key={o.origIdx} onClick={() => onPick(o.origIdx)} className={optClass(o.origIdx)}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 text-sm transition-colors flex-shrink-0 ${
                  selected === null
                    ? isDark ? 'bg-zinc-800 group-hover:bg-zinc-700' : 'bg-slate-100 group-hover:bg-blue-600 group-hover:text-white'
                    : o.origIdx === q.correct ? 'bg-green-500 text-white'
                    : o.origIdx === selected ? 'bg-red-500 text-white'
                    : isDark ? 'bg-zinc-800' : 'bg-slate-100'
                }`}>
                  {i + 1}
                </span>
                <span className="flex-1">
                  <span className="block">{o.opt}</span>
                  {showRussian && o.ru && (
                    <span className="block mt-1 text-sm font-medium opacity-70">{o.ru}</span>
                  )}
                </span>
                {selected !== null && o.origIdx === q.correct && <CheckCircle size={20} className="text-green-500 ml-2" />}
              </button>
            ))}
          </div>

          {selected !== null && q.explain && (
            <div className={`mt-6 p-4 rounded-xl border-l-4 ${selected === q.correct ? 'border-green-500 bg-green-500/10' : 'border-amber-500 bg-amber-500/10'}`}>
              <div className="text-xs font-black uppercase tracking-wider mb-1 text-zinc-500">Пояснение</div>
              <p className="text-sm font-medium">{q.explain}</p>
            </div>
          )}

          <div className="mt-8 flex justify-end items-center">
            <button
              onClick={onNext}
              disabled={selected === null}
              className={`text-white font-bold px-10 py-4 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 ${isDark ? 'bg-zinc-700 shadow-zinc-900/20 hover:bg-zinc-600' : 'bg-blue-600 shadow-blue-500/20 hover:bg-blue-700'}`}
            >
              {step + 1 >= total ? 'Завершить' : 'Далее'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Flashcards = ({ chapter, isDark }) => {
  const [idx, setIdx] = useState(0);
  const [flip, setFlip] = useState(false);
  const [input, setInput] = useState('');
  const [cards, setCards] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    const raw = chapter?.flashcards;
    if (raw?.length) {
      setCards([...raw].sort(() => Math.random() - 0.5));
      setIdx(0);
      setFlip(false);
      setInput('');
    }
  }, [chapter]);

  if (!cards.length) {
    return (
      <div className={`max-w-md mx-auto rounded-3xl border p-12 text-center ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200 text-zinc-500'}`}>
        <Brain size={40} className="mx-auto mb-4 opacity-40" />
        <p className="font-bold">Карточки этой главы пока в разработке</p>
      </div>
    );
  }

  const c = cards[idx];
  const hasSplit = c.desc.includes(' · ');
  const koDesc = hasSplit ? c.desc.split(' · ')[0] : null;
  const ruFull = hasSplit ? c.desc.split(' · ').slice(1).join(' · ') : c.desc;
  const ruMatch = ruFull.match(/^(.+?)(?:\s—\s|;\s?|:\s)(.+)$/s);

  const focus = () => setTimeout(() => inputRef.current?.focus(), 0);
  const goNext = () => { setInput(''); setIdx((i) => (i + 1) % cards.length); focus(); };
  const goPrev = () => { setInput(''); setIdx((i) => (i - 1 + cards.length) % cards.length); focus(); };

  const norm = (s) => s.trim().toLowerCase().replace(/[.,!?;:]/g, '');

  const checkAnswer = () => {
    const val = norm(input);
    if (!val) return;
    let correct = false;
    if (!flip) {
      const ruBase = ruMatch ? ruMatch[1] : ruFull;
      correct = ruBase.split(/,| или /).map(s => norm(s)).some(o => o === val);
    } else {
      correct = norm(c.term) === val;
    }
    if (correct) {
      goNext();
    } else {
      setInput('');
    }
  };

  const txtCls = isDark ? 'text-zinc-300' : 'text-slate-500';
  const btnCls = `px-5 py-3 rounded-xl font-bold border transition-all ${txtCls} ${isDark ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-300">
      <button
        onClick={() => { setFlip((v) => !v); setInput(''); focus(); }}
        className={`w-full max-w-md aspect-[3/2] rounded-3xl shadow-2xl border flex flex-col items-center justify-center p-10 cursor-pointer hover:scale-[1.02] active:scale-95 transition-transform relative overflow-hidden ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'}`}
      >
        <div className="absolute top-6 left-8 text-zinc-500 font-black tracking-widest text-[10px] uppercase">
          Карточка термина · {idx + 1} / {cards.length}
        </div>
        {!flip ? (
          <>
            <div className={`text-5xl font-black mb-6 text-center ${txtCls}`}>{c.term}</div>
            <div className={`h-1.5 w-16 rounded-full ${isDark ? 'bg-zinc-500' : 'bg-blue-500'}`} />
          </>
        ) : (
          <div className="text-center px-4 space-y-3">
            {koDesc && (
              <p className={`font-bold text-base leading-relaxed ${txtCls}`}>{koDesc}</p>
            )}
            {ruMatch ? (
              <div className={`space-y-1 ${koDesc ? 'border-t pt-3' : ''} ${isDark ? 'border-zinc-700' : 'border-slate-200'}`}>
                <p className={`font-bold text-base ${txtCls}`}>{ruMatch[1]}</p>
                <p className={`text-sm leading-relaxed ${txtCls}`}>{ruMatch[2].charAt(0).toUpperCase() + ruMatch[2].slice(1)}</p>
              </div>
            ) : (
              <p className={`text-sm leading-relaxed ${txtCls}`}>{ruFull}</p>
            )}
          </div>
        )}
        <div className={`absolute bottom-8 right-8 ${isDark ? 'text-zinc-500/30' : 'text-blue-500/30'}`}>
          <Brain size={32} />
        </div>
      </button>

      <div className="mt-6 w-full max-w-md">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
          placeholder={!flip ? 'Введите перевод на русском...' : 'Введите слово по-корейски...'}
          className={`w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all ${isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300 placeholder-zinc-600 focus:border-zinc-500' : 'bg-white border-slate-200 text-slate-700 placeholder-slate-400 focus:border-slate-400'}`}
        />
      </div>

      <div className="mt-4 flex items-center space-x-3">
        <button onClick={goPrev} className={btnCls}>← Назад</button>
        <button onClick={checkAnswer} className={btnCls}>Проверить</button>
        <button onClick={goNext} className={btnCls}>Далее →</button>
      </div>
    </div>
  );
};

const Interview = ({ chapter, showRussian, isDark }) => {
  const [mode, setMode] = useState('ai'); // 'practice' | 'ai'
  const [style, setStyle] = useState('standard'); // 'soft' | 'standard' | 'strict'
  const [lang, setLang] = useState('mixed'); // 'mixed' | 'ru' | 'ko'
  const [copied, setCopied] = useState(false);

  if (!chapter?.interview) {
    return (
      <div className={`max-w-2xl mx-auto rounded-3xl border p-12 text-center ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200 text-slate-400'}`}>
        <Mic size={40} className="mx-auto mb-4 opacity-40" />
        <p className="font-bold">Интервью этой главы пока в разработке</p>
      </div>
    );
  }

  const { interview } = chapter;

  const buildPrompt = () => {
    const terms = chapter.flashcards?.slice(0, 8).map(f => `• ${f.term}`).join('\n') || '';
    const hints = interview.hints?.map(h => `• ${h}`).join('\n') || '';
    const styleText = { soft: 'дружелюбного помощника', standard: 'строгого, но справедливого преподавателя', strict: 'очень строгого экзаменатора без подсказок' }[style];
    const langInstruct = {
      mixed: 'Задавай вопросы на корейском, а объяснения и оценку давай на русском.',
      ru: 'Всё общение веди на русском языке.',
      ko: '모든 대화를 한국어로 진행해 주세요. 평가도 한국어로 해주세요.',
    }[lang];

    return `Ты — ${styleText} для подготовки к корейскому экзамену на натурализацию (귀화용 종합평가). ${langInstruct}

Тема: «${chapter.russianTitle}» (${chapter.title})

Ключевые термины темы:
${terms}

Главный вопрос интервью:
${interview.question}
(${interview.ru})

Ключевые пункты правильного ответа:
${hints}

Инструкция:
1. Начни с главного вопроса интервью выше.
2. Выслушай мой ответ и оцени его по трём критериям: содержание (0–5), точность (0–5), беглость/структура (0–5).
3. Задай 1–2 уточняющих вопроса по теме.
4. После 3–4 обменов подведи итог: что хорошо, что улучшить.
${style === 'strict' ? '5. Не давай подсказок и не исправляй до конца ответа.' : '5. Если я затрудняюсь, дай небольшую подсказку.'}

Начни прямо с вопроса интервью.`;
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(buildPrompt()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const modeBtnCls = (m) => `flex-1 py-2 rounded-xl font-bold text-sm transition-all ${mode === m
    ? isDark ? 'bg-zinc-700 text-zinc-200' : 'bg-white text-slate-800 shadow'
    : isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-slate-400 hover:text-slate-600'}`;

  const chipCls = (active) => `px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${active
    ? isDark ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-indigo-500 border-indigo-500 text-white'
    : isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'}`;

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-300 space-y-4">
      {/* Mode toggle */}
      <div className={`flex p-1 rounded-2xl gap-1 ${isDark ? 'bg-zinc-800' : 'bg-slate-100'}`}>
        <button onClick={() => setMode('ai')} className={modeBtnCls('ai')}>
          ✨ AI промпт
        </button>
        <button onClick={() => setMode('practice')} className={modeBtnCls('practice')}>
          Тренажёр
        </button>
      </div>

      {/* PRACTICE MODE */}
      {mode === 'practice' && (
        <div className={`rounded-3xl p-8 shadow-2xl relative overflow-hidden border ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-white border-slate-200 text-slate-700'}`}>
          <div className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl ${isDark ? 'bg-zinc-600/10' : 'bg-blue-600/5'}`} />
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-8">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${isDark ? 'bg-zinc-700' : 'bg-indigo-600'}`}>
                <Mic size={28} className="text-white" />
              </div>
              <div>
                <h4 className={`font-black text-xl tracking-tight ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>Тренажёр интервью</h4>
                <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Гл. {chapter.number} · {chapter.russianTitle}</p>
              </div>
            </div>
            <div className={`rounded-2xl p-6 mb-5 border ${isDark ? 'bg-zinc-800/80 border-zinc-700/50' : 'bg-slate-50 border-slate-200'}`}>
              <p className={`text-xs uppercase tracking-widest mb-3 font-black ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Вопрос от экзаменатора:</p>
              <p className={`text-lg font-bold leading-snug ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>"{interview.question}"</p>
              {showRussian && <p className={`mt-3 text-sm border-t pt-3 ${isDark ? 'text-zinc-400 border-zinc-700' : 'text-slate-500 border-slate-200'}`}>{interview.ru}</p>}
            </div>
            <div className={`rounded-2xl p-5 border ${isDark ? 'bg-zinc-800/40 border-zinc-700/40' : 'bg-slate-50 border-slate-100'}`}>
              <p className={`text-xs uppercase tracking-widest mb-3 font-black ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Подсказки для ответа:</p>
              <ul className="space-y-2">
                {interview.hints.map((h, i) => (
                  <li key={i} className={`flex text-sm ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                    <span className={`mr-2 flex-shrink-0 ${isDark ? 'text-zinc-500' : 'text-indigo-400'}`}>•</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* AI PROMPT MODE */}
      {mode === 'ai' && (
        <div className={`rounded-3xl p-6 border space-y-5 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
          <div>
            <p className={`text-xs font-black uppercase tracking-widest mb-3 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Стиль экзаменатора</p>
            <div className="flex gap-2 flex-wrap">
              {[['soft','😊 Мягкий'],['standard','📋 Стандартный'],['strict','🎯 Строгий']].map(([v,l]) => (
                <button key={v} onClick={() => setStyle(v)} className={chipCls(style === v)}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <p className={`text-xs font-black uppercase tracking-widest mb-3 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Язык общения</p>
            <div className="flex gap-2 flex-wrap">
              {[['mixed','🇰🇷 Вопросы на 한국어 / Оценка на RU'],['ru','🇷🇺 Всё на русском'],['ko','🇰🇷 Всё на корейском']].map(([v,l]) => (
                <button key={v} onClick={() => setLang(v)} className={chipCls(lang === v)}>{l}</button>
              ))}
            </div>
          </div>

          <div>
            <p className={`text-xs font-black uppercase tracking-widest mb-3 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Готовый промпт</p>
            <pre className={`text-xs leading-relaxed whitespace-pre-wrap rounded-2xl p-4 border max-h-72 overflow-y-auto ${isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
              {buildPrompt()}
            </pre>
          </div>

          <button onClick={copyPrompt}
            className={`w-full py-4 rounded-2xl font-black text-sm transition-all ${copied
              ? 'bg-emerald-600 text-white'
              : 'bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white'}`}>
            {copied ? '✓ Скопировано! Вставьте в ChatGPT / Gemini / Grok' : '📋 Скопировать промпт'}
          </button>

          <div className={`flex gap-2 flex-wrap justify-center`}>
            {[
              { label: 'ChatGPT', url: 'https://chat.openai.com' },
              { label: 'Gemini', url: 'https://gemini.google.com' },
              { label: 'Grok', url: 'https://grok.com' },
              { label: 'Claude', url: 'https://claude.ai' },
            ].map(s => (
              <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${isDark ? 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200' : 'border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700'}`}>
                {s.label} ↗
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Crossword = ({ crossword, showRussian, isDark }) => {
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);

  if (!crossword) return null;

  const normalizedAnswers = Object.fromEntries(
    crossword.words.map((w) => [w.id, revealed ? w.answer : (answers[w.id] || '')])
  );

  const letters = {};
  crossword.words.forEach((word) => {
    const value = normalizedAnswers[word.id] || '';
    [...word.answer].forEach((_, index) => {
      const row = word.direction === 'across' ? word.row : word.row + index;
      const col = word.direction === 'across' ? word.col + index : word.col;
      letters[`${row}-${col}`] = value[index] || '';
    });
  });

  const numbers = {};
  crossword.words.forEach((word) => {
    numbers[`${word.row}-${word.col}`] = numbers[`${word.row}-${word.col}`] || word.number;
  });

  const statusForWord = (word) => {
    const value = normalizedAnswers[word.id];
    if (!checked && !revealed) return '';
    if (!value) return '';
    return value.trim() === word.answer ? 'correct' : 'wrong';
  };

  const onAnswer = (id, value) => {
    setChecked(false);
    setRevealed(false);
    setAnswers((prev) => ({ ...prev, [id]: value.replace(/\s/g, '') }));
  };

  return (
    <SectionCard isDark={isDark}>
      <div className={`p-6 border-b ${isDark ? 'bg-zinc-800/50 border-zinc-800' : 'bg-amber-50 border-slate-200'}`}>
        <h4 className="text-xl font-black">가로세로 퀴즈</h4>
        {showRussian && <p className="text-sm text-zinc-500 mt-1">Интерактивный кроссворд по разделу</p>}
      </div>
      <div className="p-6 md:p-8 grid lg:grid-cols-[auto,1fr] gap-8">
        <div className="grid gap-1 self-start" style={{ gridTemplateColumns: `repeat(${crossword.cols}, minmax(0, 2.5rem))` }}>
          {Array.from({ length: crossword.rows * crossword.cols }).map((_, index) => {
            const row = Math.floor(index / crossword.cols);
            const col = index % crossword.cols;
            const key = `${row}-${col}`;
            const blocked = crossword.blocked.includes(key);
            return (
              <div
                key={key}
                className={`relative w-10 h-10 rounded-lg border flex items-center justify-center font-black text-lg ${
                  blocked
                    ? isDark ? 'bg-zinc-800 border-zinc-800' : 'bg-slate-100 border-slate-200'
                    : isDark ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                {!blocked && numbers[key] && <span className={`absolute top-0.5 left-1 text-[9px] ${isDark ? 'text-zinc-400' : 'text-blue-500'}`}>{numbers[key]}</span>}
                {!blocked && letters[key]}
              </div>
            );
          })}
        </div>

        <div className="space-y-6">
          {['across', 'down'].map((direction) => (
            <div key={direction}>
              <h5 className="font-black mb-3">{direction === 'across' ? '가로 열쇠' : '세로 열쇠'}</h5>
              <div className="space-y-3">
                {crossword.words.filter((w) => w.direction === direction).map((word) => {
                  const status = statusForWord(word);
                  return (
                    <div key={word.id} className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex gap-3">
                        <span className={`w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-black flex-shrink-0 ${isDark ? 'bg-zinc-700' : 'bg-blue-600'}`}>{word.number}</span>
                        <div className="flex-1">
                          <p className="font-bold text-sm">{word.clue}</p>
                          {showRussian && <p className="text-xs text-zinc-500 mt-1">{word.ruClue}</p>}
                          <div className="mt-3 flex gap-2">
                            <input
                              value={normalizedAnswers[word.id]}
                              onChange={(e) => onAnswer(word.id, e.target.value)}
                              maxLength={word.answer.length}
                              disabled={revealed}
                              className={`flex-1 rounded-xl border px-4 py-2 font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-200'
                              }`}
                              placeholder={`${word.answer.length}글자`}
                            />
                            {status === 'correct' && <span className="px-3 py-2 rounded-xl bg-green-500/10 text-green-500 font-black text-sm">OK</span>}
                            {status === 'wrong' && <span className="px-3 py-2 rounded-xl bg-red-500/10 text-red-500 font-black text-sm">!</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-3">
            <button onClick={() => setChecked(true)} className={`text-white px-5 py-3 rounded-xl font-black ${isDark ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-blue-600'}`}>Проверить</button>
            <button onClick={() => setRevealed(true)} className={`px-5 py-3 rounded-xl font-black border ${isDark ? 'border-zinc-700' : 'border-slate-200'}`}>Показать ответы</button>
            <button onClick={() => { setAnswers({}); setChecked(false); setRevealed(false); }} className={`px-5 py-3 rounded-xl font-black border ${isDark ? 'border-zinc-700' : 'border-slate-200'}`}>Сбросить</button>
          </div>
        </div>
      </div>
    </SectionCard>
  );
};

const PartReview = ({ review, partId, showRussian, isDark }) => {
  const [selected, setSelected] = useState({});
  const [prMode, setPrMode] = useState('content');
  const [origSrc, setOrigSrc] = useState('tb');
  useEffect(() => { setPrMode('content'); setOrigSrc('tb'); }, [partId]);

  const prBtnCls = (m) => `px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-1.5 ${
    prMode === m
      ? isDark ? 'bg-zinc-700 text-zinc-300 shadow-md' : 'bg-white text-blue-600 shadow-md'
      : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-500 hover:text-slate-700'
  }`;
  const srcBtnCls = (m) => `px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
    origSrc === m
      ? isDark ? 'bg-zinc-600 text-white shadow' : 'bg-blue-600 text-white shadow'
      : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-500 hover:text-slate-700'
  }`;

  const modeToggle = (
    <div className={`flex gap-1 p-1 rounded-2xl w-fit mb-6 ${isDark ? 'bg-zinc-800' : 'bg-slate-100'}`}>
      <button onClick={() => setPrMode('content')} className={prBtnCls('content')}><FileText size={14} /> Содержание</button>
      <button onClick={() => setPrMode('original')} className={prBtnCls('original')}><BookOpen size={14} /> Оригинал</button>
    </div>
  );

  if (!review) {
    return (
      <div className={`rounded-3xl border p-12 text-center ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200 text-zinc-500'}`}>
        <FileText size={40} className="mx-auto mb-4 opacity-40" />
        <p className="font-bold text-lg">Обзор этого раздела пока в разработке</p>
      </div>
    );
  }

  if (prMode === 'original') {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {modeToggle}
        <div className={`flex gap-1 p-1 rounded-xl w-fit mb-4 ${isDark ? 'bg-zinc-800' : 'bg-slate-100'}`}>
          <button onClick={() => setOrigSrc('tb')} className={srcBtnCls('tb')}>Учебник</button>
          <button onClick={() => setOrigSrc('wb')} className={srcBtnCls('wb')}>Оглавление</button>
        </div>
        {origSrc === 'tb'
          ? <TextbookImages key={`pr-tb-${partId}`} pages={prTbPagesMap[partId]} isDark={isDark} />
          : <TextbookImages key={`pr-toc-${partId}`} pages={prTitlePagesMap[partId]} isDark={isDark} />
        }
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {modeToggle}
      <header>
        <div className="text-blue-500 font-bold mb-2 tracking-wider uppercase text-sm">{review.title}</div>
        <h2 className={`text-4xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{review.subtitle}</h2>
        {showRussian && <h3 className="text-xl text-zinc-500 font-medium">{review.russianTitle} · {review.russianSubtitle}</h3>}
      </header>

      <SectionCard isDark={isDark}>
        <div className={`p-6 border-b ${isDark ? 'bg-zinc-800/50 border-zinc-800' : 'bg-sky-50 border-slate-200'}`}>
          <h4 className="text-xl font-black">단원 정리</h4>
          {showRussian && <p className="text-sm text-zinc-500 mt-1">Краткое повторение раздела</p>}
        </div>
        <div className="p-6 md:p-8 grid md:grid-cols-2 gap-4">
          {review.summary.map((item, i) => (
            <div key={i} className={`p-5 rounded-2xl border-l-4 border-sky-500 ${isDark ? 'bg-zinc-800' : 'bg-slate-50'}`}>
              <h5 className="font-black mb-1">{item.title}</h5>
              {showRussian && <p className="text-xs text-zinc-500 mb-3">{item.ruTitle}</p>}
              <ul className="space-y-2">
                {item.points.map((point, j) => (
                  <li key={j} className="text-sm">
                    <span className="font-bold">{point.ko}</span>
                    {showRussian && <div className="text-xs text-zinc-500 mt-0.5">{point.ru}</div>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SectionCard>

      <Crossword crossword={review.crossword} showRussian={showRussian} isDark={isDark} />

      <SectionCard isDark={isDark}>
        <div className={`p-6 border-b ${isDark ? 'bg-zinc-800/50 border-zinc-800' : 'bg-emerald-50 border-slate-200'}`}>
          <h4 className="text-xl font-black">단원 종합 평가</h4>
          {showRussian && <p className="text-sm text-zinc-500 mt-1">Итоговый тест раздела</p>}
        </div>
        <div className="p-6 md:p-8 space-y-5">
          {review.finalTest.map((q, qi) => (
            <div key={qi} className={`p-5 rounded-2xl ${isDark ? 'bg-zinc-800' : 'bg-slate-50'}`}>
              <p className="font-black mb-2">{qi + 1}. {q.q}</p>
              {showRussian && <p className="text-sm text-zinc-500 mb-4">{q.ruQ}</p>}
              <div className="grid md:grid-cols-2 gap-2">
                {q.options.map((opt, oi) => {
                  const chosen = selected[qi] === oi;
                  const answered = selected[qi] !== undefined;
                  const correct = oi === q.correct;
                  return (
                    <button
                      key={oi}
                      onClick={() => setSelected((prev) => ({ ...prev, [qi]: oi }))}
                      className={`text-left p-3 rounded-xl border font-bold ${
                        answered && correct ? 'border-green-500 bg-green-500/10 text-green-500'
                          : chosen ? 'border-red-500 bg-red-500/10 text-red-500'
                          : isDark ? 'border-zinc-700 hover:bg-zinc-700' : 'border-slate-200 hover:bg-white'
                      }`}
                    >
                      <span>{opt}</span>
                      {showRussian && <span className="block text-xs opacity-70 mt-1">{q.ruOptions[oi]}</span>}
                    </button>
                  );
                })}
              </div>
              {selected[qi] !== undefined && <p className="text-sm text-zinc-500 mt-3">{q.explain}</p>}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard isDark={isDark}>
        <div className={`p-6 border-b ${isDark ? 'bg-zinc-800/50 border-zinc-800' : 'bg-blue-50 border-slate-200'}`}>
          <h4 className="text-xl font-black">읽기 자료</h4>
          {showRussian && <p className="text-sm text-zinc-500 mt-1">Дополнительные материалы</p>}
        </div>
        <div className="p-6 md:p-8 grid md:grid-cols-2 gap-4">
          {review.extraReadings.map((item, i) => (
            <div key={i} className={`p-5 rounded-2xl ${isDark ? 'bg-zinc-800' : 'bg-slate-50'}`}>
              <h5 className="font-black mb-3">{item.title}</h5>
              {showRussian && <p className="text-sm text-zinc-500 mb-3">{item.ruTitle}</p>}
              <p className="text-sm leading-relaxed">{item.text}</p>
              {showRussian && <p className="text-xs text-zinc-500 mt-3 pt-3 border-t border-dashed border-slate-300">{item.ru}</p>}
            </div>
          ))}
        </div>
      </SectionCard>

    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('textbook');
  const [activeChapter, setActiveChapter] = useState(() => { const s = parseInt(localStorage.getItem('kiip_chapter')); return isNaN(s) ? 1 : s; });
  const [activeReviewPart, setActiveReviewPart] = useState(null);
  const [showRussian, setShowRussian] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  useEffect(() => { setIsSidebarOpen(window.innerWidth >= 768); }, []);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [drawVersion, setDrawVersion] = useState(0);

  useEffect(() => {
    const h = () => setDrawVersion(v => v + 1);
    window.addEventListener('kiip_draw_update', h);
    return () => window.removeEventListener('kiip_draw_update', h);
  }, []);

  const markedChapters = useMemo(() => {
    const s = new Set();
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith('kiip_draw_tb_')) {
        const pg = k.slice('kiip_draw_tb_'.length);
        for (const [ch, pgs] of Object.entries(tbPagesMap)) { if (pgs.includes(pg)) { s.add(Number(ch)); break; } }
      } else if (k?.startsWith('kiip_draw_wb_')) {
        const pn = parseInt(k.slice('kiip_draw_wb_'.length));
        for (const [ch, pgs] of Object.entries(wbPagesMap)) { if (pgs.includes(pn)) { s.add(Number(ch)); break; } }
      }
    }
    return s;
  }, [drawVersion]);

  useEffect(() => { localStorage.setItem('kiip_chapter', String(activeChapter)); }, [activeChapter]);

  const [chapter, setChapter] = useState(null);
  useEffect(() => {
    setChapter(null);
    getChapter(activeChapter).then(setChapter);
  }, [activeChapter]);
  const partReview = useMemo(() => activeReviewPart ? getPartReview(activeReviewPart) : null, [activeReviewPart]);
  const themeClasses = isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-slate-900';

  const mainScrollRef = useRef(null);
  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeChapter, activeReviewPart, activeTab]);

  const readyChapters = Object.keys(chaptersData).length;
  const progressPct = Math.round((readyChapters / 50) * 100);

  return (
    <div className={`flex h-screen font-sans overflow-hidden transition-colors duration-300 ${themeClasses}`}>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 md:z-auto h-full flex flex-col flex-shrink-0 transition-all duration-300 ${isSidebarOpen ? 'w-72 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20'} ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'} border-r`}>
        <div className={`p-4 border-b flex items-center justify-between ${isDarkMode ? 'border-zinc-800' : 'border-slate-100'}`}>
          {isSidebarOpen && (
            <div>
              <h1 className={`font-black text-lg leading-tight ${isDarkMode ? 'text-zinc-300' : 'text-blue-500'}`}>KIIP 기본</h1>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">사회통합프로그램 기본</p>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-600'}`}
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {parts.map((p) => {
            const colors = partColorMap[p.color];
            return (
              <div key={p.id}>
                {isSidebarOpen && (
                  <div className={`px-2 py-1.5 mb-2 rounded-lg text-xs font-black uppercase tracking-wider ${isDarkMode ? colors.softDark : colors.soft}`}>
                    {p.id}부 · {p.title}
                  </div>
                )}
                <div className="space-y-1">
                  {p.chapters.map((ch) => {
                    const t = chapterTitles[ch];
                    const active = !activeReviewPart && activeChapter === ch;
                    return (
                      <button
                        key={ch}
                        onClick={() => {
                          setActiveChapter(ch);
                          setActiveReviewPart(null);
                          setActiveTab('textbook');
                          if (window.innerWidth < 768) setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center p-2.5 rounded-xl transition-colors ${
                          active
                            ? isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-blue-50 text-blue-700'
                            : isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 text-xs font-black ${
                          active ? isDarkMode ? 'bg-zinc-700 text-white' : 'bg-blue-600 text-white' : isDarkMode ? 'bg-zinc-800' : 'bg-slate-200'
                        }`}>
                          {ch}
                        </div>
                        {isSidebarOpen && (
                          <div className="text-left flex-1 min-w-0 flex items-center gap-1">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold truncate">{t.ko}</div>
                              {showRussian && <div className="text-[11px] text-zinc-500 truncate">{t.ru}</div>}
                            </div>
                            {markedChapters.has(ch) && (
                              <span
                                role="button"
                                tabIndex={0}
                                title="Очистить отметки главы"
                                onClick={e => {
                                  e.stopPropagation();
                                  (tbPagesMap[ch] || []).forEach(pg => localStorage.removeItem(`kiip_draw_tb_${pg}`));
                                  (wbPagesMap[ch] || []).forEach(pn => localStorage.removeItem(`kiip_draw_wb_${pn}`));
                                  window.dispatchEvent(new CustomEvent('kiip_draw_clear', { detail: { ch } }));
                                  window.dispatchEvent(new CustomEvent('kiip_draw_update'));
                                }}
                                className="flex-shrink-0 text-[10px] font-black px-1.5 py-0.5 rounded-md text-zinc-500 hover:bg-red-500/20 hover:text-red-400 transition-all cursor-pointer"
                              >
                                ✕
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                  {getPartReview(p.id) && (
                    <button
                      onClick={() => { setActiveReviewPart(p.id); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                      className={`w-full flex items-center p-2.5 rounded-xl transition-colors ${
                        activeReviewPart === p.id
                          ? isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-blue-50 text-blue-700'
                          : isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 text-xs font-black ${
                        activeReviewPart === p.id ? isDarkMode ? 'bg-zinc-700 text-white' : 'bg-blue-600 text-white' : isDarkMode ? 'bg-zinc-800' : 'bg-slate-200'
                      }`}>
                        정리
                      </div>
                      {isSidebarOpen && (
                        <div className="text-left flex-1 min-w-0">
                          <div className="text-sm font-bold truncate flex items-center gap-2">
                            정리 · {p.id}부
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          </div>
                          {showRussian && <div className="text-[11px] text-zinc-500 truncate">Повторение раздела {p.id}</div>}
                        </div>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </nav>

        <div className={`p-4 m-2 rounded-xl ${isDarkMode ? 'bg-zinc-800' : 'bg-slate-100'}`}>
          {isSidebarOpen && <div className="text-xs font-semibold text-zinc-500 mb-2 uppercase">Прогресс курса</div>}
          <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-zinc-700' : 'bg-slate-200'}`}>
            <div className="bg-green-500 h-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          {isSidebarOpen && <div className="text-xs mt-1 text-zinc-400 italic">{progressPct}% подготовлено · {readyChapters} / 50</div>}
        </div>

        <div className="px-3 pb-3">
          <button
            onClick={() => {
              if (!window.confirm('Удалить сохранённый урок и все рисунки?')) return;
              Object.keys(localStorage).filter(k => k.startsWith('kiip_')).forEach(k => localStorage.removeItem(k));
              window.location.reload();
            }}
            className={`w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-bold transition-colors ${isDarkMode ? 'text-zinc-600 hover:bg-zinc-800 hover:text-red-400' : 'text-slate-400 hover:bg-slate-100 hover:text-red-500'}`}
          >
            🗑 {isSidebarOpen && 'Сбросить данные'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className={`border-b p-3 md:p-4 flex items-center justify-between gap-2 shadow-sm z-10 transition-colors ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`md:hidden p-2 rounded-lg flex-shrink-0 ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-600'}`}>
            <Menu size={20} />
          </button>
          {!activeReviewPart ? (
            <div className={`flex space-x-1 p-1 rounded-xl overflow-x-auto flex-shrink min-w-0 ${isDarkMode ? 'bg-zinc-800' : 'bg-slate-100'}`}>
              <TabButton active={activeTab === 'textbook'} isDark={isDarkMode} onClick={() => setActiveTab('textbook')} icon={<BookOpen size={18} />} label="Учебник" />
              <TabButton active={activeTab === 'workbook'} isDark={isDarkMode} onClick={() => setActiveTab('workbook')} icon={<FileText size={18} />} label="Тетрадь" />
              <TabButton active={activeTab === 'flashcards'} isDark={isDarkMode} onClick={() => setActiveTab('flashcards')} icon={<Brain size={18} />} label="Карточки" />
              <TabButton active={activeTab === 'interview'} isDark={isDarkMode} onClick={() => setActiveTab('interview')} icon={<Mic size={18} />} label="Интервью" />
              <TabButton active={activeTab === 'exam'} isDark={isDarkMode} onClick={() => setActiveTab('exam')} icon={<GraduationCap size={18} />} label="시험" />
            </div>
          ) : (
            <div className={`flex items-center px-4 py-2 rounded-xl font-black ${isDarkMode ? 'bg-zinc-800 text-zinc-200' : 'bg-slate-100 text-slate-700'}`}>
              <FileText size={18} className="mr-2" />
              Обзор раздела
            </div>
          )}

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-xl border transition-all ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-yellow-400' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              title={isDarkMode ? 'Светлая тема' : 'Тёмная тема'}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={() => setShowRussian(!showRussian)}
              className={`flex items-center px-4 py-2 rounded-xl border transition-all font-medium ${showRussian ? isDarkMode ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-blue-600 border-blue-600 text-white' : isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-white border-slate-300 text-slate-700'}`}
            >
              <Languages size={18} className="mr-2" />
              <span className="hidden sm:inline">{showRussian ? 'RU: ВКЛ' : 'RU: ВЫКЛ'}</span>
            </button>

          </div>
        </header>

        <div ref={mainScrollRef} className="flex-1 overflow-y-auto p-6 md:p-8 max-w-5xl mx-auto w-full">
          {activeReviewPart && <PartReview review={partReview} partId={activeReviewPart} showRussian={showRussian} isDark={isDarkMode} />}
          {!activeReviewPart && activeTab === 'textbook' && <Textbook chapter={chapter} chapterNum={activeChapter} showRussian={showRussian} isDark={isDarkMode} />}
          {!activeReviewPart && activeTab === 'workbook' && <Workbook chapter={chapter} showRussian={showRussian} isDark={isDarkMode} />}
          {!activeReviewPart && activeTab === 'flashcards' && <Flashcards chapter={chapter} isDark={isDarkMode} />}
          {!activeReviewPart && activeTab === 'interview' && <Interview chapter={chapter} showRussian={showRussian} isDark={isDarkMode} />}
          {!activeReviewPart && activeTab === 'exam' && <ExamSimulation isDark={isDarkMode} showRussian={showRussian} />}
        </div>
      </main>

    </div>
  );
};

export default App;

