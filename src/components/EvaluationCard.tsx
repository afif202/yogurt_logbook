import React from 'react';
import { Rocket, FlaskConical, CheckCircle, XCircle, Sparkles, AlertCircle } from 'lucide-react';
import { EvaluationResult } from '../services/evaluator';

interface EvaluationCardProps {
  evaluation: EvaluationResult;
}

export const EvaluationCard: React.FC<EvaluationCardProps> = ({ evaluation }) => {
  const ok = evaluation.result === 'berhasil';

  const getFailedReasons = () => {
    const failed = evaluation.indicators.filter(i => !i.passed);
    const reasons: string[] = [];
    failed.forEach(f => {
      if (f.label.includes('pH')) reasons.push('pH akhir yogurtmu masih di luar rentang 3,8–4,5');
      if (f.label.includes('Tekstur')) reasons.push('tekstur masih cair (fermentasi belum optimal)');
      if (f.label.includes('Aroma')) reasons.push('aroma tidak normal (kemungkinan kontaminasi)');
      if (f.label.includes('Rasa')) reasons.push('rasa tidak normal');
      if (f.label.includes('Warna')) reasons.push('warna menunjukkan tanda kontaminasi');
    });
    return reasons;
  };

  return (
    <div className={`evaluation-card ${ok ? 'eval-success' : 'eval-fail'}`}>
      <div className="eval-header">
        <div className="eval-emoji">
          {ok ? (
            <Rocket className="w-10 h-10 text-[var(--success)] block" style={{ width: '40px', height: '40px' }} />
          ) : (
            <FlaskConical className="w-10 h-10 text-[var(--warning)] block" style={{ width: '40px', height: '40px' }} />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div className="eval-title">
            {ok ? (
              <span>Fermentasi Yogurt Kelompokmu <span style={{ textDecoration: 'underline' }}>BERHASIL!</span></span>
            ) : (
              <span>Fermentasi Belum Optimal</span>
            )}
          </div>
          <div className="eval-subtitle">{evaluation.score} dari {evaluation.total} indikator terpenuhi</div>
        </div>
        <div className={`eval-score-ring ${ok ? 'success' : 'fail'}`}>
          <span className="eval-score-num">{evaluation.score}</span>
          <span className="eval-score-den">/{evaluation.total}</span>
        </div>
      </div>

      <div className="eval-indicators">
        {evaluation.indicators.map((ind) => (
          <div key={ind.id} className={`indicator-row ${ind.passed ? 'passed' : 'failed'}`}>
            <span className="ind-check">
              {ind.passed ? (
                <CheckCircle className="w-4 h-4 text-[var(--success)] block" style={{ width: '16px', height: '16px' }} />
              ) : (
                <XCircle className="w-4 h-4 text-[var(--error)] block" style={{ width: '16px', height: '16px' }} />
              )}
            </span>
            <div className="ind-content">
              <span className="ind-label">{ind.label}</span>
              <span className="ind-actual">{ind.actual}</span>
              <span className="ind-desc">{ind.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="eval-verdict">
        {ok ? (
          <>
            <Sparkles className="w-3.5 h-3.5 text-[var(--gold)] mr-1 inline-block" style={{ width: '14px', height: '14px', verticalAlign: 'middle' }} />
            <strong>Selamat!</strong> Yogurt yang baik memiliki tekstur semi-padat dan kualitas organoleptik yang normal.
            Fermentasi laktat oleh bakteri <em>Lactobacillus</em> berjalan dengan baik!
          </>
        ) : (
          <>
            <AlertCircle className="w-3.5 h-3.5 text-[var(--warning)] mr-1 inline-block" style={{ width: '14px', height: '14px', verticalAlign: 'middle' }} />
            Fermentasi belum optimal karena: <strong>{getFailedReasons().join(', ')}</strong>.
            Kemungkinan penyebab: starter kurang aktif, suhu terlalu rendah, atau terjadi kontaminasi.
            Analisis lebih lanjut di tahap evaluasi poster!
          </>
        )}
      </div>
    </div>
  );
};
