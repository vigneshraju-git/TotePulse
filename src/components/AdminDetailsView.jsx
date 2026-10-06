import React, { useState } from 'react';

export default function AdminDetailsView({ onResetData, onClearSubmissions, onForceSyncDatabase, onShowToast, exams, students, submissions }) {
  const [accuracyWeight, setAccuracyWeight] = useState(70);
  const [velocityWeight, setVelocityWeight] = useState(30);
  const [passingThreshold, setPassingThreshold] = useState(75);
  const [proctoringStrictness, setProctoringStrictness] = useState('Standard');
  const [allowRetakes, setAllowRetakes] = useState(true);

  const handleSaveBenchmark = (e) => {
    e.preventDefault();
    onShowToast(`Efficiency formula updated: Accuracy ${accuracyWeight}% / Velocity ${velocityWeight}%!`, 'success');
  };

  const auditLogs = [
    { id: 1, action: 'Bulk CSV Question Bank Import', user: 'admin@TotePulse.io', time: '10 mins ago', type: 'create' },
    { id: 2, action: 'Student Registered: Aarav Patel', user: 'admin@TotePulse.io', time: '1 hour ago', type: 'user' },
    { id: 3, action: 'Assessment Created: System Design & High-Scalability', user: 'admin@TotePulse.io', time: '2 hours ago', type: 'exam' },
    { id: 4, action: 'Evaluated 48 candidate submissions across squads', user: 'System Worker', time: '3 hours ago', type: 'system' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wider">
              Administration & Governance
            </span>
            <span className="text-xs text-slate-400">Security Clearance: Tier-1 Superuser</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">Admin Level Settings & System Architecture</h2>
          <p className="text-xs text-slate-500">
            Fine-tune efficiency benchmark scoring rubrics, proctoring security parameters, and review system audit records.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ exams, students, submissions }, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `TotePulse_enterprise_audit_${Date.now()}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            onShowToast('Enterprise diagnostic data exported as JSON!', 'success');
          }}
          className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow transition flex items-center gap-2"
        >
          <i className="fa-solid fa-file-export"></i> Export Diagnostic Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Efficiency Weights & Policies */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveBenchmark} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Efficiency Index Calculation Engine</h3>
                <p className="text-xs text-slate-500">Tune the multi-factor weighted equation applied across all team cohorts</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600 font-mono">v2.4 Live</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Accuracy Score Weight</span>
                  <span className="text-indigo-600">{accuracyWeight}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="90"
                  value={accuracyWeight}
                  onChange={e => {
                    const acc = Number(e.target.value);
                    setAccuracyWeight(acc);
                    setVelocityWeight(100 - acc);
                  }}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Velocity & Completion Speed Factor</span>
                  <span className="text-emerald-600">{velocityWeight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={velocityWeight}
                  onChange={e => {
                    const vel = Number(e.target.value);
                    setVelocityWeight(vel);
                    setAccuracyWeight(100 - vel);
                  }}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                    Passing Grade Benchmark (%)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={passingThreshold}
                    onChange={e => setPassingThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                    Assessment Proctoring Level
                  </label>
                  <select
                    value={proctoringStrictness}
                    onChange={e => setProctoringStrictness(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Standard">Standard (Countdown Timer)</option>
                    <option value="Strict">Strict (Browser Tab Monitor)</option>
                    <option value="Simulation">Simulation Sandbox</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="retakeToggle"
                  checked={allowRetakes}
                  onChange={e => setAllowRetakes(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label htmlFor="retakeToggle" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Allow candidates to attempt multiple evaluations for iterative performance tracking
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow transition"
              >
                Save Benchmark Configuration
              </button>
            </div>
          </form>

          {/* Audit Logs */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <i className="fa-solid fa-list-check text-indigo-600"></i> Admin Action Audit Trail
              </h3>
              <span className="text-[11px] text-slate-400">Real-time ledger</span>
            </div>

            <div className="divide-y divide-slate-100">
              {auditLogs.map(log => (
                <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs">
                      <i className="fa-solid fa-shield-halved"></i>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{log.action}</div>
                      <div className="text-[10px] text-slate-400">Initiator: {log.user}</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: System Health & Maintenance */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <i className="fa-solid fa-server text-emerald-600"></i> Platform Health Diagnostics
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Database Engine</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Online (Indexed)
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Evaluations Recorded</span>
                <span className="font-bold text-slate-900">{submissions.length} Submissions</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Registered Candidates</span>
                <span className="font-bold text-slate-900">{students.length} Students</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Active Assessments</span>
                <span className="font-bold text-slate-900">{exams.length} Exams</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500">Total Question Items</span>
                <span className="font-bold text-indigo-600">
                  {exams.reduce((acc, curr) => acc + curr.questions.length, 0)} Items
                </span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
              <i className="fa-solid fa-database text-amber-600"></i> Local Database Management
            </div>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Google Forms RCM dataset (8 trainees, 20 submissions across 4 exams, verbatim answers) is stored locally in IndexedDB & localStorage. You can re-sync or reset anytime.
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={onForceSyncDatabase}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
              >
                <i className="fa-solid fa-cloud-arrow-down"></i> Force Sync Google Forms Data to DB
              </button>
              <button
                type="button"
                onClick={onClearSubmissions}
                className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
              >
                <i className="fa-solid fa-trash-can"></i> Clear All Submissions (Fresh Run)
              </button>
              <button
                type="button"
                onClick={onResetData}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
              >
                <i className="fa-solid fa-rotate-left"></i> Reset Database to Factory State
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
