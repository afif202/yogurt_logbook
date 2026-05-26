import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, LogOut, Download, Loader2, Info, BarChart3, Check, ChevronDown, 
  ClipboardList, FlaskConical, Clock, Timer, TrendingUp
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { supabase } from '../utils/supabase';
import { 
  STAGES_DEF, UI_TO_DB_STAGE, DB_TO_UI_STAGE, 
  evaluateFromStages, buildRekapitulasi, normalClass, normalLabel
} from '../services/evaluator';
import { StageView } from '../components/StageView';
import { EvaluationCard } from '../components/EvaluationCard';

interface StudentDetailProps {
  user?: any;
  onLogout: () => void;
}

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch { return dateStr; }
};

export const StudentDetail: React.FC<StudentDetailProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  
  const [student, setStudent] = useState<any>(null);
  const [logbook, setLogbook] = useState<any>(null);
  const [stagesData, setStagesData] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Accordion active state (mapped by UI step index: 1 to 5)
  const [openCards, setOpenCards] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchStudentData();
  }, [username]);

  const fetchStudentData = async () => {
    if (!username) return;
    try {
      setLoading(true);
      
      // Get student user record
      const { data: std, error: stdError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username.trim().toLowerCase())
        .eq('role', 'siswa')
        .maybeSingle();

      if (stdError || !std) {
        alert('Siswa tidak ditemukan.');
        navigate('/teacher');
        return;
      }
      setStudent(std);

      // Get student's logbook
      const { data: lb, error: lbError } = await supabase
        .from('logbooks')
        .select('*')
        .eq('user_id', std.id)
        .maybeSingle();

      if (lbError) throw lbError;
      setLogbook(lb);

      if (lb) {
        // Get logbook stages
        const { data: stages, error: stagesError } = await supabase
          .from('logbook_stages')
          .select('*')
          .eq('logbook_id', lb.id);

        if (stagesError) throw stagesError;

        const mappedStages: Record<number, any> = {};
        stages?.forEach((s: any) => {
          mappedStages[s.stage_number] = {
            data: s.data,
            submitted_at: s.submitted_at
          };
        });
        setStagesData(mappedStages);
      } else {
        setStagesData({});
      }
    } catch (err) {
      console.error('Error fetching student detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetStage = async (dbStageNum: number) => {
    if (!logbook) return;

    try {
      setLoading(true);
      // Determine which stages to delete
      const stagesToDelete = [dbStageNum];
      if (dbStageNum === 4) {
        // If resetting Jam ke-8 (DB 4), we also delete Jam ke-12 (DB 5) and Lab Report (DB 6)
        stagesToDelete.push(5, 6);
      } else if (dbStageNum === 5) {
        // If resetting Jam ke-12 (DB 5), we also delete Lab Report (DB 6)
        stagesToDelete.push(6);
      } else if (dbStageNum === 2) {
        // If resetting Production Day (DB 2), subsequent stages are deleted as they depend on it
        stagesToDelete.push(4, 5, 6);
      } else if (dbStageNum === 1) {
        // If resetting Formulation (DB 1), everything is reset
        stagesToDelete.push(2, 4, 5, 6);
      }

      const { error } = await supabase
        .from('logbook_stages')
        .delete()
        .eq('logbook_id', logbook.id)
        .in('stage_number', stagesToDelete);

      if (error) throw error;

      // Determine UI Step name for message
      const uiStep = DB_TO_UI_STAGE[dbStageNum];
      setSuccessMsg(`✔️ Tahap ${uiStep} milik siswa ${student.name} telah berhasil di-reset.`);
      await fetchStudentData();
    } catch (err) {
      console.error('Error resetting stage:', err);
      alert('Gagal me-reset data.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCard = (stepNum: number) => {
    setOpenCards(prev => ({ ...prev, [stepNum]: !prev[stepNum] }));
  };

  // Download Rekapitulasi Table as PNG
  const [downloading, setDownloading] = useState(false);
  const handleDownload = () => {
    const tableWrap = document.querySelector('.rekap-section') as HTMLElement;
    if (!tableWrap || downloading) return;

    setDownloading(true);
    html2canvas(tableWrap, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: 1200,
      onclone: (clonedDoc) => {
        const style = clonedDoc.createElement('style');
        style.innerHTML = `
          *, *::before, *::after {
            animation: none !important;
            transition: none !important;
            transform: none !important;
          }
        `;
        clonedDoc.head.appendChild(style);

        const clonedSection = clonedDoc.querySelector('.rekap-section') as HTMLElement;
        if (clonedSection) {
          clonedSection.style.width = '1000px';
          clonedSection.style.padding = '24px';
          clonedSection.style.borderRadius = '16px';
          clonedSection.style.margin = '0';
          const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
          clonedSection.style.background = isDark ? '#1e293b' : '#ffffff';
          clonedSection.style.color = isDark ? '#f8fafc' : '#0f172a';
          clonedSection.style.border = isDark ? '1px solid #334155' : '1px solid #e2e8f0';
        }
        
        const clonedBtn = clonedDoc.getElementById('btn-download-rekap');
        if (clonedBtn) clonedBtn.style.display = 'none';
      }
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = 'rekapitulasi-logbook-yogurt.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      setDownloading(false);
    }).catch(err => {
      console.error(err);
      alert('Gagal mengunduh gambar');
      setDownloading(false);
    });
  };

  // Auto dismiss success messages
  useEffect(() => {
    if (!successMsg) return;
    const timer = setTimeout(() => setSuccessMsg(''), 4000);
    return () => clearTimeout(timer);
  }, [successMsg]);

  if (loading && !student) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  const doneCount = Object.keys(stagesData).length;
  const evaluation = doneCount >= 4 ? evaluateFromStages(stagesData) : null;
  const rekap = doneCount >= 4 ? buildRekapitulasi(stagesData) : null;

  return (
    <div className="dashboard teacher-dashboard">
      <header className="teacher-header">
        <div className="teacher-header-left" style={{ display: 'flex', alignItems: 'center' }}>
          <button 
            onClick={() => navigate('/teacher')} 
            className="btn btn-back-teacher" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" style={{ width: '14px', height: '14px' }} /> Kembali
          </button>
          <div className="header-divider"></div>
          <div>
            <h1>Logbook — {stagesData[1]?.data?.kelompok || student?.name}</h1>
            <p>
              {student?.name} &nbsp;•&nbsp;
              {stagesData[1]?.data?.ekstrak || 'Tanpa Ekstrak'} &nbsp;•&nbsp;
              {doneCount}/5 Tahap &nbsp;•&nbsp;
              Bergabung {student && new Date(student.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="teacher-header-right">
          <button onClick={onLogout} className="btn btn-logout-teacher" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <LogOut className="w-3.5 h-3.5" style={{ width: '14px', height: '14px' }} /> <span className="btn-logout-text"> Keluar</span>
          </button>
        </div>
      </header>

      {successMsg && <div className="flash-success" style={{ margin: '20px 36px 0' }}>{successMsg}</div>}

      {/* EVALUATION */}
      {evaluation ? (
        <div className="eval-wrapper" style={{ margin: '20px 36px 0' }}>
          <EvaluationCard evaluation={evaluation} />
        </div>
      ) : (
        <div className="info-banner" style={{ margin: '20px 36px 0', display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 16px', borderRadius: '8px', background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
          <Info className="w-4 h-4 text-[var(--accent)]" />
          <span>Evaluasi tersedia setelah siswa menyelesaikan Pengamatan Final (Jam ke-12). Saat ini {doneCount}/5 tahap selesai.</span>
        </div>
      )}

      {/* REKAPITULASI */}
      {rekap && (
        <div className="rekap-section" style={{ margin: '20px 36px 0' }}>
          <div className="rekap-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2>
                <BarChart3 className="w-5 h-5 text-[var(--accent)] mr-1 inline" style={{ width: '20px', height: '20px', verticalAlign: 'middle' }} />
                Tabel Rekapitulasi Pengamatan
              </h2>
            </div>
            <button 
              type="button" 
              id="btn-download-rekap" 
              onClick={handleDownload} 
              className="btn btn-outline btn-sm" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {downloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Mengunduh...
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" /> Unduh Gambar
                </>
              )}
            </button>
          </div>
          <div className="rekap-table-wrap">
            <table className="rekap-table">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Warna</th>
                  <th>Aroma</th>
                  <th>Rasa</th>
                  <th>Tekstur</th>
                  <th>pH</th>
                </tr>
              </thead>
              <tbody>
                {rekap.map((row, idx) => (
                  <tr key={idx} className={row.waktu === 12 ? 'row-final' : ''}>
                    <td className="td-waktu"><strong>{row.label}</strong></td>
                    <td>
                      <div className="rekap-val">{row.warna}</div>
                      {row.warna_normal !== null && (
                        <div className={`rekap-status ${normalClass(row.warna_normal)}`}>
                          {normalLabel(row.warna_normal)}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="rekap-val">{row.aroma}</div>
                      {row.aroma_normal !== null && (
                        <div className={`rekap-status ${normalClass(row.aroma_normal)}`}>
                          {normalLabel(row.aroma_normal)}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="rekap-val">{row.rasa}</div>
                      {row.rasa_normal !== null && (
                        <div className={`rekap-status ${normalClass(row.rasa_normal)}`}>
                          {normalLabel(row.rasa_normal)}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="rekap-val">{row.tekstur}</div>
                      {row.tekstur_normal !== null && (
                        <div className={`rekap-status ${normalClass(row.tekstur_normal)}`}>
                          {normalLabel(row.tekstur_normal)}
                        </div>
                      )}
                    </td>
                    <td className="td-ph">
                      {row.ph !== null ? (
                        <span className="ph-badge">{row.ph}</span>
                      ) : (
                        <span className="ph-empty">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ACCORDION PER TAHAP */}
      <div className="stages-accordion" style={{ margin: '20px 36px 36px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Detail Isian Per Tahap</h2>
        {Object.entries(STAGES_DEF).map(([stepKey, def]) => {
          const step = parseInt(stepKey, 10);
          const dbStage = UI_TO_DB_STAGE[step];
          const hasData = !!stagesData[dbStage];
          const isOpen = !!openCards[step];

          // React accordion lucide icons lookup
          const getLucideIcon = (sNum: number) => {
            if (sNum === 1) return <ClipboardList className="w-4 h-4" style={{ color: def.color }} />;
            if (sNum === 2) return <FlaskConical className="w-4 h-4" style={{ color: def.color }} />;
            if (sNum === 3) return <Clock className="w-4 h-4" style={{ color: def.color }} />;
            if (sNum === 4) return <Timer className="w-4 h-4" style={{ color: def.color }} />;
            return <TrendingUp className="w-4 h-4" style={{ color: def.color }} />;
          };

          return (
            <div key={step} className={`stage-card ${hasData ? 'filled' : 'empty'}`}>
              <div 
                className="stage-card-header" 
                style={{ 
                  '--stage-color': def.color, 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: hasData && step < 5 ? 'pointer' : 'default' 
                } as React.CSSProperties}
                onClick={() => hasData && step < 5 && toggleCard(step)}
                role={hasData && step < 5 ? 'button' : undefined}
              >
                <span 
                  className="stage-card-icon" 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    background: hasData ? 'var(--success-dim)' : 'var(--surface-3)', 
                    border: `1px solid ${hasData ? 'var(--success-border)' : 'var(--border)'}`, 
                    marginRight: '12px', 
                    flexShrink: 0 
                  }}
                >
                  {hasData ? (
                    <Check className="w-4 h-4 text-[var(--success)]" />
                  ) : (
                    getLucideIcon(step)
                  )}
                </span>
                <div className="stage-card-meta" style={{ flex: 1 }}>
                  <div className="stage-card-title">Tahap {step}: {def.title}</div>
                  <div className="stage-card-sub">
                    {hasData ? (
                      `Diisi: ${formatDate(stagesData[dbStage].submitted_at)}`
                    ) : (
                      'Belum diisi'
                    )}
                  </div>
                </div>
                {hasData && step < 5 && (
                  <span 
                    className="stage-toggle" 
                    style={{ 
                      transition: 'transform var(--transition)', 
                      display: 'inline-block',
                      transform: isOpen ? 'rotate(180deg)' : ''
                    }}
                  >
                    <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                  </span>
                )}
              </div>

              {hasData && step < 5 && isOpen && (
                <div className="stage-card-body" style={{ display: 'block' }}>
                  <StageView
                    stageNum={step}
                    data={stagesData[dbStage].data}
                    submittedAt={stagesData[dbStage].submitted_at}
                    stagesData={stagesData}
                    role="guru"
                    studentName={student.name}
                    onReset={handleResetStage}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
