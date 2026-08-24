import {
  BarChart3,
  ClipboardClock,
  ClipboardPenLine,
  GraduationCap,
  History,
  LayoutDashboard,
  LogOut,
  NotebookTabs,
  Users,
  ShieldCheck,
} from "lucide-react";

import logoNMR from "../../assets/logo-nmr.png";

function AdminSidebar({
  seccion,
  setSeccion,
  onLogout,
  cargarAsistencias,
  cargarActividadesBitacora,
  cargarEntregasBitacoras,
  cargarCarreras,
  cargarHistorial,
  notificaciones = {},
  marcarSeccionComoLeida,
}) {
  // ==========================================
  // OBTENER CANTIDAD DE NOTIFICACIONES
  // ==========================================

  const obtenerCantidad = (nombreSeccion) => {
    return Number(
      notificaciones?.[nombreSeccion] || 0
    );
  };

  // ==========================================
  // BADGE DE NOTIFICACIONES
  // ==========================================

  const mostrarBadge = (nombreSeccion) => {
    const cantidad =
      obtenerCantidad(nombreSeccion);

    if (cantidad <= 0) {
      return null;
    }

    return (
      <span
        className={`nav-badge nav-badge-${nombreSeccion}`}
        aria-label={`${cantidad} notificaciones nuevas`}
      >
        {cantidad > 99 ? "99+" : cantidad}
      </span>
    );
  };

  // ==========================================
  // CAMBIAR SECCIÓN
  // ==========================================

  const cambiarSeccion = async (
    nombreSeccion,
    callback
  ) => {
    setSeccion(nombreSeccion);

    if (typeof callback === "function") {
      callback();
    }

    if (
      typeof marcarSeccionComoLeida ===
      "function"
    ) {
      await marcarSeccionComoLeida(
        nombreSeccion
      );
    }
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <img
            src={logoNMR}
            alt="NMR Consultores"
            className="brand-logo"
          />
        </div>

        <div>
          <h1>NMR</h1>

          <span>
            Control de Pr&aacute;cticas
          </span>
        </div>
      </div>

      <nav className="navigation">
        {/* DASHBOARD */}
        <button
          type="button"
          className={`nav-item ${
            seccion === "dashboard"
              ? "active"
              : ""
          }`}
          onClick={() =>
            cambiarSeccion("dashboard")
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

        {/* PRACTICANTES */}
        <button
          type="button"
          className={`nav-item ${
            seccion === "practicantes"
              ? "active"
              : ""
          }`}
          onClick={() =>
            cambiarSeccion("practicantes")
          }
        >
          <span className="nav-item-icon">
            <Users size={18} />
          </span>

          <span className="nav-item-text">
            Practicantes
          </span>

          {mostrarBadge("practicantes")}
        </button>

        {/* ASISTENCIA */}
        <button
          type="button"
          className={`nav-item ${
            seccion === "asistencia"
              ? "active"
              : ""
          }`}
          onClick={() =>
            cambiarSeccion(
              "asistencia",
              cargarAsistencias
            )
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

        {/* ACTIVIDAD DIARIA */}
        <button
          type="button"
          className={`nav-item ${
            seccion === "actividad-diaria"
              ? "active"
              : ""
          }`}
          onClick={() =>
            cambiarSeccion(
              "actividad-diaria"
            )
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

        {/* BITÁCORAS */}
        <button
          type="button"
          className={`nav-item ${
            seccion === "bitacoras"
              ? "active"
              : ""
          }`}
          onClick={() =>
            cambiarSeccion(
              "bitacoras",
              () => {
                cargarActividadesBitacora();
                cargarEntregasBitacoras();
              }
            )
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

        {/* CARRERAS */}
        <button
          type="button"
          className={`nav-item ${
            seccion === "carreras"
              ? "active"
              : ""
          }`}
          onClick={() =>
            cambiarSeccion(
              "carreras",
              cargarCarreras
            )
          }
        >
          <span className="nav-item-icon">
            <GraduationCap size={18} />
          </span>

          <span className="nav-item-text">
            Carreras
          </span>

          {mostrarBadge("carreras")}
        </button>

        {/* ESTADÍSTICAS */}
        <button
          type="button"
          className={`nav-item ${
            seccion === "estadisticas"
              ? "active"
              : ""
          }`}
          onClick={() =>
            cambiarSeccion("estadisticas")
          }
        >
          <span className="nav-item-icon">
            <BarChart3 size={18} />
          </span>

          <span className="nav-item-text">
            Estad&iacute;sticas
          </span>

          {mostrarBadge("estadisticas")}
        </button>

        {/* HISTORIAL */}
        <button
          type="button"
          className={`nav-item ${
            seccion === "historial"
              ? "active"
              : ""
          }`}
          onClick={() =>
            cambiarSeccion(
              "historial",
              cargarHistorial
            )
          }
        >
          <span className="nav-item-icon">
            <History size={18} />
          </span>

          <span className="nav-item-text">
            Historial
          </span>

          {mostrarBadge("historial")}
        </button>

        {/* SEGURIDAD */}
        <button
          type="button"
          className={`nav-item ${
            seccion === "seguridad"
              ? "active"
              : ""
          }`}
          onClick={() =>
            cambiarSeccion("seguridad")
          }
        >
          <span className="nav-item-icon">
            <ShieldCheck size={18} />
          </span>

          <span className="nav-item-text">
            Seguridad
          </span>

          {mostrarBadge("seguridad")}
        </button>
      </nav>

      <button
        type="button"
        className="logout-button"
        onClick={onLogout}
      >
        <LogOut size={18} />
        Cerrar sesi&oacute;n
      </button>
    </aside>
  );
}

export default AdminSidebar;