import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ParentPortal from './pages/ParentPortal';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* توجيه المسار الرئيسي إلى صفحة غير موجودة أو صفحة ترحيبية */}
        <Route path="/" element={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: "'Cairo', sans-serif", direction: 'rtl' }}>
            <div style={{ textAlign: 'center', padding: 40, background: 'rgba(255,255,255,0.03)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
              <h1 style={{ fontSize: 24, marginBottom: 16, color: '#f8fafc' }}>بوابة ولي الأمر</h1>
              <p style={{ color: '#94a3b8', fontSize: 16 }}>يرجى استخدام الرابط المخصص المرسل إليك للوصول إلى تقرير الطالب.</p>
            </div>
          </div>
        } />
        
        {/* مسار بوابة ولي الأمر مع المعرف الفريد */}
        <Route path="/student/:id" element={<ParentPortal />} />
        
        {/* إعادة توجيه أي مسار آخر */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
