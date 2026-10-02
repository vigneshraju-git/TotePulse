/**
 * Calculates efficiency combining accuracy (70% weight) and velocity (30% weight)
 */
export function calculateEfficiency(score, total, timeSpentSec, allottedSec) {
  if (!total || total === 0) return 0;
  const accuracyPct = (score / total) * 100;
  const timeRatio = Math.min(1.5, Math.max(0.4, (timeSpentSec || 300) / (allottedSec || 600)));
  const velocityMultiplier = 1 + (1 - timeRatio) * 0.15;
  const efficiency = Math.min(100, Math.max(20, accuracyPct * velocityMultiplier));
  return Math.round(efficiency * 10) / 10;
}

/**
 * Aggregates candidate statistics across completed assessments
 * Absent / 0-score attempts are counted but excluded from averages.
 */
export function getStudentStats(studentId, submissions, exams) {
  const subs = submissions.filter(s => s.studentId === studentId);
  const scoredSubs = subs.filter(s => s.status !== 'Absent' && s.score > 0);

  if (scoredSubs.length === 0) {
    return { count: subs.length, avgPct: 0, maxPct: 0, avgEfficiency: 0, submissions: subs };
  }
  let totalPct = 0;
  let maxPct = 0;
  let totalEff = 0;

  scoredSubs.forEach(s => {
    const pct = (s.score / s.total) * 100;
    totalPct += pct;
    if (pct > maxPct) maxPct = pct;
    const exam = exams.find(e => e.id === s.examId);
    const allotted = (exam ? exam.durationMinutes : 10) * 60;
    totalEff += calculateEfficiency(s.score, s.total, s.timeSpentSec, allotted);
  });

  return {
    count: subs.length,                                            // all attempts (including absent)
    avgPct: Math.round(totalPct / scoredSubs.length),
    maxPct: Math.round(maxPct),
    avgEfficiency: Math.round((totalEff / scoredSubs.length) * 10) / 10,
    submissions: subs
  };
}

/**
 * Aggregates cohort performance across squads
 */
export function getTeamEfficiency(teamId, students, submissions, exams) {
  const members = students.filter(s => s.teamId === teamId);
  const memberIds = members.map(m => m.id);
  const subs = submissions.filter(s => memberIds.includes(s.studentId));

  if (subs.length === 0) return { avgScorePct: 0, efficiency: 0, completions: 0 };

  let totalPct = 0;
  let totalEff = 0;
  subs.forEach(s => {
    const pct = (s.score / s.total) * 100;
    totalPct += pct;
    const exam = exams.find(e => e.id === s.examId);
    const allotted = (exam ? exam.durationMinutes : 10) * 60;
    totalEff += calculateEfficiency(s.score, s.total, s.timeSpentSec, allotted);
  });

  return {
    avgScorePct: Math.round(totalPct / subs.length),
    efficiency: Math.round((totalEff / subs.length) * 10) / 10,
    completions: subs.length
  };
}
