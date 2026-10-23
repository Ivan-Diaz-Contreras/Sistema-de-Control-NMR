// Duraciones visibles HH:MM; el valor original conserva fracciones de segundo.
export const formatoHorasMinutos = (horas) => {
  const valor = Number(horas);
  if (!Number.isFinite(valor)) return "00:00";
  const minutos = Math.floor(Math.max(0, valor) * 60 + 1e-7);
  return `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
};
