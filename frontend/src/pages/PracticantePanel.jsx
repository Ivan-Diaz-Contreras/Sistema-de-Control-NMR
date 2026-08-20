import {
  useCallback,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import "../App.css";
import logoNMR from "../assets/logo-nmr.png";
import { User } from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

const API = `${API_URL}/api`;

function PracticantePanel({
  usuario,
  token,
  onLogout,
  onUsuarioActualizado,
}) {

  const [perfil, setPerfil] = useState(null);
  const [avance, setAvance] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);
  const [procesandoAsistencia, setProcesandoAsistencia] = useState(false);
  const [seccion, setSeccion] = useState("dashboard");

  // ==========================================
  // SEGURIDAD / CAMBIO DE CONTRASEÑA
  // ==========================================

  const [formPassword, setFormPassword] =
    useState({
      password_actual: "",
      password_nueva: "",
      confirmar_password: "",
    });

  const [mostrarPasswords, setMostrarPasswords] =
    useState(false);

  const [
    guardandoPassword,
    setGuardandoPassword,
  ] = useState(false);

  // ==========================================
  // BITÁCORAS DEL PRACTICANTE
  // ==========================================

  const [actividadesBitacora, setActividadesBitacora] = useState([]);
  const [bitacoras, setBitacoras] = useState([]);
  const [cargandoBitacoras, setCargandoBitacoras] = useState(false);
  const [subiendoBitacora, setSubiendoBitacora] = useState(null);
  const [archivoBitacora, setArchivoBitacora] = useState(null);
//const headers = {
  //  Authorization: `Bearer ${token}`,
  //};

useEffect(() => {
  if (!token || usuario?.rol !== "Practicante") {
    return;
  }

  const cargarDatos = async () => {
    try {
      setCargando(true);

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [perfilResponse, avanceResponse] = await Promise.all([
        axios.get(`${API}/practicantes/perfil`, { headers }),
        axios.get(`${API}/practicantes/avance`, { headers }),
      ]);

      const perfilCargado =
        perfilResponse.data.perfil;

      setPerfil(perfilCargado);
      setAvance(avanceResponse.data);

      if (
        Number(
          perfilCargado?.debe_cambiar_password ||
            usuario?.debe_cambiar_password ||
            0
        ) === 1
      ) {
        setSeccion("perfil");
        setMensaje(
          "Por seguridad debes cambiar la contraseña temporal antes de continuar."
        );
      }
    } catch (error) {
      console.error(error);

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        setPerfil(null);
        setAvance(null);

        setMensaje(
          error.response?.data?.mensaje ||
            "Tu sesión ya no es válida. Inicia sesión nuevamente."
        );

        onLogout();
      } else {
        setMensaje(
          error.response?.data?.mensaje ||
            "No se pudieron cargar los datos del practicante."
        );
      }
    } finally {
      setCargando(false);
    }
  };

  cargarDatos();
}, [token, usuario?.rol]);

