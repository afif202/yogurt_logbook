import React, { useEffect, useState, useRef } from "react";
import {
    ClipboardList,
    Users,
    FlaskConical,
    Timer,
    Lightbulb,
    Image as ImageIcon,
    Beaker,
    HelpCircle,
    Wind,
    Palette,
    Smile,
    Activity,
    Camera,
    Clock,
    Save,
    ArrowRight,
    AlertTriangle,
    FileText,
    Check,
} from "lucide-react";

interface StageFormProps {
    stageNum: number; // 1: Formulation, 2: Production Day, 3: Jam ke-8, 4: Jam ke-12
    existing: any;
    onSubmit: (data: any) => void;
}

interface MissingFieldEntry {
    path: string;
    label: string;
}

export const StageForm: React.FC<StageFormProps> = ({
    stageNum,
    existing,
    onSubmit,
}) => {
    // Common Form States
    const [formData, setFormData] = useState<any>(() => {
        if (existing) return existing;
        if (stageNum === 1) {
            return {
                kelompok: "",
                ekstrak: "",
                anggota: "",
                komposisi: "",
                alasan_inovasi: "",
                foto_bahan: "",
            };
        }
        if (stageNum === 2) {
            return {
                proses: "",
                prediksi_jam: "",
                alasan_prediksi: "",
                jam0: {
                    warna: "",
                    aroma: "",
                    rasa: "",
                    ph: "",
                    ph_foto: "",
                    catatan: "",
                    foto: "",
                },
            };
        }
        if (stageNum === 3 || stageNum === 4) {
            const base = {
                warna: "",
                warna_opsi: [] as string[],
                warna_normal: true,
                aroma: "",
                aroma_opsi: [] as string[],
                aroma_normal: true,
                tekstur: "",
                tekstur_normal: true,
                rasa: "",
                rasa_opsi: [] as string[],
                rasa_normal: true,
                catatan: "",
                foto: "",
            };
            if (stageNum === 4) {
                return {
                    ...base,
                    ph_akhir: "",
                    ph_akhir_foto: "",
                    kesimpulan_awal: "",
                };
            }
            return base;
        }
        return {};
    });

    const [invalidFields, setInvalidFields] = useState<MissingFieldEntry[]>([]);

    // File Inputs Refs
    const fileRef1 = useRef<HTMLInputElement>(null);
    const fileRef2_1 = useRef<HTMLInputElement>(null);
    const fileRef2_2 = useRef<HTMLInputElement>(null);
    const fileRef3 = useRef<HTMLInputElement>(null);
    const fileRef4_1 = useRef<HTMLInputElement>(null);
    const fileRef4_2 = useRef<HTMLInputElement>(null);

    // Read File as Base64 helper
    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        fieldPath: string,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("File terlalu besar. Maksimal 5MB.");
            e.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            updateField(fieldPath, base64);
        };
        reader.readAsDataURL(file);
    };

    const updateField = (path: string, value: any) => {
        setFormData((prev: any) => {
            const keys = path.split(".");
            if (keys.length === 1) {
                return { ...prev, [keys[0]]: value };
            } else if (keys.length === 2) {
                return {
                    ...prev,
                    [keys[0]]: { ...prev[keys[0]], [keys[1]]: value },
                };
            }
            return prev;
        });

        setInvalidFields((prev) => prev.filter((field) => field.path !== path));
    };

    useEffect(() => {
        document
            .querySelectorAll<HTMLElement>(".has-inline-error")
            .forEach((el) => {
                el.classList.remove("has-inline-error");
                el.removeAttribute("data-inline-error");
            });

        invalidFields.forEach((field) => {
            const target = document.querySelector<HTMLElement>(
                `[data-required-field="${field.path}"]`,
            );
            if (!target) return;

            const container = target.closest(
                ".form-group",
            ) as HTMLElement | null;
            const errorAnchor = container || target;
            errorAnchor.classList.add("has-inline-error");
            errorAnchor.setAttribute(
                "data-inline-error",
                `${field.label} wajib diisi.`,
            );
        });
    }, [invalidFields]);

    const toggleCheckbox = (path: string, val: string) => {
        setFormData((prev: any) => {
            const keys = path.split(".");
            if (keys.length === 1) {
                const arr = prev[keys[0]] || [];
                const nextArr = arr.includes(val)
                    ? arr.filter((x: string) => x !== val)
                    : [...arr, val];
                return { ...prev, [keys[0]]: nextArr };
            } else if (keys.length === 2) {
                const arr = prev[keys[0]][keys[1]] || [];
                const nextArr = arr.includes(val)
                    ? arr.filter((x: string) => x !== val)
                    : [...arr, val];
                return {
                    ...prev,
                    [keys[0]]: { ...prev[keys[0]], [keys[1]]: nextArr },
                };
            }
            return prev;
        });
    };

    const scrollToRequiredField = (fieldPath: string) => {
        const field = document.querySelector<HTMLElement>(
            `[data-required-field="${fieldPath}"]`,
        );
        if (!field) return;

        field.scrollIntoView({ behavior: "smooth", block: "center" });
        field.classList.add("missing-field-target");

        const focusTarget = field.matches("input, textarea, select")
            ? field
            : field.querySelector<HTMLElement>("input, textarea, select");
        focusTarget?.focus({ preventScroll: true });

        window.setTimeout(() => {
            field.classList.remove("missing-field-target");
        }, 1800);
    };

    const openImagePreview = (src: string, caption: string) => {
        if ((window as any).YogurtLightbox) {
            (window as any).YogurtLightbox.open(src, caption);
        }
    };

    const getMissingFields = (): MissingFieldEntry[] => {
        const missing: MissingFieldEntry[] = [];
        if (stageNum === 1) {
            if (!formData.kelompok)
                missing.push({ path: "kelompok", label: "Nama Kelompok" });
            if (!formData.ekstrak)
                missing.push({ path: "ekstrak", label: "Jenis Ekstrak" });
            if (!formData.anggota)
                missing.push({
                    path: "anggota",
                    label: "Nama Anggota Kelompok",
                });
            if (!formData.komposisi)
                missing.push({
                    path: "komposisi",
                    label: "Komposisi Bahan Lengkap",
                });
            if (!formData.alasan_inovasi)
                missing.push({
                    path: "alasan_inovasi",
                    label: "Alasan Pemilihan & Inovasi",
                });
            if (!formData.foto_bahan)
                missing.push({ path: "foto_bahan", label: "Foto Bahan-Bahan" });
        }
        if (stageNum === 2) {
            if (!formData.proses)
                missing.push({
                    path: "proses",
                    label: "Deskripsi Proses Pembuatan",
                });
            if (!formData.prediksi_jam)
                missing.push({ path: "prediksi_jam", label: "Prediksi Jam" });
            if (!formData.alasan_prediksi)
                missing.push({
                    path: "alasan_prediksi",
                    label: "Alasan Prediksi",
                });
            if (!formData.jam0?.warna)
                missing.push({ path: "jam0.warna", label: "Warna Awal" });
            if (!formData.jam0?.aroma)
                missing.push({ path: "jam0.aroma", label: "Aroma Awal" });
            if (!formData.jam0?.rasa)
                missing.push({ path: "jam0.rasa", label: "Rasa Awal" });
            if (!formData.jam0?.ph)
                missing.push({ path: "jam0.ph", label: "Nilai pH Awal" });
            if (!formData.jam0?.ph_foto)
                missing.push({
                    path: "jam0.ph_foto",
                    label: "Foto Kertas Lakmus Awal",
                });
            if (!formData.jam0?.catatan)
                missing.push({
                    path: "jam0.catatan",
                    label: "Catatan Tambahan",
                });
            if (!formData.jam0?.foto)
                missing.push({
                    path: "jam0.foto",
                    label: "Foto Produk Sebelum Fermentasi",
                });
        }
        if (stageNum === 3 || stageNum === 4) {
            if (!formData.warna)
                missing.push({ path: "warna", label: "Deskripsi Warna" });
            if (!formData.aroma)
                missing.push({ path: "aroma", label: "Deskripsi Aroma" });
            if (!formData.tekstur)
                missing.push({ path: "tekstur", label: "Pilihan Tekstur" });
            if (!formData.rasa)
                missing.push({ path: "rasa", label: "Deskripsi Rasa" });
            if (!formData.catatan)
                missing.push({ path: "catatan", label: "Catatan Tambahan" });
            if (!formData.foto)
                missing.push({ path: "foto", label: "Foto Kondisi Yogurt" });
            if (stageNum === 4) {
                if (!formData.ph_akhir)
                    missing.push({
                        path: "ph_akhir",
                        label: "Nilai pH Akhir",
                    });
                if (!formData.ph_akhir_foto)
                    missing.push({
                        path: "ph_akhir_foto",
                        label: "Foto Kertas Lakmus Akhir",
                    });
                if (!formData.kesimpulan_awal)
                    missing.push({
                        path: "kesimpulan_awal",
                        label: "Kesimpulan Awal",
                    });
            }
        }
        return missing;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const missing = getMissingFields();
        if (missing.length > 0) {
            setInvalidFields(missing);
            scrollToRequiredField(missing[0].path);
            return;
        }

        setInvalidFields([]);

        // Process validations on submit
        let normalStatus = { ...formData };
        if (stageNum === 3 || stageNum === 4) {
            // Auto-calculate normality flags
            const warnaNormal = !formData.warna_opsi?.includes(
                "muncul bercak hitam/hijau/abu-abu (tekstur jamur)",
            );
            const aromaNormal = !formData.aroma_opsi?.some((x: string) =>
                ["busuk / tengik", "tidak berbau sama sekali"].includes(x),
            );
            const rasaNormal = !formData.rasa_opsi?.some((x: string) =>
                ["hambar", "rasa asing (pahit/basi)"].includes(x),
            );
            const teksturNormal = formData.tekstur !== "cair/encer";

            normalStatus = {
                ...formData,
                warna_normal: warnaNormal,
                aroma_normal: aromaNormal,
                rasa_normal: rasaNormal,
                tekstur_normal: teksturNormal,
            };
        }

        onSubmit(normalStatus);
    };

    // Live pH hint for Stage 4
    const getPhHint = () => {
        const val = parseFloat(formData.ph_akhir);
        if (isNaN(val) || formData.ph_akhir === "") return null;
        if (val >= 3.8 && val <= 4.5) {
            return (
                <span className="hint-block hint-optimal">
                    ✔️ pH optimal yogurt berhasil (3,8–4,5)
                </span>
            );
        } else if (val < 3.8) {
            return (
                <span className="hint-block hint-warning">
                    ❗ pH terlalu asam — di bawah 3,8
                </span>
            );
        } else {
            return (
                <span className="hint-block hint-warning">
                    ❗ pH masih tinggi — fermentasi belum optimal (di atas 4,5)
                </span>
            );
        }
    };

    return (
        <>
            <form
                onSubmit={handleSubmit}
                className="stage-form"
                style={{ marginTop: "20px" }}
            >
                {/* TAHAP 1: FORMULATION STAGE */}
                {stageNum === 1 && (
                    <>
                        <div className="stage-instruction">
                            <div className="instruction-icon">
                                <ClipboardList
                                    className="w-6 h-6 text-[var(--accent)]"
                                    style={{ width: "24px", height: "24px" }}
                                />
                            </div>
                            <div className="instruction-text">
                                <strong>
                                    Sebelum memulai pembuatan yogurt, lengkapi
                                    rencana proyek kalian terlebih dahulu!
                                </strong>
                                Tuliskan bahan-bahan yang akan digunakan,
                                komposisi (takaran) masing-masing bahan, dan
                                durasi fermentasi selama <strong>12 jam</strong>
                                .
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>
                                <Users
                                    className="w-4.5 h-4.5 mr-1 inline"
                                    style={{
                                        width: "18px",
                                        height: "18px",
                                        verticalAlign: "middle",
                                    }}
                                />{" "}
                                Identitas Kelompok
                            </h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="s1-kelompok">
                                        Nama Kelompok
                                    </label>
                                    <input
                                        type="text"
                                        id="s1-kelompok"
                                        data-required-field="kelompok"
                                        placeholder="Contoh: Kelompok Stroberi"
                                        value={formData.kelompok || ""}
                                        onChange={(e) =>
                                            updateField(
                                                "kelompok",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="s1-ekstrak">
                                        Jenis Ekstrak yang Dipilih
                                    </label>
                                    <input
                                        type="text"
                                        id="s1-ekstrak"
                                        data-required-field="ekstrak"
                                        placeholder="Contoh: Ekstrak Stroberi"
                                        value={formData.ekstrak || ""}
                                        onChange={(e) =>
                                            updateField(
                                                "ekstrak",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="s1-anggota">
                                    Nama Anggota Kelompok
                                </label>
                                <textarea
                                    id="s1-anggota"
                                    data-required-field="anggota"
                                    rows={3}
                                    placeholder={`Tuliskan semua nama anggota, satu per baris\nContoh:\n1. Andi\n2. Budi\n3. Citra`}
                                    value={formData.anggota || ""}
                                    onChange={(e) =>
                                        updateField("anggota", e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>
                                <FlaskConical
                                    className="w-4.5 h-4.5 mr-1 inline"
                                    style={{
                                        width: "18px",
                                        height: "18px",
                                        verticalAlign: "middle",
                                    }}
                                />{" "}
                                Komposisi Bahan
                            </h3>
                            <p className="form-hint">
                                Tuliskan semua bahan dan takaran yang akan
                                digunakan secara detail.
                            </p>
                            <div className="form-group">
                                <label htmlFor="s1-komposisi">
                                    Komposisi Bahan Lengkap
                                </label>
                                <textarea
                                    id="s1-komposisi"
                                    data-required-field="komposisi"
                                    rows={5}
                                    placeholder={`Contoh:\n- 200 ml Susu UHT Full Cream\n- 2 sdm Yogurt plain (starter)\n- 50 ml Ekstrak stroberi segar\n- 1 sdm gula pasir`}
                                    value={formData.komposisi || ""}
                                    onChange={(e) =>
                                        updateField("komposisi", e.target.value)
                                    }
                                />
                            </div>
                            <div
                                className="info-pill"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                }}
                            >
                                <Timer
                                    className="w-3.5 h-3.5"
                                    style={{ width: "14px", height: "14px" }}
                                />{" "}
                                Durasi Fermentasi: <strong>12 Jam</strong>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>
                                <Lightbulb
                                    className="w-4.5 h-4.5 mr-1 inline"
                                    style={{
                                        width: "18px",
                                        height: "18px",
                                        verticalAlign: "middle",
                                    }}
                                />{" "}
                                Inovasi &amp; Alasan Pemilihan
                            </h3>
                            <div className="form-group">
                                <label htmlFor="s1-alasan">
                                    Mengapa kalian memilih komposisi dan jenis
                                    ekstrak tersebut? Apa inovasi yang ingin
                                    kalian tonjolkan?
                                </label>
                                <textarea
                                    id="s1-alasan"
                                    data-required-field="alasan_inovasi"
                                    rows={4}
                                    placeholder="Jelaskan alasan dan inovasi kelompok kalian..."
                                    value={formData.alasan_inovasi || ""}
                                    onChange={(e) =>
                                        updateField(
                                            "alasan_inovasi",
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>
                                <ImageIcon
                                    className="w-4.5 h-4.5 mr-1 inline"
                                    style={{
                                        width: "18px",
                                        height: "18px",
                                        verticalAlign: "middle",
                                    }}
                                />{" "}
                                Foto Bahan-Bahan{" "}
                                <span className="required-badge">WAJIB</span>
                            </h3>
                            <p className="form-hint">
                                Upload foto semua bahan yang sudah disiapkan.
                            </p>
                            {formData.foto_bahan && (
                                <div
                                    className="current-photo-wrap"
                                    data-required-field="foto_bahan"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                    }}
                                >
                                    <div className="current-photo-label">
                                        📷 Preview Foto:
                                    </div>
                                    <img
                                        src={formData.foto_bahan}
                                        className="view-photo clickable"
                                        alt="Preview"
                                        title="Klik untuk memperbesar"
                                        onClick={() =>
                                            openImagePreview(
                                                formData.foto_bahan,
                                                "Foto Bahan",
                                            )
                                        }
                                        style={{
                                            maxWidth: "250px",
                                            borderRadius: "12px",
                                            cursor: "zoom-in",
                                        }}
                                    />
                                    <div>
                                        <button
                                            type="button"
                                            className="photo-remove-btn"
                                            style={{ marginLeft: "6px" }}
                                            onClick={() =>
                                                updateField("foto_bahan", "")
                                            }
                                        >
                                            Hapus Foto
                                        </button>
                                    </div>
                                </div>
                            )}
                            {!formData.foto_bahan && (
                                <div
                                    className="photo-upload-area"
                                    data-required-field="foto_bahan"
                                    onClick={() => fileRef1.current?.click()}
                                    style={{ cursor: "pointer" }}
                                >
                                    <div className="photo-upload-icon">
                                        <ImageIcon
                                            className="w-8 h-8 text-[var(--accent)]"
                                            style={{
                                                width: "32px",
                                                height: "32px",
                                            }}
                                        />
                                    </div>
                                    <p>Klik untuk pilih foto bahan</p>
                                    <small>Format JPG/PNG, maksimal 5MB</small>
                                    <input
                                        type="file"
                                        ref={fileRef1}
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={(e) =>
                                            handleFileChange(e, "foto_bahan")
                                        }
                                    />
                                </div>
                            )}
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                }}
                            >
                                <Save className="w-4 h-4" />{" "}
                                {existing
                                    ? "Simpan Perubahan Rencana Proyek"
                                    : "Simpan Rencana Proyek"}
                            </button>
                        </div>
                    </>
                )}

                {/* TAHAP 2: PRODUCTION DAY */}
                {stageNum === 2 && (
                    <>
                        <div className="stage-instruction">
                            <div className="instruction-icon">
                                <FlaskConical
                                    className="w-6 h-6 text-[var(--accent)]"
                                    style={{ width: "24px", height: "24px" }}
                                />
                            </div>
                            <div className="instruction-text">
                                <strong>Saatnya membuat yogurtmu!</strong> Ikuti
                                langkah pembuatan yang telah kamu rancang.
                                Setelah selesai, dokumentasikan proses pembuatan
                                dan kondisi awal yogurtmu (jam ke-0) sebelum
                                difermentasi.
                            </div>
                        </div>
                        <div
                            className="attention-box"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                background: "rgba(245, 200, 66, 0.08)",
                                border: "1px solid var(--gold)",
                                color: "var(--text)",
                                padding: "12px 16px",
                                borderRadius: "8px",
                                marginBottom: "16px",
                            }}
                        >
                            <AlertTriangle
                                className="w-4 h-4 text-[var(--gold)]"
                                style={{
                                    width: "16px",
                                    height: "16px",
                                    flexShrink: 0,
                                }}
                            />
                            <div>
                                <strong>PERHATIAN:</strong> Simpan yogurt di{" "}
                                <strong>suhu ruang (25–30°C)</strong>. Tempatkan
                                di ruangan yang <strong>gelap</strong>, tidak
                                terkena sinar matahari langsung.
                                <strong>
                                    Jangan membuka wadah sama sekali hingga
                                    pengamatan pertama di jam ke-8
                                </strong>{" "}
                                untuk meminimalkan risiko kontaminasi bakteri
                                luar.
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>
                                <Beaker
                                    className="w-4.5 h-4.5 mr-1 inline"
                                    style={{
                                        width: "18px",
                                        height: "18px",
                                        verticalAlign: "middle",
                                    }}
                                />{" "}
                                Proses Pembuatan
                            </h3>
                            <div className="form-group">
                                <label>Deskripsi Proses Pembuatan</label>
                                <textarea
                                    data-required-field="proses"
                                    rows={5}
                                    placeholder="Ceritakan langkah-langkah yang sudah kalian lakukan..."
                                    value={formData.proses || ""}
                                    onChange={(e) =>
                                        updateField("proses", e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>
                                <HelpCircle
                                    className="w-4.5 h-4.5 mr-1 inline"
                                    style={{
                                        width: "18px",
                                        height: "18px",
                                        verticalAlign: "middle",
                                    }}
                                />{" "}
                                Pertanyaan Prediksi
                            </h3>
                            <div className="prediction-card">
                                <p className="prediction-q">
                                    Berdasarkan bahan yang kalian gunakan,
                                    menurut kalian pada{" "}
                                    <strong>jam ke berapa</strong> tekstur
                                    yogurt akan mulai mengental secara
                                    signifikan? Berikan alasannya!
                                </p>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Prediksi Jam ke-</label>
                                        <div className="input-with-unit">
                                            <input
                                                type="number"
                                                data-required-field="prediksi_jam"
                                                min="1"
                                                max="12"
                                                step="1"
                                                placeholder="Tulis prediksi jam keberapa yogurt mulai mengental"
                                                value={
                                                    formData.prediksi_jam || ""
                                                }
                                                onChange={(e) =>
                                                    updateField(
                                                        "prediksi_jam",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <span className="input-unit">
                                                jam
                                            </span>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Alasan Prediksi</label>
                                        <textarea
                                            data-required-field="alasan_prediksi"
                                            rows={3}
                                            placeholder="Karena..."
                                            value={
                                                formData.alasan_prediksi || ""
                                            }
                                            onChange={(e) =>
                                                updateField(
                                                    "alasan_prediksi",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3 className="section-jam">
                                <Timer
                                    className="w-4.5 h-4.5 mr-1 inline"
                                    style={{
                                        width: "18px",
                                        height: "18px",
                                        verticalAlign: "middle",
                                    }}
                                />{" "}
                                Kondisi Awal — Jam ke-0 (Sebelum Fermentasi)
                            </h3>
                            <p className="form-hint">
                                Catat kondisi awal yogurt sebelum proses
                                fermentasi dimulai sebagai data{" "}
                                <em>baseline</em> pengamatanmu.
                            </p>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        <Palette
                                            className="w-3.5 h-3.5 mr-1 inline"
                                            style={{
                                                width: "14px",
                                                height: "14px",
                                                verticalAlign: "middle",
                                            }}
                                        />{" "}
                                        Warna Awal
                                    </label>
                                    <input
                                        type="text"
                                        data-required-field="jam0.warna"
                                        placeholder="Sesuai warna ekstrak bahan, cth: Pink"
                                        value={formData.jam0?.warna || ""}
                                        onChange={(e) =>
                                            updateField(
                                                "jam0.warna",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label>
                                        <Wind
                                            className="w-3.5 h-3.5 mr-1 inline"
                                            style={{
                                                width: "14px",
                                                height: "14px",
                                                verticalAlign: "middle",
                                            }}
                                        />{" "}
                                        Aroma Awal
                                    </label>
                                    <input
                                        type="text"
                                        data-required-field="jam0.aroma"
                                        placeholder="Cth: Aroma susu segar + stroberi"
                                        value={formData.jam0?.aroma || ""}
                                        onChange={(e) =>
                                            updateField(
                                                "jam0.aroma",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        <Smile
                                            className="w-3.5 h-3.5 mr-1 inline"
                                            style={{
                                                width: "14px",
                                                height: "14px",
                                                verticalAlign: "middle",
                                            }}
                                        />{" "}
                                        Rasa Awal
                                    </label>
                                    <input
                                        type="text"
                                        data-required-field="jam0.rasa"
                                        placeholder="Cth: Manis, segar beraroma stroberi"
                                        value={formData.jam0?.rasa || ""}
                                        onChange={(e) =>
                                            updateField(
                                                "jam0.rasa",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label>
                                        <Activity
                                            className="w-3.5 h-3.5 mr-1 inline"
                                            style={{
                                                width: "14px",
                                                height: "14px",
                                                verticalAlign: "middle",
                                            }}
                                        />{" "}
                                        Tekstur Awal
                                    </label>
                                    <div className="info-pill">
                                        Cair (normal untuk awal fermentasi)
                                    </div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div
                                    className="form-group"
                                    style={{ maxWidth: "200px" }}
                                >
                                    <label>
                                        <FlaskConical
                                            className="w-3.5 h-3.5 mr-1 inline"
                                            style={{
                                                width: "14px",
                                                height: "14px",
                                                verticalAlign: "middle",
                                            }}
                                        />{" "}
                                        Nilai pH Awal{" "}
                                        <span className="required-badge">
                                            WAJIB
                                        </span>
                                    </label>
                                    <div className="input-with-unit">
                                        <input
                                            type="number"
                                            data-required-field="jam0.ph"
                                            min="0"
                                            max="14"
                                            step="0.1"
                                            placeholder="Cth: 6.5"
                                            value={formData.jam0?.ph || ""}
                                            onChange={(e) =>
                                                updateField(
                                                    "jam0.ph",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <span className="input-unit">pH</span>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>
                                        <Camera
                                            className="w-3.5 h-3.5 mr-1 inline"
                                            style={{
                                                width: "14px",
                                                height: "14px",
                                                verticalAlign: "middle",
                                            }}
                                        />{" "}
                                        Foto Kertas Lakmus Awal (Jam ke-0){" "}
                                        <span className="required-badge">
                                            WAJIB
                                        </span>
                                    </label>
                                    {formData.jam0?.ph_foto && (
                                        <div
                                            className="current-photo-wrap"
                                            data-required-field="jam0.ph_foto"
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "12px",
                                            }}
                                        >
                                            <img
                                                src={formData.jam0.ph_foto}
                                                className="view-photo clickable"
                                                alt="pH Preview"
                                                title="Klik untuk memperbesar"
                                                onClick={() =>
                                                    openImagePreview(
                                                        formData.jam0.ph_foto,
                                                        "Foto Kertas Lakmus Jam ke-0",
                                                    )
                                                }
                                                style={{
                                                    maxWidth: "150px",
                                                    borderRadius: "8px",
                                                    cursor: "zoom-in",
                                                }}
                                            />
                                            <div>
                                                <button
                                                    type="button"
                                                    className="photo-remove-btn"
                                                    style={{
                                                        marginLeft: "6px",
                                                    }}
                                                    onClick={() =>
                                                        updateField(
                                                            "jam0.ph_foto",
                                                            "",
                                                        )
                                                    }
                                                >
                                                    Hapus Foto
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {!formData.jam0?.ph_foto && (
                                        <div
                                            className="photo-upload-area-sm"
                                            data-required-field="jam0.ph_foto"
                                            onClick={() =>
                                                fileRef2_1.current?.click()
                                            }
                                            style={{
                                                maxWidth: "320px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <div
                                                className="photo-upload-icon"
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    marginBottom: "8px",
                                                }}
                                            >
                                                <ImageIcon
                                                    className="w-6 h-6 text-[var(--text-muted)]"
                                                    style={{
                                                        width: "24px",
                                                        height: "24px",
                                                    }}
                                                />
                                            </div>
                                            <p>
                                                Klik untuk pilih foto kertas
                                                lakmus
                                            </p>
                                            <small>
                                                Format JPG/PNG, maks. 5MB
                                            </small>
                                            <input
                                                type="file"
                                                ref={fileRef2_1}
                                                accept="image/*"
                                                style={{ display: "none" }}
                                                onChange={(e) =>
                                                    handleFileChange(
                                                        e,
                                                        "jam0.ph_foto",
                                                    )
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Catatan Tambahan</label>
                                <textarea
                                    data-required-field="jam0.catatan"
                                    rows={2}
                                    placeholder="Catatan lain..."
                                    value={formData.jam0?.catatan || ""}
                                    onChange={(e) =>
                                        updateField(
                                            "jam0.catatan",
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>

                            <h4>
                                <Camera
                                    className="w-4.5 h-4.5 mr-1 inline"
                                    style={{
                                        width: "18px",
                                        height: "18px",
                                        verticalAlign: "middle",
                                    }}
                                />{" "}
                                Foto Produk Sebelum Fermentasi{" "}
                                <span className="required-badge">WAJIB</span>
                            </h4>
                            {formData.jam0?.foto && (
                                <div
                                    className="current-photo-wrap"
                                    data-required-field="jam0.foto"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                    }}
                                >
                                    <img
                                        src={formData.jam0.foto}
                                        className="view-photo clickable"
                                        alt="Product Preview"
                                        title="Klik untuk memperbesar"
                                        onClick={() =>
                                            openImagePreview(
                                                formData.jam0.foto,
                                                "Foto Produk Sebelum Fermentasi",
                                            )
                                        }
                                        style={{
                                            maxWidth: "150px",
                                            borderRadius: "8px",
                                            cursor: "zoom-in",
                                        }}
                                    />
                                    <div>
                                        <button
                                            type="button"
                                            className="photo-remove-btn"
                                            style={{ marginLeft: "6px" }}
                                            onClick={() =>
                                                updateField("jam0.foto", "")
                                            }
                                        >
                                            Hapus Foto
                                        </button>
                                    </div>
                                </div>
                            )}
                            {!formData.jam0?.foto && (
                                <div
                                    className="photo-upload-area"
                                    data-required-field="jam0.foto"
                                    onClick={() => fileRef2_2.current?.click()}
                                    style={{ cursor: "pointer" }}
                                >
                                    <div className="photo-upload-icon">
                                        <ImageIcon
                                            className="w-8 h-8 text-[var(--accent)]"
                                            style={{
                                                width: "32px",
                                                height: "32px",
                                            }}
                                        />
                                    </div>
                                    <p>
                                        Klik untuk pilih foto kondisi awal
                                        yogurt
                                    </p>
                                    <small>JPG/PNG, maks. 5MB</small>
                                    <input
                                        type="file"
                                        ref={fileRef2_2}
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={(e) =>
                                            handleFileChange(e, "jam0.foto")
                                        }
                                    />
                                </div>
                            )}
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                }}
                            >
                                Simpan &amp; Lanjut ke Pengamatan{" "}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </>
                )}

                {/* TAHAP 3 & 4: ORGANOLEPTIC EXPERIMENTS */}
                {(stageNum === 3 || stageNum === 4) && (
                    <>
                        <div className="stage-instruction">
                            <div className="instruction-icon">
                                {stageNum === 3 ? (
                                    <Clock
                                        className="w-6 h-6 text-[var(--accent)]"
                                        style={{
                                            width: "24px",
                                            height: "24px",
                                        }}
                                    />
                                ) : (
                                    <Timer
                                        className="w-6 h-6 text-[var(--accent)]"
                                        style={{
                                            width: "24px",
                                            height: "24px",
                                        }}
                                    />
                                )}
                            </div>
                            <div className="instruction-text">
                                {stageNum === 3 ? (
                                    <span>
                                        <strong>
                                            Waktunya pengamatan pertama!
                                        </strong>{" "}
                                        Setelah melewati <strong>8 jam</strong>{" "}
                                        masa inkubasi yang tenang, buka wadah
                                        sedikit dan ambil 1 sendok sampel yogurt
                                        dengan cara steril, lalu segera tutup
                                        kembali wadah utama. Amati apakah mulai
                                        terbentuk <em>lapisan whey</em> (cairan
                                        bening) di permukaan, dan catat
                                        perubahan organoleptik pada sampel
                                        tersebut (warna, aroma, rasa, tekstur).
                                    </span>
                                ) : (
                                    <span>
                                        <strong>
                                            Ini adalah pengamatan terakhir!
                                        </strong>{" "}
                                        Yogurtmu sudah melewati{" "}
                                        <strong>12 jam fermentasi</strong>.
                                        Lakukan uji organoleptik lengkap, ukur
                                        pH akhir, dan tuliskan kesimpulan awalmu
                                        mengenai hasil fermentasi kelompokmu.
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="form-section">
                            <h3 className="section-jam">
                                <ImageIcon
                                    className="w-4.5 h-4.5 mr-1 inline"
                                    style={{
                                        width: "18px",
                                        height: "18px",
                                        verticalAlign: "middle",
                                    }}
                                />{" "}
                                Uji Organoleptik —{" "}
                                {stageNum === 3
                                    ? "Jam ke-8"
                                    : "Jam ke-12 (Final)"}
                            </h3>
                            <p className="form-hint">
                                Gunakan metode 1 sendok sampel. Amati keempat
                                aspek di bawah ini dan tentukan statusnya.
                            </p>

                            {/* Warna Checkbox */}
                            <div className="organo-block">
                                <div className="organo-header">
                                    <Palette
                                        className="w-4 h-4 mr-1 inline text-[var(--accent)]"
                                        style={{
                                            width: "16px",
                                            height: "16px",
                                            verticalAlign: "middle",
                                        }}
                                    />{" "}
                                    Warna
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>
                                            Deskripsi Warna yang Diamati
                                        </label>
                                        <input
                                            type="text"
                                            data-required-field="warna"
                                            placeholder="Cth: Pink cerah (stroberi), atau ada bercak hijau"
                                            value={formData.warna || ""}
                                            onChange={(e) =>
                                                updateField(
                                                    "warna",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>
                                            Pilih warna sesuai deskripsi kalian
                                            (*pilihan dpt lebih dari 1)
                                        </label>
                                        <div className="checkbox-group">
                                            <label className="checkbox-card">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        formData.warna_opsi?.includes(
                                                            "sesuai warna ekstrak bahan",
                                                        ) || false
                                                    }
                                                    onChange={() =>
                                                        toggleCheckbox(
                                                            "warna_opsi",
                                                            "sesuai warna ekstrak bahan",
                                                        )
                                                    }
                                                />
                                                <div className="checkbox-content">
                                                    <span className="checkbox-box"></span>
                                                    <span className="checkbox-label-text">
                                                        Sesuai warna ekstrak
                                                        bahan
                                                    </span>
                                                </div>
                                            </label>
                                            <label className="checkbox-card">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        formData.warna_opsi?.includes(
                                                            "muncul bercak hitam/hijau/abu-abu (tekstur jamur)",
                                                        ) || false
                                                    }
                                                    onChange={() =>
                                                        toggleCheckbox(
                                                            "warna_opsi",
                                                            "muncul bercak hitam/hijau/abu-abu (tekstur jamur)",
                                                        )
                                                    }
                                                />
                                                <div className="checkbox-content">
                                                    <span className="checkbox-box"></span>
                                                    <span
                                                        className="checkbox-label-text"
                                                        style={{
                                                            color: "var(--text)",
                                                        }}
                                                    >
                                                        Muncul bercak
                                                        hitam/hijau/abu-abu
                                                        (tekstur jamur)
                                                    </span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Aroma Checkbox */}
                            <div className="organo-block">
                                <div className="organo-header">
                                    <Wind
                                        className="w-4 h-4 mr-1 inline text-[var(--accent)]"
                                        style={{
                                            width: "16px",
                                            height: "16px",
                                            verticalAlign: "middle",
                                        }}
                                    />{" "}
                                    Aroma
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>
                                            Deskripsi Aroma yang Diamati
                                        </label>
                                        <input
                                            type="text"
                                            data-required-field="aroma"
                                            placeholder="Cth: Asam segar beraroma stroberi"
                                            value={formData.aroma || ""}
                                            onChange={(e) =>
                                                updateField(
                                                    "aroma",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>
                                            Pilih aroma sesuai deskripsi kalian
                                            (*pilihan dpt lebih dari 1)
                                        </label>
                                        <div className="checkbox-group">
                                            <label className="checkbox-card">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        formData.aroma_opsi?.includes(
                                                            "asam khas yogurt",
                                                        ) || false
                                                    }
                                                    onChange={() =>
                                                        toggleCheckbox(
                                                            "aroma_opsi",
                                                            "asam khas yogurt",
                                                        )
                                                    }
                                                />
                                                <div className="checkbox-content">
                                                    <span className="checkbox-box"></span>
                                                    <span className="checkbox-label-text">
                                                        Asam khas yogurt
                                                    </span>
                                                </div>
                                            </label>
                                            <label className="checkbox-card">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        formData.aroma_opsi?.includes(
                                                            "beraroma ekstrak buah/sayur",
                                                        ) || false
                                                    }
                                                    onChange={() =>
                                                        toggleCheckbox(
                                                            "aroma_opsi",
                                                            "beraroma ekstrak buah/sayur",
                                                        )
                                                    }
                                                />
                                                <div className="checkbox-content">
                                                    <span className="checkbox-box"></span>
                                                    <span className="checkbox-label-text">
                                                        Beraroma ekstrak
                                                        buah/sayur
                                                    </span>
                                                </div>
                                            </label>
                                            <label className="checkbox-card">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        formData.aroma_opsi?.includes(
                                                            "busuk / tengik",
                                                        ) || false
                                                    }
                                                    onChange={() =>
                                                        toggleCheckbox(
                                                            "aroma_opsi",
                                                            "busuk / tengik",
                                                        )
                                                    }
                                                />
                                                <div className="checkbox-content">
                                                    <span className="checkbox-box"></span>
                                                    <span
                                                        className="checkbox-label-text"
                                                        style={{
                                                            color: "var(--text)",
                                                        }}
                                                    >
                                                        Busuk / tengik
                                                    </span>
                                                </div>
                                            </label>
                                            <label className="checkbox-card">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        formData.aroma_opsi?.includes(
                                                            "tidak berbau sama sekali",
                                                        ) || false
                                                    }
                                                    onChange={() =>
                                                        toggleCheckbox(
                                                            "aroma_opsi",
                                                            "tidak berbau sama sekali",
                                                        )
                                                    }
                                                />
                                                <div className="checkbox-content">
                                                    <span className="checkbox-box"></span>
                                                    <span className="checkbox-label-text">
                                                        Tidak berbau sama sekali
                                                    </span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tekstur Select */}
                            <div className="organo-block">
                                <div className="organo-header">
                                    <Activity
                                        className="w-4 h-4 mr-1 inline text-[var(--accent)]"
                                        style={{
                                            width: "16px",
                                            height: "16px",
                                            verticalAlign: "middle",
                                        }}
                                    />{" "}
                                    Tekstur
                                </div>
                                <div
                                    className="form-row"
                                    style={{ gridTemplateColumns: "1fr" }}
                                >
                                    <div
                                        className="form-group"
                                        style={{ maxWidth: "400px" }}
                                    >
                                        <label>
                                            Pilih Tekstur yang Diamati
                                        </label>
                                        <select
                                            data-required-field="tekstur"
                                            value={formData.tekstur || ""}
                                            onChange={(e) =>
                                                updateField(
                                                    "tekstur",
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                — Pilih Tekstur —
                                            </option>
                                            <option value="cair/encer">
                                                Cair / encer
                                            </option>
                                            <option value="kental">
                                                Kental
                                            </option>
                                            <option value="sgt kental">
                                                Sangat kental
                                            </option>
                                            <option value="semi-padat">
                                                Semi-padat
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Rasa Checkbox */}
                            <div className="organo-block">
                                <div className="organo-header">
                                    <Smile
                                        className="w-4 h-4 mr-1 inline text-[var(--accent)]"
                                        style={{
                                            width: "16px",
                                            height: "16px",
                                            verticalAlign: "middle",
                                        }}
                                    />{" "}
                                    Rasa
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>
                                            Deskripsi Rasa yang Diamati
                                        </label>
                                        <input
                                            type="text"
                                            data-required-field="rasa"
                                            placeholder="Cth: Asam manis segar khas stroberi"
                                            value={formData.rasa || ""}
                                            onChange={(e) =>
                                                updateField(
                                                    "rasa",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>
                                            Pilih rasa sesuai deskripsi kalian
                                            (*pilihan dpt lebih dari 1)
                                        </label>
                                        <div className="checkbox-group">
                                            <label className="checkbox-card">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        formData.rasa_opsi?.includes(
                                                            "asam khas yogurt dan ekstrak",
                                                        ) || false
                                                    }
                                                    onChange={() =>
                                                        toggleCheckbox(
                                                            "rasa_opsi",
                                                            "asam khas yogurt dan ekstrak",
                                                        )
                                                    }
                                                />
                                                <div className="checkbox-content">
                                                    <span className="checkbox-box"></span>
                                                    <span className="checkbox-label-text">
                                                        Asam khas yogurt dan
                                                        ekstrak
                                                    </span>
                                                </div>
                                            </label>
                                            <label className="checkbox-card">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        formData.rasa_opsi?.includes(
                                                            "asam manis segar",
                                                        ) || false
                                                    }
                                                    onChange={() =>
                                                        toggleCheckbox(
                                                            "rasa_opsi",
                                                            "asam manis segar",
                                                        )
                                                    }
                                                />
                                                <div className="checkbox-content">
                                                    <span className="checkbox-box"></span>
                                                    <span className="checkbox-label-text">
                                                        Asam manis segar
                                                    </span>
                                                </div>
                                            </label>
                                            <label className="checkbox-card">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        formData.rasa_opsi?.includes(
                                                            "hambar",
                                                        ) || false
                                                    }
                                                    onChange={() =>
                                                        toggleCheckbox(
                                                            "rasa_opsi",
                                                            "hambar",
                                                        )
                                                    }
                                                />
                                                <div className="checkbox-content">
                                                    <span className="checkbox-box"></span>
                                                    <span className="checkbox-label-text">
                                                        Hambar
                                                    </span>
                                                </div>
                                            </label>
                                            <label className="checkbox-card">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        formData.rasa_opsi?.includes(
                                                            "rasa asing (pahit/basi)",
                                                        ) || false
                                                    }
                                                    onChange={() =>
                                                        toggleCheckbox(
                                                            "rasa_opsi",
                                                            "rasa asing (pahit/basi)",
                                                        )
                                                    }
                                                />
                                                <div className="checkbox-content">
                                                    <span className="checkbox-box"></span>
                                                    <span
                                                        className="checkbox-label-text"
                                                        style={{
                                                            color: "var(--text)",
                                                        }}
                                                    >
                                                        Rasa asing (pahit/basi)
                                                    </span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Catatan & Foto */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        <FileText
                                            className="w-3.5 h-3.5 mr-1 inline"
                                            style={{
                                                width: "14px",
                                                height: "14px",
                                                verticalAlign: "middle",
                                            }}
                                        />{" "}
                                        Catatan Tambahan
                                    </label>
                                    <textarea
                                        data-required-field="catatan"
                                        rows={3}
                                        placeholder="Pengamatan tambahan, perubahan yang menarik..."
                                        value={formData.catatan || ""}
                                        onChange={(e) =>
                                            updateField(
                                                "catatan",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label>
                                        <Camera
                                            className="w-3.5 h-3.5 mr-1 inline"
                                            style={{
                                                width: "14px",
                                                height: "14px",
                                                verticalAlign: "middle",
                                            }}
                                        />{" "}
                                        Foto Kondisi Yogurt{" "}
                                        {stageNum === 3
                                            ? "Jam ke-8"
                                            : "Jam ke-12"}
                                    </label>
                                    {formData.foto && (
                                        <div
                                            className="current-photo-wrap"
                                            data-required-field="foto"
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "12px",
                                            }}
                                        >
                                            <img
                                                src={formData.foto}
                                                className="view-photo clickable"
                                                alt="Preview"
                                                title="Klik untuk memperbesar"
                                                onClick={() =>
                                                    openImagePreview(
                                                        formData.foto,
                                                        `Foto Pengamatan ${
                                                            stageNum === 3
                                                                ? "Jam ke-8"
                                                                : "Jam ke-12"
                                                        }`,
                                                    )
                                                }
                                                style={{
                                                    maxWidth: "150px",
                                                    borderRadius: "8px",
                                                    cursor: "zoom-in",
                                                }}
                                            />
                                            <div>
                                                <button
                                                    type="button"
                                                    className="photo-remove-btn"
                                                    style={{
                                                        marginLeft: "6px",
                                                    }}
                                                    onClick={() =>
                                                        updateField("foto", "")
                                                    }
                                                >
                                                    Hapus Foto
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {!formData.foto && (
                                        <div
                                            className="photo-upload-area-sm"
                                            data-required-field="foto"
                                            onClick={() =>
                                                stageNum === 3
                                                    ? fileRef3.current?.click()
                                                    : fileRef4_1.current?.click()
                                            }
                                            style={{ cursor: "pointer" }}
                                        >
                                            <div
                                                className="photo-upload-icon"
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    marginBottom: "8px",
                                                }}
                                            >
                                                <ImageIcon
                                                    className="w-7 h-7 text-[var(--text-muted)]"
                                                    style={{
                                                        width: "28px",
                                                        height: "28px",
                                                    }}
                                                />
                                            </div>
                                            <p>Klik untuk pilih foto</p>
                                            <input
                                                type="file"
                                                ref={
                                                    stageNum === 3
                                                        ? fileRef3
                                                        : fileRef4_1
                                                }
                                                accept="image/*"
                                                style={{ display: "none" }}
                                                onChange={(e) =>
                                                    handleFileChange(e, "foto")
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Extra pH fields for Stage 4 */}
                        {stageNum === 4 && (
                            <>
                                <div className="form-section">
                                    <h3>
                                        <FlaskConical
                                            className="w-4.5 h-4.5 mr-1 inline"
                                            style={{
                                                width: "18px",
                                                height: "18px",
                                                verticalAlign: "middle",
                                            }}
                                        />{" "}
                                        Pengukuran pH Akhir{" "}
                                        <span className="required-badge">
                                            WAJIB
                                        </span>
                                    </h3>
                                    <p className="form-hint">
                                        Ukur pH menggunakan kertas lakmus.
                                    </p>
                                    <div className="form-row">
                                        <div
                                            className="form-group"
                                            style={{ maxWidth: "200px" }}
                                        >
                                            <label>Nilai pH Akhir</label>
                                            <div className="input-with-unit">
                                                <input
                                                    type="number"
                                                    data-required-field="ph_akhir"
                                                    min="0"
                                                    max="14"
                                                    step="0.1"
                                                    placeholder="Cth: 4.2"
                                                    value={
                                                        formData.ph_akhir || ""
                                                    }
                                                    onChange={(e) =>
                                                        updateField(
                                                            "ph_akhir",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <span className="input-unit">
                                                    pH
                                                </span>
                                            </div>
                                            {getPhHint()}
                                        </div>
                                        <div className="form-group">
                                            <label>
                                                <Camera
                                                    className="w-3.5 h-3.5 mr-1 inline"
                                                    style={{
                                                        width: "14px",
                                                        height: "14px",
                                                        verticalAlign: "middle",
                                                    }}
                                                />{" "}
                                                Foto Kertas Lakmus Akhir (Jam
                                                ke-12){" "}
                                                <span className="required-badge">
                                                    WAJIB
                                                </span>
                                            </label>
                                            {formData.ph_akhir_foto && (
                                                <div
                                                    className="current-photo-wrap"
                                                    data-required-field="ph_akhir_foto"
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "12px",
                                                    }}
                                                >
                                                    <img
                                                        src={
                                                            formData.ph_akhir_foto
                                                        }
                                                        className="view-photo clickable"
                                                        alt="pH Preview"
                                                        title="Klik untuk memperbesar"
                                                        onClick={() =>
                                                            openImagePreview(
                                                                formData.ph_akhir_foto,
                                                                "Foto Kertas Lakmus Jam ke-12",
                                                            )
                                                        }
                                                        style={{
                                                            maxWidth: "150px",
                                                            borderRadius: "8px",
                                                            cursor: "zoom-in",
                                                        }}
                                                    />
                                                    <div>
                                                        <button
                                                            type="button"
                                                            className="photo-remove-btn"
                                                            style={{
                                                                marginLeft:
                                                                    "6px",
                                                            }}
                                                            onClick={() =>
                                                                updateField(
                                                                    "ph_akhir_foto",
                                                                    "",
                                                                )
                                                            }
                                                        >
                                                            Hapus Foto
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {!formData.ph_akhir_foto && (
                                                <div
                                                    className="photo-upload-area-sm"
                                                    data-required-field="ph_akhir_foto"
                                                    onClick={() =>
                                                        fileRef4_2.current?.click()
                                                    }
                                                    style={{
                                                        maxWidth: "320px",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    <div
                                                        className="photo-upload-icon"
                                                        style={{
                                                            display: "flex",
                                                            justifyContent:
                                                                "center",
                                                            marginBottom: "8px",
                                                        }}
                                                    >
                                                        <ImageIcon
                                                            className="w-6 h-6 text-[var(--text-muted)]"
                                                            style={{
                                                                width: "24px",
                                                                height: "24px",
                                                            }}
                                                        />
                                                    </div>
                                                    <p>
                                                        Klik untuk pilih foto
                                                        kertas lakmus
                                                    </p>
                                                    <small>
                                                        Format JPG/PNG, maks.
                                                        5MB
                                                    </small>
                                                    <input
                                                        type="file"
                                                        ref={fileRef4_2}
                                                        accept="image/*"
                                                        style={{
                                                            display: "none",
                                                        }}
                                                        onChange={(e) =>
                                                            handleFileChange(
                                                                e,
                                                                "ph_akhir_foto",
                                                            )
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h3>
                                        <FileText
                                            className="w-4.5 h-4.5 mr-1 inline"
                                            style={{
                                                width: "18px",
                                                height: "18px",
                                                verticalAlign: "middle",
                                            }}
                                        />{" "}
                                        Kesimpulan Awal
                                    </h3>
                                    <div className="form-group">
                                        <label>
                                            Menurut kelompokmu, apakah yogurt
                                            berhasil terbentuk? Mengapa?
                                        </label>
                                        <textarea
                                            data-required-field="kesimpulan_awal"
                                            rows={5}
                                            placeholder="Berdasarkan pengamatan kami, yogurt..."
                                            value={
                                                formData.kesimpulan_awal || ""
                                            }
                                            onChange={(e) =>
                                                updateField(
                                                    "kesimpulan_awal",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={
                                    stageNum === 4
                                        ? {
                                              background:
                                                  "linear-gradient(135deg,#00C896,#7C6FFF)",
                                              boxShadow:
                                                  "0 4px 20px rgba(124,111,255,0.35)",
                                              display: "inline-flex",
                                              alignItems: "center",
                                              gap: "6px",
                                          }
                                        : {
                                              display: "inline-flex",
                                              alignItems: "center",
                                              gap: "6px",
                                          }
                                }
                            >
                                {stageNum === 4 ? (
                                    <>
                                        <Check
                                            className="w-4.5 h-4.5"
                                            style={{
                                                width: "18px",
                                                height: "18px",
                                            }}
                                        />{" "}
                                        Selesai &amp; Lihat Hasil
                                    </>
                                ) : (
                                    <>
                                        Simpan Pengamatan Jam ke-8{" "}
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </form>
        </>
    );
};
