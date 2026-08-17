import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api`;

function AdminPanel({ usuario, onLogout }) {
  const [seccion, setSeccion] = useState("dashboard");

  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const [practicantes, setPracticantes] = useState([]);
  const [cargandoPracticantes, setCargandoPracticantes] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCarrera, setFiltroCarrera] = useState("");
  const [carreras, setCarreras] = useState([]);

  const [practicanteSeleccionado, setPracticanteSeleccionado] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const [editandoPracticante, setEditandoPracticante] = useState(null);
  const [guardandoPracticante, setGuardandoPracticante] = useState(false);

  // ==========================================
  // ACTIVIDADES SEMANALES DE BITÁCORA
  // ==========================================

  const [actividadesBitacora, setActividadesBitacora] = useState([]);
  const [cargandoActividades, setCargandoActividades] = useState(false);
  const [mostrandoFormularioActividad, setMostrandoFormularioActividad] = useState(false);
  const [editandoActividad, setEditandoActividad] = useState(null);
  const [guardandoActividad, setGuardandoActividad] = useState(false);

  const actividadInicial = {
    numero_semana: "",
    titulo: "",
    descripcion: "",
    fecha_inicio: "",
    fecha_fin: "",
    fecha_limite: "",
  };

  const [formActividad, setFormActividad] = useState(actividadInicial);

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ==========================================
  // CARGAR ESTADÍSTICAS
  // ==========================================

  const cargarEstadisticas = async () => {
    try {
      setCargando(true);
      setMensaje("");

      const response = await axios.get(
        `${API}/admin/estadisticas`,
        { headers }
      );

      setEstadisticas(response.data);
    } catch (error) {
      console.error(
        "Error cargando estadísticas:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudieron cargar las estadísticas."
      );
    } finally {
      setCargando(false);
    }
  };

  // ==========================================
  // CARGAR CARRERAS
  // ==========================================

  const cargarCarreras = async () => {
    try {
      const response = await axios.get(
        `${API}/admin/carreras`,
        { headers }
      );

      setCarreras(response.data.carreras || []);
    } catch (error) {
      console.error(
        "Error cargando carreras:",
        error
      );
    }
  };

  // ==========================================
  // CARGAR PRACTICANTES
  // ==========================================

  const cargarPracticantes = async (idCarrera = "") => {
    try {
      setCargandoPracticantes(true);
      setMensaje("");

      const url = idCarrera
        ? `${API}/admin/practicantes?id_carrera=${idCarrera}`
        : `${API}/admin/practicantes`;

      const response = await axios.get(
        url,
        { headers }
      );

      setPracticantes(
        response.data.practicantes || []
      );
    } catch (error) {
      console.error(
        "Error cargando practicantes:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudieron cargar los practicantes."
      );
    } finally {
      setCargandoPracticantes(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
    cargarCarreras();
    cargarPracticantes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ==========================================
  // FILTRAR PRACTICANTES EN PANTALLA
  // ==========================================

  const practicantesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) {
      return practicantes;
    }

    return practicantes.filter((practicante) => {
      const nombreCompleto = [
        practicante.nombre,
        practicante.apellido_paterno,
        practicante.apellido_materno,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        nombreCompleto.includes(texto) ||
        String(practicante.correo || "")
          .toLowerCase()
          .includes(texto) ||
        String(practicante.matricula || "")
          .toLowerCase()
          .includes(texto) ||
        String(practicante.carrera || "")
          .toLowerCase()
          .includes(texto)
      );
    });
  }, [practicantes, busqueda]);

  // ==========================================
  // CAMBIAR FILTRO DE CARRERA
  // ==========================================

  const cambiarFiltroCarrera = async (e) => {
    const valor = e.target.value;

    setFiltroCarrera(valor);
    setPracticanteSeleccionado(null);
    setEditandoPracticante(null);

    await cargarPracticantes(valor);
  };

  // ==========================================
  // VER DETALLE DE PRACTICANTE
  // ==========================================

  const verPracticante = async (idPracticante) => {
    try {
      setCargandoDetalle(true);
      setMensaje("");

      const response = await axios.get(
        `${API}/admin/practicantes/${idPracticante}`,
        { headers }
      );

      setPracticanteSeleccionado(
        response.data.practicante
      );

      setEditandoPracticante(null);
    } catch (error) {
      console.error(
        "Error cargando practicante:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudo cargar el practicante."
      );
    } finally {
      setCargandoDetalle(false);
    }
  };

  // ==========================================
  // INICIAR EDICIÓN
  // ==========================================

  const iniciarEdicion = async (idPracticante) => {
    try {
      setCargandoDetalle(true);
      setMensaje("");

      const response = await axios.get(
        `${API}/admin/practicantes/${idPracticante}`,
        { headers }
      );

      const practicante = response.data.practicante;

      setEditandoPracticante({
        ...practicante,
        fecha_inicio: practicante.fecha_inicio
          ? String(practicante.fecha_inicio).slice(0, 10)
          : "",
        fecha_fin: practicante.fecha_fin
          ? String(practicante.fecha_fin).slice(0, 10)
          : "",
      });

      setPracticanteSeleccionado(null);
    } catch (error) {
      console.error(
        "Error preparando edición:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudo cargar el practicante para editar."
      );
    } finally {
      setCargandoDetalle(false);
    }
  };

  // ==========================================
  // CAMBIAR CAMPOS DEL FORMULARIO
  // ==========================================

  const cambiarCampoEdicion = (e) => {
    const { name, value } = e.target;

    setEditandoPracticante((actual) => ({
      ...actual,
      [name]: value,
    }));
  };

  // ==========================================
  // GUARDAR CAMBIOS DEL PRACTICANTE
  // ==========================================

  const guardarPracticante = async (e) => {
    e.preventDefault();

    if (!editandoPracticante) {
      return;
    }

    try {
      setGuardandoPracticante(true);
      setMensaje("");

      const payload = {
        nombre: editandoPracticante.nombre,
        apellido_paterno:
          editandoPracticante.apellido_paterno,
        apellido_materno:
          editandoPracticante.apellido_materno || "",
        correo: editandoPracticante.correo,
        matricula:
          editandoPracticante.matricula || "",
        telefono:
          editandoPracticante.telefono || "",
        universidad:
          editandoPracticante.universidad || "",
        id_carrera: Number(
          editandoPracticante.id_carrera
        ),
        fecha_inicio:
          editandoPracticante.fecha_inicio,
        fecha_fin:
          editandoPracticante.fecha_fin || null,
        horas_requeridas: Number(
          editandoPracticante.horas_requeridas
        ),
      };

      const response = await axios.put(
        `${API}/admin/practicantes/${editandoPracticante.id_practicante}`,
        payload,
        { headers }
      );

      setMensaje(
        response.data.mensaje ||
          "Practicante actualizado correctamente."
      );

      setEditandoPracticante(null);

      await cargarPracticantes(filtroCarrera);
      await cargarEstadisticas();
    } catch (error) {
      console.error(
        "Error guardando practicante:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudo actualizar el practicante."
      );
    } finally {
      setGuardandoPracticante(false);
    }
  };

  // ==========================================
  // ACTIVAR / DESACTIVAR PRACTICANTE
  // ==========================================

  const cambiarEstadoPracticante = async (
    practicante
  ) => {
    const nuevoEstado =
      Number(practicante.activo) === 1 ? 0 : 1;

    const accion =
      nuevoEstado === 1
        ? "activar"
        : "desactivar";

    const confirmar = window.confirm(
      `¿Deseas ${accion} a ${practicante.nombre} ${practicante.apellido_paterno}?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setMensaje("");

      const response = await axios.put(
        `${API}/admin/practicantes/${practicante.id_practicante}/estado`,
        {
          activo: nuevoEstado,
        },
        { headers }
      );

      setMensaje(
        response.data.mensaje ||
          "Estado actualizado correctamente."
      );

      await cargarPracticantes(filtroCarrera);
      await cargarEstadisticas();

      if (
        practicanteSeleccionado?.id_practicante ===
        practicante.id_practicante
      ) {
        await verPracticante(
          practicante.id_practicante
        );
      }
    } catch (error) {
      console.error(
        "Error cambiando estado:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudo actualizar el estado."
      );
    }
  };

  // ==========================================
  // ACTIVIDADES SEMANALES DE BITÁCORA
  // ==========================================

  const cargarActividadesBitacora = async () => {
    try {
      setCargandoActividades(true);
      setMensaje("");

      const response = await axios.get(
        `${API}/admin/actividades-bitacora`,
        { headers }
      );

      setActividadesBitacora(
        response.data.actividades || []
      );
    } catch (error) {
      console.error(
        "Error cargando actividades de bitácora:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudieron cargar las actividades de bitácora."
      );
    } finally {
      setCargandoActividades(false);
    }
  };

  const abrirNuevaActividad = () => {
    setEditandoActividad(null);
    setFormActividad(actividadInicial);
    setMostrandoFormularioActividad(true);
    setMensaje("");
  };

  const abrirEdicionActividad = (actividad) => {
    const fechaLimite = actividad.fecha_limite
      ? String(actividad.fecha_limite)
          .replace("Z", "")
          .slice(0, 16)
      : "";

    setEditandoActividad(actividad);
    setFormActividad({
      numero_semana: actividad.numero_semana ?? "",
      titulo: actividad.titulo || "",
      descripcion: actividad.descripcion || "",
      fecha_inicio: actividad.fecha_inicio
        ? String(actividad.fecha_inicio).slice(0, 10)
        : "",
      fecha_fin: actividad.fecha_fin
        ? String(actividad.fecha_fin).slice(0, 10)
        : "",
      fecha_limite: fechaLimite,
    });
    setMostrandoFormularioActividad(true);
    setMensaje("");
  };

  const cambiarCampoActividad = (e) => {
    const { name, value } = e.target;

    setFormActividad((actual) => ({
      ...actual,
      [name]: value,
    }));
  };

  const guardarActividadBitacora = async (e) => {
    e.preventDefault();

    try {
      setGuardandoActividad(true);
      setMensaje("");

      const payload = {
        numero_semana: Number(formActividad.numero_semana),
        titulo: formActividad.titulo.trim(),
        descripcion: formActividad.descripcion.trim(),
        fecha_inicio: formActividad.fecha_inicio,
        fecha_fin: formActividad.fecha_fin,
        fecha_limite: formActividad.fecha_limite,
      };

      let response;

      if (editandoActividad) {
        response = await axios.put(
          `${API}/admin/actividades-bitacora/${editandoActividad.id_actividad}`,
          payload,
          { headers }
        );
      } else {
        response = await axios.post(
          `${API}/admin/actividades-bitacora`,
          payload,
          { headers }
        );
      }

      setMensaje(
        response.data.mensaje ||
          (editandoActividad
            ? "Actividad actualizada correctamente."
            : "Actividad creada correctamente.")
      );

      setMostrandoFormularioActividad(false);
      setEditandoActividad(null);
      setFormActividad(actividadInicial);

      await cargarActividadesBitacora();
    } catch (error) {
      console.error(
        "Error guardando actividad de bitácora:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudo guardar la actividad de bitácora."
      );
    } finally {
      setGuardandoActividad(false);
    }
  };

  const cambiarEstadoActividad = async (actividad) => {
    const nuevoEstado =
      Number(actividad.activa) === 1 ? 0 : 1;

    const accion =
      nuevoEstado === 1 ? "activar" : "desactivar";

    const confirmar = window.confirm(
      `¿Deseas ${accion} la actividad de la semana ${actividad.numero_semana}?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setMensaje("");

      const response = await axios.put(
        `${API}/admin/actividades-bitacora/${actividad.id_actividad}/estado`,
        { activa: nuevoEstado },
        { headers }
      );

      setMensaje(
        response.data.mensaje ||
          "Estado de la actividad actualizado correctamente."
      );

      await cargarActividadesBitacora();
    } catch (error) {
      console.error(
        "Error cambiando estado de actividad:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudo actualizar el estado de la actividad."
      );
    }
  };

  const eliminarActividadBitacora = async (actividad) => {
    const confirmar = window.confirm(
      `¿Deseas eliminar la actividad "${actividad.titulo}" de la semana ${actividad.numero_semana}?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setMensaje("");

      const response = await axios.delete(
        `${API}/admin/actividades-bitacora/${actividad.id_actividad}`,
        { headers }
      );

      setMensaje(
        response.data.mensaje ||
          "Actividad eliminada correctamente."
      );

      if (
        editandoActividad?.id_actividad ===
        actividad.id_actividad
      ) {
        setMostrandoFormularioActividad(false);
        setEditandoActividad(null);
        setFormActividad(actividadInicial);
      }

      await cargarActividadesBitacora();
    } catch (error) {
      console.error(
        "Error eliminando actividad de bitácora:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudo eliminar la actividad. Si ya tiene entregas asociadas, desactívala en lugar de eliminarla."
      );
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) {
      return "—";
    }

    const valor = String(fecha).slice(0, 10);
    const [anio, mes, dia] = valor.split("-");

    return anio && mes && dia
      ? `${dia}/${mes}/${anio}`
      : valor;
  };

  const formatearFechaHora = (fecha) => {
    if (!fecha) {
      return "—";
    }

    const valor = String(fecha);
    const fechaParte = valor.slice(0, 10);
    const horaParte =
      valor.includes("T")
        ? valor.slice(11, 16)
        : valor.slice(11, 16);

    return `${formatearFecha(fechaParte)}${
      horaParte ? ` ${horaParte}` : ""
    }`;
  };

  // ==========================================
  // TÍTULO DE LA SECCIÓN
  // ==========================================

  const obtenerTitulo = () => {
    switch (seccion) {
      case "dashboard":
        return "Dashboard";
      case "practicantes":
        return "Practicantes";
      case "bitacoras":
        return "Bitácoras";
      case "carreras":
        return "Carreras";
      case "estadisticas":
        return "Estadísticas";
      case "historial":
        return "Historial";
      default:
        return "Dashboard";
    }
  };

  return (
    <div className="app">
      {/* ==========================================
          SIDEBAR
      ========================================== */}

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">N</div>

          <div>
            <h1>NMR</h1>
            <span>Control de Prácticas</span>
          </div>
        </div>

        <nav className="navigation">
          <button
            className={`nav-item ${
              seccion === "dashboard" ? "active" : ""
            }`}
            onClick={() => setSeccion("dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className={`nav-item ${
              seccion === "practicantes" ? "active" : ""
            }`}
            onClick={() => setSeccion("practicantes")}
          >
            <span>👥</span>
            Practicantes
          </button>

          <button
            className={`nav-item ${
              seccion === "bitacoras" ? "active" : ""
            }`}
            onClick={() => {
              setSeccion("bitacoras");
              cargarActividadesBitacora();
            }}
          >
            <span>📋</span>
            Bitácoras
          </button>

          <button
            className={`nav-item ${
              seccion === "carreras" ? "active" : ""
            }`}
            onClick={() => setSeccion("carreras")}
          >
            <span>🎓</span>
            Carreras
          </button>

          <button
            className={`nav-item ${
              seccion === "estadisticas" ? "active" : ""
            }`}
            onClick={() => setSeccion("estadisticas")}
          >
            <span>📊</span>
            Estadísticas
          </button>

          <button
            className={`nav-item ${
              seccion === "historial" ? "active" : ""
            }`}
            onClick={() => setSeccion("historial")}
          >
            <span>🕘</span>
            Historial
          </button>
        </nav>

        <button
          className="logout-button"
          onClick={onLogout}
        >
          <span>↪</span>
          Cerrar sesión
        </button>
      </aside>

      {/* ==========================================
          CONTENIDO PRINCIPAL
      ========================================== */}

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="section-label">
              PANEL DEL ADMINISTRADOR
            </p>
            <h2>{obtenerTitulo()}</h2>
          </div>

          <div className="user-info">
            <div className="avatar">
              {usuario?.nombre?.charAt(0) || "A"}
            </div>

            <div>
              <strong>
                {usuario?.nombre || "Administrador"}
              </strong>
              <span>Administrador</span>
            </div>
          </div>
        </header>

        {mensaje && (
          <div className="message">
            {mensaje}
          </div>
        )}

        {/* ==========================================
            DASHBOARD
        ========================================== */}

        {seccion === "dashboard" && (
          <>
            <section className="welcome-card">
              <div>
                <p className="section-label">
                  BIENVENIDO
                </p>

                <h1>
                  Hola,{" "}
                  {usuario?.nombre || "Administrador"} 👋
                </h1>

                <p>
                  Desde este panel puedes administrar
                  practicantes, horas, bitácoras,
                  asistencias y carreras.
                </p>
              </div>

              <div className="welcome-icon">
                NMR
              </div>
            </section>

            {cargando ? (
              <section className="panel">
                <p>Cargando estadísticas...</p>
              </section>
            ) : (
              <section className="stats-grid">
                <div className="stat-card">
                  <span className="stat-icon">👥</span>
                  <div>
                    <p>Practicantes</p>
                    <strong>
                      {estadisticas?.total_practicantes ?? 0}
                    </strong>
                    <small>registrados</small>
                  </div>
                </div>

                <div className="stat-card">
                  <span className="stat-icon">✅</span>
                  <div>
                    <p>Activos</p>
                    <strong>
                      {estadisticas?.practicantes_activos ?? 0}
                    </strong>
                    <small>practicantes</small>
                  </div>
                </div>

                <div className="stat-card">
                  <span className="stat-icon">⏱</span>
                  <div>
                    <p>Horas registradas</p>
                    <strong>
                      {estadisticas?.total_horas_registradas ?? 0}
                    </strong>
                    <small>horas</small>
                  </div>
                </div>

                <div className="stat-card">
                  <span className="stat-icon">📋</span>
                  <div>
                    <p>Bitácoras pendientes</p>
                    <strong>
                      {estadisticas?.bitacoras_pendientes ?? 0}
                    </strong>
                    <small>por revisar</small>
                  </div>
                </div>

                <div className="stat-card">
                  <span className="stat-icon">✔</span>
                  <div>
                    <p>Bitácoras aprobadas</p>
                    <strong>
                      {estadisticas?.bitacoras_aprobadas ?? 0}
                    </strong>
                    <small>aprobadas</small>
                  </div>
                </div>

                <div className="stat-card">
                  <span className="stat-icon">✖</span>
                  <div>
                    <p>Bitácoras rechazadas</p>
                    <strong>
                      {estadisticas?.bitacoras_rechazadas ?? 0}
                    </strong>
                    <small>rechazadas</small>
                  </div>
                </div>
              </section>
            )}

            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="section-label">
                    RESUMEN
                  </p>
                  <h3>Estado general del sistema</h3>
                </div>
              </div>

              <p className="panel-description">
                Los datos mostrados en este dashboard
                provienen directamente de la base de
                datos del sistema NMR.
              </p>
            </section>
          </>
        )}

        {/* ==========================================
            PRACTICANTES
        ========================================== */}

        {seccion === "practicantes" && (
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
                  value={busqueda}
                  onChange={(e) =>
                    setBusqueda(e.target.value)
                  }
                  placeholder="Buscar por nombre, correo, matrícula o carrera"
                  style={{
                    flex: "1 1 320px",
                    padding: "12px",
                    border: "1px solid #d8dee9",
                    borderRadius: "8px",
                  }}
                />

                <select
                  value={filtroCarrera}
                  onChange={cambiarFiltroCarrera}
                  style={{
                    minWidth: "230px",
                    padding: "12px",
                    border: "1px solid #d8dee9",
                    borderRadius: "8px",
                  }}
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
                <div
                  style={{
                    overflowX: "auto",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: "950px",
                    }}
                  >
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
                      {practicantesFiltrados.map(
                        (practicante) => (
                          <tr
                            key={
                              practicante.id_practicante
                            }
                          >
                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
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
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              {practicante.correo}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              {practicante.matricula ||
                                "—"}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              {practicante.carrera}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              {practicante.universidad ||
                                "—"}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              {Number(
                                practicante.activo
                              ) === 1
                                ? "Activo"
                                : "Inactivo"}
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

                  <div className="profile-list">
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
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(230px, 1fr))",
                        gap: "16px",
                      }}
                    >
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

                    <div
                      style={{
                        marginTop: "20px",
                      }}
                    >
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
        )}

        {/* ==========================================
            BITÁCORAS
        ========================================== */}

        {seccion === "bitacoras" && (
          <>
            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="section-label">
                    ADMINISTRACIÓN
                  </p>
                  <h3>Actividades semanales de bitácora</h3>
                </div>

                <button
                  type="button"
                  onClick={abrirNuevaActividad}
                >
                  + Nueva actividad
                </button>
              </div>

              <p className="panel-description">
                Publica las actividades que deberán realizar los
                practicantes cada semana. Puedes crear, editar,
                activar, desactivar o eliminar una actividad.
              </p>

              {mostrandoFormularioActividad && (
                <form
                  onSubmit={guardarActividadBitacora}
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
                      gap: "12px",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <h4 style={{ margin: 0 }}>
                      {editandoActividad
                        ? "Editar actividad"
                        : "Nueva actividad semanal"}
                    </h4>

                    <button
                      type="button"
                      onClick={() => {
                        setMostrandoFormularioActividad(false);
                        setEditandoActividad(null);
                        setFormActividad(actividadInicial);
                      }}
                    >
                      Cancelar
                    </button>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(230px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    <label>
                      Número de semana
                      <input
                        type="number"
                        min="1"
                        step="1"
                        name="numero_semana"
                        value={formActividad.numero_semana}
                        onChange={cambiarCampoActividad}
                        required
                      />
                    </label>

                    <label>
                      Título
                      <input
                        type="text"
                        name="titulo"
                        value={formActividad.titulo}
                        onChange={cambiarCampoActividad}
                        placeholder="Ej. Bitácora semanal 3"
                        required
                      />
                    </label>

                    <label>
                      Fecha de inicio
                      <input
                        type="date"
                        name="fecha_inicio"
                        value={formActividad.fecha_inicio}
                        onChange={cambiarCampoActividad}
                        required
                      />
                    </label>

                    <label>
                      Fecha de fin
                      <input
                        type="date"
                        name="fecha_fin"
                        value={formActividad.fecha_fin}
                        onChange={cambiarCampoActividad}
                        required
                      />
                    </label>

                    <label>
                      Fecha límite
                      <input
                        type="datetime-local"
                        name="fecha_limite"
                        value={formActividad.fecha_limite}
                        onChange={cambiarCampoActividad}
                        required
                      />
                    </label>

                    <label
                      style={{
                        gridColumn: "1 / -1",
                      }}
                    >
                      Descripción
                      <textarea
                        name="descripcion"
                        value={formActividad.descripcion}
                        onChange={cambiarCampoActividad}
                        placeholder="Describe las actividades o instrucciones de la semana."
                        rows="5"
                        required
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          resize: "vertical",
                        }}
                      />
                    </label>
                  </div>

                  <div style={{ marginTop: "18px" }}>
                    <button
                      type="submit"
                      disabled={guardandoActividad}
                    >
                      {guardandoActividad
                        ? "Guardando..."
                        : editandoActividad
                          ? "Actualizar actividad"
                          : "Publicar actividad"}
                    </button>
                  </div>
                </form>
              )}

              {cargandoActividades ? (
                <p>Cargando actividades...</p>
              ) : actividadesBitacora.length === 0 ? (
                <p>
                  Todavía no hay actividades semanales registradas.
                </p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: "1050px",
                    }}
                  >
                    <thead>
                      <tr>
                        {[
                          "Semana",
                          "Título",
                          "Descripción",
                          "Inicio",
                          "Fin",
                          "Fecha límite",
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
                      {actividadesBitacora.map((actividad) => (
                        <tr key={actividad.id_actividad}>
                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                          >
                            {actividad.numero_semana}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                          >
                            <strong>{actividad.titulo}</strong>
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                              maxWidth: "320px",
                              whiteSpace: "normal",
                            }}
                          >
                            {actividad.descripcion}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                          >
                            {formatearFecha(
                              actividad.fecha_inicio
                            )}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                          >
                            {formatearFecha(
                              actividad.fecha_fin
                            )}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                          >
                            {formatearFechaHora(
                              actividad.fecha_limite
                            )}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                          >
                            {Number(actividad.activa) === 1
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
                                  abrirEdicionActividad(
                                    actividad
                                  )
                                }
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  cambiarEstadoActividad(
                                    actividad
                                  )
                                }
                              >
                                {Number(actividad.activa) === 1
                                  ? "Desactivar"
                                  : "Activar"}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  eliminarActividadBitacora(
                                    actividad
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

            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="section-label">
                    ENTREGAS
                  </p>
                  <h3>Bitácoras de practicantes</h3>
                </div>
              </div>

              <p className="panel-description">
                En esta sección conectaremos las entregas PDF de
                los practicantes para visualizarlas, aprobarlas o
                rechazarlas.
              </p>

              <p>
                Las actividades semanales ya pueden administrarse
                desde este panel.
              </p>
            </section>
          </>
        )}

        {/* ==========================================
            CARRERAS
        ========================================== */}

        {seccion === "carreras" && (
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="section-label">
                  CONFIGURACIÓN
                </p>
                <h3>Carreras</h3>
              </div>
            </div>

            <p className="panel-description">
              Aquí podrás crear, editar, activar
              y desactivar carreras.
            </p>

            <p>🚧 Módulo en desarrollo.</p>
          </section>
        )}

        {/* ==========================================
            ESTADÍSTICAS
        ========================================== */}

        {seccion === "estadisticas" && (
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="section-label">
                  INFORMACIÓN
                </p>
                <h3>
                  Estadísticas generales
                </h3>
              </div>
            </div>

            <div className="profile-list">
              <div>
                <span>
                  Total de practicantes
                </span>
                <strong>
                  {estadisticas?.total_practicantes ?? 0}
                </strong>
              </div>

              <div>
                <span>
                  Practicantes activos
                </span>
                <strong>
                  {estadisticas?.practicantes_activos ?? 0}
                </strong>
              </div>

              <div>
                <span>
                  Horas registradas
                </span>
                <strong>
                  {estadisticas?.total_horas_registradas ?? 0}
                </strong>
              </div>

              <div>
                <span>
                  Bitácoras pendientes
                </span>
                <strong>
                  {estadisticas?.bitacoras_pendientes ?? 0}
                </strong>
              </div>

              <div>
                <span>
                  Bitácoras aprobadas
                </span>
                <strong>
                  {estadisticas?.bitacoras_aprobadas ?? 0}
                </strong>
              </div>

              <div>
                <span>
                  Bitácoras rechazadas
                </span>
                <strong>
                  {estadisticas?.bitacoras_rechazadas ?? 0}
                </strong>
              </div>
            </div>
          </section>
        )}

        {/* ==========================================
            HISTORIAL
        ========================================== */}

        {seccion === "historial" && (
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="section-label">
                  ACTIVIDAD
                </p>
                <h3>
                  Historial de actividades
                </h3>
              </div>
            </div>

            <p className="panel-description">
              Aquí podrás consultar los cambios y
              actividades realizadas dentro del
              sistema.
            </p>

            <p>🚧 Módulo en desarrollo.</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default AdminPanel;