const registrarEntrada = async () => {
  try {
    setProcesandoAsistencia(true);
    setMensaje("");

    const response = await axios.post(
      `${API}/practicantes/asistencia/entrada`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMensaje(
      response.data.mensaje ||
        "Entrada registrada correctamente."
    );
  } catch (error) {
    console.error(error);

    setMensaje(
      error.response?.data?.mensaje ||
        "No se pudo registrar la entrada."
    );
  } finally {
    setProcesandoAsistencia(false);
  }
};

const registrarSalida = async () => {
  try {
    setProcesandoAsistencia(true);
    setMensaje("");

    const response = await axios.post(
      `${API}/practicantes/asistencia/salida`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMensaje(
      response.data.mensaje ||
        "Salida registrada correctamente."
    );
  } catch (error) {
    console.error(error);

    setMensaje(
      error.response?.data?.mensaje ||
        "No se pudo registrar la salida."
    );
  } finally {
    setProcesandoAsistencia(false);
  }
};

const cargarBitacorasPracticante = useCallback(async () => {
  if (!token || usuario?.rol !== "Practicante") {
    return;
  }

  try {
    setCargandoBitacoras(true);
    setMensaje("");

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const [actividadesResponse, bitacorasResponse] =
      await Promise.all([
        axios.get(
          `${API}/practicantes/bitacoras/actividades`,
          { headers }
        ),
        axios.get(
          `${API}/practicantes/bitacoras`,
          { headers }
        ),
      ]);

    setActividadesBitacora(
      actividadesResponse.data.actividades || []
    );

    setBitacoras(
      bitacorasResponse.data.bitacoras || []
    );
  } catch (error) {
    console.error(
      "Error cargando bitácoras del practicante:",
      error
    );

    setMensaje(
      error.response?.data?.mensaje ||
        "No se pudieron cargar las actividades de bitácora."
    );
  } finally {
    setCargandoBitacoras(false);
  }
}, [token, usuario?.rol]);

useEffect(() => {
  if (
    seccion === "bitacoras" &&
    token &&
    usuario?.rol === "Practicante"
  ) {
    cargarBitacorasPracticante();
  }
}, [
  seccion,
  token,
  usuario?.rol,
  cargarBitacorasPracticante,
]);



const cambiarCampoPassword = (e) => {
  const { name, value } = e.target;

  setFormPassword((actual) => ({
    ...actual,
    [name]: value,
  }));
};

const cambiarSeccion = (nuevaSeccion) => {
  const cambioObligatorio =
    Number(
      perfil?.debe_cambiar_password ||
        usuario?.debe_cambiar_password ||
        0
    ) === 1;

  if (
    cambioObligatorio &&
    nuevaSeccion !== "perfil"
  ) {
    setSeccion("perfil");
    setMensaje(
      "Debes cambiar tu contraseña temporal antes de utilizar las demás secciones."
    );
    return;
  }

  setSeccion(nuevaSeccion);
  setMensaje("");
};

const guardarNuevaPassword = async (e) => {
  e.preventDefault();

  if (
    formPassword.password_nueva !==
    formPassword.confirmar_password
  ) {
    setMensaje(
      "La nueva contraseña y su confirmación no coinciden."
    );
    return;
  }

  if (formPassword.password_nueva.length < 8) {
    setMensaje(
      "La nueva contraseña debe tener al menos 8 caracteres."
    );
    return;
  }

  try {
    setGuardandoPassword(true);
    setMensaje("");

    const response = await axios.put(
      `${API}/practicantes/password`,
      {
        password_actual:
          formPassword.password_actual,
        password_nueva:
          formPassword.password_nueva,
        confirmar_password:
          formPassword.confirmar_password,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setPerfil((actual) => ({
      ...actual,
      debe_cambiar_password: 0,
    }));

    onUsuarioActualizado?.({
      debe_cambiar_password: 0,
    });

    setFormPassword({
      password_actual: "",
      password_nueva: "",
      confirmar_password: "",
    });

    setMostrarPasswords(false);

    setMensaje(
      response.data.mensaje ||
        "Contraseña actualizada correctamente."
    );
  } catch (error) {
    console.error(
      "Error cambiando contraseña:",
      error
    );

    setMensaje(
      error.response?.data?.mensaje ||
        "No se pudo cambiar la contraseña."
    );
  } finally {
    setGuardandoPassword(false);
  }
};

const seleccionarArchivoBitacora = (
  idActividad,
  archivo
) => {
  setSubiendoBitacora(idActividad);
  setArchivoBitacora(archivo || null);
  setMensaje("");
};

const subirPdfBitacora = async (
  idActividad
) => {
  if (!archivoBitacora) {
    setMensaje(
      "Selecciona un archivo PDF antes de subir la bitácora."
    );
    return;
  }

  try {
    setMensaje("");

    const formData = new FormData();

    formData.append(
      "id_actividad",
      String(idActividad)
    );

    formData.append(
      "archivo",
      archivoBitacora
    );

    const response = await axios.post(
      `${API}/practicantes/bitacoras`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMensaje(
      response.data.mensaje ||
        "Bitácora subida correctamente."
    );

    setSubiendoBitacora(null);
    setArchivoBitacora(null);

    await cargarBitacorasPracticante();
  } catch (error) {
    console.error(
      "Error subiendo bitácora:",
      error
    );

    setMensaje(
      error.response?.data?.mensaje ||
        "No se pudo subir la bitácora."
    );
  }
};

const abrirPdfBitacora = async (
  idBitacora
) => {
  try {
    const response = await axios.get(
      `${API}/practicantes/bitacoras/${idBitacora}/archivo`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      }
    );

    const url = URL.createObjectURL(
      new Blob([response.data], {
        type: "application/pdf",
      })
    );

    window.open(url, "_blank");

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60000);
  } catch (error) {
    console.error(
      "Error abriendo PDF:",
      error
    );

    setMensaje(
      error.response?.data?.mensaje ||
        "No se pudo abrir el archivo PDF."
    );
  }
};

const formatearFechaBitacora = (fecha) => {
  if (!fecha) {
    return "—";
  }

  const valor = String(fecha).slice(0, 10);
  const [anio, mes, dia] = valor.split("-");

  return anio && mes && dia
    ? `${dia}/${mes}/${anio}`
    : valor;
};

const formatearFechaHoraBitacora = (fecha) => {
  if (!fecha) {
    return "—";
  }

  const fechaObj = new Date(fecha);

  if (Number.isNaN(fechaObj.getTime())) {
    return "—";
  }

  return fechaObj.toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};



  if (cargando) {
    return (
      <div className="loading-screen">
        <div className="loading-card">
          <div className="spinner"></div>
          <h2>Cargando sistema...</h2>
          <p>Conectando con el servidor.</p>
        </div>
      </div>
    );
  }

  const porcentaje = avance?.porcentaje_avance || 0;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
             <img src={logoNMR} alt="NMR Consultores" />
          </div>

          <div>
            <span>
              Control de<br /> 
              Prácticas
              </span>
          </div>
        </div>

        <nav className="navigation">
          <button
            className={`nav-item ${
              seccion === "dashboard" ? "active" : ""
            }`}
            onClick={() => cambiarSeccion("dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className={`nav-item ${
              seccion === "perfil" ? "active" : ""
            }`}
            onClick={() => cambiarSeccion("perfil")}
          >
            <span>👤</span>
            Mi perfil
          </button>

          <button
            className={`nav-item ${
              seccion === "asistencia" ? "active" : ""
            }`}
            onClick={() => cambiarSeccion("asistencia")}
          >
            <span>🕘</span>
            Asistencia
          </button>

          <button
            className={`nav-item ${
              seccion === "horas" ? "active" : ""
            }`}
            onClick={() => cambiarSeccion("horas")}
          >
            <span>⏱️</span>
            Mis horas
          </button>

          <button
            className={`nav-item ${
              seccion === "bitacoras" ? "active" : ""
            }`}
            onClick={() => cambiarSeccion("bitacoras")}
          >
            <span>📋</span>
            Bitácoras
          </button>

        </nav>

        <button className="logout-button" onClick={onLogout}>
          <span>↪</span>
          Cerrar sesión
        </button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="section-label">PANEL DEL PRACTICANTE</p>

            <h2>
              {seccion === "dashboard"
                ? "Dashboard"
                : seccion === "perfil"
                ? "Mi perfil"
                : seccion === "asistencia"
                ? "Asistencia"
                : seccion === "horas"
                ? "Mis horas"
                : seccion === "bitacoras"
                ? "Bitácoras"
                : "Evidencias"}
            </h2>
          </div>

          <div className="user-info">
            <div className="avatar">
              <User size={22} />
            </div>

            <div>
              <strong>
                {perfil?.nombre || usuario?.nombre || "Usuario"}
              </strong>

              <span>Practicante</span>
            </div>
          </div>
        </header>

        {mensaje && <div className="message">{mensaje}</div>}

        {seccion === "dashboard" && (
          <>
            <section className="welcome-card">
              <div>
                <p className="section-label">BIENVENIDO</p>

                <h1>
                  Hola, {perfil?.nombre || usuario?.nombre || "Samuel"} 👋
                </h1>

                <p>
                  Aquí puedes consultar tu progreso y administrar tus
                  actividades de prácticas profesionales.
                </p>
              </div>

              <div className="welcome-icon">NMR</div>
            </section>

            <section className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">⏱️</span>

                <div>
                  <p>Horas acumuladas</p>
                  <strong>
                    {avance?.horas_acumuladas?.toFixed(2) || "0.00"}
                  </strong>
                  <small>horas</small>
                </div>
              </div>

              <div className="stat-card">
                <span className="stat-icon">📊</span>

                <div>
                  <p>Avance</p>
                  <strong>{porcentaje}%</strong>
                  <small>completado</small>
                </div>
              </div>

              <div className="stat-card">
                <span className="stat-icon">📊</span>

                <div>
                  <p>Horas restantes</p>
                  <strong>
                    {avance?.horas_restantes?.toFixed(2) || "0.00"}
                  </strong>
                  <small>horas</small>
                </div>
              </div>
            </section>

            <section className="content-grid">
              <div className="panel">
                <div className="panel-header">
                  <div>
                    <p className="section-label">ASISTENCIA</p>
                    <h3>Control de asistencia</h3>
                  </div>

                  <span className="status-dot">● Disponible</span>
                </div>

                <p className="panel-description">
                  Registra tu entrada y salida de la jornada desde este
                  panel.
                </p>

                <div className="attendance-buttons">
                  <button
                    className="attendance-button entry"
                    onClick={registrarEntrada}
                    disabled={procesandoAsistencia}
                  >
                    <span>→</span>
                    Registrar entrada
                  </button>

                  <button
                    className="attendance-button exit"
                    onClick={registrarSalida}
                    disabled={procesandoAsistencia}
                  >
                    <span>←</span>
                    Registrar salida
                  </button>
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <div>
                    <p className="section-label">MI INFORMACIÓN</p>
                    <h3>Perfil</h3>
                  </div>
                </div>

                {perfil ? (
                  <div className="profile-list">
                    <div>
                      <span>Nombre completo</span>
                      <strong>
                        {perfil.nombre} {perfil.apellido_paterno}{" "}
                        {perfil.apellido_materno || ""}
                      </strong>
                    </div>

                    <div>
                      <span>Correo</span>
                      <strong>{perfil.correo}</strong>
                    </div>

                    <div>
                      <span>Matrícula</span>
                      <strong>
                        {perfil.matricula || "No registrada"}
                      </strong>
                    </div>

                    <div>
                      <span>Carrera</span>
                      <strong>{perfil.carrera}</strong>
                    </div>

                    <div>
                      <span>Universidad</span>
                      <strong>
                        {perfil.universidad || "No registrada"}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <p>No se pudo cargar el perfil.</p>
                )}
              </div>
            </section>

            <section className="progress-panel">
              <div className="progress-header">
                <div>
                  <p className="section-label">PROGRESO</p>
                  <h3>Avance de prácticas profesionales</h3>
                </div>

                <strong>{porcentaje}%</strong>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${porcentaje}%` }}
                ></div>
              </div>

              <div className="progress-footer">
                <span>
                  {avance?.horas_acumuladas?.toFixed(2) || "0.00"} horas
                  acumuladas
                </span>

                <span>
                  {avance?.horas_requeridas?.toFixed(2) || "0.00"} horas
                  requeridas
                </span>
              </div>
            </section>
          </>
        )}

        {seccion === "perfil" && (
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="section-label">INFORMACIÓN PERSONAL</p>
                <h3>Mi perfil</h3>
              </div>
            </div>

            {perfil ? (
              <div className="profile-list">
                <div>
                  <span>Nombre completo</span>
                  <strong>
                    {perfil.nombre} {perfil.apellido_paterno}{" "}
                    {perfil.apellido_materno || ""}
                  </strong>
                </div>

                <div>
                  <span>Correo electrónico</span>
                  <strong>{perfil.correo}</strong>
                </div>

                <div>
                  <span>Matrícula</span>
                  <strong>
                    {perfil.matricula || "No registrada"}
                  </strong>
                </div>

                <div>
                  <span>Carrera</span>
                  <strong>{perfil.carrera}</strong>
                </div>

                <div>
                  <span>Universidad</span>
                  <strong>
                    {perfil.universidad || "No registrada"}
                  </strong>
                </div>

                <div>
                  <span>Teléfono</span>
                  <strong>
                    {perfil.telefono || "No registrado"}
                  </strong>
                </div>
              </div>
            ) : (
              <p>No se pudo cargar el perfil.</p>
            )}

            <div className="password-section">
              <div className="password-section-header">
                <div>
                  <p className="section-label">
                    SEGURIDAD
                  </p>
                  <h3>Cambiar contraseña</h3>
                </div>

                {Number(
                  perfil?.debe_cambiar_password ||
                    usuario?.debe_cambiar_password ||
                    0
                ) === 1 && (
                  <span className="password-required-badge">
                    Cambio obligatorio
                  </span>
                )}
              </div>

              <p className="panel-description">
                Tu nueva contraseña es privada. El
                administrador no podrá verla después de
                que la cambies.
              </p>

              <form
                onSubmit={guardarNuevaPassword}
                className="password-form"
              >
                <label>
                  Contraseña actual
                  <input
                    type={
                      mostrarPasswords
                        ? "text"
                        : "password"
                    }
                    name="password_actual"
                    value={
                      formPassword.password_actual
                    }
                    onChange={cambiarCampoPassword}
                    autoComplete="current-password"
                    required
                  />
                </label>

                <label>
                  Nueva contraseña
                  <input
                    type={
                      mostrarPasswords
                        ? "text"
                        : "password"
                    }
                    name="password_nueva"
                    value={
                      formPassword.password_nueva
                    }
                    onChange={cambiarCampoPassword}
                    autoComplete="new-password"
                    minLength="8"
                    required
                  />
                </label>

                <label>
                  Confirmar nueva contraseña
                  <input
                    type={
                      mostrarPasswords
                        ? "text"
                        : "password"
                    }
                    name="confirmar_password"
                    value={
                      formPassword.confirmar_password
                    }
                    onChange={cambiarCampoPassword}
                    autoComplete="new-password"
                    minLength="8"
                    required
                  />
                </label>

                <label className="password-show-option">
                  <input
                    type="checkbox"
                    checked={mostrarPasswords}
                    onChange={(e) =>
                      setMostrarPasswords(
                        e.target.checked
                      )
                    }
                  />
                  Mostrar contraseñas mientras escribo
                </label>

                <div className="admin-form-actions">
                  <button
                    type="submit"
                    disabled={guardandoPassword}
                  >
                    {guardandoPassword
                      ? "Actualizando..."
                      : "Cambiar contraseña"}
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {seccion === "asistencia" && (
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="section-label">CONTROL DE HORARIO</p>
                <h3>Asistencia</h3>
              </div>

              <span className="status-dot">● Disponible</span>
            </div>

            <p className="panel-description">
              Registra tu entrada y salida de la jornada.
            </p>

            <div className="attendance-buttons">
              <button
                className="attendance-button entry"
                onClick={registrarEntrada}
                disabled={procesandoAsistencia}
              >
                <span>→</span>
                Registrar entrada
              </button>

              <button
                className="attendance-button exit"
                onClick={registrarSalida}
                disabled={procesandoAsistencia}
              >
                <span>←</span>
                Registrar salida
              </button>
            </div>
          </section>
        )}

        {seccion === "horas" && (
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="section-label">CONTROL DE HORAS</p>
                <h3>Mis horas</h3>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">⏱️</span>
                <div>
                  <p>Horas acumuladas</p>
                  <strong>
                    {avance?.horas_acumuladas?.toFixed(2) || "0.00"}
                  </strong>
                  <small>horas</small>
                </div>
              </div>

              <div className="stat-card">
                <span className="stat-icon">📊</span>
                <div>
                  <p>Horas requeridas</p>
                  <strong>
                    {avance?.horas_requeridas?.toFixed(2) || "0.00"}
                  </strong>
                  <small>horas</small>
                </div>
              </div>

              <div className="stat-card">
                <span className="stat-icon">📊</span>
                <div>
                  <p>Avance</p>
                  <strong>{porcentaje}%</strong>
                  <small>completado</small>
                </div>
              </div>
            </div>
          </section>
        )}

        {seccion === "bitacoras" && (
          <>
            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="section-label">
                    ACTIVIDADES SEMANALES
                  </p>
                  <h3>Bitácoras</h3>
                </div>
              </div>

              <p className="panel-description">
                Consulta las actividades publicadas por el administrador
                y sube tu archivo PDF correspondiente a cada semana.
              </p>

              {cargandoBitacoras ? (
                <p>Cargando actividades de bitácora...</p>
              ) : actividadesBitacora.length === 0 ? (
                <p>
                  No hay actividades de bitácora activas por el momento.
                </p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: "16px",
                  }}
                >
                  {actividadesBitacora.map(
                    (actividad) => (
                      <div
                        key={actividad.id_actividad}
                        style={{
                          border: "1px solid #e1e6ef",
                          borderRadius: "10px",
                          padding: "18px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            gap: "16px",
                            flexWrap: "wrap",
                            alignItems: "flex-start",
                          }}
                        >
                          <div>
                            <p
                              className="section-label"
                              style={{
                                marginBottom: "4px",
                              }}
                            >
                              SEMANA{" "}
                              {
                                actividad.numero_semana
                              }
                            </p>

                            <h3
                              style={{
                                marginTop: 0,
                              }}
                            >
                              {actividad.titulo}
                            </h3>
                          </div>

                          <strong>
                            {actividad.entregada
                              ? actividad.estado_entrega ||
                                "Entregada"
                              : "Pendiente de entrega"}
                          </strong>
                        </div>

                        <p>
                          {actividad.descripcion}
                        </p>

                        <div
                          className="profile-list"
                          style={{
                            marginTop: "14px",
                          }}
                        >
                          <div>
                            <span>
                              Fecha de inicio
                            </span>
                            <strong>
                              {formatearFechaBitacora(
                                actividad.fecha_inicio
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Fecha de fin
                            </span>
                            <strong>
                              {formatearFechaBitacora(
                                actividad.fecha_fin
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Fecha límite
                            </span>
                            <strong>
                              {formatearFechaHoraBitacora(
                                actividad.fecha_limite
                              )}
                            </strong>
                          </div>
                        </div>

                        {actividad.observaciones && (
                          <div
                            className="message"
                            style={{
                              marginTop: "14px",
                            }}
                          >
                            Observación:{" "}
                            {
                              actividad.observaciones
                            }
                          </div>
                        )}

                        {!actividad.entregada && (
                          <div
                            style={{
                              marginTop: "16px",
                              display: "flex",
                              gap: "10px",
                              flexWrap: "wrap",
                              alignItems: "center",
                            }}
                          >
                            <input
                              type="file"
                              accept="application/pdf,.pdf"
                              onChange={(e) =>
                                seleccionarArchivoBitacora(
                                  actividad.id_actividad,
                                  e.target.files?.[0] ||
                                    null
                                )
                              }
                            />

                            <button
                              type="button"
                              onClick={() =>
                                subirPdfBitacora(
                                  actividad.id_actividad
                                )
                              }
                              disabled={
                                subiendoBitacora !==
                                  actividad.id_actividad ||
                                !archivoBitacora
                              }
                            >
                              Subir PDF
                            </button>
                          </div>
                        )}

                        {actividad.entregada &&
                          actividad.id_bitacora && (
                            <div
                              style={{
                                marginTop: "16px",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  abrirPdfBitacora(
                                    actividad.id_bitacora
                                  )
                                }
                              >
                                Ver PDF enviado
                              </button>
                            </div>
                          )}
                      </div>
                    )
                  )}
                </div>
              )}
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="section-label">
                    HISTORIAL
                  </p>
                  <h3>Mis entregas</h3>
                </div>
              </div>

              {cargandoBitacoras ? (
                <p>Cargando historial...</p>
              ) : bitacoras.length === 0 ? (
                <p>
                  Todavía no has enviado ninguna bitácora.
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
                      minWidth: "850px",
                    }}
                  >
                    <thead>
                      <tr>
                        {[
                          "Semana",
                          "Actividad",
                          "Archivo",
                          "Estado",
                          "Observaciones",
                          "Fecha de envío",
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
                      {bitacoras.map((bitacora) => (
                        <tr
                          key={
                            bitacora.id_bitacora
                          }
                        >
                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                          >
                            {
                              bitacora.numero_semana
                            }
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                          >
                            {bitacora.titulo_actividad ||
                              "Bitácora semanal"}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                          >
                            {
                              bitacora.nombre_archivo
                            }
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                          >
                            {bitacora.estado}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                          >
                            {bitacora.observaciones ||
                              "—"}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                          >
                            {formatearFechaHoraBitacora(
                              bitacora.fecha_envio
                            )}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                abrirPdfBitacora(
                                  bitacora.id_bitacora
                                )
                              }
                            >
                              Ver PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

      </main>
    </div>
  );
}

export default PracticantePanel;