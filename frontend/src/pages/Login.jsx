import { useState } from "react";
import { login } from "../services/api";

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
    <div className="login-container">
      <div className="login-card">
        <h1>NMR</h1>
        <h2>Control de Prácticas</h2>

        <p>Inicia sesión para acceder al sistema.</p>

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label>Correo electrónico</label>

            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          <div className="login-field">
            <label>Contraseña</label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
            />
          </div>

          {mensaje && (
            <div className="login-error">
              {mensaje}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={cargando}
          >
            {cargando
              ? "Iniciando sesión..."
              : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;