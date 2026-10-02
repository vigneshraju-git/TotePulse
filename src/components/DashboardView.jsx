import React, { useState, useEffect, useRef, useMemo } from 'react';
import Chart from 'chart.js/auto';

const MEMBER_COLORS = [
  { border: '#059669', bg: 'rgba(16, 185, 129, 0.85)' },
  { border: '#4f46e5', bg: 'rgba(99, 102, 241, 0.85)' },
  { border: '#7c3aed', bg: 'rgba(139, 92, 246, 0.85)' },
  { border: '#d97706', bg: 'rgba(245, 158, 11, 0.85)' },
  { border: '#e11d48', bg: 'rgba(244, 63, 94, 0.85)' },
  { border: '#0284c7', bg: 'rgba(2, 132, 199, 0.85)' },
  { border: '#16a34a', bg: 'rgba(22, 163, 74, 0.85)' },
  { border: '#ea580c', bg: 'rgba(234, 88, 12, 0.85)' },
];

const COHORT_COLORS = {
  'AR / Denial':        { bg: 'bg-indigo-50',  border: 'border-indigo-200',  badge: 'bg-indigo-100 text-indigo-700',   icon: 'text-indigo-500' },
  'Claim Submission':   { bg: 'bg-violet-50',  border: 'border-violet-200',  badge: 'bg-violet-100 text-violet-700',   icon: 'text-violet-500' },
};

