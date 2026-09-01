import {
  useCallback,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import "../App.css";
import ActividadDiariaPracticante from "../components/practicante/ActividadDiariaPracticante";
import PracticanteSidebar from "../components/practicante/PracticanteSidebar";
import {
  User,
  Hand,
  Clock3,
  Target,
  Hourglass,
  TrendingUp,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  ListChecks,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  LogOut,
  Menu,
  CircleUserRound,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

const API = `${API_URL}/api`;

function PracticantePanel({
  usuario,
  token,
  onLogout,
  onUsuarioActualizado,
}) {

  const [perfil, setPerfil] = useState(null);
  const [avance, setAvance] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);
  const [procesandoAsistencia, setProcesandoAsistencia] = useState(false);
  const [seccion, setSeccion] = useState(() => {
    const estado = window.history.state;

    if (
      estado?.panel === "practicante" &&
      estado?.seccion
    ) {
      return estado.seccion;
    }

    return "dashboard";
  });
  const [horario, setHorario] = useState(null);
  const [asistenciaHoy, setAsistenciaHoy] = useState(null);
  const [registrosHoras, setRegistrosHoras] = useState([]);
  const [filtroPeriodoHoras, setFiltroPeriodoHoras] = useState("todos");
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] =
  useState(false);
  const [menuLateralAbierto, setMenuLateralAbierto] =
    useState(false);

  // ==========================================
  // SEGURIDAD / CAMBIO DE CONTRASEÑA
  // ==========================================

  const [formPassword, setFormPassword] =
    useState({
      password_actual: "",
      password_nueva: "",
      confirmar_password: "",
    });

  const [mostrarPasswords, setMostrarPasswords] =
    useState(false);

  const [
    guardandoPassword,
    setGuardandoPassword,
  ] = useState(false);

  // ==========================================
  // BITÁCORAS DEL PRACTICANTE
  // ==========================================

  const [actividadesBitacora, setActividadesBitacora] = useState([]);
  const [bitacoras, setBitacoras] = useState([]);
  const [
    notificacionBitacora,
    setNotificacionBitacora,
  ] = useState(null);
  const [cargandoBitacoras, setCargandoBitacoras] = useState(false);
  const [subiendoBitacora, setSubiendoBitacora] = useState(null);
  const [archivoBitacora, setArchivoBitacora] = useState(null);

  // ==========================================
  // NOTIFICACIONES DEL PRACTICANTE
  // ==========================================

  const [notificaciones, setNotificaciones] = useState({});
  const [notificacionAprobada, setNotificacionAprobada] = useState(null);

  const cargarNotificaciones = useCallback(async () => {
    if (!token || usuario?.rol !== "Practicante") {
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [resumenResponse, listaResponse] =
        await Promise.all([
          axios.get(
            `${API}/notificaciones/resumen`,
            { headers }
          ),
          axios.get(
            `${API}/notificaciones`,
            { headers }
          ),
        ]);

      setNotificaciones(
        resumenResponse.data?.secciones || {}
      );

      const lista =
        listaResponse.data?.notificaciones || [];

      const aprobacionPendiente = lista.find(
        (notificacion) =>
          notificacion.tipo ===
            "BITACORA_APROBADA" &&
          Number(notificacion.leida) === 0
      );

      if (aprobacionPendiente) {
        const claveAprobacion = String(
          aprobacionPendiente.id_notificacion
        );

        const claveVista = sessionStorage.getItem(
          "bitacora_aprobada_vista"
        );

        if (claveVista !== claveAprobacion) {
          setNotificacionAprobada(
            aprobacionPendiente
          );
        }
      } else {
        setNotificacionAprobada(null);
      }
    } catch (error) {
      console.error(
        "Error cargando notificaciones:",
        error
      );
    }
  }, [token, usuario?.rol]);

  const marcarSeccionComoLeida = async (
    nombreSeccion
  ) => {
    try {
      await axios.put(
        `${API}/notificaciones/seccion/${nombreSeccion}/leer`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotificaciones((actual) => ({
        ...actual,
        [nombreSeccion]: 0,
      }));
    } catch (error) {
      console.error(
        "Error marcando notificaciones como leídas:",
        error
      );
    }
  };

  const obtenerCantidadNotificaciones = (
    nombreSeccion
  ) => {
    return Number(
      notificaciones?.[nombreSeccion] || 0
    );
  };

  const mostrarBadgeNotificacion = (
    nombreSeccion
  ) => {
    const cantidad =
      obtenerCantidadNotificaciones(nombreSeccion);

    if (cantidad <= 0) {
      return null;
    }

    return (
      <span className="nav-badge">
        {cantidad > 99 ? "99+" : cantidad}
      </span>
    );
  };
//const headers = {
  //  Authorization: `Bearer ${token}`,
  //};

useEffect(() => {
  if (!token || usuario?.rol !== "Practicante") {
    return;
  }

  const cargarDatos = async () => {
    try {
      setCargando(true);

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        perfilResponse,
        avanceResponse,
        horasResponse,
      ] = await Promise.all([
        axios.get(`${API}/practicantes/perfil`, { headers }),
        axios.get(`${API}/practicantes/avance`, { headers }),
        axios.get(`${API}/practicantes/horas`, { headers }),
      ]);

      const perfilCargado =
        perfilResponse.data.perfil;

      setPerfil(perfilCargado);
      setAvance(avanceResponse.data);
      setRegistrosHoras(
        horasResponse.data.registros || []
      );

      if (
        Number(
          perfilCargado?.debe_cambiar_password ||
            usuario?.debe_cambiar_password ||
            0
        ) === 1
      ) {
        window.history.replaceState(
          {
            ...(window.history.state || {}),
            panel: "practicante",
            seccion: "perfil",
          },
          ""
        );

        setSeccion("perfil");
        setMensaje(
          "Por seguridad debes cambiar la contraseña temporal antes de continuar."
        );
      }
    } catch (error) {
      console.error(error);

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        setPerfil(null);
        setAvance(null);

        setMensaje(
          error.response?.data?.mensaje ||
            "Tu sesión ya no es válida. Inicia sesión nuevamente."
        );

        onLogout();
      } else {
        setMensaje(
          error.response?.data?.mensaje ||
            "No se pudieron cargar los datos del practicante."
        );
      }
    } finally {
      setCargando(false);
    }
  };

  cargarDatos();
}, [token, usuario?.rol]);

