// Conexión mínima al backend real (Spring Boot, ver Repo/backend/Backend-Eduverify).
// Cubre IAM (login/registro) y Academic Management solo para crear/listar
// exámenes — el resto del flujo de examen (acceso, cámara, preguntas, nota)
// sigue simulado en mockExams.js porque el backend aún no lo modela.
const API_URL = "http://localhost:8080";

const ROLE_TO_BACKEND = { estudiante: "student", docente: "teacher" };
const ROLE_FROM_BACKEND = { STUDENT: "estudiante", TEACHER: "docente" };

export async function apiLogin(email, password) {
  const res = await fetch(`${API_URL}/api/iam/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Correo o contraseña inválidos");

  return {
    token: data.token,
    id: data.user.id,
    email: data.user.email,
    role: ROLE_FROM_BACKEND[data.user.role] || "estudiante",
    nombre: data.user.email.split("@")[0],
    apellido: "",
  };
}

export async function apiRegister({ email, password, role }) {
  const res = await fetch(`${API_URL}/api/iam/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role: ROLE_TO_BACKEND[role] }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "No se pudo completar el registro");
  return data;
}

const EXAM_STATUS_FROM_BACKEND = { SCHEDULED: "programado", IN_PROGRESS: "en_curso", FINISHED: "finalizado" };

// El backend solo conoce id/title/scheduledDate/durationMinutes/status —
// el resto de campos que usa la UI (curso, docente, inscritos...) no están
// modelados todavía, así que quedan afuera de este mapeo.
export function mapExamFromBackend(exam) {
  const dt = new Date(exam.scheduledDate);
  const pad = (n) => String(n).padStart(2, "0");
  return {
    id: exam.id,
    nombre: exam.title,
    estado: EXAM_STATUS_FROM_BACKEND[exam.status] || "programado",
    fecha: `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`,
    hora: `${pad(dt.getHours())}:${pad(dt.getMinutes())}`,
    duracion: exam.durationMinutes,
  };
}

export async function apiCreateExam({ title, scheduledDate, durationMinutes, token }) {
  const res = await fetch(`${API_URL}/api/exams`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title, scheduledDate, durationMinutes }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "No se pudo crear el examen");
  return data;
}

export async function apiListExams(token) {
  const res = await fetch(`${API_URL}/api/exams`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("No se pudo cargar la lista de exámenes");
  return res.json();
}
