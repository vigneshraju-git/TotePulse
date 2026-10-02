import React, { useState } from 'react';

/**
 * Modal to publish a new assessment and initial question
 */
export function CreateExamModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    durationMinutes: 10,
    description: '',
    qPrompt: '',
    opt0: '',
    opt1: '',
    opt2: '',
    opt3: '',
    correctIndex: 0
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      title: '',
      category: '',
      durationMinutes: 10,
      description: '',
      qPrompt: '',
      opt0: '',
      opt1: '',
      opt2: '',
      opt3: '',
      correctIndex: 0
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <i className="fa-solid fa-file-circle-plus text-indigo-600"></i> Create Assessment & Questions
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Assessment Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Microservices & Distributed Caching"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Target Skill Category
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Backend Architecture"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Time Limit (Minutes)
              </label>
              <input
                type="number"
                min="1"
                max="180"
                required
                value={formData.durationMinutes}
                onChange={e => setFormData({ ...formData, durationMinutes: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Brief Description
            </label>
            <textarea
              rows="2"
              placeholder="Evaluation criteria for scalable system patterns..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Initial Question Builder */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Initial Question Spec</span>
              <span className="text-[10px] text-slate-500">Single Choice Objective</span>
            </div>

            <input
              type="text"
              required
              placeholder="Enter question prompt..."
              value={formData.qPrompt}
              onChange={e => setFormData({ ...formData, qPrompt: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            />

            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                required
                placeholder="Option A"
                value={formData.opt0}
                onChange={e => setFormData({ ...formData, opt0: e.target.value })}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
              />
              <input
                type="text"
                required
                placeholder="Option B"
                value={formData.opt1}
                onChange={e => setFormData({ ...formData, opt1: e.target.value })}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
              />
              <input
                type="text"
                required
                placeholder="Option C"
                value={formData.opt2}
                onChange={e => setFormData({ ...formData, opt2: e.target.value })}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
              />
              <input
                type="text"
                required
                placeholder="Option D"
                value={formData.opt3}
                onChange={e => setFormData({ ...formData, opt3: e.target.value })}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Correct Answer</label>
              <select
                value={formData.correctIndex}
                onChange={e => setFormData({ ...formData, correctIndex: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="0">Option A</option>
                <option value="1">Option B</option>
                <option value="2">Option C</option>
                <option value="3">Option D</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow transition"
            >
              Publish Assessment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Modal to copy shareable test invite link or test drive immediately
 */
export function ShareExamModal({ isOpen, exam, onClose, onCopy, onTestDrive }) {
  if (!isOpen || !exam) return null;

  const shareUrl = `${window.location.origin}${window.location.pathname}?examId=${exam.id}&accessKey=TEST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center">
        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
          <i className="fa-solid fa-link"></i>
        </div>
        <h3 className="font-bold text-slate-900 text-base">{exam.title}</h3>
        <p className="text-xs text-slate-500 mt-1">Send this secured invitation link to students or team members to take the test.</p>

        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="text-xs bg-transparent border-none text-slate-600 font-mono w-full focus:outline-none select-all truncate"
          />
          <button
            onClick={() => onCopy(shareUrl)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow shrink-0 flex items-center gap-1 transition"
          >
            <i className="fa-regular fa-copy"></i> Copy
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={onTestDrive}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <i className="fa-solid fa-play"></i> Test Drive Exam Now
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Modal to register candidate student into a squad
 */
export function AddStudentModal({ isOpen, teams, onClose, onRegister }) {
  const [name, setName] = useState('');
  const [teamId, setTeamId] = useState(teams[0]?.id || '');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onRegister(name.trim(), teamId || teams[0].id);
    setName('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-3">
          <i className="fa-solid fa-user-plus text-indigo-600"></i> Add Student Candidate
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Assign to Squad</label>
            <select
              value={teamId}
              onChange={e => setTeamId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {teams.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
