import React, { useState } from 'react';

const SAMPLE_CSV_CONTENT = `Prompt,OptionA,OptionB,OptionC,OptionD,CorrectIndex,Category
"What is the time complexity of searching an element in a balanced Binary Search Tree?","O(1)","O(log n)","O(n)","O(n log n)",1,"Data Structures"
"Which HTTP status code signifies that a resource was successfully created?","200 OK","201 Created","204 No Content","301 Moved Permanently",1,"API Design"
"What mechanism prevents SQL injection vulnerabilities in backend queries?","Base64 encoding","Prepared Statements / Parameterized Queries","Input regex validation only","MD5 hashing",1,"Security"
"In Docker, what is the role of a .dockerignore file?","Excludes files from container execution only","Excludes build artifacts and secrets from the Docker build context","Encrypts Dockerfile instructions","Limits CPU quota",1,"DevOps"
"Which Garbage Collection phase in Java stops the world to mark live objects?","Minor GC only","Concurrent Mark","Stop-the-World (STW) Pause","Compaction only",2,"JVM Performance"`;

export default function CsvQuestionImporter({ exams, onImportToExistingExam, onCreateExamFromCsv, onShowToast }) {
  const [csvText, setCsvText] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [importMode, setImportMode] = useState('new'); // 'new' | 'existing'
  const [selectedExamId, setSelectedExamId] = useState(exams[0]?.id || '');

  // New exam metadata
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamCategory, setNewExamCategory] = useState('Technical Knowledge');
  const [newExamDuration, setNewExamDuration] = useState(15);
  const [newExamDesc, setNewExamDesc] = useState('Assessment imported via bulk CSV question bank.');

  // Parse CSV function supporting quotes and commas
  const parseCsv = (text) => {
    if (!text || !text.trim()) {
      setParsedQuestions([]);
      setValidationErrors([]);
      return;
    }

    const lines = text.trim().split(/\r\n|\n/);
    if (lines.length < 2) {
      setValidationErrors(['CSV must have at least a header row and one question row.']);
      setParsedQuestions([]);
      return;
    }

    const questions = [];
    const errors = [];

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Tokenize CSV line respecting double quotes
      const row = [];
      let inQuotes = false;
      let currentVal = '';

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"' && (j === 0 || line[j - 1] !== '\\')) {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(currentVal.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
          currentVal = '';
        } else {
          currentVal += char;
        }
      }
      row.push(currentVal.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

      // Validate columns
      // Expected format: Prompt, OptionA, OptionB, OptionC, OptionD, CorrectIndex (0-3), [Category]
      if (row.length < 6) {
        errors.push(`Row ${i + 1}: Insufficient columns (found ${row.length}, expected at least 6).`);
        continue;
      }

      const [prompt, optA, optB, optC, optD, rawCorrect, cat] = row;
      const correctIndex = parseInt(rawCorrect, 10);

      if (!prompt) {
        errors.push(`Row ${i + 1}: Question prompt is empty.`);
        continue;
      }
      if (!optA || !optB || !optC || !optD) {
        errors.push(`Row ${i + 1}: All 4 options (A, B, C, D) must be non-empty.`);
        continue;
      }
      if (isNaN(correctIndex) || correctIndex < 0 || correctIndex > 3) {
        errors.push(`Row ${i + 1}: Correct index must be an integer between 0 and 3 (0=A, 1=B, 2=C, 3=D). Found: "${rawCorrect}".`);
        continue;
      }

      questions.push({
        id: `csv-q-${Date.now()}-${i}`,
        text: prompt,
        options: [optA, optB, optC, optD],
        correctIndex,
        category: cat || 'General'
      });
    }

    setParsedQuestions(questions);
    setValidationErrors(errors);
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setCsvText(val);
    parseCsv(val);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setCsvText(content);
        parseCsv(content);
        onShowToast(`Uploaded "${file.name}" with ${content.split('\n').length - 1} rows!`, 'info');
      }
    };
    reader.readAsText(file);
  };

  const loadSampleCsv = () => {
    setCsvText(SAMPLE_CSV_CONTENT);
    parseCsv(SAMPLE_CSV_CONTENT);
    setNewExamTitle('Core Engineering Standards & System Safety');
    onShowToast('Sample CSV loaded with 5 technical questions!', 'success');
  };

  const downloadSampleTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'TotePulse_question_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Question template CSV downloaded!', 'success');
  };

  const handleExecuteImport = () => {
    if (parsedQuestions.length === 0) {
      onShowToast('Please provide valid CSV questions before importing.', 'error');
      return;
    }

    if (importMode === 'existing') {
      onImportToExistingExam(selectedExamId, parsedQuestions);
      onShowToast(`Successfully appended ${parsedQuestions.length} questions to assessment!`, 'success');
    } else {
      if (!newExamTitle.trim()) {
        onShowToast('Please provide an assessment title.', 'error');
        return;
      }
      onCreateExamFromCsv({
        title: newExamTitle.trim(),
        category: newExamCategory.trim() || 'Technical Assessment',
        durationMinutes: Number(newExamDuration) || 15,
        description: newExamDesc.trim(),
        questions: parsedQuestions
      });
      onShowToast(`Created new assessment "${newExamTitle}" with ${parsedQuestions.length} questions!`, 'success');
    }

    // Reset importer
    setCsvText('');
    setParsedQuestions([]);
    setValidationErrors([]);
    setNewExamTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-2">
            <i className="fa-solid fa-file-csv"></i> Admin Question Bank Utility
          </div>
          <h2 className="text-xl font-bold">CSV Question Bank Importer</h2>
          <p className="text-xs text-slate-300 mt-1">
            Bulk-import objective questions directly into existing examinations or publish a completely new assessment suite.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={loadSampleCsv}
            className="px-3.5 py-2 text-xs font-semibold bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-xl shadow transition flex items-center gap-1.5"
          >
            <i className="fa-solid fa-wand-magic-sparkles"></i> Load Sample CSV
          </button>
          <button
            type="button"
            onClick={downloadSampleTemplate}
            className="px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition flex items-center gap-1.5"
          >
            <i className="fa-solid fa-download"></i> Download Template
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: CSV Input & Upload */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <i className="fa-solid fa-cloud-arrow-up text-indigo-600"></i> Upload or Paste CSV
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Format: Prompt, A, B, C, D, CorrectIndex(0-3), Cat</span>
          </div>

          {/* Drag & Drop File Zone */}
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition flex flex-col items-center justify-center relative cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg mb-2">
              <i className="fa-solid fa-file-arrow-up"></i>
            </div>
            <p className="text-xs font-semibold text-slate-700">Click to upload CSV or drag and drop</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Supports standard UTF-8 CSV files</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Raw CSV Content Editor
            </label>
            <textarea
              rows={8}
              value={csvText}
              onChange={handleTextChange}
              placeholder='Prompt,OptionA,OptionB,OptionC,OptionD,CorrectIndex,Category&#10;"What is CAP?","Consist","Avail","Part","All",3,"Arch"'
              className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50"
            ></textarea>
          </div>

          {/* Validation Errors Box */}
          {validationErrors.length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-rose-700">
                <i className="fa-solid fa-triangle-exclamation"></i> CSV Validation Issues ({validationErrors.length})
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-700 max-h-28 overflow-y-auto">
                {validationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Import Destination Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <i className="fa-solid fa-bullseye text-indigo-600"></i> Import Destination
            </h3>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setImportMode('new')}
                className={`py-2 font-bold rounded-lg transition ${importMode === 'new' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Create New Exam
              </button>
              <button
                type="button"
                onClick={() => setImportMode('existing')}
                className={`py-2 font-bold rounded-lg transition ${importMode === 'existing' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Append to Existing
              </button>
            </div>

            {importMode === 'new' ? (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Assessment Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Distributed Consensus & Raft"
                    value={newExamTitle}
                    onChange={e => setNewExamTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Skill Category
                    </label>
                    <input
                      type="text"
                      value={newExamCategory}
                      onChange={e => setNewExamCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Time (Mins)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={newExamDuration}
                      onChange={e => setNewExamDuration(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={newExamDesc}
                    onChange={e => setNewExamDesc(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Target Assessment
                  </label>
                  <select
                    value={selectedExamId}
                    onChange={e => setSelectedExamId(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    {exams.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.title} ({e.questions.length} existing Qs)
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-slate-500">
                  Imported questions will be appended immediately to the chosen assessment rubric.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
              <span>Ready to Import:</span>
              <span className="font-bold text-indigo-600 text-sm">{parsedQuestions.length} Questions</span>
            </div>

            <button
              type="button"
              disabled={parsedQuestions.length === 0}
              onClick={handleExecuteImport}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-file-import"></i> Publish Imported Questions
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview Table of Parsed Questions */}
      {parsedQuestions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Parsed Questions Preview ({parsedQuestions.length} valid)
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">Correct answers are highlighted in emerald</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 w-12">#</th>
                  <th className="py-2.5 px-4">Question Prompt</th>
                  <th className="py-2.5 px-3">Option A</th>
                  <th className="py-2.5 px-3">Option B</th>
                  <th className="py-2.5 px-3">Option C</th>
                  <th className="py-2.5 px-3">Option D</th>
                  <th className="py-2.5 px-3 text-center">Correct</th>
                  <th className="py-2.5 px-3">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {parsedQuestions.map((q, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-xs">{q.text}</td>
                    <td className={`py-3 px-3 ${q.correctIndex === 0 ? 'bg-emerald-50 text-emerald-800 font-semibold' : ''}`}>
                      {q.options[0]}
                    </td>
                    <td className={`py-3 px-3 ${q.correctIndex === 1 ? 'bg-emerald-50 text-emerald-800 font-semibold' : ''}`}>
                      {q.options[1]}
                    </td>
                    <td className={`py-3 px-3 ${q.correctIndex === 2 ? 'bg-emerald-50 text-emerald-800 font-semibold' : ''}`}>
                      {q.options[2]}
                    </td>
                    <td className={`py-3 px-3 ${q.correctIndex === 3 ? 'bg-emerald-50 text-emerald-800 font-semibold' : ''}`}>
                      {q.options[3]}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-700">
                      Option {String.fromCharCode(65 + q.correctIndex)}
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-medium">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px]">
                        {q.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
