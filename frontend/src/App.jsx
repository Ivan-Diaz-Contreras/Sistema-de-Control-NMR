import { useState } from "react";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";
import PracticantePanel from "./pages/PracticantePanel";
import "./App.css";

function App() {
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [usuario, setUsuario] = useState(
    JSON.parse(
      localStorage.getItem("usuario") || "null"
    )
  );

  const iniciarSesion = (
    nuevoToken,
    nuevoUsuario
  ) => {
    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    setToken(null);
    setUsuario(null);
  };

  const actualizarUsuarioSesion = (
    cambios
  ) => {
    setUsuario((actual) => {
      if (!actual) {
        return actual;
      }

      const actualizado = {
        ...actual,
        ...cambios,
      };

      localStorage.setItem(
        "usuario",
        JSON.stringify(actualizado)
      );

      return actualizado;
    });
  };

  if (!token) {
    return (
      <Login onLogin={iniciarSesion} />
    );
  }

  if (usuario?.rol === "Administrador") {
    return (
      <AdminPanel
        usuario={usuario}
        onLogout={cerrarSesion}
      />
    );
  }

  if (usuario?.rol === "Practicante") {
    return (
      <PracticantePanel
        usuario={usuario}
        token={token}
        onLogout={cerrarSesion}
        onUsuarioActualizado={
          actualizarUsuarioSesion
        }
      />
    );
  }

  cerrarSesion();

  return null;
}

export default App;