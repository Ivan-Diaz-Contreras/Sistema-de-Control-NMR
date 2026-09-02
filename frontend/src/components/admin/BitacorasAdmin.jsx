function BitacorasAdmin({abrirArchivoBitacoraAdmin, abrirEdicionActividad, abrirNuevaActividad, actividadInicial, actividadesBitacora, busquedaEntrega, cambiarCampoActividad, cambiarEstadoActividad, cargandoActividades, cargandoEntregas, cargarEntregasBitacoras, editandoActividad, eliminarActividadBitacora, entregasFiltradas, filtroEstadoBitacora, formActividad, formatearFecha, formatearFechaHora, guardandoActividad, guardarActividadBitacora, mostrandoFormularioActividad, practicantes, revisandoBitacora, revisarEntregaBitacora, setBusquedaEntrega, setEditandoActividad, setFiltroEstadoBitacora, setFormActividad, setMostrandoFormularioActividad}) {
  const obtenerClaseEstadoBitacora = (estado) => {
    const estadoNormalizado = String(
      estado || "Pendiente"
    )
      .trim()
      .toLowerCase();

    if (
      estadoNormalizado === "aprobada" ||
      estadoNormalizado === "aceptada"
    ) {
      return "bitacora-status-approved";
    }

    if (estadoNormalizado === "rechazada") {
      return "bitacora-status-rejected";
    }

    return "bitacora-status-pending";
  };

  return (
          <>

      <style>{`
        /* Responsive exclusivo de Bitácoras Admin.
           En escritorio se conserva la tabla actual. */
        @media (max-width: 650px) {
          .bitacoras-admin-tabla-wrapper {
            overflow: visible !important;
          }

          .bitacoras-admin-tabla-wrapper.table-scroll-guide::before {
            display: none !important;
          }

          .bitacoras-admin-table,
          .bitacoras-admin-table tbody,
          .bitacoras-admin-table tr,
          .bitacoras-admin-table td {
            display: block;
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
          }

          .bitacoras-admin-table {
            min-width: 0 !important;
            table-layout: auto !important;
            border-collapse: separate !important;
            border-spacing: 0 !important;
          }

          .bitacoras-admin-table thead {
            display: none;
          }

          .bitacoras-admin-table tbody {
            display: grid;
            gap: 14px;
          }

          .bitacoras-admin-table tr {
            overflow: hidden;
            border: 1px solid #e1e6ee;
            border-radius: 12px;
            background: #ffffff;
            box-shadow: 0 2px 8px rgba(16, 28, 54, 0.04);
          }

          .bitacoras-admin-table td {
            display: grid !important;
            grid-template-columns: 105px minmax(0, 1fr);
            gap: 12px;
            align-items: start;
            box-sizing: border-box;
            padding: 10px 12px !important;
            border-bottom: 1px solid #edf0f5 !important;
            white-space: normal !important;
            word-break: normal !important;
            overflow-wrap: break-word !important;
          }

          .bitacoras-admin-table td::before {
            content: attr(data-label);
            color: #66758c;
            font-size: 11px;
            font-weight: 700;
            line-height: 1.35;
          }

          .bitacoras-admin-table td:last-child {
            border-bottom: none !important;
          }

          .bitacoras-admin-table td > div,
          .bitacoras-admin-table td > span,
          .bitacoras-admin-table td strong {
            min-width: 0;
            max-width: 100%;
            word-break: normal !important;
            overflow-wrap: break-word !important;
          }

          .bitacoras-admin-table td[data-label="Acciones"] > div {
            display: flex !important;
            gap: 8px !important;
            flex-wrap: wrap !important;
          }

          .bitacoras-admin-table td[data-label="Acciones"] button {
            min-height: 38px;
          }
        }

        @media (max-width: 380px) {
          .bitacoras-admin-table td {
            grid-template-columns: 1fr;
            gap: 4px;
          }

          .bitacoras-admin-table td[data-label="Acciones"] > div {
            display: grid !important;
            grid-template-columns: 1fr !important;
          }

          .bitacoras-admin-table td[data-label="Acciones"] button {
            width: 100%;
          }
        }
      `}</style>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="section-label">
                    ADMINISTRACIÓN
                  </p>
                  <h3>Actividades semanales de bitácora</h3>
                </div>

                <button
                  type="button"
                  onClick={abrirNuevaActividad}
                >
                  + Nueva actividad
                </button>
              </div>

              <p className="panel-description">
                Publica las actividades que deberán realizar los
                practicantes cada semana. Puedes crear, editar,
                activar, desactivar o eliminar una actividad.
              </p>

              {mostrandoFormularioActividad && (
                <form
                  onSubmit={guardarActividadBitacora}
                  style={{
                    marginBottom: "24px",
                    padding: "18px",
                    border: "1px solid #e1e6ef",
                    borderRadius: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "12px",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <h4 style={{ margin: 0 }}>
                      {editandoActividad
                        ? "Editar actividad"
                        : "Nueva actividad semanal"}
                    </h4>

                    <button
                      type="button"
                      onClick={() => {
                        setMostrandoFormularioActividad(false);
                        setEditandoActividad(null);
                        setFormActividad(actividadInicial);
                      }}
                    >
                      Cancelar
                    </button>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(230px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    <label>
                      Número de semana
                      <input
                        type="number"
                        min="1"
                        step="1"
                        name="numero_semana"
                        value={formActividad.numero_semana}
                        onChange={cambiarCampoActividad}
                        required
                      />
                    </label>

                    <label>
                      Título
                      <input
                        type="text"
                        name="titulo"
                        value={formActividad.titulo}
                        onChange={cambiarCampoActividad}
                        placeholder="Ej. Bitácora semanal 3"
                        required
                      />
                    </label>

                    <label>
                      Fecha de inicio
                      <input
                        type="date"
                        name="fecha_inicio"
                        value={formActividad.fecha_inicio}
                        onChange={cambiarCampoActividad}
                        required
                      />
                    </label>

                    <label>
                      Fecha de fin
                      <input
                        type="date"
                        name="fecha_fin"
                        value={formActividad.fecha_fin}
                        onChange={cambiarCampoActividad}
                        required
                      />
                    </label>

                    <label>
                      Fecha límite
                      <input
                        type="datetime-local"
                        name="fecha_limite"
                        value={formActividad.fecha_limite}
                        onChange={cambiarCampoActividad}
                        required
                      />
                    </label>

                    <label
                      style={{
                        gridColumn: "1 / -1",
                      }}
                    >
                      Descripción
                      <textarea
                        name="descripcion"
                        value={formActividad.descripcion}
                        onChange={cambiarCampoActividad}
                        placeholder="Describe las actividades o instrucciones de la semana."
                        rows="5"
                        required
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          resize: "vertical",
                        }}
                      />
                    </label>
                  </div>

                  <div style={{ marginTop: "18px" }}>
                    <button
                      type="submit"
                      disabled={guardandoActividad}
                    >
                      {guardandoActividad
                        ? "Guardando..."
                        : editandoActividad
                          ? "Actualizar actividad"
                          : "Publicar actividad"}
                    </button>
                  </div>
                </form>
              )}

              {cargandoActividades ? (
                <p>Cargando actividades...</p>
              ) : actividadesBitacora.length === 0 ? (
                <p>
                  Todavía no hay actividades semanales registradas.
                </p>
              ) : (
                <div className="table-scroll-guide bitacoras-admin-tabla-wrapper bitacoras-actividades-wrapper" style={{ overflowX: "auto" }}>
                  <table
                    className="bitacoras-admin-table bitacoras-actividades-table"
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: "1050px",
                    }}
                  >
                    <thead>
                      <tr>
                        {[
                          "Semana",
                          "Título",
                          "Descripción",
                          "Inicio",
                          "Fin",
                          "Fecha límite",
                          "Estado",
                          "Acciones",
                        ].map((titulo) => (
                          <th
                            key={titulo}
                            style={{
                              textAlign: "left",
                              padding: "12px",
                              borderBottom:
                                "1px solid #d8dee9",
                            }}
                          >
                            {titulo}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {actividadesBitacora.map((actividad) => (
                        <tr key={actividad.id_actividad}>
                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                           data-label="Semana">
                            {actividad.numero_semana}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                           data-label="Título">
                            <strong>{actividad.titulo}</strong>
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                              maxWidth: "320px",
                              whiteSpace: "normal",
                            }}
                           data-label="Descripción">
                            {actividad.descripcion}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                           data-label="Inicio">
                            {formatearFecha(
                              actividad.fecha_inicio
                            )}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                           data-label="Fin">
                            {formatearFecha(
                              actividad.fecha_fin
                            )}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                           data-label="Fecha límite">
                            {formatearFechaHora(
                              actividad.fecha_limite
                            )}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                           data-label="Estado">
                            {Number(actividad.activa) === 1
                              ? "Activa"
                              : "Inactiva"}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                           data-label="Acciones">
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  abrirEdicionActividad(
                                    actividad
                                  )
                                }
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  cambiarEstadoActividad(
                                    actividad
                                  )
                                }
                              >
                                {Number(actividad.activa) === 1
                                  ? "Desactivar"
                                  : "Activar"}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  eliminarActividadBitacora(
                                    actividad
                                  )
                                }
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="section-label">
                    ENTREGAS
                  </p>
                  <h3>Bitácoras de practicantes</h3>
                </div>

                <button
                  type="button"
                  onClick={cargarEntregasBitacoras}
                  disabled={cargandoEntregas}
                >
                  {cargandoEntregas
                    ? "Actualizando..."
                    : "Actualizar entregas"}
                </button>
              </div>

              <p className="panel-description">
                Consulta las bitácoras enviadas por los practicantes,
                abre el PDF y aprueba o rechaza cada entrega.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "20px",
                }}
              >
                <input
                  type="text"
                  value={busquedaEntrega}
                  onChange={(e) =>
                    setBusquedaEntrega(e.target.value)
                  }
                  placeholder="Buscar por practicante, correo, matrícula, semana o archivo"
                  style={{
                    flex: "1 1 360px",
                    padding: "12px",
                    border: "1px solid #d8dee9",
                    borderRadius: "8px",
                  }}
                />

                <select
                  value={filtroEstadoBitacora}
                  onChange={(e) =>
                    setFiltroEstadoBitacora(
                      e.target.value
                    )
                  }
                  style={{
                    minWidth: "220px",
                    padding: "12px",
                    border: "1px solid #d8dee9",
                    borderRadius: "8px",
                  }}
                >
                  <option value="">
                    Todos los estados
                  </option>
                  <option value="Pendiente">
                    Pendientes
                  </option>
                  <option value="Aprobada">
                    Aprobadas
                  </option>
                  <option value="Rechazada">
                    Rechazadas
                  </option>
                </select>
              </div>

              {cargandoEntregas ? (
                <p>
                  Cargando entregas de bitácoras...
                </p>
              ) : entregasFiltradas.length === 0 ? (
                <p>
                  No se encontraron entregas de bitácoras.
                </p>
              ) : (
                <div
                  className="table-scroll-guide bitacoras-admin-tabla-wrapper bitacoras-entregas-wrapper"
                  style={{
                    overflowX: "auto",
                  }}
                >
                  <table
                    className="bitacoras-admin-table bitacoras-entregas-table"
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: "1200px",
                    }}
                  >
                    <thead>
                      <tr>
                        {[
                          "Practicante",
                          "Matrícula",
                          "Semana",
                          "Archivo",
                          "Estado",
                          "Fecha de envío",
                          "Observaciones",
                          "Acciones",
                        ].map((titulo) => (
                          <th
                            key={titulo}
                            style={{
                              textAlign: "left",
                              padding: "12px",
                              borderBottom:
                                "1px solid #d8dee9",
                            }}
                          >
                            {titulo}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {entregasFiltradas.map(
                        (entrega) => (
                          <tr
                            key={
                              entrega.id_bitacora
                            }
                          >
                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                             data-label="Practicante">
                              <strong>
                                {
                                  entrega.nombre_practicante
                                }
                              </strong>
                              <div>
                                {
                                  entrega.correo_practicante
                                }
                              </div>
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                             data-label="Matrícula">
                              {entrega.matricula_practicante ||
                                "—"}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                             data-label="Semana">
                              {
                                entrega.numero_semana
                              }
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                             data-label="Archivo">
                              {entrega.nombre_archivo ||
                                "PDF"}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                             data-label="Estado">
                              <span
                                className={[
                                  "bitacora-status",
                                  obtenerClaseEstadoBitacora(
                                    entrega.estado
                                  ),
                                ].join(" ")}
                              >
                                {entrega.estado ||
                                  "Pendiente"}
                              </span>
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                             data-label="Fecha de envío">
                              {formatearFechaHora(
                                entrega.fecha_envio
                              )}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                                maxWidth: "260px",
                                whiteSpace: "normal",
                              }}
                             data-label="Observaciones">
                              {entrega.observaciones ||
                                "—"}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                             data-label="Acciones">
                              <div
                                style={{
                                  display: "flex",
                                  gap: "8px",
                                  flexWrap: "wrap",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    abrirArchivoBitacoraAdmin(
                                      entrega.id_bitacora
                                    )
                                  }
                                >
                                  Ver PDF
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    revisarEntregaBitacora(
                                      entrega,
                                      "Aprobada"
                                    )
                                  }
                                  disabled={
                                    revisandoBitacora ===
                                    entrega.id_bitacora
                                  }
                                >
                                  Aprobar
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    revisarEntregaBitacora(
                                      entrega,
                                      "Rechazada"
                                    )
                                  }
                                  disabled={
                                    revisandoBitacora ===
                                    entrega.id_bitacora
                                  }
                                >
                                  Rechazar
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

export default BitacorasAdmin;
