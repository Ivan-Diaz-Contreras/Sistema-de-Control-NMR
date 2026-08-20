function HistorialAdmin({accionesHistorial, busquedaHistorial, cargandoHistorial, cargarHistorial, filtroAccionHistorial, formatearFechaHora, historial, historialFiltrado, mensaje, obtenerValorHistorial, setBusquedaHistorial, setFiltroAccionHistorial, usuario}) {
  return (
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
              <div style={{ overflowX: "auto" }}>
                <table
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
                          <td style={{ padding: "12px", borderBottom: "1px solid #edf0f5" }}>
                            {usuarioHistorial}
                          </td>
                          <td style={{ padding: "12px", borderBottom: "1px solid #edf0f5" }}>
                            <strong>{accion}</strong>
                          </td>
                          <td style={{ padding: "12px", borderBottom: "1px solid #edf0f5" }}>
                            {descripcion}
                          </td>
                          <td style={{ padding: "12px", borderBottom: "1px solid #edf0f5" }}>
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
  );
}

export default HistorialAdmin;
