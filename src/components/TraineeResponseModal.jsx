import React from 'react';

export default function TraineeResponseModal({ isOpen, trainee, submission, onClose }) {
  if (!isOpen || !trainee) return null;

  const answers = submission?.answersDetail || {};
  const questionKeys = Object.keys(answers);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-bold text-base flex items-center justify-center shadow-sm">
              {trainee.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-lg">{trainee.name}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                  {trainee.empCode}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  trainee.performanceStatus === 'Proficient'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {trainee.performanceStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {trainee.email} • {trainee.teamId === 'team-denial' ? 'Denial Management' : 'Accounts Receivable (AR)'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Trainee Meta Matrix Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400">Previous Squad</span>
            <div className="font-bold text-slate-800 text-xs mt-0.5">{trainee.previousTeam || 'Claim Submission'}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Squad</span>
            <div className="font-bold text-indigo-600 text-xs mt-0.5">
              {trainee.teamId === 'team-denial' ? 'Denial' : 'AR'}
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400">Initial Score (10)</span>
            <div className="font-bold text-slate-900 text-sm mt-0.5">
              {trainee.initialScore} <span className="text-[11px] text-slate-500 font-normal">({(trainee.initialScore / 10) * 100}%)</span>
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400">Date of Joining</span>
            <div className="font-bold text-slate-800 text-xs mt-0.5">{trainee.doj}</div>
          </div>
        </div>

        {/* Trainer Comments */}
        {trainee.trainerComments && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl mb-5 flex items-start gap-2.5">
            <i className="fa-solid fa-comment-dots text-amber-600 text-sm mt-0.5 shrink-0"></i>
            <div>
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">Trainer Observation & Feedback</span>
              <p className="text-xs text-amber-800 mt-0.5 italic">"{trainee.trainerComments}"</p>
            </div>
          </div>
        )}

        {/* Questions and Submitted Answers */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-list-check text-indigo-600"></i> Google Forms Evaluation Responses ({questionKeys.length} Questions)
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              Timestamp: {submission?.timestamp || '2026-09-29'}
            </span>
          </div>

          {questionKeys.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No detailed question responses stored for this record.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {questionKeys.map((qText, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                  <div className="font-semibold text-slate-900 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{qText}</span>
                  </div>
                  <div className="pl-7 text-slate-700 bg-white p-2.5 rounded-lg border border-slate-100 leading-relaxed font-normal">
                    {answers[qText] || <span className="italic text-slate-400">No response provided</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="pt-5 border-t border-slate-100 flex justify-end mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition"
          >
            Close Scorecard
          </button>
        </div>
      </div>
    </div>
  );
}
