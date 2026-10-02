import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import AssessmentsView from './components/AssessmentsView';
import CsvQuestionImporter from './components/CsvQuestionImporter';
import GoogleFormsImporter from './components/GoogleFormsImporter';
import TeamsView from './components/TeamsView';
import AdminDetailsView from './components/AdminDetailsView';
import StudentPortalView from './components/StudentPortalView';
import TraineeResponseModal from './components/TraineeResponseModal';
import { CreateExamModal, ShareExamModal, AddStudentModal } from './components/Modals';
import ToastContainer from './components/ToastContainer';
import { db } from './services/db';
import { calculateEfficiency, getStudentStats, getTeamEfficiency } from './utils/analytics';

export default function App() {
  // Persistent Auth State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('TotePulse_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default to admin for immediate exploration
    return { role: 'admin', name: 'System Administrator', email: 'admin@TotePulse.io' };
  });

  // Local Database Backed Global State
  const [teams, setTeams] = useState(() => db.getTeams());
  const [students, setStudents] = useState(() => db.getStudents());
  const [exams, setExams] = useState(() => db.getExams());
  const [submissions, setSubmissions] = useState(() => db.getSubmissions());
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'assessments' | 'gforms-importer' | 'csv-importer' | 'teams' | 'admin-details'

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareExam, setShareExam] = useState(null);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [inspectModal, setInspectModal] = useState({ isOpen: false, trainee: null, submission: null });

  // Toasts
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const handleDismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Save auth user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('TotePulse_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('TotePulse_auth_user');
    }
  }, [currentUser]);

  // Derived Analytics Computations
  const studentStatsMap = useMemo(() => {
    const map = {};
    students.forEach(student => {
      map[student.id] = getStudentStats(student.id, submissions, exams);
    });
    return map;
  }, [students, submissions, exams]);

  const teamStatsMap = useMemo(() => {
    const map = {};
    teams.forEach(team => {
      map[team.id] = getTeamEfficiency(team.id, students, submissions, exams);
    });
    return map;
  }, [teams, students, submissions, exams]);

  const overviewStats = useMemo(() => {
    let grandTotalEff = 0;
    submissions.forEach(s => {
      const exam = exams.find(e => e.id === s.examId);
      const allotted = (exam ? exam.durationMinutes : 15) * 60;
      grandTotalEff += calculateEfficiency(s.score, s.total, s.timeSpentSec, allotted);
    });
    const orgEfficiency = submissions.length > 0 ? (grandTotalEff / submissions.length).toFixed(1) : '49.0';

    let bestTeamName = 'Denial Management Squad';
    let bestTeamEff = -1;
    teams.forEach(t => {
      const stats = teamStatsMap[t.id];
      if (stats && stats.efficiency > bestTeamEff) {
        bestTeamEff = stats.efficiency;
        bestTeamName = t.name.split('(')[0].trim();
      }
    });

    return {
      orgEfficiency: `${orgEfficiency}%`,
      bestTeamName,
      activeExamsCount: exams.length,
      submissionsCount: submissions.length
    };
  }, [submissions, exams, teams, teamStatsMap]);

  /* ==========================================================
     AUTHENTICATION ACTIONS
     ========================================================== */
  const handleLoginAdmin = () => {
    const adminUser = { role: 'admin', name: 'System Administrator', email: 'admin@TotePulse.io' };
    setCurrentUser(adminUser);
    setActiveTab('dashboard');
    showToast('Logged in as Administrator (Full Access)', 'success');
  };

  const handleLoginStudent = (studentId, isTestDrive = false) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    const studentUser = { role: 'student', isTestDrive, ...student };
    setCurrentUser(studentUser);
    showToast(`Logged in as trainee: ${student.name}${isTestDrive ? ' (Test Drive Mode)' : ''}`, 'success');
  };

  const handleRegisterAndLoginStudent = (name, teamId) => {
    const initials =
      name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2) || 'TR';

    const newStudent = {
      id: `trainee-${Date.now()}`,
      name: name.trim(),
      empCode: `MSS/${Math.floor(600 + Math.random() * 200)}`,
      email: `${name.toLowerCase().replace(/\s+/g, '')}@applebillingcredentialing.com`,
      teamId,
      previousTeam: 'Checking',
      avatar: initials,
      initialScore: 5.0,
      performanceStatus: 'Needs Support',
      trainerComments: 'Newly registered candidate'
    };

    const updatedStudents = db.addStudent(newStudent);
    setStudents(updatedStudents);
    setCurrentUser({ role: 'student', ...newStudent });
    showToast(`Welcome ${newStudent.name}! You are registered in the local database.`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Successfully logged out.', 'info');
  };

  /* ==========================================================
     EXAM & QUESTION MANAGEMENT
     ========================================================== */
  const handleCreateExamSubmit = (formData) => {
    const newExam = {
      id: `exam-${Date.now()}`,
      title: formData.title.trim(),
      category: formData.category.trim(),
      durationMinutes: Number(formData.durationMinutes) || 15,
      description: formData.description.trim() || 'Custom assessment curated for team performance benchmarking.',
      questions: [
        {
          id: `q-${Date.now()}-1`,
          text: formData.qPrompt.trim(),
          options: [formData.opt0.trim(), formData.opt1.trim(), formData.opt2.trim(), formData.opt3.trim()],
          correctIndex: Number(formData.correctIndex) || 0
        }
      ]
    };

    const updated = db.addExam(newExam);
    setExams(updated);
    setIsCreateModalOpen(false);
    showToast(`Assessment "${newExam.title}" saved to local database!`, 'success');
  };

  const handleImportToExistingExam = (examId, newQuestions) => {
    const updated = db.appendQuestionsToExam(examId, newQuestions);
    setExams(updated);
  };

  const handleCreateExamFromCsv = (newExamData) => {
    const newExam = {
      id: `exam-csv-${Date.now()}`,
      ...newExamData
    };
    const updated = db.addExam(newExam);
    setExams(updated);
  };

  const handleGoogleFormsImportCompleted = ({ title, rows, questions }) => {
    const newExam = {
      id: `exam-gf-${Date.now()}`,
      title: title || 'Google Forms Assessment',
      category: 'RCM Google Forms Export',
      durationMinutes: 15,
      description: `Imported from Google Forms spreadsheet with ${questions.length} questions.`,
      questions: questions.map((qText, idx) => ({
        id: `q-gf-${idx}`,
        text: qText,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctIndex: 1
      }))
    };

    const newSubs = rows.map((r, idx) => ({
      id: `sub-gf-${Date.now()}-${idx}`,
      studentId: students.find(s => s.email.toLowerCase() === r.email.toLowerCase())?.id || students[0]?.id,
      studentName: r.candidateName,
      email: r.email,
      examId: newExam.id,
      examTitle: newExam.title,
      score: r.score,
      total: r.total,
      timeSpentSec: 450,
      date: r.timestamp.split(' ')[0] || new Date().toISOString().split('T')[0],
      timestamp: r.timestamp,
      answersDetail: r.answersMap
    }));

    db.addExam(newExam);
    setExams(db.getExams());

    newSubs.forEach(s => db.addSubmission(s));
    setSubmissions(db.getSubmissions());

    setActiveTab('dashboard');
    showToast(`Imported "${newExam.title}" with ${rows.length} trainee responses!`, 'success');
  };

  const handleRegisterStudent = (name, teamId) => {
    const initials =
      name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2) || 'TR';

    const newStudent = {
      id: `trainee-${Date.now()}`,
      name: name.trim(),
      empCode: `MSS/${Math.floor(600 + Math.random() * 200)}`,
      email: `${name.toLowerCase().replace(/\s+/g, '')}@applebillingcredentialing.com`,
      teamId,
      avatar: initials,
      initialScore: 5.0,
      performanceStatus: 'Needs Support'
    };

    const updated = db.addStudent(newStudent);
    setStudents(updated);
    setIsAddStudentOpen(false);
    const assignedTeam = teams.find(t => t.id === teamId);
    showToast(`Trainee ${newStudent.name} saved to ${assignedTeam ? assignedTeam.name.split('(')[0] : 'Squad'}!`, 'success');
  };

  const handleSaveStudentSubmission = (submissionRecord) => {
    const updated = db.addSubmission(submissionRecord);
    setSubmissions(updated);
  };

  const handleClearSubmissions = () => {
    const empty = db.clearSubmissions();
    setSubmissions(empty);
    showToast('All examination evaluations cleared from local database!', 'info');
  };

  const handleResetToDefaultState = () => {
    const fresh = db.resetToFreshState();
    setTeams(fresh.teams);
    setStudents(fresh.students);
    setExams(fresh.exams);
    setSubmissions(fresh.submissions);
    showToast('Local database restored to Google Forms RCM baseline data.', 'info');
  };

  const handleForceSyncDatabase = () => {
    const fresh = db.forceSyncGoogleFormsData();
    setTeams(fresh.teams);
    setStudents(fresh.students);
    setExams(fresh.exams);
    setSubmissions(fresh.submissions);
    showToast('Database forcefully synchronized with Google Forms records (10 Submissions, 5 Trainees)!', 'success');
  };

  const handleInspectTraineeResponses = (trainee, submission) => {
    setInspectModal({ isOpen: true, trainee, submission });
  };

  /* ==========================================================
     UNAUTHENTICATED SCREEN
     ========================================================== */
  if (!currentUser) {
    return (
      <>
        <LoginView
          onLoginAdmin={handleLoginAdmin}
          onLoginStudent={handleLoginStudent}
          onRegisterAndLoginStudent={handleRegisterAndLoginStudent}
          students={students}
          teams={teams}
        />
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
      </>
    );
  }

  /* ==========================================================
     AUTHENTICATED USER VIEWS
     ========================================================== */
  const isAdmin = currentUser.role === 'admin';
  const currentStudentTeam = !isAdmin ? teams.find(t => t.id === currentUser.teamId) : null;

  return (
    <div className="bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col font-sans">
      {/* Header with Role indicator & Logout */}
      <Header
        currentUser={currentUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        onReturnToAdmin={handleLoginAdmin}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ======================================================
            ADMIN ONLY VIEWS
            ====================================================== */}
        {isAdmin && (
          <>
            {/* VIEW 1: Dashboard with All Exam Results */}
            {activeTab === 'dashboard' && (
              <DashboardView
                teams={teams}
                students={students}
                exams={exams}
                submissions={submissions}
                studentStatsMap={studentStatsMap}
                teamStatsMap={teamStatsMap}
                overviewStats={overviewStats}
                onSimulateTest={(studentId) => {
                  handleLoginStudent(studentId, true);
                }}
                onViewTraineeResponses={handleInspectTraineeResponses}
              />
            )}

            {/* VIEW 2: Assessments & Question Bank */}
            {activeTab === 'assessments' && (
              <AssessmentsView
                exams={exams}
                submissions={submissions}
                onCreateExam={() => setIsCreateModalOpen(true)}
                onOpenCsvImporter={() => setActiveTab('csv-importer')}
                onShareExam={(exam) => {
                  setShareExam(exam);
                  setIsShareModalOpen(true);
                }}
                onPreviewExam={(exam) => {
                  showToast(`Previewing ${exam.title} (${exam.questions.length} Qs)`, 'info');
                }}
              />
            )}

            {/* VIEW 3: Google Forms Importer */}
            {activeTab === 'gforms-importer' && (
              <GoogleFormsImporter
                onImportCompleted={handleGoogleFormsImportCompleted}
                onShowToast={showToast}
              />
            )}

            {/* VIEW 4: CSV Question Input Screen */}
            {activeTab === 'csv-importer' && (
              <CsvQuestionImporter
                exams={exams}
                onImportToExistingExam={handleImportToExistingExam}
                onCreateExamFromCsv={handleCreateExamFromCsv}
                onShowToast={showToast}
              />
            )}

            {/* VIEW 5: Teams & Squads Roster */}
            {activeTab === 'teams' && (
              <TeamsView
                teams={teams}
                students={students}
                teamStatsMap={teamStatsMap}
                studentStatsMap={studentStatsMap}
                onAddStudent={() => setIsAddStudentOpen(true)}
              />
            )}

            {/* VIEW 6: Admin Details & Configuration */}
            {activeTab === 'admin-details' && (
              <AdminDetailsView
                exams={exams}
                students={students}
                submissions={submissions}
                onResetData={handleResetToDefaultState}
                onClearSubmissions={handleClearSubmissions}
                onForceSyncDatabase={handleForceSyncDatabase}
                onShowToast={showToast}
              />
            )}
          </>
        )}

        {/* ======================================================
            STUDENT ONLY VIEW (EXAM QUESTIONS ONLY)
            ====================================================== */}
        {!isAdmin && (
          <StudentPortalView
            student={currentUser}
            team={currentStudentTeam}
            exams={exams}
            submissions={submissions}
            onSaveSubmission={handleSaveStudentSubmission}
            onShowToast={showToast}
            onReturnToAdmin={handleLoginAdmin}
          />
        )}
      </main>

      {/* Admin Modals */}
      {isAdmin && (
        <>
          <CreateExamModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={handleCreateExamSubmit}
          />

          <ShareExamModal
            isOpen={isShareModalOpen}
            exam={shareExam}
            onClose={() => setIsShareModalOpen(false)}
            onCopy={() => {
              showToast('Assessment invite link copied to clipboard!', 'success');
            }}
            onTestDrive={() => {
              if (students.length > 0) {
                handleLoginStudent(students[0].id, true);
              }
              setIsShareModalOpen(false);
            }}
          />

          <AddStudentModal
            isOpen={isAddStudentOpen}
            teams={teams}
            onClose={() => setIsAddStudentOpen(false)}
            onRegister={handleRegisterStudent}
          />

          {/* Trainee Response Inspector Modal */}
          <TraineeResponseModal
            isOpen={inspectModal.isOpen}
            trainee={inspectModal.trainee}
            submission={inspectModal.submission}
            onClose={() => setInspectModal({ isOpen: false, trainee: null, submission: null })}
          />
        </>
      )}

      {/* Reactive Floating Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
