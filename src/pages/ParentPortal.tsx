import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { User, TrendingUp, CheckCircle, XCircle, BookOpen, MessageSquare, AlertCircle } from 'lucide-react';

const ParentPortal = () => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<any>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [homeworkHistory, setHomeworkHistory] = useState<any[]>([]);
  const [feedbackHistory, setFeedbackHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('معرف الطالب مفقود');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [studentRes, attendanceRes, homeworkRes, feedbackRes] = await Promise.all([
          supabase.from('students').select('*').eq('id', id).single(),
          supabase.from('attendance').select('*, sessions(date, lessons(title))').eq('student_id', id).order('created_at', { ascending: false }),
          supabase.from('homework').select('*, sessions(date, lessons(title))').eq('student_id', id).order('created_at', { ascending: false }),
          supabase.from('feedback').select('*, sessions(date, lessons(title))').eq('student_id', id).order('created_at', { ascending: false }),
        ]);

        if (studentRes.error) throw studentRes.error;
        if (studentRes.data) setStudent(studentRes.data);
        if (attendanceRes.data) setAttendanceHistory(attendanceRes.data);
        if (homeworkRes.data) setHomeworkHistory(homeworkRes.data);
        if (feedbackRes.data) setFeedbackHistory(feedbackRes.data);
      } catch (err: any) {
        console.error('Error fetching student data:', err);
        setError('تعذر تحميل بيانات الطالب. يرجى التأكد من صحة الرابط.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#475569', fontFamily: "'Cairo',sans-serif", background: '#0f172a' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(99,102,241,0.3)', borderTopColor: '#818cf8', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span>جاري تحميل تقرير الطالب...</span>
      </div>
    </div>
  );

  if (error || !student) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#f87171', fontFamily: "'Cairo',sans-serif", background: '#0f172a', padding: 20 }}>
      <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 16, padding: 32, textAlign: 'center', maxWidth: 400 }}>
        <AlertCircle size={48} color="#f87171" style={{ marginBottom: 16, display: 'inline-block' }} />
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px 0', color: '#f1f5f9' }}>عذراً، حدث خطأ</h2>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: 15 }}>{error || 'لم يتم العثور على بيانات الطالب.'}</p>
      </div>
    </div>
  );

  const totalAttendance = attendanceHistory.length;
  const presentCount = attendanceHistory.filter(a => a.status === 'present').length;
  const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

  const scoredHomework = homeworkHistory.filter(h => h.score != null);
  const avgScore = scoredHomework.length > 0
    ? Math.round(scoredHomework.reduce((acc, h) => acc + (h.score / h.max_score) * 100, 0) / scoredHomework.length)
    : 0;

  const initials = student.full_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') || '??';

  return (
    <div style={{ direction: 'rtl', fontFamily: "'Cairo','Noto Sans Arabic',sans-serif", background: '#0f172a', minHeight: '100vh', color: '#e2e8f0' }}>
      <style>{`
        .portal-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 32px 20px;
        }
        .sd-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .sd-scroll-wrap {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .sd-scroll-wrap::-webkit-scrollbar { height: 6px; }
        .sd-scroll-wrap::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); border-radius: 3px; }
        .sd-scroll-wrap::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        .sd-scroll-wrap::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        .sd-table { min-width: 500px; width: 100%; }
        
        @media (max-width: 768px) {
          .portal-container { padding: 20px 16px; }
          .sd-stat-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .header-title { font-size: 20px !important; }
        }
        @media (max-width: 480px) {
          .sd-stat-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="portal-container">
        {/* Header / Student Info */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))',
            border: '2px solid rgba(129,140,248,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 700, color: '#818cf8', flexShrink: 0,
            boxShadow: '0 8px 16px -4px rgba(0,0,0,0.2)'
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>تقرير الطالب الأكاديمي</div>
            <h1 className="header-title" style={{ fontSize: 26, fontWeight: 800, color: '#f8fafc', margin: '0 0 8px 0' }}>{student.full_name}</h1>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {student.grade_class && (
                <span style={{
                  fontSize: 12, fontWeight: 600, color: '#818cf8', background: 'rgba(99,102,241,0.15)',
                  border: '1px solid rgba(99,102,241,0.25)', borderRadius: 20,
                  padding: '4px 12px', display: 'inline-flex', alignItems: 'center', gap: 6
                }}>
                  <User size={14} />
                  {student.grade_class}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="sd-stat-grid">
          {[
            { 
              icon: <TrendingUp size={20} color="#10b981" />, label: 'نسبة الحضور', bg: 'rgba(16,185,129,0.15)',
              value: (
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: attendanceRate >= 75 ? '#34d399' : '#f87171' }}>{attendanceRate}%</span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>({presentCount} من {totalAttendance})</span>
                  </div>
                  <div style={{ marginTop: 8, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${attendanceRate}%`, background: attendanceRate >= 75 ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#ef4444,#f87171)', borderRadius: 4 }} />
                  </div>
                </div>
              ),
            },
            { 
              icon: <BookOpen size={20} color="#f59e0b" />, label: 'متوسط الدرجات', bg: 'rgba(245,158,11,0.15)',
              value: (
                <div>
                  <span style={{ fontSize: 28, fontWeight: 800, color: avgScore >= 60 ? '#fbbf24' : '#f87171' }}>{avgScore}%</span>
                  <div style={{ marginTop: 8, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${avgScore}%`, background: avgScore >= 60 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#ef4444,#f87171)', borderRadius: 4 }} />
                  </div>
                </div>
              ),
            },
          ].map((c, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8' }}>{c.label}</div>
              </div>
              {c.value}
            </div>
          ))}
        </div>

        {student.notes && (
          <div style={{ background: 'linear-gradient(to left, rgba(99,102,241,0.08), rgba(99,102,241,0.02))', border: '1px solid rgba(99,102,241,0.2)', borderRightWidth: 4, borderRightColor: '#818cf8', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#818cf8', fontWeight: 700 }}>
              <AlertCircle size={18} />
              ملاحظات عامة:
            </div>
            <div style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6 }}>{student.notes}</div>
          </div>
        )}

        {/* Attendance */}
        <Section title="سجل الحضور الأخير" icon={<CheckCircle size={18} color="#34d399" />} count={attendanceHistory.length}>
          {attendanceHistory.length === 0 ? <Empty text="لا يوجد سجل حضور" /> : (
            <div className="sd-scroll-wrap">
              <div className="sd-table">
                {attendanceHistory.slice(0, 10).map((a: any, i: number) => (
                  <Row key={a.id} last={i === Math.min(attendanceHistory.length, 10) - 1}
                    title={a.sessions?.lessons?.title || `حصة يوم ${a.sessions?.date || new Date(a.created_at).toLocaleDateString()}`} date={a.sessions?.date}
                    right={
                      <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 14px', borderRadius: 20, background: a.status === 'present' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', border: `1px solid ${a.status === 'present' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, color: a.status === 'present' ? '#34d399' : '#f87171', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' as const }}>
                        {a.status === 'present' ? <><CheckCircle size={14} /> حاضر</> : <><XCircle size={14} /> غائب</>}
                      </span>
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* Homework */}
        <Section title="سجل الواجبات الأخير" icon={<BookOpen size={18} color="#fbbf24" />} count={homeworkHistory.length}>
          {homeworkHistory.length === 0 ? <Empty text="لا يوجد سجل واجبات" /> : (
            <div className="sd-scroll-wrap">
              <div className="sd-table">
                {homeworkHistory.slice(0, 10).map((h: any, i: number) => {
                  const pct = h.max_score > 0 ? Math.round((h.score / h.max_score) * 100) : 0;
                  return (
                    <Row key={h.id} last={i === Math.min(homeworkHistory.length, 10) - 1}
                      title={h.sessions?.lessons?.title || `واجب يوم ${h.sessions?.date || new Date(h.created_at).toLocaleDateString()}`} date={h.sessions?.date}
                      right={
                        <div style={{ textAlign: 'left', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: pct >= 60 ? '#fbbf24' : '#f87171', whiteSpace: 'nowrap', background: 'rgba(255,255,255,0.05)', padding: '2px 10px', borderRadius: 8 }}>
                            {h.score ?? '—'} <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>/ {h.max_score}</span>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, display: 'inline-block', background: h.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.15)', border: `1px solid ${h.status === 'completed' ? 'rgba(16,185,129,0.2)' : 'rgba(100,116,139,0.2)'}`, color: h.status === 'completed' ? '#34d399' : '#94a3b8', whiteSpace: 'nowrap' as const }}>
                            {h.status === 'completed' ? 'تم التسليم' : 'لم يتم التسليم'}
                          </span>
                        </div>
                      }
                    />
                  );
                })}
              </div>
            </div>
          )}
        </Section>

        {/* Feedback */}
        <Section title="ملاحظات المعلم" icon={<MessageSquare size={18} color="#a78bfa" />} count={feedbackHistory.length}>
          {feedbackHistory.length === 0 ? <Empty text="لا توجد ملاحظات مسجلة" /> : (
            <div className="sd-scroll-wrap">
              <div className="sd-table">
                {feedbackHistory.map((f: any, i: number) => (
                  <div key={f.id} style={{ padding: '16px 20px', borderBottom: i < feedbackHistory.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', transition: 'background 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 12 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa' }} />
                        {f.sessions?.lessons?.title || 'ملاحظة عامة'}
                      </span>
                      <span style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 12 }}>{f.sessions?.date || new Date(f.created_at).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize: 14, color: '#cbd5e1', margin: 0, lineHeight: 1.7, paddingRight: 14 }}>{f.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>
        
        <div style={{ textAlign: 'center', marginTop: 32, paddingBottom: 32, color: '#475569', fontSize: 13 }}>
          تم إنشاء هذا التقرير تلقائياً من نظام إدارة الطلاب
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, icon, count, children }: { title: string; icon: React.ReactNode; count: number; children: React.ReactNode }) => (
  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden', marginBottom: 20, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon}
        <span style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>{title}</span>
      </div>
      {count > 0 && <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '2px 12px' }}>{count} سجل</span>}
    </div>
    {children}
  </div>
);

const Row = ({ title, date, right, last }: { title: string; date?: string; right: React.ReactNode; last: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.05)', gap: 16, transition: 'background 0.2s' }}
    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
  >
    <div style={{ flex: 1, minWidth: 120 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', marginBottom: 4 }}>{title}</div>
      {date && <div style={{ fontSize: 13, color: '#64748b' }}>{date}</div>}
    </div>
    {right}
  </div>
);

const Empty = ({ text }: { text: string }) => (
  <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
    <div style={{ width: 48, height: 48, borderRadius: 24, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <AlertCircle size={24} color="#475569" />
    </div>
    <div style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>{text}</div>
  </div>
);

export default ParentPortal;
