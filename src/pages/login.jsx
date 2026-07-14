import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { apiLogin } from "../services/api.js";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Sora:wght@400;600;700&display=swap');

  html, body { 
    overflow-x: hidden; 
    width: 100%;
    margin: 0;
    padding: 0;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .ev-root {
    width: 100vw;
    margin-left: calc(50% - 50vw);
    min-height: 100vh;
    background: #0A0F1E;
    display: flex;
    font-family: 'DM Sans', sans-serif;
    color: #fff;
    position: relative;
    overflow: hidden;
  }

  /* ─── Background decorations ─── */
  .ev-grid {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(99,179,237,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,179,237,0.04) 1px, transparent 1px);
    background-size: 48px 48px;
  }
  .ev-glow {
    position: absolute; border-radius: 50%; pointer-events: none;
    background: radial-gradient(circle, rgba(56,122,255,0.10) 0%, transparent 70%);
    width: 600px; height: 600px; top: -150px; left: -150px;
  }
  .ev-glow2 {
    position: absolute; border-radius: 50%; pointer-events: none;
    background: radial-gradient(circle, rgba(99,240,198,0.07) 0%, transparent 70%);
    width: 400px; height: 400px; bottom: -100px; right: -80px;
  }

  /* ─── Left panel ─── */
  .ev-left {
    width: 420px; min-height: 100vh;
    padding: 3rem;
    display: flex; flex-direction: column; justify-content: center;
    position: relative; z-index: 2;
    border-right: 1px solid rgba(255,255,255,0.06);
  }
  .ev-brand {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 3rem;
  }
  .ev-brand-icon {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, #387AFF, #63F0C6);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }
  .ev-brand-name {
    font-family: 'Sora', sans-serif;
    font-size: 22px; font-weight: 700; letter-spacing: -0.5px;
    background: linear-gradient(135deg, #fff 40%, #63F0C6);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .ev-tagline h2 {
    font-family: 'Sora', sans-serif;
    font-size: 28px; font-weight: 700; line-height: 1.25;
    letter-spacing: -0.5px; margin-bottom: 1rem; color: #fff;
  }
  .ev-tagline p {
    font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.65;
  }

  /* Credential hint cards */
  .ev-hints {
    margin-top: 2.5rem;
    display: flex; flex-direction: column; gap: 10px;
  }
  .ev-hints-label {
    font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px;
    color: rgba(255,255,255,0.25); margin-bottom: 4px;
  }
  .ev-hint-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px; padding: 10px 14px;
    display: flex; align-items: center; gap: 12px;
    cursor: pointer; transition: border-color 0.2s, background 0.2s;
  }
  .ev-hint-card:hover {
    border-color: rgba(56,122,255,0.35);
    background: rgba(56,122,255,0.05);
  }
  .ev-hint-avatar {
    width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; flex-shrink: 0;
  }
  .ev-hint-info { flex: 1; min-width: 0; }
  .ev-hint-name { font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.7); }
  .ev-hint-email { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ev-hint-role {
    font-size: 10px; padding: 2px 8px; border-radius: 20px;
    font-weight: 500; flex-shrink: 0;
  }

  /* ─── Right panel ─── */
  .ev-right {
    flex: 1;
    display: flex; align-items: center; justify-content: center;
    padding: 3rem 2rem;
    position: relative; z-index: 2;
  }
  .ev-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px; padding: 2.5rem;
    width: 100%; max-width: 420px;
  }

  /* ─── Card header ─── */
  .ev-card-header { margin-bottom: 2rem; }
  .ev-card-header h1 {
    font-family: 'Sora', sans-serif;
    font-size: 22px; font-weight: 700; color: #fff;
    margin-bottom: 6px; margin-top: 0;
  }
  .ev-card-header p { font-size: 13px; color: rgba(255,255,255,0.4); margin: 0; }

  /* ─── Fields ─── */
  .ev-field { margin-bottom: 1rem; }
  .ev-label {
    display: block; font-size: 12px; font-weight: 500;
    color: rgba(255,255,255,0.5); margin-bottom: 6px;
    letter-spacing: 0.3px; text-transform: uppercase;
  }
  .ev-input-wrap { position: relative; }
  .ev-input-icon {
    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
    color: rgba(255,255,255,0.25); font-size: 16px; pointer-events: none;
  }
  .ev-input {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 10px; color: #fff;
    font-size: 14px; font-family: 'DM Sans', sans-serif;
    padding: 11px 36px 11px 38px;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
  }
  .ev-input::placeholder { color: rgba(255,255,255,0.2); }
  .ev-input:focus {
    border-color: rgba(56,122,255,0.5);
    background: rgba(56,122,255,0.05);
  }
  .ev-input.error {
    border-color: rgba(226,75,74,0.6);
    background: rgba(226,75,74,0.05);
  }
  .ev-input.success {
    border-color: rgba(99,240,198,0.4);
    background: rgba(99,240,198,0.04);
  }
  .ev-pwd-toggle {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none;
    color: rgba(255,255,255,0.3); cursor: pointer;
    font-size: 16px; padding: 0; display: flex; align-items: center; z-index: 1;
  }

  /* ─── Error alert ─── */
  .ev-alert {
    background: rgba(226,75,74,0.08);
    border: 1px solid rgba(226,75,74,0.25);
    border-radius: 10px; padding: 12px 14px;
    display: flex; align-items: flex-start; gap: 10px;
    margin-bottom: 1.25rem;
    animation: slideIn 0.3s ease;
  }
  .ev-alert-icon { font-size: 17px; color: #F09595; margin-top: 1px; flex-shrink: 0; }
  .ev-alert-body { flex: 1; }
  .ev-alert-title { font-size: 13px; font-weight: 600; color: #F09595; }
  .ev-alert-sub { font-size: 12px; color: rgba(240,149,149,0.7); margin-top: 2px; }
  .ev-alert-close {
    background: none; border: none; color: rgba(240,149,149,0.5);
    cursor: pointer; font-size: 16px; padding: 0; display: flex; align-items: center;
    flex-shrink: 0;
  }
  .ev-alert-close:hover { color: #F09595; }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ─── Forgot password link ─── */
  .ev-forgot {
    text-align: right; margin-bottom: 1.25rem; margin-top: -4px;
  }
  .ev-forgot a { font-size: 12px; color: #63B3ED; text-decoration: none; }
  .ev-forgot a:hover { color: #63F0C6; }

  /* ─── Submit button ─── */
  .ev-btn {
    width: 100%; padding: 13px;
    background: linear-gradient(135deg, #387AFF, #2A5DC5);
    border: none; border-radius: 10px;
    color: #fff; font-size: 14px; font-weight: 600;
    font-family: 'Sora', sans-serif; cursor: pointer;
    transition: opacity 0.2s, transform 0.1s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .ev-btn:hover:not(:disabled) { opacity: 0.9; }
  .ev-btn:active:not(:disabled) { transform: scale(0.98); }
  .ev-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .ev-btn.success-btn { background: linear-gradient(135deg, #1D9E75, #0F6E56); }

  /* ─── Divider ─── */
  .ev-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 1.25rem 0;
  }
  .ev-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
  .ev-divider-text { font-size: 11px; color: rgba(255,255,255,0.25); }

  /* ─── Register link ─── */
  .ev-register {
    text-align: center; font-size: 13px; color: rgba(255,255,255,0.35);
    margin-top: 1.25rem;
  }
  .ev-register a { color: #63B3ED; text-decoration: none; font-weight: 500; }

  /* ─── Success state ─── */
  .ev-success-screen {
    display: flex; flex-direction: column; align-items: center;
    padding: 1rem 0 0.5rem; text-align: center;
    animation: fadeUp 0.5s ease;
  }
  .ev-success-icon {
    width: 64px; height: 64px; border-radius: 50%;
    background: rgba(99,240,198,0.1);
    border: 1px solid rgba(99,240,198,0.25);
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; margin-bottom: 1.25rem;
  }
  .ev-success-screen h2 {
    font-family: 'Sora', sans-serif;
    font-size: 20px; font-weight: 700; color: #fff;
    margin-bottom: 6px;
  }
  .ev-success-screen p { font-size: 13px; color: rgba(255,255,255,0.45); margin-bottom: 1.5rem; }
  .ev-role-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 16px; border-radius: 20px;
    font-size: 12px; font-weight: 600; margin-bottom: 2rem;
  }
  .ev-progress-bar {
    width: 100%; height: 3px;
    background: rgba(255,255,255,0.07);
    border-radius: 3px; overflow: hidden;
  }
  .ev-progress-fill {
    height: 100%; border-radius: 3px;
    background: linear-gradient(90deg, #387AFF, #63F0C6);
    animation: fillBar 2s linear forwards;
  }
  @keyframes fillBar { from { width: 0%; } to { width: 100%; } }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ─── Spinner ─── */
  .ev-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff; border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ─── Toast ─── */
  .ev-toast {
    position: fixed; top: 20px; left: 50%;
    transform: translateX(-50%) translateY(-100px);
    background: #0A0F1E;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px; padding: 12px 20px;
    display: flex; align-items: center; gap: 10px;
    font-size: 13px; font-family: 'DM Sans', sans-serif;
    z-index: 200;
    transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
    min-width: 260px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.5);
  }
  .ev-toast.show { transform: translateX(-50%) translateY(0); }
  .ev-toast.success { border-color: rgba(99,240,198,0.3); }
  .ev-toast.error   { border-color: rgba(226,75,74,0.3); }
  .ev-toast-text { color: #fff; line-height: 1.4; }
  .ev-toast-text small { display: block; color: rgba(255,255,255,0.4); font-size: 11px; margin-top: 2px; }

  /* ─── Shake animation for wrong password ─── */
  .ev-card.shake {
    animation: shake 0.45s cubic-bezier(.36,.07,.19,.97) both;
  }
  @keyframes shake {
    10%, 90% { transform: translateX(-2px); }
    20%, 80% { transform: translateX(4px); }
    30%, 50%, 70% { transform: translateX(-6px); }
    40%, 60% { transform: translateX(6px); }
  }

  .ev-mobile-brand { display: none; }

  /* ── Tablet (≤1024px) ── */
  @media (max-width: 1024px) {
    .ev-left { width: 320px; padding: 2rem; }
    .ev-tagline h2 { font-size: 22px; }
    .ev-hints { margin-top: 2rem; }
  }

  /* ── Mobile (≤768px): fondo full-screen, card centrado ── */
  @media (max-width: 768px) {
    .ev-root {
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1.5rem 1rem;
    }
    .ev-left { display: none; }
    .ev-right {
      width: 100%;
      flex: unset;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }
    .ev-card {
      width: 100%;
      max-width: 420px;
      padding: 2rem 1.5rem;
      border-radius: 18px;
    }
    .ev-mobile-brand {
      display: flex !important;
      align-items: center;
      gap: 10px;
      justify-content: center;
      margin-bottom: 1.75rem;
    }
    .ev-toast {
      min-width: unset;
      width: calc(100% - 2rem);
      left: 1rem;
      transform: translateX(0) translateY(-100px);
    }
    .ev-toast.show { transform: translateX(0) translateY(0); }
  }

  /* ── Small mobile (≤400px) ── */
  @media (max-width: 400px) {
    .ev-root { padding: 1rem 0.75rem; }
    .ev-card { padding: 1.5rem 1.25rem; border-radius: 16px; }
    .ev-card-header h1 { font-size: 19px; }
    .ev-btn { font-size: 13px; }
  }
`;

const ROLE_META = {
  estudiante: { label: "Estudiante",  color: "#387AFF", bg: "rgba(56,122,255,0.12)",  icon: "ti-school",      avatarBg: "rgba(56,122,255,0.15)"  },
  docente:    { label: "Docente",     color: "#63F0C6", bg: "rgba(99,240,198,0.12)",  icon: "ti-chalkboard",  avatarBg: "rgba(99,240,198,0.15)"  },
};

function Toast({ show, type, title, subtitle }) {
  return (
    <div className={`ev-toast ${type} ${show ? "show" : ""}`}>
      <span style={{ fontSize: 20 }}>
        {type === "success"
          ? <i className="ti ti-circle-check" style={{ color: "#63F0C6" }} />
          : <i className="ti ti-alert-circle" style={{ color: "#F09595" }} />}
      </span>
      <div className="ev-toast-text">
        {title}
        {subtitle && <small>{subtitle}</small>}
      </div>
    </div>
  );
}

function ErrorAlert({ message, sub, onClose }) {
  return (
    <div className="ev-alert">
      <i className="ti ti-shield-x ev-alert-icon" />
      <div className="ev-alert-body">
        <div className="ev-alert-title">{message}</div>
        {sub && <div className="ev-alert-sub">{sub}</div>}
      </div>
      <button className="ev-alert-close" onClick={onClose} aria-label="Cerrar">
        <i className="ti ti-x" />
      </button>
    </div>
  );
}

function SuccessScreen({ user }) {
  const meta = ROLE_META[user.role] || ROLE_META.estudiante;
  return (
    <div className="ev-success-screen">
      <div className="ev-success-icon">
        <i className={`ti ${meta.icon}`} style={{ color: meta.color }} />
      </div>
      <h2>¡Bienvenido, {user.nombre}!</h2>
      <p>Autenticación exitosa. Redirigiendo a tu panel...</p>
      <div className="ev-role-badge" style={{ background: meta.bg, color: meta.color }}>
        <i className={`ti ${meta.icon}`} style={{ fontSize: 13 }} />
        {meta.label}
      </div>
      <div className="ev-progress-bar">
        <div className="ev-progress-fill" />
      </div>
    </div>
  );
}

export default function EduVerifyLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPwd, setShowPwd]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [authError, setAuthError] = useState(null);
  const [attempts, setAttempts]   = useState(0);
  const [loggedUser, setLoggedUser] = useState(null);
  const [shake, setShake]         = useState(false);
  const [toast, setToast]         = useState({ show: false, type: "", title: "", subtitle: "" });
  const cardRef = useRef(null);

  const showToast = (type, title, subtitle = "") => {
    setToast({ show: true, type, title, subtitle });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  useEffect(() => {
    if (!loggedUser) return;
    const routeByRole = {
      estudiante: "/student",
      docente: "/teacher",
    };
    const t = setTimeout(() => navigate(routeByRole[loggedUser.role] || "/student"), 1900);
    return () => clearTimeout(t);
  }, [loggedUser, navigate]);

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    setAuthError(null);

    try {
      const user = await apiLogin(email, password);
      setLoggedUser(user); // estado local: dispara la pantalla de éxito de esta página
      login(user); // AuthContext: el resto de la app (topbars, dashboards) ya sabe quién entró
      showToast("success", "Acceso autorizado", `Bienvenido, ${user.email}`);
    } catch (err) {
      const next = attempts + 1;
      setAttempts(next);
      triggerShake();
      if (next >= 3) {
        setAuthError({
          title: "Demasiados intentos fallidos",
          sub: "Tu cuenta será bloqueada temporalmente. Revisa tus credenciales o recupera tu contraseña."
        });
      } else {
        setAuthError({
          title: "Credenciales incorrectas",
          sub: `${err.message}. Intento ${next} de 3.`
        });
      }
      showToast("error", "Autenticación fallida", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSubmit(); };

  const canSubmit = email.length > 0 && password.length > 0 && !loading;

  return (
    <>
      <style>{styles}</style>

      <div className="ev-root">
        <div className="ev-grid" />
        <div className="ev-glow" />
        <div className="ev-glow2" />

        {/* ── Panel izquierdo ── */}
        <div className="ev-left">
          <div className="ev-brand">
            <div className="ev-brand-icon">🎓</div>
            <span className="ev-brand-name">EduVerify</span>
          </div>

          <div className="ev-tagline">
            <h2>Accede a tu espacio de evaluación</h2>
            <p>Inicia sesión para continuar con tus exámenes o gestionar tus cursos con supervisión IA en tiempo real.</p>
          </div>

        </div>

        {/* ── Panel derecho ── */}
        <div className="ev-right">
          <div className={`ev-card${shake ? " shake" : ""}`} ref={cardRef}>

            {loggedUser ? (
              <SuccessScreen user={loggedUser} />
            ) : (
              <>
                <div className="ev-mobile-brand">
                  <div className="ev-brand-icon">🎓</div>
                  <span className="ev-brand-name">EduVerify</span>
                </div>
                <div className="ev-card-header">
                  <h1>Iniciar sesión</h1>
                  <p>Ingresa tus credenciales para acceder al sistema</p>
                </div>

                {authError && (
                  <ErrorAlert
                    message={authError.title}
                    sub={authError.sub}
                    onClose={() => setAuthError(null)}
                  />
                )}

                {/* Email */}
                <div className="ev-field">
                  <label className="ev-label">Correo electrónico</label>
                  <div className="ev-input-wrap">
                    <i className="ti ti-mail ev-input-icon" aria-hidden="true" />
                    <input
                      className={`ev-input${authError ? " error" : ""}`}
                      type="email"
                      placeholder="correo@universidad.edu"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setAuthError(null); }}
                      onKeyDown={handleKeyDown}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="ev-field">
                  <label className="ev-label">Contraseña</label>
                  <div className="ev-input-wrap">
                    <i className="ti ti-lock ev-input-icon" aria-hidden="true" />
                    <input
                      className={`ev-input${authError ? " error" : ""}`}
                      type={showPwd ? "text" : "password"}
                      placeholder="Tu contraseña"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setAuthError(null); }}
                      onKeyDown={handleKeyDown}
                      autoComplete="current-password"
                    />
                    <button
                      className="ev-pwd-toggle"
                      onClick={() => setShowPwd(v => !v)}
                      type="button"
                      aria-label="Mostrar contraseña"
                    >
                      <i className={`ti ti-eye${showPwd ? "-off" : ""}`} />
                    </button>
                  </div>
                </div>

                <div className="ev-forgot">
                  <a href="#">¿Olvidaste tu contraseña?</a>
                </div>

                <button
                  className="ev-btn"
                  disabled={!canSubmit}
                  onClick={handleSubmit}
                >
                  {loading
                    ? <><div className="ev-spinner" /> Verificando...</>
                    : <><i className="ti ti-login" aria-hidden="true" /> Ingresar</>}
                </button>

                <div className="ev-divider">
                  <div className="ev-divider-line" />
                  <span className="ev-divider-text">¿No tienes cuenta?</span>
                  <div className="ev-divider-line" />
                </div>

                <p className="ev-register">
                  <button 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#63B3ED', textDecoration: 'none', fontWeight: '500' }}
                    onClick={() => navigate('/register')}
                  >
                    Crear cuenta nueva en EduVerify
                  </button>
                </p>
              </>
            )}
          </div>
        </div>

        <Toast {...toast} />
      </div>
    </>
  );
}
