function AsistenciaAdmin({
  abrirEdicionAsistencia,
  asistencias,
  asistenciasFiltradas,
  busquedaAsistencia,
  calcularTiempoReal,
  cambiarCampoAsistencia,
  cargandoAsistencias,
  cargarAsistencias,
  editandoAsistencia,
  filtroEstadoAsistencia,
  filtroPracticanteAsistencia,
  filtroFechaAsistencia,
  formatearFecha,
  formatearHora,
  guardandoAsistencia,
  guardarAsistencia,
  practicantes,
  setBusquedaAsistencia,
  setEditandoAsistencia,
  setFiltroEstadoAsistencia,
  setFiltroPracticanteAsistencia,
  setFiltroFechaAsistencia,
}) {
  return (
          <>
            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="section-label">
                    CONTROL DE ASISTENCIA
                  </p>
                  <h3>Registros de entrada y salida</h3>
                </div>

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

              <p className="panel-description">
                Consulta las entradas y salidas reales de los
                practicantes. Al corregir una asistencia, las horas
                contabilizadas se recalculan automáticamente con un
                máximo de 3 horas por día.
              </p>

              <div className="asistencia-toolbar">
                <input
                  type="text"
                  value={busquedaAsistencia}
                  onChange={(e) =>
                    setBusquedaAsistencia(e.target.value)
                  }
                  placeholder="Buscar por nombre, matr?cula o carrera"
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
                        ? ` ? ${practicante.matricula}`
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
                <div className="admin-table-wrapper">
                  <table className="admin-table asistencia-table">
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
                            {titulo}
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
                            >
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
                            >
                              {asistencia.matricula || "—"}
                            </td>

                            <td
                              className="admin-table-cell"
                            >
                              {formatearFecha(
                                asistencia.fecha
                              )}
                            </td>

                            <td
                              className="admin-table-cell"
                            >
                              {formatearHora(
                                asistencia.hora_entrada_esperada
                              )}
                            </td>

                            <td
                              className="admin-table-cell"
                            >
                              {formatearHora(
                                asistencia.hora_entrada_real
                              )}
                            </td>

                            <td
                              className="admin-table-cell"
                            >
                              {formatearHora(
                                asistencia.hora_salida_esperada
                              )}
                            </td>

                            <td
                              className="admin-table-cell"
                            >
                              {formatearHora(
                                asistencia.hora_salida_real
                              )}
                            </td>

                            <td
                              className="admin-table-cell"
                            >
                              {calcularTiempoReal(
                                asistencia.hora_entrada_real,
                                asistencia.hora_salida_real
                              )}
                            </td>

                            <td
                              className="admin-table-cell"
                            >
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
                            >
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
                            >
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