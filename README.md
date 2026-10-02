# TotePulse - Enterprise Team Efficiency & Examination Analytics

TotePulse is an enterprise React application built with **React 18**, **Vite**, **Tailwind CSS**, and **Chart.js** featuring a **Persistent Local Database**, **Dual Role-Based Access Control (RBAC)**, and **Google Forms / Excel Evaluation Integration**:

1. **Admin Portal**: Executive dashboard displaying real-time Google Forms exam results, comparative Bar & Radar Chart.js visualizations, bulk Google Forms & CSV question importers, squad/candidate rosters with HR trainer comments, and diagnostic configuration.
2. **Student / Member Portal**: Strictly isolated candidate view containing **only exam questions**, live timed assessment runner, and candidate personal scorecards.

---

## ⚡ Quick Start

```powershell
cd d:\TotePulse
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📊 Live Google Forms RCM Trainee Benchmark

The application is pre-loaded with the real Google Forms examination results from **Apple Billing & Credentialing (ABC)**:

* **Total Trainees**: 5 Candidates
* **Cohort Average Score**: `4.9 / 10` (`49.0%`)
* **Highest Score**: `7.25 / 10` (`72.5%` - Jency Suma & Rithina)
* **Benchmark Pass Rate (≥50%)**: `40.0%` (2 of 5 Passed)
* **Target Squad Allocation**:
  * **Denial Management Squad**: 3 Trainees (`60%`)
  * **Accounts Receivable (AR) Squad**: 2 Trainees (`40%`)

### Trainee Scorecards & HR Evaluations

| Trainee Name | Employee Code | Previous Squad | Assigned Squad | Initial Score (10) | Status | Trainer Observation & Feedback |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Jency Suma** | `MSS/678` | Checking | Denial Management | **7.25** (72.5%) | 🟢 Proficient | *Good understanding and able to communicate clearly* |
| **Rithina** | `MSS/638` | Claim Submission | Accounts Receivable (AR) | **7.25** (72.5%) | 🟢 Proficient | *Good understanding* |
| **Sri Santhya** | `MSS/666` | Claim Submission | Denial Management | **4.75** (47.5%) | 🟡 Needs Support | *Need to improve communication, attitude and mindset - Good* |
| **Kiruthika** | `MSS/683` | Claim Submission | Accounts Receivable (AR) | **3.25** (32.5%) | 🟡 Needs Support | *Need to improve verbal communication, confusion of certain concepts, attitude is ok* |
| **Raj Priyadarshini** | `MSS/711` | Checking | Denial Management | **2.00** (20.0%) | 🟡 Needs Support | *Low comprehension level, verbal communication needs improvement, attitude and mindset - average* |

---

## 📋 Examinations Loaded from Google Forms

1. **Medical Billing Fundamentals & Payment Posting** (10 Questions - Initial Test):
   - Deductibles (PR 1), ERA posting eligibility, Payer Networks (Emory, Wellstar, Piedmont, CGHN), EOB workflows, and CO 253 Sequestration adjustments.
2. **RCM Advanced Workflow, Patient Responsibility & TAT** (15 Questions - Final Test):
   - Patient Responsibility, Address Mismatches, Virtual Credit Cards, Contract Rates, Statement Cycles (up to 3 cycles), 48h Turnaround Times (TAT), and CO 144.

> **Inspect Responses**: In the Admin Dashboard table, click **"View Responses"** on any trainee to review their exact submitted answers to all 15 questions from Google Forms!

---

## 📥 In-App Google Forms Spreadsheet Importer

Navigate to the **Google Forms Import** tab in the Admin Portal to:
- Drag & drop or upload any `.csv` or `.xlsx` export from Google Forms.
- Paste tab-separated or comma-separated rows directly from Google Sheets.
- The importer automatically parses timestamps, emails, scores (e.g. `13.5 / 15` or `7.25`), and question responses, injecting them directly into the local database!
