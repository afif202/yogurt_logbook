import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Beaker, Eye, EyeOff, Microscope, Activity, Camera, Users, ArrowUpRight } from 'lucide-react';
import bcrypt from 'bcryptjs';
import { supabase } from '../utils/supabase';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Form values
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPass, setLoginShowPass] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [regName, setRegName] = useState('');
  const [regGroup, setRegGroup] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regShowPass, setRegShowPass] = useState(false);
  const [regError, setRegError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginUsername.trim() || !loginPassword.trim()) {
      setLoginError('Username dan password harus diisi.');
      return;
    }

    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', loginUsername.trim().toLowerCase())
        .single();

      if (error || !user) {
        setLoginError('Username atau password salah.');
        return;
      }

      const passMatch = bcrypt.compareSync(loginPassword, user.password);
      if (!passMatch) {
        setLoginError('Username atau password salah.');
        return;
      }

      const sessionUser = {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        group_name: user.group_name
      };

      onLoginSuccess(sessionUser);
      navigate(user.role === 'guru' ? '/teacher' : '/student');
    } catch (err: any) {
      console.error(err);
      setLoginError('Terjadi kesalahan koneksi database.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regGroup.trim() || !regUsername.trim() || !regPassword.trim()) {
      setRegError('Lengkapi semua kolom.');
      return;
    }

    if (regPassword.length < 4) {
      setRegError('Password minimal 4 karakter.');
      return;
    }

    const usernameClean = regUsername.trim().toLowerCase().replace(/\s+/g, '');

    try {
      // Check username unique
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('username', usernameClean)
        .maybeSingle();

      if (existing) {
        setRegError('Username sudah digunakan.');
        return;
      }

      // Hash password using bcryptjs
      const salt = bcrypt.genSaltSync(8);
      const hashedPassword = bcrypt.hashSync(regPassword, salt);

      // Insert User
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          name: regName.trim(),
          username: usernameClean,
          password: hashedPassword,
          role: 'siswa',
          group_name: regGroup.trim()
        })
        .select('*')
        .single();

      if (insertError || !newUser) {
        setRegError('Gagal membuat akun.');
        return;
      }

      // Create empty logbook
      const { error: logbookError } = await supabase
        .from('logbooks')
        .insert({ user_id: newUser.id });

      if (logbookError) {
        console.error('Failed to create logbook record:', logbookError);
      }

      const sessionUser = {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        role: newUser.role,
        group_name: newUser.group_name
      };

      onLoginSuccess(sessionUser);
      navigate('/student');
    } catch (err: any) {
      console.error(err);
      setRegError('Terjadi kesalahan koneksi.');
    }
  };

  return (
    <div className="landing">
      <div className="landing-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
      <div className="landing-content">
        <div className="landing-hero">
          <span className="logo-badge" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Beaker className="w-12 h-12 text-[var(--accent)]" style={{ width: '48px', height: '48px' }} />
          </span>
          <h1 className="landing-title">YogurtTrack</h1>
          <p className="landing-subtitle">Platform logbook digital pemantau proyek<br />fermentasi yogurt berbasis sains</p>
        </div>

        <div className="auth-tabs">
          <button 
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`} 
            onClick={() => setActiveTab('login')}
          >
            Masuk
          </button>
          <button 
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`} 
            onClick={() => setActiveTab('register')}
          >
            Daftar Siswa
          </button>
        </div>

        {/* LOGIN FORM */}
        {activeTab === 'login' && (
          <div className="auth-card" id="form-login">
            <h2>Selamat Datang</h2>
            <p className="auth-desc">Masuk ke akun Anda untuk mengakses logbook</p>

            {loginError && <div className="form-error">{loginError}</div>}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="login-username">Username</label>
                <input 
                  type="text" 
                  id="login-username" 
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Masukkan username" 
                  required 
                  autoComplete="username" 
                />
              </div>
              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <div className="input-with-toggle">
                  <input 
                    type={loginShowPass ? "text" : "password"} 
                    id="login-password" 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan password" 
                    required 
                    autoComplete="current-password" 
                  />
                  <button 
                    type="button" 
                    className="toggle-pass" 
                    onClick={() => setLoginShowPass(!loginShowPass)} 
                    aria-label="Tampilkan password" 
                    title="Tampilkan password"
                  >
                    {loginShowPass ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg">Masuk</button>
            </form>
          </div>
        )}

        {/* REGISTER FORM */}
        {activeTab === 'register' && (
          <div className="auth-card" id="form-register">
            <h2>Daftar Akun Siswa</h2>
            <p className="auth-desc">Buat akun untuk mengisi logbook proyek yogurt</p>
            
            {regError && <div className="form-error">{regError}</div>}

            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label htmlFor="reg-name">Nama Lengkap</label>
                <input 
                  type="text" 
                  id="reg-name" 
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Masukkan nama lengkap" 
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-group">Nama Kelompok</label>
                <input 
                  type="text" 
                  id="reg-group" 
                  value={regGroup}
                  onChange={(e) => setRegGroup(e.target.value)}
                  placeholder="Contoh: Kelompok A" 
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-username">Username</label>
                <input 
                  type="text" 
                  id="reg-username" 
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="Buat username unik (tanpa spasi)" 
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-password">Password</label>
                <div className="input-with-toggle">
                  <input 
                    type={regShowPass ? "text" : "password"} 
                    id="reg-password" 
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimal 4 karakter" 
                    required 
                  />
                  <button 
                    type="button" 
                    className="toggle-pass" 
                    onClick={() => setRegShowPass(!regShowPass)} 
                    aria-label="Tampilkan password" 
                    title="Tampilkan password"
                  >
                    {regShowPass ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg">
                Daftar &amp; Masuk <ArrowUpRight className="w-4 h-4 ml-1 inline-block" style={{ verticalAlign: 'middle' }} />
              </button>
            </form>
          </div>
        )}

        <div className="landing-features">
          <div className="feature-chip"><Microscope className="w-3.5 h-3.5 mr-1 text-[var(--accent)] inline-block" style={{ verticalAlign: 'middle' }} /> Uji Organoleptik</div>
          <div className="feature-chip"><Activity className="w-3.5 h-3.5 mr-1 text-[var(--accent)] inline-block" style={{ verticalAlign: 'middle' }} /> Evaluasi Otomatis</div>
          <div className="feature-chip"><Camera className="w-3.5 h-3.5 mr-1 text-[var(--accent)] inline-block" style={{ verticalAlign: 'middle' }} /> Upload Foto</div>
          <div className="feature-chip"><Users className="w-3.5 h-3.5 mr-1 text-[var(--accent)] inline-block" style={{ verticalAlign: 'middle' }} /> Pemantauan Guru</div>
        </div>
      </div>
    </div>
  );
};
