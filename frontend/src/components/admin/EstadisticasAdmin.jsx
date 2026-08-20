import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORES = [
  "#17284a",
  "#3478c9",
  "#43a047",
  "#f59e0b",
  "#dc3545",
  "#7c3aed",
];

function TarjetaGrafica({
  titulo,
  descripcion,
  children,
}) {
  return (
    <article
      style={{
        border: "1px solid #dfe5ee",
        borderRadius: "14px",
        padding: "20px",
        background: "#ffffff",
        minWidth: 0,
      }}
    >
      <div style={{ marginBottom: "18px" }}>
        <h4 style={{ margin: "0 0 6px" }}>
          {titulo}
        </h4>

        <p
          className="panel-description"
          style={{ margin: 0 }}
        >
          {descripcion}
        </p>
      </div>

      <div style={{ width: "100%", height: "290px" }}>
        {children}
      </div>
    </article>
  );
}

function EstadisticasAdmin({
  estadisticas,
  practicantes,
}) {
  const actividad =
    estadisticas?.actividad_ultimos_7_dias || [];

  const formatearDia = (fecha) => {
    const valor = String(fecha || "").slice(0, 10);
    const partes = valor.split("-");

    if (partes.length !== 3) {
      return valor;
    }

    return partes[2] + "/" + partes[1];
  };

  const actividadDiaria = actividad.map(
    (registro) => ({
      fecha: formatearDia(registro.fecha),
      asistencias: Number(
        registro.asistencias || 0
      ),
      horas: Number(registro.horas || 0),
    })
  );

  const estadoUsuarios = [
    {
      nombre: "Activos",
      valor: Number(
        estadisticas?.practicantes_activos || 0
      ),
    },
    {
      nombre: "Inactivos",
      valor: Number(
        estadisticas?.practicantes_inactivos || 0
      ),
    },
  ];

  const estadosAsistencia = [
    {
      nombre: "A tiempo",
      valor: Number(
        estadisticas?.asistencias_a_tiempo_hoy || 0
      ),
    },
    {
      nombre: "Retardos",
      valor: Number(
        estadisticas?.retardos_hoy || 0
      ),
    },
    {
      nombre: "Incompletas",
      valor: Number(
        estadisticas?.asistencias_incompletas_hoy ||
          0
      ),
    },
    {
      nombre: "Pendientes",
      valor: Number(
        estadisticas?.asistencias_pendientes_hoy ||
          0
      ),
    },
  ];

  const totalAsistenciasHoy =
    estadosAsistencia.reduce(
      (total, estado) => total + estado.valor,
      0
    );

  const estadosBitacora = [
    {
      nombre: "Pendientes",
      valor: Number(
        estadisticas?.bitacoras_pendientes || 0
      ),
    },
    {
      nombre: "Aprobadas",
      valor: Number(
        estadisticas?.bitacoras_aprobadas || 0
      ),
    },
    {
      nombre: "Rechazadas",
      valor: Number(
        estadisticas?.bitacoras_rechazadas || 0
      ),
    },
  ];

  const carrerasAgrupadas = practicantes.reduce(
    (acumulado, practicante) => {
      const carrera =
        practicante.carrera || "Sin carrera";

      acumulado[carrera] =
        (acumulado[carrera] || 0) + 1;

      return acumulado;
    },
    {}
  );

  const practicantesPorCarrera = Object.entries(
    carrerasAgrupadas
  ).map(([carrera, total]) => ({
    carrera,
    total,
  }));

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="section-label">
            ANALISIS GENERAL
          </p>

          <h3>
            Estad&iacute;sticas del sistema
          </h3>
        </div>
      </div>

      <p className="panel-description">
        Consulta la distribuci&oacute;n de
        practicantes, asistencias, horas y
        bit&aacute;coras registradas.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
          gap: "20px",
          marginTop: "22px",
        }}
      >
        <TarjetaGrafica
          titulo="Practicantes por carrera"
          descripcion="Cantidad de practicantes registrados en cada carrera."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={practicantesPorCarrera}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="carrera"
                tick={{ fontSize: 11 }}
                interval={0}
                angle={-12}
                height={60}
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="total"
                name="Practicantes"
                fill="#3478c9"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </TarjetaGrafica>

        <TarjetaGrafica
          titulo="Estado de practicantes"
          descripcion="Comparacion entre perfiles activos e inactivos."
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={estadoUsuarios}
                dataKey="valor"
                nameKey="nombre"
                cx="50%"
                cy="50%"
                outerRadius={92}
              >
                {estadoUsuarios.map((item, indice) => (
                  <Cell
                    key={item.nombre}
                    fill={COLORES[indice]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </TarjetaGrafica>

        <TarjetaGrafica
          titulo="Asistencias de los ultimos 7 dias"
          descripcion="Cantidad total de registros de asistencia por dia."
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={actividadDiaria}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="asistencias"
                name="Asistencias"
                stroke="#17284a"
                strokeWidth={3}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </TarjetaGrafica>

        <TarjetaGrafica
          titulo="Asistencias de hoy"
          descripcion="Distribucion de puntualidad y estados del dia."
        >
          {totalAsistenciasHoy === 0 ? (
            <div
              style={{
                height: "100%",
                display: "grid",
                placeItems: "center",
                textAlign: "center",
                color: "#68748a",
              }}
            >
              <div>
                <strong
                  style={{
                    display: "block",
                    color: "#17284a",
                    marginBottom: "6px",
                  }}
                >
                  Sin asistencias registradas hoy
                </strong>

                <span>
                  La grafica se mostrara cuando existan
                  registros del dia.
                </span>
              </div>
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={estadosAsistencia}
                  dataKey="valor"
                  nameKey="nombre"
                  cx="50%"
                  cy="45%"
                  innerRadius={52}
                  outerRadius={88}
                >
                  {estadosAsistencia.map(
                    (item, indice) => (
                      <Cell
                        key={item.nombre}
                        fill={COLORES[indice + 2]}
                      />
                    )
                  )}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </TarjetaGrafica>

        <TarjetaGrafica
          titulo="Horas de los ultimos 7 dias"
          descripcion="Evolucion diaria de las horas contabilizadas."
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={actividadDiaria}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="horas"
                name="Horas"
                stroke="#7c3aed"
                fill="#ddd6fe"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </TarjetaGrafica>

        <TarjetaGrafica
          titulo="Estado de bitacoras"
          descripcion="Entregas pendientes, aprobadas y rechazadas."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={estadosBitacora}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="valor"
                name="Bitacoras"
                radius={[6, 6, 0, 0]}
              >
                {estadosBitacora.map(
                  (item, indice) => (
                    <Cell
                      key={item.nombre}
                      fill={[
                        "#f59e0b",
                        "#43a047",
                        "#dc3545",
                      ][indice]}
                    />
                  )
                )}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </TarjetaGrafica>
      </div>
    </section>
  );
}

export default EstadisticasAdmin;
