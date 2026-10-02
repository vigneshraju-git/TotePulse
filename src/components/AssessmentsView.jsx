import React from 'react';

export default function AssessmentsView({
  exams,
  submissions,
  onCreateExam,
  onOpenCsvImporter,
  onShareExam,
  onPreviewExam
}) {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <h2 className="text-xl font-bold">Assessment Registry & Question Builder</h2>
          <p className="text-slate-300 text-xs mt-1">
            Manage exam rubrics, curate question banks, and dispatch student test invitation links.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenCsvImporter}
            className="px-3.5 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-xs font-semibold rounded-xl shadow transition flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-file-csv"></i> Import via CSV
          </button>
          <button
            onClick={onCreateExam}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-circle-plus"></i> Create New Assessment
          </button>
        </div>
      </div>

      {/* Assessment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {exams.map(exam => {
          const subsForThis = submissions.filter(s => s.examId === exam.id);
          const avgScore =
            subsForThis.length > 0
              ? Math.round(subsForThis.reduce((acc, cur) => acc + (cur.score / cur.total) * 100, 0) / subsForThis.length)
              : 0;

          return (
            <div
              key={exam.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {exam.category}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    <i className="fa-regular fa-clock mr-1"></i>
                    {exam.durationMinutes} min
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-1">{exam.title}</h3>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2">{exam.description}</p>

                <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-3 gap-2 text-center text-xs mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Questions</span>
                    <div className="font-bold text-slate-800 text-sm mt-0.5">{exam.questions.length}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Attempts</span>
                    <div className="font-bold text-slate-800 text-sm mt-0.5">{subsForThis.length}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Cohort Avg</span>
                    <div className="font-bold text-indigo-600 text-sm mt-0.5">{avgScore}%</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onShareExam(exam)}
                  className="flex-1 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow transition flex items-center justify-center gap-1.5"
                >
                  <i className="fa-solid fa-share-nodes"></i> Share Exam Link
                </button>
                <button
                  onClick={() => onPreviewExam(exam)}
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                  title="Preview & Test Assessment"
                >
                  <i className="fa-solid fa-list-check"></i>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
