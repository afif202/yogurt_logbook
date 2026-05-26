import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Beaker, UserCheck, LogOut, Users, FolderCheck, Rocket, AlertTriangle, Inbox, 
  FlaskConical, CheckCircle, AlertCircle, ListTodo, ArrowRight
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { STAGES_DEF, UI_TO_DB_STAGE, evaluateFromStages } from '../services/evaluator';

interface TeacherDashboardProps {
  user: any;
  onLogout: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Fetch users with role='siswa'
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'siswa');

      if (usersError) throw usersError;

      // Fetch all logbooks
      const { data: logbooks, error: lbsError } = await supabase
        .from('logbooks')
        .select('*');

      if (lbsError) throw lbsError;

      // Fetch all logbook stages
      const { data: stages, error: stagesError } = await supabase
        .from('logbook_stages')
        .select('*');

      if (stagesError) throw stagesError;

      // Map data
      const studentList = users.map((student: any) => {
        const lb = logbooks.find((l: any) => l.user_id === student.id);
        const lbStages = lb ? stages.filter((s: any) => s.logbook_id === lb.id) : [];
        
        const stagesData: Record<number, any> = {};
        lbStages.forEach((s: any) => {
          stagesData[s.stage_number] = {
            data: s.data,
            submitted_at: s.submitted_at
          };
        });

        const doneCount = Object.keys(stagesData).length; // total database stages
        const evaluation = doneCount >= 4 ? evaluateFromStages(stagesData) : null;
        
        return {
          user: student,
          stagesData,
          done: doneCount,
          pct: Math.round((doneCount / 5) * 100),
          evaluation,
          kelompok: stagesData[1]?.data?.kelompok || student.group_name || null
        };
      });

      setStudents(studentList);
    } catch (err) {
      console.error('Error fetching student data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    total: students.length,
    selesai: students.filter(s => s.done === 5).length,
    berhasil: students.filter(s => s.evaluation?.result === 'berhasil').length,
    kurang: students.filter(s => s.evaluation?.result === 'kurang_berhasil').length,
  };

  // Search and Filter Logic
  const filteredStudents = students.filter(s => {
    const matchName = s.user.name.toLowerCase().includes(search.toLowerCase());
    
    let status = 'in_progress';
    if (s.evaluation) {
      status = s.evaluation.result; // 'berhasil' or 'kurang_berhasil'
    }

    const matchStatus = !filterStatus || status === filterStatus;
    return matchName && matchStatus;
  });

  if (loading && students.length === 0) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  // Loader Icon fallback
  function Loader2({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return <span className={className} style={{ ...style, display: 'inline-block', border: '3px solid rgba(0,0,0,0.1)', borderTopColor: 'var(--accent)', borderRadius: '50%', width: '24px', height: '24px', animation: 'spin 1s linear infinite' }} />;
  }

  return (
    <div className="dashboard teacher-dashboard">
      <header className="teacher-header">
        <div className="teacher-header-left">
          <div className="sidebar-logo">
            <span className="brand-badge" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Beaker className="w-4 h-4 text-white" style={{ width: '16px', height: '16px' }} />
            </span>
            <span className="logo-text">YogurtTrack</span>
          </div>
          <div className="header-divider"></div>
          <div>
            <h1>Dashboard Pemantauan</h1>
            <p>Pantau aktivitas seluruh siswa</p>
          </div>
        </div>
        <div className="teacher-header-right">
          <div className="teacher-user-info">
            <div className="teacher-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-dim)', border: '1px solid var(--border)' }}>
              <UserCheck className="w-5 h-5 text-[var(--accent)]" style={{ width: '20px', height: '20px' }} />
            </div>
            <div className="teacher-user-details">
              <div className="teacher-name">{user.name}</div>
              <div className="teacher-role">Guru / Admin</div>
            </div>
          </div>
          <button onClick={onLogout} className="btn btn-logout-teacher" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <LogOut className="w-3.5 h-3.5" style={{ width: '14px', height: '14px' }} /> <span className="btn-logout-text"> Keluar</span>
          </button>
        </div>
      </header>

      {/* STATS SUMMARY */}
      <div className="stats-grid">
        <div className="stat-card s-total">
          <div className="stat-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-dim)' }}>
            <Users className="w-6 h-6 text-[var(--accent)]" style={{ width: '24px', height: '24px' }} />
          </div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Siswa</div>
        </div>
        <div className="stat-card s-done">
          <div className="stat-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--purple-dim)' }}>
            <FolderCheck className="w-6 h-6 text-[var(--purple)]" style={{ width: '24px', height: '24px' }} />
          </div>
          <div className="stat-value">{stats.selesai}</div>
          <div className="stat-label">Logbook Selesai</div>
        </div>
        <div className="stat-card s-success">
          <div className="stat-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--success-dim)' }}>
            <Rocket className="w-6 h-6 text-[var(--success)]" style={{ width: '24px', height: '24px' }} />
          </div>
          <div className="stat-value">{stats.berhasil}</div>
          <div className="stat-label">Proyek Berhasil</div>
        </div>
        <div className="stat-card s-fail">
          <div className="stat-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--warning-dim)' }}>
            <AlertTriangle className="w-6 h-6 text-[var(--warning)]" style={{ width: '24px', height: '24px' }} />
          </div>
          <div className="stat-value">{stats.kurang}</div>
          <div className="stat-label">Kurang Berhasil</div>
        </div>
      </div>

      <div className="teacher-body">
        <div className="section-header">
          <h2>Daftar Siswa ({filteredStudents.length})</h2>
          <div className="filter-bar">
            <input 
              type="text" 
              placeholder="Cari nama siswa..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="berhasil">Berhasil</option>
              <option value="kurang_berhasil">Kurang Berhasil</option>
              <option value="in_progress">Sedang Berlangsung</option>
            </select>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <Inbox className="w-12 h-12 text-[var(--text-muted)]" style={{ width: '48px', height: '48px' }} />
            </div>
            <h3>Siswa Tidak Ditemukan</h3>
            <p>Tidak ada data siswa yang cocok dengan pencarian dan filter Anda.</p>
          </div>
        ) : (
          <div className="student-grid">
            {filteredStudents.map((sd, i) => {
              const ev = sd.evaluation;
              let cardCls = '';
              let badge = (
                <span className="badge badge-pending">
                  <ListTodo className="w-3 h-3 mr-1 inline" style={{ width: '12px', height: '12px', verticalAlign: 'middle' }} />
                  {sd.done}/5 Tahap
                </span>
              );

              if (ev) {
                if (ev.result === 'berhasil') {
                  cardCls = 'card-success';
                  badge = (
                    <span className="badge badge-success">
                      <CheckCircle className="w-3 h-3 mr-1 inline" style={{ width: '12px', height: '12px', verticalAlign: 'middle' }} />
                      Berhasil
                    </span>
                  );
                } else {
                  cardCls = 'card-fail';
                  badge = (
                    <span className="badge badge-warning">
                      <AlertCircle className="w-3 h-3 mr-1 inline" style={{ width: '12px', height: '12px', verticalAlign: 'middle' }} />
                      Kurang Berhasil
                    </span>
                  );
                }
              }

              return (
                <div 
                  key={sd.user.id} 
                  className={`student-card ${cardCls}`}
                  onClick={() => navigate(`/teacher/student/${sd.user.username}`)}
                  style={{ animationDelay: `${i * 0.05}s` }}
                  role="button" 
                  tabIndex={0}
                >
                  <div className="student-card-header">
                    <div className="student-avatar">{sd.user.name ? sd.user.name.charAt(0).toUpperCase() : 'S'}</div>
                    <div className="student-info">
                      <div className="student-name">{sd.user.name}</div>
                      <div className="student-group">
                        {sd.kelompok ? (
                          <>
                            <FlaskConical className="w-3 h-3 mr-1 text-[var(--accent)] inline" style={{ width: '12px', height: '12px', verticalAlign: 'middle' }} />
                            {sd.kelompok}
                          </>
                        ) : (
                          sd.user.group_name || 'Siswa'
                        )}
                      </div>
                    </div>
                    {badge}
                  </div>
                  
                  <div className="stage-progress-row">
                    <div className="stage-dots">
                      {Object.entries(STAGES_DEF).map(([stepKey, def]) => {
                        const step = parseInt(stepKey, 10);
                        const dbStage = UI_TO_DB_STAGE[step];
                        const isDone = !!sd.stagesData[dbStage];

                        return (
                          <div 
                            key={step} 
                            className={`stage-dot ${isDone ? 'done' : ''}`}
                            style={{ '--dot-color': def.color } as React.CSSProperties}
                            title={def.title}
                          />
                        );
                      })}
                    </div>
                    <div className="progress-bar mini">
                      <div className="progress-fill" style={{ width: `${sd.pct}%` }}></div>
                    </div>
                    <span className="stage-pct">{sd.pct}%</span>
                  </div>

                  <div className="student-card-footer">
                    <span>Terdaftar: {new Date(sd.user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="view-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                      Lihat Detail <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
