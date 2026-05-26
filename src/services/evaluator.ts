export interface StageDef {
  title: string;
  icon: string;
  color: string;
  editable: boolean;
}

export const STAGES_DEF: Record<number, StageDef> = {
  1: { title: 'Formulation Stage', icon: 'clipboard-list', color: '#7C6FFF', editable: true },
  2: { title: 'Production Day', icon: 'flask-conical', color: '#00A8FF', editable: false },
  3: { title: 'Pengamatan Jam ke-8', icon: 'clock', color: '#FF6B6B', editable: false },
  4: { title: 'Pengamatan Final (Jam ke-12)', icon: 'timer', color: '#00C896', editable: false },
  5: { title: 'Lab Report & Feedback', icon: 'trending-up', color: '#F5C842', editable: false }
};

export const UI_TO_DB_STAGE: Record<number, number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 5,
  5: 6
};

export const DB_TO_UI_STAGE: Record<number, number> = {
  1: 1,
  2: 2,
  4: 3,
  5: 4,
  6: 5
};

export interface Indicator {
  id: number;
  label: string;
  desc: string;
  passed: boolean;
  actual: string;
}

export interface EvaluationResult {
  indicators: Indicator[];
  score: number;
  total: number;
  result: 'berhasil' | 'kurang_berhasil';
  ph: number | null;
  note?: string;
}

export interface RekapRow {
  label: string;
  waktu: number;
  warna: string;
  warna_normal: boolean | null;
  aroma: string;
  aroma_normal: boolean | null;
  rasa: string;
  rasa_normal: boolean | null;
  tekstur: string;
  tekstur_normal: boolean | null;
  ph: number | null;
  catatan: string;
  foto: string | null;
}

// Helper: check if string contains any keywords
function containsAny(text: string, keywords: string[]): boolean {
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => keyword !== '' && lowerText.includes(keyword.toLowerCase()));
}

// Helper: check if arrays intersect
function arrayIntersect(arr1: string[], arr2: string[]): boolean {
  const set1 = new Set(arr1.map(v => v.toLowerCase()));
  return arr2.some(v => set1.has(v.toLowerCase()));
}

export function resolveTeksturNormal(teksturText: string | null, storedFlag: boolean | null): boolean | null {
  if (!teksturText) return storedFlag;
  const value = teksturText.trim().toLowerCase();
  if (value === '') return storedFlag;

  if (containsAny(value, ['cair', 'encer', 'gagal memadat'])) {
    return false;
  }
  if (containsAny(value, ['sangat kental', 'semi-padat', 'semi padat', 'kental'])) {
    return true;
  }
  return storedFlag;
}

export function resolveAromaNormal(aromaText: string | null, storedFlag: boolean | null, opsi: string[] | null = null): boolean | null {
  if (opsi && arrayIntersect(opsi, ['busuk / tengik', 'tidak berbau sama sekali'])) {
    return false;
  }
  if (!aromaText) return storedFlag;
  const value = aromaText.trim().toLowerCase();
  if (value === '') return storedFlag;

  if (containsAny(value, ['busuk', 'tengik', 'tidak berbau', 'tidak ada bau', 'apek', 'basi', 'bau asing'])) {
    return false;
  }

  const positive = [
    'asam khas', 'asam segar', 'aroma buah', 'aroma sayur', 'khas yogurt', 'asam',
    'manis', 'buah', 'susu', 'susu segar', 'stroberi', 'strawberry', 'blueberry',
    'anggur', 'pisang', 'apel', 'jeruk', 'lemon', 'mangga', 'vanila', 'vanilla'
  ];
  if (containsAny(value, positive)) {
    return true;
  }
  return storedFlag;
}

