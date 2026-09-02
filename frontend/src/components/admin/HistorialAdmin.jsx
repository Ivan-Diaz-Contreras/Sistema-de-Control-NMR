function HistorialAdmin({accionesHistorial, busquedaHistorial, cargandoHistorial, cargarHistorial, filtroAccionHistorial, formatearFechaHora, historial, historialFiltrado, mensaje, obtenerValorHistorial, setBusquedaHistorial, setFiltroAccionHistorial, usuario}) {
  return (
          <>
            <style>{`
              /*
               * Responsive exclusivo del Historial.
               * En escritorio se conserva la tabla actual.
               */
              @media (max-width: 650px) {
                .historial-admin-filtros {
                  display: grid !important;
                  grid-template-columns: 1fr !important;
                  gap: 10px !important;
                  width: 100%;
                }

                .historial-admin-filtros input,
                .historial-admin-filtros select {
                  width: 100% !important;
                  min-width: 0 !important;
                  box-sizing: border-box;
                }

                .historial-admin-table-wrapper {
                  overflow: visible !important;
                }

                .historial-admin-responsive-table,
                .historial-admin-responsive-table tbody,
                .historial-admin-responsive-table tr,
                .historial-admin-responsive-table td {
                  display: block;
                  width: 100% !important;
                  min-width: 0 !important;
                  max-width: 100% !important;
                }

                .historial-admin-responsive-table {
                  min-width: 0 !important;
                  table-layout: auto !important;
                  border-collapse: separate !important;
                  border-spacing: 0 !important;
                }

                .historial-admin-responsive-table thead {
                  display: none;
                }

                .historial-admin-responsive-table tbody {
                  display: grid;
                  gap: 14px;
                }

                .historial-admin-responsive-table tr {
                  overflow: hidden;
                  border: 1px solid #e1e6ee;
                  border-radius: 12px;
                  background: #ffffff;
                  box-shadow: 0 2px 8px rgba(16, 28, 54, 0.04);
                }

                .historial-admin-responsive-table td {
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
                  text-align: left !important;
                }

                .historial-admin-responsive-table td::before {
                  content: attr(data-label);
                  color: #66758c;
                  font-size: 11px;
                  font-weight: 700;
                  line-height: 1.35;
                }

                .historial-admin-responsive-table td:last-child {
                  border-bottom: none !important;
                }

                .historial-admin-responsive-table td strong,
                .historial-admin-responsive-table td span,
                .historial-admin-responsive-table td div {
                  min-width: 0;
                  max-width: 100%;
                  word-break: normal !important;
                  overflow-wrap: break-word !important;
                }
              }

              @media (max-width: 380px) {
                .historial-admin-responsive-table td {
                  grid-template-columns: 1fr;
                  gap: 4px;
                }
              }
            `}</style>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="section-label">
                    ACTIVIDAD
                  </p>
                  <h3>Historial de actividades</h3>
                </div>

                <button
                  type="button"
                  onClick={cargarHistorial}
                  disabled={cargandoHistorial}
                >
                  {cargandoHistorial
                    ? "Actualizando..."
                    : "Actualizar"}
                </button>
              </div>

              <p className="panel-description">
                Consulta los cambios y actividades realizadas
                dentro del sistema.
              </p>

              <div
                className="historial-admin-filtros"
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "20px",
                }}
              >
                <input
                  type="text"
                  value={busquedaHistorial}
                  onChange={(e) =>
                    setBusquedaHistorial(e.target.value)
                  }
                  placeholder="Buscar en el historial"
                  style={{
                    flex: "1 1 320px",
                    padding: "12px",
                    border: "1px solid #d8dee9",
                    borderRadius: "8px",
                  }}
                />

                <select
                  value={filtroAccionHistorial}
                  onChange={(e) =>
                    setFiltroAccionHistorial(e.target.value)
                  }
                  style={{
                    minWidth: "220px",
                    padding: "12px",
                    border: "1px solid #d8dee9",
                    borderRadius: "8px",
                  }}
                >
                  <option value="">Todas las acciones</option>

                  {accionesHistorial.map((accion) => (
                    <option key={accion} value={accion}>
                      {accion}
                    </option>
                  ))}
                </select>
              </div>

              {cargandoHistorial ? (
                <p>Cargando historial...</p>
              ) : historialFiltrado.length === 0 ? (
                <p>No se encontraron actividades registradas.</p>
              ) : (
                <div
                  className="historial-admin-table-wrapper"
                  style={{ overflowX: "auto" }}
                >
                  <table
                    className="historial-admin-responsive-table"
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: "850px",
                    }}
                  >
                    <thead>
                      <tr>
                        {[
                          "No.",
                          "Usuario",
                          "Acción",
                          "Descripción",
                          "Fecha y hora",
                        ].map((titulo) => (
                          <th
                            key={titulo}
                            style={{
                              textAlign: "left",
                              padding: "12px",
                              borderBottom: "1px solid #d8dee9",
                            }}
                          >
                            {titulo}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {historialFiltrado.map((registro, indice) => {
                        const idInterno =
                          obtenerValorHistorial(registro, [
                            "id_historial",
                            "id_actividad",
                            "id",
                          ]);

                        const indiceGlobal =
                          historial.findIndex((item) => {
                            const idItem =
                              obtenerValorHistorial(item, [
                                "id_historial",
                                "id_actividad",
                                "id",
                              ]);

                            return (
                              idInterno &&
                              String(idItem) ===
                                String(idInterno)
                            );
                          });

                        const numeroVisual =
                          indiceGlobal >= 0
                            ? historial.length -
                              indiceGlobal
                            : historialFiltrado.length -
                              indice;

                        const usuarioHistorial =
                          obtenerValorHistorial(registro, [
                            "usuario",
                            "nombre_usuario",
                            "administrador",
                            "nombre",
                            "correo",
                          ]) || "Sistema";

                        const accion =
                          obtenerValorHistorial(registro, [
                            "accion",
                            "tipo_accion",
                            "actividad",
                            "tipo_actividad",
                          ]) || "Actividad";

                        const descripcion =
                          obtenerValorHistorial(registro, [
                            "descripcion",
                            "detalle",
                            "detalles",
                            "mensaje",
                          ]) || "—";

                        const fecha = obtenerValorHistorial(
                          registro,
                          [
                            "fecha",
                            "fecha_hora",
                            "fecha_creacion",
                            "created_at",
                          ]
                        );

                        return (
                          <tr
                            key={
                              idInterno ||
                              `historial-${indice}`
                            }
                          >
                            <td
                              data-label="No."
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                              title={
                                idInterno
                                  ? `ID interno: ${idInterno}`
                                  : "Sin ID interno"
                              }
                            >
                              {numeroVisual}
                            </td>

                            <td
                              data-label="Usuario"
                              style={{
                                padding: "12px",
                                borderBottom: "1px solid #edf0f5",
                              }}
                            >
                              {usuarioHistorial}
                            </td>

                            <td
                              data-label="Acción"
                              style={{
                                padding: "12px",
                                borderBottom: "1px solid #edf0f5",
                              }}
                            >
                              <strong>{accion}</strong>
                            </td>

                            <td
                              data-label="Descripción"
                              style={{
                                padding: "12px",
                                borderBottom: "1px solid #edf0f5",
                              }}
                            >
                              {descripcion}
                            </td>

                            <td
                              data-label="Fecha y hora"
                              style={{
                                padding: "12px",
                                borderBottom: "1px solid #edf0f5",
                              }}
                            >
                              {fecha
                                ? formatearFechaHora(fecha)
                                : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
  );
}

export default HistorialAdmin;
