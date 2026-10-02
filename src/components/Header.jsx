import React from 'react';

export default function Header({ currentUser, activeTab, onTabChange, onLogout, onReturnToAdmin }) {
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Platform Info */}
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${isAdmin
                ? 'bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-indigo-100'
                : 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-100'
              }`}>
              <i className={isAdmin ? 'fa-solid fa-chart-pie text-lg' : 'fa-solid fa-graduation-cap text-lg'}></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-slate-900 tracking-tight">TotePulse</h1>
                {isAdmin ? (
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Admin Portal
                  </span>
                ) : (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Student Portal
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {isAdmin
                  ? 'All Exam Results, Question Builder & Efficiency Intelligence'
                  : 'Interactive Technical Assessment & Question Sandbox'}
              </p>
            </div>
          </div>

          {/* Navigation Links based on role */}
          {isAdmin ? (
            <nav className="flex items-center space-x-1 sm:space-x-1.5">
              <button
                onClick={() => onTabChange('dashboard')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'dashboard'
                    ? 'text-indigo-600 bg-indigo-50 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
              >
                <i className="fa-solid fa-gauge-high"></i> <span className="hidden md:inline">Exam Results & Analytics</span>
              </button>

              <button
                onClick={() => onTabChange('assessments')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'assessments'
                    ? 'text-indigo-600 bg-indigo-50 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
              >
                <i className="fa-solid fa-file-signature"></i> <span className="hidden md:inline">Question Bank</span>
              </button>

              <button
                onClick={() => onTabChange('gforms-importer')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'gforms-importer'
                    ? 'text-emerald-700 bg-emerald-50 font-bold border border-emerald-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
              >
                <i className="fa-solid fa-file-excel text-emerald-600"></i> <span className="hidden md:inline">Google Forms Import</span>
              </button>

              <button
                onClick={() => onTabChange('csv-importer')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'csv-importer'
                    ? 'text-indigo-600 bg-indigo-50 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
              >
                <i className="fa-solid fa-file-csv text-indigo-500"></i> <span className="hidden md:inline">CSV Questions</span>
              </button>

              <button
                onClick={() => onTabChange('teams')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'teams'
                    ? 'text-indigo-600 bg-indigo-50 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
              >
                <i className="fa-solid fa-users-gear"></i> <span className="hidden md:inline">Teams Roster</span>
              </button>

              <button
                onClick={() => onTabChange('admin-details')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'admin-details'
                    ? 'text-indigo-600 bg-indigo-50 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
              >
                <i className="fa-solid fa-sliders"></i> <span className="hidden md:inline">Admin Details</span>
              </button>
            </nav>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onReturnToAdmin}
                className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition shadow-indigo-100 hover:shadow"
                title="Return to Admin Dashboard"
              >
                <i className="fa-solid fa-arrow-left"></i>
                <span>Return to Admin Dashboard</span>
              </button>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full hidden md:inline-flex items-center gap-1.5">
                <i className="fa-solid fa-flask text-amber-500"></i> Test Drive Active
              </span>
            </div>
          )}

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-900">
                {isAdmin ? 'System Admin' : currentUser?.name}
              </div>
              <div className="text-[10px] text-slate-400">
                {isAdmin ? 'admin@TotePulse.io' : (currentUser?.email || 'Candidate')}
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Sign Out / Switch Login"
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-1.5 text-xs font-medium"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
