const CLAVE_ACTIVIDADES =
  "nmr_actividades_diarias_v1";

const EVENTO_ACTIVIDADES =
  "nmr-actividades-diarias-actualizadas";

const leerActividades = () => {
  try {
    const datos = JSON.parse(
      localStorage.getItem(CLAVE_ACTIVIDADES) ||
        "[]"
    );

    return Array.isArray(datos) ? datos : [];
  } catch (error) {
    console.error(
      "Error leyendo actividades diarias:",
      error
    );

    return [];
  }
};

const guardarLista = (actividades) => {
  localStorage.setItem(
    CLAVE_ACTIVIDADES,
    JSON.stringify(actividades)
  );

  window.dispatchEvent(
    new CustomEvent(EVENTO_ACTIVIDADES)
  );
};

const crearIdActividad = () => {
  if (typeof crypto?.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return [
    Date.now(),
    Math.random().toString(16).slice(2),
  ].join("-");
};

export const obtenerActividadesDiarias = () => {
  return leerActividades().sort((a, b) => {
    const fechaA = String(a.fecha || "");
    const fechaB = String(b.fecha || "");

    if (fechaA !== fechaB) {
      return fechaB.localeCompare(fechaA);
    }

    return String(b.actualizado_en || "")
      .localeCompare(
        String(a.actualizado_en || "")
      );
  });
};

export const guardarActividadDiaria = (
  actividad
) => {
  const actividades = leerActividades();
  const ahora = new Date().toISOString();

  const indiceExistente =
    actividades.findIndex(
      (registro) =>
        registro.id === actividad.id
    );

  const registro = {
    ...actividad,
    id:
      actividad.id ||
      crearIdActividad(),
    creado_en:
      actividad.creado_en || ahora,
    actualizado_en: ahora,
  };

  if (indiceExistente >= 0) {
    actividades[indiceExistente] =
      registro;
  } else {
    actividades.push(registro);
  }

  guardarLista(actividades);

  return registro;
};

export const eliminarActividadDiaria = (
  idActividad
) => {
  const actividades = leerActividades();

  guardarLista(
    actividades.filter(
      (actividad) =>
        actividad.id !== idActividad
    )
  );
};

export const suscribirseActividadesDiarias = (
  callback
) => {
  const actualizar = () => callback();

  window.addEventListener(
    EVENTO_ACTIVIDADES,
    actualizar
  );

  window.addEventListener(
    "storage",
    actualizar
  );

  return () => {
    window.removeEventListener(
      EVENTO_ACTIVIDADES,
      actualizar
    );

    window.removeEventListener(
      "storage",
      actualizar
    );
  };
};
