import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useExams } from "../../hooks/useExams.js";

const CURSOS = ["Matemática I", "Matemática II", "Programación III", "Bases de Datos", "Física I", "Inglés Técnico"];

// Código de acceso único para el examen nuevo — sin esto, el examen se crea
// pero ningún estudiante podría entrar (access_exam_student.jsx exige
// exam.codigoAcceso). Se excluyen caracteres ambiguos (0/O, 1/I) a mano.
function generarCodigoAcceso() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `EV-${code}`;
}

const TIPOS = [
  { id: "parcial", label: "Parcial", icon: "ti-book" },
  { id: "final", label: "Final", icon: "ti-target-arrow" },
  { id: "quiz", label: "Quiz", icon: "ti-bolt" },
  { id: "practica", label: "Práctica", icon: "ti-pencil" },
];

function toMinutes(hora) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

export default function EduverifyCreateExam() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // `exams` es la lista real y creciente del contexto (ya no una lista
  // congelada de ejemplo), así que la validación de nombre duplicado y
  // choque de horario de más abajo compara contra los exámenes de verdad.
  const { exams, addExam } = useExams();
  const [step, setStep] = useState(0); // 0: datos básicos, 1: programación, 2: confirmación
  const [form, setForm] = useState({
    nombre: "",
    curso: "",
    tipo: "",
    duracion: 60,
    instrucciones: "",
    fecha: "",
    hora: "",
    intentos: 1,
    camara: true,
    pantallaCompleta: true,
  });
  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [codigoAcceso, setCodigoAcceso] = useState("");
  const [submitError, setSubmitError] = useState("");

  const setField = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const doShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 550);
  };

  // Escenario: Campos incompletos
  const validateStep0 = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "El nombre del examen es requerido";
    // Escenario: Nombre de examen duplicado
    else if (exams.some((ex) => ex.nombre.toLowerCase() === form.nombre.trim().toLowerCase()))
      e.nombre = "Ya existe un examen con ese nombre";
    if (!form.curso) e.curso = "Selecciona un curso";
    if (!form.tipo) e.tipo = "Selecciona el tipo de examen";
    if (!form.duracion || form.duracion <= 0) e.duracion = "Duración inválida";
    return e;
  };

  // Escenario: Fecha inválida (pasada) y Cruce de horarios
  const validateStep1 = () => {
    const e = {};
    if (!form.fecha) e.fecha = "Selecciona una fecha";
    else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(form.fecha + "T00:00:00");
      if (selected < today) e.fecha = "No puedes programar un examen en una fecha pasada";
    }
    if (!form.hora) e.hora = "Selecciona una hora";

    if (!e.fecha && !e.hora) {
      const newStart = toMinutes(form.hora);
      const newEnd = newStart + Number(form.duracion);
      const conflict = exams.find((ex) => {
        if (ex.fecha !== form.fecha) return false;
        const exStart = toMinutes(ex.hora);
        const exEnd = exStart + ex.duracion;
        return newStart < exEnd && newEnd > exStart;
      });
      if (conflict) {
        e.hora = `Conflicto de horario con "${conflict.nombre}" (${conflict.hora})`;
      }
    }
    return e;
  };

  const next = () => {
    const errs = step === 0 ? validateStep0() : validateStep1();
    if (Object.keys(errs).length) {
      setErrors(errs);
      doShake();
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
  };

  const handleCreate = async () => {
    setLoading(true);
    setSubmitError("");
    const code = generarCodigoAcceso();
    try {
      // addExam() crea el examen en el backend real y lo mete en ExamsContext
      // (estado compartido): a partir de aquí ya aparece en /teacher y es
      // "entrable" desde /student con este código, sin necesidad de recargar nada.
      await addExam({
        nombre: form.nombre.trim(),
        curso: form.curso,
        docente: user ? `${user.nombre} ${user.apellido}` : "Docente",
        fecha: form.fecha,
        hora: form.hora,
        duracion: Number(form.duracion),
        estado: "programado",
        nota: null,
        inscritos: 0,
        conectados: 0,
        alertas: 0,
        codigoAcceso: code,
      });
      setCodigoAcceso(code);
      setDone(true);
    } catch (err) {
      setSubmitError(err.message);
      doShake();
    } finally {
      setLoading(false);
    }
  };

  const fechaFormateada = form.fecha
    ? new Date(form.fecha + "T00:00:00").toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .ev-wrap{min-height:100vh;background:#f5f4f1;display:flex;justify-content:center;padding:2rem;font-family:'DM Sans',sans-serif;}
        .ev-page{width:100%;max-width:760px;}

        .ev-back{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#8c92a4;cursor:pointer;margin-bottom:18px;background:none;border:none;}
        .ev-back:hover{color:#12213f;}

        .ev-head{margin-bottom:1.6rem;}
        .ev-head h1{font-family:'Lora',serif;font-size:25px;font-weight:500;color:#12213f;margin-bottom:5px;}
        .ev-head p{font-size:13.5px;color:#8c92a4;}

        /* Stepper */
        .ev-stepper{display:flex;align-items:center;margin-bottom:1.8rem;background:#fff;border-radius:14px;padding:1.1rem 1.3rem;border:1px solid #ececec;}
        .ev-step-pill{display:flex;align-items:center;gap:9px;flex:1;}
        .ev-step-circle{width:28px;height:28px;border-radius:50%;border:1.5px solid #e4e7ef;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:500;color:#b0b5c4;background:#fff;flex-shrink:0;transition:all .3s;}
        .ev-step-circle.done{background:#4f7cff;border-color:#4f7cff;color:#fff;}
        .ev-step-circle.active{border-color:#4f7cff;color:#4f7cff;background:#f0f4ff;}
        .ev-step-pill-label{font-size:12.5px;font-weight:500;color:#b0b5c4;}
        .ev-step-pill-label.active{color:#12213f;}
        .ev-step-line{flex:0 0 40px;height:1.5px;background:#e4e7ef;margin:0 6px;}
        .ev-step-line.done{background:#4f7cff;}

        /* Card */
        .ev-card{background:#fff;border-radius:18px;border:1px solid #ececec;padding:1.8rem;}
        .ev-card h2{font-family:'Lora',serif;font-size:18px;font-weight:500;color:#12213f;margin-bottom:4px;}
        .ev-card-sub{font-size:13px;color:#8c92a4;margin-bottom:1.5rem;}

        .ev-field{margin-bottom:14px;}
        .ev-label{display:block;font-size:11.5px;font-weight:500;color:#5a607a;letter-spacing:.05em;text-transform:uppercase;margin-bottom:6px;}
        .ev-input,.ev-select,.ev-textarea{width:100%;height:44px;padding:0 13px;border:1.5px solid #e4e7ef;border-radius:10px;font-size:13.5px;font-family:'DM Sans',sans-serif;color:#12213f;background:#fafbfc;outline:none;transition:border-color .15s,box-shadow .15s;}
        .ev-textarea{height:auto;padding:11px 13px;resize:vertical;min-height:80px;font-family:'DM Sans',sans-serif;line-height:1.5;}
        .ev-input:focus,.ev-select:focus,.ev-textarea:focus{border-color:#4f7cff;background:#fff;box-shadow:0 0 0 3px rgba(79,124,255,.12);}
        .ev-input.err,.ev-select.err{border-color:#e05252;}
        .ev-err{font-size:11.5px;color:#e05252;margin-top:4px;}
        .ev-grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        .ev-grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;}

        /* Tipo cards */
        .ev-tipo-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;}
        .ev-tipo-card{border:1.5px solid #e4e7ef;border-radius:11px;padding:0.9rem 0.5rem;cursor:pointer;text-align:center;background:#fafbfc;transition:all .15s;}
        .ev-tipo-card:hover{border-color:#b0b7cc;}
        .ev-tipo-card.selected{border-color:#4f7cff;background:#f0f4ff;box-shadow:0 0 0 3px rgba(79,124,255,.1);}
        .ev-tipo-icon{font-size:20px;display:block;margin-bottom:6px;}
        .ev-tipo-label{font-size:12px;font-weight:500;color:#12213f;}

        /* Toggle rows */
        .ev-toggle-row{display:flex;align-items:center;justify-content:space-between;padding:13px 14px;background:#fafbfc;border:1px solid #ececec;border-radius:11px;margin-bottom:10px;}
        .ev-toggle-info{display:flex;align-items:center;gap:11px;}
        .ev-toggle-icon{font-size:17px;}
        .ev-toggle-title{font-size:13px;font-weight:500;color:#12213f;}
        .ev-toggle-desc{font-size:11.5px;color:#8c92a4;margin-top:1px;}
        .ev-switch{position:relative;width:42px;height:24px;flex-shrink:0;}
        .ev-switch input{opacity:0;width:0;height:0;}
        .ev-switch-track{position:absolute;cursor:pointer;inset:0;background:#e4e7ef;border-radius:24px;transition:.2s;}
        .ev-switch-track::before{content:'';position:absolute;width:18px;height:18px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:.2s;box-shadow:0 1px 3px rgba(0,0,0,0.2);}
        .ev-switch input:checked + .ev-switch-track{background:#4f7cff;}
        .ev-switch input:checked + .ev-switch-track::before{transform:translateX(18px);}

        /* Summary (confirmation step) */
        .ev-summary-row{display:flex;justify-content:space-between;align-items:flex-start;padding:11px 0;border-bottom:1px solid #f3f4f7;gap:14px;}
        .ev-summary-row:last-child{border-bottom:none;}
        .ev-summary-label{font-size:12.5px;color:#8c92a4;flex-shrink:0;}
        .ev-summary-value{font-size:13px;color:#12213f;font-weight:500;text-align:right;}
        .ev-summary-box{background:#fafbfc;border:1px solid #ececec;border-radius:12px;padding:0.5rem 1rem;margin-bottom:1.2rem;}
        .ev-summary-badges{display:flex;gap:8px;margin-top:1rem;flex-wrap:wrap;}
        .ev-summary-badge{background:#f0f4ff;color:#4f7cff;font-size:11.5px;font-weight:500;padding:6px 12px;border-radius:20px;display:flex;align-items:center;gap:5px;}

        /* Buttons */
        .ev-btn-row{display:flex;gap:10px;margin-top:1.5rem;}
        .ev-btn-back{height:46px;padding:0 20px;background:#fff;color:#5a607a;border:1.5px solid #e4e7ef;border-radius:11px;font-size:13.5px;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .18s;white-space:nowrap;display:inline-flex;align-items:center;gap:6px;}
        .ev-btn-back:hover{border-color:#b0b5c8;color:#12213f;}
        .ev-btn-primary{flex:1;height:46px;background:#12213f;color:#fff;border:none;border-radius:11px;font-size:14px;font-family:'DM Sans',sans-serif;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:background .2s,transform .1s;}
        .ev-btn-primary:hover{background:#1e3260;}
        .ev-btn-primary:active{transform:scale(.98);}
        .ev-btn-primary:disabled{opacity:.7;cursor:not-allowed;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .ev-spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;}

        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
        .ev-shake{animation:shake .5s ease;}

        /* Success */
        .ev-success{text-align:center;padding:2rem 1rem;}
        .ev-success-icon{font-size:50px;margin-bottom:14px;}
        .ev-success h2{font-family:'Lora',serif;font-size:21px;font-weight:500;color:#12213f;margin-bottom:8px;}
        .ev-success p{font-size:13.5px;color:#8c92a4;margin-bottom:1.5rem;}
        .ev-success-card{background:#f0f4ff;border-radius:12px;padding:1rem 1.2rem;text-align:left;margin-bottom:1.5rem;}
        .ev-success-card-title{font-size:14px;font-weight:600;color:#12213f;margin-bottom:4px;}
        .ev-success-card-meta{font-size:12px;color:#5a6d94;}
        .ev-btn-full{width:100%;height:46px;background:#12213f;color:#fff;border:none;border-radius:11px;font-size:14px;font-weight:500;cursor:pointer;transition:background .2s;}
        .ev-btn-full:hover{background:#1e3260;}

        @media (max-width:600px){
          .ev-grid2,.ev-grid3{grid-template-columns:1fr;}
          .ev-tipo-grid{grid-template-columns:repeat(2,1fr);}
          .ev-step-pill-label{display:none;}
          .ev-stepper{padding:1rem;}
        }
      `}</style>

      <div className="ev-wrap">
        <div className="ev-page">

          {!done && (
            <button className="ev-back" onClick={() => navigate("/teacher")}><i className="ti ti-arrow-left" /> Volver al dashboard</button>
          )}

          {!done ? (
            <>
              <div className="ev-head">
                <h1>Crear nuevo examen</h1>
                <p>Configura los detalles y la programación de tu evaluación</p>
              </div>

              {/* STEPPER */}
              <div className="ev-stepper">
                <div className="ev-step-pill">
                  <div className={`ev-step-circle${step > 0 ? " done" : step === 0 ? " active" : ""}`}>{step > 0 ? <i className="ti ti-check" /> : "1"}</div>
                  <span className={`ev-step-pill-label${step === 0 ? " active" : ""}`}>Datos del examen</span>
                </div>
                <div className={`ev-step-line${step > 0 ? " done" : ""}`} />
                <div className="ev-step-pill">
                  <div className={`ev-step-circle${step > 1 ? " done" : step === 1 ? " active" : ""}`}>{step > 1 ? <i className="ti ti-check" /> : "2"}</div>
                  <span className={`ev-step-pill-label${step === 1 ? " active" : ""}`}>Programación</span>
                </div>
                <div className={`ev-step-line${step > 1 ? " done" : ""}`} />
                <div className="ev-step-pill">
                  <div className={`ev-step-circle${step === 2 ? " active" : ""}`}>3</div>
                  <span className={`ev-step-pill-label${step === 2 ? " active" : ""}`}>Confirmación</span>
                </div>
              </div>

              <div className={`ev-card${shake ? " ev-shake" : ""}`}>

                {/* STEP 0: DATOS BÁSICOS (HU-05) */}
                {step === 0 && (
                  <>
                    <h2>Datos del examen</h2>
                    <p className="ev-card-sub">Información general de la evaluación</p>

                    <div className="ev-field">
                      <label className="ev-label" htmlFor="nombre">Nombre del examen</label>
                      <input
                        id="nombre"
                        className={`ev-input${errors.nombre ? " err" : ""}`}
                        placeholder="Ej. Cálculo Diferencial - Parcial 2"
                        value={form.nombre}
                        onChange={(e) => setField("nombre", e.target.value)}
                      />
                      {errors.nombre && <p className="ev-err">{errors.nombre}</p>}
                    </div>

                    <div className="ev-grid2">
                      <div className="ev-field">
                        <label className="ev-label" htmlFor="curso">Curso</label>
                        <select id="curso" className={`ev-select${errors.curso ? " err" : ""}`} value={form.curso} onChange={(e) => setField("curso", e.target.value)}>
                          <option value="">Selecciona un curso</option>
                          {CURSOS.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {errors.curso && <p className="ev-err">{errors.curso}</p>}
                      </div>
                      <div className="ev-field">
                        <label className="ev-label" htmlFor="duracion">Duración (minutos)</label>
                        <input
                          id="duracion"
                          type="number"
                          min="1"
                          className={`ev-input${errors.duracion ? " err" : ""}`}
                          value={form.duracion}
                          onChange={(e) => setField("duracion", e.target.value)}
                        />
                        {errors.duracion && <p className="ev-err">{errors.duracion}</p>}
                      </div>
                    </div>

                    <div className="ev-field">
                      <label className="ev-label">Tipo de evaluación</label>
                      <div className="ev-tipo-grid">
                        {TIPOS.map((t) => (
                          <button
                            type="button"
                            key={t.id}
                            className={`ev-tipo-card${form.tipo === t.id ? " selected" : ""}`}
                            onClick={() => setField("tipo", t.id)}
                          >
                            <i className={`ti ${t.icon} ev-tipo-icon`} />
                            <span className="ev-tipo-label">{t.label}</span>
                          </button>
                        ))}
                      </div>
                      {errors.tipo && <p className="ev-err">{errors.tipo}</p>}
                    </div>

                    <div className="ev-field">
                      <label className="ev-label" htmlFor="instrucciones">Instrucciones (opcional)</label>
                      <textarea
                        id="instrucciones"
                        className="ev-textarea"
                        placeholder="Indicaciones adicionales para los estudiantes..."
                        value={form.instrucciones}
                        onChange={(e) => setField("instrucciones", e.target.value)}
                      />
                    </div>

                    <div className="ev-btn-row">
                      <button className="ev-btn-primary" style={{ flex: 1 }} onClick={next}>Continuar <i className="ti ti-arrow-right" /></button>
                    </div>
                  </>
                )}

                {/* STEP 1: PROGRAMACIÓN (HU-06) */}
                {step === 1 && (
                  <>
                    <h2>Programar examen</h2>
                    <p className="ev-card-sub">Define cuándo estará disponible la evaluación</p>

                    <div className="ev-grid2">
                      <div className="ev-field">
                        <label className="ev-label" htmlFor="fecha">Fecha</label>
                        <input
                          id="fecha"
                          type="date"
                          className={`ev-input${errors.fecha ? " err" : ""}`}
                          value={form.fecha}
                          onChange={(e) => setField("fecha", e.target.value)}
                        />
                        {errors.fecha && <p className="ev-err">{errors.fecha}</p>}
                      </div>
                      <div className="ev-field">
                        <label className="ev-label" htmlFor="hora">Hora de inicio</label>
                        <input
                          id="hora"
                          type="time"
                          className={`ev-input${errors.hora ? " err" : ""}`}
                          value={form.hora}
                          onChange={(e) => setField("hora", e.target.value)}
                        />
                        {errors.hora && <p className="ev-err">{errors.hora}</p>}
                      </div>
                    </div>

                    <div className="ev-field">
                      <label className="ev-label" htmlFor="intentos">Número de intentos permitidos</label>
                      <input
                        id="intentos"
                        type="number"
                        min="1"
                        max="3"
                        className="ev-input"
                        value={form.intentos}
                        onChange={(e) => setField("intentos", e.target.value)}
                      />
                    </div>

                    <div className="ev-toggle-row">
                      <div className="ev-toggle-info">
                        <i className="ti ti-camera ev-toggle-icon" />
                        <div>
                          <div className="ev-toggle-title">Supervisión por cámara</div>
                          <div className="ev-toggle-desc">Requiere acceso a cámara web durante el examen</div>
                        </div>
                      </div>
                      <label className="ev-switch">
                        <input type="checkbox" checked={form.camara} onChange={(e) => setField("camara", e.target.checked)} />
                        <span className="ev-switch-track" />
                      </label>
                    </div>

                    <div className="ev-toggle-row">
                      <div className="ev-toggle-info">
                        <i className="ti ti-device-desktop ev-toggle-icon" />
                        <div>
                          <div className="ev-toggle-title">Forzar pantalla completa</div>
                          <div className="ev-toggle-desc">Bloquea el cambio de pestaña durante la evaluación</div>
                        </div>
                      </div>
                      <label className="ev-switch">
                        <input type="checkbox" checked={form.pantallaCompleta} onChange={(e) => setField("pantallaCompleta", e.target.checked)} />
                        <span className="ev-switch-track" />
                      </label>
                    </div>

                    <div className="ev-btn-row">
                      <button className="ev-btn-back" onClick={() => setStep(0)}><i className="ti ti-arrow-left" /> Atrás</button>
                      <button className="ev-btn-primary" onClick={next}>Continuar <i className="ti ti-arrow-right" /></button>
                    </div>
                  </>
                )}

                {/* STEP 2: CONFIRMACIÓN */}
                {step === 2 && (
                  <>
                    <h2>Confirmar y publicar</h2>
                    <p className="ev-card-sub">Revisa los detalles antes de crear el examen</p>

                    <div className="ev-summary-box">
                      <div className="ev-summary-row">
                        <span className="ev-summary-label">Nombre</span>
                        <span className="ev-summary-value">{form.nombre}</span>
                      </div>
                      <div className="ev-summary-row">
                        <span className="ev-summary-label">Curso</span>
                        <span className="ev-summary-value">{form.curso}</span>
                      </div>
                      <div className="ev-summary-row">
                        <span className="ev-summary-label">Tipo</span>
                        <span className="ev-summary-value">{TIPOS.find((t) => t.id === form.tipo)?.label}</span>
                      </div>
                      <div className="ev-summary-row">
                        <span className="ev-summary-label">Fecha y hora</span>
                        <span className="ev-summary-value">{fechaFormateada} · {form.hora}</span>
                      </div>
                      <div className="ev-summary-row">
                        <span className="ev-summary-label">Duración</span>
                        <span className="ev-summary-value">{form.duracion} minutos</span>
                      </div>
                      <div className="ev-summary-row">
                        <span className="ev-summary-label">Intentos permitidos</span>
                        <span className="ev-summary-value">{form.intentos}</span>
                      </div>
                    </div>

                    <div className="ev-summary-badges">
                      {form.camara && <span className="ev-summary-badge"><i className="ti ti-camera" /> Supervisión por cámara</span>}
                      {form.pantallaCompleta && <span className="ev-summary-badge"><i className="ti ti-device-desktop" /> Pantalla completa forzada</span>}
                    </div>

                    {submitError && <p className="ev-err" style={{ marginBottom: 10 }}>{submitError}</p>}

                    <div className="ev-btn-row">
                      <button className="ev-btn-back" onClick={() => setStep(1)}><i className="ti ti-arrow-left" /> Atrás</button>
                      <button className="ev-btn-primary" onClick={handleCreate} disabled={loading}>
                        {loading ? <><span className="ev-spinner" /> Creando examen...</> : <><i className="ti ti-check" /> Crear examen</>}
                      </button>
                    </div>
                  </>
                )}

              </div>
            </>
          ) : (
            <div className="ev-card">
              <div className="ev-success">
                <div className="ev-success-icon"><i className="ti ti-circle-check" style={{ color: "#22b865" }} /></div>
                <h2>¡Examen creado exitosamente!</h2>
                <p>El examen ya está programado y visible para los estudiantes del curso.</p>
                <div className="ev-success-card">
                  <div className="ev-success-card-title">{form.nombre}</div>
                  <div className="ev-success-card-meta">{form.curso} · {fechaFormateada} · {form.hora} · {form.duracion} min</div>
                </div>
                <div className="ev-summary-badges" style={{ justifyContent: "center", marginBottom: "1.5rem" }}>
                  <span className="ev-summary-badge">
                    <i className="ti ti-key" /> Código de acceso: <b>{codigoAcceso}</b>
                  </span>
                </div>
                <button className="ev-btn-full" onClick={() => navigate("/teacher")}>Volver al dashboard</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
