import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarRange,
  FilePenLine,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  eliminarActividadDiaria,
  guardarActividadDiaria,
  obtenerActividadesDiarias,
  suscribirseActividadesDiarias,
} from "../../services/actividadDiariaStorage";

const LIMITE_ACTIVIDAD = 300;
const MINIMO_ACTIVIDAD = 10;

const obtenerFechaHoy = () => {
  const fecha = new Date();

  return [
    fecha.getFullYear(),
    String(fecha.getMonth() + 1).padStart(2, "0"),
    String(fecha.getDate()).padStart(2, "0"),
  ].join("-");
};

const FORMULARIO_INICIAL = {
  empresa: "NMR CONSULTORES",
  nombre: "",
  matricula: "",
  carrera: "",
  horario: "",
  fecha: obtenerFechaHoy(),
  actividad: "",
};

const normalizar = (valor) =>
  String(valor || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const formatearFecha = (fecha) => {
  const partes = String(fecha || "")
    .slice(0, 10)
    .split("-");

  return partes.length === 3
    ? [
        partes[2],
        partes[1],
        partes[0],
      ].join("/")
    : fecha || "Sin fecha";
};

function ActividadDiariaAdmin() {
  const [actividades, setActividades] =
    useState([]);

  const [formulario, setFormulario] =
    useState(FORMULARIO_INICIAL);

  const [mostrandoFormulario, setMostrandoFormulario] =
    useState(false);

  const [idEditando, setIdEditando] =
    useState(null);

  const [error, setError] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");

  const [busqueda, setBusqueda] =
    useState("");

  const [filtroPracticante, setFiltroPracticante] =
    useState("");

  const [filtroCarrera, setFiltroCarrera] =
    useState("");

  const [fechaDesde, setFechaDesde] =
    useState("");

  const [fechaHasta, setFechaHasta] =
    useState("");

  const cargarActividades = () => {
    setActividades(
      obtenerActividadesDiarias()
    );
  };

  useEffect(() => {
    cargarActividades();

    return suscribirseActividadesDiarias(
      cargarActividades
    );
  }, []);

  const practicantes = useMemo(() => {
    const mapa = new Map();

    actividades.forEach((actividad) => {
      const clave = String(
        actividad.id_practicante ||
          actividad.nombre
      );

      if (!mapa.has(clave)) {
        mapa.set(clave, {
          id: clave,
          nombre:
            actividad.nombre ||
            "Sin nombre",
        });
      }
    });

    return Array.from(mapa.values())
      .sort((a, b) =>
        a.nombre.localeCompare(b.nombre)
      );
  }, [actividades]);

  const carreras = useMemo(() => {
    return Array.from(
      new Set(
        actividades
          .map(
            (actividad) =>
              actividad.carrera
          )
          .filter(Boolean)
      )
    ).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [actividades]);

  const actividadesFiltradas =
    useMemo(() => {
      const texto = normalizar(busqueda);

      return actividades.filter(
        (actividad) => {
          const coincideBusqueda =
            !texto ||
            [
              actividad.empresa,
              actividad.nombre,
              actividad.matricula,
              actividad.carrera,
              actividad.horario,
              actividad.fecha,
              actividad.actividad,
            ].some((valor) =>
              normalizar(valor).includes(
                texto
              )
            );

          const coincidePracticante =
            !filtroPracticante ||
            String(
              actividad.id_practicante ||
                actividad.nombre
            ) === filtroPracticante;

          const coincideCarrera =
            !filtroCarrera ||
            actividad.carrera ===
              filtroCarrera;

          const coincideDesde =
            !fechaDesde ||
            actividad.fecha >= fechaDesde;

          const coincideHasta =
            !fechaHasta ||
            actividad.fecha <= fechaHasta;

          return (
            coincideBusqueda &&
            coincidePracticante &&
            coincideCarrera &&
            coincideDesde &&
            coincideHasta
          );
        }
      );
    }, [
      actividades,
      busqueda,
      filtroPracticante,
      filtroCarrera,
      fechaDesde,
      fechaHasta,
    ]);

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

  const abrirNuevoRegistro = () => {
    setFormulario({
      ...FORMULARIO_INICIAL,
      fecha: obtenerFechaHoy(),
    });

    setIdEditando(null);
    setError("");
    setMensaje("");
    setMostrandoFormulario(true);
  };

  const cancelarFormulario = () => {
    setFormulario(FORMULARIO_INICIAL);
    setIdEditando(null);
    setError("");
    setMostrandoFormulario(false);
  };

  const editarRegistro = (
    actividad
  ) => {
    setFormulario({
      empresa:
        actividad.empresa || "",
      nombre:
        actividad.nombre || "",
      matricula:
        actividad.matricula || "",
      carrera:
        actividad.carrera || "",
      horario:
        actividad.horario || "",
      fecha:
        actividad.fecha || "",
      actividad:
        actividad.actividad || "",
    });

    setIdEditando(actividad.id);
    setError("");
    setMensaje("");
    setMostrandoFormulario(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const guardarRegistro = (evento) => {
    evento.preventDefault();

    const datos = {
      empresa:
        formulario.empresa.trim(),
      nombre:
        formulario.nombre.trim(),
      matricula:
        formulario.matricula.trim(),
      carrera:
        formulario.carrera.trim(),
      horario:
        formulario.horario.trim(),
      fecha:
        formulario.fecha,
      actividad:
        formulario.actividad
          .trim()
          .replace(/\s+/g, " "),
    };

    if (
      !datos.empresa ||
      !datos.nombre ||
      !datos.carrera ||
      !datos.horario ||
      !datos.fecha ||
      !datos.actividad
    ) {
      setError(
        "Completa todos los campos obligatorios."
      );
      return;
    }

    if (datos.nombre.length < 2) {
      setError(
        "Ingresa un nombre valido."
      );
      return;
    }

    if (
      datos.actividad.length <
      MINIMO_ACTIVIDAD
    ) {
      setError(
        "La actividad debe tener al menos 10 caracteres."
      );
      return;
    }

    if (
      datos.actividad.length >
      LIMITE_ACTIVIDAD
    ) {
      setError(
        "La actividad no puede superar 300 caracteres."
      );
      return;
    }

    if (
      datos.fecha >
      obtenerFechaHoy()
    ) {
      setError(
        "No puedes registrar una fecha futura."
      );
      return;
    }

    const registroAnterior =
      actividades.find(
        (actividad) =>
          actividad.id === idEditando
      );

    const idPracticante =
      registroAnterior?.id_practicante ||
      [
        "manual",
        normalizar(datos.nombre)
          .replace(/[^a-z0-9]+/g, "-"),
      ].join("-");

    const duplicado =
      actividades.find(
        (actividad) =>
          String(
            actividad.id_practicante
          ) === String(idPracticante) &&
          actividad.fecha ===
            datos.fecha &&
          actividad.id !== idEditando
      );

    if (duplicado) {
      setError(
        "Ese practicante ya tiene una actividad registrada en la fecha seleccionada."
      );
      return;
    }

    guardarActividadDiaria({
      ...registroAnterior,
      id:
        idEditando || undefined,
      id_practicante:
        idPracticante,
      ...datos,
    });

    setMensaje(
      idEditando
        ? "Registro actualizado correctamente."
        : "Registro agregado correctamente."
    );

    setMostrandoFormulario(false);
    setIdEditando(null);
    setFormulario(FORMULARIO_INICIAL);
    cargarActividades();
  };

  const eliminarRegistro = (
    actividad
  ) => {
    const confirmar = window.confirm(
      "¿Deseas eliminar el registro de " +
        actividad.nombre +
        "?"
    );

    if (!confirmar) {
      return;
    }

    eliminarActividadDiaria(
      actividad.id
    );

    if (idEditando === actividad.id) {
      cancelarFormulario();
    }

    setMensaje(
      "Registro eliminado correctamente."
    );

    cargarActividades();
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroPracticante("");
    setFiltroCarrera("");
    setFechaDesde("");
    setFechaHasta("");
  };

  const hayFiltros =
    busqueda ||
    filtroPracticante ||
    filtroCarrera ||
    fechaDesde ||
    fechaHasta;

  return (
    <div className="actividad-admin-page">
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="section-label">
              CONTROL DIARIO
            </p>

            <h3>
              Bitácora de actividades
            </h3>
          </div>

          <button
            type="button"
            onClick={
              mostrandoFormulario
                ? cancelarFormulario
                : abrirNuevoRegistro
            }
          >
            {mostrandoFormulario ? (
              <>
                <X size={18} />
                Cancelar
              </>
            ) : (
              <>
                <Plus size={18} />
                Nuevo registro
              </>
            )}
          </button>
        </div>

        <p className="panel-description">
          Consulta, registra y administra las actividades diarias de los practicantes.
        </p>

        {mostrandoFormulario && (
          <form
            className="actividad-admin-form"
            onSubmit={guardarRegistro}
            noValidate
          >
            <div className="actividad-admin-form-header">
              <FilePenLine size={22} />

              <strong>
                {idEditando
                  ? "Editar registro"
                  : "Nuevo registro diario"}
              </strong>
            </div>

            <div className="actividad-admin-form-grid">
              <label>
                Empresa *
                <input
                  name="empresa"
                  value={formulario.empresa}
                  maxLength="60"
                  onChange={cambiarCampo}
                />
              </label>

              <label>
                Practicante *
                <input
                  name="nombre"
                  value={formulario.nombre}
                  maxLength="100"
                  onChange={cambiarCampo}
                />
              </label>

              <label>
                Matrícula
                <input
                  name="matricula"
                  value={formulario.matricula}
                  maxLength="20"
                  onChange={cambiarCampo}
                />
              </label>

              <label>
                Carrera *
                <input
                  name="carrera"
                  value={formulario.carrera}
                  maxLength="80"
                  onChange={cambiarCampo}
                />
              </label>

              <label>
                Horario *
                <input
                  name="horario"
                  value={formulario.horario}
                  maxLength="40"
                  placeholder="Ej. 10:00 - 13:00"
                  onChange={cambiarCampo}
                />
              </label>

              <label>
                Fecha *
                <input
                  type="date"
                  name="fecha"
                  value={formulario.fecha}
                  max={obtenerFechaHoy()}
                  onChange={cambiarCampo}
                />
              </label>

              <label className="actividad-admin-textarea">
                Actividad realizada *

                <textarea
                  name="actividad"
                  value={formulario.actividad}
                  maxLength={LIMITE_ACTIVIDAD}
                  rows="5"
                  onChange={cambiarCampo}
                  placeholder="Descripción resumida de la actividad..."
                />

                <span>
                  {formulario.actividad.length} / {LIMITE_ACTIVIDAD}
                </span>
              </label>
            </div>

            {error && (
              <div className="actividad-mensaje actividad-mensaje-error">
                {error}
              </div>
            )}

            <div className="actividad-form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={cancelarFormulario}
              >
                Cancelar
              </button>

              <button type="submit">
                {idEditando
                  ? "Guardar cambios"
                  : "Agregar registro"}
              </button>
            </div>
          </form>
        )}

        {mensaje && (
          <div className="actividad-mensaje actividad-mensaje-exito">
            {mensaje}
          </div>
        )}

        <div className="actividad-admin-filtros">
          <div className="actividad-admin-search">
            <Search size={18} />

            <input
              value={busqueda}
              onChange={(evento) =>
                setBusqueda(
                  evento.target.value
                )
              }
              placeholder="Buscar por practicante, matr?cula, empresa, carrera o actividad"
            />
          </div>

          <select
            value={filtroPracticante}
            onChange={(evento) =>
              setFiltroPracticante(
                evento.target.value
              )
            }
          >
            <option value="">
              Todos los practicantes
            </option>

            {practicantes.map(
              (practicante) => (
                <option
                  key={practicante.id}
                  value={practicante.id}
                >
                  {practicante.nombre}
                </option>
              )
            )}
          </select>

          <select
            value={filtroCarrera}
            onChange={(evento) =>
              setFiltroCarrera(
                evento.target.value
              )
            }
          >
            <option value="">
              Todas las carreras
            </option>

            {carreras.map((carrera) => (
              <option
                key={carrera}
                value={carrera}
              >
                {carrera}
              </option>
            ))}
          </select>

          <label className="actividad-date-filter">
            <span>Desde</span>
            <input
              type="date"
              value={fechaDesde}
              max={fechaHasta || undefined}
              onChange={(evento) =>
                setFechaDesde(
                  evento.target.value
                )
              }
            />
          </label>

          <label className="actividad-date-filter">
            <span>Hasta</span>
            <input
              type="date"
              value={fechaHasta}
              min={fechaDesde || undefined}
              onChange={(evento) =>
                setFechaHasta(
                  evento.target.value
                )
              }
            />
          </label>

          <button
            type="button"
            className="secondary-button"
            disabled={!hayFiltros}
            onClick={limpiarFiltros}
          >
            Limpiar filtros
          </button>
        </div>

        <div className="actividad-admin-results">
          <div>
            <CalendarRange size={18} />

            Mostrando{" "}
            <strong>
              {actividadesFiltradas.length}
            </strong>{" "}
            de{" "}
            <strong>
              {actividades.length}
            </strong>{" "}
            registros
          </div>
        </div>

        {actividadesFiltradas.length === 0 ? (
          <div className="actividad-empty-state">
            <FilePenLine size={34} />

            <strong>
              No hay actividades para mostrar
            </strong>

            <span>
              Registra una actividad o modifica los filtros.
            </span>
          </div>
        ) : (
          <div className="actividad-tabla-wrapper">
            <table className="actividad-tabla actividad-admin-table">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Practicante</th>
                  <th>Matrícula</th>
                  <th>Carrera</th>
                  <th>Horario</th>
                  <th>Fecha</th>
                  <th>Actividad realizada</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {actividadesFiltradas.map(
                  (actividad) => (
                    <tr key={actividad.id}>
                      <td>
                        <strong>
                          {actividad.empresa}
                        </strong>
                      </td>

                      <td>
                        <strong>
                          {actividad.nombre}
                        </strong>
                      </td>

                      <td>
                        {actividad.matricula || "—"}
                      </td>

                      <td>
                        {actividad.carrera}
                      </td>

                      <td>
                        {actividad.horario}
                      </td>

                      <td>
                        {formatearFecha(
                          actividad.fecha
                        )}
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
                              editarRegistro(
                                actividad
                              )
                            }
                            title="Editar"
                            aria-label="Editar registro"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            className="actividad-action-button actividad-action-delete"
                            onClick={() =>
                              eliminarRegistro(
                                actividad
                              )
                            }
                            title="Eliminar"
                            aria-label="Eliminar registro"
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

export default ActividadDiariaAdmin;
