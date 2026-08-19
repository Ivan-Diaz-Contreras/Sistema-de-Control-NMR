function DashboardAdmin({
  cargando,
  estadisticas,
  usuario,
}) {
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

  return (
    <>
      <section className="welcome-card">
        <div>
          <p className="section-label">
            BIENVENIDO
          </p>

          <h1>
            Hola,{" "}
            {usuario?.nombre || "Administrador"} 👋
          </h1>

          <p>
            Consulta el estado general de los
            practicantes, asistencias, horas y
            bitácoras desde un solo lugar.
          </p>
        </div>

        <div className="welcome-icon">
          NMR
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
                👥
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
                ✅
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
                ⏱
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
                📋
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
                <span>🕐</span>
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
                          ✓ {Number(dia.a_tiempo || 0)}
                        </span>

                        <span>
                          ⚠ {Number(dia.retardos || 0)}
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