export function resolveRasaNormal(rasaText: string | null, storedFlag: boolean | null, opsi: string[] | null = null): boolean | null {
  if (opsi && arrayIntersect(opsi, ['hambar', 'rasa asing (pahit/basi)'])) {
    return false;
  }
  if (!rasaText) return storedFlag;
  const value = rasaText.trim().toLowerCase();
  if (value === '') return storedFlag;

  if (containsAny(value, ['pahit', 'hambar', 'basi', 'busuk', 'rasa asing', 'off'])) {
    return false;
  }

  const positive = [
    'asam manis', 'khas yogurt', 'segar', 'asam', 'manis', 'susu', 'susu segar', 'manis susu',
    'stroberi', 'strawberry', 'blueberry', 'anggur', 'pisang', 'apel', 'jeruk', 'lemon', 'mangga', 'vanila', 'vanilla'
  ];
  if (containsAny(value, positive)) {
    return true;
  }
  return storedFlag;
}

export function isWarnaContaminated(value: string): boolean {
  const val = value.toLowerCase();
  if (containsAny(val, ['hitam'])) return true;
  if (containsAny(val, ['jamur', 'kapang', 'mold', 'berbulu'])) return true;

  const hasSpotKeyword = containsAny(val, ['bercak', 'bintik', 'totol', 'spot']);
  const hasBadSpotColor = containsAny(val, ['hitam', 'hijau', 'abu']);
  return hasSpotKeyword && hasBadSpotColor;
}

export function isDarkColorNormalByExtract(warnaValue: string, ekstrakValue: string): boolean {
  const darkFriendlyExtract = containsAny(ekstrakValue, ['buah naga', 'blueberry', 'blackcurrant', 'anggur', 'ubi ungu']);
  if (!darkFriendlyExtract) return false;
  return containsAny(warnaValue, ['ungu tua', 'ungu gelap', 'keunguan', 'ungu']);
}

export function isColorNormalForExtract(warnaValue: string, ekstrakValue: string): boolean {
  if (containsAny(ekstrakValue, ['stroberi', 'strawberry'])) {
    if (containsAny(warnaValue, ['pink', 'pink cerah', 'merah muda', 'merah muda cerah', 'pucat'])) {
      return true;
    }
  }
  if (isDarkColorNormalByExtract(warnaValue, ekstrakValue)) {
    return true;
  }
  return false;
}

export function resolveWarnaNormal(warnaText: string | null, storedFlag: boolean | null, ekstrakText: string | null = null, opsi: string[] | null = null): boolean | null {
  if (opsi && opsi.includes('muncul bercak hitam/hijau/abu-abu (tekstur jamur)')) {
    return false;
  }
  if (!warnaText) return storedFlag;
  const value = warnaText.trim().toLowerCase();
  const ekstrak = ekstrakText ? ekstrakText.trim().toLowerCase() : '';
  if (value === '') return storedFlag;

  if (isWarnaContaminated(value)) {
    return false;
  }
  if (isColorNormalForExtract(value, ekstrak)) {
    return true;
  }
  return storedFlag;
}

export function buildWarnaActual(warnaText: string | null, ekstrakText: string | null = null): string {
  const warna = (warnaText || '').trim();
  const value = warna.toLowerCase();
  const ekstrak = (ekstrakText || '').trim().toLowerCase();

  const actual = 'Warna: ' + (warna !== '' ? warna : '-');
  if (warna === '') return actual;

  if (isWarnaContaminated(value)) {
    return actual + ' (indikasi kontaminasi: ada bercak/bintik/jamur)';
  }
  if (isDarkColorNormalByExtract(value, ekstrak)) {
    return actual + ' (warna gelap masih sesuai ekstrak, tidak ada tanda kontaminasi)';
  }
  return actual;
}

