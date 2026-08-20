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
            seccion === "asistencia" ? "active" : ""
          }`}
          onClick={() => {
            setSeccion("asistencia");
            cargarAsistencias();
          }}
        >
          <span>🕐</span>
          Asistencia
        </button>

        <button
          className={`nav-item ${
            seccion === "bitacoras" ? "active" : ""
          }`}
          onClick={() => {
            setSeccion("bitacoras");
            cargarActividadesBitacora();
            cargarEntregasBitacoras();
          }}
        >
          <span>📋</span>
          Bitácoras
        </button>

        <button
          className={`nav-item ${
            seccion === "carreras" ? "active" : ""
          }`}
          onClick={() => {
            setSeccion("carreras");
            cargarCarreras();
          }}
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
          onClick={() => {
            setSeccion("historial");
            cargarHistorial();
          }}
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
  );
}

export default AdminSidebar;
