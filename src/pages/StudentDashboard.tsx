import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Beaker, Users, CheckCircle2, Circle, Lock, Edit3, Check, LogOut, Download, Loader2, Sparkles, FileText, Clock
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { supabase } from '../utils/supabase';
import { 
  STAGES_DEF, UI_TO_DB_STAGE, 
  evaluateFromStages, buildRekapitulasi, normalClass, normalLabel
} from '../services/evaluator';
import { StageForm } from '../components/StageForm';
import { StageView } from '../components/StageView';
import { EvaluationCard } from '../components/EvaluationCard';

interface StudentDashboardProps {
  user: any;
  onLogout: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { stageParam } = useParams<{ stageParam?: string }>();
  
  const [logbook, setLogbook] = useState<any>(null);
  const [stagesData, setStagesData] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Sidebar scroll hint state (mobile)
  const [showScrollHint, setShowScrollHint] = useState(false);

  useEffect(() => {
    fetchLogbook();
  }, [user.id]);

  const fetchLogbook = async () => {
    try {
      setLoading(true);
      // Get or create logbook
      let { data: lb, error } = await supabase
        .from('logbooks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (!lb) {
        const { data: newLb, error: createError } = await supabase
          .from('logbooks')
          .insert({ user_id: user.id })
          .select('*')
          .single();
        if (createError) throw createError;
        lb = newLb;
      }

      setLogbook(lb);

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
    } catch (err) {
      console.error('Error fetching logbook:', err);
    } finally {
      setLoading(false);
    }
  };

  // Determine sequential locked/unlocked stages
  // Step 1: Formulation (DB 1)
  // Step 2: Production Day (DB 2)
  // Step 3: Jam ke-8 (DB 4)
  // Step 4: Jam ke-12 (DB 5)
  // Step 5: Lab Report (DB 6)
  const isStageLocked = (uiStep: number) => {
    if (uiStep === 1) return false;
    const prevDbStage = UI_TO_DB_STAGE[uiStep - 1];
    return !stagesData[prevDbStage];
  };

  const getHighestUnlockedStage = () => {
    for (let step = 5; step >= 1; step--) {
      if (!isStageLocked(step)) return step;
    }
    return 1;
  };

  // Handle active stage routing
  const activeStage = stageParam ? parseInt(stageParam, 10) : getHighestUnlockedStage();

  useEffect(() => {
    if (loading) return;
    // Check lock conditions or parameter bounds
    if (isNaN(activeStage) || activeStage < 1 || activeStage > 5) {
      navigate(`/student/stage/${getHighestUnlockedStage()}`, { replace: true });
    } else if (isStageLocked(activeStage)) {
      navigate(`/student/stage/${getHighestUnlockedStage()}`, { replace: true });
    }
  }, [stageParam, stagesData, loading]);

