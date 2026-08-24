import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  CheckCircle2,
  FilePenLine,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  eliminarActividadDiaria,
  guardarActividadDiaria,
  obtenerActividadesDiarias,
  suscribirseActividadesDiarias,
} from "../../services/actividadDiariaStorage";

const LIMITE_ACTIVIDAD = 300;
const MINIMO_ACTIVIDAD = 10;

const obtenerFechaLocal = () => {
  const fecha = new Date();

  const anio = fecha.getFullYear();
  const mes = String(
    fecha.getMonth() + 1
  ).padStart(2, "0");
  const dia = String(
    fecha.getDate()
  ).padStart(2, "0");

  return [anio, mes, dia].join("-");
};

const formatearFecha = (fecha) => {
  const partes = String(fecha || "")
    .slice(0, 10)
    .split("-");

  if (partes.length !== 3) {
    return fecha || "Sin fecha";
  }

  return [
    partes[2],
    partes[1],
    partes[0],
  ].join("/");
};

function ActividadDiariaPracticante({
  perfil,
  usuario,
  horario,
}) {
  const fechaHoy = obtenerFechaLocal();

  const [actividades, setActividades] =
    useState([]);

  const [formulario, setFormulario] =
    useState({
      fecha: fechaHoy,
      actividad: "",
    });

  const [idEditando, setIdEditando] =
    useState(null);

  const [mensaje, setMensaje] =
    useState("");

  const [error, setError] =
    useState("");

  const idPracticante = String(
    perfil?.id_practicante ||
      usuario?.id_practicante ||
      usuario?.id_usuario ||
      usuario?.correo ||
      "practicante-temporal"
  );

  const nombreCompleto = [
    perfil?.nombre || usuario?.nombre,
    perfil?.apellido_paterno ||
      usuario?.apellido_paterno,
    perfil?.apellido_materno ||
      usuario?.apellido_materno,
  ]
    .filter(Boolean)
    .join(" ")
    .trim() || "Practicante";

  const horarioTexto = useMemo(() => {
    const entrada =
      horario?.hora_entrada ||
      horario?.hora_entrada_esperada;

    const salida =
      horario?.hora_salida ||
      horario?.hora_salida_esperada;

    if (entrada && salida) {
      return (
        String(entrada).slice(0, 5) +
        " - " +
        String(salida).slice(0, 5)
      );
    }

    return "No registrado";
  }, [horario]);

  const cargarActividades = () => {
    const registros =
      obtenerActividadesDiarias()
        .filter(
          (actividad) =>
            String(
              actividad.id_practicante
            ) === idPracticante
        );

    setActividades(registros);
  };

  useEffect(() => {
    cargarActividades();

    return suscribirseActividadesDiarias(
      cargarActividades
    );
  }, [idPracticante]);

  const limpiarFormulario = () => {
    setFormulario({
      fecha: fechaHoy,
      actividad: "",
    });

    setIdEditando(null);
    setError("");
  };

  const cambiarCampo = (evento) => {
    const { name, value } =
      evento.target;

    setFormulario((actual) => ({
      ...actual,
      [name]:
        name === "actividad"
          ? value.slice(
              0,
              LIMITE_ACTIVIDAD
            )
          : value,
    }));

    setError("");
    setMensaje("");
  };

  const guardarRegistro = (evento) => {
    evento.preventDefault();

    const actividadLimpia =
      formulario.actividad
        .trim()
        .replace(/\s+/g, " ");

    if (!formulario.fecha) {
      setError(
        "Selecciona la fecha del registro."
      );
      return;
    }

    if (formulario.fecha > fechaHoy) {
      setError(
        "No puedes registrar actividades de una fecha futura."
      );
      return;
    }

    if (
      actividadLimpia.length <
      MINIMO_ACTIVIDAD
    ) {
      setError(
        "Describe tu actividad con al menos 10 caracteres."
      );
      return;
    }

    const registroDuplicado =
      actividades.find(
        (actividad) =>
          actividad.fecha ===
            formulario.fecha &&
          actividad.id !== idEditando
      );

    if (registroDuplicado) {
      setError(
        "Ya existe una actividad registrada para esa fecha."
      );
      return;
    }

    const registroAnterior =
      actividades.find(
        (actividad) =>
          actividad.id === idEditando
      );

    guardarActividadDiaria({
      ...registroAnterior,
      id: idEditando || undefined,
      id_practicante: idPracticante,
      id_usuario:
        perfil?.id_usuario ||
        usuario?.id_usuario ||
        null,
      nombre: nombreCompleto,
      matricula:
        perfil?.matricula ||
        usuario?.matricula ||
        "Sin matricula",
      empresa:
        perfil?.empresa ||
        "NMR CONSULTORES",
      carrera:
        perfil?.carrera ||
        perfil?.nombre_carrera ||
        usuario?.carrera ||
        "Sin carrera",
      horario: horarioTexto,
      fecha: formulario.fecha,
      actividad: actividadLimpia,
    });

    setMensaje(
      idEditando
        ? "Actividad actualizada correctamente."
        : "Actividad guardada correctamente."
    );

    limpiarFormulario();
    cargarActividades();
  };

  const editarActividad = (
    actividad
  ) => {
    setFormulario({
      fecha: actividad.fecha,
      actividad: actividad.actividad,
    });

    setIdEditando(actividad.id);
    setError("");
    setMensaje("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const eliminarActividad = (
    actividad
  ) => {
    const confirmar = window.confirm(
      "¿Deseas eliminar esta actividad diaria?"
    );

    if (!confirmar) {
      return;
    }

    eliminarActividadDiaria(
      actividad.id
    );

    if (idEditando === actividad.id) {
      limpiarFormulario();
    }

    setMensaje(
      "Actividad eliminada correctamente."
    );

    cargarActividades();
  };

  return (
    <div className="actividad-diaria-page">
      <section className="panel actividad-diaria-form-panel">
        <div className="panel-header">
          <div>
            <p className="section-label">
              REGISTRO DIARIO
            </p>

            <h3>
              Actividad realizada
            </h3>
          </div>

          <div className="actividad-diaria-icon">
            <FilePenLine size={25} />
          </div>
        </div>

        <p className="panel-description">
          Registra de forma resumida las actividades que realizaste durante el día.
        </p>

        <form
          onSubmit={guardarRegistro}
          noValidate
        >
          <div className="actividad-diaria-form-grid">
            <label>
              Fecha *

              <div className="actividad-input-icon">
                <CalendarDays size={18} />

                <input
                  type="date"
                  name="fecha"
                  value={formulario.fecha}
                  max={fechaHoy}
                  onChange={cambiarCampo}
                  required
                />
              </div>
            </label>

            <label className="actividad-diaria-textarea-label">
              Actividad realizada *

              <textarea
                name="actividad"
                value={formulario.actividad}
                maxLength={LIMITE_ACTIVIDAD}
                rows="5"
                onChange={cambiarCampo}
                placeholder="Resume las actividades realizadas durante el día..."
                required
              />

              <span className="actividad-contador">
                {formulario.actividad.length} / {LIMITE_ACTIVIDAD}
              </span>
            </label>
          </div>

          {error && (
            <div className="actividad-mensaje actividad-mensaje-error">
              {error}
            </div>
          )}

          {mensaje && (
            <div className="actividad-mensaje actividad-mensaje-exito">
              <CheckCircle2 size={18} />
              {mensaje}
            </div>
          )}

          <div className="admin-form-actions actividad-form-actions">
            {idEditando && (
              <button
                type="button"
                className="secondary-button"
                onClick={limpiarFormulario}
              >
                Cancelar edición
              </button>
            )}

            <button type="submit">
              {idEditando
                ? "Guardar cambios"
                : "Registrar actividad"}
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="section-label">
              MIS REGISTROS
            </p>

            <h3>
              Historial de actividades
            </h3>
          </div>

          <strong className="actividad-total">
            {actividades.length} registros
          </strong>
        </div>

        {actividades.length === 0 ? (
          <div className="actividad-empty-state">
            <FilePenLine size={34} />

            <strong>
              Aún no tienes actividades registradas
            </strong>

            <span>
              Tu primer registro aparecerá aquí.
            </span>
          </div>
        ) : (
          <div className="actividad-tabla-wrapper">
            <table className="actividad-tabla">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Actividad realizada</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {actividades.map(
                  (actividad) => (
                    <tr key={actividad.id}>
                      <td>
                        <strong>
                          {formatearFecha(
                            actividad.fecha
                          )}
                        </strong>
                      </td>

                      <td className="actividad-descripcion-cell">
                        {actividad.actividad}
                      </td>

                      <td>
                        <div className="actividad-acciones">
                          <button
                            type="button"
                            className="actividad-action-button"
                            onClick={() =>
                              editarActividad(
                                actividad
                              )
                            }
                            aria-label="Editar actividad"
                            title="Editar"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            className="actividad-action-button actividad-action-delete"
                            onClick={() =>
                              eliminarActividad(
                                actividad
                              )
                            }
                            aria-label="Eliminar actividad"
                            title="Eliminar"
                          >
                            <Trash2 size={17} />
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
    </div>
  );
}

export default ActividadDiariaPracticante;
