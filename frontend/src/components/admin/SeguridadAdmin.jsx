import {
  ShieldCheck,
  Plus,
  X,
  UserPlus,
  Mail,
  KeyRound,
} from "lucide-react";

function SeguridadAdmin({
  formPasswordAdmin,
  mostrarPasswordsAdmin,
  guardandoPasswordAdmin,
  cambiarCampoPasswordAdmin,
  guardarPasswordAdmin,
  setMostrarPasswordsAdmin,

  administradores,
  cargandoAdministradores,
  mostrandoNuevoAdmin,
  setMostrandoNuevoAdmin,
  nuevoAdministrador,
  cambiarCampoNuevoAdministrador,
  guardarNuevoAdministrador,
  guardandoAdministrador,
}) {
  const nombreCompleto = (admin) => {
    return [
      admin.nombre,
      admin.apellido_paterno,
      admin.apellido_materno,
    ]
      .filter(Boolean)
      .join(" ");
  };

  return (
    <div className="seguridad-admin-page">

      {/* ==========================================
          CAMBIO DE CONTRASEÑA
      ========================================== */}

      <section className="panel">
        <div className="password-section-header">
          <div>
            <p className="section-label">
              SEGURIDAD
            </p>

            <h3>Cambiar contraseña</h3>
          </div>

          <div className="seguridad-icon-box">
            <ShieldCheck size={23} />
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
              type={
                mostrarPasswordsAdmin
                  ? "text"
                  : "password"
              }
              name="password_actual"
              value={
                formPasswordAdmin.password_actual
              }
              onChange={cambiarCampoPasswordAdmin}
              autoComplete="current-password"
              required
            />
          </label>

          <label>
            Nueva contraseña

            <input
              type={
                mostrarPasswordsAdmin
                  ? "text"
                  : "password"
              }
              name="password_nueva"
              value={
                formPasswordAdmin.password_nueva
              }
              onChange={cambiarCampoPasswordAdmin}
              autoComplete="new-password"
              minLength="8"
              required
            />
          </label>

          <label>
            Confirmar nueva contraseña

            <input
              type={
                mostrarPasswordsAdmin
                  ? "text"
                  : "password"
              }
              name="confirmar_password"
              value={
                formPasswordAdmin.confirmar_password
              }
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
                setMostrarPasswordsAdmin(
                  e.target.checked
                )
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

      {/* ==========================================
          CUENTAS DE ADMINISTRADOR
      ========================================== */}

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="section-label">
              ADMINISTRADORES
            </p>

            <h3>Gestión de cuentas</h3>
          </div>

          <button
            type="button"
            onClick={() =>
              setMostrandoNuevoAdmin(
                (actual) => !actual
              )
            }
          >
            {mostrandoNuevoAdmin ? (
              <>
                <X size={18} />
                Cancelar
              </>
            ) : (
              <>
                <Plus size={18} />
                Nuevo administrador
              </>
            )}
          </button>
        </div>

        <p className="panel-description">
          Consulta las cuentas con acceso administrativo
          y registra nuevos administradores cuando sea necesario.
        </p>

        {/* ==========================================
            NUEVO ADMINISTRADOR
        ========================================== */}

        {mostrandoNuevoAdmin && (
          <form
            onSubmit={guardarNuevoAdministrador}
            className="admin-inline-form nuevo-admin-form"
          >
            <div className="admin-form-header">
              <div>
                <h4 className="admin-form-title">
                  Nueva cuenta de administrador
                </h4>

                <small>
                  La contraseña registrada será temporal.
                  El nuevo administrador deberá cambiarla
                  al iniciar sesión.
                </small>
              </div>

              <UserPlus size={24} />
            </div>

            <div className="admin-form-grid">
              <label>
                Nombre *

                <input
                  type="text"
                  name="nombre"
                  value={
                    nuevoAdministrador.nombre
                  }
                  onChange={
                    cambiarCampoNuevoAdministrador
                  }
                  maxLength="80"
                  required
                />
              </label>

              <label>
                Apellido paterno *

                <input
                  type="text"
                  name="apellido_paterno"
                  value={
                    nuevoAdministrador.apellido_paterno
                  }
                  onChange={
                    cambiarCampoNuevoAdministrador
                  }
                  maxLength="80"
                  required
                />
              </label>

              <label>
                Apellido materno

                <input
                  type="text"
                  name="apellido_materno"
                  value={
                    nuevoAdministrador.apellido_materno
                  }
                  onChange={
                    cambiarCampoNuevoAdministrador
                  }
                  maxLength="80"
                />
              </label>

              <label>
                Correo electrónico *

                <div className="input-with-icon">
                  <Mail size={18} />

                  <input
                    type="email"
                    name="correo"
                    value={
                      nuevoAdministrador.correo
                    }
                    onChange={
                      cambiarCampoNuevoAdministrador
                    }
                    placeholder="admin@nmr.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </label>

              <label>
                Contraseña temporal *

                <div className="input-with-icon">
                  <KeyRound size={18} />

                  <input
                    type="password"
                    name="password"
                    value={
                      nuevoAdministrador.password
                    }
                    onChange={
                      cambiarCampoNuevoAdministrador
                    }
                    minLength="8"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </label>

              <label>
                Confirmar contraseña *

                <div className="input-with-icon">
                  <KeyRound size={18} />

                  <input
                    type="password"
                    name="confirmar_password"
                    value={
                      nuevoAdministrador.confirmar_password
                    }
                    onChange={
                      cambiarCampoNuevoAdministrador
                    }
                    minLength="8"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </label>
            </div>

            <div className="admin-form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setMostrandoNuevoAdmin(false)
                }
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={guardandoAdministrador}
              >
                {guardandoAdministrador
                  ? "Creando..."
                  : "Crear administrador"}
              </button>
            </div>
          </form>
        )}

        {/* ==========================================
            LISTADO
        ========================================== */}

       {cargandoAdministradores ? (
          <div className="admin-empty-state">
            <p>Cargando administradores...</p>
          </div>
        ) : administradores.length === 0 ? (
          <div className="admin-empty-state">
            <ShieldCheck size={32} />

            <strong>
              No hay administradores registrados
            </strong>

            <span>
              Las cuentas administrativas aparecerán aquí.
            </span>
          </div>
        ) : (
          <div className="administradores-grid">
            {administradores.map((admin) => (
              <article
                key={admin.id_usuario}
                className="administrador-card"
              >
                <div className="administrador-card-avatar">
                  {admin.nombre
                    ?.charAt(0)
                    ?.toUpperCase() || "A"}
                </div>

                <div className="administrador-card-info">
                  <strong className="administrador-card-name">
                    {nombreCompleto(admin)}
                  </strong>

                  <span className="administrador-card-email">
                    {admin.correo}
                  </span>

                  <span
                    className={`admin-password-status ${
                      Number(admin.debe_cambiar_password) === 1
                        ? "pending"
                        : "ready"
                    }`}
                  >
                    {Number(admin.debe_cambiar_password) === 1
                      ? "Contraseña temporal"
                      : "Cuenta configurada"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
       </section>

    </div>
  );
}

export default SeguridadAdmin;