// ─────────────────────────────────────────────────────────────────────────────
// INDIVIDUAL EXAM DASHBOARD — shown when an exam card is clicked
// ─────────────────────────────────────────────────────────────────────────────
function IndividualExamDashboard({ exam, examIndex, students, submissions, teams, onViewTraineeResponses, onSimulateTest }) {
  const barChartRef  = useRef(null);
  const doughnutRef  = useRef(null);
  const barInstance  = useRef(null);
  const doughnutInst = useRef(null);

  const examSubs = useMemo(() =>
    submissions.filter(s => s.examId === exam.id),
  [exam, submissions]);

  const scoredSubs = examSubs.filter(s => s.status !== 'Absent' && s.score > 0);
  const absentCount = examSubs.length - scoredSubs.length;
  const passThreshold = exam.maxScore * 0.5;
  const passedSubs = scoredSubs.filter(s => s.score >= passThreshold);
  const failedSubs = scoredSubs.filter(s => s.score < passThreshold);
  const avgScore = scoredSubs.length ? (scoredSubs.reduce((a, s) => a + s.score, 0) / scoredSubs.length).toFixed(2) : 0;
  const highestSub = scoredSubs.reduce((best, s) => s.score > (best?.score ?? -1) ? s : best, null);
  const lowestSub  = scoredSubs.reduce((low,  s) => s.score < (low?.score ?? 999) ? s : low, null);

  // Bar: member scores in this exam
  useEffect(() => {
    if (!barChartRef.current) return;
    if (barInstance.current) barInstance.current.destroy();

    const labels = scoredSubs.map(s => s.studentName);
    const data   = scoredSubs.map(s => s.score);
    const bgs    = scoredSubs.map(s => s.score >= passThreshold ? 'rgba(16, 185, 129, 0.85)' : 'rgba(244, 63, 94, 0.80)');
    const borders= scoredSubs.map(s => s.score >= passThreshold ? '#059669' : '#e11d48');

    barInstance.current = new Chart(barChartRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: `Score / ${exam.maxScore}`,
          data,
          backgroundColor: bgs,
          borderColor: borders,
          borderWidth: 1.5,
          borderRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => {
                const pct = Math.round((ctx.raw / exam.maxScore) * 100);
                const status = ctx.raw >= passThreshold ? '✅ Pass' : '❌ Fail';
                return ` ${ctx.raw} / ${exam.maxScore} Marks (${pct}%) — ${status}`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            max: exam.maxScore,
            grid: { color: '#f1f5f9' },
            title: { display: true, text: 'Marks Scored', font: { size: 11 } },
            ticks: { callback: v => `${v}M` }
          },
          y: {
            grid: { display: false },
            ticks: { font: { size: 12, weight: 'bold' } }
          }
        }
      }
    });
    return () => { if (barInstance.current) barInstance.current.destroy(); };
  }, [exam, scoredSubs]);

  // Doughnut: pass / fail / absent
  useEffect(() => {
    if (!doughnutRef.current) return;
    if (doughnutInst.current) doughnutInst.current.destroy();

    doughnutInst.current = new Chart(doughnutRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Pass', 'Fail', 'Absent'],
        datasets: [{
          data: [passedSubs.length, failedSubs.length, absentCount],
          backgroundColor: ['rgba(16,185,129,0.85)', 'rgba(244,63,94,0.85)', 'rgba(148,163,184,0.7)'],
          borderColor: ['#059669', '#e11d48', '#94a3b8'],
          borderWidth: 1.5,
          hoverOffset: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11, weight: 'bold' } } },
          tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw} trainee${ctx.raw !== 1 ? 's' : ''}` } }
        }
      }
    });
    return () => { if (doughnutInst.current) doughnutInst.current.destroy(); };
  }, [passedSubs, failedSubs, absentCount]);

  const cohortColors = COHORT_COLORS[exam.cohort] || COHORT_COLORS['AR / Denial'];

  return (
    <div className="space-y-6">
      {/* Exam Header */}
      <div className={`rounded-2xl border p-5 ${cohortColors.bg} ${cohortColors.border} flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${cohortColors.badge}`}>
              Exam {examIndex + 1} · {exam.cohort}
            </span>
            <span className="text-xs text-slate-500 font-mono">{exam.examDate}</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">{exam.title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{exam.description?.substring(0, 100)}…</p>
        </div>
        <div className="grid grid-cols-3 gap-3 bg-white/70 backdrop-blur p-3 rounded-xl border border-white text-center shrink-0">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Max Marks</span>
            <div className="font-extrabold text-slate-900 text-lg mt-0.5">{exam.maxScore}</div>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Questions</span>
            <div className="font-extrabold text-slate-900 text-lg mt-0.5">{exam.questions?.length || 0}</div>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Duration</span>
            <div className="font-extrabold text-slate-900 text-lg mt-0.5">{exam.durationMinutes}m</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Avg Score', value: `${avgScore} / ${exam.maxScore}`, sub: `${exam.maxScore > 0 ? Math.round((avgScore / exam.maxScore) * 100) : 0}%`, icon: 'fa-chart-bar', color: 'indigo' },
          { label: 'Pass Rate', value: `${scoredSubs.length > 0 ? Math.round((passedSubs.length / scoredSubs.length) * 100) : 0}%`, sub: `${passedSubs.length} of ${scoredSubs.length}`, icon: 'fa-circle-check', color: 'emerald' },
          { label: 'Highest', value: highestSub ? `${highestSub.score}M` : '—', sub: highestSub?.studentName || '', icon: 'fa-trophy', color: 'amber' },
          { label: 'Lowest', value: lowestSub ? `${lowestSub.score}M` : '—', sub: lowestSub?.studentName || '', icon: 'fa-arrow-trend-down', color: 'rose' },
        ].map(({ label, value, sub, icon, color }) => (
          <div key={label} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-${color}-50 text-${color}-600 flex items-center justify-center text-base shrink-0`}>
              <i className={`fa-solid ${icon}`}></i>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
              <p className="font-bold text-slate-900 text-sm">{value}</p>
              <p className="text-[10px] text-slate-400 truncate max-w-[90px]">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Horizontal bar: Member scores */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-slate-900 text-sm">Member Score Comparison</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase">
              Horizontal Bar
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Green = Pass (≥50%) &nbsp;</span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span> Red = Fail</span>
          </p>
          <div className="relative w-full" style={{ height: `${Math.max(200, scoredSubs.length * 52)}px` }}>
            <canvas ref={barChartRef}></canvas>
          </div>
        </div>

        {/* Doughnut: pass / fail */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-900 text-sm mb-1">Result Breakdown</h3>
          <p className="text-xs text-slate-400 mb-3">Pass / Fail / Absent distribution</p>
          <div className="relative flex-1" style={{ minHeight: 200 }}>
            <canvas ref={doughnutRef}></canvas>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 text-center text-xs gap-2">
            <div>
              <div className="font-extrabold text-emerald-600 text-lg">{passedSubs.length}</div>
              <div className="text-slate-400">Pass</div>
            </div>
            <div>
              <div className="font-extrabold text-rose-600 text-lg">{failedSubs.length}</div>
              <div className="text-slate-400">Fail</div>
            </div>
            <div>
              <div className="font-extrabold text-slate-500 text-lg">{absentCount}</div>
              <div className="text-slate-400">Absent</div>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Submission Scorecard</h3>
            <p className="text-xs text-slate-400">All {examSubs.length} trainee submissions for this exam</p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-mono">
            Pass ≥ {passThreshold} Marks ({Math.round((passThreshold / exam.maxScore) * 100)}%)
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Trainee</th>
                <th className="py-2.5 px-3">Submitted</th>
                <th className="py-2.5 px-3">Score</th>
                <th className="py-2.5 px-3">Percentage</th>
                <th className="py-2.5 px-3">Progress Bar</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {examSubs.length === 0 ? (
                <tr><td colSpan={7} className="py-6 text-center text-slate-400">No submissions for this exam</td></tr>
              ) : (
                examSubs
                  .slice()
                  .sort((a, b) => b.score - a.score)
                  .map((sub, i) => {
                    const student = students.find(s => s.id === sub.studentId);
                    const pct = sub.total > 0 ? Math.round((sub.score / sub.total) * 100) : 0;
                    const isPassed = sub.score >= passThreshold && sub.status !== 'Absent';
                    const isAbsent = sub.status === 'Absent';
                    return (
                      <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] text-white shrink-0"
                            style={{ backgroundColor: MEMBER_COLORS[students.findIndex(s => s.id === sub.studentId) % MEMBER_COLORS.length]?.border || '#4f46e5' }}>
                            {student?.avatar || sub.studentName?.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">{sub.studentName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{student?.empCode}</div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-mono">{sub.timestamp?.split(' ')[0] || sub.date}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {isAbsent ? <span className="text-slate-400">—</span> : `${sub.score} / ${sub.total}`}
                        </td>
                        <td className="py-3 px-3 font-bold">
                          <span className={isAbsent ? 'text-slate-400' : isPassed ? 'text-emerald-600' : 'text-rose-600'}>
                            {isAbsent ? 'N/A' : `${pct}%`}
                          </span>
                        </td>
                        <td className="py-3 px-3 w-36">
                          {!isAbsent && (
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${isPassed ? 'bg-emerald-500' : 'bg-rose-400'}`}
                                style={{ width: `${Math.min(100, pct)}%` }}
                              ></div>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isAbsent ? 'bg-slate-100 text-slate-500 border border-slate-200'
                            : isPassed ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}>
                            {isAbsent ? 'Absent' : isPassed ? 'Pass' : 'Fail'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {!isAbsent && (
                            <button
                              onClick={() => onViewTraineeResponses(student, sub)}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition flex items-center gap-1 ml-auto"
                            >
                              <i className="fa-regular fa-file-lines"></i> Responses
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}



// ─────────────────────────────────────────────────────────────────────────────
// EXAM SELECTION CARDS — shown in Individual mode before an exam is picked
// ─────────────────────────────────────────────────────────────────────────────
function ExamSelectionGrid({ exams, submissions, students, onSelectExam }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base mb-1">Select an Exam to View Results</h3>
        <p className="text-xs text-slate-400">Click any exam card below to load that exam's individual dashboard — member scores, pass/fail breakdown, and full submission scorecard.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-5">
        {exams.map((exam, idx) => {
          const examSubs   = submissions.filter(s => s.examId === exam.id);
          const scoredSubs = examSubs.filter(s => s.status !== 'Absent' && s.score > 0);
          const passedCount = scoredSubs.filter(s => s.score >= exam.maxScore * 0.5).length;
          const avgScore = scoredSubs.length ? (scoredSubs.reduce((a, s) => a + s.score, 0) / scoredSubs.length).toFixed(1) : '—';
          const cohortCol = COHORT_COLORS[exam.cohort] || COHORT_COLORS['AR / Denial'];
          const passRate = scoredSubs.length ? Math.round((passedCount / scoredSubs.length) * 100) : 0;

          return (
            <button
              key={exam.id}
              type="button"
              onClick={() => onSelectExam(exam)}
              className={`text-left rounded-2xl border-2 p-5 shadow-sm hover:shadow-md transition-all group cursor-pointer ${cohortCol.bg} ${cohortCol.border} hover:border-indigo-400`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-extrabold text-slate-800 text-base border border-slate-100">
                    E{idx + 1}
                  </div>
                  <div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${cohortCol.badge}`}>{exam.cohort}</span>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{exam.examDate}</div>
                  </div>
                </div>
                <i className="fa-solid fa-arrow-right text-slate-300 group-hover:text-indigo-500 transition-colors text-base mt-1"></i>
              </div>

              <h4 className="font-bold text-slate-900 text-sm leading-tight mb-2 line-clamp-2">{exam.title}</h4>

              <div className="grid grid-cols-4 gap-2 text-center mt-3">
                <div className="bg-white/70 rounded-xl py-2">
                  <div className="font-extrabold text-slate-900 text-base">{exam.maxScore}</div>
                  <div className="text-[9px] text-slate-400 uppercase font-bold">Max</div>
                </div>
                <div className="bg-white/70 rounded-xl py-2">
                  <div className="font-extrabold text-slate-900 text-base">{scoredSubs.length}</div>
                  <div className="text-[9px] text-slate-400 uppercase font-bold">Scored</div>
                </div>
                <div className="bg-white/70 rounded-xl py-2">
                  <div className="font-extrabold text-emerald-600 text-base">{avgScore}</div>
                  <div className="text-[9px] text-slate-400 uppercase font-bold">Avg</div>
                </div>
                <div className="bg-white/70 rounded-xl py-2">
                  <div className={`font-extrabold text-base ${passRate >= 50 ? 'text-emerald-600' : 'text-rose-600'}`}>{passRate}%</div>
                  <div className="text-[9px] text-slate-400 uppercase font-bold">Pass</div>
                </div>
              </div>

              {/* Mini member score bars */}
              <div className="mt-3 space-y-1">
                {scoredSubs.slice(0, 5).map((sub, si) => {
                  const pct = exam.maxScore > 0 ? Math.round((sub.score / exam.maxScore) * 100) : 0;
                  const passed = sub.score >= exam.maxScore * 0.5;
                  return (
                    <div key={sub.id} className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 w-20 truncate font-medium">{sub.studentName.split(' ')[0]}</span>
                      <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${passed ? 'bg-emerald-500' : 'bg-rose-400'}`} style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className={`text-[10px] font-bold w-8 text-right ${passed ? 'text-emerald-600' : 'text-rose-600'}`}>{sub.score}M</span>
                    </div>
                  );
                })}
                {examSubs.filter(s => s.status === 'Absent').length > 0 && (
                  <p className="text-[10px] text-slate-400 mt-1">+ {examSubs.filter(s => s.status === 'Absent').length} absent</p>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-white/60 flex items-center justify-between text-[10px] text-slate-400">
                <span>{exam.questions?.length || 0} Questions · {exam.durationMinutes} min</span>
                <span className="font-semibold text-indigo-600 group-hover:underline">View Dashboard →</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MEMBER DASHBOARD — per-member cumulative report
// ─────────────────────────────────────────────────────────────────────────────
function MemberDashboard({ students, exams, submissions, teams, onViewTraineeResponses, onSimulateTest }) {
  const activeMembers = useMemo(() =>
    students.filter(s => submissions.some(sub => sub.studentId === s.id)),
  [students, submissions]);

  const [selectedMemberId, setSelectedMemberId] = useState(activeMembers[0]?.id || '');

  const member = students.find(s => s.id === selectedMemberId);
  const team   = member ? teams.find(t => t.id === member.teamId) : null;

  const memberSubs = useMemo(() => {
    if (!selectedMemberId) return [];
    const sortedExams = [...exams].sort((a, b) => (a.examNumber || 0) - (b.examNumber || 0));
    return sortedExams
      .map((exam, i) => {
        const sub = submissions.find(s => s.examId === exam.id && s.studentId === selectedMemberId);
        return sub ? { ...sub, examObj: exam, examLabel: `Exam ${i + 1}` } : null;
      })
      .filter(Boolean);
  }, [selectedMemberId, exams, submissions]);

  const scoredSubs = memberSubs.filter(s => s.status !== 'Absent' && s.score > 0);
  const passedSubs = scoredSubs.filter(s => s.score >= (s.examObj?.maxScore || s.total) * 0.5);
  const avgPct     = scoredSubs.length ? Math.round(scoredSubs.reduce((a, s) => a + (s.score / s.total) * 100, 0) / scoredSubs.length) : 0;
  const bestSub    = scoredSubs.reduce((b, s) => (s.score / s.total) > ((b?.score ?? 0) / (b?.total ?? 1)) ? s : b, null);
  const scorePcts  = scoredSubs.map(s => Math.round((s.score / s.total) * 100));
  const effDelta   = scorePcts.length >= 2 ? scorePcts[scorePcts.length - 1] - scorePcts[0] : null;

  const trendRef  = useRef(null);
  const barRef    = useRef(null);
  const trendInst = useRef(null);
  const barInst   = useRef(null);

  const memberColorIdx = students.findIndex(s => s.id === selectedMemberId);
  const memberColor    = MEMBER_COLORS[memberColorIdx % MEMBER_COLORS.length] || MEMBER_COLORS[0];

  useEffect(() => {
    if (!trendRef.current || !member) return;
    if (trendInst.current) trendInst.current.destroy();
    const labels = memberSubs.map(s => s.examLabel);
    const data   = memberSubs.map(s => (s.status === 'Absent' || !s.score) ? null : Math.round((s.score / s.total) * 100));
    trendInst.current = new Chart(trendRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: `${member.name} — Score %`,
          data,
          borderColor: memberColor.border,
          backgroundColor: memberColor.bg.replace('0.85', '0.12'),
          borderWidth: 3,
          pointRadius: 7,
          pointHoverRadius: 10,
          pointBackgroundColor: data.map(v => v === null ? 'transparent' : v >= 50 ? '#059669' : '#e11d48'),
          pointBorderColor:     data.map(v => v === null ? 'transparent' : v >= 50 ? '#059669' : '#e11d48'),
          tension: 0.35,
          fill: true,
          spanGaps: false,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: ctx => memberSubs[ctx[0].dataIndex]?.examTitle || '',
              label: ctx => {
                if (ctx.raw === null) return ' Absent / Not taken';
                const sub = memberSubs[ctx.dataIndex];
                return [
                  ` Score: ${sub?.score} / ${sub?.total} Marks (${ctx.raw}%)`,
                  ` Status: ${ctx.raw >= 50 ? '✅ Pass' : '❌ Fail'}`,
                  ` Date: ${sub?.date || '—'}`,
                ];
              }
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11, weight: 'bold' } } },
          y: { beginAtZero: true, max: 105, ticks: { callback: v => v + '%', stepSize: 25 }, grid: { color: '#f1f5f9' }, title: { display: true, text: 'Score %', font: { size: 11 } } }
        }
      }
    });
    return () => { if (trendInst.current) trendInst.current.destroy(); };
  }, [member, memberSubs, memberColor]);

  useEffect(() => {
    if (!barRef.current || !member) return;
    if (barInst.current) barInst.current.destroy();
    const labels  = memberSubs.map(s => s.examLabel);
    const scores  = memberSubs.map(s => (s.status === 'Absent' || !s.score) ? 0 : s.score);
    const maxes   = memberSubs.map(s => s.examObj?.maxScore || s.total || 10);
    const bgs     = memberSubs.map(s => { if (!s.score || s.status === 'Absent') return 'rgba(148,163,184,0.5)'; return s.score >= (s.examObj?.maxScore || s.total) * 0.5 ? 'rgba(16,185,129,0.82)' : 'rgba(244,63,94,0.80)'; });
    const borders = memberSubs.map(s => { if (!s.score || s.status === 'Absent') return '#94a3b8'; return s.score >= (s.examObj?.maxScore || s.total) * 0.5 ? '#059669' : '#e11d48'; });
    barInst.current = new Chart(barRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Score (Marks)', data: scores, backgroundColor: bgs, borderColor: borders, borderWidth: 1.5, borderRadius: 6, order: 1 },
          { label: 'Max Marks',    data: maxes,  backgroundColor: 'rgba(226,232,240,0.5)', borderColor: '#e2e8f0', borderWidth: 1, borderRadius: 6, order: 2 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
          tooltip: {
            callbacks: {
              title: ctx => memberSubs[ctx[0].dataIndex]?.examTitle || '',
              label: ctx => {
                if (ctx.datasetIndex === 1) return ` Max possible: ${ctx.raw} Marks`;
                const sub = memberSubs[ctx.dataIndex];
                if (!sub?.score || sub.status === 'Absent') return ' Absent';
                return ` Scored: ${sub.score} / ${sub.total} Marks (${Math.round((sub.score / sub.total) * 100)}%)`;
              }
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11, weight: 'bold' } } },
          y: { beginAtZero: true, grid: { color: '#f1f5f9' }, title: { display: true, text: 'Marks', font: { size: 11 } } }
        }
      }
    });
    return () => { if (barInst.current) barInst.current.destroy(); };
  }, [member, memberSubs]);

  const statusColors = { Pass: 'bg-emerald-100 text-emerald-800 border-emerald-200', Fail: 'bg-rose-100 text-rose-800 border-rose-200', Absent: 'bg-slate-100 text-slate-500 border-slate-200' };

  return (
    <div className="space-y-6">
      {/* Member Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              <i className="fa-solid fa-user-circle mr-1 text-indigo-400"></i> Select Member
            </label>
            <select
              value={selectedMemberId}
              onChange={e => setSelectedMemberId(e.target.value)}
              className="w-full sm:max-w-sm px-4 py-2.5 text-sm font-semibold bg-slate-50 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white text-slate-800 transition"
            >
              {activeMembers.map(m => (
                <option key={m.id} value={m.id}>{m.name} — {m.empCode || ''}</option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1">{activeMembers.length} members with at least one submission</p>
          </div>
          {member && (
            <button
              type="button"
              onClick={() => onSimulateTest(member.id)}
              className="px-4 py-2.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl transition flex items-center gap-2 shrink-0"
            >
              <i className="fa-solid fa-play"></i> Test Drive as {member.name.split(' ')[0]}
            </button>
          )}
        </div>
      </div>

      {member ? (
        <>
          {/* Profile Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-lg text-white shadow-lg shrink-0" style={{ backgroundColor: memberColor.border }}>
                {member.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-lg font-bold">{member.name}</h2>
                  {member.empCode && <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/15 text-slate-200">{member.empCode}</span>}
                </div>
                <p className="text-xs text-slate-300">{member.email}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-300">
                  <span><i className="fa-solid fa-arrow-right mr-1 text-slate-400"></i>{member.previousTeam || '—'} → <strong className="text-white">{team?.shortName || team?.name || '—'}</strong></span>
                  {member.doj && <span><i className="fa-solid fa-calendar-days mr-1 text-slate-400"></i>DOJ: {member.doj}</span>}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 bg-white/10 p-3 rounded-xl border border-white/10 text-center shrink-0">
              <div><span className="text-[10px] text-slate-400 uppercase font-bold">Avg</span><div className="font-extrabold text-amber-400 text-base mt-0.5">{avgPct}%</div></div>
              <div><span className="text-[10px] text-slate-400 uppercase font-bold">Pass Rate</span><div className="font-extrabold text-emerald-400 text-base mt-0.5">{scoredSubs.length ? Math.round((passedSubs.length / scoredSubs.length) * 100) : 0}%</div></div>
              <div><span className="text-[10px] text-slate-400 uppercase font-bold">Δ Trend</span><div className={`font-extrabold text-base mt-0.5 ${effDelta === null ? 'text-slate-400' : effDelta > 0 ? 'text-emerald-400' : effDelta < 0 ? 'text-rose-400' : 'text-slate-300'}`}>{effDelta === null ? '—' : effDelta > 0 ? `▲+${effDelta}%` : effDelta < 0 ? `▼${effDelta}%` : '→0%'}</div></div>
            </div>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Exams Taken',  value: memberSubs.length,   sub: `${scoredSubs.length} scored · ${memberSubs.length - scoredSubs.length} absent`, icon: 'fa-layer-group',  color: 'indigo'  },
              { label: 'Passed',       value: passedSubs.length,   sub: `of ${scoredSubs.length} scored`,                                                  icon: 'fa-circle-check', color: 'emerald' },
              { label: 'Best Score',   value: bestSub ? `${Math.round((bestSub.score / bestSub.total) * 100)}%` : '—', sub: bestSub?.examLabel || '',        icon: 'fa-trophy',       color: 'amber'   },
              { label: 'Status',       value: member.performanceStatus || (avgPct >= 70 ? 'Proficient' : 'Needs Support'), sub: 'Based on all submissions',  icon: 'fa-star',         color: avgPct >= 70 ? 'emerald' : 'rose' },
            ].map(({ label, value, sub, icon, color }) => (
              <div key={label} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-${color}-50 text-${color}-600 flex items-center justify-center text-base shrink-0`}>
                  <i className={`fa-solid ${icon}`}></i>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                  <p className="font-bold text-slate-900 text-sm truncate">{value}</p>
                  <p className="text-[10px] text-slate-400 truncate">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-slate-900 text-sm">Score % Trend Across All Exams</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200 uppercase">Line</span>
              </div>
              <p className="text-xs text-slate-400 mb-3"><span className="text-emerald-600 font-semibold">● Pass</span> &nbsp;<span className="text-rose-500 font-semibold">● Fail</span> &nbsp;Gap = Absent / not taken</p>
              <div className="relative h-60 w-full"><canvas ref={trendRef}></canvas></div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-slate-900 text-sm">Marks Scored vs Max — Per Exam</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase">Bar</span>
              </div>
              <p className="text-xs text-slate-400 mb-3"><span className="text-emerald-600 font-semibold">■ Pass</span> &nbsp;<span className="text-rose-500 font-semibold">■ Fail</span> &nbsp;<span className="text-slate-400 font-semibold">■ Max possible</span></p>
              <div className="relative h-60 w-full"><canvas ref={barRef}></canvas></div>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">All Exam Submissions — {member.name}</h3>
                <p className="text-xs text-slate-400">{memberSubs.length} attempt{memberSubs.length !== 1 ? 's' : ''} · failed attempts counted separately</p>
              </div>
              {effDelta !== null && (
                <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${effDelta > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : effDelta < 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                  Overall Trend {effDelta > 0 ? `▲ +${effDelta}%` : effDelta < 0 ? `▼ ${effDelta}%` : '→ No change'}
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Exam</th>
                    <th className="py-2.5 px-3">Cohort</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">%</th>
                    <th className="py-2.5 px-3">Progress</th>
                    <th className="py-2.5 px-3">Result</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {memberSubs.map((sub, i) => {
                    const pct      = sub.total > 0 ? Math.round((sub.score / sub.total) * 100) : 0;
                    const isAbsent = sub.status === 'Absent' || !sub.score;
                    const isPassed = !isAbsent && sub.score >= (sub.examObj?.maxScore || sub.total) * 0.5;
                    const rowStatus = isAbsent ? 'Absent' : isPassed ? 'Pass' : 'Fail';
                    return (
                      <tr key={sub.id} className={`transition-colors ${isAbsent ? 'opacity-60' : 'hover:bg-slate-50'}`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-extrabold text-indigo-700 text-xs shrink-0">E{i + 1}</div>
                            <div>
                              <div className="font-semibold text-slate-800 max-w-[200px] truncate">{sub.examTitle}</div>
                              <div className="text-[10px] text-slate-400">{sub.examObj?.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase ${COHORT_COLORS[sub.examObj?.cohort]?.badge || 'bg-slate-100 text-slate-600'}`}>{sub.examObj?.cohort || '—'}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-mono whitespace-nowrap">{sub.date || '—'}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">{isAbsent ? <span className="text-slate-300">—</span> : `${sub.score} / ${sub.total}M`}</td>
                        <td className="py-3 px-3 font-bold"><span className={isAbsent ? 'text-slate-300' : isPassed ? 'text-emerald-600' : 'text-rose-600'}>{isAbsent ? 'N/A' : `${pct}%`}</span></td>
                        <td className="py-3 px-3 w-28">
                          {!isAbsent && <div className="w-full bg-slate-100 rounded-full h-2"><div className={`h-2 rounded-full ${isPassed ? 'bg-emerald-500' : 'bg-rose-400'}`} style={{ width: `${Math.min(100, pct)}%` }}></div></div>}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[rowStatus]}`}>{rowStatus}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {!isAbsent && (
                            <button onClick={() => onViewTraineeResponses(member, sub)} className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition flex items-center gap-1 ml-auto">
                              <i className="fa-regular fa-file-lines"></i> Answers
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trainer Comments */}
          {member.trainerComments && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
              <i className="fa-solid fa-comment-dots text-amber-500 text-lg mt-0.5 shrink-0"></i>
              <div>
                <h4 className="font-bold text-amber-800 text-sm mb-1">Trainer Comments</h4>
                <p className="text-xs text-amber-700 leading-relaxed">{member.trainerComments}</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <i className="fa-solid fa-user-slash text-4xl mb-3 block"></i>
          <p className="font-semibold">No member selected</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD VIEW — breadcrumb router
// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardView({ teams, students, exams, submissions, studentStatsMap, teamStatsMap, overviewStats, onSimulateTest, onViewTraineeResponses }) {
  // 'individual-list' | 'individual-exam' | 'member-dashboard'
  const [mode, setMode] = useState('individual-list');
  const [selectedExam, setSelectedExam] = useState(null);

  const handleSelectExam = (exam) => {
    setSelectedExam(exam);
    setMode('individual-exam');
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setSelectedExam(null);
  };

  const examIndex = selectedExam ? exams.findIndex(e => e.id === selectedExam.id) : -1;

  return (
    <div className="space-y-5">

      {/* ── Breadcrumb Navigation ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 px-4 flex flex-col sm:flex-row sm:items-center gap-3">

        {/* Mode Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => switchMode('individual-list')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${mode === 'individual-list' || mode === 'individual-exam' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <i className="fa-solid fa-file-circle-check"></i>
            Individual Exam Results
          </button>
          <button
            type="button"
            onClick={() => switchMode('member-dashboard')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${mode === 'member-dashboard' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <i className="fa-solid fa-user-chart"></i>
            Member Dashboard
          </button>
        </div>

        {/* Breadcrumb trail */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 overflow-x-auto">
          <i className="fa-solid fa-house text-slate-300 shrink-0"></i>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500 font-semibold shrink-0">Dashboard</span>

          {(mode === 'individual-list' || mode === 'individual-exam') && (
            <>
              <span className="text-slate-300">/</span>
              <button
                type="button"
                onClick={() => setMode('individual-list')}
                className={`font-semibold shrink-0 hover:text-indigo-600 transition ${mode === 'individual-list' ? 'text-indigo-700' : 'text-slate-500'}`}
              >
                Individual Exam Results
              </button>
            </>
          )}

          {mode === 'individual-exam' && selectedExam && (
            <>
              <span className="text-slate-300">/</span>
              <span className="text-indigo-700 font-semibold shrink-0">
                Exam {examIndex + 1}: {selectedExam.title.length > 30 ? selectedExam.title.substring(0, 28) + '…' : selectedExam.title}
              </span>
            </>
          )}

          {mode === 'member-dashboard' && (
            <>
              <span className="text-slate-300">/</span>
              <span className="text-indigo-700 font-semibold shrink-0">Member Dashboard</span>
            </>
          )}
        </div>

        {/* Back button when inside an exam */}
        {mode === 'individual-exam' && (
          <button
            type="button"
            onClick={() => setMode('individual-list')}
            className="ml-auto px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition flex items-center gap-1.5 shrink-0"
          >
            <i className="fa-solid fa-arrow-left"></i> Back to Exam List
          </button>
        )}
      </div>

      {/* ── Content Area ─────────────────────────────────────────────────── */}
      {mode === 'individual-list' && (
        <ExamSelectionGrid
          exams={exams} submissions={submissions} students={students}
          onSelectExam={handleSelectExam}
        />
      )}

      {mode === 'individual-exam' && selectedExam && (
        <IndividualExamDashboard
          exam={selectedExam} examIndex={examIndex}
          students={students} submissions={submissions} teams={teams}
          onViewTraineeResponses={onViewTraineeResponses}
          onSimulateTest={onSimulateTest}
        />
      )}

      {mode === 'member-dashboard' && (
        <MemberDashboard
          students={students} exams={exams} submissions={submissions} teams={teams}
          onViewTraineeResponses={onViewTraineeResponses}
          onSimulateTest={onSimulateTest}
        />
      )}
    </div>
  );
}
