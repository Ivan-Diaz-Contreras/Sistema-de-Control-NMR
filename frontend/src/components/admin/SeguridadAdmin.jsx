function SeguridadAdmin({
  formPasswordAdmin,
  mostrarPasswordsAdmin,
  guardandoPasswordAdmin,
  cambiarCampoPasswordAdmin,
  guardarPasswordAdmin,
  setMostrarPasswordsAdmin,
}) {
  return (
    <section className="panel">
      <div className="password-section-header">
        <div>
          <p className="section-label">SEGURIDAD</p>
          <h3>Cambiar contraseña</h3>
        </div>
      </div>

      <p className="panel-description">
        Actualiza la contraseña de tu cuenta de administrador.
      </p>

      <form
        onSubmit={guardarPasswordAdmin}
        className="password-form"
      >
        <label>
          Contraseña actual

          <input
            type={mostrarPasswordsAdmin ? "text" : "password"}
            name="password_actual"
            value={formPasswordAdmin.password_actual}
            onChange={cambiarCampoPasswordAdmin}
            autoComplete="current-password"
            required
          />
        </label>

        <label>
          Nueva contraseña

          <input
            type={mostrarPasswordsAdmin ? "text" : "password"}
            name="password_nueva"
            value={formPasswordAdmin.password_nueva}
            onChange={cambiarCampoPasswordAdmin}
            autoComplete="new-password"
            minLength="8"
            required
          />
        </label>

        <label>
          Confirmar nueva contraseña

          <input
            type={mostrarPasswordsAdmin ? "text" : "password"}
            name="confirmar_password"
            value={formPasswordAdmin.confirmar_password}
            onChange={cambiarCampoPasswordAdmin}
            autoComplete="new-password"
            minLength="8"
            required
          />
        </label>

        <label className="password-show-option">
          <input
            type="checkbox"
            checked={mostrarPasswordsAdmin}
            onChange={(e) =>
              setMostrarPasswordsAdmin(e.target.checked)
            }
          />
          Mostrar contraseñas mientras escribo
        </label>

        <div className="admin-form-actions">
          <button
            type="submit"
            disabled={guardandoPasswordAdmin}
          >
            {guardandoPasswordAdmin
              ? "Actualizando..."
              : "Cambiar contraseña"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default SeguridadAdmin;