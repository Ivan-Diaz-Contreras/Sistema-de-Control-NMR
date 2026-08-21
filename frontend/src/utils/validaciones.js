export const normalizarTexto = (valor) =>
  String(valor ?? "")
    .trim()
    .replace(/\s+/g, " ");

export const validarNombre = (valor) => {
  const texto = normalizarTexto(valor);

  return (
    texto.length >= 2 &&
    texto.length <= 15 &&
    /^[\p{L}]+(?:[ '\-][\p{L}]+)*$/u.test(
      texto
    )
  );
};

export const validarCorreo = (valor) => {
  const correo = normalizarTexto(valor)
    .toLowerCase();

  return (
    correo.length >= 5 &&
    correo.length <= 120 &&
    !correo.includes(" ") &&
    !correo.includes("..") &&
    /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(
      correo
    )
  );
};

export const validarPassword = (valor) => {
  const password = String(valor ?? "");

  return (
    password.length >= 8 &&
    password.length <= 20 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password)
  );
};

export const validarTelefono = (valor) => {
  const telefono = normalizarTexto(valor);

  return (
    telefono === "" ||
    /^\d{10}$/.test(telefono)
  );
};

export const validarUniversidad = (valor) => {
  const universidad = normalizarTexto(valor);

  return (
    universidad === "" ||
    (
      universidad.length >= 2 &&
      universidad.length <= 20 &&
      /\p{L}/u.test(universidad) &&
      !/[<>{}]/.test(universidad)
    )
  );
};

export const validarHorasRequeridas = (valor) => {
  const horas = Number(valor);

  return (
    Number.isFinite(horas) &&
    horas >= 1 &&
    horas <= 2000
  );
};

export const validarFechaISO = (valor) => {
  const fecha = String(valor ?? "");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return false;
  }

  const [anio, mes, dia] =
    fecha.split("-").map(Number);

  const fechaUTC = new Date(
    Date.UTC(anio, mes - 1, dia)
  );

  return (
    fechaUTC.getUTCFullYear() === anio &&
    fechaUTC.getUTCMonth() === mes - 1 &&
    fechaUTC.getUTCDate() === dia
  );
};