  const handleStageSubmit = async (formData: any) => {
    if (!logbook) return;
    const dbStageNum = UI_TO_DB_STAGE[activeStage];

    try {
      setLoading(true);
      
      // Save stage
      const { error } = await supabase
        .from('logbook_stages')
        .upsert({
          logbook_id: logbook.id,
          stage_number: dbStageNum,
          data: formData,
          submitted_at: new Date().toISOString()
        }, { onConflict: 'logbook_id, stage_number' });

      if (error) throw error;

      let msg = '✔️ Tersimpan!';
      if (activeStage === 1) msg = '✔️ Rencana proyek disimpan! Kamu bisa mengubahnya kapan saja.';
      if (activeStage === 2) msg = '✔️ Data Production Day tersimpan!';
      if (activeStage === 3) msg = '✔️ Pengamatan Jam ke-8 tersimpan!';

      // If submitting stage 4 (Jam ke-12), auto-generate stage 5 (Lab Report, DB 6)
      if (activeStage === 4) {
        const { error: autoError } = await supabase
          .from('logbook_stages')
          .upsert({
            logbook_id: logbook.id,
            stage_number: 6,
            data: { auto: true },
            submitted_at: new Date().toISOString()
          }, { onConflict: 'logbook_id, stage_number' });

        if (autoError) throw autoError;

        setSuccessMsg('✨ Pengamatan final tersimpan! Lihat laporan dan hasil evaluasi di bawah.');
        await fetchLogbook();
        navigate('/student/stage/5');
        return;
      }

      setSuccessMsg(msg);
      await fetchLogbook();
      const nextStep = activeStage + 1;
      navigate(`/student/stage/${nextStep}`);
    } catch (err) {
      console.error('Error saving stage:', err);
      alert('Gagal menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  // Auto dismiss success messages
  useEffect(() => {
    if (!successMsg) return;
    const timer = setTimeout(() => setSuccessMsg(''), 4000);
    return () => clearTimeout(timer);
  }, [successMsg]);

  // Sidebar mobile scroll logic
  useEffect(() => {
    const nav = document.getElementById('sidebar-nav-scroll');
    if (!nav) return;

    const updateHint = () => {
      const isMobile = window.innerWidth <= 900;
      if (!isMobile) {
        setShowScrollHint(false);
        return;
      }
      const hasOverflow = nav.scrollWidth > nav.clientWidth + 4;
      const scrolledEnough = nav.scrollLeft > 32;
      setShowScrollHint(hasOverflow && !scrolledEnough);
    };

    nav.addEventListener('scroll', updateHint, { passive: true });
    window.addEventListener('resize', updateHint);
    setTimeout(updateHint, 300);

    return () => {
      nav.removeEventListener('scroll', updateHint);
      window.removeEventListener('resize', updateHint);
    };
  }, [stagesData]);

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

        const clonedHint = clonedDoc.querySelector('.rekap-hint') as HTMLElement;
        if (clonedHint) clonedHint.style.display = 'none';
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

  const doneCount = Object.keys(stagesData).length;
  // Note: progress calculation (max 5 stages)
  const pct = Math.round((doneCount / 5) * 100);

  const evaluation = doneCount >= 4 ? evaluateFromStages(stagesData) : null;
  const rekap = doneCount >= 4 ? buildRekapitulasi(stagesData) : null;
  const stageDef = STAGES_DEF[activeStage];

  if (loading && !logbook) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="dashboard student-dashboard">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="brand-badge" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Beaker className="w-4 h-4 text-white" style={{ width: '16px', height: '16px' }} />
            </span>
            <span className="logo-text">YogurtTrack</span>
          </div>
        </div>
        <div className="sidebar-user">
          <div className="user-avatar">{user.name ? user.name.charAt(0).toUpperCase() : 'S'}</div>
          <div className="user-details">
            <div className="user-name">{user.name}</div>
            <div className="user-role" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Users className="w-3 h-3 text-[var(--accent)]" style={{ width: '12px', height: '12px' }} />
              {stagesData[1]?.data?.kelompok || user.group_name || 'Siswa'}
            </div>
          </div>
        </div>

        <div className="nav-scroll-wrap">
          <nav className="sidebar-nav" id="sidebar-nav-scroll">
            {Object.entries(STAGES_DEF).map(([stepKey, def]) => {
              const step = parseInt(stepKey, 10);
              const dbStage = UI_TO_DB_STAGE[step];
              const isComplete = !!stagesData[dbStage];
              const isActive = activeStage === step;
              const isLocked = isStageLocked(step);

              return (
                <Link
                  key={step}
                  to={isLocked ? '#' : `/student/stage/${step}`}
                  className={`nav-item ${isActive ? 'active' : ''} ${isComplete ? 'complete' : ''} ${isLocked ? 'locked' : ''}`}
                  style={{ '--stage-color': def.color } as React.CSSProperties}
                >
                  <span className="nav-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    {isComplete ? (
                      <CheckCircle2 className="w-[18px] h-[18px] text-[var(--success)]" />
                    ) : (
                      <Circle className="w-[18px] h-[18px]" />
                    )}
                  </span>
                  <div className="nav-text">
                    <span className="nav-label">Tahap {step}</span>
                    <span className="nav-title">{def.title}</span>
                  </div>
                  {isLocked ? (
                    <span className="nav-lock"><Lock className="w-3 h-3" style={{ width: '12px', height: '12px' }} /></span>
                  ) : isComplete && def.editable ? (
                    <span className="nav-check edit-badge"><Edit3 className="w-3 h-3" style={{ width: '12px', height: '12px' }} /></span>
                  ) : isComplete ? (
                    <span className="nav-check"><Check className="w-3 h-3" style={{ width: '12px', height: '12px' }} /></span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
          {showScrollHint && (
            <div className="nav-scroll-hint" id="nav-scroll-hint" aria-hidden="true">
              <span className="nav-scroll-hint-label">
                Geser <span style={{ marginLeft: '4px' }}>➡️</span>
              </span>
            </div>
          )}
        </div>

        <div className="sidebar-progress">
          <div className="progress-label">
            <span>Progress</span>
            <span className="progress-value">{pct}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }}></div>
          </div>
          <div className="progress-stages">{doneCount} dari 5 tahap selesai</div>
        </div>
        <div className="sidebar-bottom">
          <button onClick={onLogout} className="btn btn-ghost btn-logout" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <LogOut className="w-4 h-4" /> <span className="btn-logout-text"> Keluar</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {successMsg && <div className="flash-success">{successMsg}</div>}

        <div className="content-header">
          <div>
            <h1>
              <span style={{ color: stageDef?.color, marginRight: '8px' }}>⚡</span>
              {stageDef?.title}
            </h1>
            <p className="content-subtitle">
              Tahap {activeStage} dari 5
              {stageDef?.editable && (
                <> &nbsp;•&nbsp; <em style={{ color: 'var(--accent)' }}>Dapat diedit kapan saja</em></>
              )}
            </p>
          </div>
          {stagesData[UI_TO_DB_STAGE[activeStage]] ? (
            stageDef?.editable ? (
              <span className="badge badge-info"><Edit3 className="w-3 h-3 mr-1 inline" style={{ width: '12px', height: '12px', verticalAlign: 'middle' }} /> Editable</span>
            ) : (
              <span className="badge badge-success"><Check className="w-3 h-3 mr-1 inline" style={{ width: '12px', height: '12px', verticalAlign: 'middle' }} /> Selesai</span>
            )
          ) : (
            <span className="badge badge-pending"><Clock className="w-3 h-3 mr-1 inline" style={{ width: '12px', height: '12px', verticalAlign: 'middle' }} /> Belum Diisi</span>
          )}
        </div>

        <div className="content-body">
          {/* LAB REPORT (Step 5) */}
          {activeStage === 5 ? (
            stagesData[6] ? (
              <div className="lab-report">
                {evaluation && <EvaluationCard evaluation={evaluation} />}
                
                {rekap && (
                  <div className="rekap-section">
                    <div className="rekap-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <h2>
                          <span style={{ color: 'var(--accent)', marginRight: '6px' }}>📊</span>
                          Tabel Rekapitulasi Logbook Kelompok
                        </h2>
                        <p>Data lengkap seluruh pengamatan fermentasi yogurt</p>
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
                              <td className="td-waktu">
                                <strong>{row.label}</strong>
                                {row.waktu === 0 && <div className="td-sub">Baseline</div>}
                                {row.waktu === 12 && (
                                  <div className="td-sub">
                                    <Sparkles className="w-3 h-3 text-[var(--accent)] mr-1 inline" style={{ width: '12px', height: '12px' }} />Data Evaluasi
                                  </div>
                                )}
                              </td>
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
                    <div className="rekap-hint">
                      <span>✨</span> Gunakan tabel ini sebagai bahan referensi untuk membuat poster di Canva dan presentasi kelompok.
                    </div>
                  </div>
                )}

                {stagesData[5]?.data?.kesimpulan_awal && (
                  <div className="student-conclusion">
                    <h3>
                      <FileText className="w-4.5 h-4.5 mr-1 inline text-[var(--accent)]" style={{ width: '18px', height: '18px', verticalAlign: 'middle' }} /> Kesimpulan Awal Kelompok
                    </h3>
                    <div className="conclusion-text">{stagesData[5].data.kesimpulan_awal}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="info-banner" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 16px', borderRadius: '8px', background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
                <FileText className="w-4 h-4 text-[var(--accent)]" /> Lab report akan muncul otomatis setelah kamu menyelesaikan Pengamatan Final (Jam ke-12).
              </div>
            )
          ) : (
            // FORM OR VIEW
            stagesData[UI_TO_DB_STAGE[activeStage]] && !stageDef?.editable ? (
              // Read only view
              <StageView
                stageNum={activeStage}
                data={stagesData[UI_TO_DB_STAGE[activeStage]].data}
                submittedAt={stagesData[UI_TO_DB_STAGE[activeStage]].submitted_at}
                stagesData={stagesData}
              />
            ) : (
              // Fill form
              <StageForm
                stageNum={activeStage}
                existing={stagesData[UI_TO_DB_STAGE[activeStage]]?.data || null}
                onSubmit={handleStageSubmit}
              />
            )
          )}
        </div>
      </main>
    </div>
  );
};
