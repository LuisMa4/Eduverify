import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MOCK_EMAILS = ["admin@eduverify.com", "test@test.com", "docente@uni.edu"];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Sora:wght@400;600;700&display=swap');

  .ev-root {
    min-height: 100vh;
    background: #0A0F1E;
    display: flex;
    font-family: 'DM Sans', sans-serif;
    color: #fff;
    position: relative;
    overflow: hidden;
  }
  .ev-bg-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(99,179,237,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,179,237,0.04) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
  }
  .ev-bg-glow {
    position: absolute;
    width: 600px; height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(56,122,255,0.10) 0%, transparent 70%);
    top: -150px; left: -150px;
    pointer-events: none;
  }
  .ev-bg-glow2 {
    position: absolute;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,240,198,0.07) 0%, transparent 70%);
    bottom: -100px; right: -80px;
    pointer-events: none;
  }
  .ev-left {
    width: 420px;
    min-height: 100vh;
    padding: 3rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    z-index: 2;
    border-right: 1px solid rgba(255,255,255,0.06);
  }
  .ev-brand {
    display: flex;
    align-items: center;
    gap: 10px;
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
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.5px;
    background: linear-gradient(135deg, #fff 40%, #63F0C6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .ev-tagline h2 {
    font-family: 'Sora', sans-serif;
    font-size: 28px;
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: -0.5px;
    margin-bottom: 1rem;
    color: #fff;
  }
  .ev-tagline p {
    font-size: 14px;
    color: rgba(255,255,255,0.5);
    line-height: 1.65;
  }
  .ev-features {
    margin-top: 3rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .ev-feat {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  .ev-feat-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #63F0C6;
    margin-top: 5px;
    flex-shrink: 0;
  }
  .ev-feat-text {
    font-size: 13px;
    color: rgba(255,255,255,0.45);
    line-height: 1.5;
  }
  .ev-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    position: relative;
    z-index: 2;
  }
  .ev-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    padding: 2.5rem;
    width: 100%;
    max-width: 440px;
  }
  .ev-card-header { margin-bottom: 2rem; }
  .ev-card-header h1 {
    font-family: 'Sora', sans-serif;
    font-size: 22px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 6px;
    margin-top: 0;
  }
  .ev-card-header p {
    font-size: 13px;
    color: rgba(255,255,255,0.4);
    margin: 0;
  }
  .ev-step-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 1.5rem;
  }
  .ev-step-dot {
    height: 6px;
    border-radius: 3px;
    background: rgba(255,255,255,0.15);
    transition: all 0.3s;
  }
  .ev-tabs {
    display: flex;
    background: rgba(255,255,255,0.05);
    border-radius: 10px;
    padding: 3px;
    margin-bottom: 2rem;
    gap: 2px;
  }
  .ev-tab {
    flex: 1;
    padding: 8px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: rgba(255,255,255,0.4);
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .ev-tab.active {
    background: rgba(56,122,255,0.20);
    color: #63B3ED;
    border: 1px solid rgba(56,122,255,0.30);
  }
  .ev-field { margin-bottom: 1rem; }
  .ev-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: rgba(255,255,255,0.5);
    margin-bottom: 6px;
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }
  .ev-input-wrap { position: relative; }
  .ev-input-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255,255,255,0.25);
    font-size: 16px;
    pointer-events: none;
  }
  .ev-input {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 10px;
    color: #fff;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    padding: 11px 36px 11px 38px;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    box-sizing: border-box;
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
  .ev-input-status {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 15px;
    display: flex;
    align-items: center;
  }
  .ev-error-msg {
    font-size: 11px;
    color: #F09595;
    margin-top: 5px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .ev-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .ev-pwd-toggle {
    position: absolute;
    right: 12px;
    top: 50%; transform: translateY(-50%);
    background: none; border: none;
    color: rgba(255,255,255,0.3);
    cursor: pointer;
    font-size: 16px;
    padding: 0;
    line-height: 1;
    z-index: 1;
    display: flex;
    align-items: center;
  }
  .ev-terms {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin: 1.25rem 0;
    cursor: pointer;
  }
  .ev-checkbox {
    width: 17px; height: 17px;
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 5px;
    background: rgba(255,255,255,0.05);
    flex-shrink: 0;
    margin-top: 1px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
    cursor: pointer;
    font-size: 11px;
  }
  .ev-checkbox.checked {
    background: #387AFF;
    border-color: #387AFF;
    color: white;
  }
  .ev-terms-text {
    font-size: 12px;
    color: rgba(255,255,255,0.4);
    line-height: 1.5;
  }
  .ev-terms-text a { color: #63F0C6; text-decoration: none; }
  .ev-btn {
    width: 100%;
    padding: 13px;
    background: linear-gradient(135deg, #387AFF, #2A5DC5);
    border: none;
    border-radius: 10px;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Sora', sans-serif;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.1s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .ev-btn:hover:not(:disabled) { opacity: 0.9; }
  .ev-btn:active:not(:disabled) { transform: scale(0.98); }
  .ev-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .ev-btn.success-btn { background: linear-gradient(135deg, #1D9E75, #0F6E56); }
  .ev-signin {
    text-align: center;
    margin-top: 1.25rem;
    font-size: 13px;
    color: rgba(255,255,255,0.35);
  }
  .ev-signin a { color: #63B3ED; text-decoration: none; font-weight: 500; }
  .ev-strength {
    display: flex;
    gap: 4px;
    margin-top: 6px;
    align-items: center;
  }
  .ev-strength-bar {
    flex: 1;
    height: 3px;
    border-radius: 3px;
    background: rgba(255,255,255,0.08);
    transition: background 0.3s;
  }
  .ev-strength-label {
    font-size: 11px;
    width: 50px;
    text-align: right;
  }
  .ev-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .ev-toast {
    position: fixed;
    top: 20px; left: 50%;
    transform: translateX(-50%) translateY(-80px);
    background: #0A0F1E;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 12px 20px;
    display: flex; align-items: center; gap: 10px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    z-index: 100;
    transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
    min-width: 280px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.4);
  }
  .ev-toast.show { transform: translateX(-50%) translateY(0); }
  .ev-toast.success { border-color: rgba(99,240,198,0.3); }
  .ev-toast.error { border-color: rgba(226,75,74,0.3); }
  .ev-toast-text { color: #fff; line-height: 1.4; }
  .ev-toast-text small { display: block; color: rgba(255,255,255,0.4); font-size: 11px; margin-top: 2px; }

  /* ── Tablet (≤1024px): panel izquierdo más angosto ── */
  @media (max-width: 1024px) {
    .ev-left {
      width: 340px;
      padding: 2rem;
    }
    .ev-tagline h2 { font-size: 22px; }
    .ev-features { margin-top: 2rem; }
  }

  /* ── Mobile (≤768px): layout vertical, panel izquierdo colapsado ── */
  @media (max-width: 768px) {
    .ev-root {
      flex-direction: column;
      overflow-x: hidden;
    }
    .ev-left {
      width: 100%;
      min-height: unset;
      padding: 1.5rem 1.25rem 1.25rem;
      border-right: none;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .ev-brand { margin-bottom: 0; }
    .ev-tagline { display: none; }
    .ev-features { display: none; }
    .ev-right {
      padding: 1.5rem 1rem 2rem;
      align-items: flex-start;
    }
    .ev-card {
      padding: 1.5rem 1.25rem;
      border-radius: 16px;
      max-width: 100%;
    }
    .ev-row {
      grid-template-columns: 1fr;
    }
    .ev-toast {
      min-width: unset;
      width: calc(100% - 2rem);
      left: 1rem;
      transform: translateX(0) translateY(-80px);
    }
    .ev-toast.show {
      transform: translateX(0) translateY(0);
    }
  }

  /* ── Small mobile (≤400px) ── */
  @media (max-width: 400px) {
    .ev-card { padding: 1.25rem 1rem; }
    .ev-card-header h1 { font-size: 19px; }
    .ev-btn { font-size: 13px; }
  }
`;

function StrengthBar({ password }) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const colors = ["", "#E24B4A", "#EF9F27", "#387AFF", "#63F0C6"];
  const labels = ["", "Débil", "Regular", "Buena", "Fuerte"];
  const color = password.length > 0 ? colors[score] : "rgba(255,255,255,0.08)";

  return (
    <div className="ev-strength">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="ev-strength-bar"
          style={{ background: i <= score ? color : "rgba(255,255,255,0.08)" }}
        />
      ))}
      <span className="ev-strength-label" style={{ color: color }}>
        {password.length > 0 ? labels[score] : ""}
      </span>
    </div>
  );
}

function FieldInput({ label, id, type = "text", placeholder, value, onChange, onBlur, status, errorMsg, icon, rightSlot }) {
  return (
    <div className="ev-field">
      <label className="ev-label">{label}</label>
      <div className="ev-input-wrap">
        <i className={`ti ti-${icon} ev-input-icon`} aria-hidden="true" />
        <input
          id={id}
          className={`ev-input${status === "error" ? " error" : status === "success" ? " success" : ""}`}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
        />
        {rightSlot && <span className="ev-input-status">{rightSlot}</span>}
        {!rightSlot && status && (
          <span className="ev-input-status">
            {status === "success" && <i className="ti ti-check" style={{ color: "#63F0C6", fontSize: 15 }} />}
            {status === "error" && <i className="ti ti-x" style={{ color: "#F09595", fontSize: 15 }} />}
          </span>
        )}
      </div>
      {status === "error" && errorMsg && (
        <div className="ev-error-msg">
          <i className="ti ti-alert-circle" style={{ fontSize: 13 }} />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}

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

export default function EduVerifyRegister() {
  const navigate = useNavigate();
  const [role, setRole] = useState("estudiante");
  const [fields, setFields] = useState({
    nombre: "", apellido: "", email: "", institucion: "", pwd: "", pwd2: ""
  });
  const [statuses, setStatuses] = useState({});
  const [errors, setErrors] = useState({});
  const [terms, setTerms] = useState(false);
  const [showPwd, setShowPwd] = useState({ pwd: false, pwd2: false });
  const [emailChecking, setEmailChecking] = useState(false);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "", title: "", subtitle: "" });

  const rules = {
    nombre: { test: v => v.trim().length >= 2, msg: "Ingresa tu nombre (mínimo 2 caracteres)" },
    apellido: { test: v => v.trim().length >= 2, msg: "Ingresa tu apellido (mínimo 2 caracteres)" },
    email: { test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: "Ingresa un correo válido" },
    institucion: { test: v => v.trim().length >= 3, msg: "Ingresa el nombre de tu institución" },
    pwd: { test: v => v.length >= 8, msg: "La contraseña debe tener al menos 8 caracteres" },
    pwd2: { test: v => v === fields.pwd && v.length > 0, msg: "Las contraseñas no coinciden" },
  };

  const validate = (name, value) => {
    if (!value) {
      setStatuses(s => ({ ...s, [name]: null }));
      setErrors(e => ({ ...e, [name]: null }));
      return;
    }
    const rule = name === "pwd2"
      ? { test: v => v === fields.pwd && v.length > 0, msg: "Las contraseñas no coinciden" }
      : rules[name];
    const ok = rule.test(value);
    setStatuses(s => ({ ...s, [name]: ok ? "success" : "error" }));
    setErrors(e => ({ ...e, [name]: ok ? null : rule.msg }));
  };

  const handleChange = (name, value) => {
    setFields(f => ({ ...f, [name]: value }));
    validate(name, value);
  };

  const checkEmail = () => {
    const val = fields.email;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return;
    setEmailChecking(true);
    setTimeout(() => {
      setEmailChecking(false);
      if (MOCK_EMAILS.includes(val.toLowerCase())) {
        setStatuses(s => ({ ...s, email: "error" }));
        setErrors(e => ({ ...e, email: "Este correo ya se encuentra registrado" }));
        showToast("error", "Correo ya registrado", "Intenta con otro correo o inicia sesión");
      }
    }, 900);
  };

  const showToast = (type, title, subtitle) => {
    setToast({ show: true, type, title, subtitle });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  };

  const allValid = Object.keys(rules).every(k => statuses[k] === "success") && terms;

  const handleSubmit = () => {
    if (!allValid) return;
    setStep(1);
    setTimeout(() => {
      setStep(2);
      setSubmitted(true);
      showToast("success", "¡Registro exitoso!", "Ya puedes iniciar sesión en EduVerify");
    }, 1800);
  };

  const stepDot = (i) => {
    const isActive = step === i;
    const isDone = step > i;
    return (
      <div
        key={i}
        className="ev-step-dot"
        style={{
          width: isActive ? 18 : 6,
          background: isDone ? "#63F0C6" : isActive ? "#387AFF" : "rgba(255,255,255,0.15)"
        }}
      />
    );
  };

  return (
    <>
      <style>{styles}</style>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />

      <div className="ev-root">
        <div className="ev-bg-grid" />
        <div className="ev-bg-glow" />
        <div className="ev-bg-glow2" />

        <div className="ev-left">
          <div className="ev-brand">
            <div className="ev-brand-icon">🎓</div>
            <span className="ev-brand-name">EduVerify</span>
          </div>
          <div className="ev-tagline">
            <h2>Exámenes virtuales con integridad real</h2>
            <p>Plataforma de evaluación impulsada por IA, con detección de plagio en tiempo real a través de cámara y micrófono.</p>
          </div>
          <div className="ev-features">
            {[
              "Detección de plagio en tiempo real con visión por computadora",
              "Análisis de audio para detectar comunicación no autorizada",
              "Reportes automáticos para docentes con evidencia verificable",
              "Panel adaptado por rol: estudiante o docente"
            ].map((f, i) => (
              <div key={i} className="ev-feat">
                <div className="ev-feat-dot" />
                <span className="ev-feat-text">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ev-right">
          <div className="ev-card">
            <div className="ev-step-indicator">{[0, 1, 2].map(stepDot)}</div>

            <div className="ev-card-header">
              <h1>Crear cuenta</h1>
              <p>Completa tu información para acceder a EduVerify</p>
            </div>

            <div className="ev-tabs">
              {["estudiante", "docente"].map(r => (
                <button
                  key={r}
                  className={`ev-tab${role === r ? " active" : ""}`}
                  onClick={() => setRole(r)}
                >
                  <i className={`ti ti-${r === "estudiante" ? "school" : "chalkboard"}`} aria-hidden="true" />
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>

            <div className="ev-row">
              <FieldInput label="Nombre" id="f-nombre" placeholder="Ana" value={fields.nombre} icon="user"
                status={statuses.nombre} errorMsg={errors.nombre}
                onChange={e => handleChange("nombre", e.target.value)} />
              <FieldInput label="Apellido" id="f-apellido" placeholder="García" value={fields.apellido} icon="user"
                status={statuses.apellido} errorMsg={errors.apellido}
                onChange={e => handleChange("apellido", e.target.value)} />
            </div>

            <FieldInput
              label="Correo electrónico" id="f-email" type="email"
              placeholder="ana@universidad.edu" value={fields.email} icon="mail"
              status={emailChecking ? null : statuses.email}
              errorMsg={errors.email}
              onChange={e => handleChange("email", e.target.value)}
              onBlur={checkEmail}
              rightSlot={emailChecking ? <div className="ev-spinner" /> : undefined}
            />

            <FieldInput
              label={role === "docente" ? "Institución donde enseña" : "Institución educativa"}
              id="f-inst" placeholder="Universidad Nacional" value={fields.institucion} icon="building"
              status={statuses.institucion} errorMsg={errors.institucion}
              onChange={e => handleChange("institucion", e.target.value)}
            />

            <div className="ev-field">
              <label className="ev-label">Contraseña</label>
              <div className="ev-input-wrap">
                <i className="ti ti-lock ev-input-icon" aria-hidden="true" />
                <input
                  className={`ev-input${statuses.pwd === "error" ? " error" : statuses.pwd === "success" ? " success" : ""}`}
                  type={showPwd.pwd ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  value={fields.pwd}
                  onChange={e => handleChange("pwd", e.target.value)}
                />
                <button className="ev-pwd-toggle" onClick={() => setShowPwd(s => ({ ...s, pwd: !s.pwd }))} type="button" aria-label="Mostrar contraseña">
                  <i className={`ti ti-eye${showPwd.pwd ? "-off" : ""}`} />
                </button>
              </div>
              <StrengthBar password={fields.pwd} />
              {statuses.pwd === "error" && <div className="ev-error-msg"><i className="ti ti-alert-circle" style={{ fontSize: 13 }} /><span>{errors.pwd}</span></div>}
            </div>

            <div className="ev-field">
              <label className="ev-label">Confirmar contraseña</label>
              <div className="ev-input-wrap">
                <i className="ti ti-lock-check ev-input-icon" aria-hidden="true" />
                <input
                  className={`ev-input${statuses.pwd2 === "error" ? " error" : statuses.pwd2 === "success" ? " success" : ""}`}
                  type={showPwd.pwd2 ? "text" : "password"}
                  placeholder="Repite tu contraseña"
                  value={fields.pwd2}
                  onChange={e => handleChange("pwd2", e.target.value)}
                />
                <button className="ev-pwd-toggle" onClick={() => setShowPwd(s => ({ ...s, pwd2: !s.pwd2 }))} type="button" aria-label="Mostrar contraseña">
                  <i className={`ti ti-eye${showPwd.pwd2 ? "-off" : ""}`} />
                </button>
              </div>
              {statuses.pwd2 === "error" && <div className="ev-error-msg"><i className="ti ti-alert-circle" style={{ fontSize: 13 }} /><span>{errors.pwd2}</span></div>}
            </div>

            <div className="ev-terms" onClick={() => setTerms(t => !t)}>
              <div className={`ev-checkbox${terms ? " checked" : ""}`}>
                {terms && <i className="ti ti-check" style={{ fontSize: 11 }} />}
              </div>
              <span className="ev-terms-text">
                Acepto los <a href="#">términos y condiciones</a> y la <a href="#">política de privacidad</a>, incluyendo el uso de cámara y micrófono durante evaluaciones.
              </span>
            </div>

            <button
              className={`ev-btn${submitted ? " success-btn" : ""}`}
              disabled={!allValid || step === 1}
              onClick={handleSubmit}
            >
              {step === 1
                ? <><div className="ev-spinner" /> Registrando...</>
                : submitted
                  ? <><i className="ti ti-check" aria-hidden="true" /> ¡Cuenta creada exitosamente!</>
                  : <><i className="ti ti-user-plus" aria-hidden="true" /> Crear cuenta</>}
            </button>

            <p className="ev-signin">
              ¿Ya tienes cuenta? 
              <button 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#63B3ED', textDecoration: 'none', fontWeight: '500', marginLeft: '4px' }}
                onClick={() => navigate('/')}
              >
                Inicia sesión
              </button>
            </p>
          </div>
        </div>

        <Toast {...toast} />
      </div>
    </>
  );
}