function AsistenciaAdmin({
  abrirEdicionAsistencia,
  abrirFormularioAsistenciaHistorica,
  asistencias,
  asistenciasFiltradas,
  busquedaAsistencia,
  calcularTiempoReal,
  cambiarCampoAsistencia,
  cambiarCampoAsistenciaHistorica,
  cancelarAsistenciaHistorica,
  cargandoAsistencias,
  cargarAsistencias,
  editandoAsistencia,
  formAsistenciaHistorica,
  filtroEstadoAsistencia,
  filtroPracticanteAsistencia,
  filtroFechaAsistencia,
  formatearFecha,
  formatearHora,
  guardandoAsistencia,
  guardandoAsistenciaHistorica,
  guardarAsistencia,
  guardarAsistenciaHistorica,
  mostrandoAsistenciaHistorica,
  practicantes,
  setBusquedaAsistencia,
  setEditandoAsistencia,
  setFiltroEstadoAsistencia,
  setFiltroPracticanteAsistencia,
  setFiltroFechaAsistencia,
}) {
  return (
          <>

      <style>{`
        /*
         * Ajuste de escritorio:
         * compacta la tabla para que la columna Acciones pueda verse
         * sin tener que desplazarse horizontalmente en pantallas amplias.
         */
        .asistencia-admin-responsive-table {
          min-width: 1100px !important;
        }

        .asistencia-admin-responsive-table th {
          white-space: normal !important;
          line-height: 1.2;
        }

        .asistencia-admin-responsive-table th:nth-child(9) {
          width: 105px;
          min-width: 105px;
          text-align: center;
        }

        .asistencia-admin-responsive-table td:nth-child(9) {
          min-width: 85px;
        }

        /* Responsive exclusivo de Control de Asistencia.
           La tabla de escritorio y toda su lógica permanecen sin cambios. */
        @media (max-width: 650px) {
          .asistencia-admin-header-actions {
            width: 100%;
            display: grid !important;
            grid-template-columns: 1fr 1fr;
            gap: 8px !important;
          }

          .asistencia-admin-header-actions button {
            width: 100%;
            min-width: 0;
            min-height: 40px;
          }

          .asistencia-toolbar {
            grid-template-columns: minmax(0, 1fr) !important;
            width: 100%;
          }

          .asistencia-toolbar > *,
          .asistencia-search,
          .asistencia-filter {
            width: 100% !important;
            min-width: 0 !important;
          }

          .asistencia-admin-table-wrapper {
            overflow: visible !important;
          }

          .asistencia-admin-table-wrapper.table-scroll-guide::before {
            display: none !important;
          }

          .asistencia-admin-responsive-table,
          .asistencia-admin-responsive-table tbody,
          .asistencia-admin-responsive-table tr,
          .asistencia-admin-responsive-table td {
            display: block;
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
          }

          .asistencia-admin-responsive-table {
            min-width: 0 !important;
            table-layout: auto !important;
            border-collapse: separate !important;
            border-spacing: 0 !important;
          }

          .asistencia-admin-responsive-table thead {
            display: none;
          }

          .asistencia-admin-responsive-table tbody {
            display: grid;
            gap: 14px;
          }

          .asistencia-admin-responsive-table tr {
            overflow: hidden;
            border: 1px solid #e1e6ee;
            border-radius: 12px;
            background: #ffffff;
            box-shadow: 0 2px 8px rgba(16, 28, 54, 0.04);
          }

          .asistencia-admin-responsive-table td {
            display: grid !important;
            grid-template-columns: 125px minmax(0, 1fr);
            gap: 12px;
            align-items: start;
            box-sizing: border-box;
            padding: 10px 12px !important;
            border-bottom: 1px solid #edf0f5 !important;
            white-space: normal !important;
            word-break: normal !important;
            overflow-wrap: break-word !important;
            text-align: left !important;
          }

          .asistencia-admin-responsive-table td::before {
            content: attr(data-label);
            color: #66758c;
            font-size: 11px;
            font-weight: 700;
            line-height: 1.35;
          }

          .asistencia-admin-responsive-table td:last-child {
            border-bottom: none !important;
          }

          .asistencia-admin-responsive-table td > div,
          .asistencia-admin-responsive-table td > span,
          .asistencia-admin-responsive-table td strong {
            min-width: 0;
            max-width: 100%;
            word-break: normal !important;
            overflow-wrap: break-word !important;
          }

          .asistencia-admin-responsive-table td[data-label="Acciones"] .admin-actions {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
          }

          .asistencia-admin-responsive-table td[data-label="Acciones"] button {
            min-height: 38px;
          }

          .asistencia-edit-form .admin-form-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }

          .asistencia-edit-form .admin-form-full {
            grid-column: auto !important;
          }

          .asistencia-form-footer {
            align-items: stretch;
          }

          .asistencia-form-footer button {
            width: 100%;
          }
        }

        @media (max-width: 380px) {
          .asistencia-admin-header-actions {
            grid-template-columns: 1fr;
          }

          .asistencia-admin-responsive-table td {
            grid-template-columns: 1fr;
            gap: 4px;
          }

          .asistencia-admin-responsive-table td[data-label="Acciones"] button {
            width: 100%;
          }
        }
      `}</style>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="section-label">
                    CONTROL DE ASISTENCIA
                  </p>
                  <h3>Registros de entrada y salida</h3>
                </div>

                <div
                  className="asistencia-admin-header-actions"
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    onClick={
                      abrirFormularioAsistenciaHistorica
                    }
                    disabled={
                      mostrandoAsistenciaHistorica
                    }
                  >
                    + Registrar asistencia anterior
                  </button>

                  <button
                    type="button"
                    onClick={cargarAsistencias}
                    disabled={cargandoAsistencias}
                  >
                    {cargandoAsistencias
                      ? "Actualizando..."
                      : "Actualizar"}
                  </button>
                </div>
              </div>

              <p className="panel-description">
                Consulta las entradas y salidas reales de los
                practicantes. Las horas contabilizadas corresponden al
                tiempo real transcurrido entre la entrada y la salida,
                incluyendo el tiempo adicional realizado.
              </p>

              <div className="asistencia-toolbar">
                <input
                  type="text"
                  value={busquedaAsistencia}
                  onChange={(e) =>
                    setBusquedaAsistencia(e.target.value)
                  }
                  placeholder="Buscar por nombre, matrícula o carrera"
                  className="asistencia-search"
                />

                <select
                  value={filtroPracticanteAsistencia}
                  onChange={(e) =>
                    setFiltroPracticanteAsistencia(
                      e.target.value
                    )
                  }
                  className="asistencia-filter"
                >
                  <option value="">
                    Todos los practicantes
                  </option>
                  {practicantes.map((practicante) => (
                    <option
                      key={practicante.id_practicante}
                      value={String(
                        practicante.id_practicante
                      )}
                    >
                      {[
                        practicante.nombre,
                        practicante.apellido_paterno,
                        practicante.apellido_materno,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      {practicante.matricula
                        ? ` - ${practicante.matricula}`
                        : ""}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={filtroFechaAsistencia}
                  onChange={(e) =>
                    setFiltroFechaAsistencia(
                      e.target.value
                    )
                  }
                  className="asistencia-filter"
                  aria-label="Filtrar por fecha"
                />

                <select
                  value={filtroEstadoAsistencia}
                  onChange={(e) =>
                    setFiltroEstadoAsistencia(e.target.value)
                  }
                  className="asistencia-filter"
                >
                  <option value="">
                    Todos los estados
                  </option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="A tiempo">A tiempo</option>
                  <option value="Retardo">Retardo</option>
                  <option value="Incompleta">Incompleta</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setBusquedaAsistencia("");
                    setFiltroEstadoAsistencia("");
                    setFiltroPracticanteAsistencia("");
                    setFiltroFechaAsistencia("");
                  }}
                  disabled={
                    !busquedaAsistencia &&
                    !filtroEstadoAsistencia &&
                    !filtroPracticanteAsistencia &&
                    !filtroFechaAsistencia
                  }
                >
                  Limpiar filtros
                </button>
              </div>

              <p className="panel-description">
                Mostrando{" "}
                <strong>
                  {asistenciasFiltradas.length}
                </strong>{" "}
                de <strong>{asistencias.length}</strong>{" "}
                registros.
              </p>

              {mostrandoAsistenciaHistorica && (
                <form
                  onSubmit={
                    guardarAsistenciaHistorica
                  }
                  className="admin-inline-form asistencia-edit-form"
                  noValidate
                >
                  <div className="admin-form-header">
                    <div>
                      <h4 className="admin-form-title">
                        Registrar asistencia anterior
                      </h4>

                      <small>
                        Captura una entrada y salida de
                        una fecha pasada. El horario se
                        seleccionará automáticamente
                        según el día.
                      </small>
                    </div>

                    <button
                      type="button"
                      onClick={
                        cancelarAsistenciaHistorica
                      }
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="admin-form-grid">
                    <label>
                      Practicante *
                      <select
                        name="id_practicante"
                        value={
                          formAsistenciaHistorica
                            .id_practicante
                        }
                        onChange={
                          cambiarCampoAsistenciaHistorica
                        }
                        required
                      >
                        <option value="">
                          Selecciona un practicante
                        </option>

                        {practicantes.map(
                          (practicante) => (
                            <option
                              key={
                                practicante.id_practicante
                              }
                              value={
                                practicante.id_practicante
                              }
                            >
                              {[
                                practicante.nombre,
                                practicante.apellido_paterno,
                                practicante.apellido_materno,
                              ]
                                .filter(Boolean)
                                .join(" ")}

                              {practicante.matricula
                                ? ` - ${practicante.matricula}`
                                : ""}
                            </option>
                          )
                        )}
                      </select>
                    </label>

                    <label>
                      Fecha *
                      <input
                        type="date"
                        name="fecha"
                        max={new Date(
                          Date.now() -
                            new Date().getTimezoneOffset() *
                              60000
                        )
                          .toISOString()
                          .slice(0, 10)}
                        value={
                          formAsistenciaHistorica.fecha
                        }
                        onChange={
                          cambiarCampoAsistenciaHistorica
                        }
                        required
                      />
                    </label>

                    <label>
                      Hora de entrada *
                      <input
                        type="time"
                        name="hora_entrada_real"
                        value={
                          formAsistenciaHistorica
                            .hora_entrada_real
                        }
                        onChange={
                          cambiarCampoAsistenciaHistorica
                        }
                        required
                      />
                    </label>

                    <label>
                      Hora de salida *
                      <input
                        type="time"
                        name="hora_salida_real"
                        value={
                          formAsistenciaHistorica
                            .hora_salida_real
                        }
                        onChange={
                          cambiarCampoAsistenciaHistorica
                        }
                        required
                      />
                    </label>


                  </div>

                  <div className="asistencia-form-footer">
                    <button
                      type="submit"
                      disabled={
                        guardandoAsistenciaHistorica
                      }
                    >
                      {guardandoAsistenciaHistorica
                        ? "Registrando..."
                        : "Registrar asistencia"}
                    </button>

                    <span>
                      Tiempo real:{" "}
                      <strong>
                        {calcularTiempoReal(
                          formAsistenciaHistorica
                            .hora_entrada_real,
                          formAsistenciaHistorica
                            .hora_salida_real
                        )}
                      </strong>
                    </span>
                  </div>
                </form>
              )}

              {editandoAsistencia && (
                <form
                  onSubmit={guardarAsistencia}
                  className="admin-inline-form asistencia-edit-form"
                >
                  <div className="admin-form-header">
                    <div>
                      <h4 className="admin-form-title">
                        Editar asistencia
                      </h4>
                      <small>
                        {editandoAsistencia.nombre_practicante ||
                          "Practicante"}{" "}
                        ·{" "}
                        {formatearFecha(
                          editandoAsistencia.fecha
                        )}
                      </small>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setEditandoAsistencia(null)
                      }
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="admin-form-grid">
                    <label>
                      Entrada real
                      <input
                        type="time"
                        name="hora_entrada_real"
                        value={
                          editandoAsistencia.hora_entrada_real ||
                          ""
                        }
                        onChange={cambiarCampoAsistencia}
                      />
                    </label>

                    <label>
                      Salida real
                      <input
                        type="time"
                        name="hora_salida_real"
                        value={
                          editandoAsistencia.hora_salida_real ||
                          ""
                        }
                        onChange={cambiarCampoAsistencia}
                      />
                    </label>

                    <label className="admin-form-full">
                      Observaciones
                      <textarea
                        name="observaciones"
                        rows="4"
                        value={
                          editandoAsistencia.observaciones ||
                          ""
                        }
                        onChange={cambiarCampoAsistencia}
                        className="admin-textarea"
                      />
                    </label>
                  </div>

                  <div className="asistencia-form-footer">
                    <button
                      type="submit"
                      disabled={guardandoAsistencia}
                    >
                      {guardandoAsistencia
                        ? "Guardando..."
                        : "Guardar cambios"}
                    </button>

                    <span>
                      Tiempo real calculado:{" "}
                      <strong>
                        {calcularTiempoReal(
                          editandoAsistencia.hora_entrada_real,
                          editandoAsistencia.hora_salida_real
                        )}
                      </strong>
                    </span>
                  </div>
                </form>
              )}

              {cargandoAsistencias ? (
                <p>Cargando asistencias...</p>
              ) : asistenciasFiltradas.length === 0 ? (
                <p>
                  No se encontraron registros de asistencia.
                </p>
              ) : (
                <div className="admin-table-wrapper table-scroll-guide asistencia-admin-table-wrapper">
                  <table className="admin-table asistencia-table asistencia-admin-responsive-table">
                    <thead>
                      <tr>
                        {[
                          "Practicante",
                          "Matrícula",
                          "Fecha",
                          "Entrada esperada",
                          "Entrada real",
                          "Salida esperada",
                          "Salida real",
                          "Tiempo real",
                          "Horas contabilizadas",
                          "Estado",
                          "Acciones",
                        ].map((titulo) => (
                          <th
                            key={titulo}
                            className="admin-table-heading"
                          >
                            {titulo === "Horas contabilizadas" ? (
                              <>
                                Horas
                                <br />
                                contabilizadas
                              </>
                            ) : (
                              titulo
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {asistenciasFiltradas.map(
                        (asistencia) => (
                          <tr
                            key={asistencia.id_asistencia}
                          >
                            <td
                              className="admin-table-cell"
                             data-label="Practicante">
                              <strong>
                                {asistencia.nombre_practicante ||
                                  "—"}
                              </strong>
                              {asistencia.carrera && (
                                <div>
                                  <small>
                                    {asistencia.carrera}
                                  </small>
                                </div>
                              )}
                            </td>

                            <td
                              className="admin-table-cell"
                             data-label="Matrícula">
                              {asistencia.matricula || "—"}
                            </td>

                            <td
                              className="admin-table-cell"
                             data-label="Fecha">
                              {formatearFecha(
                                asistencia.fecha
                              )}
                            </td>

                            <td
                              className="admin-table-cell"
                             data-label="Entrada esperada">
                              {formatearHora(
                                asistencia.hora_entrada_esperada
                              )}
                            </td>

                            <td
                              className="admin-table-cell"
                             data-label="Entrada real">
                              {formatearHora(
                                asistencia.hora_entrada_real
                              )}
                            </td>

                            <td
                              className="admin-table-cell"
                             data-label="Salida esperada">
                              {formatearHora(
                                asistencia.hora_salida_esperada
                              )}
                            </td>

                            <td
                              className="admin-table-cell"
                             data-label="Salida real">
                              {formatearHora(
                                asistencia.hora_salida_real
                              )}
                            </td>

                            <td
                              className="admin-table-cell"
                             data-label="Tiempo real">
                              {calcularTiempoReal(
                                asistencia.hora_entrada_real,
                                asistencia.hora_salida_real
                              )}
                            </td>

                            <td
                              className="admin-table-cell"
                             data-label="Horas contabilizadas">
                              {asistencia.horas_contabilizadas !==
                              null &&
                              asistencia.horas_contabilizadas !==
                                undefined
                                ? Number(
                                    asistencia.horas_contabilizadas
                                  ).toFixed(2)
                                : "—"}
                            </td>

                            <td
                              className="admin-table-cell"
                             data-label="Estado">
                              <span
                                className={`attendance-status ${
                                  asistencia.estado === "A tiempo"
                                    ? "attendance-status-ontime"
                                    : asistencia.estado === "Retardo"
                                    ? "attendance-status-late"
                                    : asistencia.estado === "Incompleta"
                                    ? "attendance-status-incomplete"
                                    : "attendance-status-pending"
                                }`}
                              >
                                {asistencia.estado || "Pendiente"}
                              </span>
                            </td>

                            <td
                              className="admin-table-cell"
                             data-label="Acciones">
                              <div className="admin-actions">
                                <button
                                  type="button"
                                  onClick={() =>
                                    abrirEdicionAsistencia(
                                      asistencia
                                    )
                                  }
                                >
                                  Editar
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
  );
}

export default AsistenciaAdmin;