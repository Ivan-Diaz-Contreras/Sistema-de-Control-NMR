import { useState } from "react";
import {
  ChevronDown,
  LogOut,
  ShieldCheck,
} from "lucide-react";

function AdminTopbar({
  usuario,
  titulo,
  onLogout,
  setSeccion,
}) {
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] =
    useState(false);

  return (
    <header className="topbar">
      <div>
        <p className="section-label">
          PANEL DEL ADMINISTRADOR
        </p>

        <h2>{titulo}</h2>
      </div>

      <div className="user-menu-wrapper">

        <button
          type="button"
          className="user-info user-info-button"
          onClick={() =>
            setMenuUsuarioAbierto(
              (abierto) => !abierto
            )
          }
        >
          <div className="avatar">
            {usuario?.nombre?.charAt(0)?.toUpperCase() ||
              "A"}
          </div>

          <div className="user-info-text">
            <strong>
              {usuario?.nombre || "Administrador"}
            </strong>

            <span>Administrador</span>
          </div>

          <ChevronDown
            size={17}
            className={`user-menu-chevron ${
              menuUsuarioAbierto ? "open" : ""
            }`}
          />
        </button>

        {menuUsuarioAbierto && (
          <div className="user-dropdown">

            <div className="user-dropdown-header">
              <div className="user-dropdown-avatar">
                {usuario?.nombre
                  ?.charAt(0)
                  ?.toUpperCase() || "A"}
              </div>

              <div>
                <strong>
                  {usuario?.nombre ||
                    "Administrador"}
                </strong>

                <span>Administrador</span>
              </div>
            </div>

            <div className="user-dropdown-divider" />

            <button
              type="button"
              className="user-dropdown-item"
              onClick={() => {
                setSeccion("seguridad");
                setMenuUsuarioAbierto(false);
              }}
            >
              <ShieldCheck size={18} />
              Seguridad
            </button>

            <button
              type="button"
              className="user-dropdown-item logout"
              onClick={onLogout}
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>

          </div>
        )}

      </div>
    </header>
  );
}

export default AdminTopbar;