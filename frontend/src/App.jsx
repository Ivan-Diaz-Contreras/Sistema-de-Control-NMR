import { useEffect, useState } from "react";
import axios from "axios";
import Login from "./pages/Login";
import "./App.css";

const API = "http://localhost:3000/api";

function App() {
  const [perfil, setPerfil] = useState(null);
  const [avance, setAvance] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(
  Boolean(localStorage.getItem("token"))
  );
  const [procesandoAsistencia, setProcesandoAsistencia] = useState(false);
  const [seccion, setSeccion] = useState("dashboard");

  const [token, setToken] = useState(
  localStorage.getItem("token")
);

const [usuario, setUsuario] = useState(
  JSON.parse(localStorage.getItem("usuario") || "null")
);

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
  if (!token) {
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

      setPerfil(perfilResponse.data.perfil);
      setAvance(avanceResponse.data);
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");

        setToken(null);
        setUsuario(null);

        setMensaje(
          "Tu sesión ha expirado. Inicia sesión nuevamente."
        );
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
  }, [token]);

  const iniciarSesion = (nuevoToken, nuevoUsuario) => {
    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
    setMensaje("");
  };

  const registrarEntrada = async () => {
    try {
      setProcesandoAsistencia(true);
      setMensaje("");

      const response = await axios.post(
        `${API}/practicantes/asistencia/entrada`,
        {},
        { headers }
      );

      setMensaje(
        response.data.mensaje || "Entrada registrada correctamente."
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
        { headers }
      );

      setMensaje(
        response.data.mensaje || "Salida registrada correctamente."
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

  const cerrarSesion = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");

  setToken(null);
  setUsuario(null);
  setPerfil(null);
  setAvance(null);
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

  if (!token) {
  return <Login onLogin={iniciarSesion} />;
}

  const porcentaje = avance?.porcentaje_avance || 0;

  return (
    <div className="app">
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
              seccion === "perfil" ? "active" : ""
            }`}
            onClick={() => setSeccion("perfil")}
          >
            <span>👤</span>
            Mi perfil
          </button>

          <button
            className={`nav-item ${
              seccion === "asistencia" ? "active" : ""
            }`}
            onClick={() => setSeccion("asistencia")}
          >
            <span>🕐</span>
            Asistencia
          </button>

          <button
            className={`nav-item ${
              seccion === "horas" ? "active" : ""
            }`}
            onClick={() => setSeccion("horas")}
          >
            <span>⏱</span>
            Mis horas
          </button>

          <button
            className={`nav-item ${
              seccion === "bitacoras" ? "active" : ""
            }`}
            onClick={() => setSeccion("bitacoras")}
          >
            <span>📋</span>
            Bitácoras
          </button>

          <button
            className={`nav-item ${
              seccion === "evidencias" ? "active" : ""
            }`}
            onClick={() => setSeccion("evidencias")}
          >
            <span>📎</span>
            Evidencias
          </button>
        </nav>

        <button className="logout-button" onClick={cerrarSesion}>
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
              {perfil?.nombre?.charAt(0) ||
                usuario?.nombre?.charAt(0) ||
                "S"}
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
                <span className="stat-icon">⏱</span>

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
                <span className="stat-icon">🎯</span>

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
                <span className="stat-icon">⏱</span>
                <div>
                  <p>Horas acumuladas</p>
                  <strong>
                    {avance?.horas_acumuladas?.toFixed(2) || "0.00"}
                  </strong>
                  <small>horas</small>
                </div>
              </div>

              <div className="stat-card">
                <span className="stat-icon">🎯</span>
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
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="section-label">ACTIVIDADES</p>
                <h3>Bitácoras</h3>
              </div>
            </div>

            <p className="panel-description">
              En esta sección podrás consultar y administrar tus
              bitácoras de prácticas profesionales.
            </p>

            <p>🚧 Módulo en desarrollo.</p>
          </section>
        )}

        {seccion === "evidencias" && (
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="section-label">DOCUMENTACIÓN</p>
                <h3>Evidencias</h3>
              </div>
            </div>

            <p className="panel-description">
              En esta sección podrás consultar y administrar las
              evidencias de tus actividades.
            </p>

            <p>🚧 Módulo en desarrollo.</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;