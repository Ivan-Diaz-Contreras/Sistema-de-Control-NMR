import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  AlertTriangle,
  BellRing,
  Building2,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Hand,
  UserCheck,
  Users,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

const API = `${API_URL}/api`;

function DashboardAdmin({
  cargando,
  estadisticas,
  usuario,
  irASeccionDesdeAlerta,
}) {
  const [alertas, setAlertas] = useState([]);
  const [resumenAlertas, setResumenAlertas] =
    useState({
      sin_entrada: 0,
      sin_salida: 0,
      sin_actividad: 0,
      bitacora_pendiente: 0,
      proximo_horas: 0,
    });
  const [cargandoAlertas, setCargandoAlertas] =
    useState(true);
  const [errorAlertas, setErrorAlertas] =
    useState("");

  const cargarAlertas = useCallback(async () => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      setAlertas([]);
      setCargandoAlertas(false);
      return;
    }

    try {
      setCargandoAlertas(true);
      setErrorAlertas("");

      const response = await axios.get(
        `${API}/admin/alertas`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAlertas(
        Array.isArray(response.data?.alertas)
          ? response.data.alertas
          : []
      );

      setResumenAlertas({
        sin_entrada:
          Number(
            response.data?.resumen?.sin_entrada
          ) || 0,
        sin_salida:
          Number(
            response.data?.resumen?.sin_salida
          ) || 0,
        sin_actividad:
          Number(
            response.data?.resumen?.sin_actividad
          ) || 0,
        bitacora_pendiente:
          Number(
            response.data?.resumen?.bitacora_pendiente
          ) || 0,
        proximo_horas:
          Number(
            response.data?.resumen?.proximo_horas
          ) || 0,
      });
    } catch (error) {
      console.error(
        "Error cargando alertas del administrador:",
        error
      );

      setErrorAlertas(
        error.response?.data?.mensaje ||
          "No se pudieron cargar las alertas."
      );
    } finally {
      setCargandoAlertas(false);
    }
  }, []);

  useEffect(() => {
    cargarAlertas();
  }, [cargarAlertas]);

  const totalPracticantes =
    estadisticas?.total_practicantes ?? 0;

  const practicantesActivos =
    estadisticas?.practicantes_activos ?? 0;

  const practicantesInactivos =
    estadisticas?.practicantes_inactivos ?? 0;

  const asistenciasHoy =
    estadisticas?.asistencias_hoy ?? 0;

  const asistenciasATiempo =
    estadisticas?.asistencias_a_tiempo_hoy ?? 0;

  const retardosHoy =
    estadisticas?.retardos_hoy ?? 0;

  const asistenciasIncompletas =
    estadisticas?.asistencias_incompletas_hoy ?? 0;

  const asistenciasPendientes =
    estadisticas?.asistencias_pendientes_hoy ?? 0;

  const puntualidad =
    estadisticas?.porcentaje_puntualidad_hoy ?? 0;

  const totalHoras =
    estadisticas?.total_horas_registradas ?? 0;

  const horasHoy =
    estadisticas?.horas_registradas_hoy ?? 0;

  const bitacorasPendientes =
    estadisticas?.bitacoras_pendientes ?? 0;

  const bitacorasAprobadas =
    estadisticas?.bitacoras_aprobadas ?? 0;

  const bitacorasRechazadas =
    estadisticas?.bitacoras_rechazadas ?? 0;

  const tieneAsistenciasHoy =
    Number(asistenciasHoy) > 0;

  const actividadUltimos7Dias =
    estadisticas?.actividad_ultimos_7_dias || [];

  const maxAsistencias = Math.max(
    1,
    ...actividadUltimos7Dias.map((dia) =>
      Number(dia.asistencias || 0)
    )
  );

  const maxHoras = Math.max(
    1,
    ...actividadUltimos7Dias.map((dia) =>
      Number(dia.horas || 0)
    )
  );

  const formatearDiaGrafica = (fecha) => {
    if (!fecha) {
      return "";
    }

    const [anio, mes, dia] =
      String(fecha).split("-").map(Number);

    const fechaLocal = new Date(
      anio,
      (mes || 1) - 1,
      dia || 1
    );

    return fechaLocal.toLocaleDateString("es-MX", {
      weekday: "short",
      day: "2-digit",
    });
  };

  const obtenerTituloAlerta = (tipo) => {
    switch (tipo) {
      case "sin_entrada":
        return "Entrada pendiente";
      case "sin_salida":
        return "Salida pendiente";
      case "sin_actividad":
        return "Actividad diaria pendiente";
      case "bitacora_pendiente":
        return "Bitácora pendiente";
      case "proximo_horas":
        return "Próximo a completar horas";
      default:
        return "Alerta";
    }
  };

  const obtenerIconoAlerta = (tipo) => {
    if (tipo === "proximo_horas") {
      return <CheckCircle2 size={20} />;
    }

    return <AlertTriangle size={20} />;
  };

  const obtenerSeccionAlerta = (tipo) => {
    switch (tipo) {
      case "sin_entrada":
        return "asistencia";
      case "sin_salida":
        return "asistencia";
      case "sin_actividad":
        return "actividad-diaria";
      case "bitacora_pendiente":
        return "bitacoras";
      case "proximo_horas":
        return "practicantes";
      default:
        return "dashboard";
    }
  };

  const abrirSeccionAlerta = (tipo) => {
    if (typeof irASeccionDesdeAlerta !== "function") {
      return;
    }

    irASeccionDesdeAlerta(
      obtenerSeccionAlerta(tipo)
    );
  };

  return (
    <>
      <section className="welcome-card">
        <div>
          <p className="section-label">
            BIENVENIDO
          </p>

          <h1>
            Hola,{" "}
            {usuario?.nombre || "Administrador"}{" "}
            <Hand
              size={28}
              style={{ verticalAlign: "middle" }}
            />
          </h1>

          <p>
            Consulta el estado general de los
            practicantes, asistencias, horas y
            bitácoras desde un solo lugar.
          </p>
        </div>

        <div className="welcome-icon">
          <Building2 size={38} />
        </div>
      </section>

      {cargando ? (
        <section className="panel">
          <p>Cargando estadísticas...</p>
        </section>
      ) : (
        <>
          <section className="dashboard-main-stats">
            <article className="dashboard-kpi-card">
              <div className="dashboard-kpi-icon">
                <Users size={24} />
              </div>

              <div>
                <p>Practicantes</p>
                <strong>{totalPracticantes}</strong>
                <small>
                  {practicantesActivos} activos ·{" "}
                  {practicantesInactivos} inactivos
                </small>
              </div>
            </article>

            <article className="dashboard-kpi-card">
              <div className="dashboard-kpi-icon">
                <UserCheck size={24} />
              </div>

              <div>
                <p>Activos</p>
                <strong>{practicantesActivos}</strong>
                <small>
                  practicantes habilitados
                </small>
              </div>
            </article>

            <article className="dashboard-kpi-card">
              <div className="dashboard-kpi-icon">
                <Clock3 size={24} />
              </div>

              <div>
                <p>Horas acumuladas</p>
                <strong>
                  {Number(totalHoras).toFixed(2)}
                </strong>
                <small>
                  horas contabilizadas
                </small>
              </div>
            </article>

            <article className="dashboard-kpi-card">
              <div className="dashboard-kpi-icon">
                <ClipboardList size={24} />
              </div>

              <div>
                <p>Bitácoras pendientes</p>
                <strong>
                  {bitacorasPendientes}
                </strong>
                <small>
                  por revisar
                </small>
              </div>
            </article>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="section-label">
                  ALERTAS
                </p>

                <h3>
                  Pendientes y seguimiento
                </h3>

                <p className="panel-description dashboard-section-description">
                  Avisos automáticos sobre asistencias,
                  actividades, bitácoras y avance de horas.
                </p>
              </div>

              <button
                type="button"
                onClick={cargarAlertas}
                disabled={cargandoAlertas}
              >
                <BellRing size={18} />
                {cargandoAlertas
                  ? "Actualizando..."
                  : "Actualizar alertas"}
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "12px",
                marginBottom: "18px",
              }}
            >
              <article
                className="dashboard-mini-card"
                role="button"
                tabIndex={0}
                onClick={() => abrirSeccionAlerta("sin_entrada")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    abrirSeccionAlerta("sin_entrada");
                  }
                }}
                style={{ cursor: "pointer" }}
                title="Ir a Asistencia"
              >
                <span>
                  <AlertTriangle size={20} />
                </span>
                <div>
                  <p>Sin entrada</p>
                  <strong>
                    {resumenAlertas.sin_entrada}
                  </strong>
                  <small>entradas pendientes</small>
                </div>
              </article>

              <article
                className="dashboard-mini-card"
                role="button"
                tabIndex={0}
                onClick={() => abrirSeccionAlerta("sin_salida")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    abrirSeccionAlerta("sin_salida");
                  }
                }}
                style={{ cursor: "pointer" }}
                title="Ir a Asistencia"
              >
                <span>
                  <AlertTriangle size={20} />
                </span>
                <div>
                  <p>Sin salida</p>
                  <strong>
                    {resumenAlertas.sin_salida}
                  </strong>
                  <small>entradas incompletas</small>
                </div>
              </article>

              <article
                className="dashboard-mini-card"
                role="button"
                tabIndex={0}
                onClick={() => abrirSeccionAlerta("sin_actividad")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    abrirSeccionAlerta("sin_actividad");
                  }
                }}
                style={{ cursor: "pointer" }}
                title="Ir a Actividad diaria"
              >
                <span>
                  <ClipboardList size={20} />
                </span>
                <div>
                  <p>Sin actividad</p>
                  <strong>
                    {resumenAlertas.sin_actividad}
                  </strong>
                  <small>actividades diarias pendientes</small>
                </div>
              </article>

              <article
                className="dashboard-mini-card"
                role="button"
                tabIndex={0}
                onClick={() => abrirSeccionAlerta("bitacora_pendiente")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    abrirSeccionAlerta("bitacora_pendiente");
                  }
                }}
                style={{ cursor: "pointer" }}
                title="Ir a Bitácoras"
              >
                <span>
                  <ClipboardList size={20} />
                </span>
                <div>
                  <p>Bitácoras</p>
                  <strong>
                    {resumenAlertas.bitacora_pendiente}
                  </strong>
                  <small>pendientes o no entregadas</small>
                </div>
              </article>

              <article
                className="dashboard-mini-card"
                role="button"
                tabIndex={0}
                onClick={() => abrirSeccionAlerta("proximo_horas")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    abrirSeccionAlerta("proximo_horas");
                  }
                }}
                style={{ cursor: "pointer" }}
                title="Ir a Practicantes"
              >
                <span>
                  <CheckCircle2 size={20} />
                </span>
                <div>
                  <p>Próximos a terminar</p>
                  <strong>
                    {resumenAlertas.proximo_horas}
                  </strong>
                  <small>90% o más de avance</small>
                </div>
              </article>
            </div>

            {errorAlertas ? (
              <div
                style={{
                  padding: "14px",
                  border: "1px solid #e1e6ef",
                  borderRadius: "10px",
                }}
              >
                {errorAlertas}
              </div>
            ) : cargandoAlertas ? (
              <p>Cargando alertas...</p>
            ) : alertas.length === 0 ? (
              <div
                style={{
                  padding: "18px",
                  border: "1px solid #e1e6ef",
                  borderRadius: "10px",
                }}
              >
                <strong>
                  No hay alertas pendientes.
                </strong>
                <p
                  style={{
                    margin: "6px 0 0",
                  }}
                >
                  Los practicantes activos se encuentran
                  al corriente.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "10px",
                }}
              >
                {alertas.map((alerta) => (
                  <article
                    key={alerta.id}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      abrirSeccionAlerta(alerta.tipo)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        abrirSeccionAlerta(alerta.tipo);
                      }
                    }}
                    title="Abrir sección relacionada"
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      padding: "14px",
                      border: "1px solid #e1e6ef",
                      borderRadius: "10px",
                      cursor: "pointer",
                    }}
                  >
                    <span>
                      {obtenerIconoAlerta(
                        alerta.tipo
                      )}
                    </span>

                    <div
                      style={{
                        flex: 1,
                      }}
                    >
                      <strong>
                        {obtenerTituloAlerta(
                          alerta.tipo
                        )}
                      </strong>

                      <div
                        style={{
                          marginTop: "4px",
                        }}
                      >
                        <strong>
                          {alerta.practicante}
                        </strong>
                        {alerta.carrera
                          ? ` · ${alerta.carrera}`
                          : ""}
                      </div>

                      <p
                        style={{
                          margin:
                            "5px 0 0",
                        }}
                      >
                        {alerta.mensaje}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="panel dashboard-attendance-panel">
            <div className="panel-header dashboard-attendance-header">
              <div>
                <p className="section-label">
                  HOY
                </p>

                <h3>
                  Asistencia del día
                </h3>

                <p className="panel-description dashboard-section-description">
                  Resumen de los registros de asistencia
                  generados durante el día.
                </p>
              </div>

              <div className="dashboard-punctuality">
                {tieneAsistenciasHoy ? (
                  <>
                    <strong>
                      {Number(puntualidad).toFixed(0)}%
                    </strong>
                    <span>
                      puntualidad de hoy
                    </span>
                  </>
                ) : (
                  <>
                    <strong>—</strong>
                    <span>
                      Sin asistencias hoy
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="dashboard-attendance-grid">
              <article className="dashboard-mini-card">
                <span><Clock3 size={22} /></span>
                <div>
                  <p>Asistencias</p>
                  <strong>{asistenciasHoy}</strong>
                  <small>registradas hoy</small>
                </div>
              </article>

              <article className="dashboard-mini-card">
                <span>✓</span>
                <div>
                  <p>A tiempo</p>
                  <strong>{asistenciasATiempo}</strong>
                  <small>entradas puntuales</small>
                </div>
              </article>

              <article className="dashboard-mini-card">
                <span>⚠</span>
                <div>
                  <p>Retardos</p>
                  <strong>{retardosHoy}</strong>
                  <small>registrados hoy</small>
                </div>
              </article>

              <article className="dashboard-mini-card">
                <span>◷</span>
                <div>
                  <p>Incompletas</p>
                  <strong>
                    {asistenciasIncompletas}
                  </strong>
                  <small>sin completar</small>
                </div>
              </article>

              <article className="dashboard-mini-card">
                <span>…</span>
                <div>
                  <p>Pendientes</p>
                  <strong>
                    {asistenciasPendientes}
                  </strong>
                  <small>por registrar</small>
                </div>
              </article>

              <article className="dashboard-mini-card">
                <span>⏱</span>
                <div>
                  <p>Horas de hoy</p>
                  <strong>
                    {Number(horasHoy).toFixed(2)}
                  </strong>
                  <small>horas acumuladas</small>
                </div>
              </article>
            </div>
          </section>

          <section className="dashboard-lower-grid">
            <article className="panel dashboard-summary-card">
              <div className="panel-header">
                <div>
                  <p className="section-label">
                    BITÁCORAS
                  </p>
                  <h3>Estado de entregas</h3>
                </div>
              </div>

              <div className="dashboard-bitacora-grid">
                <div>
                  <span className="dashboard-status-label">
                    Pendientes
                  </span>
                  <strong>
                    {bitacorasPendientes}
                  </strong>
                </div>

                <div>
                  <span className="dashboard-status-label">
                    Aprobadas
                  </span>
                  <strong>
                    {bitacorasAprobadas}
                  </strong>
                </div>

                <div>
                  <span className="dashboard-status-label">
                    Rechazadas
                  </span>
                  <strong>
                    {bitacorasRechazadas}
                  </strong>
                </div>
              </div>
            </article>

            <article className="panel dashboard-summary-card">
              <div className="panel-header">
                <div>
                  <p className="section-label">
                    RESUMEN
                  </p>
                  <h3>Actividad de hoy</h3>
                </div>
              </div>

              <div className="dashboard-today-summary">
                <div>
                  <span>
                    Asistencias registradas
                  </span>
                  <strong>{asistenciasHoy}</strong>
                </div>

                <div>
                  <span>
                    Horas contabilizadas hoy
                  </span>
                  <strong>
                    {Number(horasHoy).toFixed(2)}
                  </strong>
                </div>

                <div>
                  <span>
                    Puntualidad
                  </span>
                  <strong>
                    {tieneAsistenciasHoy
                      ? `${Number(puntualidad).toFixed(0)}%`
                      : "Sin registros"}
                  </strong>
                </div>
              </div>
            </article>
          </section>

          <section className="panel dashboard-weekly-panel">
            <div className="panel-header dashboard-weekly-header">
              <div>
                <p className="section-label">
                  ÚLTIMOS 7 DÍAS
                </p>

                <h3>
                  Actividad semanal
                </h3>

                <p className="panel-description dashboard-section-description">
                  Comparativa diaria de asistencias y horas
                  contabilizadas.
                </p>
              </div>

              <div className="dashboard-chart-legend">
                <span>
                  <i className="dashboard-legend-box dashboard-legend-attendance" />
                  Asistencias
                </span>

                <span>
                  <i className="dashboard-legend-box dashboard-legend-hours" />
                  Horas
                </span>
              </div>
            </div>

            {actividadUltimos7Dias.length === 0 ? (
              <div className="dashboard-chart-empty">
                No hay información disponible para los
                últimos 7 días.
              </div>
            ) : (
              <div className="dashboard-weekly-chart">
                {actividadUltimos7Dias.map((dia) => {
                  const asistencias =
                    Number(dia.asistencias || 0);

                  const horas =
                    Number(dia.horas || 0);

                  const alturaAsistencias =
                    (asistencias / maxAsistencias) * 100;

                  const alturaHoras =
                    (horas / maxHoras) * 100;

                  return (
                    <div
                      className="dashboard-chart-day"
                      key={dia.fecha}
                    >
                      <div className="dashboard-chart-values">
                        <span>
                          {asistencias} asist.
                        </span>

                        <span>
                          {horas.toFixed(2)} h
                        </span>
                      </div>

                      <div className="dashboard-chart-bars">
                        <div
                          className="dashboard-chart-bar dashboard-chart-bar-attendance"
                          style={{
                            height: `${Math.max(
                              alturaAsistencias,
                              asistencias > 0 ? 8 : 2
                            )}%`,
                          }}
                          title={`${asistencias} asistencias`}
                        />

                        <div
                          className="dashboard-chart-bar dashboard-chart-bar-hours"
                          style={{
                            height: `${Math.max(
                              alturaHoras,
                              horas > 0 ? 8 : 2
                            )}%`,
                          }}
                          title={`${horas.toFixed(2)} horas`}
                        />
                      </div>

                      <strong className="dashboard-chart-label">
                        {formatearDiaGrafica(dia.fecha)}
                      </strong>

                      <div className="dashboard-chart-detail">
                        <span>
                          <CheckCircle2 size={14} />
                          {Number(dia.a_tiempo || 0)}
                        </span>

                        <span>
                          <AlertTriangle size={14} />
                          {Number(dia.retardos || 0)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}

export default DashboardAdmin;