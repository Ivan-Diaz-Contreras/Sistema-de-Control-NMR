import { useEffect, useMemo, useState } from "react";
import axios from "axios";
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
import CarrerasAdmin from "../components/admin/CarrerasAdmin";
import EstadisticasAdmin from "../components/admin/EstadisticasAdmin";
import HistorialAdmin from "../components/admin/HistorialAdmin";
import SeguridadAdmin from "../components/admin/SeguridadAdmin";

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
        "La contrasena temporal debe tener entre 8 y 20 caracteres e incluir mayuscula, minuscula y numero."
      );
      return;
    }

    if (
      nuevoPracticante.password !==
      nuevoPracticante.confirmar_password
    ) {
      setMensaje(
        "La contrasena y su confirmacion no coinciden."
      );
      return;
    }

    if (!validarTelefono(telefonoLimpio)) {
      setMensaje(
        "El telefono debe contener exactamente 10 digitos."
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

      const response = await axios.post(
        `${API}/admin/practicantes`,
        payload,
        { headers }
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

      const response = await axios.delete(
        `${API}/admin/practicantes/${practicante.id_practicante}`,
        { headers }
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

  const adminProps = {
    abrirArchivoBitacoraAdmin,
    abrirEdicionActividad,
    abrirEdicionAsistencia,
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
    formHorario,
    formatearFecha,
    formatearFechaHora,
    formatearHora,
    guardandoActividad,
    guardandoAsistencia,
    guardandoCarrera,
    guardandoHorario,
    guardandoPracticante,
    guardandoNuevoPracticante,
    guardandoRegistroHoras,
    guardarActividadBitacora,
    guardarAsistencia,
    guardarCarrera,
    guardarHorario,
    guardarPracticante,
    guardarNuevoPracticante,
    guardarRegistroHoras,
    historial,
    historialFiltrado,
    horariosPracticante,
    iniciarEdicion,
    mensaje,
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

      const response = await axios.put(
        `${API}/admin/password`,
        {
          password_actual:
            formPasswordAdmin.password_actual,
          password_nueva:
            formPasswordAdmin.password_nueva,
          confirmar_password:
            formPasswordAdmin.confirmar_password,
        },
        { headers }
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

  return (
    <div className="app">
      {/* ==========================================
          SIDEBAR
      ========================================== */}

      <AdminSidebar
        seccion={seccion}
        setSeccion={setSeccion}
        onLogout={onLogout}
        cargarAsistencias={cargarAsistencias}
        cargarActividadesBitacora={cargarActividadesBitacora}
        cargarEntregasBitacoras={cargarEntregasBitacoras}
        cargarCarreras={cargarCarreras}
        cargarHistorial={cargarHistorial}
      />

      {/* ==========================================
          CONTENIDO PRINCIPAL
      ========================================== */}

      <main className="main-content">
        <AdminTopbar
          usuario={usuario}
          titulo={obtenerTitulo()}
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
          />
        )}

        {/* ==========================================
            BITÁCORAS
        ========================================== */}

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