# TotePulse - Enterprise Team Efficiency & Examination Analytics

TotePulse is an enterprise React application built with **React 18**, **Vite**, **Tailwind CSS**, and **Chart.js** featuring a **Persistent Local Database (IndexedDB + localStorage)**, **Role-Based Access Control (RBAC)**, and **Google Forms / Excel Evaluation Integration**.

---

## 🚀 Key Features

1. **Admin Portal**:
   - **Individual Exam Results**: Deep-dive analysis for each of the 4 examinations with side-by-side member comparisons, pass/fail donuts, rank-ordered scorecards, and verbatim candidate answers.
   - **Member Dashboard**: Per-member longitudinal tracking across all examinations taken, showing score % progression trends, efficiency delta ($\Delta$), and trainer feedback.
   - **Question Bank & Importer**: Create assessments or import questions from Google Forms & CSV files.
   - **Teams Roster & Diagnostics**: Multi-squad tracking and benchmark governance.
2. **Student Portal & Test Drive**:
   - Strictly isolated candidate view containing **only exam questions**, timed test runner, and immediate score feedback.
   - **Test Drive Mode**: Allows administrators to preview exams as any candidate with a sticky 1-click **"Return to Admin Dashboard"** control.

---

## ⚡ Quick Start

```powershell
cd d:\assesspulse
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## 📊 Live Google Forms Examination Cohorts

Pre-loaded with verified Google Forms evaluation data from **Apple Billing & Credentialing (ABC)**:

* **Total Trainees**: 8 Candidates across 2 evaluation cohorts
* **Total Examinations**: 4 Assessments (Initial & Final tests)
* **Total Submissions**: 20 Scored Evaluations in local database

### Trainee Scorecards & Squad Allocations

| Trainee Name | Employee Code | Previous Squad | Assigned Squad | Cohort | Status | Trainer Observations & Feedback |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Jency Suma** | `MSS/678` | Checking | Denial Management | AR/Denial & Claim Sub | 🟢 Proficient | *Good understanding, able to communicate clearly. Mindset and attitude - Very Good.* |
| **Rithina** | `MSS/638` | Claim Submission | Accounts Receivable (AR) | AR / Denial | 🟢 Proficient | *Good understanding and comprehension. Mindset and attitude - Very Good.* |
| **Pradeep Josebert** | `MSS/694` | Payment | Denial Management | Claim Submission | 🟢 Proficient | *Good understanding, learning, and listening capabilities. Faster and quick learner.* |
| **Raj Priyadarshini** | `MSS/711` | Checking | Denial Management | AR/Denial & Claim Sub | 🟡 Retest Pass | *Initial low score improved significantly in final retest. Mindset is Good.* |
| **Sri Santhya** | `MSS/666` | Claim Submission | Denial Management | AR / Denial | 🟡 Retest Pass | *Need to improve communication; final test explanations improved. Mindset - Good.* |
| **Kiruthika** | `MSS/683` | Claim Submission | Accounts Receivable (AR) | AR / Denial | 🟡 Retest Pass | *Need to improve verbal communication; final test explanations improved.* |
| **Manimekala Vellachamy** | `MSS/606` | Checking | Denial Management | Claim Submission | 🟢 Proficient | *Diligent, reliable, strong grasp of billing rules.* |
| **Deepa Raman** | `MSS/511` | Payment | Denial Management | Claim Submission | 🟢 Proficient | *Able to grasp new information quickly. Positive learning attitude.* |

---

## 📋 Included Examinations

1. **Exam 1: Medical Billing Fundamentals & ERA/EOB Posting** (10 Marks — AR / Denial Initial Test)
2. **Exam 2: RCM Advanced Workflow, Patient Responsibility & TAT** (15 Marks — AR / Denial Final Test)
3. **Exam 3: Claim Submission Fundamentals — 1st Assessment** (10 Marks — Claim Submission Initial Test)
4. **Exam 4: Claim Submission Advanced — Final Assessment** (15 Marks — Claim Submission Final Test)

---

## 🌐 Deploy to Render.com

This repository contains [`render.yaml`](./render.yaml) pre-configured as a **Static Site**:
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **SPA Rewrites**: `/* -> /index.html`
