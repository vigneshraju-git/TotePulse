import React, { useState } from 'react';

export default function LoginView({ onLoginAdmin, onLoginStudent, onRegisterAndLoginStudent, students, teams }) {
  const [activeRoleTab, setActiveRoleTab] = useState('admin'); // 'admin' | 'student'
  const [adminEmail, setAdminEmail] = useState('admin@TotePulse.io');
  const [adminPassword, setAdminPassword] = useState('admin123');

  // Student login mode: 'existing' or 'custom'
  const [studentMode, setStudentMode] = useState('existing');
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [customName, setCustomName] = useState('');
  const [customTeamId, setCustomTeamId] = useState(teams[0]?.id || '');

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    onLoginAdmin();
  };

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    if (studentMode === 'existing') {
      if (selectedStudentId) {
        onLoginStudent(selectedStudentId);
      }
    } else {
      if (customName.trim()) {
        onRegisterAndLoginStudent(customName.trim(), customTeamId);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10">
        {/* App Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 mx-auto mb-4 text-2xl">
            <i className="fa-solid fa-chart-pie"></i>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            TotePulse
            <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Enterprise
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Assessment Orchestration & Team Efficiency Intelligence</p>
        </div>

        {/* Card Box */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
          {/* Role Tabs */}
          <div className="grid grid-cols-2 bg-slate-100 border-b border-slate-200 p-1.5 gap-1.5">
            <button
              type="button"
              onClick={() => setActiveRoleTab('admin')}
              className={`py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${activeRoleTab === 'admin'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <i className="fa-solid fa-shield-halved"></i>
              <span>Admin Login</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRoleTab('student')}
              className={`py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${activeRoleTab === 'student'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <i className="fa-solid fa-user-graduate"></i>
              <span>Student / Member</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* 1. ADMIN LOGIN FORM */}
            {activeRoleTab === 'admin' && (
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Admin Email</label>
                    <span className="text-[10px] text-indigo-600 font-semibold">Superuser</span>
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      placeholder="admin@TotePulse.io"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <i className="fa-regular fa-envelope absolute left-3 top-2.5 text-slate-400 text-xs"></i>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <i className="fa-solid fa-lock absolute left-3 top-2.5 text-slate-400 text-xs"></i>
                  </div>
                </div>

                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-[11px] text-indigo-800 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <i className="fa-solid fa-circle-check text-indigo-600"></i> Admin Access Includes:
                  </div>
                  <ul className="list-disc list-inside text-indigo-700 text-[10px] space-y-0.5">
                    <li>All candidate exam results & scorecards (persistent in local DB)</li>
                    <li>Question Bank & CSV Question Importer</li>
                    <li>Organization squads and candidate rosters</li>
                    <li>Admin benchmarks and system efficiency criteria</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-right-to-bracket"></i> Login as Administrator
                </button>

                <button
                  type="button"
                  onClick={onLoginAdmin}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-bolt text-amber-500"></i> One-Click Admin Demo Login
                </button>
              </form>
            )}

            {/* 2. STUDENT / MEMBER LOGIN FORM */}
            {activeRoleTab === 'student' && (
              <form onSubmit={handleStudentSubmit} className="space-y-4">
                {/* Mode Selector */}
                <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setStudentMode('existing')}
                    className={`py-1.5 font-bold rounded-lg transition ${studentMode === 'existing' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'
                      }`}
                  >
                    Select Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudentMode('custom')}
                    className={`py-1.5 font-bold rounded-lg transition ${studentMode === 'custom' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'
                      }`}
                  >
                    Enter My Name
                  </button>
                </div>

                {studentMode === 'existing' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Choose Candidate Profile
                    </label>
                    <select
                      value={selectedStudentId}
                      onChange={e => setSelectedStudentId(e.target.value)}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      {students.map(s => {
                        const team = teams.find(t => t.id === s.teamId);
                        return (
                          <option key={s.id} value={s.id}>
                            {s.name} — {team ? team.name.split('(')[0] : 'Squad Member'}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Vignesh R"
                        value={customName}
                        onChange={e => setCustomName(e.target.value)}
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Select Squad
                      </label>
                      <select
                        value={customTeamId}
                        onChange={e => setCustomTeamId(e.target.value)}
                        className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      >
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <i className="fa-solid fa-shield-halved text-emerald-600"></i> Local Database Active:
                  </div>
                  <p className="text-emerald-700 text-[10px]">
                    All mock scores are cleared. When you finish an exam, your score will be stored locally in the database and immediately appear on the Admin Dashboard!
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-play"></i> Enter Student Exam Portal
                </button>

                {/* Quick Student Selectors */}
                {studentMode === 'existing' && (
                  <div className="pt-2">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider text-center">
                      Quick Demo Candidates
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => onLoginStudent('s1')}
                        className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-left transition flex items-center gap-2"
                      >
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                          AP
                        </span>
                        <div className="truncate">
                          <div className="font-bold text-slate-800 truncate text-[11px]">Aarav Patel</div>
                          <div className="text-[9px] text-slate-400 truncate">Backend</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => onLoginStudent('s4')}
                        className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-left transition flex items-center gap-2"
                      >
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                          FA
                        </span>
                        <div className="truncate">
                          <div className="font-bold text-slate-800 truncate text-[11px]">Fatima Al-Sayed</div>
                          <div className="text-[9px] text-slate-400 truncate">Cloud Ops</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-6">
          TotePulse Enterprise • Local Database Active & Synchronized
        </p>
      </div>
    </div>
  );
}