const registrarEntrada = async () => {
  try {
    setProcesandoAsistencia(true);
    setMensaje("");

    const response = await axios.post(
      `${API}/practicantes/asistencia/entrada`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMensaje(
      response.data.mensaje ||
        "Entrada registrada correctamente."
    );

    await cargarAsistenciaHoy();

  } catch (error) {
    console.error(error);

    setMensaje(
      error.response?.data?.mensaje ||
        "No se pudo registrar la entrada."
    );
  } finally {
    setProcesandoAsistencia(false);
  }
};

const cargarHorario = useCallback(async () => {
  if (!token || usuario?.rol !== "Practicante") {
    return;
  }

  try {
    const response = await axios.get(
      `${API}/practicantes/asistencia/horario`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Horario recibido:", response.data);

    const horarios = response.data.horario || [];

    const dias = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];

    const diaActual = dias[new Date().getDay()];

    const horarioHoy = horarios.find(
      (item) => item.dia_semana === diaActual
    );

    setHorario(horarioHoy || null);

  } catch (error) {
    console.error("Error cargando horario:", error);
    setHorario(null);
  }
}, [token, usuario?.rol]);

const cargarAsistenciaHoy = useCallback(async () => {
  if (!token) {
    setAsistenciaHoy(null);
    return;
  }

  try {
    const response = await axios.get(
      `${API}/practicantes/asistencia/historial`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const asistencias =
      response.data.asistencias || [];

    const ahora = new Date();

    const fechaHoy = [
      ahora.getFullYear(),
      String(ahora.getMonth() + 1).padStart(2, "0"),
      String(ahora.getDate()).padStart(2, "0"),
    ].join("-");

    const registroHoy = asistencias.find(
      (asistencia) =>
        String(asistencia.fecha).slice(0, 10) ===
        fechaHoy
    );

    setAsistenciaHoy(registroHoy || null);
  } catch (error) {
    console.error(
      "Error cargando asistencia de hoy:",
      error
    );

    setAsistenciaHoy(null);
  }
}, [token]);

const registrarSalida = async () => {
  try {
    setProcesandoAsistencia(true);
    setMensaje("");

    const response = await axios.post(
      `${API}/practicantes/asistencia/salida`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMensaje(
      response.data.mensaje ||
        "Salida registrada correctamente."
    );

    await cargarAsistenciaHoy();

  } catch (error) {
    console.error(error);

    setMensaje(
      error.response?.data?.mensaje ||
        "No se pudo registrar la salida."
    );
  } finally {
    setProcesandoAsistencia(false);
  }
};

const cargarBitacorasPracticante = useCallback(async () => {
  if (!token || usuario?.rol !== "Practicante") {
    return;
  }

  try {
    setCargandoBitacoras(true);
    setMensaje("");

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const [actividadesResponse, bitacorasResponse] =
      await Promise.all([
        axios.get(
          `${API}/practicantes/bitacoras/actividades`,
          { headers }
        ),
        axios.get(
          `${API}/practicantes/bitacoras`,
          { headers }
        ),
      ]);

    const actividades =
      actividadesResponse.data.actividades || [];

    const bitacorasRecibidas =
      bitacorasResponse.data.bitacoras || [];

    setActividadesBitacora(actividades);
    setBitacoras(bitacorasRecibidas);

    const actividadRechazada = actividades.find(
      (actividad) =>
        String(actividad.estado_entrega || "")
          .trim()
          .toLowerCase() === "rechazada"
    );

    if (actividadRechazada) {
      const claveNotificacion = [
        actividadRechazada.id_bitacora ||
          actividadRechazada.id_actividad,
        actividadRechazada.observaciones ||
          "sin-observaciones",
      ].join("-");

      const claveVista = sessionStorage.getItem(
        "bitacora_rechazada_vista"
      );

      if (claveVista !== claveNotificacion) {
        setNotificacionBitacora({
          ...actividadRechazada,
          claveNotificacion,
        });
      }
    } else {
      setNotificacionBitacora(null);
      sessionStorage.removeItem(
        "bitacora_rechazada_vista"
      );
    }
  } catch (error) {
    console.error(
      "Error cargando bitácoras del practicante:",
      error
    );

    setMensaje(
      error.response?.data?.mensaje ||
        "No se pudieron cargar las actividades de bitácora."
    );
  } finally {
    setCargandoBitacoras(false);
  }
}, [token, usuario?.rol]);

useEffect(() => {
  if (
    token &&
    usuario?.rol === "Practicante"
  ) {
    cargarBitacorasPracticante();
  }
}, [
  token,
  usuario?.rol,
  cargarBitacorasPracticante,
]);

useEffect(() => {
  if (
    token &&
    usuario?.rol === "Practicante"
  ) {
    cargarNotificaciones();
  }
}, [
  token,
  usuario?.rol,
  cargarNotificaciones,
]);

const cerrarNotificacionAprobada = () => {
  if (notificacionAprobada?.id_notificacion) {
    sessionStorage.setItem(
      "bitacora_aprobada_vista",
      String(notificacionAprobada.id_notificacion)
    );
  }

  setNotificacionAprobada(null);
};

const verBitacoraAprobada = () => {
  cerrarNotificacionAprobada();
  cambiarSeccion("bitacoras");
};

const cerrarNotificacionBitacora = () => {
  if (notificacionBitacora?.claveNotificacion) {
    sessionStorage.setItem(
      "bitacora_rechazada_vista",
      notificacionBitacora.claveNotificacion
    );
  }

  setNotificacionBitacora(null);
};

const verBitacoraRechazada = () => {
  cerrarNotificacionBitacora();
  cambiarSeccion("bitacoras");
};



const cambiarCampoPassword = (e) => {
  const { name, value } = e.target;

  setFormPassword((actual) => ({
    ...actual,
    [name]: value,
  }));
};

// ==========================================
// HISTORIAL DE NAVEGACIÓN DEL PRACTICANTE
// ==========================================

useEffect(() => {
  const estadoActual =
    window.history.state;

  if (
    estadoActual?.panel !== "practicante" ||
    !estadoActual?.seccion
  ) {
    window.history.replaceState(
      {
        ...(estadoActual || {}),
        panel: "practicante",
        seccion,
      },
      ""
    );
  }

  const manejarNavegacion = async (
    event
  ) => {
    const nuevaSeccion =
      event.state?.panel === "practicante" &&
      event.state?.seccion
        ? event.state.seccion
        : "dashboard";

    const cambioObligatorio =
      Number(
        perfil?.debe_cambiar_password ||
          usuario?.debe_cambiar_password ||
          0
      ) === 1;

    if (
      cambioObligatorio &&
      nuevaSeccion !== "perfil"
    ) {
      window.history.replaceState(
        {
          ...(window.history.state || {}),
          panel: "practicante",
          seccion: "perfil",
        },
        ""
      );

      setSeccion("perfil");
      setMensaje(
        "Debes cambiar tu contraseña temporal antes de utilizar las demás secciones."
      );
      setMenuLateralAbierto(false);
      return;
    }

    setSeccion(nuevaSeccion);
    setMensaje("");
    setMenuLateralAbierto(false);

    if (nuevaSeccion === "asistencia") {
      cargarHorario();
      cargarAsistenciaHoy();
    }

    if (nuevaSeccion === "bitacoras") {
      await cargarBitacorasPracticante();
    }
  };

  window.addEventListener(
    "popstate",
    manejarNavegacion
  );

  return () => {
    window.removeEventListener(
      "popstate",
      manejarNavegacion
    );
  };
}, [
  perfil?.debe_cambiar_password,
  usuario?.debe_cambiar_password,
  cargarHorario,
  cargarAsistenciaHoy,
  cargarBitacorasPracticante,
]);

const cambiarSeccion = async (nuevaSeccion) => {
  const cambioObligatorio =
    Number(
      perfil?.debe_cambiar_password ||
        usuario?.debe_cambiar_password ||
        0
    ) === 1;

  if (
    cambioObligatorio &&
    nuevaSeccion !== "perfil"
  ) {
    window.history.replaceState(
      {
        ...(window.history.state || {}),
        panel: "practicante",
        seccion: "perfil",
      },
      ""
    );

    setSeccion("perfil");

    setMensaje(
      "Debes cambiar tu contraseña temporal antes de utilizar las demás secciones."
    );

    return;
  }

  if (nuevaSeccion !== seccion) {
    window.history.pushState(
      {
        ...(window.history.state || {}),
        panel: "practicante",
        seccion: nuevaSeccion,
      },
      ""
    );
  }

  setSeccion(nuevaSeccion);
  setMensaje("");

  // Cargar horario cuando se abre Asistencia
  if (nuevaSeccion === "asistencia") {
    cargarHorario();
    cargarAsistenciaHoy();
  }

  // Actualizar las bitácoras al entrar
  if (nuevaSeccion === "bitacoras") {
    await cargarBitacorasPracticante();
  }

  // Marcar como leídas las novedades de la sección
  if (
    obtenerCantidadNotificaciones(
      nuevaSeccion
    ) > 0
  ) {
    await marcarSeccionComoLeida(
      nuevaSeccion
    );
  }
};
const guardarNuevaPassword = async (e) => {
  e.preventDefault();

  if (
    formPassword.password_nueva !==
    formPassword.confirmar_password
  ) {
    setMensaje(
      "La nueva contraseña y su confirmación no coinciden."
    );
    return;
  }

  if (formPassword.password_nueva.length < 8) {
    setMensaje(
      "La nueva contraseña debe tener al menos 8 caracteres."
    );
    return;
  }

  try {
    setGuardandoPassword(true);
    setMensaje("");

    const response = await axios.put(
      `${API}/practicantes/password`,
      {
        password_actual:
          formPassword.password_actual,
        password_nueva:
          formPassword.password_nueva,
        confirmar_password:
          formPassword.confirmar_password,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setPerfil((actual) => ({
      ...actual,
      debe_cambiar_password: 0,
    }));

    onUsuarioActualizado?.({
      debe_cambiar_password: 0,
    });

    setFormPassword({
      password_actual: "",
      password_nueva: "",
      confirmar_password: "",
    });

    setMostrarPasswords(false);

    setMensaje(
      response.data.mensaje ||
        "Contraseña actualizada correctamente."
    );
  } catch (error) {
    console.error(
      "Error cambiando contraseña:",
      error
    );

    setMensaje(
      error.response?.data?.mensaje ||
        "No se pudo cambiar la contraseña."
    );
  } finally {
    setGuardandoPassword(false);
  }
};

const seleccionarArchivoBitacora = (
  idActividad,
  archivo
) => {
  setSubiendoBitacora(idActividad);
  setArchivoBitacora(archivo || null);
  setMensaje("");
};

const subirPdfBitacora = async (
  idActividad
) => {
  if (!archivoBitacora) {
    setMensaje(
      "Selecciona un archivo PDF antes de subir la bitácora."
    );
    return;
  }

  try {
    setMensaje("");

    const formData = new FormData();

    formData.append(
      "id_actividad",
      String(idActividad)
    );

    formData.append(
      "archivo",
      archivoBitacora
    );

    const response = await axios.post(
      `${API}/practicantes/bitacoras`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMensaje(
      response.data.mensaje ||
        "Bitácora subida correctamente."
    );

    setSubiendoBitacora(null);
    setArchivoBitacora(null);

    await cargarBitacorasPracticante();
  } catch (error) {
    console.error(
      "Error subiendo bitácora:",
      error
    );

    setMensaje(
      error.response?.data?.mensaje ||
        "No se pudo subir la bitácora."
    );
  }
};

const cancelarEntregaBitacora = async (
  idBitacora
) => {
  const confirmar = window.confirm(
    "¿Deseas cancelar esta entrega? El archivo dejará de estar enviado y podrás subir uno nuevo."
  );

  if (!confirmar) {
    return;
  }

  try {
    setMensaje("");

    const response = await axios.delete(
      `${API}/practicantes/bitacoras/${idBitacora}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMensaje(
      response.data.mensaje ||
        "Entrega cancelada correctamente."
    );

    setSubiendoBitacora(null);
    setArchivoBitacora(null);

    await Promise.all([
      cargarBitacorasPracticante(),
      cargarNotificaciones(),
    ]);
  } catch (error) {
    console.error(
      "Error cancelando entrega de bitácora:",
      error
    );

    setMensaje(
      error.response?.data?.mensaje ||
        "No se pudo cancelar la entrega."
    );
  }
};

const abrirPdfBitacora = async (
  idBitacora
) => {
  try {
    const response = await axios.get(
      `${API}/practicantes/bitacoras/${idBitacora}/archivo`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      }
    );

    const url = URL.createObjectURL(
      new Blob([response.data], {
        type: "application/pdf",
      })
    );

    window.open(url, "_blank");

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60000);
  } catch (error) {
    console.error(
      "Error abriendo PDF:",
      error
    );

    setMensaje(
      error.response?.data?.mensaje ||
        "No se pudo abrir el archivo PDF."
    );
  }
};

const obtenerTextoEstadoBitacora = (
  elemento
) => {
  const entregada =
    elemento?.entregada === true ||
    Number(elemento?.entregada) === 1 ||
    Boolean(elemento?.id_bitacora);

  const estado = String(
    elemento?.estado_entrega ||
      elemento?.estado ||
      ""
  )
    .trim()
    .toLowerCase();

  if (!entregada) {
    return "Pendiente de entrega";
  }

  if (estado === "pendiente" || !estado) {
    return "Pendiente de revisión";
  }

  if (estado === "aprobada") {
    return "Aprobada";
  }

  if (estado === "rechazada") {
    return "Rechazada";
  }

  return (
    elemento?.estado_entrega ||
    elemento?.estado ||
    "Pendiente de revisión"
  );
};

const obtenerClaseEstadoBitacoraPracticante = (
  actividad
) => {
  if (
    !actividad?.entregada &&
    !actividad?.estado
  ) {
    return "bitacora-status-pending";
  }

  const estado = String(
    actividad.estado_entrega ||
      actividad.estado ||
      "Pendiente"
  )
    .trim()
    .toLowerCase();

  if (
    estado === "aprobada" ||
    estado === "aceptada"
  ) {
    return "bitacora-status-approved";
  }

  if (estado === "rechazada") {
    return "bitacora-status-rejected";
  }

  return "bitacora-status-pending";
};

const formatearFechaBitacora = (fecha) => {
  if (!fecha) {
    return "—";
  }

  const valor = String(fecha).slice(0, 10);
  const [anio, mes, dia] = valor.split("-");

  return anio && mes && dia
    ? `${dia}/${mes}/${anio}`
    : valor;
};

const formatearFechaHoraBitacora = (fecha) => {
  if (!fecha) {
    return "—";
  }

  const texto = String(fecha)
    .trim()
    .replace("T", " ")
    .replace("Z", "")
    .slice(0, 19);

  const [parteFecha, parteHora = ""] =
    texto.split(" ");

  const [anio, mes, dia] =
    parteFecha.split("-");

  const [hora = "00", minuto = "00"] =
    parteHora.split(":");

  if (
    anio &&
    mes &&
    dia &&
    /^\d{4}$/.test(anio)
  ) {
    return `${dia}/${mes}/${anio}, ${hora}:${minuto}`;
  }

  return texto;
};




  // ==========================================
  // ACTUALIZACIÓN AUTOMÁTICA
  // ==========================================
  // Mantiene notificaciones y la sección visible actualizadas
  // sin necesidad de recargar manualmente la página.
  useEffect(() => {
    if (!token || usuario?.rol !== "Practicante") {
      return undefined;
    }

    const actualizarSeccionVisible = async () => {
      await cargarNotificaciones();

      if (seccion === "asistencia") {
        await Promise.all([
          cargarHorario(),
          cargarAsistenciaHoy(),
        ]);
      }

      if (seccion === "bitacoras") {
        await cargarBitacorasPracticante();
      }

      if (seccion === "dashboard") {
        await cargarAsistenciaHoy();
      }
    };

    const intervalo = window.setInterval(() => {
      // No hacemos peticiones mientras la pestaña no está visible.
      if (document.visibilityState === "visible") {
        actualizarSeccionVisible();
      }
    }, 15000);

    return () => {
      window.clearInterval(intervalo);
    };
  }, [
    token,
    usuario?.rol,
    seccion,
    cargarNotificaciones,
    cargarHorario,
    cargarAsistenciaHoy,
    cargarBitacorasPracticante,
  ]);


  if (cargando) {
    return (
      <div className="loading-screen">
        <div className="loading-card">
          <div className="spinner"></div>
          <h2>Cargando sistema...</h2>
          <p>Conectando con el servidor.</p>
        </div>
      </div>
    );
  }

  const porcentaje = avance?.porcentaje_avance || 0;

  const convertirFechaHoras = (fecha) => {
    const valor = String(fecha || "").slice(0, 10);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
      return null;
    }

    return new Date(`${valor}T12:00:00`);
  };

  const hoyHoras = new Date();
  hoyHoras.setHours(12, 0, 0, 0);

  const inicioSemanaHoras = new Date(hoyHoras);
  const diasDesdeLunes =
    (inicioSemanaHoras.getDay() + 6) % 7;

  inicioSemanaHoras.setDate(
    inicioSemanaHoras.getDate() - diasDesdeLunes
  );

  const inicioMesHoras = new Date(
    hoyHoras.getFullYear(),
    hoyHoras.getMonth(),
    1,
    12
  );

  const registrosHorasFiltrados =
    registrosHoras.filter((registro) => {
      const fechaRegistro =
        convertirFechaHoras(registro.fecha);

      if (!fechaRegistro) {
        return filtroPeriodoHoras === "todos";
      }

      if (filtroPeriodoHoras === "semana") {
        return (
          fechaRegistro >= inicioSemanaHoras &&
          fechaRegistro <= hoyHoras
        );
      }

      if (filtroPeriodoHoras === "mes") {
        return (
          fechaRegistro >= inicioMesHoras &&
          fechaRegistro <= hoyHoras
        );
      }

      return true;
    });

  const horasEstaSemana = registrosHoras.reduce(
    (total, registro) => {
      const fechaRegistro =
        convertirFechaHoras(registro.fecha);

      if (
        fechaRegistro &&
        fechaRegistro >= inicioSemanaHoras &&
        fechaRegistro <= hoyHoras
      ) {
        return total + Number(registro.horas || 0);
      }

      return total;
    },
    0
  );

  const promedioHoras =
    registrosHoras.length > 0
      ? registrosHoras.reduce(
          (total, registro) =>
            total + Number(registro.horas || 0),
          0
        ) / registrosHoras.length
      : 0;
  
  const obtenerEstadoAsistencia = () => {
    if (!horario) {
      return {
        texto: "Sin horario",
        clase: "sin-horario",
      };
    }

    // Ya registró entrada y salida
    if (
      asistenciaHoy?.hora_entrada_real &&
      asistenciaHoy?.hora_salida_real
    ) {
      return {
        texto: "Jornada completada",
        clase: "completada",
      };
    }

    // Ya registró entrada pero todavía no salida
    if (
      asistenciaHoy?.hora_entrada_real &&
      !asistenciaHoy?.hora_salida_real
    ) {
      return {
        texto: "En jornada",
        clase: "en-jornada",
      };
    }

    // Aún no registra entrada
    const ahora = new Date();

    const [horas, minutos] = String(
      horario.hora_entrada || "00:00"
    )
      .split(":")
      .map(Number);

    const horaEsperada = new Date();

    horaEsperada.setHours(
      horas,
      minutos,
      0,
      0
    );

    if (ahora > horaEsperada) {
      return {
        texto: "Retardo",
        clase: "retardo",
      };
    }

    return {
      texto: "Disponible",
      clase: "disponible",
    };
  };

  const estadoAsistencia =
  obtenerEstadoAsistencia();

  return (
    <div className="app">

      <PracticanteSidebar
        seccion={seccion}
        cambiarSeccion={cambiarSeccion}
        onLogout={onLogout}
        notificaciones={notificaciones}
        abierto={menuLateralAbierto}
        onCerrar={() =>
          setMenuLateralAbierto(false)
        }
      />

      <main className="main-content">
        <button
          type="button"
          className="mobile-menu-button"
          onClick={() =>
            setMenuLateralAbierto(true)
          }
          aria-label="Abrir menú"
        >
          <Menu size={20} />
          Menú
        </button>

        <header className="topbar">
          <div>
            <p className="section-label">PANEL DEL PRACTICANTE</p>

            <h2>
              {seccion === "dashboard"
                ? "Dashboard"
                : seccion === "perfil"
                ? "Mi perfil"
                : seccion === "asistencia"
                ? "Asistencia"
                : seccion === "horas"
                ? "Mis horas"
                : seccion === "actividad-diaria"
                ? "Actividad diaria"
                : seccion === "bitacoras"
                ? "Bitácoras"
                : "Evidencias"}
            </h2>
          </div>

          <div className="user-menu-wrapper">

            <button
              type="button"
              className="user-info user-info-button"
              onClick={() =>
                setMenuUsuarioAbierto((abierto) => !abierto)
              }
            >
              <div className="avatar">
                <User size={22} />
              </div>

              <div className="user-info-text">
                <strong>
                  {perfil?.nombre ||
                    usuario?.nombre ||
                    "Usuario"}
                </strong>

                <span>Practicante</span>
              </div>

              <ChevronDown
                size={17}
                className={`user-menu-chevron ${
                  menuUsuarioAbierto ? "open" : ""
                }`}
              />
            </button>

            {menuUsuarioAbierto && (
              <div className="user-dropdown">

                <div className="user-dropdown-header">
                  <div className="user-dropdown-avatar">
                    <User size={20} />
                  </div>

                  <div>
                    <strong>
                      {perfil?.nombre ||
                        usuario?.nombre ||
                        "Usuario"}
                    </strong>

                    <span>Practicante</span>
                  </div>
                </div>

                <div className="user-dropdown-divider" />

                <button
                  type="button"
                  className="user-dropdown-item"
                  onClick={() => {
                    cambiarSeccion("perfil");
                    setMenuUsuarioAbierto(false);
                  }}
                >
                  <CircleUserRound size={18} />
                  Mi perfil
                </button>

                <button
                  type="button"
                  className="user-dropdown-item logout"
                  onClick={onLogout}
                >
                  <LogOut size={18} />
                  Cerrar sesión
                </button>

              </div>
            )}

          </div>
        </header>

        {mensaje && <div className="message">{mensaje}</div>}

        {notificacionAprobada && (
          <div
            className="bitacora-alert-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-bitacora-aprobada"
          >
            <div className="bitacora-alert-modal bitacora-alert-modal-success">
              <div className="bitacora-alert-icon bitacora-alert-icon-success">
                <CheckCircle2 size={34} />
              </div>

              <div className="bitacora-alert-content">
                <p className="section-label">
                  REVISI&Oacute;N DE BIT&Aacute;CORA
                </p>

                <h2 id="titulo-bitacora-aprobada">
                  Bit&aacute;cora aprobada
                </h2>

                <p>
                  {notificacionAprobada.mensaje ||
                    "Tu bit&aacute;cora fue aprobada correctamente."}
                </p>

                <div className="bitacora-alert-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={cerrarNotificacionAprobada}
                  >
                    Cerrar
                  </button>

                  <button
                    type="button"
                    onClick={verBitacoraAprobada}
                  >
                    Ver bit&aacute;cora
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {notificacionBitacora && (
          <div
            className="bitacora-alert-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-bitacora-rechazada"
          >
            <div className="bitacora-alert-modal">
              <div className="bitacora-alert-icon">
                <AlertTriangle size={34} />
              </div>

              <div className="bitacora-alert-content">
                <p className="section-label">
                  REVISI&Oacute;N DE BIT&Aacute;CORA
                </p>

                <h2 id="titulo-bitacora-rechazada">
                  Bit&aacute;cora rechazada
                </h2>

                <p>
                  Tu entrega
                  {notificacionBitacora.numero_semana
                    ? ` de la semana ${notificacionBitacora.numero_semana}`
                    : ""}{" "}
                  necesita correcciones.
                </p>

                {notificacionBitacora.titulo && (
                  <p>
                    <strong>Actividad:</strong>{" "}
                    {notificacionBitacora.titulo}
                  </p>
                )}

                <div className="bitacora-alert-observacion">
                  <strong>
                    Comentario del administrador
                  </strong>

                  <p>
                    {notificacionBitacora.observaciones ||
                      "El administrador no agrego comentarios."}
                  </p>
                </div>

                <div className="bitacora-alert-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={cerrarNotificacionBitacora}
                  >
                    Cerrar
                  </button>

                  <button
                    type="button"
                    onClick={verBitacoraRechazada}
                  >
                    Ver bit&aacute;cora
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {seccion === "dashboard" && (
          <>
            <section className="welcome-card">
              <div>
                <p className="section-label">BIENVENIDO</p>

                <h1>
                  Hola, {perfil?.nombre || usuario?.nombre || "Samuel"}{" "}
                  <Hand
                    size={34}
                    strokeWidth={2}
                    aria-label="Saludo"
                    style={{
                      verticalAlign: "middle",
                    }}
                  />
                </h1>

                <p>
                  Aquí puedes consultar tu progreso y administrar tus
                  actividades de prácticas profesionales.
                </p>
              </div>

              <div className="welcome-icon">NMR</div>
            </section>

            <section className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">
                  <Clock3 size={22} />
                </span>

                <div>
                  <p>Horas acumuladas</p>
                  <strong>
                    {avance?.horas_acumuladas?.toFixed(2) || "0.00"}
                  </strong>
                  <small>horas</small>
                </div>
              </div>

              <div className="stat-card">
                <span className="stat-icon">
                  <TrendingUp size={22} />
                </span>

                <div>
                  <p>Avance</p>
                  <strong>{porcentaje}%</strong>
                  <small>completado</small>
                </div>
              </div>

              <div className="stat-card">
                <span className="stat-icon">
                  <Hourglass size={22} />
                </span>

                <div>
                  <p>Horas restantes</p>
                  <strong>
                    {avance?.horas_restantes?.toFixed(2) || "0.00"}
                  </strong>
                  <small>horas</small>
                </div>
              </div>
            </section>

            <section className="content-grid">
              <div className="panel">
                <div className="panel-header">
                  <div>
                    <p className="section-label">ASISTENCIA</p>
                    <h3>Control de asistencia</h3>
                  </div>

                  <span className="status-dot">● Disponible</span>
                </div>

                <p className="panel-description">
                  Registra tu entrada y salida de la jornada desde este
                  panel.
                </p>

                <div className="attendance-buttons">
                  <button
                    className="attendance-button entry"
                    onClick={registrarEntrada}
                    disabled={procesandoAsistencia ||
                              Boolean(asistenciaHoy?.hora_entrada_real)
                             }
                  >
                    <span>→</span>
                    Registrar entrada
                  </button>

                  <button
                    className="attendance-button exit"
                    onClick={registrarSalida}
                    disabled={procesandoAsistencia ||
                              !asistenciaHoy?.hora_entrada_real ||
                              Boolean(asistenciaHoy?.hora_salida_real)
                             }
                  >
                    <span>←</span>
                    Registrar salida
                  </button>
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <div>
                    <p className="section-label">MI INFORMACIÓN</p>
                    <h3>Perfil</h3>
                  </div>
                </div>

                {perfil ? (
                  <div className="profile-list">
                    <div>
                      <span>Nombre completo</span>
                      <strong>
                        {perfil.nombre} {perfil.apellido_paterno}{" "}
                        {perfil.apellido_materno || ""}
                      </strong>
                    </div>

                    <div>
                      <span>Correo</span>
                      <strong>{perfil.correo}</strong>
                    </div>

                    <div>
                      <span>Matrícula</span>
                      <strong>
                        {perfil.matricula || "No registrada"}
                      </strong>
                    </div>

                    <div>
                      <span>Carrera</span>
                      <strong>{perfil.carrera}</strong>
                    </div>

                    <div>
                      <span>Universidad</span>
                      <strong>
                        {perfil.universidad || "No registrada"}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <p>No se pudo cargar el perfil.</p>
                )}
              </div>
            </section>

            <section className="progress-panel">
              <div className="progress-header">
                <div>
                  <p className="section-label">PROGRESO</p>
                  <h3>Avance de prácticas profesionales</h3>
                </div>

                <strong>{porcentaje}%</strong>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${porcentaje}%` }}
                ></div>
              </div>

              <div className="progress-footer">
                <span>
                  {avance?.horas_acumuladas?.toFixed(2) || "0.00"} horas
                  acumuladas
                </span>

                <span>
                  {avance?.horas_requeridas?.toFixed(2) || "0.00"} horas
                  requeridas
                </span>
              </div>
            </section>
          </>
        )}

        {seccion === "perfil" && (
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="section-label">INFORMACIÓN PERSONAL</p>
                <h3>Mi perfil</h3>
              </div>
            </div>

            {perfil ? (
              <div className="profile-list">
                <div>
                  <span>Nombre completo</span>
                  <strong>
                    {perfil.nombre} {perfil.apellido_paterno}{" "}
                    {perfil.apellido_materno || ""}
                  </strong>
                </div>

                <div>
                  <span>Correo electrónico</span>
                  <strong>{perfil.correo}</strong>
                </div>

                <div>
                  <span>Matrícula</span>
                  <strong>
                    {perfil.matricula || "No registrada"}
                  </strong>
                </div>

                <div>
                  <span>Carrera</span>
                  <strong>{perfil.carrera}</strong>
                </div>

                <div>
                  <span>Universidad</span>
                  <strong>
                    {perfil.universidad || "No registrada"}
                  </strong>
                </div>

                <div>
                  <span>Teléfono</span>
                  <strong>
                    {perfil.telefono || "No registrado"}
                  </strong>
                </div>
              </div>
            ) : (
              <p>No se pudo cargar el perfil.</p>
            )}

            <div className="password-section">
              <div className="password-section-header">
                <div>
                  <p className="section-label">
                    SEGURIDAD
                  </p>
                  <h3>Cambiar contraseña</h3>
                </div>

                {Number(
                  perfil?.debe_cambiar_password ||
                    usuario?.debe_cambiar_password ||
                    0
                ) === 1 && (
                  <span className="password-required-badge">
                    Cambio obligatorio
                  </span>
                )}
              </div>

              <p className="panel-description">
                Tu nueva contraseña es privada. El
                administrador no podrá verla después de
                que la cambies.
              </p>

              <form
                onSubmit={guardarNuevaPassword}
                className="password-form"
              >
                <label>
                  Contraseña actual
                  <input
                    type={
                      mostrarPasswords
                        ? "text"
                        : "password"
                    }
                    name="password_actual"
                    value={
                      formPassword.password_actual
                    }
                    onChange={cambiarCampoPassword}
                    autoComplete="current-password"
                    required
                  />
                </label>

                <label>
                  Nueva contraseña
                  <input
                    type={
                      mostrarPasswords
                        ? "text"
                        : "password"
                    }
                    name="password_nueva"
                    value={
                      formPassword.password_nueva
                    }
                    onChange={cambiarCampoPassword}
                    autoComplete="new-password"
                    minLength="8"
                    required
                  />
                </label>

                <label>
                  Confirmar nueva contraseña
                  <input
                    type={
                      mostrarPasswords
                        ? "text"
                        : "password"
                    }
                    name="confirmar_password"
                    value={
                      formPassword.confirmar_password
                    }
                    onChange={cambiarCampoPassword}
                    autoComplete="new-password"
                    minLength="8"
                    required
                  />
                </label>

                <label className="password-show-option">
                  <input
                    type="checkbox"
                    checked={mostrarPasswords}
                    onChange={(e) =>
                      setMostrarPasswords(
                        e.target.checked
                      )
                    }
                  />
                  Mostrar contraseñas mientras escribo
                </label>

                <div className="admin-form-actions">
                  <button
                    type="submit"
                    disabled={guardandoPassword}
                  >
                    {guardandoPassword
                      ? "Actualizando..."
                      : "Cambiar contraseña"}
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {seccion === "asistencia" && (
          <div className="attendance-page">

            <section className="attendance-hero">
              <div>
                <p className="section-label">ASISTENCIA</p>

                <h2>Control de jornada</h2>

                <p>
                  Registra tu entrada y salida correspondiente al día de hoy.
                </p>
              </div>

              <div
                className={`attendance-status-box ${estadoAsistencia.clase}`}
              >
                <span className="status-dot-circle"></span>

                {estadoAsistencia.texto}
              </div>
            </section>

            <section className="attendance-summary-grid">

              <div className="attendance-summary-card">
                <span className="attendance-summary-icon">
                  <Clock3 size={22} />
                </span>

                <div>
                  <p>Horario de hoy</p>

                  <strong>
                    {horario?.hora_entrada && horario?.hora_salida
                      ? `${horario.hora_entrada.slice(0, 5)} - ${horario.hora_salida.slice(0, 5)}`
                      : "--:--"}
                  </strong>

                  <span>Entrada y salida esperadas</span>
                </div>
              </div>

              <div className="attendance-summary-card">
                <span className="attendance-summary-icon">
                  <ChartNoAxesColumnIncreasing
                    size={22}
                  />
                </span>

                <div>
                  <p>Horas del día</p>

                  <strong>0.00 h</strong>

                  <span>Máximo 3 horas</span>
                </div>
              </div>

              <div className="attendance-summary-card">
                <span className="attendance-summary-icon">
                  <CalendarDays size={22} />
                </span>

                <div>
                  <p>Fecha</p>

                  <strong>
                    {new Date().toLocaleDateString("es-MX")}
                  </strong>

                  <span>Jornada actual</span>
                </div>
              </div>

            </section>

            <section className="attendance-control-card">

              <div className="attendance-control-header">
                <div>
                  <p className="section-label">REGISTRO</p>

                  <h3>Entrada y salida</h3>
                </div>

                <span
                  className={`attendance-badge ${estadoAsistencia.clase}`}
                >
                  ● {estadoAsistencia.texto}
                </span>
              </div>

              <p className="panel-description">
                Utiliza los botones para registrar tu asistencia.
              </p>

              <div className="attendance-buttons">

                <button
                  className="attendance-button entry"
                  onClick={registrarEntrada}
                  disabled={procesandoAsistencia}
                >
                  <span>→</span>

                  <div>
                    <strong>Registrar entrada</strong>

                    <small>
                      Marca el inicio de tu jornada
                    </small>
                  </div>
                </button>

                <button
                  className="attendance-button exit"
                  onClick={registrarSalida}
                  disabled={procesandoAsistencia}
                >
                  <span>←</span>

                  <div>
                    <strong>Registrar salida</strong>

                    <small>
                      Marca el término de tu jornada
                    </small>
                  </div>
                </button>

              </div>

            </section>

          </div>
        )}

        {seccion === "horas" && (
          <>
            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="section-label">
                    CONTROL DE HORAS
                  </p>
                  <h3>Mis horas</h3>
                </div>
              </div>

              <p className="panel-description">
                Consulta tu avance y el historial de horas
                contabilizadas durante tus pr&aacute;cticas.
              </p>

              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-icon"><Clock3 size={22} /></span>
                  <div>
                    <p>Horas acumuladas</p>
                    <strong>
                      {avance?.horas_acumuladas?.toFixed(2) ||
                        "0.00"}
                    </strong>
                    <small>horas</small>
                  </div>
                </div>

                <div className="stat-card">
                  <span className="stat-icon"><Target size={22} /></span>
                  <div>
                    <p>Horas requeridas</p>
                    <strong>
                      {avance?.horas_requeridas?.toFixed(2) ||
                        "0.00"}
                    </strong>
                    <small>horas</small>
                  </div>
                </div>

                <div className="stat-card">
                  <span className="stat-icon"><Hourglass size={22} /></span>
                  <div>
                    <p>Horas restantes</p>
                    <strong>
                      {avance?.horas_restantes?.toFixed(2) ||
                        "0.00"}
                    </strong>
                    <small>horas</small>
                  </div>
                </div>

                <div className="stat-card">
                  <span className="stat-icon"><TrendingUp size={22} /></span>
                  <div>
                    <p>Avance</p>
                    <strong>{porcentaje}%</strong>
                    <small>completado</small>
                  </div>
                </div>
              </div>

              <div
                className="progress-card"
                style={{ marginTop: "20px" }}
              >
                <div className="progress-header">
                  <div>
                    <p className="section-label">
                      PROGRESO GENERAL
                    </p>
                    <h3>{porcentaje}% completado</h3>
                  </div>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${Math.min(
                        Number(porcentaje),
                        100
                      )}%`,
                    }}
                  />
                </div>

                <div className="progress-footer">
                  <span>
                    {avance?.horas_acumuladas?.toFixed(2) ||
                      "0.00"}{" "}
                    horas acumuladas
                  </span>

                  <span>
                    {avance?.horas_requeridas?.toFixed(2) ||
                      "0.00"}{" "}
                    horas requeridas
                  </span>
                </div>
              </div>

              <div
                className="stats-grid"
                style={{ marginTop: "20px" }}
              >
                <div className="stat-card">
                  <span className="stat-icon"><CalendarDays size={22} /></span>
                  <div>
                    <p>Esta semana</p>
                    <strong>
                      {horasEstaSemana.toFixed(2)}
                    </strong>
                    <small>horas</small>
                  </div>
                </div>

                <div className="stat-card">
                  <span className="stat-icon"><ChartNoAxesColumnIncreasing size={22} /></span>
                  <div>
                    <p>Promedio por registro</p>
                    <strong>
                      {promedioHoras.toFixed(2)}
                    </strong>
                    <small>horas</small>
                  </div>
                </div>

                <div className="stat-card">
                  <span className="stat-icon"><ListChecks size={22} /></span>
                  <div>
                    <p>Total de registros</p>
                    <strong>
                      {registrosHoras.length}
                    </strong>
                    <small>registros</small>
                  </div>
                </div>
              </div>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="section-label">
                    DETALLE DE HORAS
                  </p>
                  <h3>Historial de registros</h3>
                </div>

                <select
                  value={filtroPeriodoHoras}
                  onChange={(e) =>
                    setFiltroPeriodoHoras(e.target.value)
                  }
                  className="asistencia-filter"
                >
                  <option value="todos">
                    Todos los registros
                  </option>

                  <option value="semana">
                    Esta semana
                  </option>

                  <option value="mes">
                    Este mes
                  </option>
                </select>
              </div>

              <p className="panel-description">
                Mostrando{" "}
                <strong>
                  {registrosHorasFiltrados.length}
                </strong>{" "}
                de <strong>{registrosHoras.length}</strong>{" "}
                registros.
              </p>

              {registrosHorasFiltrados.length === 0 ? (
                <p>
                  No hay registros de horas para el periodo
                  seleccionado.
                </p>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th className="admin-table-heading">
                          Fecha
                        </th>

                        <th className="admin-table-heading">
                          Horas
                        </th>

                        <th className="admin-table-heading">
                          Descripci&oacute;n
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {registrosHorasFiltrados.map(
                        (registro) => (
                          <tr key={registro.id_registro}>
                            <td className="admin-table-cell">
                              {formatearFechaBitacora(
                                registro.fecha
                              )}
                            </td>

                            <td className="admin-table-cell">
                              <strong>
                                {Number(
                                  registro.horas || 0
                                ).toFixed(2)}
                              </strong>
                            </td>

                            <td className="admin-table-cell">
                              {registro.descripcion ||
                                "Sin descripción"}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {seccion === "actividad-diaria" && (
          <ActividadDiariaPracticante
            perfil={perfil}
            usuario={usuario}
            horario={horario}
            token={token}
          />
        )}

        {seccion === "bitacoras" && (
          <>
            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="section-label">
                    ACTIVIDADES SEMANALES
                  </p>
                  <h3>Bitácoras</h3>
                </div>
              </div>

              <p className="panel-description">
                Consulta las actividades publicadas por el administrador
                y sube tu archivo PDF correspondiente a cada semana.
              </p>

              {cargandoBitacoras ? (
                <p>Cargando actividades de bitácora...</p>
              ) : actividadesBitacora.length === 0 ? (
                <p>
                  No hay actividades de bitácora activas por el momento.
                </p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: "16px",
                  }}
                >
                  {actividadesBitacora.map(
                    (actividad) => (
                      <div
                        key={actividad.id_actividad}
                        style={{
                          border: "1px solid #e1e6ef",
                          borderRadius: "10px",
                          padding: "18px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            gap: "16px",
                            flexWrap: "wrap",
                            alignItems: "flex-start",
                          }}
                        >
                          <div>
                            <p
                              className="section-label"
                              style={{
                                marginBottom: "4px",
                              }}
                            >
                              SEMANA{" "}
                              {
                                actividad.numero_semana
                              }
                            </p>

                            <h3
                              style={{
                                marginTop: 0,
                              }}
                            >
                              {actividad.titulo}
                            </h3>
                          </div>

                          <span
                            className={[
                              "bitacora-status",
                              obtenerClaseEstadoBitacoraPracticante(
                                actividad
                              ),
                            ].join(" ")}
                          >
                            {obtenerTextoEstadoBitacora(
                              actividad
                            )}
                          </span>
                        </div>

                        <p>
                          {actividad.descripcion}
                        </p>

                        <div
                          className="profile-list"
                          style={{
                            marginTop: "14px",
                          }}
                        >
                          <div>
                            <span>
                              Fecha de inicio
                            </span>
                            <strong>
                              {formatearFechaBitacora(
                                actividad.fecha_inicio
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Fecha de fin
                            </span>
                            <strong>
                              {formatearFechaBitacora(
                                actividad.fecha_fin
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Fecha límite
                            </span>
                            <strong>
                              {formatearFechaHoraBitacora(
                                actividad.fecha_limite
                              )}
                            </strong>
                          </div>
                        </div>

                        {actividad.estado_entrega ===
                          "Rechazada" && (
                          <div
                            className="message"
                            style={{
                              marginTop: "14px",
                              borderLeft:
                                "4px solid #a64040",
                            }}
                          >
                            <strong>
                              Bitácora rechazada
                            </strong>

                            <p style={{ marginBottom: 0 }}>
                              Comentario del administrador:{" "}
                              <strong>
                                {actividad.observaciones ||
                                  "Sin comentario"}
                              </strong>
                            </p>
                          </div>
                        )}

                        {!actividad.entregada && (
                          <div
                            style={{
                              marginTop: "16px",
                              display: "flex",
                              gap: "10px",
                              flexWrap: "wrap",
                              alignItems: "center",
                            }}
                          >
                            <input
                              type="file"
                              accept="application/pdf,.pdf"
                              onChange={(e) =>
                                seleccionarArchivoBitacora(
                                  actividad.id_actividad,
                                  e.target.files?.[0] ||
                                    null
                                )
                              }
                            />

                            {subiendoBitacora ===
                              actividad.id_actividad &&
                              archivoBitacora && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setArchivoBitacora(null);
                                    setSubiendoBitacora(null);
                                  }}
                                >
                                  Quitar PDF seleccionado
                                </button>
                              )}

                            <button
                              type="button"
                              onClick={() =>
                                subirPdfBitacora(
                                  actividad.id_actividad
                                )
                              }
                              disabled={
                                subiendoBitacora !==
                                  actividad.id_actividad ||
                                !archivoBitacora
                              }
                            >
                              Subir PDF
                            </button>
                          </div>
                        )}

                        {actividad.entregada &&
                          actividad.id_bitacora && (
                            <div
                              style={{
                                marginTop: "16px",
                                display: "flex",
                                gap: "10px",
                                flexWrap: "wrap",
                                alignItems: "center",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  abrirPdfBitacora(
                                    actividad.id_bitacora
                                  )
                                }
                              >
                                Ver PDF actual
                              </button>

                              {String(
                                actividad.estado_entrega || ""
                              )
                                .trim()
                                .toLowerCase() ===
                                "pendiente" && (
                                <button
                                  type="button"
                                  className="secondary-button"
                                  onClick={() =>
                                    cancelarEntregaBitacora(
                                      actividad.id_bitacora
                                    )
                                  }
                                >
                                  Cancelar entrega
                                </button>
                              )}

                              {actividad.estado_entrega ===
                                "Rechazada" && (
                                <>
                                  <input
                                    type="file"
                                    accept="application/pdf,.pdf"
                                    onChange={(e) =>
                                      seleccionarArchivoBitacora(
                                        actividad.id_actividad,
                                        e.target.files?.[0] ||
                                          null
                                      )
                                    }
                                  />

                                  {subiendoBitacora ===
                                    actividad.id_actividad &&
                                    archivoBitacora && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setArchivoBitacora(null);
                                          setSubiendoBitacora(null);
                                        }}
                                      >
                                        Quitar PDF seleccionado
                                      </button>
                                    )}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      subirPdfBitacora(
                                        actividad.id_actividad
                                      )
                                    }
                                    disabled={
                                      subiendoBitacora !==
                                        actividad.id_actividad ||
                                      !archivoBitacora
                                    }
                                  >
                                    Volver a enviar
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                      </div>
                    )
                  )}
                </div>
              )}
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="section-label">
                    HISTORIAL
                  </p>
                  <h3>Mis entregas</h3>
                </div>
              </div>

              {cargandoBitacoras ? (
                <p>Cargando historial...</p>
              ) : bitacoras.length === 0 ? (
                <p>
                  Todavía no has enviado ninguna bitácora.
                </p>
              ) : (
                <div
                  style={{
                    overflowX: "auto",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: "850px",
                    }}
                  >
                    <thead>
                      <tr>
                        {[
                          "Semana",
                          "Actividad",
                          "Archivo",
                          "Estado",
                          "Observaciones",
                          "Fecha de envío",
                          "Acciones",
                        ].map((titulo) => (
                          <th
                            key={titulo}
                            style={{
                              textAlign: "left",
                              padding: "12px",
                              borderBottom:
                                "1px solid #d8dee9",
                            }}
                          >
                            {titulo}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {bitacoras.map((bitacora) => (
                        <tr
                          key={
                            bitacora.id_bitacora
                          }
                        >
                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                          >
                            {
                              bitacora.numero_semana
                            }
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                          >
                            {bitacora.titulo_actividad ||
                              "Bitácora semanal"}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                          >
                            {
                              bitacora.nombre_archivo
                            }
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                          >
                            <span
                              className={[
                                "bitacora-status",
                                obtenerClaseEstadoBitacoraPracticante(
                                  bitacora
                                ),
                              ].join(" ")}
                            >
                              {obtenerTextoEstadoBitacora(
                                bitacora
                              )}
                            </span>
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                          >
                            {bitacora.observaciones ||
                              "—"}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                          >
                            {formatearFechaHoraBitacora(
                              bitacora.fecha_envio
                            )}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                abrirPdfBitacora(
                                  bitacora.id_bitacora
                                )
                              }
                            >
                              Ver PDF
                            </button>

                            {String(
                              bitacora.estado || ""
                            )
                              .trim()
                              .toLowerCase() ===
                              "pendiente" && (
                              <button
                                type="button"
                                className="secondary-button"
                                style={{
                                  marginLeft: "8px",
                                }}
                                onClick={() =>
                                  cancelarEntregaBitacora(
                                    bitacora.id_bitacora
                                  )
                                }
                              >
                                Cancelar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

      </main>
    </div>
  );
}

export default PracticantePanel;