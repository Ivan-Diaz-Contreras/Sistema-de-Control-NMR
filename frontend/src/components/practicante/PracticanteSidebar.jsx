import {
  ClipboardClock,
  ClipboardPenLine,
  Clock3,
  CircleUserRound,
  LayoutDashboard,
  LogOut,
  NotebookTabs,
  X,
} from "lucide-react";

import logoNMR from "../../assets/logo-nmr.png";

function PracticanteSidebar({
  seccion,
  cambiarSeccion,
  onLogout,
  notificaciones = {},
  abierto = false,
  onCerrar,
}) {
  const obtenerCantidad = (nombreSeccion) => {
    return Number(
      notificaciones?.[nombreSeccion] || 0
    );
  };

  const mostrarBadge = (nombreSeccion) => {
    const cantidad =
      obtenerCantidad(nombreSeccion);

    if (cantidad <= 0) {
      return null;
    }

    return (
      <span
        className="nav-badge"
        aria-label={`${cantidad} notificaciones nuevas`}
      >
        {cantidad > 99 ? "99+" : cantidad}
      </span>
    );
  };

  const navegar = async (nombreSeccion) => {
    if (
      typeof cambiarSeccion ===
      "function"
    ) {
      await cambiarSeccion(nombreSeccion);
    }

    if (typeof onCerrar === "function") {
      onCerrar();
    }
  };

  const cerrarSesion = () => {
    if (typeof onCerrar === "function") {
      onCerrar();
    }

    onLogout?.();
  };

  return (
    <>
      <aside
        className={`sidebar ${
          abierto
            ? "sidebar-mobile-open"
            : ""
        }`}
      >
        <div className="brand">
          <div className="brand-icon">
            <img
              src={logoNMR}
              alt="NMR Consultores"
              className="brand-logo"
            />
          </div>

          <div>
            <span>
              Control de
              <br />
              Pr&aacute;cticas
            </span>
          </div>

          <button
            type="button"
            className="sidebar-mobile-close"
            onClick={onCerrar}
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="navigation">
          <button
            type="button"
            className={`nav-item ${
              seccion === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() =>
              navegar("dashboard")
            }
          >
            <span className="nav-item-icon">
              <LayoutDashboard size={18} />
            </span>

            <span className="nav-item-text">
              Dashboard
            </span>

            {mostrarBadge("dashboard")}
          </button>

          <button
            type="button"
            className={`nav-item ${
              seccion === "perfil"
                ? "active"
                : ""
            }`}
            onClick={() =>
              navegar("perfil")
            }
          >
            <span className="nav-item-icon">
              <CircleUserRound size={18} />
            </span>

            <span className="nav-item-text">
              Mi perfil
            </span>

            {mostrarBadge("perfil")}
          </button>

          <button
            type="button"
            className={`nav-item ${
              seccion === "asistencia"
                ? "active"
                : ""
            }`}
            onClick={() =>
              navegar("asistencia")
            }
          >
            <span className="nav-item-icon">
              <ClipboardClock size={18} />
            </span>

            <span className="nav-item-text">
              Asistencia
            </span>

            {mostrarBadge("asistencia")}
          </button>

          <button
            type="button"
            className={`nav-item ${
              seccion === "horas"
                ? "active"
                : ""
            }`}
            onClick={() =>
              navegar("horas")
            }
          >
            <span className="nav-item-icon">
              <Clock3 size={18} />
            </span>

            <span className="nav-item-text">
              Mis horas
            </span>

            {mostrarBadge("horas")}
          </button>

          <button
            type="button"
            className={`nav-item ${
              seccion === "actividad-diaria"
                ? "active"
                : ""
            }`}
            onClick={() =>
              navegar("actividad-diaria")
            }
          >
            <span className="nav-item-icon">
              <ClipboardPenLine size={18} />
            </span>

            <span className="nav-item-text">
              Actividad diaria
            </span>

            {mostrarBadge(
              "actividad-diaria"
            )}
          </button>

          <button
            type="button"
            className={`nav-item ${
              seccion === "bitacoras"
                ? "active"
                : ""
            }`}
            onClick={() =>
              navegar("bitacoras")
            }
          >
            <span className="nav-item-icon">
              <NotebookTabs size={18} />
            </span>

            <span className="nav-item-text">
              Bit&aacute;coras
            </span>

            {mostrarBadge("bitacoras")}
          </button>
        </nav>

        <button
          type="button"
          className="logout-button"
          onClick={cerrarSesion}
        >
          <LogOut size={18} />
          Cerrar sesi&oacute;n
        </button>
      </aside>

      {abierto && (
        <button
          type="button"
          className="sidebar-backdrop"
          onClick={onCerrar}
          aria-label="Cerrar menú lateral"
        />
      )}
    </>
  );
}

export default PracticanteSidebar;
