import { useState } from "react";
import { login } from "../services/api";

import logoNMR from "../assets/logo-nmr.png";
import oficinaNMR from "../assets/oficina2.jpeg";

function Login({ onLogin }) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMensaje("");
    setCargando(true);

    try {
      const respuesta = await login(correo, password);

      localStorage.setItem("token", respuesta.token);
      localStorage.setItem(
        "usuario",
        JSON.stringify(respuesta.usuario)
      );

      onLogin(respuesta.token, respuesta.usuario);
    } catch (error) {
      setMensaje(error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      className="login-page"
      style={{
        backgroundImage: `url(${oficinaNMR})`,
      }}
    >
      <div className="login-overlay"></div>

      <div className="login-content">

        <section className="login-brand-section">

          <div className="login-brand-logo">
            <img
              src={logoNMR}
              alt="NMR Consultores"
            />
          </div>

          <p className="login-brand-label">
            SISTEMA DE CONTROL
          </p>

          <h1>
            Control de
            <br />
            Prácticas Profesionales
          </h1>

          <p className="login-brand-description">
            Gestiona tu asistencia, horas y bitácoras
            de prácticas profesionales desde un solo lugar.
          </p>

          <div className="login-brand-features">
            <span>✓ Control de asistencia</span>
            <span>✓ Seguimiento de horas</span>
            <span>✓ Gestión de bitácoras</span>
          </div>

        </section>

        <section className="login-card-modern">

          <div className="login-card-header">
            <div className="login-card-logo">
              <img
                src={logoNMR}
                alt="NMR Consultores"
              />
            </div>

            <h2>Bienvenido</h2>

            <p>
              Ingresa tus credenciales para acceder al sistema.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="login-field-modern">
              <label>Correo electrónico</label>

              <input
                type="email"
                value={correo}
                onChange={(e) =>
                  setCorreo(e.target.value)
                }
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="login-field-modern">
              <label>Contraseña</label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Ingresa tu contraseña"
                autoComplete="current-password"
                required
              />
            </div>

            {mensaje && (
              <div className="login-error-modern">
                {mensaje}
              </div>
            )}

            <button
              type="submit"
              className="login-button-modern"
              disabled={cargando}
            >
              {cargando
                ? "Iniciando sesión..."
                : "Iniciar sesión"}
            </button>

          </form>

          <div className="login-footer">
            <span>NMR Consultores</span>
            <small>
              Control de Prácticas Profesionales
            </small>
          </div>

        </section>

      </div>
    </div>
  );
}

export default Login;