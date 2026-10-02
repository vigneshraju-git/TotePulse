import React, { useState, useEffect, useRef } from 'react';
import { calculateEfficiency } from '../utils/analytics';

export default function StudentPortalView({
  student,
  team,
  exams,
  submissions,
  onSaveSubmission,
  onShowToast,
  onReturnToAdmin
}) {
  const [activeScreen, setActiveScreen] = useState('list'); // 'list' | 'active' | 'result'
  const [selectedExam, setSelectedExam] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [secondsRemaining, setSecondsRemaining] = useState(600);
  const [totalSecondsAllotted, setTotalSecondsAllotted] = useState(600);
  const [latestResult, setLatestResult] = useState(null);

  const timerRef = useRef(null);

  // Student's personal submissions only
  const mySubmissions = submissions.filter(s => s.studentId === student.id);

  // Start exam session
  const startExam = (exam) => {
    const allotted = exam.durationMinutes * 60;
    setSelectedExam(exam);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSecondsRemaining(allotted);
    setTotalSecondsAllotted(allotted);
    setActiveScreen('active');
    onShowToast(`Started assessment: ${exam.title}`, 'info');
  };

  // Timer countdown
  useEffect(() => {
    if (activeScreen === 'active' && selectedExam) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            onShowToast('Time limit reached! Submitting your exam automatically...', 'info');
            finalizeSubmission();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeScreen, selectedExam]);

  const selectOption = (optIndex) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optIndex
    }));
  };

  const finalizeSubmission = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!selectedExam) return;

    let correctCount = 0;
    selectedExam.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const timeSpent = Math.max(10, totalSecondsAllotted - secondsRemaining);
    const totalQuestions = selectedExam.questions.length;
    const scorePct = Math.round((correctCount / totalQuestions) * 100);
    const efficiency = calculateEfficiency(correctCount, totalQuestions, timeSpent, totalSecondsAllotted);

    const submissionRecord = {
      id: `sub-${Date.now()}`,
      studentId: student.id,
      examId: selectedExam.id,
      score: correctCount,
      total: totalQuestions,
      timeSpentSec: timeSpent,
      date: new Date().toISOString().split('T')[0]
    };

    onSaveSubmission(submissionRecord);

    setLatestResult({
      examTitle: selectedExam.title,
      scorePct,
      correctCount,
      totalQuestions,
      timeSpentSec: timeSpent,
      efficiency
    });

    setActiveScreen('result');
    onShowToast(`Exam submitted! Score: ${scorePct}%, Efficiency: ${efficiency}`, 'success');
  };

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Test Drive / Admin Quick-Return Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 rounded-2xl shadow-md border border-indigo-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center text-base shrink-0">
            <i className="fa-solid fa-flask"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-white">Test Drive Mode Active</span>
              <span className="text-[10px] font-mono bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded border border-indigo-400/20">
                Logged in as: {student.name}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              You are testing the candidate portal as <strong>{student.name}</strong>. All admin controls remain accessible anytime.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onReturnToAdmin}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2 shrink-0 border border-indigo-400/30"
        >
          <i className="fa-solid fa-arrow-left"></i>
          <span>Return to Admin Dashboard</span>
        </button>
      </div>

      {/* Student Welcome Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-bold text-base flex items-center justify-center shadow-md shadow-emerald-200">
            {student.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{student.name}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                Candidate Member
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Assigned Cohort: <span className="font-semibold text-slate-700">{team ? team.name : 'General Candidate'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="text-right">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Completed Tests</span>
            <span className="font-bold text-slate-800 text-sm">{mySubmissions.length} Tests</span>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div className="text-right">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Average Score</span>
            <span className="font-bold text-emerald-600 text-sm">
              {mySubmissions.length > 0
                ? Math.round(mySubmissions.reduce((acc, c) => acc + (c.score / c.total) * 100, 0) / mySubmissions.length)
                : 0}
              %
            </span>
          </div>
        </div>
      </div>

      {/* 1. EXAMS LIST SCREEN */}
      {activeScreen === 'list' && (
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Assigned Technical Evaluations</h3>
            <p className="text-xs text-slate-500">Select an assessment to begin answering technical question items under timed conditions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {exams.map(exam => {
              const previousAttempt = mySubmissions.find(s => s.examId === exam.id);

              return (
                <div
                  key={exam.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {exam.category}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        <i className="fa-regular fa-clock mr-1"></i>
                        {exam.durationMinutes} min
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base mb-1">{exam.title}</h4>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">{exam.description}</p>

                    <div className="bg-slate-50 rounded-xl p-3 flex justify-between items-center text-xs mb-4">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Questions</span>
                        <div className="font-bold text-slate-800 text-sm mt-0.5">{exam.questions.length} Items</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Status</span>
                        <div className="text-xs font-semibold mt-0.5">
                          {previousAttempt ? (
                            <span className="text-emerald-600 font-bold">
                              Completed ({Math.round((previousAttempt.score / previousAttempt.total) * 100)}%)
                            </span>
                          ) : (
                            <span className="text-amber-600 font-medium">Pending Attempt</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => startExam(exam)}
                    className="w-full py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow transition flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-play text-[11px]"></i>
                    {previousAttempt ? 'Retake Assessment' : 'Start Assessment'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Student's Personal Submission History */}
          {mySubmissions.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  My Completed Test Scorecards ({mySubmissions.length})
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Assessment Title</th>
                      <th className="py-2.5 px-3">Date Completed</th>
                      <th className="py-2.5 px-3">Score</th>
                      <th className="py-2.5 px-3">Time Spent</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {mySubmissions.map(sub => {
                      const examObj = exams.find(e => e.id === sub.examId);
                      const pct = Math.round((sub.score / sub.total) * 100);

                      return (
                        <tr key={sub.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {examObj ? examObj.title : 'Assessment'}
                          </td>
                          <td className="py-3 px-3 text-slate-500">{sub.date}</td>
                          <td className="py-3 px-3">
                            <span className={`font-bold ${pct >= 75 ? 'text-emerald-600' : 'text-slate-800'}`}>
                              {pct}% ({sub.score}/{sub.total})
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-500">
                            {Math.floor(sub.timeSpentSec / 60)}m {sub.timeSpentSec % 60}s
                          </td>
                          <td className="py-3 px-3">
                            {pct >= 75 ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                Passed
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold">
                                Completed
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. ACTIVE TIMED EXAM SCREEN */}
      {activeScreen === 'active' && selectedExam && (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 text-white p-5 flex flex-wrap justify-between items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/30 text-emerald-300 rounded border border-emerald-400/30 uppercase tracking-wider">
                  Live Assessment
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-400/30">
                  Test Drive
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">{selectedExam.title}</h3>
              <p className="text-xs text-slate-400">Candidate: {student.name}</p>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-3 bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-700">
                <i className="fa-regular fa-clock text-amber-400 text-sm animate-pulse"></i>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Remaining</div>
                  <div className="font-mono text-sm font-bold text-white">{formatTimer(secondsRemaining)}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (timerRef.current) clearInterval(timerRef.current);
                  setActiveScreen('list');
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
                title="Cancel and exit exam"
              >
                <i className="fa-solid fa-xmark"></i> Exit Exam
              </button>

              <button
                type="button"
                onClick={() => {
                  if (timerRef.current) clearInterval(timerRef.current);
                  onReturnToAdmin();
                }}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5"
                title="Return directly to Admin Dashboard"
              >
                <i className="fa-solid fa-arrow-left"></i> Admin Dashboard
              </button>
            </div>
          </div>

          {/* Progress Bullets */}
          <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-600">
              Question <span className="text-emerald-700 font-bold">{currentQuestionIndex + 1}</span> of{' '}
              <span>{selectedExam.questions.length}</span>
            </div>
            <div className="flex gap-1.5">
              {selectedExam.questions.map((q, idx) => {
                const isAnswered = answers[idx] !== undefined;
                const isCurrent = idx === currentQuestionIndex;
                let colorClass = 'bg-slate-200 text-slate-600';
                if (isCurrent) colorClass = 'bg-emerald-600 text-white ring-2 ring-emerald-300';
                else if (isAnswered) colorClass = 'bg-emerald-500 text-white';

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentQuestionIndex(idx)}
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
              {currentQuestionIndex + 1}. {selectedExam.questions[currentQuestionIndex].text}
            </div>

            {/* Options */}
            <div className="space-y-3">
              {selectedExam.questions[currentQuestionIndex].options.map((opt, idx) => {
                const isSelected = answers[currentQuestionIndex] === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectOption(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-1 ring-emerald-600'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-300 text-slate-500'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                    {isSelected && <i className="fa-solid fa-circle-check text-emerald-600"></i>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <button
              type="button"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <i className="fa-solid fa-arrow-left mr-1"></i> Previous
            </button>

            <div className="flex gap-2">
              {currentQuestionIndex < selectedExam.questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 shadow transition"
                >
                  Next Question <i className="fa-solid fa-arrow-right ml-1"></i>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={finalizeSubmission}
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
      {activeScreen === 'result' && latestResult && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto mb-4">
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Assessment Submitted
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-3">Great Job, {student.name}!</h2>
          <p className="text-xs text-slate-500 mt-1">{latestResult.examTitle} • Completed</p>

          {/* Score Breakdown Cards */}
          <div className="grid grid-cols-3 gap-3 my-6 text-left">
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400">Score</span>
              <div className="text-xl font-bold text-emerald-600 mt-0.5">{latestResult.scorePct}%</div>
              <span className="text-[11px] text-slate-500">
                {latestResult.correctCount} / {latestResult.totalQuestions} Correct
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400">Time Taken</span>
              <div className="text-xl font-bold text-slate-800 mt-0.5">
                {Math.floor(latestResult.timeSpentSec / 60)}m {latestResult.timeSpentSec % 60}s
              </div>
              <span className="text-[11px] text-emerald-600">Velocity: High</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400">Efficiency Index</span>
              <div className="text-xl font-bold text-emerald-600 mt-0.5">{latestResult.efficiency}</div>
              <span className="text-[11px] text-slate-500">Rank: Proficient</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setActiveScreen('list')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-list-check"></i> Return to My Examinations
            </button>
            <button
              onClick={onReturnToAdmin}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-arrow-left"></i> Return to Admin Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
