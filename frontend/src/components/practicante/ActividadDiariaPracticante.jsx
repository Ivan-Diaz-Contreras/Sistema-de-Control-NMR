import {
  useCallback,
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

import axios from "axios";

const LIMITE_ACTIVIDAD = 300;
const MINIMO_ACTIVIDAD = 10;

const API = "http://localhost:3000/api";

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
  token,
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

  const cargarActividades = useCallback(async () => {
    if (!token) {
      setActividades([]);
      return;
    }

    try {
      const response = await axios.get(
        `${API}/actividades-diarias/mis`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setActividades(
        Array.isArray(response.data?.actividades)
          ? response.data.actividades
          : []
      );
    } catch (errorPeticion) {
      console.error(
        "Error cargando actividades diarias:",
        errorPeticion
      );

      setError(
        errorPeticion.response?.data?.mensaje ||
          "No se pudieron cargar las actividades diarias."
      );
    }
  }, [token]);

  useEffect(() => {
    cargarActividades();
  }, [cargarActividades]);

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

  const guardarRegistro = async (evento) => {
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
          String(actividad.fecha || "")
            .slice(0, 10) ===
            formulario.fecha &&
          actividad.id !== idEditando
      );

    if (registroDuplicado) {
      setError(
        "Ya existe una actividad registrada para esa fecha."
      );
      return;
    }

    try {
      if (idEditando) {
        await axios.put(
          `${API}/actividades-diarias/mis/${idEditando}`,
          {
            fecha: formulario.fecha,
            actividad: actividadLimpia,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await axios.post(
          `${API}/actividades-diarias/mis`,
          {
            fecha: formulario.fecha,
            actividad: actividadLimpia,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      setMensaje(
        idEditando
          ? "Actividad actualizada correctamente."
          : "Actividad guardada correctamente."
      );

      limpiarFormulario();
      await cargarActividades();
    } catch (errorPeticion) {
      console.error(
        "Error guardando actividad diaria:",
        errorPeticion
      );

      setError(
        errorPeticion.response?.data?.mensaje ||
          "No se pudo guardar la actividad diaria."
      );
    }
  };

  const editarActividad = (
    actividad
  ) => {
    setFormulario({
      fecha: String(actividad.fecha || "")
        .slice(0, 10),
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

  const eliminarActividad = async (
    actividad
  ) => {
    const confirmar = window.confirm(
      "¿Deseas eliminar esta actividad diaria?"
    );

    if (!confirmar) {
      return;
    }

    try {
      await axios.delete(
        `${API}/actividades-diarias/mis/${actividad.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (idEditando === actividad.id) {
        limpiarFormulario();
      }

      setMensaje(
        "Actividad eliminada correctamente."
      );

      await cargarActividades();
    } catch (errorPeticion) {
      console.error(
        "Error eliminando actividad diaria:",
        errorPeticion
      );

      setError(
        errorPeticion.response?.data?.mensaje ||
          "No se pudo eliminar la actividad diaria."
      );
    }
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