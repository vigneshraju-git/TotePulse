import React, { useState } from 'react';

export default function GoogleFormsImporter({ onImportCompleted, onShowToast }) {
  const [inputText, setInputText] = useState('');
  const [examTitle, setExamTitle] = useState('Google Forms Assessment Result');
  const [parsedRows, setParsedRows] = useState([]);
  const [identifiedQuestions, setIdentifiedQuestions] = useState([]);

  // Parse Google Forms CSV or pasted TSV/CSV
  const handleParse = (text) => {
    if (!text || !text.trim()) {
      setParsedRows([]);
      setIdentifiedQuestions([]);
      return;
    }

    const lines = text.trim().split(/\r\n|\n/);
    if (lines.length < 2) {
      onShowToast('Spreadsheet must contain a header row and at least one student response row.', 'error');
      return;
    }

    // Determine delimiter (comma or tab)
    const firstLine = lines[0];
    const delimiter = firstLine.includes('\t') ? '\t' : ',';

    const parseLine = (line) => {
      const result = [];
      let inQuotes = false;
      let cur = '';
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"' && (i === 0 || line[i - 1] !== '\\')) {
          inQuotes = !inQuotes;
        } else if (c === delimiter && !inQuotes) {
          result.push(cur.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
          cur = '';
        } else {
          cur += c;
        }
      }
      result.push(cur.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
      return result;
    };

    const headers = parseLine(lines[0]);

    // Find timestamp, email, score columns
    const tsIdx = headers.findIndex(h => h.toLowerCase().includes('timestamp'));
    const emailIdx = headers.findIndex(h => h.toLowerCase().includes('email'));
    const scoreIdx = headers.findIndex(h => h.toLowerCase().includes('score') && !h.toLowerCase().includes('status'));

    // Question columns are columns starting with a number or after email
    const questionCols = headers.filter((h, idx) => {
      if (idx === tsIdx || idx === emailIdx || idx === scoreIdx) return false;
      return /^\d+\./.test(h.trim()) || h.includes('?') || idx > 2;
    });

    setIdentifiedQuestions(questionCols);

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const tokens = parseLine(line);

      const email = emailIdx !== -1 ? tokens[emailIdx] : `candidate${i}@applebilling.com`;
      const timestamp = tsIdx !== -1 ? tokens[tsIdx] : new Date().toISOString();
      const rawScore = scoreIdx !== -1 ? tokens[scoreIdx] : '';

      // Parse score if formatted as "8 / 10" or "7.25"
      let parsedScore = 0;
      let totalQuestions = questionCols.length || 10;
      if (rawScore && rawScore.includes('/')) {
        const parts = rawScore.split('/');
        parsedScore = parseFloat(parts[0]) || 0;
        totalQuestions = parseFloat(parts[1]) || totalQuestions;
      } else if (rawScore) {
        parsedScore = parseFloat(rawScore) || 0;
      }

      // Extract candidate name from email (e.g. jencysumap@... -> Jency Suma)
      let candidateName = email.split('@')[0];
      candidateName = candidateName
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();

      // Collect answers
      const answersMap = {};
      questionCols.forEach(qHeader => {
        const colIndex = headers.indexOf(qHeader);
        if (colIndex !== -1 && tokens[colIndex]) {
          answersMap[qHeader] = tokens[colIndex];
        }
      });

      rows.push({
        candidateName,
        email,
        timestamp,
        score: parsedScore,
        total: totalQuestions,
        answersMap
      });
    }

    setParsedRows(rows);
    onShowToast(`Detected ${rows.length} candidate submissions and ${questionCols.length} questions!`, 'info');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setInputText(content);
        handleParse(content);
      }
    };
    reader.readAsText(file);
  };

  const handleCommitImport = () => {
    if (parsedRows.length === 0) {
      onShowToast('Please parse valid Google Forms spreadsheet data first.', 'error');
      return;
    }

    onImportCompleted({
      title: examTitle.trim(),
      rows: parsedRows,
      questions: identifiedQuestions
    });

    setInputText('');
    setParsedRows([]);
    setIdentifiedQuestions([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-2">
            <i className="fa-solid fa-file-excel"></i> Google Forms & Sheets Integration
          </div>
          <h2 className="text-xl font-bold">Google Forms Exam Results Importer</h2>
          <p className="text-xs text-slate-300 mt-1">
            Import candidate responses, timestamps, question texts, and scores directly from Google Forms / Excel exports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow cursor-pointer transition flex items-center gap-1.5">
            <i className="fa-solid fa-file-arrow-up"></i> Upload .CSV / .XLSX
            <input type="file" accept=".csv, .tsv, .txt" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input Editor */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <i className="fa-solid fa-paste text-emerald-600"></i> Paste Google Forms Spreadsheet Content
            </h3>
            <span className="text-[11px] text-slate-400">Comma-separated or Tab-separated (Google Sheets)</span>
          </div>

          <textarea
            rows={9}
            value={inputText}
            onChange={e => {
              setInputText(e.target.value);
              handleParse(e.target.value);
            }}
            placeholder="Timestamp,Email Address,Score,1. Question text here...&#10;2026-09-29 07:57:23,jencysuma@applebilling.com,13.5 / 15,Patient responsibility is..."
            className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
          ></textarea>
        </div>

        {/* Right: Exam Meta & Commit */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <i className="fa-solid fa-gears text-indigo-600"></i> Target Assessment Info
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Assessment Title
              </label>
              <input
                type="text"
                value={examTitle}
                onChange={e => setExamTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl space-y-1 text-xs text-emerald-800">
              <div className="font-bold flex items-center gap-1.5">
                <i className="fa-solid fa-circle-check text-emerald-600"></i> Google Forms Auto-Mapping
              </div>
              <p className="text-[11px] text-emerald-700">
                Candidate names, emails, timestamps, questions, and responses will be parsed and injected into the local database.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center text-xs text-slate-500 mb-3">
              <span>Detected Submissions:</span>
              <span className="font-bold text-emerald-600 text-sm">{parsedRows.length} Trainees</span>
            </div>

            <button
              type="button"
              disabled={parsedRows.length === 0}
              onClick={handleCommitImport}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-cloud-arrow-down"></i> Save to Local Database
            </button>
          </div>
        </div>
      </div>

      {/* Preview Table */}
      {parsedRows.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Detected Trainee Submissions ({parsedRows.length})
            </h4>
            <span className="text-[11px] text-slate-500">
              {identifiedQuestions.length} Google Form Questions Identified
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Candidate Name</th>
                  <th className="py-2.5 px-3">Email Address</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {parsedRows.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">{r.candidateName}</td>
                    <td className="py-3 px-3 text-slate-500">{r.email}</td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">{r.timestamp}</td>
                    <td className="py-3 px-3 text-right font-bold text-indigo-600">
                      {r.score} / {r.total}
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
