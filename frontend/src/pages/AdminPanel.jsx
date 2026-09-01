import { useEffect, useMemo, useState } from "react";
import { Menu } from "lucide-react";
import api from "../services/axiosInstance";
import {
  normalizarTexto,
  validarCorreo,
  validarFechaISO,
  validarHorasRequeridas,
  validarNombre,
  validarPassword,
  validarTelefono,
  validarUniversidad,
} from "../utils/validaciones";
import DashboardAdmin from "../components/admin/DashboardAdmin";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminTopbar from "../components/admin/AdminTopbar";
import PracticantesAdmin from "../components/admin/PracticantesAdmin";
import AsistenciaAdmin from "../components/admin/AsistenciaAdmin";
import BitacorasAdmin from "../components/admin/BitacorasAdmin";
import ActividadDiariaAdmin from "../components/admin/ActividadDiariaAdmin";
import CarrerasAdmin from "../components/admin/CarrerasAdmin";
import EstadisticasAdmin from "../components/admin/EstadisticasAdmin";
import HistorialAdmin from "../components/admin/HistorialAdmin";
import SeguridadAdmin from "../components/admin/SeguridadAdmin";


function AdminPanel({ usuario, onLogout }) {
  const [seccion, setSeccion] = useState(() => {
    const estado = window.history.state;

    if (
      estado?.panel === "admin" &&
      estado?.seccion
    ) {
      return estado.seccion;
    }

    return "dashboard";
  });

  const [menuLateralAbierto, setMenuLateralAbierto] =
    useState(false);

  // ==========================================
  // HISTORIAL DE NAVEGACIÓN DEL ADMINISTRADOR
  // ==========================================

  const cambiarSeccionConHistorial = (
    nuevaSeccion
  ) => {
    if (
      !nuevaSeccion ||
      nuevaSeccion === seccion
    ) {
      return;
    }

    window.history.pushState(
      {
        ...(window.history.state || {}),
        panel: "admin",
        seccion: nuevaSeccion,
      },
      ""
    );

    setSeccion(nuevaSeccion);
  };

  useEffect(() => {
    const estadoActual =
      window.history.state;

    if (
      estadoActual?.panel !== "admin" ||
      !estadoActual?.seccion
    ) {
      window.history.replaceState(
        {
          ...(estadoActual || {}),
          panel: "admin",
          seccion,
        },
        ""
      );
    }

    const manejarNavegacion = (event) => {
      const nuevaSeccion =
        event.state?.panel === "admin" &&
        event.state?.seccion
          ? event.state.seccion
          : "dashboard";

      setSeccion(nuevaSeccion);
      setMensaje("");
      setMenuLateralAbierto(false);
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
    // Se registra una sola vez al montar el panel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const [practicantes, setPracticantes] = useState([]);
  const [cargandoPracticantes, setCargandoPracticantes] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCarrera, setFiltroCarrera] = useState("");
  const [carreras, setCarreras] = useState([]);
  const [formPasswordAdmin, setFormPasswordAdmin] = useState({
    password_actual: "",
    password_nueva: "",
    confirmar_password: "",
  });

  const [mostrarPasswordsAdmin, setMostrarPasswordsAdmin] =
    useState(false);

  const [guardandoPasswordAdmin, setGuardandoPasswordAdmin] =
    useState(false);

  // ==========================================
  // ADMINISTRACIÓN DE CARRERAS
  // ==========================================

  const [cargandoCarreras, setCargandoCarreras] = useState(false);
  const [mostrandoFormularioCarrera, setMostrandoFormularioCarrera] = useState(false);
  const [editandoCarrera, setEditandoCarrera] = useState(null);
  const [guardandoCarrera, setGuardandoCarrera] = useState(false);
  const [nombreCarrera, setNombreCarrera] = useState("");

  const [practicanteSeleccionado, setPracticanteSeleccionado] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const [editandoPracticante, setEditandoPracticante] = useState(null);
  const [guardandoPracticante, setGuardandoPracticante] = useState(false);

  const practicanteNuevoInicial = {
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    correo: "",
    password: "",
    confirmar_password: "",
    telefono: "",
    universidad: "",
    id_carrera: "",
    fecha_inicio: "",
    fecha_fin: "",
    horas_requeridas: "",
  };

  const [
    mostrandoFormularioNuevoPracticante,
    setMostrandoFormularioNuevoPracticante,
  ] = useState(false);

  const [
    nuevoPracticante,
    setNuevoPracticante,
  ] = useState(practicanteNuevoInicial);

  const [
    guardandoNuevoPracticante,
    setGuardandoNuevoPracticante,
  ] = useState(false);

  const [
    credencialesCreadas,
    setCredencialesCreadas,
  ] = useState(null);

  // ==========================================
  // REGISTROS DE HORAS DEL PRACTICANTE
  // ==========================================

  const [registrosHoras, setRegistrosHoras] = useState([]);
  const [cargandoHoras, setCargandoHoras] = useState(false);
  const [editandoRegistroHoras, setEditandoRegistroHoras] = useState(null);
  const [guardandoRegistroHoras, setGuardandoRegistroHoras] = useState(false);

  // ==========================================
  // HORARIO SEMANAL DEL PRACTICANTE
  // ==========================================

  const [horariosPracticante, setHorariosPracticante] = useState([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [mostrandoFormularioHorario, setMostrandoFormularioHorario] = useState(false);
  const [editandoHorario, setEditandoHorario] = useState(null);
  const [guardandoHorario, setGuardandoHorario] = useState(false);

  const horarioInicial = {
    dia_semana: "Lunes",
    hora_entrada: "",
    hora_salida: "",
    activo: 1,
  };

  const [formHorario, setFormHorario] = useState(horarioInicial);

  // ==========================================
  // ACTIVIDADES SEMANALES DE BITÁCORA
  // ==========================================

  const [actividadesBitacora, setActividadesBitacora] = useState([]);
  const [cargandoActividades, setCargandoActividades] = useState(false);
  const [mostrandoFormularioActividad, setMostrandoFormularioActividad] = useState(false);
  const [editandoActividad, setEditandoActividad] = useState(null);
  const [guardandoActividad, setGuardandoActividad] = useState(false);

  const actividadInicial = {
    numero_semana: "",
    titulo: "",
    descripcion: "",
    fecha_inicio: "",
    fecha_fin: "",
    fecha_limite: "",
  };

  const [formActividad, setFormActividad] = useState(actividadInicial);

  // ==========================================
  // ENTREGAS DE BITÁCORAS DE PRACTICANTES
  // ==========================================

  const [entregasBitacoras, setEntregasBitacoras] = useState([]);
  const [cargandoEntregas, setCargandoEntregas] = useState(false);
  const [filtroEstadoBitacora, setFiltroEstadoBitacora] = useState("");
  const [busquedaEntrega, setBusquedaEntrega] = useState("");
  const [revisandoBitacora, setRevisandoBitacora] = useState(null);

  // ==========================================
  // ASISTENCIAS
  // ==========================================

  const [asistencias, setAsistencias] = useState([]);
  const [cargandoAsistencias, setCargandoAsistencias] = useState(false);
  const [busquedaAsistencia, setBusquedaAsistencia] = useState("");
  const [filtroEstadoAsistencia, setFiltroEstadoAsistencia] = useState("");
  const [filtroPracticanteAsistencia, setFiltroPracticanteAsistencia] = useState("");
  const [filtroFechaAsistencia, setFiltroFechaAsistencia] = useState("");
  const [editandoAsistencia, setEditandoAsistencia] = useState(null);
  const [guardandoAsistencia, setGuardandoAsistencia] = useState(false);

  const obtenerFechaLocalActual = () => {
    const ahora = new Date();
    const compensacion =
      ahora.getTimezoneOffset() * 60000;

    return new Date(
      ahora.getTime() - compensacion
    )
      .toISOString()
      .slice(0, 10);
  };

  const asistenciaHistoricaInicial = () => ({
    id_practicante: "",
    fecha: obtenerFechaLocalActual(),
    hora_entrada_real: "",
    hora_salida_real: "",
  });

  const [
    mostrandoAsistenciaHistorica,
    setMostrandoAsistenciaHistorica,
  ] = useState(false);

  const [
    formAsistenciaHistorica,
    setFormAsistenciaHistorica,
  ] = useState(asistenciaHistoricaInicial);

  const [
    guardandoAsistenciaHistorica,
    setGuardandoAsistenciaHistorica,
  ] = useState(false);

  // ==========================================
  // HISTORIAL DE ACTIVIDADES
  // ==========================================

  const [historial, setHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [busquedaHistorial, setBusquedaHistorial] = useState("");
  const [filtroAccionHistorial, setFiltroAccionHistorial] = useState("");

  // ==========================================
  // NOTIFICACIONES DEL ADMINISTRADOR
  // ==========================================

  const [notificaciones, setNotificaciones] = useState({});

  const token = localStorage.getItem("token");

  // ==========================================
  // CARGAR RESUMEN DE NOTIFICACIONES
  // ==========================================

  const cargarResumenNotificaciones = async () => {
    try {
      const response = await api.get(
        "/notificaciones/resumen"
      );

      setNotificaciones(
        response.data.secciones || {}
      );
    } catch (error) {
      console.error(
        "Error cargando resumen de notificaciones:",
        error
      );

      setNotificaciones({});
    }
  };

  // ==========================================
  // MARCAR NOTIFICACIONES DE UNA SECCIÓN
  // COMO LEÍDAS
  // ==========================================

  const marcarSeccionComoLeida = async (
    nombreSeccion
  ) => {
    const cantidadActual = Number(
      notificaciones?.[nombreSeccion] || 0
    );

    if (cantidadActual <= 0) {
      return;
    }

    try {
      await api.put(
        `/notificaciones/seccion/${encodeURIComponent(
          nombreSeccion
        )}/leer`,
        {}
      );

      setNotificaciones((actual) => {
        const actualizado = {
          ...actual,
        };

        delete actualizado[nombreSeccion];

        return actualizado;
      });
    } catch (error) {
      console.error(
        `Error marcando notificaciones de ${nombreSeccion} como leídas:`,
        error
      );
    }
  };

  // ==========================================
  // CARGAR ESTADÍSTICAS
  // ==========================================

  const cargarEstadisticas = async () => {
    try {
      setCargando(true);
      setMensaje("");

      const response = await api.get(
        "/admin/estadisticas"
      );

      setEstadisticas(response.data);
    } catch (error) {
      console.error(
        "Error cargando estadísticas:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudieron cargar las estadísticas."
      );
    } finally {
      setCargando(false);
    }
  };

  // ==========================================
  // CARGAR Y ADMINISTRAR CARRERAS
  // ==========================================

  const cargarCarreras = async () => {
    try {
      setCargandoCarreras(true);

      const response = await api.get(
        "/admin/carreras"
      );

      setCarreras(response.data.carreras || []);
    } catch (error) {
      console.error(
        "Error cargando carreras:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudieron cargar las carreras."
      );
    } finally {
      setCargandoCarreras(false);
    }
  };

  const abrirNuevaCarrera = () => {
    setEditandoCarrera(null);
    setNombreCarrera("");
    setMostrandoFormularioCarrera(true);
    setMensaje("");
  };

  const abrirEdicionCarrera = (carrera) => {
    setEditandoCarrera(carrera);
    setNombreCarrera(carrera.nombre || "");
    setMostrandoFormularioCarrera(true);
    setMensaje("");
  };

  const cancelarEdicionCarrera = () => {
    setEditandoCarrera(null);
    setNombreCarrera("");
    setMostrandoFormularioCarrera(false);
  };

  const guardarCarrera = async (e) => {
    e.preventDefault();

    const nombre = nombreCarrera.trim();

    if (!nombre) {
      setMensaje("Escribe el nombre de la carrera.");
      return;
    }

    try {
      setGuardandoCarrera(true);
      setMensaje("");

      let response;

      if (editandoCarrera) {
        response = await api.put(
          `/admin/carreras/${editandoCarrera.id_carrera}`,
          {
            nombre,
            activa:
              editandoCarrera.activa ??
              editandoCarrera.activo ??
              1,
          }
        );
      } else {
        response = await api.post(
          `/admin/carreras`,
          { nombre }
        );
      }

      setMensaje(
        response.data.mensaje ||
          (editandoCarrera
            ? "Carrera actualizada correctamente."
            : "Carrera creada correctamente.")
      );

      cancelarEdicionCarrera();

      await Promise.all([
        cargarCarreras(),
        cargarEstadisticas(),
      ]);
    } catch (error) {
      console.error(
        "Error guardando carrera:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudo guardar la carrera."
      );
    } finally {
      setGuardandoCarrera(false);
    }
  };

  const cambiarEstadoCarrera = async (carrera) => {
    const estadoActual = Number(
      carrera.activa ?? carrera.activo ?? 1
    );

    const nuevoEstado =
      estadoActual === 1 ? 0 : 1;

    const accion =
      nuevoEstado === 1 ? "activar" : "desactivar";

    const confirmar = window.confirm(
      `¿Deseas ${accion} la carrera "${carrera.nombre}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setMensaje("");

      const response = await api.put(
        `/admin/carreras/${carrera.id_carrera}`,
        {
          nombre: carrera.nombre,
          activa: nuevoEstado,
        }
      );

      setMensaje(
        response.data.mensaje ||
          `Carrera ${nuevoEstado === 1 ? "activada" : "desactivada"} correctamente.`
      );

      await Promise.all([
        cargarCarreras(),
        cargarPracticantes(filtroCarrera),
        cargarEstadisticas(),
      ]);
    } catch (error) {
      console.error(
        "Error cambiando estado de carrera:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudo actualizar el estado de la carrera."
      );
    }
  };

  // ==========================================
  // CARGAR PRACTICANTES
  // ==========================================

  const cargarPracticantes = async (idCarrera = "") => {
    try {
      setCargandoPracticantes(true);
      setMensaje("");

      const url = idCarrera
        ? `/admin/practicantes?id_carrera=${idCarrera}`
        : `/admin/practicantes`;

       const response = await api.get(url);


      setPracticantes(
        response.data.practicantes || []
      );
    } catch (error) {
      console.error(
        "Error cargando practicantes:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudieron cargar los practicantes."
      );
    } finally {
      setCargandoPracticantes(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
    cargarCarreras();
    cargarPracticantes();
    cargarResumenNotificaciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ==========================================
  // FILTRAR PRACTICANTES EN PANTALLA
  // ==========================================

  const practicantesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) {
      return practicantes;
    }

    return practicantes.filter((practicante) => {
      const nombreCompleto = [
        practicante.nombre,
        practicante.apellido_paterno,
        practicante.apellido_materno,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        nombreCompleto.includes(texto) ||
        String(practicante.correo || "")
          .toLowerCase()
          .includes(texto) ||
        String(practicante.matricula || "")
          .toLowerCase()
          .includes(texto) ||
        String(practicante.carrera || "")
          .toLowerCase()
          .includes(texto)
      );
    });
  }, [practicantes, busqueda]);

  // ==========================================
  // CAMBIAR FILTRO DE CARRERA
  // ==========================================

  const cambiarFiltroCarrera = async (e) => {
    const valor = e.target.value;

    setFiltroCarrera(valor);
    setPracticanteSeleccionado(null);
    setEditandoPracticante(null);

    await cargarPracticantes(valor);
  };

  // ==========================================
  // VER DETALLE DE PRACTICANTE
  // ==========================================

  const verPracticante = async (idPracticante) => {
    try {
      setCargandoDetalle(true);
      setMensaje("");

      const response = await api.get(
        `/admin/practicantes/${idPracticante}`
      );

      setPracticanteSeleccionado(
        response.data.practicante
      );

      setEditandoPracticante(null);
      setEditandoRegistroHoras(null);

      await Promise.all([
        cargarHorasPracticante(idPracticante),
        cargarHorarioPracticante(idPracticante),
      ]);
    } catch (error) {
      console.error(
        "Error cargando practicante:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudo cargar el practicante."
      );
    } finally {
      setCargandoDetalle(false);
    }
  };

  // ==========================================
  // CREAR NUEVO ADMINISTRADOR
  // ==========================================

  const [administradores, setAdministradores] = useState([]);
const [cargandoAdministradores, setCargandoAdministradores] =
  useState(false);

const [mostrandoNuevoAdmin, setMostrandoNuevoAdmin] =
  useState(false);

const [nuevoAdministrador, setNuevoAdministrador] = useState({
  nombre: "",
  apellido_paterno: "",
  apellido_materno: "",
  correo: "",
  password: "",
  confirmar_password: "",
});

const [guardandoAdministrador, setGuardandoAdministrador] =
  useState(false);
const cargarAdministradores = async () => {
  try {
    setCargandoAdministradores(true);

    const response = await api.get(
      "/admin/administradores"
    );

    setAdministradores(
      response.data.administradores || []
    );
  } catch (error) {
    console.error(
      "Error cargando administradores:",
      error
    );

    setMensaje(
      error.response?.data?.mensaje ||
        "No se pudieron cargar los administradores."
    );
  } finally {
    setCargandoAdministradores(false);
  }
};

const cambiarCampoNuevoAdministrador = (e) => {
  const { name, value } = e.target;

  setNuevoAdministrador((actual) => ({
    ...actual,
    [name]: value,
  }));
};

const guardarNuevoAdministrador = async (e) => {
  e.preventDefault();

  if (
    nuevoAdministrador.password !==
    nuevoAdministrador.confirmar_password
  ) {
    setMensaje("Las contraseñas no coinciden.");
    return;
  }

  try {
    setGuardandoAdministrador(true);
    setMensaje("");

    const response = await api.post(
      "/admin/administradores",
      nuevoAdministrador
    );

    setMensaje(
      response.data.mensaje ||
        "Administrador creado correctamente."
    );

    setNuevoAdministrador({
      nombre: "",
      apellido_paterno: "",
      apellido_materno: "",
      correo: "",
      password: "",
      confirmar_password: "",
    });

    setMostrandoNuevoAdmin(false);

    await cargarAdministradores();
  } catch (error) {
    console.error(
      "Error creando administrador:",
      error
    );

    setMensaje(
      error.response?.data?.mensaje ||
        "No se pudo crear el administrador."
    );
  } finally {
    setGuardandoAdministrador(false);
  }
};


  // ==========================================
  // CREAR NUEVO PRACTICANTE
  // ==========================================

  const abrirNuevoPracticante = () => {
    setPracticanteSeleccionado(null);
    setEditandoPracticante(null);
    setCredencialesCreadas(null);
    setNuevoPracticante(practicanteNuevoInicial);
    setMostrandoFormularioNuevoPracticante(true);
    setMensaje("");
  };

  const cancelarNuevoPracticante = () => {
    setMostrandoFormularioNuevoPracticante(false);
    setNuevoPracticante(practicanteNuevoInicial);
  };

  const cambiarCampoNuevoPracticante = (e) => {
    const { name, value } = e.target;

    let valorSeguro = value;

    if (name === "telefono") {
      valorSeguro = value
        .replace(/\D/g, "")
        .slice(0, 10);
    }

    if (name === "correo") {
      valorSeguro = value
        .replace(/\s/g, "")
        .slice(0, 120);
    }

    setNuevoPracticante((actual) => ({
      ...actual,
      [name]: valorSeguro,
    }));
  };

  const cerrarCredencialesCreadas = () => {
    setCredencialesCreadas(null);
  };

  const guardarNuevoPracticante = async (e) => {
    e.preventDefault();

    const nombreLimpio =
      normalizarTexto(nuevoPracticante.nombre);

    const apellidoPaternoLimpio =
      normalizarTexto(
        nuevoPracticante.apellido_paterno
      );

    const apellidoMaternoLimpio =
      normalizarTexto(
        nuevoPracticante.apellido_materno
      );

    const correoLimpio =
      normalizarTexto(
        nuevoPracticante.correo
      ).toLowerCase();

    const telefonoLimpio =
      normalizarTexto(
        nuevoPracticante.telefono
      );

    const universidadLimpia =
      normalizarTexto(
        nuevoPracticante.universidad
      );

    if (!validarNombre(nombreLimpio)) {
      setMensaje(
        "El nombre debe contener solo letras y tener entre 2 y 15 caracteres."
      );
      return;
    }

    if (!validarNombre(apellidoPaternoLimpio)) {
      setMensaje(
        "El apellido paterno debe contener solo letras y tener entre 2 y 15 caracteres."
      );
      return;
    }

    if (
      apellidoMaternoLimpio &&
      !validarNombre(apellidoMaternoLimpio)
    ) {
      setMensaje(
        "El apellido materno debe contener solo letras y tener entre 2 y 15 caracteres."
      );
      return;
    }

    if (!validarCorreo(correoLimpio)) {
      setMensaje(
        "Escribe un correo valido y sin espacios."
      );
      return;
    }

    if (
      !validarPassword(
        nuevoPracticante.password
      )
    ) {
      setMensaje(
        "La contraseña temporal debe tener entre 8 y 20 caracteres e incluir mayuscula, minuscula y numero."
      );
      return;
    }

    if (
      nuevoPracticante.password !==
      nuevoPracticante.confirmar_password
    ) {
      setMensaje(
        "La contraseña y su confirmacion no coinciden."
      );
      return;
    }

    if (!validarTelefono(telefonoLimpio)) {
      setMensaje(
        "El teléfono debe contener exactamente 10 digitos."
      );
      return;
    }

    if (
      !validarUniversidad(universidadLimpia)
    ) {
      setMensaje(
        "La universidad debe tener entre 2 y 20 caracteres."
      );
      return;
    }

    if (!nuevoPracticante.id_carrera) {
      setMensaje("Selecciona una carrera.");
      return;
    }

    if (
      !validarFechaISO(
        nuevoPracticante.fecha_inicio
      )
    ) {
      setMensaje(
        "Selecciona una fecha de inicio valida."
      );
      return;
    }

    if (
      nuevoPracticante.fecha_fin &&
      !validarFechaISO(
        nuevoPracticante.fecha_fin
      )
    ) {
      setMensaje(
        "Selecciona una fecha de fin valida."
      );
      return;
    }

    if (
      nuevoPracticante.fecha_fin &&
      nuevoPracticante.fecha_fin <
        nuevoPracticante.fecha_inicio
    ) {
      setMensaje(
        "La fecha de fin no puede ser anterior a la fecha de inicio."
      );
      return;
    }

    if (!nuevoPracticante.fecha_fin) {
      setMensaje(
        "Selecciona una fecha de finalización para validar las horas requeridas."
      );
      return;
    }

    const diasLaborales =
      contarDiasLaborales(
        nuevoPracticante.fecha_inicio,
        nuevoPracticante.fecha_fin
      );

    const horasRequeridas = Number(
      nuevoPracticante.horas_requeridas
    );

    const horasPosibles =
      diasLaborales * 3;

    if (horasPosibles < horasRequeridas) {
      const diasNecesarios =
        Math.ceil(horasRequeridas / 3);

      setMensaje(
        `El periodo seleccionado solo contempla ${diasLaborales} días laborales (${horasPosibles} horas a 3 horas diarias). Para cumplir ${horasRequeridas} horas se requieren al menos ${diasNecesarios} días laborales.`
      );

      return;
    }

    if (
      !validarHorasRequeridas(
        nuevoPracticante.horas_requeridas
      )
    ) {
      setMensaje(
        "Las horas requeridas deben estar entre 1 y 2000."
      );
      return;
    }

    try {
      setGuardandoNuevoPracticante(true);
      setMensaje("");

      const payload = {
        nombre: nombreLimpio,
        apellido_paterno:
          apellidoPaternoLimpio,
        apellido_materno:
          apellidoMaternoLimpio || null,
        correo: correoLimpio,
        password: nuevoPracticante.password,
        telefono:
          telefonoLimpio || null,
        universidad:
          universidadLimpia || null,
        id_carrera: Number(
          nuevoPracticante.id_carrera
        ),
        fecha_inicio:
          nuevoPracticante.fecha_inicio,
        fecha_fin:
          nuevoPracticante.fecha_fin || null,
        horas_requeridas: Number(
          nuevoPracticante.horas_requeridas
        ),
      };

      const passwordTemporal =
        nuevoPracticante.password;

      const response = await api.post(
        `/admin/practicantes`,
        payload
      );

      setCredencialesCreadas({
        nombre: `${payload.nombre} ${payload.apellido_paterno}`,
        correo: payload.correo,
        password: passwordTemporal,
      });

      setMensaje(
        response.data.mensaje ||
          "Practicante creado correctamente."
      );

      setMostrandoFormularioNuevoPracticante(false);
      setNuevoPracticante(practicanteNuevoInicial);

      await Promise.all([
        cargarPracticantes(filtroCarrera),
        cargarEstadisticas(),
        cargarHistorial(),
      ]);
    } catch (error) {
      console.error(
        "Error creando practicante:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudo crear el practicante."
      );
    } finally {
      setGuardandoNuevoPracticante(false);
    }
  };

      const contarDiasLaborales = (
        fechaInicio,
        fechaFin
      ) => {
        const inicio = new Date(
          `${fechaInicio}T00:00:00`
        );

        const fin = new Date(
          `${fechaFin}T00:00:00`
        );

        let dias = 0;

        const actual = new Date(inicio);

        while (actual <= fin) {
          const dia = actual.getDay();

          if (dia !== 0 && dia !== 6) {
            dias++;
          }

          actual.setDate(
            actual.getDate() + 1
          );
        }

        return dias;
      };
  // ==========================================
  // INICIAR EDICIÓN
  // ==========================================

  const iniciarEdicion = async (idPracticante) => {
    try {
      setCargandoDetalle(true);
      setMensaje("");

      const response = await api.get(
        `/admin/practicantes/${idPracticante}`
      );

      const practicante = response.data.practicante;

      setEditandoPracticante({
        ...practicante,
        fecha_inicio: practicante.fecha_inicio
          ? String(practicante.fecha_inicio).slice(0, 10)
          : "",
        fecha_fin: practicante.fecha_fin
          ? String(practicante.fecha_fin).slice(0, 10)
          : "",
      });

      setPracticanteSeleccionado(null);
    } catch (error) {
      console.error(
        "Error preparando edición:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudo cargar el practicante para editar."
      );
    } finally {
      setCargandoDetalle(false);
    }
  };

  // ==========================================
  // CAMBIAR CAMPOS DEL FORMULARIO
  // ==========================================

  const cambiarCampoEdicion = (e) => {
    const { name, value } = e.target;

    setEditandoPracticante((actual) => ({
      ...actual,
      [name]: value,
    }));
  };

  // ==========================================
  // GUARDAR CAMBIOS DEL PRACTICANTE
  // ==========================================

  const guardarPracticante = async (e) => {
    e.preventDefault();

    if (!editandoPracticante) {
      return;
    }

    try {
      setGuardandoPracticante(true);
      setMensaje("");

      const payload = {
        nombre: editandoPracticante.nombre,
        apellido_paterno:
          editandoPracticante.apellido_paterno,
        apellido_materno:
          editandoPracticante.apellido_materno || "",
        correo: editandoPracticante.correo,
        matricula:
          editandoPracticante.matricula || "",
        telefono:
          editandoPracticante.telefono || "",
        universidad:
          editandoPracticante.universidad || "",
        id_carrera: Number(
          editandoPracticante.id_carrera
        ),
        fecha_inicio:
          editandoPracticante.fecha_inicio,
        fecha_fin:
          editandoPracticante.fecha_fin || null,
        horas_requeridas: Number(
          editandoPracticante.horas_requeridas
        ),
      };

      const response = await api.put(
        `/admin/practicantes/${editandoPracticante.id_practicante}`,
        payload
      );

      setMensaje(
        response.data.mensaje ||
          "Practicante actualizado correctamente."
      );

      setEditandoPracticante(null);

      await cargarPracticantes(filtroCarrera);
      await cargarEstadisticas();
    } catch (error) {
      console.error(
        "Error guardando practicante:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudo actualizar el practicante."
      );
    } finally {
      setGuardandoPracticante(false);
    }
  };

  // ==========================================
  // HORARIO SEMANAL DEL PRACTICANTE
  // ==========================================

  const cargarHorarioPracticante = async (idPracticante) => {
    try {
      setCargandoHorarios(true);

      const response = await api.get(
        `/admin/practicantes/${idPracticante}/horario`
      );

      setHorariosPracticante(
        response.data.horarios ||
          response.data.horario ||
          response.data.resultados ||
          []
      );
    } catch (error) {
      console.error(
        "Error cargando horario del practicante:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudo cargar el horario del practicante."
      );

      setHorariosPracticante([]);
    } finally {
      setCargandoHorarios(false);
    }
  };

  const abrirNuevoHorario = () => {
    setEditandoHorario(null);
    setFormHorario(horarioInicial);
    setMostrandoFormularioHorario(true);
    setMensaje("");
  };

  const abrirEdicionHorario = (horario) => {
    setEditandoHorario(horario);

    setFormHorario({
      dia_semana: horario.dia_semana || "Lunes",
      hora_entrada: horario.hora_entrada
        ? String(horario.hora_entrada).slice(0, 5)
        : "",
      hora_salida: horario.hora_salida
        ? String(horario.hora_salida).slice(0, 5)
        : "",
      activo: Number(horario.activo) === 1 ? 1 : 0,
    });

    setMostrandoFormularioHorario(true);
    setMensaje("");
  };

  const cancelarHorario = () => {
    setEditandoHorario(null);
    setFormHorario(horarioInicial);
    setMostrandoFormularioHorario(false);
  };

  const cambiarCampoHorario = (e) => {
    const { name, value } = e.target;

    setFormHorario((actual) => ({
      ...actual,
      [name]: name === "activo" ? Number(value) : value,
    }));
  };

  const guardarHorario = async (e) => {
    e.preventDefault();

    if (!practicanteSeleccionado) {
      return;
    }

    if (!formHorario.hora_entrada || !formHorario.hora_salida) {
      setMensaje("Selecciona la hora de entrada y la hora de salida.");
      return;
    }

    if (formHorario.hora_salida <= formHorario.hora_entrada) {
      setMensaje("La hora de salida debe ser posterior a la hora de entrada.");
      return;
    }

    try {
      setGuardandoHorario(true);
      setMensaje("");

      const payload = {
        dia_semana: formHorario.dia_semana,
        hora_entrada: formHorario.hora_entrada,
        hora_salida: formHorario.hora_salida,
        activo: Number(formHorario.activo),
      };

      let response;

      if (editandoHorario) {
        response = await api.put(
          `/admin/horarios/${editandoHorario.id_horario}`,
          payload
        );
      } else {
        response = await api.post(
          `/admin/practicantes/${practicanteSeleccionado.id_practicante}/horario`,
          payload
        );
      }

      setMensaje(
        response.data.mensaje ||
          (editandoHorario
            ? "Horario actualizado correctamente."
            : "Horario creado correctamente.")
      );

      cancelarHorario();

      await cargarHorarioPracticante(
        practicanteSeleccionado.id_practicante
      );
    } catch (error) {
      console.error("Error guardando horario:", error);

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudo guardar el horario."
      );
    } finally {
      setGuardandoHorario(false);
    }
  };

  const cambiarEstadoHorario = async (horario) => {
    const nuevoEstado =
      Number(horario.activo) === 1 ? 0 : 1;

    const accion =
      nuevoEstado === 1 ? "activar" : "desactivar";

    const confirmar = window.confirm(
      `¿Deseas ${accion} el horario del ${horario.dia_semana}?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setMensaje("");

      const response = await api.put(
        `/admin/horarios/${horario.id_horario}`,
        {
          dia_semana: horario.dia_semana,
          hora_entrada: String(horario.hora_entrada).slice(0, 5),
          hora_salida: String(horario.hora_salida).slice(0, 5),
          activo: nuevoEstado,
        }
      );

      setMensaje(
        response.data.mensaje ||
          `Horario ${nuevoEstado === 1 ? "activado" : "desactivado"} correctamente.`
      );

      await cargarHorarioPracticante(
        practicanteSeleccionado.id_practicante
      );
    } catch (error) {
      console.error(
        "Error cambiando estado del horario:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudo actualizar el estado del horario."
      );
    }
  };

  // ==========================================
  // REGISTROS DE HORAS DEL PRACTICANTE
  // ==========================================

  const cargarHorasPracticante = async (idPracticante) => {
    try {
      setCargandoHoras(true);
      setMensaje("");

      const response = await api.get(
        `/admin/practicantes/${idPracticante}/horas`
      );

      setRegistrosHoras(
        response.data.registros || []
      );
    } catch (error) {
      console.error(
        "Error cargando registros de horas:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudieron cargar los registros de horas."
      );

      setRegistrosHoras([]);
    } finally {
      setCargandoHoras(false);
    }
  };

  const abrirEdicionRegistroHoras = (registro) => {
    setEditandoRegistroHoras({
      ...registro,
      fecha: registro.fecha
        ? String(registro.fecha).slice(0, 10)
        : "",
      horas: registro.horas ?? "",
      descripcion: registro.descripcion || "",
    });

    setMensaje("");
  };

  const cambiarCampoRegistroHoras = (e) => {
    const { name, value } = e.target;

    setEditandoRegistroHoras((actual) => ({
      ...actual,
      [name]: value,
    }));
  };

  const guardarRegistroHoras = async (e) => {
    e.preventDefault();

    if (!editandoRegistroHoras) {
      return;
    }

    try {
      setGuardandoRegistroHoras(true);
      setMensaje("");

      const response = await api.put(
        `/admin/horas/${editandoRegistroHoras.id_registro}`,
        {
          fecha: editandoRegistroHoras.fecha,
          horas: Number(editandoRegistroHoras.horas),
          descripcion:
            editandoRegistroHoras.descripcion.trim() || null,
        }
      );

      setMensaje(
        response.data.mensaje ||
          "Registro de horas actualizado correctamente."
      );

      const idPracticante =
        practicanteSeleccionado?.id_practicante;

      setEditandoRegistroHoras(null);

      if (idPracticante) {
        await cargarHorasPracticante(idPracticante);
        await verPracticante(idPracticante);
        await cargarEstadisticas();
      }
    } catch (error) {
      console.error(
        "Error actualizando registro de horas:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudo actualizar el registro de horas."
      );
    } finally {
      setGuardandoRegistroHoras(false);
    }
  };

  const eliminarRegistroHorasAdmin = async (registro) => {
    const confirmar = window.confirm(
      `¿Deseas eliminar el registro de ${registro.horas} horas?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setMensaje("");

      const response = await api.delete(
        `/admin/horas/${registro.id_registro}`
      );

      setMensaje(
        response.data.mensaje ||
          "Registro de horas eliminado correctamente."
      );

      const idPracticante =
        practicanteSeleccionado?.id_practicante;

      if (
        editandoRegistroHoras?.id_registro ===
        registro.id_registro
      ) {
        setEditandoRegistroHoras(null);
      }

      if (idPracticante) {
        await cargarHorasPracticante(idPracticante);
        await verPracticante(idPracticante);
        await cargarEstadisticas();
      }
    } catch (error) {
      console.error(
        "Error eliminando registro de horas:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudo eliminar el registro de horas."
      );
    }
  };

  // ==========================================
  // ACTIVAR / DESACTIVAR PRACTICANTE
  // ==========================================

  const cambiarEstadoPracticante = async (
    practicante
  ) => {
    const nuevoEstado =
      Number(practicante.activo) === 1 ? 0 : 1;

    const accion =
      nuevoEstado === 1
        ? "activar"
        : "desactivar";

    const confirmar = window.confirm(
      `¿Deseas ${accion} a ${practicante.nombre} ${practicante.apellido_paterno}?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setMensaje("");

      const response = await api.put(
        `/admin/practicantes/${practicante.id_practicante}/estado`,
        {
          activo: nuevoEstado,
        }
      );

      setMensaje(
        response.data.mensaje ||
          "Estado actualizado correctamente."
      );

      await cargarPracticantes(filtroCarrera);
      await cargarEstadisticas();

      if (
        practicanteSeleccionado?.id_practicante ===
        practicante.id_practicante
      ) {
        await verPracticante(
          practicante.id_practicante
        );
      }
    } catch (error) {
      console.error(
        "Error cambiando estado:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudo actualizar el estado."
      );
    }
  };

  // ==========================================
  // ELIMINAR PRACTICANTE
  // SOLO SE PERMITE SI ESTÁ DESACTIVADO
  // ==========================================

  const eliminarPracticanteAdmin = async (
    practicante
  ) => {
    if (Number(practicante.activo) === 1) {
      setMensaje(
        "No puedes eliminar un practicante activo. Desactívalo primero."
      );
      return;
    }

    const nombreCompleto = [
      practicante.nombre,
      practicante.apellido_paterno,
      practicante.apellido_materno,
    ]
      .filter(Boolean)
      .join(" ");

    const confirmar = window.confirm(
      `¿Deseas eliminar permanentemente a ${nombreCompleto}?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmar) {
      return;
    }

    try {
      setMensaje("");

      const response = await api.delete(
        `/admin/practicantes/${practicante.id_practicante}`
      );

      setMensaje(
        response.data.mensaje ||
          "Practicante eliminado correctamente."
      );

      if (
        practicanteSeleccionado?.id_practicante ===
        practicante.id_practicante
      ) {
        setPracticanteSeleccionado(null);
        setRegistrosHoras([]);
        setHorariosPracticante([]);
        setEditandoRegistroHoras(null);
        setEditandoHorario(null);
        setMostrandoFormularioHorario(false);
      }

      if (
        editandoPracticante?.id_practicante ===
        practicante.id_practicante
      ) {
        setEditandoPracticante(null);
      }

      await Promise.all([
        cargarPracticantes(filtroCarrera),
        cargarEstadisticas(),
      ]);
    } catch (error) {
      console.error(
        "Error eliminando practicante:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudo eliminar el practicante."
      );
    }
  };

 // ==========================================
// ACTIVIDADES SEMANALES DE BITÁCORA
// ==========================================

// ==========================================
// ACTIVIDADES SEMANALES DE BITÁCORA
// ==========================================

const cargarActividadesBitacora = async () => {
  try {
    setCargandoActividades(true);
    setMensaje("");

    const response = await api.get(
      `/admin/actividades-bitacora`
    );

    setActividadesBitacora(
      response.data.actividades || []
    );
  } catch (error) {
    console.error(
      "Error cargando actividades de bitácora:",
      error
    );

    setMensaje(
      error.response?.data?.mensaje ||
        "No se pudieron cargar las actividades de bitácora."
    );
  } finally {
    setCargandoActividades(false);
  }
};

// Cargar actividades cada vez que se entra a la sección Bitácoras
useEffect(() => {
  if (seccion === "bitacoras") {
    cargarActividadesBitacora();
    cargarEntregasBitacoras();
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [seccion, token]);

const abrirNuevaActividad = () => {
  setEditandoActividad(null);
  setFormActividad(actividadInicial);
  setMostrandoFormularioActividad(true);
  setMensaje("");
};

const abrirEdicionActividad = (actividad) => {
  const fechaLimite = actividad.fecha_limite
    ? String(actividad.fecha_limite)
        .replace("Z", "")
        .slice(0, 16)
    : "";

  setEditandoActividad(actividad);

  setFormActividad({
    numero_semana: actividad.numero_semana ?? "",
    titulo: actividad.titulo || "",
    descripcion: actividad.descripcion || "",
    fecha_inicio: actividad.fecha_inicio
      ? String(actividad.fecha_inicio).slice(0, 10)
      : "",
    fecha_fin: actividad.fecha_fin
      ? String(actividad.fecha_fin).slice(0, 10)
      : "",
    fecha_limite: fechaLimite,
  });

  setMostrandoFormularioActividad(true);
  setMensaje("");
};

const cambiarCampoActividad = (e) => {
  const { name, value } = e.target;

  setFormActividad((actual) => ({
    ...actual,
    [name]: value,
  }));
};

const guardarActividadBitacora = async (e) => {
  e.preventDefault();

  try {
    setGuardandoActividad(true);
    setMensaje("");

    const payload = {
      numero_semana: Number(
        formActividad.numero_semana
      ),
      titulo: formActividad.titulo.trim(),
      descripcion:
        formActividad.descripcion.trim(),
      fecha_inicio:
        formActividad.fecha_inicio,
      fecha_fin:
        formActividad.fecha_fin,
      fecha_limite:
        formActividad.fecha_limite
          ? `${formActividad.fecha_limite.replace(
              "T",
              " "
            )}:00`
          : "",
    };

    let response;

    if (editandoActividad) {
      response = await api.put(
        `/admin/actividades-bitacora/${editandoActividad.id_actividad}`,
        payload
      );
    } else {
      response = await api.post(
        `/admin/actividades-bitacora`,
        payload
      );
    }

    setMensaje(
      response.data.mensaje ||
        (editandoActividad
          ? "Actividad actualizada correctamente."
          : "Actividad creada correctamente.")
    );

    setMostrandoFormularioActividad(false);
    setEditandoActividad(null);
    setFormActividad(actividadInicial);

    await cargarActividadesBitacora();
  } catch (error) {
    console.error(
      "Error guardando actividad de bitácora:",
      error
    );

    setMensaje(
      error.response?.data?.mensaje ||
        "No se pudo guardar la actividad de bitácora."
    );
  } finally {
    setGuardandoActividad(false);
  }
};

const cambiarEstadoActividad = async (
  actividad
) => {
  const nuevoEstado =
    Number(actividad.activa) === 1 ? 0 : 1;

  const accion =
    nuevoEstado === 1
      ? "activar"
      : "desactivar";

  const confirmar = window.confirm(
    `¿Deseas ${accion} la actividad de la semana ${actividad.numero_semana}?`
  );

  if (!confirmar) {
    return;
  }

  try {
    setMensaje("");

    const response = await api.put(
      `/admin/actividades-bitacora/${actividad.id_actividad}/estado`,
      {
        activa: nuevoEstado,
      }
    );

    setMensaje(
      response.data.mensaje ||
        "Estado de la actividad actualizado correctamente."
    );

    await cargarActividadesBitacora();
  } catch (error) {
    console.error(
      "Error cambiando estado de actividad:",
      error
    );

    setMensaje(
      error.response?.data?.mensaje ||
        "No se pudo actualizar el estado de la actividad."
    );
  }
};

const eliminarActividadBitacora = async (
  actividad
) => {
  const confirmar = window.confirm(
    `¿Deseas eliminar la actividad "${actividad.titulo}" de la semana ${actividad.numero_semana}?`
  );

  if (!confirmar) {
    return;
  }

  try {
    setMensaje("");

    const response = await api.delete(
      `/admin/actividades-bitacora/${actividad.id_actividad}`
    );

    setMensaje(
      response.data.mensaje ||
        "Actividad eliminada correctamente."
    );

    if (
      editandoActividad?.id_actividad ===
      actividad.id_actividad
    ) {
      setMostrandoFormularioActividad(false);
      setEditandoActividad(null);
      setFormActividad(actividadInicial);
    }

    await cargarActividadesBitacora();
  } catch (error) {
    console.error(
      "Error eliminando actividad de bitácora:",
      error
    );

    setMensaje(
      error.response?.data?.mensaje ||
        "No se pudo eliminar la actividad. Si ya tiene entregas asociadas, desactívala en lugar de eliminarla."
    );
  }
};

const formatearFecha = (fecha) => {
  if (!fecha) {
    return "—";
  }

  const valor = String(fecha).slice(0, 10);
  const [anio, mes, dia] = valor.split("-");

  return anio && mes && dia
    ? `${dia}/${mes}/${anio}`
    : valor;
};

const formatearFechaHora = (fecha) => {
  if (!fecha) {
    return "—";
  }

  const fechaObj = new Date(fecha);

  if (Number.isNaN(fechaObj.getTime())) {
    return "—";
  }

  return fechaObj.toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};


  // ==========================================
  // ENTREGAS DE BITÁCORAS DE PRACTICANTES
  // ==========================================

  const cargarEntregasBitacoras = async () => {
    try {
      setCargandoEntregas(true);
      setMensaje("");

      // Consultamos nuevamente los practicantes para no depender
      // de que el estado "practicantes" ya haya terminado de cargar.
      const practicantesResponse = await api.get(
        "/admin/practicantes"
      );

      const listaPracticantes =
        practicantesResponse.data.practicantes || [];

      if (listaPracticantes.length === 0) {
        setEntregasBitacoras([]);
        return;
      }

      const respuestas = await Promise.all(
        listaPracticantes.map(async (practicante) => {
          try {
            const response = await api.get(
              `/admin/practicantes/${practicante.id_practicante}/bitacoras`
            );

            const bitacoras =
              response.data.bitacoras ||
              response.data.resultados ||
              [];

            return bitacoras.map((bitacora) => ({
              ...bitacora,
              id_practicante: practicante.id_practicante,
              nombre_practicante: [
                practicante.nombre,
                practicante.apellido_paterno,
                practicante.apellido_materno,
              ]
                .filter(Boolean)
                .join(" "),
              correo_practicante:
                practicante.correo || "",
              matricula_practicante:
                practicante.matricula || "",
              carrera_practicante:
                practicante.carrera || "",
            }));
          } catch (error) {
            console.error(
              `Error cargando bitácoras del practicante ${practicante.id_practicante}:`,
              error
            );

            return [];
          }
        })
      );

      const entregas = respuestas
        .flat()
        .sort((a, b) => {
          const fechaA = new Date(
            a.fecha_envio || a.fecha_creacion || 0
          ).getTime();

          const fechaB = new Date(
            b.fecha_envio || b.fecha_creacion || 0
          ).getTime();

          return fechaB - fechaA;
        });

      setEntregasBitacoras(entregas);
    } catch (error) {
      console.error(
        "Error cargando entregas de bitácoras:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudieron cargar las entregas de bitácoras."
      );
    } finally {
      setCargandoEntregas(false);
    }
  };

  const entregasFiltradas = useMemo(() => {
    const texto =
      busquedaEntrega.trim().toLowerCase();

    return entregasBitacoras.filter((entrega) => {
      const coincideEstado =
        !filtroEstadoBitacora ||
        String(entrega.estado || "")
          .toLowerCase() ===
          filtroEstadoBitacora.toLowerCase();

      if (!coincideEstado) {
        return false;
      }

      if (!texto) {
        return true;
      }

      return (
        String(entrega.nombre_practicante || "")
          .toLowerCase()
          .includes(texto) ||
        String(entrega.correo_practicante || "")
          .toLowerCase()
          .includes(texto) ||
        String(entrega.matricula_practicante || "")
          .toLowerCase()
          .includes(texto) ||
        String(entrega.numero_semana || "")
          .toLowerCase()
          .includes(texto) ||
        String(entrega.nombre_archivo || "")
          .toLowerCase()
          .includes(texto)
      );
    });
  }, [
    entregasBitacoras,
    busquedaEntrega,
    filtroEstadoBitacora,
  ]);

  const abrirArchivoBitacoraAdmin = async (
    idBitacora
  ) => {
    try {
      setMensaje("");

      const response = await api.get(
        `/admin/bitacoras/${idBitacora}/archivo`,
        {
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
        "Error abriendo PDF de bitácora:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudo abrir el archivo PDF."
      );
    }
  };

  const revisarEntregaBitacora = async (
    entrega,
    nuevoEstado
  ) => {
    const esRechazo =
      nuevoEstado === "Rechazada";

    const observaciones = window.prompt(
      esRechazo
        ? "Escribe el motivo del rechazo:"
        : "Observaciones de la revisión (opcional):",
      entrega.observaciones || ""
    );

    if (observaciones === null) {
      return;
    }

    if (
      esRechazo &&
      observaciones.trim() === ""
    ) {
      setMensaje(
        "Debes escribir una observación para rechazar la bitácora."
      );
      return;
    }

    const confirmar = window.confirm(
      `¿Confirmas marcar esta bitácora como ${nuevoEstado}?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setRevisandoBitacora(
        entrega.id_bitacora
      );
      setMensaje("");

      const response = await api.put(
        `/admin/bitacoras/${entrega.id_bitacora}/revision`,
        {
          estado: nuevoEstado,
          observaciones:
            observaciones.trim() || null,
        }
      );

      setMensaje(
        response.data.mensaje ||
          `Bitácora ${nuevoEstado.toLowerCase()} correctamente.`
      );

      await Promise.all([
        cargarEntregasBitacoras(),
        cargarEstadisticas(),
      ]);
    } catch (error) {
      console.error(
        "Error revisando bitácora:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudo actualizar la revisión de la bitácora."
      );
    } finally {
      setRevisandoBitacora(null);
    }
  };

  // ==========================================
  // ASISTENCIAS
  // ==========================================

  const cargarAsistencias = async () => {
    try {
      setCargandoAsistencias(true);
      setMensaje("");

      const response = await api.get(
        "/admin/asistencias"
      );

      setAsistencias(
        response.data.asistencias || []
      );
    } catch (error) {
      console.error(
        "Error cargando asistencias:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudieron cargar las asistencias."
      );

      setAsistencias([]);
    } finally {
      setCargandoAsistencias(false);
    }
  };

  const abrirFormularioAsistenciaHistorica = () => {
    setFormAsistenciaHistorica(
      asistenciaHistoricaInicial()
    );
    setMostrandoAsistenciaHistorica(true);
    setEditandoAsistencia(null);
    setMensaje("");
  };

  const cancelarAsistenciaHistorica = () => {
    setMostrandoAsistenciaHistorica(false);
    setFormAsistenciaHistorica(
      asistenciaHistoricaInicial()
    );
    setMensaje("");
  };

  const cambiarCampoAsistenciaHistorica = (e) => {
    const { name, value } = e.target;

    setFormAsistenciaHistorica((actual) => ({
      ...actual,
      [name]: value,
    }));
  };

  const guardarAsistenciaHistorica = async (e) => {
    e.preventDefault();

    const {
      id_practicante,
      fecha,
      hora_entrada_real,
      hora_salida_real,
    } = formAsistenciaHistorica;

    if (!id_practicante) {
      setMensaje(
        "Selecciona un practicante."
      );
      return;
    }

    if (!fecha) {
      setMensaje(
        "Selecciona la fecha de la asistencia."
      );
      return;
    }

    if (fecha > obtenerFechaLocalActual()) {
      setMensaje(
        "No puedes registrar una asistencia en una fecha futura."
      );
      return;
    }

    if (
      !hora_entrada_real ||
      !hora_salida_real
    ) {
      setMensaje(
        "La hora de entrada y la hora de salida son obligatorias."
      );
      return;
    }

    if (
      hora_salida_real <=
      hora_entrada_real
    ) {
      setMensaje(
        "La hora de salida debe ser posterior a la hora de entrada."
      );
      return;
    }

    try {
      setGuardandoAsistenciaHistorica(true);
      setMensaje("");

      const response = await api.post(
        `/admin/asistencias/historica`,
        {
          id_practicante:
            Number(id_practicante),
          fecha,
          hora_entrada_real,
          hora_salida_real,
        }
      );

      setMensaje(
        response.data.mensaje ||
          "Asistencia historica registrada correctamente."
      );

      setMostrandoAsistenciaHistorica(false);
      setFormAsistenciaHistorica(
        asistenciaHistoricaInicial()
      );

      await Promise.all([
        cargarAsistencias(),
        cargarEstadisticas(),
        cargarHistorial(),
      ]);
    } catch (error) {
      console.error(
        "Error registrando asistencia historica:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudo registrar la asistencia historica."
      );
    } finally {
      setGuardandoAsistenciaHistorica(false);
    }
  };

  const abrirEdicionAsistencia = (asistencia) => {
    setEditandoAsistencia({
      ...asistencia,
      hora_entrada_real: asistencia.hora_entrada_real
        ? String(asistencia.hora_entrada_real).slice(0, 5)
        : "",
      hora_salida_real: asistencia.hora_salida_real
        ? String(asistencia.hora_salida_real).slice(0, 5)
        : "",
      observaciones: asistencia.observaciones || "",
    });

    setMensaje("");
  };

  const cambiarCampoAsistencia = (e) => {
    const { name, value } = e.target;

    setEditandoAsistencia((actual) => ({
      ...actual,
      [name]: value,
    }));
  };

  const guardarAsistencia = async (e) => {
    e.preventDefault();

    if (!editandoAsistencia) {
      return;
    }

    if (
      editandoAsistencia.hora_entrada_real &&
      editandoAsistencia.hora_salida_real &&
      editandoAsistencia.hora_salida_real <=
        editandoAsistencia.hora_entrada_real
    ) {
      setMensaje(
        "La hora de salida debe ser posterior a la hora de entrada."
      );
      return;
    }

    try {
      setGuardandoAsistencia(true);
      setMensaje("");

      const response = await api.put(
        `/admin/asistencias/${editandoAsistencia.id_asistencia}`,
        {
          hora_entrada_real:
            editandoAsistencia.hora_entrada_real || null,
          hora_salida_real:
            editandoAsistencia.hora_salida_real || null,
          observaciones:
            editandoAsistencia.observaciones.trim() || null,
        }
      );

      setMensaje(
        response.data.mensaje ||
          "Asistencia actualizada correctamente."
      );

      setEditandoAsistencia(null);

      await Promise.all([
        cargarAsistencias(),
        cargarEstadisticas(),
        cargarHistorial(),
      ]);

      if (practicanteSeleccionado?.id_practicante) {
        await cargarHorasPracticante(
          practicanteSeleccionado.id_practicante
        );
      }
    } catch (error) {
      console.error(
        "Error actualizando asistencia:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudo actualizar la asistencia."
      );
    } finally {
      setGuardandoAsistencia(false);
    }
  };

  const formatearHora = (hora) => {
    if (!hora) {
      return "—";
    }

    return String(hora).slice(0, 5);
  };

  const calcularTiempoReal = (
    horaEntrada,
    horaSalida
  ) => {
    if (!horaEntrada || !horaSalida) {
      return "—";
    }

    const convertirMinutos = (hora) => {
      const [h, m] = String(hora)
        .split(":")
        .map(Number);

      return h * 60 + m;
    };

    const minutos =
      convertirMinutos(horaSalida) -
      convertirMinutos(horaEntrada);

    if (!Number.isFinite(minutos) || minutos < 0) {
      return "—";
    }

    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;

    return `${horas} h ${String(
      minutosRestantes
    ).padStart(2, "0")} min`;
  };

  const asistenciasFiltradas = useMemo(() => {
    const texto =
      busquedaAsistencia.trim().toLowerCase();

    return asistencias.filter((asistencia) => {
      const coincideEstado =
        !filtroEstadoAsistencia ||
        String(asistencia.estado || "")
          .toLowerCase() ===
          filtroEstadoAsistencia.toLowerCase();

      const coincidePracticante =
        !filtroPracticanteAsistencia ||
        String(asistencia.id_practicante) ===
          filtroPracticanteAsistencia;

      const fechaAsistencia = String(
        asistencia.fecha || ""
      ).slice(0, 10);

      const coincideFecha =
        !filtroFechaAsistencia ||
        fechaAsistencia === filtroFechaAsistencia;

      if (
        !coincideEstado ||
        !coincidePracticante ||
        !coincideFecha
      ) {
        return false;
      }

      if (!texto) {
        return true;
      }

      return (
        String(asistencia.nombre_practicante || "")
          .toLowerCase()
          .includes(texto) ||
        String(asistencia.matricula || "")
          .toLowerCase()
          .includes(texto) ||
        String(asistencia.carrera || "")
          .toLowerCase()
          .includes(texto) ||
        String(asistencia.fecha || "")
          .toLowerCase()
          .includes(texto)
      );
    });
  }, [
    asistencias,
    busquedaAsistencia,
    filtroEstadoAsistencia,
    filtroPracticanteAsistencia,
    filtroFechaAsistencia,
  ]);

  // ==========================================
  // HISTORIAL DE ACTIVIDADES
  // ==========================================

  const cargarHistorial = async () => {
    try {
      setCargandoHistorial(true);
      setMensaje("");

      const response = await api.get(
        "/admin/historial"
      );

      setHistorial(
        response.data.historial ||
          response.data.actividades ||
          response.data.resultados ||
          []
      );
    } catch (error) {
      console.error("Error cargando historial:", error);

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudo cargar el historial de actividades."
      );
    } finally {
      setCargandoHistorial(false);
    }
  };

  const obtenerValorHistorial = (registro, campos) => {
    for (const campo of campos) {
      const valor = registro?.[campo];

      if (
        valor !== undefined &&
        valor !== null &&
        String(valor).trim() !== ""
      ) {
        return valor;
      }
    }

    return "";
  };

  const historialFiltrado = useMemo(() => {
    const texto = busquedaHistorial.trim().toLowerCase();

    return historial.filter((registro) => {
      const accion = String(
        obtenerValorHistorial(registro, [
          "accion",
          "tipo_accion",
          "actividad",
          "tipo_actividad",
        ])
      );

      if (
        filtroAccionHistorial &&
        accion.toLowerCase() !==
          filtroAccionHistorial.toLowerCase()
      ) {
        return false;
      }

      if (!texto) {
        return true;
      }

      return Object.values(registro).some((valor) =>
        String(valor ?? "").toLowerCase().includes(texto)
      );
    });
  }, [historial, busquedaHistorial, filtroAccionHistorial]);

  const accionesHistorial = useMemo(() => {
    return [
      ...new Set(
        historial
          .map((registro) =>
            String(
              obtenerValorHistorial(registro, [
                "accion",
                "tipo_accion",
                "actividad",
                "tipo_actividad",
              ])
            ).trim()
          )
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b, "es"));
  }, [historial]);

  // ==========================================
  // 
  // ==========================================

  const obtenerTitulo = () => {
    switch (seccion) {
      case "dashboard":
        return "Dashboard";
      case "practicantes":
        return "Practicantes";
      case "asistencia":
        return "Asistencia";
      case "actividad-diaria":
        return "Actividad diaria";
      case "bitacoras":
        return "Bitácoras";
      case "carreras":
        return "Carreras";
      case "estadisticas":
        return "Estadísticas";
      case "historial":
        return "Historial";
      default:
        return "Dashboard";
    }
  };

  // ==========================================
  // NAVEGACIÓN DESDE LAS ALERTAS DEL DASHBOARD
  // ==========================================

  const irASeccionDesdeAlerta = async (nombreSeccion) => {
    cambiarSeccionConHistorial(nombreSeccion);
    setMensaje("");

    try {
      if (nombreSeccion === "asistencia") {
        await cargarAsistencias();
        return;
      }

      if (nombreSeccion === "bitacoras") {
        await Promise.all([
          cargarActividadesBitacora(),
          cargarEntregasBitacoras(),
        ]);
        return;
      }

      if (nombreSeccion === "practicantes") {
        await cargarPracticantes(filtroCarrera);
      }
    } catch (error) {
      console.error(
        `Error cargando la sección ${nombreSeccion}:`,
        error
      );
    }
  };

  // ==========================================
  // REPORTE PDF INDIVIDUAL DEL PRACTICANTE
  // ==========================================

  const descargarReportePracticantePDF = async () => {
    if (!practicanteSeleccionado?.id_practicante) {
      setMensaje("Selecciona un practicante.");
      return;
    }

    try {
      setMensaje("Generando reporte PDF...");

      const { jsPDF } = await import("jspdf");
      const autoTableModule =
        await import("jspdf-autotable");

      const autoTable =
        autoTableModule.default ||
        autoTableModule.autoTable;

      const idPracticante =
        practicanteSeleccionado.id_practicante;

      const [
        responseAsistencias,
        responseBitacoras,
        responseActividades,
      ] = await Promise.all([
        api.get(
          `/admin/practicantes/${idPracticante}/asistencias`
        ),
        api.get(
          `/admin/practicantes/${idPracticante}/bitacoras`
        ),
        api.get(
          `/actividades-diarias/admin`
        ),
      ]);

      const asistenciasReporte =
        responseAsistencias.data?.asistencias ||
        responseAsistencias.data?.registros ||
        [];

      const bitacorasReporte =
        responseBitacoras.data?.bitacoras ||
        responseBitacoras.data?.entregas ||
        [];

      const actividadesTodas =
        responseActividades.data?.actividades || [];

      const actividadesReporte =
        actividadesTodas.filter(
          (actividad) =>
            Number(actividad.id_practicante) ===
            Number(idPracticante)
        );

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // ==========================================
      // COLORES DEL REPORTE
      // ==========================================

      const AZUL_PRINCIPAL = [20, 48, 86];
      const AZUL_MEDIO = [29, 78, 137];
      const AZUL_CLARO = [238, 244, 251];
      const AZUL_MUY_CLARO = [247, 250, 254];
      const GRIS_TEXTO = [38, 48, 65];
      const GRIS_BORDE = [216, 225, 236];

      const nombreCompleto = [
        practicanteSeleccionado.nombre,
        practicanteSeleccionado.apellido_paterno,
        practicanteSeleccionado.apellido_materno,
      ]
        .filter(Boolean)
        .join(" ");

      const texto = (
        valor,
        fallback = "—"
      ) => {
        if (
          valor === null ||
          valor === undefined ||
          String(valor).trim() === ""
        ) {
          return fallback;
        }

        return String(valor);
      };

      const obtenerFechaRegistro = (
        objeto,
        campos = []
      ) => {
        for (const campo of campos) {
          if (
            objeto?.[campo] !== null &&
            objeto?.[campo] !== undefined &&
            String(objeto[campo]).trim() !== ""
          ) {
            return objeto[campo];
          }
        }

        return null;
      };

      const fechaPDF = (valor) => {
        if (!valor) {
          return "—";
        }

        const valorTexto = String(valor);

        const coincidenciaISO =
          valorTexto.match(
            /^(\d{4})-(\d{2})-(\d{2})/
          );

        if (coincidenciaISO) {
          return `${coincidenciaISO[3]}/${coincidenciaISO[2]}/${coincidenciaISO[1]}`;
        }

        return valorTexto;
      };

      const fechaHoraPDF = (valor) => {
        if (!valor) {
          return "—";
        }

        const fecha = new Date(valor);

        if (!Number.isNaN(fecha.getTime())) {
          return fecha.toLocaleString(
            "es-MX",
            {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }
          );
        }

        return String(valor);
      };

      const horaPDF = (valor) =>
        valor
          ? String(valor).slice(0, 5)
          : "—";

      const ahora = new Date();

      const fechaGeneracion =
        ahora.toLocaleDateString(
          "es-MX",
          {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }
        );

      const horaGeneracion =
        ahora.toLocaleTimeString(
          "es-MX",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        );

      // ==========================================
      // ENCABEZADO
      // ==========================================

      const dibujarEncabezado = () => {
        doc.setFillColor(
          ...AZUL_PRINCIPAL
        );

        doc.rect(
          0,
          0,
          210,
          29,
          "F"
        );

        doc.setTextColor(
          255,
          255,
          255
        );

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.setFontSize(17);

        doc.text(
          "NMR CONSULTORES",
          14,
          12
        );

        doc.setFontSize(11);

        doc.text(
          "REPORTE COMPLETO DEL PRACTICANTE",
          196,
          11,
          {
            align: "right",
          }
        );

        doc.setFont(
          "helvetica",
          "normal"
        );

        doc.setFontSize(8);

        doc.text(
          "Sistema de Control de Prácticas Profesionales",
          14,
          19
        );

        doc.text(
          `Fecha del reporte: ${fechaGeneracion}`,
          196,
          18,
          {
            align: "right",
          }
        );

        doc.text(
          `Hora: ${horaGeneracion}`,
          196,
          23,
          {
            align: "right",
          }
        );

        doc.setTextColor(
          ...GRIS_TEXTO
        );
      };

      // ==========================================
      // TÍTULO DE CADA SECCIÓN
      // ==========================================

      const tituloSeccion = (
        titulo,
        posicionY
      ) => {
        let y = posicionY;

        if (y > 267) {
          doc.addPage();
          dibujarEncabezado();
          y = 39;
        }

        doc.setFillColor(
          ...AZUL_MEDIO
        );

        doc.roundedRect(
          14,
          y - 5.5,
          75,
          8.5,
          2,
          2,
          "F"
        );

        doc.setTextColor(
          255,
          255,
          255
        );

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.setFontSize(9.5);

        doc.text(
          titulo,
          18,
          y
        );

        doc.setTextColor(
          ...GRIS_TEXTO
        );

        return y + 5;
      };

      const configuracionTabla = {
        theme: "grid",

        styles: {
          font: "helvetica",
          fontSize: 8,
          cellPadding: 2.2,
          overflow: "linebreak",
          valign: "top",
          textColor: GRIS_TEXTO,
          lineColor: GRIS_BORDE,
          lineWidth: 0.2,
        },

        headStyles: {
          fillColor: AZUL_PRINCIPAL,
          textColor: [
            255,
            255,
            255,
          ],
          fontStyle: "bold",
          halign: "center",
          lineColor: [
            255,
            255,
            255,
          ],
          lineWidth: 0.15,
        },

        alternateRowStyles: {
          fillColor: AZUL_MUY_CLARO,
        },

        margin: {
          left: 14,
          right: 14,
          top: 34,
          bottom: 18,
        },
      };

      dibujarEncabezado();

      let y = 40;

      // ==========================================
      // 1. INFORMACIÓN GENERAL
      // ==========================================

      y = tituloSeccion(
        "1. INFORMACIÓN GENERAL",
        y
      );

      autoTable(doc, {
        ...configuracionTabla,

        startY: y,

        body: [
          [
            "Nombre completo",
            nombreCompleto,
          ],
          [
            "Carrera",
            texto(
              practicanteSeleccionado.carrera
            ),
          ],
          [
            "Universidad",
            texto(
              practicanteSeleccionado.universidad
            ),
          ],
          [
            "Correo",
            texto(
              practicanteSeleccionado.correo
            ),
          ],
          [
            "Teléfono",
            texto(
              practicanteSeleccionado.telefono
            ),
          ],
          [
            "Fecha de inicio",
            fechaPDF(
              practicanteSeleccionado.fecha_inicio
            ),
          ],
          [
            "Fecha de fin",
            fechaPDF(
              practicanteSeleccionado.fecha_fin
            ),
          ],
          [
            "Estado",
            Number(
              practicanteSeleccionado.activo
            ) === 1
              ? "Activo"
              : "Inactivo",
          ],
        ],

        columnStyles: {
          0: {
            cellWidth: 48,
            fontStyle: "bold",
            fillColor: AZUL_CLARO,
            textColor: AZUL_PRINCIPAL,
          },
        },
      });

      y =
        (doc.lastAutoTable?.finalY ||
          y) + 11;

      // ==========================================
      // 2. RESUMEN DE HORAS
      // ==========================================

      y = tituloSeccion(
        "2. RESUMEN DE HORAS",
        y
      );

      autoTable(doc, {
        ...configuracionTabla,

        startY: y,

        head: [
          [
            "Horas requeridas",
            "Horas acumuladas",
            "Horas restantes",
            "Avance",
          ],
        ],

        body: [
          [
            texto(
              practicanteSeleccionado.horas_requeridas,
              "0"
            ),
            texto(
              practicanteSeleccionado.horas_acumuladas,
              "0"
            ),
            texto(
              practicanteSeleccionado.horas_restantes,
              "0"
            ),
            `${texto(
              practicanteSeleccionado.porcentaje_avance,
              "0"
            )}%`,
          ],
        ],

        styles: {
          ...configuracionTabla.styles,
          halign: "center",
        },

        headStyles:
          configuracionTabla.headStyles,

        alternateRowStyles:
          configuracionTabla.alternateRowStyles,

        margin:
          configuracionTabla.margin,
      });

      y =
        (doc.lastAutoTable?.finalY ||
          y) + 11;

      // ==========================================
      // 3. REGISTROS DE HORAS
      // ==========================================

      y = tituloSeccion(
        "3. REGISTROS DE HORAS",
        y
      );

      autoTable(doc, {
        ...configuracionTabla,

        startY: y,

        head: [
          [
            "Fecha",
            "Horas",
            "Descripción",
            "Fecha de registro",
          ],
        ],

        body:
          registrosHoras.length > 0
            ? registrosHoras.map(
                (registro) => [
                  fechaPDF(
                    obtenerFechaRegistro(
                      registro,
                      [
                        "fecha",
                        "fecha_registro",
                        "fecha_asistencia",
                      ]
                    )
                  ),
                  texto(
                    registro.horas,
                    "0"
                  ),
                  texto(
                    registro.descripcion
                  ),
                  fechaHoraPDF(
                    obtenerFechaRegistro(
                      registro,
                      [
                        "fecha_creacion",
                        "created_at",
                        "fecha_actualizacion",
                      ]
                    )
                  ),
                ]
              )
            : [
                [
                  "—",
                  "—",
                  "Sin registros",
                  "—",
                ],
              ],

        columnStyles: {
          0: {
            cellWidth: 27,
            halign: "center",
          },

          1: {
            cellWidth: 18,
            halign: "center",
          },

          3: {
            cellWidth: 35,
            halign: "center",
          },
        },
      });

      y =
        (doc.lastAutoTable?.finalY ||
          y) + 11;

      // ==========================================
      // 4. ASISTENCIAS
      // ==========================================

      y = tituloSeccion(
        "4. ASISTENCIAS",
        y
      );

      autoTable(doc, {
        ...configuracionTabla,

        startY: y,

        head: [
          [
            "Fecha",
            "Entrada",
            "Salida",
            "Horas",
            "Estado",
          ],
        ],

        body:
          asistenciasReporte.length > 0
            ? asistenciasReporte.map(
                (asistencia) => [
                  fechaPDF(
                    obtenerFechaRegistro(
                      asistencia,
                      [
                        "fecha",
                        "fecha_asistencia",
                        "fecha_registro",
                        "fecha_creacion",
                      ]
                    )
                  ),

                  horaPDF(
                    asistencia.hora_entrada_real
                  ),

                  horaPDF(
                    asistencia.hora_salida_real
                  ),

                  texto(
                    asistencia.horas_contabilizadas ??
                      asistencia.horas_trabajadas ??
                      asistencia.horas,
                    "—"
                  ),

                  texto(
                    asistencia.estado
                  ),
                ]
              )
            : [
                [
                  "—",
                  "—",
                  "—",
                  "—",
                  "Sin registros",
                ],
              ],

        styles: {
          ...configuracionTabla.styles,
          halign: "center",
        },

        headStyles:
          configuracionTabla.headStyles,

        alternateRowStyles:
          configuracionTabla.alternateRowStyles,

        margin:
          configuracionTabla.margin,
      });

      y =
        (doc.lastAutoTable?.finalY ||
          y) + 11;

      // ==========================================
      // 5. ACTIVIDADES DIARIAS
      // ==========================================

      y = tituloSeccion(
        "5. ACTIVIDADES DIARIAS",
        y
      );

      autoTable(doc, {
        ...configuracionTabla,

        startY: y,

        head: [
          [
            "Fecha",
            "Horario",
            "Actividad realizada",
          ],
        ],

        body:
          actividadesReporte.length > 0
            ? actividadesReporte.map(
                (actividad) => [
                  fechaPDF(
                    obtenerFechaRegistro(
                      actividad,
                      [
                        "fecha",
                        "fecha_actividad",
                        "fecha_creacion",
                      ]
                    )
                  ),

                  texto(
                    actividad.horario
                  ),

                  texto(
                    actividad.actividad
                  ),
                ]
              )
            : [
                [
                  "—",
                  "—",
                  "Sin actividades registradas",
                ],
              ],

        columnStyles: {
          0: {
            cellWidth: 27,
            halign: "center",
          },

          1: {
            cellWidth: 32,
            halign: "center",
          },
        },
      });

      y =
        (doc.lastAutoTable?.finalY ||
          y) + 11;

      // ==========================================
      // 6. BITÁCORAS
      // ==========================================

      y = tituloSeccion(
        "6. BITÁCORAS",
        y
      );

      autoTable(doc, {
        ...configuracionTabla,

        startY: y,

        head: [
          [
            "Semana",
            "Fecha de entrega",
            "Estado",
            "Observaciones",
          ],
        ],

        body:
          bitacorasReporte.length > 0
            ? bitacorasReporte.map(
                (bitacora) => [
                  texto(
                    bitacora.numero_semana ??
                      bitacora.semana
                  ),

                  fechaHoraPDF(
                    obtenerFechaRegistro(
                      bitacora,
                      [
                        "fecha_envio",
                        "fecha_entrega",
                        "fecha_subida",
                        "fecha_creacion",
                        "fecha",
                      ]
                    )
                  ),

                  texto(
                    bitacora.estado
                  ),

                  texto(
                    bitacora.observaciones
                  ),
                ]
              )
            : [
                [
                  "—",
                  "—",
                  "—",
                  "Sin bitácoras registradas",
                ],
              ],

        columnStyles: {
          0: {
            cellWidth: 20,
            halign: "center",
          },

          1: {
            cellWidth: 32,
            halign: "center",
          },

          2: {
            cellWidth: 25,
            halign: "center",
          },
        },
      });

      // ==========================================
      // ENCABEZADOS Y PIES DE TODAS LAS PÁGINAS
      // ==========================================

      const totalPaginas =
        doc.getNumberOfPages();

      for (
        let pagina = 1;
        pagina <= totalPaginas;
        pagina += 1
      ) {
        doc.setPage(pagina);

        if (pagina > 1) {
          dibujarEncabezado();
        }

        doc.setFillColor(
          ...AZUL_PRINCIPAL
        );

        doc.rect(
          0,
          282.5,
          210,
          14.5,
          "F"
        );

        doc.setTextColor(
          255,
          255,
          255
        );

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.setFontSize(8);

        doc.text(
          "NMR CONSULTORES",
          14,
          289
        );

        doc.setFont(
          "helvetica",
          "normal"
        );

        doc.setFontSize(7);

        doc.text(
          `Fecha del reporte: ${fechaGeneracion}`,
          14,
          293
        );

        doc.text(
          `Página ${pagina} de ${totalPaginas}`,
          196,
          291,
          {
            align: "right",
          }
        );

        doc.setTextColor(
          ...GRIS_TEXTO
        );
      }

      const nombreArchivo =
        nombreCompleto
          .normalize("NFD")
          .replace(
            /[\u0300-\u036f]/g,
            ""
          )
          .replace(
            /[^a-zA-Z0-9]+/g,
            "_"
          )
          .replace(
            /^_+|_+$/g,
            ""
          );

      doc.save(
        `reporte_${
          nombreArchivo ||
          "practicante"
        }_${fechaGeneracion.replace(
          /\//g,
          "-"
        )}.pdf`
      );

      setMensaje(
        "Reporte PDF generado correctamente."
      );
    } catch (error) {
      console.error(
        "Error generando reporte PDF del practicante:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudo generar el reporte PDF."
      );
    }
  };


  const adminProps = {
    abrirArchivoBitacoraAdmin,
    abrirEdicionActividad,
    abrirEdicionAsistencia,
    abrirFormularioAsistenciaHistorica,
    abrirEdicionCarrera,
    abrirEdicionHorario,
    abrirEdicionRegistroHoras,
    abrirNuevaActividad,
    abrirNuevaCarrera,
    abrirNuevoPracticante,
    abrirNuevoHorario,
    accionesHistorial,
    actividadInicial,
    actividadesBitacora,
    asistencias,
    asistenciasFiltradas,
    busqueda,
    busquedaAsistencia,
    busquedaEntrega,
    busquedaHistorial,
    calcularTiempoReal,
    cambiarCampoActividad,
    cambiarCampoAsistencia,
    cambiarCampoAsistenciaHistorica,
    cambiarCampoEdicion,
    cambiarCampoNuevoPracticante,
    cambiarCampoHorario,
    cambiarCampoRegistroHoras,
    cambiarEstadoActividad,
    cambiarEstadoCarrera,
    cambiarEstadoHorario,
    cambiarEstadoPracticante,
    cambiarFiltroCarrera,
    cancelarEdicionCarrera,
    cancelarAsistenciaHistorica,
    cancelarNuevoPracticante,
    cancelarHorario,
    cargando,
    cargandoActividades,
    cargandoAsistencias,
    cargandoCarreras,
    cargandoDetalle,
    cargandoEntregas,
    cargandoHistorial,
    cargandoHorarios,
    cargandoHoras,
    cargandoPracticantes,
    cerrarCredencialesCreadas,
    descargarReportePracticantePDF,
    cargarAsistencias,
    cargarEntregasBitacoras,
    cargarHistorial,
    cargarHorasPracticante,
    carreras,
    credencialesCreadas,
    editandoActividad,
    editandoAsistencia,
    editandoCarrera,
    editandoHorario,
    editandoPracticante,
    editandoRegistroHoras,
    eliminarActividadBitacora,
    eliminarPracticanteAdmin,
    eliminarRegistroHorasAdmin,
    entregasFiltradas,
    estadisticas,
    filtroAccionHistorial,
    filtroCarrera,
    filtroEstadoAsistencia,
    filtroPracticanteAsistencia,
    filtroFechaAsistencia,
    filtroEstadoBitacora,
    formActividad,
    formAsistenciaHistorica,
    formHorario,
    formatearFecha,
    formatearFechaHora,
    formatearHora,
    guardandoActividad,
    guardandoAsistencia,
    guardandoAsistenciaHistorica,
    guardandoCarrera,
    guardandoHorario,
    guardandoPracticante,
    guardandoNuevoPracticante,
    guardandoRegistroHoras,
    guardarActividadBitacora,
    guardarAsistencia,
    guardarAsistenciaHistorica,
    guardarCarrera,
    guardarHorario,
    guardarPracticante,
    guardarNuevoPracticante,
    guardarRegistroHoras,
    historial,
    historialFiltrado,
    horariosPracticante,
    iniciarEdicion,
    irASeccionDesdeAlerta,
    mensaje,
    mostrandoAsistenciaHistorica,
    mostrandoFormularioActividad,
    mostrandoFormularioCarrera,
    mostrandoFormularioHorario,
    mostrandoFormularioNuevoPracticante,
    nombreCarrera,
    nuevoPracticante,
    obtenerValorHistorial,
    practicanteSeleccionado,
    practicantes,
    practicantesFiltrados,
    registrosHoras,
    revisandoBitacora,
    revisarEntregaBitacora,
    setBusqueda,
    setBusquedaAsistencia,
    setBusquedaEntrega,
    setBusquedaHistorial,
    setEditandoActividad,
    setEditandoAsistencia,
    setEditandoPracticante,
    setEditandoRegistroHoras,
    setFiltroAccionHistorial,
    setFiltroEstadoAsistencia,
    setFiltroPracticanteAsistencia,
    setFiltroFechaAsistencia,
    setFiltroEstadoBitacora,
    setFormActividad,
    setMostrandoFormularioActividad,
    setNombreCarrera,
    setPracticanteSeleccionado,
    usuario,
    verPracticante,
  };
  const cambiarCampoPasswordAdmin = (e) => {
    const { name, value } = e.target;

    setFormPasswordAdmin((actual) => ({
      ...actual,
      [name]: value,
    }));
  };

  const guardarPasswordAdmin = async (e) => {
    e.preventDefault();

    if (
      formPasswordAdmin.password_nueva !==
      formPasswordAdmin.confirmar_password
    ) {
      setMensaje(
        "La nueva contraseña y su confirmación no coinciden."
      );
      return;
    }

    if (formPasswordAdmin.password_nueva.length < 8) {
      setMensaje(
        "La nueva contraseña debe tener al menos 8 caracteres."
      );
      return;
    }

    try {
      setGuardandoPasswordAdmin(true);
      setMensaje("");

      const response = await api.put(
        `/admin/password`,
        {
          password_actual:
            formPasswordAdmin.password_actual,
          password_nueva:
            formPasswordAdmin.password_nueva,
          confirmar_password:
            formPasswordAdmin.confirmar_password,
        }
      );

      setFormPasswordAdmin({
        password_actual: "",
        password_nueva: "",
        confirmar_password: "",
      });

      setMostrarPasswordsAdmin(false);

      setMensaje(
        response.data.mensaje ||
          "Contraseña actualizada correctamente."
      );
    } catch (error) {
      console.error(
        "Error cambiando contraseña del administrador:",
        error
      );

      setMensaje(
        error.response?.data?.mensaje ||
          "No se pudo cambiar la contraseña."
      );
    } finally {
      setGuardandoPasswordAdmin(false);
    }
  };


  // ==========================================
  // ACTUALIZACIÓN AUTOMÁTICA
  // ==========================================
  // Mantiene al administrador actualizado sin recargar la página.
  // Solo consulta los datos necesarios para la sección visible.
  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const actualizarSeccionVisible = async () => {
      // El resumen de notificaciones se mantiene actualizado
      // independientemente de la sección abierta.
      await cargarResumenNotificaciones();

      switch (seccion) {
        case "dashboard":
          await cargarEstadisticas();
          break;

        case "practicantes":
          await cargarPracticantes(filtroCarrera);
          break;

        case "asistencia":
          await cargarAsistencias();
          break;

        case "bitacoras":
          await cargarEntregasBitacoras();
          break;

        case "actividad-diaria":
          // Esta sección obtiene sus propios datos desde su componente.
          break;

        case "carreras":
          await cargarCarreras();
          break;

        case "estadisticas":
          await cargarEstadisticas();
          break;

        case "historial":
          await cargarHistorial();
          break;

        case "seguridad":
          await cargarAdministradores();
          break;

        default:
          break;
      }
    };

    const intervalo = window.setInterval(() => {
      // Evita peticiones innecesarias cuando la pestaña está en segundo plano.
      if (document.visibilityState === "visible") {
        actualizarSeccionVisible();
      }
    }, 15000);

    return () => {
      window.clearInterval(intervalo);
    };
    // Las funciones de carga ya usan el estado actual del panel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, seccion, filtroCarrera]);


  return (
    <div className="app">
      {/* ==========================================
          SIDEBAR
      ========================================== */}

      <AdminSidebar
        seccion={seccion}
        setSeccion={cambiarSeccionConHistorial}
        onLogout={onLogout}
        cargarAsistencias={cargarAsistencias}
        cargarActividadesBitacora={cargarActividadesBitacora}
        cargarEntregasBitacoras={cargarEntregasBitacoras}
        cargarCarreras={cargarCarreras}
        cargarHistorial={cargarHistorial}
        notificaciones={notificaciones}
        marcarSeccionComoLeida={marcarSeccionComoLeida}
        cargarAdministradores={cargarAdministradores}
        abierto={menuLateralAbierto}
        onCerrar={() =>
          setMenuLateralAbierto(false)
        }
      />

      {/* ==========================================
          CONTENIDO PRINCIPAL
      ========================================== */}

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

        <AdminTopbar
          usuario={usuario}
          titulo={obtenerTitulo()}
          onLogout={onLogout}
          setSeccion={cambiarSeccionConHistorial}
          seccion={seccion}
        />

        {mensaje && (
          <div className="message">
            {mensaje}
          </div>
        )}

        {/* ==========================================
            DASHBOARD
        ========================================== */}

        {seccion === "dashboard" && (
          <DashboardAdmin {...adminProps} />
        )}

        {/* ==========================================
            PRACTICANTES
        ========================================== */}

        {seccion === "practicantes" && (
          <PracticantesAdmin {...adminProps} />
        )}

        {/* ==========================================
            ASISTENCIA
        ========================================== */}

        {seccion === "asistencia" && (
          <AsistenciaAdmin {...adminProps} />
        )}

        {/* ==========================================
            SEGURIDAD
        ========================================== */}

        {seccion === "seguridad" && (
          <SeguridadAdmin
            formPasswordAdmin={formPasswordAdmin}
            mostrarPasswordsAdmin={mostrarPasswordsAdmin}
            guardandoPasswordAdmin={guardandoPasswordAdmin}
            cambiarCampoPasswordAdmin={cambiarCampoPasswordAdmin}
            guardarPasswordAdmin={guardarPasswordAdmin}
            setMostrarPasswordsAdmin={setMostrarPasswordsAdmin}

            administradores={administradores}
            cargandoAdministradores={cargandoAdministradores}
            mostrandoNuevoAdmin={mostrandoNuevoAdmin}
            setMostrandoNuevoAdmin={setMostrandoNuevoAdmin}
            nuevoAdministrador={nuevoAdministrador}
            cambiarCampoNuevoAdministrador={cambiarCampoNuevoAdministrador}
            guardarNuevoAdministrador={guardarNuevoAdministrador}
            guardandoAdministrador={guardandoAdministrador}
          />
        )}

        {/* ==========================================
            BITÁCORAS
        ========================================== */}

        {/* ==========================================
            ACTIVIDAD DIARIA
        ========================================== */}

        {seccion === "actividad-diaria" && (
          <ActividadDiariaAdmin token={token} />
        )}

        {seccion === "bitacoras" && (
          <BitacorasAdmin {...adminProps} />
        )}

        {/* ==========================================
            CARRERAS
        ========================================== */}

        {seccion === "carreras" && (
          <CarrerasAdmin {...adminProps} />
        )}

        {/* ==========================================
            ESTADÍSTICAS
        ========================================== */}

        {seccion === "estadisticas" && (
          <EstadisticasAdmin {...adminProps} />
        )}

        {/* ==========================================
            HISTORIAL
        ========================================== */}

        {seccion === "historial" && (
          <HistorialAdmin {...adminProps} />
        )}
      </main>
    </div>
  );
}

export default AdminPanel;