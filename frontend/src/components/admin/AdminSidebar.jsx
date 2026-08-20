import {
  BarChart3,
  ClipboardClock,
  GraduationCap,
  History,
  LayoutDashboard,
  LogOut,
  NotebookTabs,
  Users,
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
}) {
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
        <button
          className={
            "nav-item " +
            (seccion === "dashboard"
              ? "active"
              : "")
          }
          onClick={() => setSeccion("dashboard")}
        >
          <span>
            <LayoutDashboard size={18} />
          </span>
          Dashboard
        </button>

        <button
          className={
            "nav-item " +
            (seccion === "practicantes"
              ? "active"
              : "")
          }
          onClick={() =>
            setSeccion("practicantes")
          }
        >
          <span>
            <Users size={18} />
          </span>
          Practicantes
        </button>

        <button
          className={
            "nav-item " +
            (seccion === "asistencia"
              ? "active"
              : "")
          }
          onClick={() => {
            setSeccion("asistencia");
            cargarAsistencias();
          }}
        >
          <span>
            <ClipboardClock size={18} />
          </span>
          Asistencia
        </button>

        <button
          className={
            "nav-item " +
            (seccion === "bitacoras"
              ? "active"
              : "")
          }
          onClick={() => {
            setSeccion("bitacoras");
            cargarActividadesBitacora();
            cargarEntregasBitacoras();
          }}
        >
          <span>
            <NotebookTabs size={18} />
          </span>
          Bit&aacute;coras
        </button>

        <button
          className={
            "nav-item " +
            (seccion === "carreras"
              ? "active"
              : "")
          }
          onClick={() => {
            setSeccion("carreras");
            cargarCarreras();
          }}
        >
          <span>
            <GraduationCap size={18} />
          </span>
          Carreras
        </button>

        <button
          className={
            "nav-item " +
            (seccion === "estadisticas"
              ? "active"
              : "")
          }
          onClick={() =>
            setSeccion("estadisticas")
          }
        >
          <span>
            <BarChart3 size={18} />
          </span>
          Estad&iacute;sticas
        </button>

        <button
          className={
            "nav-item " +
            (seccion === "historial"
              ? "active"
              : "")
          }
          onClick={() => {
            setSeccion("historial");
            cargarHistorial();
          }}
        >
          <span>
            <History size={18} />
          </span>
          Historial
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
