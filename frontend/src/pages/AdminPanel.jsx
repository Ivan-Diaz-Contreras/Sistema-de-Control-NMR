import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

const API = `${API_URL}/api`;

function AdminPanel({ usuario, onLogout }) {
  const [seccion, setSeccion] = useState("dashboard");

  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const [practicantes, setPracticantes] = useState([]);
  const [cargandoPracticantes, setCargandoPracticantes] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCarrera, setFiltroCarrera] = useState("");
  const [carreras, setCarreras] = useState([]);

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
  const [editandoAsistencia, setEditandoAsistencia] = useState(null);
  const [guardandoAsistencia, setGuardandoAsistencia] = useState(false);

  // ==========================================
  // HISTORIAL DE ACTIVIDADES
  // ==========================================

  const [historial, setHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [busquedaHistorial, setBusquedaHistorial] = useState("");
  const [filtroAccionHistorial, setFiltroAccionHistorial] = useState("");

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ==========================================
  // CARGAR ESTADÍSTICAS
  // ==========================================

  const cargarEstadisticas = async () => {
    try {
      setCargando(true);
      setMensaje("");

      const response = await axios.get(
        `${API}/admin/estadisticas`,
        { headers }
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

      const response = await axios.get(
        `${API}/admin/carreras`,
        { headers }
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
        response = await axios.put(
          `${API}/admin/carreras/${editandoCarrera.id_carrera}`,
          {
            nombre,
            activa:
              editandoCarrera.activa ??
              editandoCarrera.activo ??
              1,
          },
          { headers }
        );
      } else {
        response = await axios.post(
          `${API}/admin/carreras`,
          { nombre },
          { headers }
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

      const response = await axios.put(
        `${API}/admin/carreras/${carrera.id_carrera}`,
        {
          nombre: carrera.nombre,
          activa: nuevoEstado,
        },
        { headers }
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
        ? `${API}/admin/practicantes?id_carrera=${idCarrera}`
        : `${API}/admin/practicantes`;

      const response = await axios.get(
        url,
        { headers }
      );

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

      const response = await axios.get(
        `${API}/admin/practicantes/${idPracticante}`,
        { headers }
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
  // INICIAR EDICIÓN
  // ==========================================

  const iniciarEdicion = async (idPracticante) => {
    try {
      setCargandoDetalle(true);
      setMensaje("");

      const response = await axios.get(
        `${API}/admin/practicantes/${idPracticante}`,
        { headers }
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

      const response = await axios.put(
        `${API}/admin/practicantes/${editandoPracticante.id_practicante}`,
        payload,
        { headers }
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

      const response = await axios.get(
        `${API}/admin/practicantes/${idPracticante}/horario`,
        { headers }
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
        response = await axios.put(
          `${API}/admin/horarios/${editandoHorario.id_horario}`,
          payload,
          { headers }
        );
      } else {
        response = await axios.post(
          `${API}/admin/practicantes/${practicanteSeleccionado.id_practicante}/horario`,
          payload,
          { headers }
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

      const response = await axios.put(
        `${API}/admin/horarios/${horario.id_horario}`,
        {
          dia_semana: horario.dia_semana,
          hora_entrada: String(horario.hora_entrada).slice(0, 5),
          hora_salida: String(horario.hora_salida).slice(0, 5),
          activo: nuevoEstado,
        },
        { headers }
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

      const response = await axios.get(
        `${API}/admin/practicantes/${idPracticante}/horas`,
        { headers }
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

      const response = await axios.put(
        `${API}/admin/horas/${editandoRegistroHoras.id_registro}`,
        {
          fecha: editandoRegistroHoras.fecha,
          horas: Number(editandoRegistroHoras.horas),
          descripcion:
            editandoRegistroHoras.descripcion.trim() || null,
        },
        { headers }
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

      const response = await axios.delete(
        `${API}/admin/horas/${registro.id_registro}`,
        { headers }
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

      const response = await axios.put(
        `${API}/admin/practicantes/${practicante.id_practicante}/estado`,
        {
          activo: nuevoEstado,
        },
        { headers }
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
// ACTIVIDADES SEMANALES DE BITÁCORA
// ==========================================

// ==========================================
// ACTIVIDADES SEMANALES DE BITÁCORA
// ==========================================

const cargarActividadesBitacora = async () => {
  try {
    setCargandoActividades(true);
    setMensaje("");

    const response = await axios.get(
      `${API}/admin/actividades-bitacora`,
      { headers }
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
      response = await axios.put(
        `${API}/admin/actividades-bitacora/${editandoActividad.id_actividad}`,
        payload,
        { headers }
      );
    } else {
      response = await axios.post(
        `${API}/admin/actividades-bitacora`,
        payload,
        { headers }
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

    const response = await axios.put(
      `${API}/admin/actividades-bitacora/${actividad.id_actividad}/estado`,
      {
        activa: nuevoEstado,
      },
      { headers }
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

    const response = await axios.delete(
      `${API}/admin/actividades-bitacora/${actividad.id_actividad}`,
      { headers }
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
      const practicantesResponse = await axios.get(
        `${API}/admin/practicantes`,
        { headers }
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
            const response = await axios.get(
              `${API}/admin/practicantes/${practicante.id_practicante}/bitacoras`,
              { headers }
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

      const response = await axios.get(
        `${API}/admin/bitacoras/${idBitacora}/archivo`,
        {
          headers,
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

      const response = await axios.put(
        `${API}/admin/bitacoras/${entrega.id_bitacora}/revision`,
        {
          estado: nuevoEstado,
          observaciones:
            observaciones.trim() || null,
        },
        { headers }
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

      const response = await axios.get(
        `${API}/admin/asistencias`,
        { headers }
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

      const response = await axios.put(
        `${API}/admin/asistencias/${editandoAsistencia.id_asistencia}`,
        {
          hora_entrada_real:
            editandoAsistencia.hora_entrada_real || null,
          hora_salida_real:
            editandoAsistencia.hora_salida_real || null,
          observaciones:
            editandoAsistencia.observaciones.trim() || null,
        },
        { headers }
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

      if (!coincideEstado) {
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
  ]);

  // ==========================================
  // HISTORIAL DE ACTIVIDADES
  // ==========================================

  const cargarHistorial = async () => {
    try {
      setCargandoHistorial(true);
      setMensaje("");

      const response = await axios.get(
        `${API}/admin/historial`,
        { headers }
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
  // TÍTULO DE LA SECCIÓN
  // ==========================================

  const obtenerTitulo = () => {
    switch (seccion) {
      case "dashboard":
        return "Dashboard";
      case "practicantes":
        return "Practicantes";
      case "asistencia":
        return "Asistencia";
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

  return (
    <div className="app">
      {/* ==========================================
          SIDEBAR
      ========================================== */}

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">N</div>

          <div>
            <h1>NMR</h1>
            <span>Control de Prácticas</span>
          </div>
        </div>

        <nav className="navigation">
          <button
            className={`nav-item ${
              seccion === "dashboard" ? "active" : ""
            }`}
            onClick={() => setSeccion("dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className={`nav-item ${
              seccion === "practicantes" ? "active" : ""
            }`}
            onClick={() => setSeccion("practicantes")}
          >
            <span>👥</span>
            Practicantes
          </button>

          <button
            className={`nav-item ${
              seccion === "asistencia" ? "active" : ""
            }`}
            onClick={() => {
              setSeccion("asistencia");
              cargarAsistencias();
            }}
          >
            <span>🕐</span>
            Asistencia
          </button>

          <button
            className={`nav-item ${
              seccion === "bitacoras" ? "active" : ""
            }`}
            onClick={() => {
              setSeccion("bitacoras");
              cargarActividadesBitacora();
              cargarEntregasBitacoras();
            }}
          >
            <span>📋</span>
            Bitácoras
          </button>

          <button
            className={`nav-item ${
              seccion === "carreras" ? "active" : ""
            }`}
            onClick={() => {
              setSeccion("carreras");
              cargarCarreras();
            }}
          >
            <span>🎓</span>
            Carreras
          </button>

          <button
            className={`nav-item ${
              seccion === "estadisticas" ? "active" : ""
            }`}
            onClick={() => setSeccion("estadisticas")}
          >
            <span>📊</span>
            Estadísticas
          </button>

          <button
            className={`nav-item ${
              seccion === "historial" ? "active" : ""
            }`}
            onClick={() => {
              setSeccion("historial");
              cargarHistorial();
            }}
          >
            <span>🕘</span>
            Historial
          </button>
        </nav>

        <button
          className="logout-button"
          onClick={onLogout}
        >
          <span>↪</span>
          Cerrar sesión
        </button>
      </aside>

      {/* ==========================================
          CONTENIDO PRINCIPAL
      ========================================== */}

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="section-label">
              PANEL DEL ADMINISTRADOR
            </p>
            <h2>{obtenerTitulo()}</h2>
          </div>

          <div className="user-info">
            <div className="avatar">
              {usuario?.nombre?.charAt(0) || "A"}
            </div>

            <div>
              <strong>
                {usuario?.nombre || "Administrador"}
              </strong>
              <span>Administrador</span>
            </div>
          </div>
        </header>

        {mensaje && (
          <div className="message">
            {mensaje}
          </div>
        )}

        {/* ==========================================
            DASHBOARD
        ========================================== */}

        {seccion === "dashboard" && (
          <>
            <section className="welcome-card">
              <div>
                <p className="section-label">
                  BIENVENIDO
                </p>

                <h1>
                  Hola,{" "}
                  {usuario?.nombre || "Administrador"} 👋
                </h1>

                <p>
                  Desde este panel puedes administrar
                  practicantes, horas, bitácoras,
                  asistencias y carreras.
                </p>
              </div>

              <div className="welcome-icon">
                NMR
              </div>
            </section>

            {cargando ? (
              <section className="panel">
                <p>Cargando estadísticas...</p>
              </section>
            ) : (
              <section className="stats-grid">
                <div className="stat-card">
                  <span className="stat-icon">👥</span>
                  <div>
                    <p>Practicantes</p>
                    <strong>
                      {estadisticas?.total_practicantes ?? 0}
                    </strong>
                    <small>registrados</small>
                  </div>
                </div>

                <div className="stat-card">
                  <span className="stat-icon">✅</span>
                  <div>
                    <p>Activos</p>
                    <strong>
                      {estadisticas?.practicantes_activos ?? 0}
                    </strong>
                    <small>practicantes</small>
                  </div>
                </div>

                <div className="stat-card">
                  <span className="stat-icon">⏱</span>
                  <div>
                    <p>Horas registradas</p>
                    <strong>
                      {estadisticas?.total_horas_registradas ?? 0}
                    </strong>
                    <small>horas</small>
                  </div>
                </div>

                <div className="stat-card">
                  <span className="stat-icon">📋</span>
                  <div>
                    <p>Bitácoras pendientes</p>
                    <strong>
                      {estadisticas?.bitacoras_pendientes ?? 0}
                    </strong>
                    <small>por revisar</small>
                  </div>
                </div>

                <div className="stat-card">
                  <span className="stat-icon">✔</span>
                  <div>
                    <p>Bitácoras aprobadas</p>
                    <strong>
                      {estadisticas?.bitacoras_aprobadas ?? 0}
                    </strong>
                    <small>aprobadas</small>
                  </div>
                </div>

                <div className="stat-card">
                  <span className="stat-icon">✖</span>
                  <div>
                    <p>Bitácoras rechazadas</p>
                    <strong>
                      {estadisticas?.bitacoras_rechazadas ?? 0}
                    </strong>
                    <small>rechazadas</small>
                  </div>
                </div>
              </section>
            )}

            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="section-label">
                    RESUMEN
                  </p>
                  <h3>Estado general del sistema</h3>
                </div>
              </div>

              <p className="panel-description">
                Los datos mostrados en este dashboard
                provienen directamente de la base de
                datos del sistema NMR.
              </p>
            </section>
          </>
        )}

        {/* ==========================================
            PRACTICANTES
        ========================================== */}

        {seccion === "practicantes" && (
          <>
            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="section-label">
                    ADMINISTRACIÓN
                  </p>
                  <h3>Practicantes registrados</h3>
                </div>
              </div>

              <p className="panel-description">
                Consulta, filtra y administra los
                practicantes registrados en el sistema.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "20px",
                }}
              >
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) =>
                    setBusqueda(e.target.value)
                  }
                  placeholder="Buscar por nombre, correo, matrícula o carrera"
                  style={{
                    flex: "1 1 320px",
                    padding: "12px",
                    border: "1px solid #d8dee9",
                    borderRadius: "8px",
                  }}
                />

                <select
                  value={filtroCarrera}
                  onChange={cambiarFiltroCarrera}
                  style={{
                    minWidth: "230px",
                    padding: "12px",
                    border: "1px solid #d8dee9",
                    borderRadius: "8px",
                  }}
                >
                  <option value="">
                    Todas las carreras
                  </option>

                  {carreras.map((carrera) => (
                    <option
                      key={carrera.id_carrera}
                      value={carrera.id_carrera}
                    >
                      {carrera.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {cargandoPracticantes ? (
                <p>Cargando practicantes...</p>
              ) : practicantesFiltrados.length === 0 ? (
                <p>
                  No se encontraron practicantes.
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
                      minWidth: "950px",
                    }}
                  >
                    <thead>
                      <tr>
                        {[
                          "Nombre",
                          "Correo",
                          "Matrícula",
                          "Carrera",
                          "Universidad",
                          "Estado",
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
                      {practicantesFiltrados.map(
                        (practicante) => (
                          <tr
                            key={
                              practicante.id_practicante
                            }
                          >
                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              {practicante.nombre}{" "}
                              {
                                practicante.apellido_paterno
                              }{" "}
                              {
                                practicante.apellido_materno ||
                                ""
                              }
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              {practicante.correo}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              {practicante.matricula ||
                                "—"}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              {practicante.carrera}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              {practicante.universidad ||
                                "—"}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              {Number(
                                practicante.activo
                              ) === 1
                                ? "Activo"
                                : "Inactivo"}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  gap: "8px",
                                  flexWrap: "wrap",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    verPracticante(
                                      practicante.id_practicante
                                    )
                                  }
                                >
                                  Ver
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    iniciarEdicion(
                                      practicante.id_practicante
                                    )
                                  }
                                >
                                  Editar
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    cambiarEstadoPracticante(
                                      practicante
                                    )
                                  }
                                >
                                  {Number(
                                    practicante.activo
                                  ) === 1
                                    ? "Desactivar"
                                    : "Activar"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {cargandoDetalle && (
              <section className="panel">
                <p>
                  Cargando información del
                  practicante...
                </p>
              </section>
            )}

            {practicanteSeleccionado &&
              !cargandoDetalle && (
                <section className="panel">
                  <div className="panel-header">
                    <div>
                      <p className="section-label">
                        DETALLE
                      </p>
                      <h3>
                        {
                          practicanteSeleccionado.nombre
                        }{" "}
                        {
                          practicanteSeleccionado.apellido_paterno
                        }
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setPracticanteSeleccionado(
                          null
                        )
                      }
                    >
                      Cerrar
                    </button>
                  </div>

                  <div className="profile-list">
                    <div>
                      <span>Correo</span>
                      <strong>
                        {
                          practicanteSeleccionado.correo
                        }
                      </strong>
                    </div>

                    <div>
                      <span>Matrícula</span>
                      <strong>
                        {practicanteSeleccionado.matricula ||
                          "No registrada"}
                      </strong>
                    </div>

                    <div>
                      <span>Carrera</span>
                      <strong>
                        {
                          practicanteSeleccionado.carrera
                        }
                      </strong>
                    </div>

                    <div>
                      <span>Universidad</span>
                      <strong>
                        {practicanteSeleccionado.universidad ||
                          "No registrada"}
                      </strong>
                    </div>

                    <div>
                      <span>Teléfono</span>
                      <strong>
                        {practicanteSeleccionado.telefono ||
                          "No registrado"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Horas requeridas
                      </span>
                      <strong>
                        {
                          practicanteSeleccionado.horas_requeridas
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Horas acumuladas
                      </span>
                      <strong>
                        {
                          practicanteSeleccionado.horas_acumuladas
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Horas restantes
                      </span>
                      <strong>
                        {
                          practicanteSeleccionado.horas_restantes
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Porcentaje de avance
                      </span>
                      <strong>
                        {
                          practicanteSeleccionado.porcentaje_avance
                        }
                        %
                      </strong>
                    </div>
                  </div>
                </section>
              )}

            {practicanteSeleccionado &&
              !cargandoDetalle && (
                <section className="panel">
                  <div className="panel-header">
                    <div>
                      <p className="section-label">
                        HORARIO
                      </p>
                      <h3>Horario semanal</h3>
                    </div>

                    <button
                      type="button"
                      onClick={abrirNuevoHorario}
                    >
                      + Agregar horario
                    </button>
                  </div>

                  <p className="panel-description">
                    Define los días y horas en los que el practicante
                    puede registrar su entrada y salida. Debe existir
                    un horario activo para el día correspondiente.
                  </p>

                  {mostrandoFormularioHorario && (
                    <form
                      onSubmit={guardarHorario}
                      style={{
                        marginBottom: "24px",
                        padding: "18px",
                        border: "1px solid #e1e6ef",
                        borderRadius: "10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "16px",
                        }}
                      >
                        <h4 style={{ margin: 0 }}>
                          {editandoHorario
                            ? "Editar horario"
                            : "Nuevo horario"}
                        </h4>

                        <button
                          type="button"
                          onClick={cancelarHorario}
                        >
                          Cancelar
                        </button>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(190px, 1fr))",
                          gap: "16px",
                        }}
                      >
                        <label>
                          Día
                          <select
                            name="dia_semana"
                            value={formHorario.dia_semana}
                            onChange={cambiarCampoHorario}
                            required
                          >
                            {[
                              "Lunes",
                              "Martes",
                              "Miércoles",
                              "Jueves",
                              "Viernes",
                              "Sábado",
                              "Domingo",
                            ].map((dia) => (
                              <option key={dia} value={dia}>
                                {dia}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label>
                          Hora de entrada
                          <input
                            type="time"
                            name="hora_entrada"
                            value={formHorario.hora_entrada}
                            onChange={cambiarCampoHorario}
                            required
                          />
                        </label>

                        <label>
                          Hora de salida
                          <input
                            type="time"
                            name="hora_salida"
                            value={formHorario.hora_salida}
                            onChange={cambiarCampoHorario}
                            required
                          />
                        </label>

                        <label>
                          Estado
                          <select
                            name="activo"
                            value={formHorario.activo}
                            onChange={cambiarCampoHorario}
                          >
                            <option value={1}>Activo</option>
                            <option value={0}>Inactivo</option>
                          </select>
                        </label>
                      </div>

                      <div style={{ marginTop: "18px" }}>
                        <button
                          type="submit"
                          disabled={guardandoHorario}
                        >
                          {guardandoHorario
                            ? "Guardando..."
                            : editandoHorario
                              ? "Guardar cambios"
                              : "Crear horario"}
                        </button>
                      </div>
                    </form>
                  )}

                  {cargandoHorarios ? (
                    <p>Cargando horario...</p>
                  ) : horariosPracticante.length === 0 ? (
                    <p>
                      Este practicante todavía no tiene un horario
                      asignado.
                    </p>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          minWidth: "700px",
                        }}
                      >
                        <thead>
                          <tr>
                            {[
                              "Día",
                              "Entrada",
                              "Salida",
                              "Estado",
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
                          {horariosPracticante.map((horario) => (
                            <tr key={horario.id_horario}>
                              <td
                                style={{
                                  padding: "12px",
                                  borderBottom:
                                    "1px solid #edf0f5",
                                }}
                              >
                                {horario.dia_semana}
                              </td>

                              <td
                                style={{
                                  padding: "12px",
                                  borderBottom:
                                    "1px solid #edf0f5",
                                }}
                              >
                                {String(
                                  horario.hora_entrada || ""
                                ).slice(0, 5)}
                              </td>

                              <td
                                style={{
                                  padding: "12px",
                                  borderBottom:
                                    "1px solid #edf0f5",
                                }}
                              >
                                {String(
                                  horario.hora_salida || ""
                                ).slice(0, 5)}
                              </td>

                              <td
                                style={{
                                  padding: "12px",
                                  borderBottom:
                                    "1px solid #edf0f5",
                                }}
                              >
                                {Number(horario.activo) === 1
                                  ? "Activo"
                                  : "Inactivo"}
                              </td>

                              <td
                                style={{
                                  padding: "12px",
                                  borderBottom:
                                    "1px solid #edf0f5",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "8px",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      abrirEdicionHorario(horario)
                                    }
                                  >
                                    Editar
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      cambiarEstadoHorario(horario)
                                    }
                                  >
                                    {Number(horario.activo) === 1
                                      ? "Desactivar"
                                      : "Activar"}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}

            {practicanteSeleccionado &&
              !cargandoDetalle && (
                <section className="panel">
                  <div className="panel-header">
                    <div>
                      <p className="section-label">
                        HORAS
                      </p>
                      <h3>Registros de horas</h3>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        cargarHorasPracticante(
                          practicanteSeleccionado.id_practicante
                        )
                      }
                      disabled={cargandoHoras}
                    >
                      {cargandoHoras
                        ? "Actualizando..."
                        : "Actualizar horas"}
                    </button>
                  </div>

                  <p className="panel-description">
                    Consulta, corrige o elimina los registros de horas
                    de este practicante. Los cambios se reflejarán en
                    sus horas acumuladas y en su porcentaje de avance.
                  </p>

                  {editandoRegistroHoras && (
                    <form
                      onSubmit={guardarRegistroHoras}
                      style={{
                        marginBottom: "24px",
                        padding: "18px",
                        border: "1px solid #e1e6ef",
                        borderRadius: "10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "16px",
                        }}
                      >
                        <h4 style={{ margin: 0 }}>
                          Editar registro de horas
                        </h4>

                        <button
                          type="button"
                          onClick={() =>
                            setEditandoRegistroHoras(null)
                          }
                        >
                          Cancelar
                        </button>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(220px, 1fr))",
                          gap: "16px",
                        }}
                      >
                        <label>
                          Fecha
                          <input
                            type="date"
                            name="fecha"
                            value={
                              editandoRegistroHoras.fecha ||
                              ""
                            }
                            onChange={
                              cambiarCampoRegistroHoras
                            }
                            required
                          />
                        </label>

                        <label>
                          Horas
                          <input
                            type="number"
                            name="horas"
                            min="0.01"
                            step="0.01"
                            value={
                              editandoRegistroHoras.horas ??
                              ""
                            }
                            onChange={
                              cambiarCampoRegistroHoras
                            }
                            required
                          />
                        </label>

                        <label
                          style={{
                            gridColumn: "1 / -1",
                          }}
                        >
                          Descripción
                          <textarea
                            name="descripcion"
                            rows="4"
                            value={
                              editandoRegistroHoras.descripcion ||
                              ""
                            }
                            onChange={
                              cambiarCampoRegistroHoras
                            }
                            style={{
                              width: "100%",
                              boxSizing: "border-box",
                              resize: "vertical",
                            }}
                          />
                        </label>
                      </div>

                      <div style={{ marginTop: "18px" }}>
                        <button
                          type="submit"
                          disabled={guardandoRegistroHoras}
                        >
                          {guardandoRegistroHoras
                            ? "Guardando..."
                            : "Guardar cambios"}
                        </button>
                      </div>
                    </form>
                  )}

                  {cargandoHoras ? (
                    <p>Cargando registros de horas...</p>
                  ) : registrosHoras.length === 0 ? (
                    <p>
                      Este practicante todavía no tiene registros de horas.
                    </p>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
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
                              "ID",
                              "Fecha",
                              "Horas",
                              "Descripción",
                              "Fecha de registro",
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
                          {registrosHoras.map((registro) => (
                            <tr key={registro.id_registro}>
                              <td
                                style={{
                                  padding: "12px",
                                  borderBottom:
                                    "1px solid #edf0f5",
                                }}
                              >
                                {registro.id_registro}
                              </td>

                              <td
                                style={{
                                  padding: "12px",
                                  borderBottom:
                                    "1px solid #edf0f5",
                                }}
                              >
                                {formatearFecha(registro.fecha)}
                              </td>

                              <td
                                style={{
                                  padding: "12px",
                                  borderBottom:
                                    "1px solid #edf0f5",
                                }}
                              >
                                <strong>
                                  {Number(registro.horas).toFixed(2)}
                                </strong>
                              </td>

                              <td
                                style={{
                                  padding: "12px",
                                  borderBottom:
                                    "1px solid #edf0f5",
                                  maxWidth: "320px",
                                  whiteSpace: "normal",
                                }}
                              >
                                {registro.descripcion || "—"}
                              </td>

                              <td
                                style={{
                                  padding: "12px",
                                  borderBottom:
                                    "1px solid #edf0f5",
                                }}
                              >
                                {formatearFechaHora(
                                  registro.fecha_creacion
                                )}
                              </td>

                              <td
                                style={{
                                  padding: "12px",
                                  borderBottom:
                                    "1px solid #edf0f5",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "8px",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      abrirEdicionRegistroHoras(
                                        registro
                                      )
                                    }
                                  >
                                    Editar
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      eliminarRegistroHorasAdmin(
                                        registro
                                      )
                                    }
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}


            {editandoPracticante &&
              !cargandoDetalle && (
                <section className="panel">
                  <div className="panel-header">
                    <div>
                      <p className="section-label">
                        EDICIÓN
                      </p>
                      <h3>
                        Editar practicante
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setEditandoPracticante(null)
                      }
                    >
                      Cancelar
                    </button>
                  </div>

                  <form
                    onSubmit={guardarPracticante}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(230px, 1fr))",
                        gap: "16px",
                      }}
                    >
                      <label>
                        Nombre
                        <input
                          name="nombre"
                          value={
                            editandoPracticante.nombre ||
                            ""
                          }
                          onChange={
                            cambiarCampoEdicion
                          }
                          required
                        />
                      </label>

                      <label>
                        Apellido paterno
                        <input
                          name="apellido_paterno"
                          value={
                            editandoPracticante.apellido_paterno ||
                            ""
                          }
                          onChange={
                            cambiarCampoEdicion
                          }
                          required
                        />
                      </label>

                      <label>
                        Apellido materno
                        <input
                          name="apellido_materno"
                          value={
                            editandoPracticante.apellido_materno ||
                            ""
                          }
                          onChange={
                            cambiarCampoEdicion
                          }
                        />
                      </label>

                      <label>
                        Correo
                        <input
                          type="email"
                          name="correo"
                          value={
                            editandoPracticante.correo ||
                            ""
                          }
                          onChange={
                            cambiarCampoEdicion
                          }
                          required
                        />
                      </label>

                      <label>
                        Matrícula
                        <input
                          name="matricula"
                          value={
                            editandoPracticante.matricula ||
                            ""
                          }
                          onChange={
                            cambiarCampoEdicion
                          }
                        />
                      </label>

                      <label>
                        Teléfono
                        <input
                          name="telefono"
                          value={
                            editandoPracticante.telefono ||
                            ""
                          }
                          onChange={
                            cambiarCampoEdicion
                          }
                        />
                      </label>

                      <label>
                        Universidad
                        <input
                          name="universidad"
                          value={
                            editandoPracticante.universidad ||
                            ""
                          }
                          onChange={
                            cambiarCampoEdicion
                          }
                        />
                      </label>

                      <label>
                        Carrera
                        <select
                          name="id_carrera"
                          value={
                            editandoPracticante.id_carrera ||
                            ""
                          }
                          onChange={
                            cambiarCampoEdicion
                          }
                          required
                        >
                          <option value="">
                            Selecciona una carrera
                          </option>

                          {carreras.map(
                            (carrera) => (
                              <option
                                key={
                                  carrera.id_carrera
                                }
                                value={
                                  carrera.id_carrera
                                }
                              >
                                {carrera.nombre}
                              </option>
                            )
                          )}
                        </select>
                      </label>

                      <label>
                        Fecha de inicio
                        <input
                          type="date"
                          name="fecha_inicio"
                          value={
                            editandoPracticante.fecha_inicio ||
                            ""
                          }
                          onChange={
                            cambiarCampoEdicion
                          }
                          required
                        />
                      </label>

                      <label>
                        Fecha de fin
                        <input
                          type="date"
                          name="fecha_fin"
                          value={
                            editandoPracticante.fecha_fin ||
                            ""
                          }
                          onChange={
                            cambiarCampoEdicion
                          }
                        />
                      </label>

                      <label>
                        Horas requeridas
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          name="horas_requeridas"
                          value={
                            editandoPracticante.horas_requeridas ||
                            ""
                          }
                          onChange={
                            cambiarCampoEdicion
                          }
                          required
                        />
                      </label>
                    </div>

                    <div
                      style={{
                        marginTop: "20px",
                      }}
                    >
                      <button
                        type="submit"
                        disabled={
                          guardandoPracticante
                        }
                      >
                        {guardandoPracticante
                          ? "Guardando..."
                          : "Guardar cambios"}
                      </button>
                    </div>
                  </form>
                </section>
              )}
          </>
        )}

        {/* ==========================================
            ASISTENCIA
        ========================================== */}

        {seccion === "asistencia" && (
          <>
            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="section-label">
                    CONTROL DE ASISTENCIA
                  </p>
                  <h3>Registros de entrada y salida</h3>
                </div>

                <button
                  type="button"
                  onClick={cargarAsistencias}
                  disabled={cargandoAsistencias}
                >
                  {cargandoAsistencias
                    ? "Actualizando..."
                    : "Actualizar"}
                </button>
              </div>

              <p className="panel-description">
                Consulta las entradas y salidas reales de los
                practicantes. Al corregir una asistencia, las horas
                contabilizadas se recalculan automáticamente con un
                máximo de 3 horas por día.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "20px",
                }}
              >
                <input
                  type="text"
                  value={busquedaAsistencia}
                  onChange={(e) =>
                    setBusquedaAsistencia(e.target.value)
                  }
                  placeholder="Buscar por practicante, matrícula, carrera o fecha"
                  style={{
                    flex: "1 1 340px",
                    padding: "12px",
                    border: "1px solid #d8dee9",
                    borderRadius: "8px",
                  }}
                />

                <select
                  value={filtroEstadoAsistencia}
                  onChange={(e) =>
                    setFiltroEstadoAsistencia(e.target.value)
                  }
                  style={{
                    minWidth: "220px",
                    padding: "12px",
                    border: "1px solid #d8dee9",
                    borderRadius: "8px",
                  }}
                >
                  <option value="">
                    Todos los estados
                  </option>
                  <option value="Pendiente">
                    Pendiente
                  </option>
                  <option value="A tiempo">
                    A tiempo
                  </option>
                  <option value="Retardo">
                    Retardo
                  </option>
                  <option value="Incompleta">
                    Incompleta
                  </option>
                </select>
              </div>

              {editandoAsistencia && (
                <form
                  onSubmit={guardarAsistencia}
                  style={{
                    marginBottom: "24px",
                    padding: "18px",
                    border: "1px solid #e1e6ef",
                    borderRadius: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <div>
                      <h4 style={{ margin: 0 }}>
                        Editar asistencia
                      </h4>
                      <small>
                        {editandoAsistencia.nombre_practicante ||
                          "Practicante"}{" "}
                        ·{" "}
                        {formatearFecha(
                          editandoAsistencia.fecha
                        )}
                      </small>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setEditandoAsistencia(null)
                      }
                    >
                      Cancelar
                    </button>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    <label>
                      Entrada real
                      <input
                        type="time"
                        name="hora_entrada_real"
                        value={
                          editandoAsistencia.hora_entrada_real ||
                          ""
                        }
                        onChange={cambiarCampoAsistencia}
                      />
                    </label>

                    <label>
                      Salida real
                      <input
                        type="time"
                        name="hora_salida_real"
                        value={
                          editandoAsistencia.hora_salida_real ||
                          ""
                        }
                        onChange={cambiarCampoAsistencia}
                      />
                    </label>

                    <label
                      style={{
                        gridColumn: "1 / -1",
                      }}
                    >
                      Observaciones
                      <textarea
                        name="observaciones"
                        rows="4"
                        value={
                          editandoAsistencia.observaciones ||
                          ""
                        }
                        onChange={cambiarCampoAsistencia}
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          resize: "vertical",
                        }}
                      />
                    </label>
                  </div>

                  <div
                    style={{
                      marginTop: "18px",
                      display: "flex",
                      gap: "12px",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="submit"
                      disabled={guardandoAsistencia}
                    >
                      {guardandoAsistencia
                        ? "Guardando..."
                        : "Guardar cambios"}
                    </button>

                    <span>
                      Tiempo real calculado:{" "}
                      <strong>
                        {calcularTiempoReal(
                          editandoAsistencia.hora_entrada_real,
                          editandoAsistencia.hora_salida_real
                        )}
                      </strong>
                    </span>
                  </div>
                </form>
              )}

              {cargandoAsistencias ? (
                <p>Cargando asistencias...</p>
              ) : asistenciasFiltradas.length === 0 ? (
                <p>
                  No se encontraron registros de asistencia.
                </p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: "1200px",
                    }}
                  >
                    <thead>
                      <tr>
                        {[
                          "Practicante",
                          "Matrícula",
                          "Fecha",
                          "Entrada esperada",
                          "Entrada real",
                          "Salida esperada",
                          "Salida real",
                          "Tiempo real",
                          "Horas contabilizadas",
                          "Estado",
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
                      {asistenciasFiltradas.map(
                        (asistencia) => (
                          <tr
                            key={asistencia.id_asistencia}
                          >
                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              <strong>
                                {asistencia.nombre_practicante ||
                                  "—"}
                              </strong>
                              {asistencia.carrera && (
                                <div>
                                  <small>
                                    {asistencia.carrera}
                                  </small>
                                </div>
                              )}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              {asistencia.matricula || "—"}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              {formatearFecha(
                                asistencia.fecha
                              )}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              {formatearHora(
                                asistencia.hora_entrada_esperada
                              )}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              {formatearHora(
                                asistencia.hora_entrada_real
                              )}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              {formatearHora(
                                asistencia.hora_salida_esperada
                              )}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              {formatearHora(
                                asistencia.hora_salida_real
                              )}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              {calcularTiempoReal(
                                asistencia.hora_entrada_real,
                                asistencia.hora_salida_real
                              )}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              {asistencia.horas_contabilizadas !==
                              null &&
                              asistencia.horas_contabilizadas !==
                                undefined
                                ? Number(
                                    asistencia.horas_contabilizadas
                                  ).toFixed(2)
                                : "—"}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              {asistencia.estado || "—"}
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
                                  abrirEdicionAsistencia(
                                    asistencia
                                  )
                                }
                              >
                                Editar
                              </button>
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

        {/* ==========================================
            BITÁCORAS
        ========================================== */}

        {seccion === "bitacoras" && (
          <>
            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="section-label">
                    ADMINISTRACIÓN
                  </p>
                  <h3>Actividades semanales de bitácora</h3>
                </div>

                <button
                  type="button"
                  onClick={abrirNuevaActividad}
                >
                  + Nueva actividad
                </button>
              </div>

              <p className="panel-description">
                Publica las actividades que deberán realizar los
                practicantes cada semana. Puedes crear, editar,
                activar, desactivar o eliminar una actividad.
              </p>

              {mostrandoFormularioActividad && (
                <form
                  onSubmit={guardarActividadBitacora}
                  style={{
                    marginBottom: "24px",
                    padding: "18px",
                    border: "1px solid #e1e6ef",
                    borderRadius: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "12px",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <h4 style={{ margin: 0 }}>
                      {editandoActividad
                        ? "Editar actividad"
                        : "Nueva actividad semanal"}
                    </h4>

                    <button
                      type="button"
                      onClick={() => {
                        setMostrandoFormularioActividad(false);
                        setEditandoActividad(null);
                        setFormActividad(actividadInicial);
                      }}
                    >
                      Cancelar
                    </button>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(230px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    <label>
                      Número de semana
                      <input
                        type="number"
                        min="1"
                        step="1"
                        name="numero_semana"
                        value={formActividad.numero_semana}
                        onChange={cambiarCampoActividad}
                        required
                      />
                    </label>

                    <label>
                      Título
                      <input
                        type="text"
                        name="titulo"
                        value={formActividad.titulo}
                        onChange={cambiarCampoActividad}
                        placeholder="Ej. Bitácora semanal 3"
                        required
                      />
                    </label>

                    <label>
                      Fecha de inicio
                      <input
                        type="date"
                        name="fecha_inicio"
                        value={formActividad.fecha_inicio}
                        onChange={cambiarCampoActividad}
                        required
                      />
                    </label>

                    <label>
                      Fecha de fin
                      <input
                        type="date"
                        name="fecha_fin"
                        value={formActividad.fecha_fin}
                        onChange={cambiarCampoActividad}
                        required
                      />
                    </label>

                    <label>
                      Fecha límite
                      <input
                        type="datetime-local"
                        name="fecha_limite"
                        value={formActividad.fecha_limite}
                        onChange={cambiarCampoActividad}
                        required
                      />
                    </label>

                    <label
                      style={{
                        gridColumn: "1 / -1",
                      }}
                    >
                      Descripción
                      <textarea
                        name="descripcion"
                        value={formActividad.descripcion}
                        onChange={cambiarCampoActividad}
                        placeholder="Describe las actividades o instrucciones de la semana."
                        rows="5"
                        required
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          resize: "vertical",
                        }}
                      />
                    </label>
                  </div>

                  <div style={{ marginTop: "18px" }}>
                    <button
                      type="submit"
                      disabled={guardandoActividad}
                    >
                      {guardandoActividad
                        ? "Guardando..."
                        : editandoActividad
                          ? "Actualizar actividad"
                          : "Publicar actividad"}
                    </button>
                  </div>
                </form>
              )}

              {cargandoActividades ? (
                <p>Cargando actividades...</p>
              ) : actividadesBitacora.length === 0 ? (
                <p>
                  Todavía no hay actividades semanales registradas.
                </p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: "1050px",
                    }}
                  >
                    <thead>
                      <tr>
                        {[
                          "Semana",
                          "Título",
                          "Descripción",
                          "Inicio",
                          "Fin",
                          "Fecha límite",
                          "Estado",
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
                      {actividadesBitacora.map((actividad) => (
                        <tr key={actividad.id_actividad}>
                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                          >
                            {actividad.numero_semana}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                          >
                            <strong>{actividad.titulo}</strong>
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                              maxWidth: "320px",
                              whiteSpace: "normal",
                            }}
                          >
                            {actividad.descripcion}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                          >
                            {formatearFecha(
                              actividad.fecha_inicio
                            )}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                          >
                            {formatearFecha(
                              actividad.fecha_fin
                            )}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                          >
                            {formatearFechaHora(
                              actividad.fecha_limite
                            )}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                          >
                            {Number(actividad.activa) === 1
                              ? "Activa"
                              : "Inactiva"}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  abrirEdicionActividad(
                                    actividad
                                  )
                                }
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  cambiarEstadoActividad(
                                    actividad
                                  )
                                }
                              >
                                {Number(actividad.activa) === 1
                                  ? "Desactivar"
                                  : "Activar"}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  eliminarActividadBitacora(
                                    actividad
                                  )
                                }
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="section-label">
                    ENTREGAS
                  </p>
                  <h3>Bitácoras de practicantes</h3>
                </div>

                <button
                  type="button"
                  onClick={cargarEntregasBitacoras}
                  disabled={cargandoEntregas}
                >
                  {cargandoEntregas
                    ? "Actualizando..."
                    : "Actualizar entregas"}
                </button>
              </div>

              <p className="panel-description">
                Consulta las bitácoras enviadas por los practicantes,
                abre el PDF y aprueba o rechaza cada entrega.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "20px",
                }}
              >
                <input
                  type="text"
                  value={busquedaEntrega}
                  onChange={(e) =>
                    setBusquedaEntrega(e.target.value)
                  }
                  placeholder="Buscar por practicante, correo, matrícula, semana o archivo"
                  style={{
                    flex: "1 1 360px",
                    padding: "12px",
                    border: "1px solid #d8dee9",
                    borderRadius: "8px",
                  }}
                />

                <select
                  value={filtroEstadoBitacora}
                  onChange={(e) =>
                    setFiltroEstadoBitacora(
                      e.target.value
                    )
                  }
                  style={{
                    minWidth: "220px",
                    padding: "12px",
                    border: "1px solid #d8dee9",
                    borderRadius: "8px",
                  }}
                >
                  <option value="">
                    Todos los estados
                  </option>
                  <option value="Pendiente">
                    Pendientes
                  </option>
                  <option value="Aprobada">
                    Aprobadas
                  </option>
                  <option value="Rechazada">
                    Rechazadas
                  </option>
                </select>
              </div>

              {cargandoEntregas ? (
                <p>
                  Cargando entregas de bitácoras...
                </p>
              ) : entregasFiltradas.length === 0 ? (
                <p>
                  No se encontraron entregas de bitácoras.
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
                      minWidth: "1200px",
                    }}
                  >
                    <thead>
                      <tr>
                        {[
                          "Practicante",
                          "Matrícula",
                          "Semana",
                          "Archivo",
                          "Estado",
                          "Fecha de envío",
                          "Observaciones",
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
                      {entregasFiltradas.map(
                        (entrega) => (
                          <tr
                            key={
                              entrega.id_bitacora
                            }
                          >
                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              <strong>
                                {
                                  entrega.nombre_practicante
                                }
                              </strong>
                              <div>
                                {
                                  entrega.correo_practicante
                                }
                              </div>
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              {entrega.matricula_practicante ||
                                "—"}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              {
                                entrega.numero_semana
                              }
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              {entrega.nombre_archivo ||
                                "PDF"}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              <strong>
                                {entrega.estado ||
                                  "Pendiente"}
                              </strong>
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              {formatearFechaHora(
                                entrega.fecha_envio
                              )}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                                maxWidth: "260px",
                                whiteSpace: "normal",
                              }}
                            >
                              {entrega.observaciones ||
                                "—"}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  gap: "8px",
                                  flexWrap: "wrap",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    abrirArchivoBitacoraAdmin(
                                      entrega.id_bitacora
                                    )
                                  }
                                >
                                  Ver PDF
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    revisarEntregaBitacora(
                                      entrega,
                                      "Aprobada"
                                    )
                                  }
                                  disabled={
                                    revisandoBitacora ===
                                    entrega.id_bitacora
                                  }
                                >
                                  Aprobar
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    revisarEntregaBitacora(
                                      entrega,
                                      "Rechazada"
                                    )
                                  }
                                  disabled={
                                    revisandoBitacora ===
                                    entrega.id_bitacora
                                  }
                                >
                                  Rechazar
                                </button>
                              </div>
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

        {/* ==========================================
            CARRERAS
        ========================================== */}

        {seccion === "carreras" && (
          <>
            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="section-label">
                    CONFIGURACIÓN
                  </p>
                  <h3>Administración de carreras</h3>
                </div>

                <button
                  type="button"
                  onClick={abrirNuevaCarrera}
                >
                  + Nueva carrera
                </button>
              </div>

              <p className="panel-description">
                Crea, edita, activa o desactiva las carreras
                disponibles para los practicantes.
              </p>

              {mostrandoFormularioCarrera && (
                <form
                  onSubmit={guardarCarrera}
                  style={{
                    marginBottom: "24px",
                    padding: "18px",
                    border: "1px solid #e1e6ef",
                    borderRadius: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <h4 style={{ margin: 0 }}>
                      {editandoCarrera
                        ? "Editar carrera"
                        : "Nueva carrera"}
                    </h4>

                    <button
                      type="button"
                      onClick={cancelarEdicionCarrera}
                    >
                      Cancelar
                    </button>
                  </div>

                  <label>
                    Nombre de la carrera
                    <input
                      type="text"
                      value={nombreCarrera}
                      onChange={(e) =>
                        setNombreCarrera(e.target.value)
                      }
                      placeholder="Ej. Ingeniería en Sistemas Computacionales"
                      required
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        marginTop: "8px",
                      }}
                    />
                  </label>

                  <div style={{ marginTop: "18px" }}>
                    <button
                      type="submit"
                      disabled={guardandoCarrera}
                    >
                      {guardandoCarrera
                        ? "Guardando..."
                        : editandoCarrera
                          ? "Actualizar carrera"
                          : "Crear carrera"}
                    </button>
                  </div>
                </form>
              )}

              {cargandoCarreras ? (
                <p>Cargando carreras...</p>
              ) : carreras.length === 0 ? (
                <p>
                  Todavía no hay carreras registradas.
                </p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: "650px",
                    }}
                  >
                    <thead>
                      <tr>
                        {[
                          "ID",
                          "Carrera",
                          "Estado",
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
                      {carreras.map((carrera) => {
                        const activa = Number(
                          carrera.activa ??
                            carrera.activo ??
                            1
                        );

                        return (
                          <tr key={carrera.id_carrera}>
                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              {carrera.id_carrera}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              <strong>
                                {carrera.nombre}
                              </strong>
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              {activa === 1
                                ? "Activa"
                                : "Inactiva"}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid #edf0f5",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  gap: "8px",
                                  flexWrap: "wrap",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    abrirEdicionCarrera(
                                      carrera
                                    )
                                  }
                                >
                                  Editar
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    cambiarEstadoCarrera(
                                      carrera
                                    )
                                  }
                                >
                                  {activa === 1
                                    ? "Desactivar"
                                    : "Activar"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {/* ==========================================
            ESTADÍSTICAS
        ========================================== */}

        {seccion === "estadisticas" && (
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
        )}

        {/* ==========================================
            HISTORIAL
        ========================================== */}

        {seccion === "historial" && (
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="section-label">
                  ACTIVIDAD
                </p>
                <h3>Historial de actividades</h3>
              </div>

              <button
                type="button"
                onClick={cargarHistorial}
                disabled={cargandoHistorial}
              >
                {cargandoHistorial
                  ? "Actualizando..."
                  : "Actualizar"}
              </button>
            </div>

            <p className="panel-description">
              Consulta los cambios y actividades realizadas
              dentro del sistema.
            </p>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "20px",
              }}
            >
              <input
                type="text"
                value={busquedaHistorial}
                onChange={(e) =>
                  setBusquedaHistorial(e.target.value)
                }
                placeholder="Buscar en el historial"
                style={{
                  flex: "1 1 320px",
                  padding: "12px",
                  border: "1px solid #d8dee9",
                  borderRadius: "8px",
                }}
              />

              <select
                value={filtroAccionHistorial}
                onChange={(e) =>
                  setFiltroAccionHistorial(e.target.value)
                }
                style={{
                  minWidth: "220px",
                  padding: "12px",
                  border: "1px solid #d8dee9",
                  borderRadius: "8px",
                }}
              >
                <option value="">Todas las acciones</option>

                {accionesHistorial.map((accion) => (
                  <option key={accion} value={accion}>
                    {accion}
                  </option>
                ))}
              </select>
            </div>

            {cargandoHistorial ? (
              <p>Cargando historial...</p>
            ) : historialFiltrado.length === 0 ? (
              <p>No se encontraron actividades registradas.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
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
                        "ID",
                        "Usuario",
                        "Acción",
                        "Descripción",
                        "Fecha y hora",
                      ].map((titulo) => (
                        <th
                          key={titulo}
                          style={{
                            textAlign: "left",
                            padding: "12px",
                            borderBottom: "1px solid #d8dee9",
                          }}
                        >
                          {titulo}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {historialFiltrado.map((registro, indice) => {
                      const id =
                        obtenerValorHistorial(registro, [
                          "id_historial",
                          "id_actividad",
                          "id",
                        ]) || indice + 1;

                      const usuarioHistorial =
                        obtenerValorHistorial(registro, [
                          "usuario",
                          "nombre_usuario",
                          "administrador",
                          "nombre",
                          "correo",
                        ]) || "Sistema";

                      const accion =
                        obtenerValorHistorial(registro, [
                          "accion",
                          "tipo_accion",
                          "actividad",
                          "tipo_actividad",
                        ]) || "Actividad";

                      const descripcion =
                        obtenerValorHistorial(registro, [
                          "descripcion",
                          "detalle",
                          "detalles",
                          "mensaje",
                        ]) || "—";

                      const fecha = obtenerValorHistorial(
                        registro,
                        [
                          "fecha",
                          "fecha_hora",
                          "fecha_creacion",
                          "created_at",
                        ]
                      );

                      return (
                        <tr key={`${id}-${indice}`}>
                          <td style={{ padding: "12px", borderBottom: "1px solid #edf0f5" }}>
                            {id}
                          </td>
                          <td style={{ padding: "12px", borderBottom: "1px solid #edf0f5" }}>
                            {usuarioHistorial}
                          </td>
                          <td style={{ padding: "12px", borderBottom: "1px solid #edf0f5" }}>
                            <strong>{accion}</strong>
                          </td>
                          <td style={{ padding: "12px", borderBottom: "1px solid #edf0f5" }}>
                            {descripcion}
                          </td>
                          <td style={{ padding: "12px", borderBottom: "1px solid #edf0f5" }}>
                            {fecha
                              ? formatearFechaHora(fecha)
                              : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default AdminPanel;