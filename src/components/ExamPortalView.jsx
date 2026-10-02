import React from 'react';

export default function ExamPortalView({
  portalView,
  setPortalView,
  students,
  exams,
  teams,
  selectedPortalStudentId,
  setSelectedPortalStudentId,
  selectedPortalExamId,
  setSelectedPortalExamId,
  activeSession,
  setActiveSession,
  examResult,
  onStartExamSession,
  onFinalizeExam,
  onReturnToDashboard
}) {
  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optIndex) => {
    if (!activeSession) return;
    setActiveSession(prev => ({
      ...prev,
      answers: { ...prev.answers, [prev.currentIndex]: optIndex }
    }));
  };

  return (
    <div>
      {/* 1. LOBBY SCREEN */}
      {portalView === 'lobby' && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center text-2xl mb-3">
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Candidate Examination Portal</h2>
            <p className="text-xs text-slate-500 mt-1">This simulation allows students or proctors to take tests with the generated exam link.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Select Student Candidate
              </label>
              <select
                value={selectedPortalStudentId}
                onChange={e => setSelectedPortalStudentId(e.target.value)}
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {students.map(s => {
                  const team = teams.find(t => t.id === s.teamId);
                  return (
                    <option key={s.id} value={s.id}>
                      {s.name} ({team ? team.name.split('(')[0] : 'General'})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Choose Assessment to Launch
              </label>
              <select
                value={selectedPortalExamId}
                onChange={e => setSelectedPortalExamId(e.target.value)}
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {exams.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.title} ({e.durationMinutes} mins - {e.questions.length} Qs)
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex gap-3 text-xs text-amber-800">
              <i className="fa-solid fa-triangle-exclamation text-amber-600 text-sm mt-0.5"></i>
              <div>
                <p className="font-semibold">Simulated Timed Assessment Environment</p>
                <p className="text-amber-700 mt-0.5">
                  Each question evaluates technical reasoning. After submission, your performance is automatically scored and synced into the team efficiency intelligence dashboard.
                </p>
              </div>
            </div>

            <button
              onClick={onStartExamSession}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-play"></i> Launch Examination Session
            </button>
          </div>
        </div>
      )}

      {/* 2. ACTIVE RUNNING EXAM SCREEN */}
      {portalView === 'active' && activeSession && (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 text-white p-5 flex flex-wrap justify-between items-center gap-3">
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/30 text-indigo-300 rounded border border-indigo-400/30 uppercase tracking-wider">
                Assessment Session
              </span>
              <h3 className="text-base font-bold text-white mt-1">{activeSession.exam.title}</h3>
              <p className="text-xs text-slate-400">
                Candidate: {activeSession.student.name} • {teams.find(t => t.id === activeSession.student.teamId)?.name}
              </p>
            </div>
            <div className="flex items-center gap-3 bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-700">
              <i className="fa-regular fa-clock text-amber-400 text-sm animate-pulse"></i>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Remaining</div>
                <div className="font-mono text-sm font-bold text-white">{formatTimer(activeSession.secondsRemaining)}</div>
              </div>
            </div>
          </div>

          {/* Progress Bullets */}
          <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-600">
              Question <span className="text-indigo-600 font-bold">{activeSession.currentIndex + 1}</span> of{' '}
              <span>{activeSession.exam.questions.length}</span>
            </div>
            <div className="flex gap-1.5">
              {activeSession.exam.questions.map((q, idx) => {
                const answered = activeSession.answers[idx] !== undefined;
                const isCurrent = idx === activeSession.currentIndex;
                let colorClass = 'bg-slate-200 text-slate-600';
                if (isCurrent) colorClass = 'bg-indigo-600 text-white ring-2 ring-indigo-300';
                else if (answered) colorClass = 'bg-emerald-500 text-white';

                return (
                  <button
                    key={idx}
                    onClick={() => setActiveSession(prev => ({ ...prev, currentIndex: idx }))}
                    className={`w-6 h-6 rounded text-[11px] font-bold transition flex items-center justify-center ${colorClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Body */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
              {activeSession.currentIndex + 1}. {activeSession.exam.questions[activeSession.currentIndex].text}
            </div>

            {/* Options */}
            <div className="space-y-3">
              {activeSession.exam.questions[activeSession.currentIndex].options.map((opt, idx) => {
                const isSelected = activeSession.answers[activeSession.currentIndex] === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-1 ring-indigo-600'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300 text-slate-500'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                    {isSelected && <i className="fa-solid fa-circle-check text-indigo-600"></i>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <button
              disabled={activeSession.currentIndex === 0}
              onClick={() => setActiveSession(prev => ({ ...prev, currentIndex: Math.max(0, prev.currentIndex - 1) }))}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <i className="fa-solid fa-arrow-left mr-1"></i> Previous
            </button>

            <div className="flex gap-2">
              {activeSession.currentIndex < activeSession.exam.questions.length - 1 ? (
                <button
                  onClick={() => setActiveSession(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }))}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 shadow transition"
                >
                  Next Question <i className="fa-solid fa-arrow-right ml-1"></i>
                </button>
              ) : (
                <button
                  onClick={() => onFinalizeExam(activeSession)}
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 shadow flex items-center gap-1.5 transition"
                >
                  <i className="fa-solid fa-paper-plane"></i> Finish & Submit
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. RESULT SCORECARD SCREEN */}
      {portalView === 'result' && examResult && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto mb-4">
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Assessment Complete
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-3">Great Job, {examResult.candidateName}!</h2>
          <p className="text-xs text-slate-500 mt-1">{examResult.examTitle} • Completed</p>

          {/* Score Breakdown Cards */}
          <div className="grid grid-cols-3 gap-3 my-6 text-left">
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400">Score</span>
              <div className="text-xl font-bold text-indigo-600 mt-0.5">{examResult.scorePct}%</div>
              <span className="text-[11px] text-slate-500">
                {examResult.correctAnswers} / {examResult.totalQuestions} Correct
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400">Time Taken</span>
              <div className="text-xl font-bold text-slate-800 mt-0.5">
                {Math.floor(examResult.timeSpentSec / 60)}m {examResult.timeSpentSec % 60}s
              </div>
              <span className="text-[11px] text-emerald-600">Velocity: High</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400">Efficiency Index</span>
              <div className="text-xl font-bold text-emerald-600 mt-0.5">{examResult.efficiency}</div>
              <span className="text-[11px] text-slate-500">Benchmark: Top 15%</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onReturnToDashboard}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-chart-column"></i> Return to Efficiency Dashboard
            </button>
            <button
              onClick={() => setPortalView('lobby')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-rotate-right"></i> Take Another Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
