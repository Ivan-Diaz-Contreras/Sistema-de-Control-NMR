function CarrerasAdmin({abrirEdicionCarrera, abrirNuevaCarrera, cambiarEstadoCarrera, cancelarEdicionCarrera, cargandoCarreras, carreras, editandoCarrera, guardandoCarrera, guardarCarrera, mostrandoFormularioCarrera, nombreCarrera, practicantes, setNombreCarrera}) {
  return (
          <>
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
                <div style={{ overflowX: "auto" }}>
                  <table
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
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              {carrera.id_carrera}
                            </td>

                            <td
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
