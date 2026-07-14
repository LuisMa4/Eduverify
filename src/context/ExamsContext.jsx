import { useEffect, useState } from "react";
import { ExamsContext } from "./exams-context.js";
import { EXAMS } from "../data/mockExams.js";
import { useAuth } from "../hooks/useAuth.js";
import { apiCreateExam, apiListExams, mapExamFromBackend } from "../services/api.js";

// Campos que la UI espera pero el backend todavía no modela (curso, docente,
// nota, contadores de supervisión, código de acceso). Un examen que otra
// sesión creó y que llega por primera vez vía GET necesita algún valor acá
// para no romper sumas/promedios (ver DEFAULT_EXTRA_FIELDS más abajo).
const DEFAULT_EXTRA_FIELDS = {
  curso: "General",
  docente: "Docente",
  nota: null,
  inscritos: 0,
  conectados: 0,
  alertas: 0,
  codigoAcceso: "—",
};

// Lista de exámenes como estado vivo de React (arranca con el seed de
// mockExams.js, que sigue simulando el histórico de demo). Los exámenes
// nuevos se crean vía POST /api/exams (backend real) y los ya creados por
// cualquier sesión se sincronizan vía GET /api/exams — así dos pestañas
// (docente creando, estudiante mirando) ven lo mismo. El resto del flujo de
// examen (acceso, cámara, preguntas, nota) sigue simulado porque el backend
// aún no lo modela. Se monta una sola vez en main.jsx.
export function ExamsProvider({ children }) {
  const { user } = useAuth();
  const [exams, setExams] = useState(EXAMS);

  // Trae los exámenes reales del backend cuando hay sesión activa y los
  // combina con el seed de demo (que no existe en el backend, así que nunca
  // choca por id). Se repite cada pocos segundos mientras la sesión siga
  // activa para que un dashboard ya abierto (docente o estudiante) vea un
  // examen nuevo sin tener que recargar ni volver a loguearse.
  useEffect(() => {
    if (!user?.token) return;

    const sync = () => {
      apiListExams(user.token)
        .then((backendExams) => {
          setExams((prev) => {
            const localById = new Map(prev.map((e) => [String(e.id), e]));
            // El backend manda la verdad de id/nombre/estado/fecha/hora/duracion;
            // lo demás se conserva si ya lo conocíamos (p.ej. lo creamos en esta
            // sesión) o cae a un valor por defecto si es la primera vez que se ve.
            const synced = backendExams.map((be) => ({
              ...DEFAULT_EXTRA_FIELDS,
              ...localById.get(String(be.id)),
              ...mapExamFromBackend(be),
            }));
            const seedOnly = prev.filter((e) => !synced.some((s) => String(s.id) === String(e.id)));
            return [...seedOnly, ...synced];
          });
        })
        .catch(() => {}); // sin backend disponible, se sigue viendo el seed de demo
    };

    sync();
    const interval = setInterval(sync, 5000);
    return () => clearInterval(interval);
  }, [user?.token]);

  const addExam = async (exam) => {
    if (user?.token) {
      const created = await apiCreateExam({
        title: exam.nombre,
        scheduledDate: `${exam.fecha}T${exam.hora}:00`,
        durationMinutes: exam.duracion,
        token: user.token,
      });
      const newExam = { ...exam, ...mapExamFromBackend(created) };
      setExams((prev) => [...prev, newExam]);
      return newExam;
    }
    // Sin sesión (URL directa sin login): fallback local-only, como antes.
    const id = exams.reduce((max, e) => Math.max(max, typeof e.id === "number" ? e.id : 0), 0) + 1;
    const newExam = { id, ...exam };
    setExams((prev) => [...prev, newExam]);
    return newExam;
  };

  // String(...) porque el id de la URL (useParams) siempre llega como texto,
  // mientras que el id guardado en el examen es numérico (seed) o un UUID
  // string (creado vía backend).
  const getExamById = (id) => exams.find((e) => String(e.id) === String(id));

  return (
    <ExamsContext.Provider value={{ exams, addExam, getExamById }}>
      {children}
    </ExamsContext.Provider>
  );
}