export function evaluate(s5Data: any, ekstrakText: string | null = null): EvaluationResult | null {
  if (!s5Data) return null;

  const ph = s5Data.ph_akhir !== undefined && s5Data.ph_akhir !== null ? parseFloat(s5Data.ph_akhir) : null;

  const teksturPassed = resolveTeksturNormal(s5Data.tekstur, s5Data.tekstur_normal) ?? false;
  const aromaPassed = resolveAromaNormal(s5Data.aroma, s5Data.aroma_normal, s5Data.aroma_opsi) ?? false;
  const rasaPassed = resolveRasaNormal(s5Data.rasa, s5Data.rasa_normal, s5Data.rasa_opsi) ?? false;
  const warnaPassed = resolveWarnaNormal(s5Data.warna, s5Data.warna_normal, ekstrakText, s5Data.warna_opsi) ?? false;
  const warnaActual = buildWarnaActual(s5Data.warna, ekstrakText);

  const indicators: Indicator[] = [
    {
      id: 2,
      label: 'Tekstur Normal (Kental/Sangat Kental/Semi-padat)',
      desc: 'Sesuai SNI yogurt — fermentasi laktat mengubah protein susu sehingga yogurt mengental',
      passed: teksturPassed,
      actual: 'Tekstur: ' + (s5Data.tekstur || '-'),
    },
    {
      id: 3,
      label: 'Aroma Normal (Asam khas yogurt / beraroma buah/sayur)',
      desc: 'Aroma asam laktat yang khas menunjukkan fermentasi aktif berjalan dengan baik',
      passed: aromaPassed,
      actual: 'Aroma: ' + (s5Data.aroma || '-'),
    },
    {
      id: 4,
      label: 'Rasa Normal (Asam manis segar / Khas yogurt)',
      desc: 'Rasa asam yang menyegarkan menandakan produksi asam laktat optimal',
      passed: rasaPassed,
      actual: 'Rasa: ' + (s5Data.rasa || '-'),
    },
    {
      id: 5,
      label: 'Warna Normal (Sesuai warna ekstrak bahan)',
      desc: 'Warna yogurt seharusnya sesuai warna ekstrak; bercak hitam/hijau/abu-abu menandakan kontaminasi',
      passed: warnaPassed,
      actual: warnaActual,
    },
  ];

  const score = indicators.filter(i => i.passed).length;
  const berhasil = score === 4;

  return {
    indicators,
    score,
    total: 4,
    result: berhasil ? 'berhasil' : 'kurang_berhasil',
    ph,
  };
}

export function evaluateFromStages(stagesData: Record<number, any>): EvaluationResult | null {
  // DB stage 5 is Jam ke-12 (index 4 in UI stagesDef)
  const s5 = stagesData[5]?.data || null;
  const ekstrak = (stagesData[1]?.data?.ekstrak || '').toLowerCase().trim();
  const base = evaluate(s5, ekstrak);
  if (!base) return null;

  // Re-resolve stage-12 color using extract context
  base.indicators = base.indicators.map(ind => {
    if (ind.id === 5) {
      const resolvedWarna = resolveWarnaNormal(
        s5?.warna || null,
        s5?.warna_normal !== undefined ? !!s5.warna_normal : null,
        ekstrak,
        s5?.warna_opsi || null
      );
      return {
        ...ind,
        passed: resolvedWarna ?? false,
        actual: buildWarnaActual(s5?.warna || null, ekstrak)
      };
    }
    return ind;
  });

  // Search earlier stages for suspicious warna (contamination)
  let suspectFound = false;
  const suspectPoints: string[] = [];

  const j0 = stagesData[2]?.data?.jam0?.warna || null;
  const checks = [
    { label: 'Jam ke-0', warna: j0 },
    { label: 'Jam ke-8', warna: stagesData[4]?.data?.warna || null }, // DB stage 4 is Jam ke-8
    { label: 'Jam ke-12', warna: s5?.warna || null },
  ];

  for (const c of checks) {
    const w = (c.warna || '').trim().toLowerCase();
    if (w === '') continue;
    if (isWarnaContaminated(w)) {
      suspectFound = true;
      suspectPoints.push(c.label);
      break;
    }
  }

  if (suspectFound) {
    base.indicators = base.indicators.map(ind => {
      if (ind.id === 5) {
        return {
          ...ind,
          passed: false,
          actual: ind.actual + ` (terdeteksi kontaminasi pada: ${suspectPoints.join(', ')})`
        };
      }
      return ind;
    });

    base.score = base.indicators.filter(i => i.passed).length;
    base.result = base.score === base.total ? 'berhasil' : 'kurang_berhasil';
    base.note = 'Evaluasi override: kontaminasi terdeteksi pada tahap sebelumnya; warna dianggap tidak normal.';
  }

  return base;
}

