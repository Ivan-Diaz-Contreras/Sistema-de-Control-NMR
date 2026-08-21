import {
  Eye,
  EyeOff,
} from "lucide-react";

import { useState } from "react";
import {
  normalizarTexto,
  validarCorreo,
  validarFechaISO,
  validarHorasRequeridas,
  validarNombre,
  validarPassword,
  validarTelefono,
  validarUniversidad,
} from "../../utils/validaciones";
function PracticantesAdmin({
  abrirEdicionHorario,
  abrirEdicionRegistroHoras,
  abrirNuevoHorario,
  abrirNuevoPracticante,
  busqueda,
  cambiarCampoEdicion,
  cambiarCampoHorario,
  cambiarCampoNuevoPracticante,
  cambiarCampoRegistroHoras,
  cambiarEstadoHorario,
  cambiarEstadoPracticante,
  cambiarFiltroCarrera,
  cancelarHorario,
  cancelarNuevoPracticante,
  cargandoDetalle,
  cargandoHorarios,
  cargandoHoras,
  cargandoPracticantes,
  cargarHorasPracticante,
  carreras,
  cerrarCredencialesCreadas,
  credencialesCreadas,
  editandoHorario,
  editandoPracticante,
  editandoRegistroHoras,
  eliminarPracticanteAdmin,
  eliminarRegistroHorasAdmin,
  filtroCarrera,
  formHorario,
  formatearFecha,
  formatearFechaHora,
  guardandoHorario,
  guardandoNuevoPracticante,
  guardandoPracticante,
  guardandoRegistroHoras,
  guardarHorario,
  guardarNuevoPracticante,
  guardarPracticante,
  guardarRegistroHoras,
  horariosPracticante,
  iniciarEdicion,
  mostrandoFormularioHorario,
  mostrandoFormularioNuevoPracticante,
  nuevoPracticante,
  practicanteSeleccionado,
  practicantes,
  practicantesFiltrados,
  registrosHoras,
  setBusqueda,
  setEditandoPracticante,
  setEditandoRegistroHoras,
  setPracticanteSeleccionado,
  verPracticante,
}) {

  const [
    erroresNuevoPracticante,
    setErroresNuevoPracticante,
  ] = useState({});

  const validarCampoNuevo = (
    nombreCampo,
    datos = nuevoPracticante
  ) => {
    const valor = datos[nombreCampo];

    switch (nombreCampo) {
      case "nombre":
        return validarNombre(valor)
          ? ""
          : "Escribe un nombre de 2 a 15 caracteres, usando solo letras.";

      case "apellido_paterno":
        return validarNombre(valor)
          ? ""
          : "Escribe un apellido paterno de 2 a 15 caracteres, usando solo letras.";

      case "apellido_materno":
        return !normalizarTexto(valor) ||
          validarNombre(valor)
          ? ""
          : "El apellido materno solo puede contener letras.";

      case "correo":
        return validarCorreo(valor)
          ? ""
          : "Escribe un correo valido, por ejemplo usuario@correo.com.";

      case "password":
        return validarPassword(valor)
          ? ""
          : "Debe tener de 8 a 20 caracteres, mayuscula, minuscula y numero.";

      case "confirmar_password":
        return valor === datos.password &&
          String(valor || "").length > 0
          ? ""
          : "Las contrasenas no coinciden.";

      case "telefono":
        return validarTelefono(valor)
          ? ""
          : "El telefono debe contener exactamente 10 digitos.";

      case "universidad":
        return validarUniversidad(valor)
          ? ""
          : "Ingresa una universidad valida.";

      case "id_carrera":
        return valor
          ? ""
          : "Selecciona una carrera.";

      case "fecha_inicio":
        return validarFechaISO(valor)
          ? ""
          : "Selecciona una fecha de inicio valida.";

      case "fecha_fin":
        if (
          valor &&
          !validarFechaISO(valor)
        ) {
          return "Selecciona una fecha de fin valida.";
        }

        return valor &&
          datos.fecha_inicio &&
          valor < datos.fecha_inicio
          ? "La fecha de fin no puede ser anterior a la fecha de inicio."
          : "";

      case "horas_requeridas":
        return validarHorasRequeridas(valor)
          ? ""
          : "Las horas deben estar entre 1 y 2000.";

      default:
        return "";
    }
  };

  const validarFormularioNuevo = () => {
    const campos = [
      "nombre",
      "apellido_paterno",
      "apellido_materno",
      "correo",
      "password",
      "confirmar_password",
      "telefono",
      "universidad",
      "id_carrera",
      "fecha_inicio",
      "fecha_fin",
      "horas_requeridas",
    ];

    const errores = {};

    campos.forEach((campo) => {
      const error = validarCampoNuevo(campo);

      if (error) {
        errores[campo] = error;
      }
    });

    setErroresNuevoPracticante(errores);

    return Object.keys(errores).length === 0;
  };

  const manejarCambioNuevo = (e) => {
    const campo = e.target.name;

    cambiarCampoNuevoPracticante(e);

    setErroresNuevoPracticante(
      (erroresActuales) => {
        const nuevosErrores = {
          ...erroresActuales,
        };

        delete nuevosErrores[campo];

        if (campo === "password") {
          delete nuevosErrores.confirmar_password;
        }

        return nuevosErrores;
      }
    );
  };

  const manejarBlurNuevo = (e) => {
    const campo = e.target.name;
    const error = validarCampoNuevo(campo);

    setErroresNuevoPracticante(
      (erroresActuales) => ({
        ...erroresActuales,
        [campo]: error,
      })
    );
  };

  const validarYGuardarNuevoPracticante = (
    e
  ) => {
    e.preventDefault();

    if (!validarFormularioNuevo()) {
      return;
    }

    guardarNuevoPracticante(e);
  };

  const [
    mostrarPasswordTemporal,
    setMostrarPasswordTemporal,
  ] = useState(false);

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

                <button
                  type="button"
                  onClick={abrirNuevoPracticante}
                >
                  + Nuevo practicante
                </button>
              </div>

              <p className="panel-description">
                Consulta, filtra y administra los
                practicantes registrados en el sistema.
              </p>


              {credencialesCreadas && (
                <div className="message">
                  <strong>
                    Cuenta creada: {credencialesCreadas.nombre}
                  </strong>

                  <p>
                    Correo:{" "}
                    <strong>
                      {credencialesCreadas.correo}
                    </strong>
                  </p>

                  <p>
                    Contraseña temporal:{" "}
                    <strong>
                      {credencialesCreadas.password}
                    </strong>
                  </p>

                  <p>
                    Guarda o entrega estos datos ahora. La
                    contraseña no volverá a mostrarse desde
                    el sistema después de cerrar este aviso.
                  </p>

                  <button
                    type="button"
                    onClick={cerrarCredencialesCreadas}
                  >
                    Entendido
                  </button>
                </div>
              )}

              {mostrandoFormularioNuevoPracticante && (
                <form
                  onSubmit={validarYGuardarNuevoPracticante}
                  className="admin-inline-form"

                  noValidate
                >
                  <div className="admin-form-header">
                    <div>
                      <h4 className="admin-form-title">
                        Nuevo practicante
                      </h4>
                      <small>
                        La contraseña será temporal y el
                        practicante deberá cambiarla.
                      </small>
                    </div>

                    <button
                      type="button"
                      onClick={cancelarNuevoPracticante}
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="admin-form-grid">
                    <label>
                      Nombre *
                      <input
                        name="nombre"
                        value={nuevoPracticante.nombre}
                        onChange={manejarCambioNuevo}
                        onBlur={manejarBlurNuevo}
                        className={
                          erroresNuevoPracticante.nombre
                            ? "input-invalid"
                            : ""
                        }
                        minLength="2"
                        maxLength="15"
                      />
                      {erroresNuevoPracticante.nombre && (
                        <small className="field-error">
                          {erroresNuevoPracticante.nombre}
                        </small>
                      )}
                    </label>

                    <label>
                      Apellido paterno *
                      <input
                        name="apellido_paterno"
                        value={nuevoPracticante.apellido_paterno}
                        onChange={manejarCambioNuevo}
                        onBlur={manejarBlurNuevo}
                        className={
                          erroresNuevoPracticante.apellido_paterno
                            ? "input-invalid"
                            : ""
                        }
                        minLength="2"
                        maxLength="15"
                      />
                      {erroresNuevoPracticante.apellido_paterno && (
                        <small className="field-error">
                          {erroresNuevoPracticante.apellido_paterno}
                        </small>
                      )}
                    </label>

                    <label>
                      Apellido materno
                      <input
                        name="apellido_materno"
                        value={nuevoPracticante.apellido_materno}
                        onChange={manejarCambioNuevo}
                        onBlur={manejarBlurNuevo}
                        className={
                          erroresNuevoPracticante.apellido_materno
                            ? "input-invalid"
                            : ""
                        }
                        minLength="2"
                        maxLength="15"
                      />
                      {erroresNuevoPracticante.apellido_materno && (
                        <small className="field-error">
                          {erroresNuevoPracticante.apellido_materno}
                        </small>
                      )}
                    </label>

                    <label>
                      Correo *
                      <input
                        type="email"
                        name="correo"
                        maxLength="120"
                        value={nuevoPracticante.correo}
                        onChange={manejarCambioNuevo}
                        onBlur={manejarBlurNuevo}
                        className={
                          erroresNuevoPracticante.correo
                            ? "input-invalid"
                            : ""
                        }
                      />
                      {erroresNuevoPracticante.correo && (
                        <small className="field-error">
                          {erroresNuevoPracticante.correo}
                        </small>
                      )}
                    </label>

                    <label>
                      Contrase&ntilde;a temporal *
                      <div className="password-input-wrapper">
                        <input
                          type={
                            mostrarPasswordTemporal
                              ? "text"
                              : "password"
                          }
                          name="password"
                          minLength="8"
                          maxLength="20"
                          value={nuevoPracticante.password}
                          onChange={manejarCambioNuevo}
                          onBlur={manejarBlurNuevo}
                          className={
                            erroresNuevoPracticante.password
                              ? "input-invalid"
                              : ""
                          }
                        />

                        <button
                          type="button"
                          className="password-toggle-button"
                          onClick={() =>
                            setMostrarPasswordTemporal(
                              (actual) => !actual
                            )
                          }
                          aria-label="Mostrar u ocultar contrasena"
                        >
                          {mostrarPasswordTemporal ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>

                      {erroresNuevoPracticante.password ? (
                        <small className="field-error">
                          {erroresNuevoPracticante.password}
                        </small>
                      ) : (
                        <small className="password-help">
                          M&iacute;nimo 8 caracteres, con
                          may&uacute;scula, min&uacute;scula
                          y n&uacute;mero.
                        </small>
                      )}
                    </label>

                    <label>
                      Confirmar contrase&ntilde;a *
                      <input
                        type={
                          mostrarPasswordTemporal
                            ? "text"
                            : "password"
                        }
                        name="confirmar_password"
                        minLength="8"
                        maxLength="20"
                        value={
                          nuevoPracticante.confirmar_password
                        }
                        onChange={manejarCambioNuevo}
                        onBlur={manejarBlurNuevo}
                        className={
                          erroresNuevoPracticante.confirmar_password
                            ? "input-invalid"
                            : ""
                        }
                      />
                      {erroresNuevoPracticante.confirmar_password && (
                        <small className="field-error">
                          {erroresNuevoPracticante.confirmar_password}
                        </small>
                      )}
                    </label>

                    <label>
                      Tel&eacute;fono
                      <input
                        type="tel"
                        inputMode="numeric"
                        name="telefono"
                        maxLength="10"
                        placeholder="10 digitos"
                        value={nuevoPracticante.telefono}
                        onChange={manejarCambioNuevo}
                        onBlur={manejarBlurNuevo}
                        className={
                          erroresNuevoPracticante.telefono
                            ? "input-invalid"
                            : ""
                        }
                      />
                      {erroresNuevoPracticante.telefono && (
                        <small className="field-error">
                          {erroresNuevoPracticante.telefono}
                        </small>
                      )}
                    </label>

                    <label>
                      Universidad
                      <input
                        name="universidad"
                        value={nuevoPracticante.universidad}
                        onChange={manejarCambioNuevo}
                        onBlur={manejarBlurNuevo}
                        className={
                          erroresNuevoPracticante.universidad
                            ? "input-invalid"
                            : ""
                        }
                        minLength="2"
                        maxLength="20"
                      />
                      {erroresNuevoPracticante.universidad && (
                        <small className="field-error">
                          {erroresNuevoPracticante.universidad}
                        </small>
                      )}
                    </label>

                    <label>
                      Carrera *
                      <select
                        name="id_carrera"
                        value={nuevoPracticante.id_carrera}
                        onChange={manejarCambioNuevo}
                        onBlur={manejarBlurNuevo}
                        className={
                          erroresNuevoPracticante.id_carrera
                            ? "input-invalid"
                            : ""
                        }
                      >
                        <option value="">
                          Selecciona una carrera
                        </option>

                        {carreras
                          .filter(
                            (carrera) =>
                              Number(
                                carrera.activa ??
                                  carrera.activo ??
                                  1
                              ) === 1
                          )
                          .map((carrera) => (
                            <option
                              key={carrera.id_carrera}
                              value={carrera.id_carrera}
                            >
                              {carrera.nombre}
                            </option>
                          ))}
                      </select>

                      {erroresNuevoPracticante.id_carrera && (
                        <small className="field-error">
                          {erroresNuevoPracticante.id_carrera}
                        </small>
                      )}
                    </label>

                    <label>
                      Fecha de inicio *
                      <input
                        type="date"
                        name="fecha_inicio"
                        max={
                          nuevoPracticante.fecha_fin ||
                          undefined
                        }
                        value={nuevoPracticante.fecha_inicio}
                        onChange={manejarCambioNuevo}
                        onBlur={manejarBlurNuevo}
                        className={
                          erroresNuevoPracticante.fecha_inicio
                            ? "input-invalid"
                            : ""
                        }
                      />
                      {erroresNuevoPracticante.fecha_inicio && (
                        <small className="field-error">
                          {erroresNuevoPracticante.fecha_inicio}
                        </small>
                      )}
                    </label>

                    <label>
                      Fecha de fin
                      <input
                        type="date"
                        name="fecha_fin"
                        min={
                          nuevoPracticante.fecha_inicio ||
                          undefined
                        }
                        value={nuevoPracticante.fecha_fin}
                        onChange={manejarCambioNuevo}
                        onBlur={manejarBlurNuevo}
                        className={
                          erroresNuevoPracticante.fecha_fin
                            ? "input-invalid"
                            : ""
                        }
                      />
                      {erroresNuevoPracticante.fecha_fin && (
                        <small className="field-error">
                          {erroresNuevoPracticante.fecha_fin}
                        </small>
                      )}
                    </label>

                    <label>
                      Horas requeridas *
                      <input
                        type="number"
                        min="1"
                        max="2000"
                        step="0.01"
                        name="horas_requeridas"
                        value={
                          nuevoPracticante.horas_requeridas
                        }
                        onChange={manejarCambioNuevo}
                        onBlur={manejarBlurNuevo}
                        className={
                          erroresNuevoPracticante.horas_requeridas
                            ? "input-invalid"
                            : ""
                        }
                      />
                      {erroresNuevoPracticante.horas_requeridas && (
                        <small className="field-error">
                          {erroresNuevoPracticante.horas_requeridas}
                        </small>
                      )}
                    </label>
                  </div>

                  <div className="admin-form-actions">
                    <button
                      type="submit"
                      disabled={
                        guardandoNuevoPracticante
                      }
                    >
                      {guardandoNuevoPracticante
                        ? "Creando..."
                        : "Crear practicante"}
                    </button>
                  </div>
                </form>
              )}

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