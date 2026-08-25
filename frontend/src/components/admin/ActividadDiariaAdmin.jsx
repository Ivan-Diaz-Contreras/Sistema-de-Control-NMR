import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarRange,
  Download,
  FilePenLine,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import axios from "axios";

const LIMITE_ACTIVIDAD = 300;
const MINIMO_ACTIVIDAD = 10;

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

const API = `${API_URL}/api`;

const obtenerFechaHoy = () => {
  const fecha = new Date();

  return [
    fecha.getFullYear(),
    String(fecha.getMonth() + 1).padStart(2, "0"),
    String(fecha.getDate()).padStart(2, "0"),
  ].join("-");
};

const FORMULARIO_INICIAL = {
  id_practicante: "",
  empresa: "NMR CONSULTORES",
  nombre: "",
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

function ActividadDiariaAdmin({
  token,
}) {
  const tokenSesion =
    token || localStorage.getItem("token");

  const [actividades, setActividades] =
    useState([]);

  const [listaPracticantes, setListaPracticantes] =
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

  const cargarActividades = useCallback(async () => {
    if (!tokenSesion) {
      setActividades([]);
      return;
    }

    try {
      const response = await axios.get(
        `${API}/actividades-diarias/admin`,
        {
          headers: {
            Authorization: `Bearer ${tokenSesion}`,
          },
        }
      );

      const registros = Array.isArray(
        response.data?.actividades
      )
        ? response.data.actividades
        : [];

      setActividades(
        registros.map((actividad) => ({
          ...actividad,
          nombre:
            actividad.nombre_completo ||
            [
              actividad.nombre,
              actividad.apellido_paterno,
              actividad.apellido_materno,
            ]
              .filter(Boolean)
              .join(" "),
          fecha: String(
            actividad.fecha || ""
          ).slice(0, 10),
        }))
      );
    } catch (errorPeticion) {
      console.error(
        "Error cargando actividades diarias del administrador:",
        errorPeticion
      );

      setError(
        errorPeticion.response?.data?.mensaje ||
          "No se pudieron cargar las actividades diarias."
      );
    }
  }, [tokenSesion]);

  const cargarPracticantes = useCallback(async () => {
    if (!tokenSesion) {
      setListaPracticantes([]);
      return;
    }

    try {
      const response = await axios.get(
        `${API}/admin/practicantes`,
        {
          headers: {
            Authorization: `Bearer ${tokenSesion}`,
          },
        }
      );

      setListaPracticantes(
        Array.isArray(response.data?.practicantes)
          ? response.data.practicantes
          : []
      );
    } catch (errorPeticion) {
      console.error(
        "Error cargando practicantes para actividad diaria:",
        errorPeticion
      );
    }
  }, [tokenSesion]);

  useEffect(() => {
    cargarActividades();
    cargarPracticantes();
  }, [
    cargarActividades,
    cargarPracticantes,
  ]);

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

    if (name === "id_practicante") {
      const practicanteSeleccionado =
        listaPracticantes.find(
          (practicante) =>
            String(
              practicante.id_practicante
            ) === String(value)
        );

      setFormulario((actual) => ({
        ...actual,
        id_practicante: value,
        empresa: "NMR CONSULTORES",
        nombre: practicanteSeleccionado
          ? [
              practicanteSeleccionado.nombre,
              practicanteSeleccionado.apellido_paterno,
              practicanteSeleccionado.apellido_materno,
            ]
              .filter(Boolean)
              .join(" ")
          : "",
        carrera:
          practicanteSeleccionado?.carrera ||
          practicanteSeleccionado?.nombre_carrera ||
          "",
        horario:
          practicanteSeleccionado?.horario ||
          "Se obtiene del sistema",
      }));

      setError("");
      setMensaje("");
      return;
    }

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
      id_practicante:
        actividad.id_practicante || "",
      empresa:
        actividad.empresa || "",
      nombre:
        actividad.nombre || "",
      carrera:
        actividad.carrera || "",
      horario:
        actividad.horario || "",
      fecha:
        String(
          actividad.fecha || ""
        ).slice(0, 10),
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

  const guardarRegistro = async (evento) => {
    evento.preventDefault();

    const datos = {
      id_practicante:
        formulario.id_practicante,
      fecha:
        formulario.fecha,
      actividad:
        formulario.actividad
          .trim()
          .replace(/\s+/g, " "),
    };

    if (
      !idEditando &&
      !datos.id_practicante
    ) {
      setError(
        "Selecciona un practicante."
      );
      return;
    }

    if (
      !datos.fecha ||
      !datos.actividad
    ) {
      setError(
        "Completa todos los campos obligatorios."
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

    const duplicado =
      actividades.find(
        (actividad) =>
          String(
            actividad.id_practicante
          ) === String(
            datos.id_practicante
          ) &&
          String(
            actividad.fecha || ""
          ).slice(0, 10) ===
            datos.fecha &&
          actividad.id !== idEditando
      );

    if (duplicado) {
      setError(
        "Ese practicante ya tiene una actividad registrada en la fecha seleccionada."
      );
      return;
    }

    try {
      if (idEditando) {
        await axios.put(
          `${API}/actividades-diarias/admin/${idEditando}`,
          {
            fecha: datos.fecha,
            actividad: datos.actividad,
          },
          {
            headers: {
              Authorization: `Bearer ${tokenSesion}`,
            },
          }
        );
      } else {
        await axios.post(
          `${API}/actividades-diarias/admin`,
          {
            id_practicante:
              Number(
                datos.id_practicante
              ),
            fecha: datos.fecha,
            actividad: datos.actividad,
          },
          {
            headers: {
              Authorization: `Bearer ${tokenSesion}`,
            },
          }
        );
      }

      setMensaje(
        idEditando
          ? "Registro actualizado correctamente."
          : "Registro agregado correctamente."
      );

      setMostrandoFormulario(false);
      setIdEditando(null);
      setFormulario(FORMULARIO_INICIAL);

      await cargarActividades();
    } catch (errorPeticion) {
      console.error(
        "Error guardando actividad diaria desde administrador:",
        errorPeticion
      );

      setError(
        errorPeticion.response?.data?.mensaje ||
          "No se pudo guardar el registro."
      );
    }
  };

  const eliminarRegistro = async (
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

    try {
      await axios.delete(
        `${API}/actividades-diarias/admin/${actividad.id}`,
        {
          headers: {
            Authorization: `Bearer ${tokenSesion}`,
          },
        }
      );

      if (idEditando === actividad.id) {
        cancelarFormulario();
      }

      setMensaje(
        "Registro eliminado correctamente."
      );

      await cargarActividades();
    } catch (errorPeticion) {
      console.error(
        "Error eliminando actividad diaria desde administrador:",
        errorPeticion
      );

      setError(
        errorPeticion.response?.data?.mensaje ||
          "No se pudo eliminar el registro."
      );
    }
  };

  const descargarCSV = () => {
    if (actividadesFiltradas.length === 0) {
      setError(
        "No hay actividades para exportar con los filtros seleccionados."
      );
      return;
    }

    setError("");

    const protegerCeldaCSV = (valor) => {
      let texto = String(
        valor ?? ""
      );

      /*
       * Evita que Excel interprete el contenido
       * de los usuarios como una formula.
       */
      if (/^[=+\-@\t\r]/.test(texto)) {
        texto = "'" + texto;
      }

      return (
        '"' +
        texto.replaceAll('"', '""') +
        '"'
      );
    };

    const encabezados = [
      "Empresa",
      "Nombre",
      "Carrera",
      "Horario",
      "Fecha",
      "Actividad realizada",
    ];

    const filas =
      actividadesFiltradas.map(
        (actividad) => [
          actividad.empresa ||
            "NMR CONSULTORES",
          actividad.nombre ||
            "Sin nombre",
          actividad.carrera ||
            "No registrada",
          actividad.horario ||
            "No registrado",
          formatearFecha(
            actividad.fecha
          ),
          actividad.actividad || "",
        ]
      );

    const contenidoCSV = [
      encabezados,
      ...filas,
    ]
      .map((fila) =>
        fila
          .map(protegerCeldaCSV)
          .join(",")
      )
      .join("\r\n");

    const fechaArchivo = (fecha) =>
      String(fecha || "")
        .replaceAll("-", "");

    let nombreArchivo =
      "Actividades_Diarias";

    if (fechaDesde && fechaHasta) {
      nombreArchivo +=
        "_" +
        fechaArchivo(fechaDesde) +
        "_al_" +
        fechaArchivo(fechaHasta);
    } else if (fechaDesde) {
      nombreArchivo +=
        "_desde_" +
        fechaArchivo(fechaDesde);
    } else if (fechaHasta) {
      nombreArchivo +=
        "_hasta_" +
        fechaArchivo(fechaHasta);
    } else {
      nombreArchivo +=
        "_" +
        fechaArchivo(
          obtenerFechaHoy()
        );
    }

    /*
     * BOM UTF-8 para conservar acentos
     * al abrir el CSV en Excel.
     */
    const archivo = new Blob(
      [
        String.fromCodePoint(0xfeff),
        "sep=,\r\n",
        contenidoCSV,
      ],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(archivo);

    const enlace =
      document.createElement("a");

    enlace.href = url;
    enlace.download =
      nombreArchivo + ".csv";

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    URL.revokeObjectURL(url);
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
                  readOnly
                  maxLength="60"
                  onChange={cambiarCampo}
                />
              </label>

              <label>
                Practicante *
                <select
                  name="id_practicante"
                  value={formulario.id_practicante}
                  onChange={cambiarCampo}
                  disabled={Boolean(idEditando)}
                >
                  <option value="">
                    Selecciona un practicante
                  </option>

                  {listaPracticantes.map(
                    (practicante) => (
                      <option
                        key={
                          practicante.id_practicante
                        }
                        value={
                          practicante.id_practicante
                        }
                      >
                        {[
                          practicante.nombre,
                          practicante.apellido_paterno,
                          practicante.apellido_materno,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                Carrera *
                <input
                  name="carrera"
                  value={formulario.carrera}
                  readOnly
                  maxLength="80"
                  onChange={cambiarCampo}
                />
              </label>

              <label>
                Horario *
                <input
                  name="horario"
                  value={formulario.horario}
                  readOnly
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
              placeholder="Buscar por practicante, empresa, carrera o actividad"
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

          <button
            type="button"
            className="secondary-button"
            onClick={descargarCSV}
            disabled={
              actividadesFiltradas.length === 0
            }
          >
            <Download size={18} />
            Descargar CSV
          </button>
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