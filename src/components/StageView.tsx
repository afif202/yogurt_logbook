import React from 'react';
import { 
  Users, FlaskConical, User, ClipboardList, Timer, Lightbulb, Image as ImageIcon, 
  Beaker, HelpCircle, Wind, Palette, Smile, Activity, Camera, Clock, Check, RotateCcw, FileText
} from 'lucide-react';
import { 
  normalLabel, normalClass, resolveWarnaNormal, resolveAromaNormal, resolveRasaNormal, resolveTeksturNormal
} from '../services/evaluator';

interface StageViewProps {
  stageNum: number; // 1: Formulation, 2: Production Day, 3: Jam ke-8, 4: Jam ke-12
  data: any;
  submittedAt: string;
  stagesData: Record<number, any>;
  role?: string;
  studentName?: string;
  onReset?: (stageNum: number) => void;
}

export const StageView: React.FC<StageViewProps> = ({ 
  stageNum, data, submittedAt, stagesData, role, studentName, onReset 
}) => {
  
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const handleImageClick = (src: string, title: string) => {
    if ((window as any).YogurtLightbox) {
      (window as any).YogurtLightbox.open(src, title);
    }
  };

  if (stageNum === 1) {
    return (
      <div className="view-section">
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">
              <Users className="w-3.5 h-3.5 mr-1 inline" style={{ width: '14px', height: '14px', verticalAlign: 'middle' }} /> Nama Kelompok
            </span>
            <span className="info-value">{data.kelompok}</span>
          </div>
          <div className="info-item">
            <span className="info-label">
              <FlaskConical className="w-3.5 h-3.5 mr-1 inline" style={{ width: '14px', height: '14px', verticalAlign: 'middle' }} /> Jenis Ekstrak
            </span>
            <span className="info-value">{data.ekstrak}</span>
          </div>
          <div className="info-item full-width">
            <span className="info-label">
              <User className="w-3.5 h-3.5 mr-1 inline" style={{ width: '14px', height: '14px', verticalAlign: 'middle' }} /> Anggota Kelompok
            </span>
            <span className="info-value" style={{ whiteSpace: 'pre-line' }}>{data.anggota}</span>
          </div>
          <div className="info-item full-width">
            <span className="info-label">
              <ClipboardList className="w-3.5 h-3.5 mr-1 inline" style={{ width: '14px', height: '14px', verticalAlign: 'middle' }} /> Komposisi Bahan
            </span>
            <span className="info-value" style={{ whiteSpace: 'pre-line' }}>{data.komposisi}</span>
          </div>
          <div className="info-item">
            <span className="info-label">
              <Timer className="w-3.5 h-3.5 mr-1 inline" style={{ width: '14px', height: '14px', verticalAlign: 'middle' }} /> Durasi Fermentasi
            </span>
            <span className="info-value">{data.durasi || '12 jam'}</span>
          </div>
        </div>
        
        {data.alasan_inovasi && (
          <div className="view-note">
            <Lightbulb className="w-3.5 h-3.5 mr-1 inline text-[var(--gold)]" style={{ width: '14px', height: '14px', verticalAlign: 'middle' }} /> 
            <strong>Alasan &amp; Inovasi:</strong><br />
            {data.alasan_inovasi}
          </div>
        )}

        <div className="view-photo-wrap" style={{ marginTop: '16px' }}>
          <h4>
            <ImageIcon className="w-4 h-4 mr-1 inline" style={{ width: '16px', height: '16px', verticalAlign: 'middle' }} /> Foto Bahan
          </h4>
          {data.foto_bahan ? (
            <>
              <img
                src={data.foto_bahan}
                className="view-photo clickable"
                alt="Foto bahan kelompok"
                onClick={() => handleImageClick(data.foto_bahan, "Foto Bahan")}
                style={{ cursor: 'pointer', borderRadius: '12px', marginTop: '8px', maxWidth: '300px' }}
              />
              <div className="photo-caption"><small>Klik untuk memperbesar</small></div>
            </>
          ) : (
            <div className="view-photo-missing">
              <div className="missing-box">— Foto tidak tersedia.</div>
            </div>
          )}
        </div>

        {role === 'guru' && onReset && (
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px dashed var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                if (window.confirm(`Apakah Anda yakin ingin me-reset Tahap 1 untuk siswa ${studentName || ''}? Data rencana proyek akan dihapus permanen.`)) {
                  onReset(1);
                }
              }}
              type="button"
              className="btn btn-outline btn-sm"
              style={{ color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <RotateCcw className="w-3.5 h-3.5" style={{ width: '14px', height: '14px' }} /> Reset &amp; Minta Siswa Isi Ulang
            </button>
          </div>
        )}
        
        <div className="stage-completed-note" style={{ marginTop: '16px' }}>
          <Check className="w-3.5 h-3.5 mr-1 inline text-[var(--success)]" style={{ width: '14px', height: '14px', verticalAlign: 'middle' }} /> Disubmit pada {formatDate(submittedAt)}
        </div>
      </div>
    );
  }

  if (stageNum === 2) {
    const j0 = data.jam0 || {};
    return (
      <div className="view-section">
        <h3>
          <Beaker className="w-4.5 h-4.5 mr-1 inline" style={{ width: '18px', height: '18px', verticalAlign: 'middle' }} /> Proses Pembuatan
        </h3>
        <div className="view-text" style={{ whiteSpace: 'pre-line', marginTop: '8px' }}>{data.proses}</div>

        {data.prediksi_jam && (
          <div className="prediction-result" style={{ marginTop: '16px' }}>
            <span className="pred-icon">
              <HelpCircle className="w-5 h-5 text-[var(--accent)]" style={{ width: '20px', height: '20px' }} />
            </span>
            <div>
              <div className="pred-label">Prediksi Pengentalan</div>
              <div className="pred-value">Jam ke-{data.prediksi_jam}</div>
              {data.alasan_prediksi && <div className="pred-alasan">{data.alasan_prediksi}</div>}
            </div>
          </div>
        )}

        <h3 className="section-jam" style={{ marginTop: '24px' }}>
          <Timer className="w-4.5 h-4.5 mr-1 inline" style={{ width: '18px', height: '18px', verticalAlign: 'middle' }} /> Kondisi Awal — Jam ke-0
        </h3>
        <div className="organo-grid" style={{ marginTop: '12px' }}>
          <div className="organo-item">
            <span className="organo-label">
              <Palette className="w-3.5 h-3.5 mr-1 inline" style={{ width: '14px', height: '14px', verticalAlign: 'middle' }} /> Warna
            </span>
            <span className="organo-value">{j0.warna || '-'}</span>
          </div>
          <div className="organo-item">
            <span className="organo-label">
              <Wind className="w-3.5 h-3.5 mr-1 inline" style={{ width: '14px', height: '14px', verticalAlign: 'middle' }} /> Aroma
            </span>
            <span className="organo-value">{j0.aroma || '-'}</span>
          </div>
          <div className="organo-item">
            <span className="organo-label">
              <Activity className="w-3.5 h-3.5 mr-1 inline" style={{ width: '14px', height: '14px', verticalAlign: 'middle' }} /> Tekstur
            </span>
            <span className="organo-value">{j0.tekstur || 'Cair (awal)'}</span>
          </div>
          <div className="organo-item">
            <span className="organo-label">
              <Smile className="w-3.5 h-3.5 mr-1 inline" style={{ width: '14px', height: '14px', verticalAlign: 'middle' }} /> Rasa
            </span>
            <span className="organo-value">{j0.rasa || '-'}</span>
          </div>
          {j0.ph !== undefined && (
            <div className="organo-item">
              <span className="organo-label">
                <FlaskConical className="w-3.5 h-3.5 mr-1 inline" style={{ width: '14px', height: '14px', verticalAlign: 'middle' }} /> pH Awal
              </span>
              <span className="organo-value ph-badge">{j0.ph}</span>
            </div>
          )}
        </div>

        {j0.catatan && <div className="view-note" style={{ marginTop: '16px' }}>{j0.catatan}</div>}

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h4 style={{ fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-muted)' }}>
              <ImageIcon className="w-3.5 h-3.5 mr-1 inline" style={{ width: '14px', height: '14px', verticalAlign: 'middle' }} /> Foto Produk Jam ke-0
            </h4>
            {j0.foto ? (
              <>
                <img
                  src={j0.foto}
                  className="view-photo clickable"
                  alt="Foto jam ke-0"
                  onClick={() => handleImageClick(j0.foto, "Foto Jam ke-0")}
                  style={{ cursor: 'pointer', borderRadius: '12px', maxWidth: '100%' }}
                />
                <div className="photo-caption"><small>Klik untuk memperbesar</small></div>
              </>
            ) : (
              <div className="view-photo-missing"><div className="missing-box">Foto produk tidak tersedia.</div></div>
            )}
          </div>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h4 style={{ fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-muted)' }}>
              <Camera className="w-3.5 h-3.5 mr-1 inline" style={{ width: '14px', height: '14px', verticalAlign: 'middle' }} /> Dokumentasi Kertas Lakmus
            </h4>
            {j0.ph_foto ? (
              <>
                <img
                  src={j0.ph_foto}
                  className="view-photo clickable"
                  alt="Foto kertas lakmus jam ke-0"
                  onClick={() => handleImageClick(j0.ph_foto, "Foto Kertas Lakmus Jam ke-0")}
                  style={{ cursor: 'pointer', borderRadius: '12px', maxWidth: '100%' }}
                />
                <div className="photo-caption"><small>Klik untuk memperbesar</small></div>
              </>
            ) : (
              <div className="view-photo-missing"><div className="missing-box">Foto kertas lakmus tidak tersedia.</div></div>
            )}
          </div>
        </div>

        {role === 'guru' && onReset && (
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px dashed var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                if (window.confirm(`Apakah Anda yakin ingin me-reset Tahap 2 untuk siswa ${studentName || ''}? Data produksi hari pertama akan dihapus permanen.`)) {
                  onReset(2);
                }
              }}
              type="button"
              className="btn btn-outline btn-sm"
              style={{ color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <RotateCcw className="w-3.5 h-3.5" style={{ width: '14px', height: '14px' }} /> Reset &amp; Minta Siswa Isi Ulang
            </button>
          </div>
        )}

        <div className="stage-completed-note" style={{ marginTop: '16px' }}>
          <Check className="w-3.5 h-3.5 mr-1 inline text-[var(--success)]" style={{ width: '14px', height: '14px', verticalAlign: 'middle' }} /> Disubmit pada {formatDate(submittedAt)}
        </div>
      </div>
    );
  }

  if (stageNum === 3 || stageNum === 4) {
    const label = stageNum === 3 ? 'Jam ke-8' : 'Jam ke-12 (Final)';
    const dbStageNum = stageNum === 3 ? 4 : 5;
    const ekstrak = (stagesData[1]?.data?.ekstrak || '').toLowerCase().trim();

    const colorNormalVal = resolveWarnaNormal(data.warna, data.warna_normal, ekstrak, data.warna_opsi);
    const aromaNormalVal = resolveAromaNormal(data.aroma, data.aroma_normal, data.aroma_opsi);
    const teksturNormalVal = resolveTeksturNormal(data.tekstur, data.tekstur_normal);
    const rasaNormalVal = resolveRasaNormal(data.rasa, data.rasa_normal, data.rasa_opsi);

    return (
      <div className="view-section">
        <div className="info-banner" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '8px', background: 'var(--surface-3)', border: '1px solid var(--border)', marginBottom: '16px' }}>
          <Clock className="w-4 h-4 text-[var(--accent)]" style={{ width: '16px', height: '16px' }} /> Data Pengamatan {label}
        </div>
        <div className="organo-grid-full">
          <div className={`organo-row ${colorNormalVal ? 'row-normal' : 'row-abnormal'}`}>
            <span className="organo-param">
              <Palette className="w-3.5 h-3.5 mr-1 inline" style={{ width: '14px', height: '14px', verticalAlign: 'middle' }} /> Warna
            </span>
            <span className="organo-desc-val">
              <strong>Deskripsi:</strong> {data.warna}
              {data.warna_opsi && data.warna_opsi.length > 0 && (
                <>
                  <br />
                  <small style={{ color: 'var(--text-muted)', display: 'inline-block', marginTop: '4px' }}>
                    <strong>Pilihan:</strong> {data.warna_opsi.join(', ')}
                  </small>
                </>
              )}
            </span>
            <span className={`organo-status ${normalClass(colorNormalVal)}`}>{normalLabel(colorNormalVal)}</span>
          </div>

          <div className={`organo-row ${aromaNormalVal ? 'row-normal' : 'row-abnormal'}`}>
            <span className="organo-param">
              <Wind className="w-3.5 h-3.5 mr-1 inline" style={{ width: '14px', height: '14px', verticalAlign: 'middle' }} /> Aroma
            </span>
            <span className="organo-desc-val">
              <strong>Deskripsi:</strong> {data.aroma}
              {data.aroma_opsi && data.aroma_opsi.length > 0 && (
                <>
                  <br />
                  <small style={{ color: 'var(--text-muted)', display: 'inline-block', marginTop: '4px' }}>
                    <strong>Pilihan:</strong> {data.aroma_opsi.join(', ')}
                  </small>
                </>
              )}
            </span>
            <span className={`organo-status ${normalClass(aromaNormalVal)}`}>{normalLabel(aromaNormalVal)}</span>
          </div>

          <div className={`organo-row ${teksturNormalVal ? 'row-normal' : 'row-abnormal'}`}>
            <span className="organo-param">
              <Activity className="w-3.5 h-3.5 mr-1 inline" style={{ width: '14px', height: '14px', verticalAlign: 'middle' }} /> Tekstur
            </span>
            <span className="organo-desc-val">{data.tekstur}</span>
            <span className={`organo-status ${normalClass(teksturNormalVal)}`}>{normalLabel(teksturNormalVal)}</span>
          </div>

          <div className={`organo-row ${rasaNormalVal ? 'row-normal' : 'row-abnormal'}`}>
            <span className="organo-param">
              <Smile className="w-3.5 h-3.5 mr-1 inline" style={{ width: '14px', height: '14px', verticalAlign: 'middle' }} /> Rasa
            </span>
            <span className="organo-desc-val">
              <strong>Deskripsi:</strong> {data.rasa}
              {data.rasa_opsi && data.rasa_opsi.length > 0 && (
                <>
                  <br />
                  <small style={{ color: 'var(--text-muted)', display: 'inline-block', marginTop: '4px' }}>
                    <strong>Pilihan:</strong> {data.rasa_opsi.join(', ')}
                  </small>
                </>
              )}
            </span>
            <span className={`organo-status ${normalClass(rasaNormalVal)}`}>{normalLabel(rasaNormalVal)}</span>
          </div>

          {stageNum === 4 && data.ph_akhir !== undefined && (
            <div className="organo-row">
              <span className="organo-param">
                <FlaskConical className="w-3.5 h-3.5 mr-1 inline" style={{ width: '14px', height: '14px', verticalAlign: 'middle' }} /> pH Akhir
              </span>
              <span className="organo-desc-val">
                <span className="ph-badge">{data.ph_akhir}</span>
              </span>
            </div>
          )}
        </div>

        {data.catatan && <div className="view-note" style={{ marginTop: '16px' }}>{data.catatan}</div>}

        {stageNum === 4 ? (
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <h4 style={{ fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-muted)' }}>
                <ImageIcon className="w-3.5 h-3.5 mr-1 inline" style={{ width: '14px', height: '14px', verticalAlign: 'middle' }} /> Foto Produk Jam ke-12
              </h4>
              {data.foto ? (
                <>
                  <img
                    src={data.foto}
                    className="view-photo clickable"
                    alt="Foto jam ke-12"
                    onClick={() => handleImageClick(data.foto, "Foto Jam ke-12")}
                    style={{ cursor: 'pointer', borderRadius: '12px', maxWidth: '100%' }}
                  />
                  <div className="photo-caption"><small>Klik untuk memperbesar</small></div>
                </>
              ) : (
                <div className="view-photo-missing"><div className="missing-box">Foto produk tidak tersedia.</div></div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <h4 style={{ fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-muted)' }}>
                <Camera className="w-3.5 h-3.5 mr-1 inline" style={{ width: '14px', height: '14px', verticalAlign: 'middle' }} /> Dokumentasi Kertas Lakmus
              </h4>
              {data.ph_akhir_foto ? (
                <>
                  <img
                    src={data.ph_akhir_foto}
                    className="view-photo clickable"
                    alt="Foto kertas lakmus jam ke-12"
                    onClick={() => handleImageClick(data.ph_akhir_foto, "Foto Kertas Lakmus Jam ke-12")}
                    style={{ cursor: 'pointer', borderRadius: '12px', maxWidth: '100%' }}
                  />
                  <div className="photo-caption"><small>Klik untuk memperbesar</small></div>
                </>
              ) : (
                <div className="view-photo-missing"><div className="missing-box">Foto kertas lakmus tidak tersedia.</div></div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ marginTop: '16px' }}>
            <h4 style={{ fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-muted)' }}>
              <ImageIcon className="w-3.5 h-3.5 mr-1 inline" style={{ width: '14px', height: '14px', verticalAlign: 'middle' }} /> Foto Pengamatan {label}
            </h4>
            {data.foto ? (
              <>
                <img
                  src={data.foto}
                  className="view-photo clickable"
                  alt={`Foto ${label}`}
                  onClick={() => handleImageClick(data.foto, `Foto ${label}`)}
                  style={{ cursor: 'pointer', borderRadius: '12px', maxWidth: '300px' }}
                />
                <div className="photo-caption"><small>Klik untuk memperbesar</small></div>
              </>
            ) : (
              <div className="view-photo-missing"><div className="missing-box">Foto pengamatan tidak tersedia.</div></div>
            )}
          </div>
        )}

        {stageNum === 4 && data.kesimpulan_awal && (
          <div className="view-note" style={{ marginTop: '16px' }}>
            <FileText className="w-3.5 h-3.5 mr-1 inline text-[var(--accent)]" style={{ width: '14px', height: '14px', verticalAlign: 'middle' }} /> 
            <strong>Kesimpulan Awal:</strong><br />
            {data.kesimpulan_awal}
          </div>
        )}

        {role === 'guru' && onReset && (
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px dashed var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                if (window.confirm(`Apakah Anda yakin ingin me-reset Tahap ${stageNum === 3 ? 3 : 4} untuk siswa ${studentName || ''}? Data pengamatan ini akan dihapus permanen.`)) {
                  onReset(dbStageNum);
                }
              }}
              type="button"
              className="btn btn-outline btn-sm"
              style={{ color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <RotateCcw className="w-3.5 h-3.5" style={{ width: '14px', height: '14px' }} /> Reset &amp; Minta Siswa Isi Ulang
            </button>
          </div>
        )}

        <div className="stage-completed-note" style={{ marginTop: '16px' }}>
          <Check className="w-3.5 h-3.5 mr-1 inline text-[var(--success)]" style={{ width: '14px', height: '14px', verticalAlign: 'middle' }} /> Disubmit pada {formatDate(submittedAt)}
        </div>
      </div>
    );
  }

  return null;
};
