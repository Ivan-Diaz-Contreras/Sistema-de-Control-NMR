function CarrerasAdmin({abrirEdicionCarrera, abrirNuevaCarrera, cambiarEstadoCarrera, cancelarEdicionCarrera, cargandoCarreras, carreras, editandoCarrera, guardandoCarrera, guardarCarrera, mostrandoFormularioCarrera, nombreCarrera, practicantes, setNombreCarrera}) {
  return (
          <>
            <style>{`
              /* Responsive exclusivo de Carreras Admin.
                 La vista de escritorio conserva la tabla actual. */
              @media (max-width: 650px) {
                .carreras-admin-table-wrapper {
                  overflow: visible !important;
                }

                .carreras-admin-responsive-table,
                .carreras-admin-responsive-table tbody,
                .carreras-admin-responsive-table tr,
                .carreras-admin-responsive-table td {
                  display: block;
                  width: 100% !important;
                  min-width: 0 !important;
                  max-width: 100% !important;
                }

                .carreras-admin-responsive-table {
                  min-width: 0 !important;
                  table-layout: auto !important;
                  border-collapse: separate !important;
                  border-spacing: 0 !important;
                }

                .carreras-admin-responsive-table thead {
                  display: none;
                }

                .carreras-admin-responsive-table tbody {
                  display: grid;
                  gap: 14px;
                }

                .carreras-admin-responsive-table tr {
                  overflow: hidden;
                  border: 1px solid #e1e6ee;
                  border-radius: 12px;
                  background: #ffffff;
                  box-shadow: 0 2px 8px rgba(16, 28, 54, 0.04);
                }

                .carreras-admin-responsive-table td {
                  display: grid !important;
                  grid-template-columns: 80px minmax(0, 1fr);
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

                .carreras-admin-responsive-table td::before {
                  content: attr(data-label);
                  color: #66758c;
                  font-size: 11px;
                  font-weight: 700;
                  line-height: 1.35;
                }

                .carreras-admin-responsive-table td:last-child {
                  border-bottom: none !important;
                }

                .carreras-admin-responsive-table td[data-label="Acciones"] > div {
                  display: flex !important;
                  gap: 8px !important;
                  flex-wrap: wrap !important;
                }

                .carreras-admin-responsive-table td[data-label="Acciones"] button {
                  min-height: 38px;
                }
              }

              @media (max-width: 380px) {
                .carreras-admin-responsive-table td {
                  grid-template-columns: 1fr;
                  gap: 4px;
                }

                .carreras-admin-responsive-table td[data-label="Acciones"] > div {
                  display: grid !important;
                  grid-template-columns: 1fr !important;
                }

                .carreras-admin-responsive-table td[data-label="Acciones"] button {
                  width: 100%;
                }
              }
            `}</style>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="section-label">
                    CONFIGURACIÓN
                  </p>
                  <h3>Administración de carreras</h3>
                </div>

                <button
                  type="button"
                  onClick={abrirNuevaCarrera}
                >
                  + Nueva carrera
                </button>
              </div>

              <p className="panel-description">
                Crea, edita, activa o desactiva las carreras
                disponibles para los practicantes.
              </p>

              {mostrandoFormularioCarrera && (
                <form
                  onSubmit={guardarCarrera}
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
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <h4 style={{ margin: 0 }}>
                      {editandoCarrera
                        ? "Editar carrera"
                        : "Nueva carrera"}
                    </h4>

                    <button
                      type="button"
                      onClick={cancelarEdicionCarrera}
                    >
                      Cancelar
                    </button>
                  </div>

                  <label>
                    Nombre de la carrera
                    <input
                      type="text"
                      value={nombreCarrera}
                      onChange={(e) =>
                        setNombreCarrera(e.target.value)
                      }
                      placeholder="Ej. Ingeniería en Sistemas Computacionales"
                      required
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        marginTop: "8px",
                      }}
                    />
                  </label>

                  <div style={{ marginTop: "18px" }}>
                    <button
                      type="submit"
                      disabled={guardandoCarrera}
                    >
                      {guardandoCarrera
                        ? "Guardando..."
                        : editandoCarrera
                          ? "Actualizar carrera"
                          : "Crear carrera"}
                    </button>
                  </div>
                </form>
              )}

              {cargandoCarreras ? (
                <p>Cargando carreras...</p>
              ) : carreras.length === 0 ? (
                <p>
                  Todavía no hay carreras registradas.
                </p>
              ) : (
                <div
                  className="carreras-admin-table-wrapper"
                  style={{ overflowX: "auto" }}
                >
                  <table
                    className="carreras-admin-responsive-table"
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: "650px",
                    }}
                  >
                    <thead>
                      <tr>
                        {[
                          "ID",
                          "Carrera",
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
                      {carreras.map((carrera) => {
                        const activa = Number(
                          carrera.activa ??
                            carrera.activo ??
                            1
                        );

                        return (
                          <tr key={carrera.id_carrera}>
                            <td
                              data-label="ID"
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              {carrera.id_carrera}
                            </td>

                            <td
                              data-label="Carrera"
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              <strong>
                                {carrera.nombre}
                              </strong>
                            </td>

                            <td
                              data-label="Estado"
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              {activa === 1
                                ? "Activa"
                                : "Inactiva"}
                            </td>

                            <td
                              data-label="Acciones"
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
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
                                    abrirEdicionCarrera(
                                      carrera
                                    )
                                  }
                                >
                                  Editar
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    cambiarEstadoCarrera(
                                      carrera
                                    )
                                  }
                                >
                                  {activa === 1
                                    ? "Desactivar"
                                    : "Activar"}
                                </button>
                              </div>
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

export default CarrerasAdmin;
