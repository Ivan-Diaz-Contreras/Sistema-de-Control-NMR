function PracticantesAdmin({abrirEdicionHorario, abrirEdicionRegistroHoras, abrirNuevoHorario, busqueda, cambiarCampoEdicion, cambiarCampoHorario, cambiarCampoRegistroHoras, cambiarEstadoHorario, cambiarEstadoPracticante, cambiarFiltroCarrera, cancelarHorario, cargandoDetalle, cargandoHorarios, cargandoHoras, cargandoPracticantes, cargarHorasPracticante, carreras, editandoHorario, editandoPracticante, editandoRegistroHoras, eliminarPracticanteAdmin, eliminarRegistroHorasAdmin, filtroCarrera, formHorario, formatearFecha, formatearFechaHora, guardandoHorario, guardandoPracticante, guardandoRegistroHoras, guardarHorario, guardarPracticante, guardarRegistroHoras, horariosPracticante, iniciarEdicion, mostrandoFormularioHorario, practicanteSeleccionado, practicantes, practicantesFiltrados, registrosHoras, setBusqueda, setEditandoPracticante, setEditandoRegistroHoras, setPracticanteSeleccionado, verPracticante}) {
  return (
          <>
            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="section-label">
                    ADMINISTRACIÓN
                  </p>
                  <h3>Practicantes registrados</h3>
                </div>
              </div>

              <p className="panel-description">
                Consulta, filtra y administra los
                practicantes registrados en el sistema.
              </p>

              <div className="practicantes-toolbar">
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) =>
                    setBusqueda(e.target.value)
                  }
                  placeholder="Buscar por nombre, correo, matrícula o carrera"
                  className="practicantes-search"
                />

                <select
                  value={filtroCarrera}
                  onChange={cambiarFiltroCarrera}
                  className="practicantes-filter"
                >
                  <option value="">
                    Todas las carreras
                  </option>

                  {carreras.map((carrera) => (
                    <option
                      key={carrera.id_carrera}
                      value={carrera.id_carrera}
                    >
                      {carrera.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {cargandoPracticantes ? (
                <p>Cargando practicantes...</p>
              ) : practicantesFiltrados.length === 0 ? (
                <p>
                  No se encontraron practicantes.
                </p>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table practicantes-table">
                    <thead>
                      <tr>
                        {[
                          "Nombre",
                          "Correo",
                          "Matrícula",
                          "Carrera",
                          "Universidad",
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
                      {practicantesFiltrados.map(
                        (practicante) => (
                          <tr
                            key={
                              practicante.id_practicante
                            }
                          >
                            <td
                              className="admin-table-cell"
                            >
                              {practicante.nombre}{" "}
                              {
                                practicante.apellido_paterno
                              }{" "}
                              {
                                practicante.apellido_materno ||
                                ""
                              }
                            </td>

                            <td
                              className="admin-table-cell"
                            >
                              {practicante.correo}
                            </td>

                            <td
                              className="admin-table-cell"
                            >
                              {practicante.matricula ||
                                "—"}
                            </td>

                            <td
                              className="admin-table-cell"
                            >
                              {practicante.carrera}
                            </td>

                            <td
                              className="admin-table-cell"
                            >
                              {practicante.universidad ||
                                "—"}
                            </td>

                            <td
                              className="admin-table-cell"
                            >
                              <span
                                className={`admin-status ${
                                  Number(practicante.activo) === 1
                                    ? "admin-status-active"
                                    : "admin-status-inactive"
                                }`}
                              >
                                {Number(practicante.activo) === 1
                                  ? "Activo"
                                  : "Inactivo"}
                              </span>
                            </td>

                            <td
                              className="admin-table-cell"
                            >
                              <div className="admin-actions">
                                <button
                                  type="button"
                                  onClick={() =>
                                    verPracticante(
                                      practicante.id_practicante
                                    )
                                  }
                                >
                                  Ver
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    iniciarEdicion(
                                      practicante.id_practicante
                                    )
                                  }
                                >
                                  Editar
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    cambiarEstadoPracticante(
                                      practicante
                                    )
                                  }
                                >
                                  {Number(
                                    practicante.activo
                                  ) === 1
                                    ? "Desactivar"
                                    : "Activar"}
                                </button>

                                {/*
                                ==========================================
                                ELIMINAR PRACTICANTE
                                Temporalmente oculto en el frontend.
                                La función y la lógica del backend se
                                conservan para poder habilitarla después.
                                ==========================================

                                <button
                                  type="button"
                                  onClick={() =>
                                    eliminarPracticanteAdmin(
                                      practicante
                                    )
                                  }
                                  disabled={
                                    Number(
                                      practicante.activo
                                    ) === 1
                                  }
                                  title={
                                    Number(
                                      practicante.activo
                                    ) === 1
                                      ? "Debes desactivar al practicante antes de eliminarlo"
                                      : "Eliminar practicante"
                                  }
                                  style={{
                                    opacity:
                                      Number(
                                        practicante.activo
                                      ) === 1
                                        ? 0.5
                                        : 1,
                                    cursor:
                                      Number(
                                        practicante.activo
                                      ) === 1
                                        ? "not-allowed"
                                        : "pointer",
                                  }}
                                >
                                  Eliminar
                                </button>
                                */}
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

            {cargandoDetalle && (
              <section className="panel">
                <p>
                  Cargando información del
                  practicante...
                </p>
              </section>
            )}

            {practicanteSeleccionado &&
              !cargandoDetalle && (
                <section className="panel">
                  <div className="panel-header">
                    <div>
                      <p className="section-label">
                        DETALLE
                      </p>
                      <h3>
                        {
                          practicanteSeleccionado.nombre
                        }{" "}
                        {
                          practicanteSeleccionado.apellido_paterno
                        }
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setPracticanteSeleccionado(
                          null
                        )
                      }
                    >
                      Cerrar
                    </button>
                  </div>

                  <div className="profile-list practicante-detail-grid">
                    <div>
                      <span>Correo</span>
                      <strong>
                        {
                          practicanteSeleccionado.correo
                        }
                      </strong>
                    </div>

                    <div>
                      <span>Matrícula</span>
                      <strong>
                        {practicanteSeleccionado.matricula ||
                          "No registrada"}
                      </strong>
                    </div>

                    <div>
                      <span>Carrera</span>
                      <strong>
                        {
                          practicanteSeleccionado.carrera
                        }
                      </strong>
                    </div>

                    <div>
                      <span>Universidad</span>
                      <strong>
                        {practicanteSeleccionado.universidad ||
                          "No registrada"}
                      </strong>
                    </div>

                    <div>
                      <span>Teléfono</span>
                      <strong>
                        {practicanteSeleccionado.telefono ||
                          "No registrado"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Horas requeridas
                      </span>
                      <strong>
                        {
                          practicanteSeleccionado.horas_requeridas
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Horas acumuladas
                      </span>
                      <strong>
                        {
                          practicanteSeleccionado.horas_acumuladas
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Horas restantes
                      </span>
                      <strong>
                        {
                          practicanteSeleccionado.horas_restantes
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Porcentaje de avance
                      </span>
                      <strong>
                        {
                          practicanteSeleccionado.porcentaje_avance
                        }
                        %
                      </strong>
                    </div>
                  </div>
                </section>
              )}

            {practicanteSeleccionado &&
              !cargandoDetalle && (
                <section className="panel">
                  <div className="panel-header">
                    <div>
                      <p className="section-label">
                        HORARIO
                      </p>
                      <h3>Horario semanal</h3>
                    </div>

                    <button
                      type="button"
                      onClick={abrirNuevoHorario}
                    >
                      + Agregar horario
                    </button>
                  </div>

                  <p className="panel-description">
                    Define los días y horas en los que el practicante
                    puede registrar su entrada y salida. Debe existir
                    un horario activo para el día correspondiente.
                  </p>

                  {mostrandoFormularioHorario && (
                    <form
                      onSubmit={guardarHorario}
                      className="admin-inline-form"
                    >
                      <div className="admin-form-header">
                        <h4 className="admin-form-title">
                          {editandoHorario
                            ? "Editar horario"
                            : "Nuevo horario"}
                        </h4>

                        <button
                          type="button"
                          onClick={cancelarHorario}
                        >
                          Cancelar
                        </button>
                      </div>

                      <div className="admin-form-grid admin-form-grid-compact">
                        <label>
                          Día
                          <select
                            name="dia_semana"
                            value={formHorario.dia_semana}
                            onChange={cambiarCampoHorario}
                            required
                          >
                            {[
                              "Lunes",
                              "Martes",
                              "Miércoles",
                              "Jueves",
                              "Viernes",
                              "Sábado",
                              "Domingo",
                            ].map((dia) => (
                              <option key={dia} value={dia}>
                                {dia}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label>
                          Hora de entrada
                          <input
                            type="time"
                            name="hora_entrada"
                            value={formHorario.hora_entrada}
                            onChange={cambiarCampoHorario}
                            required
                          />
                        </label>

                        <label>
                          Hora de salida
                          <input
                            type="time"
                            name="hora_salida"
                            value={formHorario.hora_salida}
                            onChange={cambiarCampoHorario}
                            required
                          />
                        </label>

                        <label>
                          Estado
                          <select
                            name="activo"
                            value={formHorario.activo}
                            onChange={cambiarCampoHorario}
                          >
                            <option value={1}>Activo</option>
                            <option value={0}>Inactivo</option>
                          </select>
                        </label>
                      </div>

                      <div className="admin-form-actions">
                        <button
                          type="submit"
                          disabled={guardandoHorario}
                        >
                          {guardandoHorario
                            ? "Guardando..."
                            : editandoHorario
                              ? "Guardar cambios"
                              : "Crear horario"}
                        </button>
                      </div>
                    </form>
                  )}

                  {cargandoHorarios ? (
                    <p>Cargando horario...</p>
                  ) : horariosPracticante.length === 0 ? (
                    <p>
                      Este practicante todavía no tiene un horario
                      asignado.
                    </p>
                  ) : (
                    <div className="admin-table-wrapper">
                      <table className="admin-table horarios-table">
                        <thead>
                          <tr>
                            {[
                              "Día",
                              "Entrada",
                              "Salida",
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
                          {horariosPracticante.map((horario) => (
                            <tr key={horario.id_horario}>
                              <td
                                className="admin-table-cell"
                              >
                                {horario.dia_semana}
                              </td>

                              <td
                                className="admin-table-cell"
                              >
                                {String(
                                  horario.hora_entrada || ""
                                ).slice(0, 5)}
                              </td>

                              <td
                                className="admin-table-cell"
                              >
                                {String(
                                  horario.hora_salida || ""
                                ).slice(0, 5)}
                              </td>

                              <td
                                className="admin-table-cell"
                              >
                                <span
                                  className={`admin-status ${
                                    Number(horario.activo) === 1
                                      ? "admin-status-active"
                                      : "admin-status-inactive"
                                  }`}
                                >
                                  {Number(horario.activo) === 1
                                    ? "Activo"
                                    : "Inactivo"}
                                </span>
                              </td>

                              <td
                                className="admin-table-cell"
                              >
                                <div className="admin-actions">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      abrirEdicionHorario(horario)
                                    }
                                  >
                                    Editar
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      cambiarEstadoHorario(horario)
                                    }
                                  >
                                    {Number(horario.activo) === 1
                                      ? "Desactivar"
                                      : "Activar"}
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
              )}

            {practicanteSeleccionado &&
              !cargandoDetalle && (
                <section className="panel">
                  <div className="panel-header">
                    <div>
                      <p className="section-label">
                        HORAS
                      </p>
                      <h3>Registros de horas</h3>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        cargarHorasPracticante(
                          practicanteSeleccionado.id_practicante
                        )
                      }
                      disabled={cargandoHoras}
                    >
                      {cargandoHoras
                        ? "Actualizando..."
                        : "Actualizar horas"}
                    </button>
                  </div>

                  <p className="panel-description">
                    Consulta, corrige o elimina los registros de horas
                    de este practicante. Los cambios se reflejarán en
                    sus horas acumuladas y en su porcentaje de avance.
                  </p>

                  {editandoRegistroHoras && (
                    <form
                      onSubmit={guardarRegistroHoras}
                      className="admin-inline-form"
                    >
                      <div className="admin-form-header">
                        <h4 className="admin-form-title">
                          Editar registro de horas
                        </h4>

                        <button
                          type="button"
                          onClick={() =>
                            setEditandoRegistroHoras(null)
                          }
                        >
                          Cancelar
                        </button>
                      </div>

                      <div className="admin-form-grid">
                        <label>
                          Fecha
                          <input
                            type="date"
                            name="fecha"
                            value={
                              editandoRegistroHoras.fecha ||
                              ""
                            }
                            onChange={
                              cambiarCampoRegistroHoras
                            }
                            required
                          />
                        </label>

                        <label>
                          Horas
                          <input
                            type="number"
                            name="horas"
                            min="0.01"
                            step="0.01"
                            value={
                              editandoRegistroHoras.horas ??
                              ""
                            }
                            onChange={
                              cambiarCampoRegistroHoras
                            }
                            required
                          />
                        </label>

                        <label className="admin-form-full">
                          Descripción
                          <textarea
                            name="descripcion"
                            rows="4"
                            value={
                              editandoRegistroHoras.descripcion ||
                              ""
                            }
                            onChange={
                              cambiarCampoRegistroHoras
                            }
                            className="admin-textarea"
                          />
                        </label>
                      </div>

                      <div className="admin-form-actions">
                        <button
                          type="submit"
                          disabled={guardandoRegistroHoras}
                        >
                          {guardandoRegistroHoras
                            ? "Guardando..."
                            : "Guardar cambios"}
                        </button>
                      </div>
                    </form>
                  )}

                  {cargandoHoras ? (
                    <p>Cargando registros de horas...</p>
                  ) : registrosHoras.length === 0 ? (
                    <p>
                      Este practicante todavía no tiene registros de horas.
                    </p>
                  ) : (
                    <div className="admin-table-wrapper">
                      <table className="admin-table horas-table">
                        <thead>
                          <tr>
                            {[
                              "ID",
                              "Fecha",
                              "Horas",
                              "Descripción",
                              "Fecha de registro",
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
                          {registrosHoras.map((registro) => (
                            <tr key={registro.id_registro}>
                              <td
                                className="admin-table-cell"
                              >
                                {registro.id_registro}
                              </td>

                              <td
                                className="admin-table-cell"
                              >
                                {formatearFecha(registro.fecha)}
                              </td>

                              <td
                                className="admin-table-cell"
                              >
                                <strong>
                                  {Number(registro.horas).toFixed(2)}
                                </strong>
                              </td>

                              <td
                                className="admin-table-cell admin-description-cell"
                              >
                                {registro.descripcion || "—"}
                              </td>

                              <td
                                className="admin-table-cell"
                              >
                                {formatearFechaHora(
                                  registro.fecha_creacion
                                )}
                              </td>

                              <td
                                className="admin-table-cell"
                              >
                                <div className="admin-actions">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      abrirEdicionRegistroHoras(
                                        registro
                                      )
                                    }
                                  >
                                    Editar
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      eliminarRegistroHorasAdmin(
                                        registro
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
              )}


            {editandoPracticante &&
              !cargandoDetalle && (
                <section className="panel">
                  <div className="panel-header">
                    <div>
                      <p className="section-label">
                        EDICIÓN
                      </p>
                      <h3>
                        Editar practicante
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setEditandoPracticante(null)
                      }
                    >
                      Cancelar
                    </button>
                  </div>

                  <form
                    onSubmit={guardarPracticante}
                  >
                    <div className="admin-form-grid">
                      <label>
                        Nombre
                        <input
                          name="nombre"
                          value={
                            editandoPracticante.nombre ||
                            ""
                          }
                          onChange={
                            cambiarCampoEdicion
                          }
                          required
                        />
                      </label>

                      <label>
                        Apellido paterno
                        <input
                          name="apellido_paterno"
                          value={
                            editandoPracticante.apellido_paterno ||
                            ""
                          }
                          onChange={
                            cambiarCampoEdicion
                          }
                          required
                        />
                      </label>

                      <label>
                        Apellido materno
                        <input
                          name="apellido_materno"
                          value={
                            editandoPracticante.apellido_materno ||
                            ""
                          }
                          onChange={
                            cambiarCampoEdicion
                          }
                        />
                      </label>

                      <label>
                        Correo
                        <input
                          type="email"
                          name="correo"
                          value={
                            editandoPracticante.correo ||
                            ""
                          }
                          onChange={
                            cambiarCampoEdicion
                          }
                          required
                        />
                      </label>

                      <label>
                        Matrícula
                        <input
                          name="matricula"
                          value={
                            editandoPracticante.matricula ||
                            ""
                          }
                          onChange={
                            cambiarCampoEdicion
                          }
                        />
                      </label>

                      <label>
                        Teléfono
                        <input
                          name="telefono"
                          value={
                            editandoPracticante.telefono ||
                            ""
                          }
                          onChange={
                            cambiarCampoEdicion
                          }
                        />
                      </label>

                      <label>
                        Universidad
                        <input
                          name="universidad"
                          value={
                            editandoPracticante.universidad ||
                            ""
                          }
                          onChange={
                            cambiarCampoEdicion
                          }
                        />
                      </label>

                      <label>
                        Carrera
                        <select
                          name="id_carrera"
                          value={
                            editandoPracticante.id_carrera ||
                            ""
                          }
                          onChange={
                            cambiarCampoEdicion
                          }
                          required
                        >
                          <option value="">
                            Selecciona una carrera
                          </option>

                          {carreras.map(
                            (carrera) => (
                              <option
                                key={
                                  carrera.id_carrera
                                }
                                value={
                                  carrera.id_carrera
                                }
                              >
                                {carrera.nombre}
                              </option>
                            )
                          )}
                        </select>
                      </label>

                      <label>
                        Fecha de inicio
                        <input
                          type="date"
                          name="fecha_inicio"
                          value={
                            editandoPracticante.fecha_inicio ||
                            ""
                          }
                          onChange={
                            cambiarCampoEdicion
                          }
                          required
                        />
                      </label>

                      <label>
                        Fecha de fin
                        <input
                          type="date"
                          name="fecha_fin"
                          value={
                            editandoPracticante.fecha_fin ||
                            ""
                          }
                          onChange={
                            cambiarCampoEdicion
                          }
                        />
                      </label>

                      <label>
                        Horas requeridas
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          name="horas_requeridas"
                          value={
                            editandoPracticante.horas_requeridas ||
                            ""
                          }
                          onChange={
                            cambiarCampoEdicion
                          }
                          required
                        />
                      </label>
                    </div>

                    <div className="admin-form-actions">
                      <button
                        type="submit"
                        disabled={
                          guardandoPracticante
                        }
                      >
                        {guardandoPracticante
                          ? "Guardando..."
                          : "Guardar cambios"}
                      </button>
                    </div>
                  </form>
                </section>
              )}
          </>
  );
}

export default PracticantesAdmin;