export function buildRekapitulasi(stagesData: Record<number, any>): RekapRow[] {
  const rows: RekapRow[] = [];
  const ekstrak = (stagesData[1]?.data?.ekstrak || '').toLowerCase().trim();

  // Jam ke-0 (DB Stage 2)
  const s2 = stagesData[2]?.data || null;
  const jam0 = s2?.jam0 || null;
  rows.push({
    label: 'Jam ke-0',
    waktu: 0,
    warna: jam0?.warna || '-',
    warna_normal: resolveWarnaNormal(jam0?.warna || null, null, ekstrak),
    aroma: jam0?.aroma || '-',
    aroma_normal: resolveAromaNormal(jam0?.aroma || null, null),
    rasa: jam0?.rasa || '-',
    rasa_normal: resolveRasaNormal(jam0?.rasa || null, null),
    tekstur: jam0?.tekstur || 'Cair (awal)',
    tekstur_normal: true, // Baseline is normal
    ph: jam0?.ph !== undefined && jam0?.ph !== null ? parseFloat(jam0.ph) : null,
    catatan: jam0?.catatan || '',
    foto: jam0?.foto || null,
  });

  // Jam ke-8 (DB Stage 4)
  const s3 = stagesData[4]?.data || null;
  rows.push({
    label: 'Jam ke-8',
    waktu: 8,
    warna: s3?.warna || '-',
    warna_normal: resolveWarnaNormal(s3?.warna || null, s3?.warna_normal !== undefined ? !!s3.warna_normal : null, ekstrak, s3?.warna_opsi || null),
    aroma: s3?.aroma || '-',
    aroma_normal: resolveAromaNormal(s3?.aroma || null, s3?.aroma_normal !== undefined ? !!s3.aroma_normal : null, s3?.aroma_opsi || null),
    rasa: s3?.rasa || '-',
    rasa_normal: resolveRasaNormal(s3?.rasa || null, s3?.rasa_normal !== undefined ? !!s3.rasa_normal : null, s3?.rasa_opsi || null),
    tekstur: s3?.tekstur || '-',
    tekstur_normal: resolveTeksturNormal(s3?.tekstur || null, s3?.tekstur_normal !== undefined ? !!s3.tekstur_normal : null),
    ph: null,
    catatan: s3?.catatan || '',
    foto: s3?.foto || null,
  });

  // Jam ke-12 (DB Stage 5)
  const s4 = stagesData[5]?.data || null;
  rows.push({
    label: 'Jam ke-12 (Final)',
    waktu: 12,
    warna: s4?.warna || '-',
    warna_normal: resolveWarnaNormal(s4?.warna || null, s4?.warna_normal !== undefined ? !!s4.warna_normal : null, ekstrak, s4?.warna_opsi || null),
    aroma: s4?.aroma || '-',
    aroma_normal: resolveAromaNormal(s4?.aroma || null, s4?.aroma_normal !== undefined ? !!s4.aroma_normal : null, s4?.aroma_opsi || null),
    rasa: s4?.rasa || '-',
    rasa_normal: resolveRasaNormal(s4?.rasa || null, s4?.rasa_normal !== undefined ? !!s4.rasa_normal : null, s4?.rasa_opsi || null),
    tekstur: s4?.tekstur || '-',
    tekstur_normal: resolveTeksturNormal(s4?.tekstur || null, s4?.tekstur_normal !== undefined ? !!s4.tekstur_normal : null),
    ph: s4?.ph_akhir !== undefined && s4?.ph_akhir !== null ? parseFloat(s4.ph_akhir) : null,
    catatan: s4?.catatan || '',
    foto: s4?.foto || null,
  });

  return rows;
}

export function normalLabel(normal: boolean | null): string {
  if (normal === null) return '-';
  return normal ? '✔️ Normal' : '✖️ Tidak Normal';
}

export function normalClass(normal: boolean | null): string {
  if (normal === null) return '';
  return normal ? 'status-normal' : 'status-abnormal';
}
