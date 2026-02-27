import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { ClassesPage } from './pages/CorePages';
import { SkillsPage, BatchesPage, SubjectsPage } from './pages/CorePages2';
import { TeachersPage, StudentsPage, GraduatesPage } from './pages/UsersPages';
import { ExpensesPage, FeesPage, ExamsPage, ResultsPage, AttendancesPage } from './pages/ManagementPages';
import MarkEntryPage from './pages/MarkEntryPage';
import DailyAttendancePage from './pages/DailyAttendancePage';
import StudentAttendancePage from './pages/StudentAttendancePage';
import ReportsPage from './pages/ReportsPage';
import GraduatedStudentsReport from './pages/GraduatedStudentsReport';
import SalariesPage from './pages/SalariesPage';
import StudentPaymentsPage from './pages/StudentPaymentsPage';
import BackupPage from './pages/BackupPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<ProfilePage />} />

          <Route path="skills" element={<SkillsPage />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="batches" element={<BatchesPage />} />
          <Route path="subjects" element={<SubjectsPage />} />

          <Route path="teachers" element={<TeachersPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="graduates" element={<GraduatesPage />} />

          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="fees" element={<FeesPage />} />
          <Route path="student-payments" element={<StudentPaymentsPage />} />
          <Route path="salaries" element={<SalariesPage />} />
          <Route path="attendances" element={<AttendancesPage />} />
          <Route path="attendance-entry" element={<DailyAttendancePage />} />
          <Route path="my-attendance" element={<StudentAttendancePage />} />
          <Route path="exams" element={<ExamsPage />} />
          <Route path="mark-entry" element={<MarkEntryPage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="reports/graduated/:batchId" element={<GraduatedStudentsReport />} />
          <Route path="backup" element={<BackupPage />} />

          <Route path="unauthorized" element={
            <div className="p-8 text-center text-red-500 text-xl font-bold bg-white rounded-xl shadow border border-slate-100">
              Unauthorized Access
            </div>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
