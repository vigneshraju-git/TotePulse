import React from 'react';

export default function TeamsView({
  teams,
  students,
  teamStatsMap,
  studentStatsMap,
  onAddStudent
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Organization Squads & Cohorts</h2>
          <p className="text-xs text-slate-500">Track cohort size, average completion velocity, aggregate mastery, and leadership standings.</p>
        </div>
        <button
          onClick={onAddStudent}
          className="px-3.5 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition flex items-center gap-2"
        >
          <i className="fa-solid fa-user-plus"></i> Add Student Candidate
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams.map(team => {
          const members = students.filter(s => s.teamId === team.id);
          const stats = teamStatsMap[team.id] || { avgScorePct: 0, efficiency: 0, completions: 0 };

          return (
            <div key={team.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Squad Unit</span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{team.name}</h3>
                  <p className="text-xs text-slate-500">
                    Lead: <span className="font-medium text-slate-700">{team.lead}</span>
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-indigo-600">{stats.efficiency}%</div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Efficiency Index</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Members</span>
                  <div className="font-bold text-slate-800 mt-0.5">{members.length}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Avg Score</span>
                  <div className="font-bold text-emerald-600 mt-0.5">{stats.avgScorePct}%</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Tests Taken</span>
                  <div className="font-bold text-slate-800 mt-0.5">{stats.completions}</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Team Candidates</h4>
                <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                  {members.map(m => {
                    const stStats = studentStatsMap[m.id] || { count: 0, avgPct: 0 };
                    return (
                      <div key={m.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-none text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                            {m.avatar}
                          </div>
                          <span className="font-semibold text-slate-800">{m.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500">{stStats.count} Completed</span>
                          <span className="font-bold text-indigo-600">{stStats.avgPct}% Avg</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
