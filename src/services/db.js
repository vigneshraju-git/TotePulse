import { INITIAL_TEAMS, INITIAL_STUDENTS, INITIAL_EXAMS, INITIAL_SUBMISSIONS, COHORT_SUMMARY } from '../data/mockData';

const DB_VERSION_KEY = 'assesspulse_db_version_rcm_v9_full_production';

const KEYS = {
  SUBMISSIONS: 'assesspulse_db_rcm_submissions',
  EXAMS: 'assesspulse_db_rcm_exams',
  STUDENTS: 'assesspulse_db_rcm_students',
  TEAMS: 'assesspulse_db_rcm_teams',
  COHORT_SUMMARY: 'assesspulse_db_rcm_cohort_summary',
  SETTINGS: 'assesspulse_db_rcm_settings'
};

// Safe storage access
function readStorage(key, defaultValue) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    const parsed = JSON.parse(item);
    return parsed;
  } catch (err) {
    console.error(`Error reading ${key} from local database:`, err);
    return defaultValue;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to local database:`, err);
  }
}

// ==========================================================
// INDEXEDDB ENGINE INITIALIZATION
// ==========================================================
const IDB_NAME = 'AssessPulse_RCM_DB';
const IDB_VERSION = 1;

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    const req = window.indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('submissions')) {
        db.createObjectStore('submissions', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('exams')) {
        db.createObjectStore('exams', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('students')) {
        db.createObjectStore('students', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('teams')) {
        db.createObjectStore('teams', { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function syncToIndexedDB(storeName, items) {
  try {
    const idb = await openIndexedDB();
    if (!idb) return;
    const tx = idb.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    items.forEach(item => store.put(item));
  } catch (err) {
    console.warn(`IndexedDB sync warning for ${storeName}:`, err);
  }
}

// ==========================================================
// SEEDING AND VERIFICATION
// ==========================================================
function ensureDatabaseSeeded() {
  const currentVersion = localStorage.getItem(DB_VERSION_KEY);
  const existingSubs = readStorage(KEYS.SUBMISSIONS, null);

  // If new version OR if submissions are currently empty, force populate the Google Forms data!
  if (currentVersion !== 'true' || !existingSubs || existingSubs.length === 0) {
    writeStorage(KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    writeStorage(KEYS.EXAMS, INITIAL_EXAMS);
    writeStorage(KEYS.STUDENTS, INITIAL_STUDENTS);
    writeStorage(KEYS.TEAMS, INITIAL_TEAMS);
    writeStorage(KEYS.COHORT_SUMMARY, COHORT_SUMMARY);
    localStorage.setItem(DB_VERSION_KEY, 'true');

    // Also sync to IndexedDB
    syncToIndexedDB('submissions', INITIAL_SUBMISSIONS);
    syncToIndexedDB('exams', INITIAL_EXAMS);
    syncToIndexedDB('students', INITIAL_STUDENTS);
    syncToIndexedDB('teams', INITIAL_TEAMS);
  }
}

// Run immediately on file load
ensureDatabaseSeeded();

/**
 * AssessPulse Local Database Service
 */
export const db = {
  // --- SUBMISSIONS ---
  getSubmissions() {
    ensureDatabaseSeeded();
    const subs = readStorage(KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    if (!subs || subs.length === 0) {
      writeStorage(KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
      return INITIAL_SUBMISSIONS;
    }
    return subs;
  },

  saveSubmissions(submissions) {
    writeStorage(KEYS.SUBMISSIONS, submissions);
    syncToIndexedDB('submissions', submissions);
    return submissions;
  },

  addSubmission(submission) {
    const subs = this.getSubmissions();
    const updated = [submission, ...subs];
    this.saveSubmissions(updated);
    return updated;
  },

  clearSubmissions() {
    writeStorage(KEYS.SUBMISSIONS, []);
    return [];
  },

  // --- EXAMS & QUESTIONS ---
  getExams() {
    ensureDatabaseSeeded();
    const exams = readStorage(KEYS.EXAMS, INITIAL_EXAMS);
    if (!exams || exams.length === 0) {
      writeStorage(KEYS.EXAMS, INITIAL_EXAMS);
      return INITIAL_EXAMS;
    }
    return exams;
  },

  saveExams(exams) {
    writeStorage(KEYS.EXAMS, exams);
    syncToIndexedDB('exams', exams);
    return exams;
  },

  addExam(exam) {
    const exams = this.getExams();
    const updated = [exam, ...exams];
    this.saveExams(updated);
    return updated;
  },

  appendQuestionsToExam(examId, questions) {
    const exams = this.getExams();
    const updated = exams.map(e => {
      if (e.id === examId) {
        return { ...e, questions: [...e.questions, ...questions] };
      }
      return e;
    });
    this.saveExams(updated);
    return updated;
  },

  // --- STUDENTS / TRAINEES ---
  getStudents() {
    ensureDatabaseSeeded();
    const students = readStorage(KEYS.STUDENTS, INITIAL_STUDENTS);
    if (!students || students.length === 0) {
      writeStorage(KEYS.STUDENTS, INITIAL_STUDENTS);
      return INITIAL_STUDENTS;
    }
    return students;
  },

  saveStudents(students) {
    writeStorage(KEYS.STUDENTS, students);
    syncToIndexedDB('students', students);
    return students;
  },

  addStudent(student) {
    const students = this.getStudents();
    const updated = [...students, student];
    this.saveStudents(updated);
    return updated;
  },

  // --- TEAMS / SQUADS ---
  getTeams() {
    ensureDatabaseSeeded();
    const teams = readStorage(KEYS.TEAMS, INITIAL_TEAMS);
    if (!teams || teams.length === 0) {
      writeStorage(KEYS.TEAMS, INITIAL_TEAMS);
      return INITIAL_TEAMS;
    }
    return teams;
  },

  saveTeams(teams) {
    writeStorage(KEYS.TEAMS, teams);
    syncToIndexedDB('teams', teams);
    return teams;
  },

  // --- COHORT SUMMARY METRICS ---
  getCohortSummary() {
    return readStorage(KEYS.COHORT_SUMMARY, COHORT_SUMMARY);
  },

  // --- FORCE RELOAD GOOGLE FORMS DATA ---
  forceSyncGoogleFormsData() {
    writeStorage(KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    writeStorage(KEYS.EXAMS, INITIAL_EXAMS);
    writeStorage(KEYS.STUDENTS, INITIAL_STUDENTS);
    writeStorage(KEYS.TEAMS, INITIAL_TEAMS);
    writeStorage(KEYS.COHORT_SUMMARY, COHORT_SUMMARY);
    localStorage.setItem(DB_VERSION_KEY, 'true');

    syncToIndexedDB('submissions', INITIAL_SUBMISSIONS);
    syncToIndexedDB('exams', INITIAL_EXAMS);
    syncToIndexedDB('students', INITIAL_STUDENTS);
    syncToIndexedDB('teams', INITIAL_TEAMS);

    return {
      submissions: INITIAL_SUBMISSIONS,
      exams: INITIAL_EXAMS,
      students: INITIAL_STUDENTS,
      teams: INITIAL_TEAMS,
      cohortSummary: COHORT_SUMMARY
    };
  },

  // --- RESET & FACTORY STATE ---
  resetToFreshState() {
    return this.forceSyncGoogleFormsData();
  },

  exportDatabase() {
    return {
      database: 'AssessPulse_RCM_Enterprise',
      version: '4.0',
      submissions: this.getSubmissions(),
      exams: this.getExams(),
      students: this.getStudents(),
      teams: this.getTeams(),
      cohortSummary: this.getCohortSummary(),
      exportedAt: new Date().toISOString()
    };
  }
};
