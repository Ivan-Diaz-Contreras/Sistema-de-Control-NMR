function EstadisticasAdmin({estadisticas, practicantes}) {
  return (
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="section-label">
                  INFORMACIÓN
                </p>
                <h3>
                  Estadísticas generales
                </h3>
              </div>
            </div>

            <div className="profile-list">
              <div>
                <span>
                  Total de practicantes
                </span>
                <strong>
                  {estadisticas?.total_practicantes ?? 0}
                </strong>
              </div>

              <div>
                <span>
                  Practicantes activos
                </span>
                <strong>
                  {estadisticas?.practicantes_activos ?? 0}
                </strong>
              </div>

              <div>
                <span>
                  Horas registradas
                </span>
                <strong>
                  {estadisticas?.total_horas_registradas ?? 0}
                </strong>
              </div>

              <div>
                <span>
                  Bitácoras pendientes
                </span>
                <strong>
                  {estadisticas?.bitacoras_pendientes ?? 0}
                </strong>
              </div>

              <div>
                <span>
                  Bitácoras aprobadas
                </span>
                <strong>
                  {estadisticas?.bitacoras_aprobadas ?? 0}
                </strong>
              </div>

              <div>
                <span>
                  Bitácoras rechazadas
                </span>
                <strong>
                  {estadisticas?.bitacoras_rechazadas ?? 0}
                </strong>
              </div>
            </div>
          </section>
  );
}

export default EstadisticasAdmin;
