function AdminTopbar({ usuario, titulo }) {
  return (
    <header className="topbar">
      <div>
        <p className="section-label">PANEL DEL ADMINISTRADOR</p>
        <h2>{titulo}</h2>
      </div>

      <div className="user-info">
        <div className="avatar">{usuario?.nombre?.charAt(0) || "A"}</div>
        <div>
          <strong>{usuario?.nombre || "Administrador"}</strong>
          <span>Administrador</span>
        </div>
      </div>
    </header>
  );
}

export default AdminTopbar;
