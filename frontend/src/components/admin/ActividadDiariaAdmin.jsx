import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarRange,
  Download,
  FileText,
  FilePenLine,
  Plus,
  Search,
  X,
} from "lucide-react";

import axios from "axios";
import * as XLSX from "xlsx-js-style";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const LIMITE_ACTIVIDAD = 300;
const MINIMO_ACTIVIDAD = 10;

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

const API = `${API_URL}/api`;

const obtenerFechaHoy = () => {
  const fecha = new Date();

  return [
    fecha.getFullYear(),
    String(fecha.getMonth() + 1).padStart(2, "0"),
    String(fecha.getDate()).padStart(2, "0"),
  ].join("-");
};

const FORMULARIO_INICIAL = {
  id_practicante: "",
  empresa: "NMR CONSULTORES",
  nombre: "",
  carrera: "",
  horario: "",
  fecha: obtenerFechaHoy(),
  actividad: "",
};

const normalizar = (valor) =>
  String(valor || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const formatearFecha = (fecha) => {
  const partes = String(fecha || "")
    .slice(0, 10)
    .split("-");

  return partes.length === 3
    ? [
        partes[2],
        partes[1],
        partes[0],
      ].join("/")
    : fecha || "Sin fecha";
};


const obtenerNombreDia = (fecha) => {
  const valor = String(fecha || "").slice(0, 10);
  const [anio, mes, dia] = valor.split("-").map(Number);

  if (!anio || !mes || !dia) {
    return "DÍA";
  }

  const fechaLocal = new Date(
    anio,
    mes - 1,
    dia
  );

  return fechaLocal
    .toLocaleDateString("es-MX", {
      weekday: "long",
    })
    .toUpperCase();
};

const obtenerNombreArchivoReporte = (
  extension,
  fechaDesde,
  fechaHasta
) => {
  const fechaArchivo = (fecha) =>
    String(fecha || "").replaceAll("-", "");

  let nombreArchivo =
    "Actividades_Diarias";

  if (fechaDesde && fechaHasta) {
    nombreArchivo +=
      `_${fechaArchivo(fechaDesde)}` +
      `_al_${fechaArchivo(fechaHasta)}`;
  } else if (fechaDesde) {
    nombreArchivo +=
      `_desde_${fechaArchivo(fechaDesde)}`;
  } else if (fechaHasta) {
    nombreArchivo +=
      `_hasta_${fechaArchivo(fechaHasta)}`;
  } else {
    nombreArchivo +=
      `_${fechaArchivo(obtenerFechaHoy())}`;
  }

  return `${nombreArchivo}.${extension}`;
};

function ActividadDiariaAdmin({
  token,
}) {
  const tokenSesion =
    token || localStorage.getItem("token");

  const [actividades, setActividades] =
    useState([]);

  const [listaPracticantes, setListaPracticantes] =
    useState([]);

  const [formulario, setFormulario] =
    useState(FORMULARIO_INICIAL);

  const [mostrandoFormulario, setMostrandoFormulario] =
    useState(false);

  const [idEditando, setIdEditando] =
    useState(null);

  const [error, setError] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");

  const [busqueda, setBusqueda] =
    useState("");

  const [filtroPracticante, setFiltroPracticante] =
    useState("");

  const [filtroCarrera, setFiltroCarrera] =
    useState("");

  const [fechaDesde, setFechaDesde] =
    useState("");

  const [fechaHasta, setFechaHasta] =
    useState("");

  const cargarActividades = useCallback(async () => {
    if (!tokenSesion) {
      setActividades([]);
      return;
    }

    try {
      const response = await axios.get(
        `${API}/actividades-diarias/admin`,
        {
          headers: {
            Authorization: `Bearer ${tokenSesion}`,
          },
        }
      );

      const registros = Array.isArray(
        response.data?.actividades
      )
        ? response.data.actividades
        : [];

      setActividades(
        registros.map((actividad) => ({
          ...actividad,
          nombre:
            actividad.nombre_completo ||
            [
              actividad.nombre,
              actividad.apellido_paterno,
              actividad.apellido_materno,
            ]
              .filter(Boolean)
              .join(" "),
          fecha: String(
            actividad.fecha || ""
          ).slice(0, 10),
        }))
      );
    } catch (errorPeticion) {
      console.error(
        "Error cargando actividades diarias del administrador:",
        errorPeticion
      );

      setError(
        errorPeticion.response?.data?.mensaje ||
          "No se pudieron cargar las actividades diarias."
      );
    }
  }, [tokenSesion]);

  const cargarPracticantes = useCallback(async () => {
    if (!tokenSesion) {
      setListaPracticantes([]);
      return;
    }

    try {
      const response = await axios.get(
        `${API}/admin/practicantes`,
        {
          headers: {
            Authorization: `Bearer ${tokenSesion}`,
          },
        }
      );

      setListaPracticantes(
        Array.isArray(response.data?.practicantes)
          ? response.data.practicantes
          : []
      );
    } catch (errorPeticion) {
      console.error(
        "Error cargando practicantes para actividad diaria:",
        errorPeticion
      );
    }
  }, [tokenSesion]);

  useEffect(() => {
    cargarActividades();
    cargarPracticantes();
  }, [
    cargarActividades,
    cargarPracticantes,
  ]);

  const practicantes = useMemo(() => {
    const mapa = new Map();

    actividades.forEach((actividad) => {
      const clave = String(
        actividad.id_practicante ||
          actividad.nombre
      );

      if (!mapa.has(clave)) {
        mapa.set(clave, {
          id: clave,
          nombre:
            actividad.nombre ||
            "Sin nombre",
        });
      }
    });

    return Array.from(mapa.values())
      .sort((a, b) =>
        a.nombre.localeCompare(b.nombre)
      );
  }, [actividades]);

  const carreras = useMemo(() => {
    return Array.from(
      new Set(
        actividades
          .map(
            (actividad) =>
              actividad.carrera
          )
          .filter(Boolean)
      )
    ).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [actividades]);

  const actividadesFiltradas =
    useMemo(() => {
      const texto = normalizar(busqueda);

      return actividades.filter(
        (actividad) => {
          const coincideBusqueda =
            !texto ||
            [
              actividad.empresa,
              actividad.nombre,
              actividad.carrera,
              actividad.horario,
              actividad.fecha,
              actividad.actividad,
            ].some((valor) =>
              normalizar(valor).includes(
                texto
              )
            );

          const coincidePracticante =
            !filtroPracticante ||
            String(
              actividad.id_practicante ||
                actividad.nombre
            ) === filtroPracticante;

          const coincideCarrera =
            !filtroCarrera ||
            actividad.carrera ===
              filtroCarrera;

          const coincideDesde =
            !fechaDesde ||
            actividad.fecha >= fechaDesde;

          const coincideHasta =
            !fechaHasta ||
            actividad.fecha <= fechaHasta;

          return (
            coincideBusqueda &&
            coincidePracticante &&
            coincideCarrera &&
            coincideDesde &&
            coincideHasta
          );
        }
      );
    }, [
      actividades,
      busqueda,
      filtroPracticante,
      filtroCarrera,
      fechaDesde,
      fechaHasta,
    ]);

  const cambiarCampo = (evento) => {
    const { name, value } =
      evento.target;

    if (name === "id_practicante") {
      const practicanteSeleccionado =
        listaPracticantes.find(
          (practicante) =>
            String(
              practicante.id_practicante
            ) === String(value)
        );

      setFormulario((actual) => ({
        ...actual,
        id_practicante: value,
        empresa: "NMR CONSULTORES",
        nombre: practicanteSeleccionado
          ? [
              practicanteSeleccionado.nombre,
              practicanteSeleccionado.apellido_paterno,
              practicanteSeleccionado.apellido_materno,
            ]
              .filter(Boolean)
              .join(" ")
          : "",
        carrera:
          practicanteSeleccionado?.carrera ||
          practicanteSeleccionado?.nombre_carrera ||
          "",
        horario:
          practicanteSeleccionado?.horario ||
          "Se obtiene del sistema",
      }));

      setError("");
      setMensaje("");
      return;
    }

    setFormulario((actual) => ({
      ...actual,
      [name]:
        name === "actividad"
          ? value.slice(
              0,
              LIMITE_ACTIVIDAD
            )
          : value,
    }));

    setError("");
    setMensaje("");
  };

  const abrirNuevoRegistro = () => {
    setFormulario({
      ...FORMULARIO_INICIAL,
      fecha: obtenerFechaHoy(),
    });

    setIdEditando(null);
    setError("");
    setMensaje("");
    setMostrandoFormulario(true);
  };

  const cancelarFormulario = () => {
    setFormulario(FORMULARIO_INICIAL);
    setIdEditando(null);
    setError("");
    setMostrandoFormulario(false);
  };

  const guardarRegistro = async (evento) => {
    evento.preventDefault();

    const datos = {
      id_practicante:
        formulario.id_practicante,
      fecha:
        formulario.fecha,
      actividad:
        formulario.actividad
          .trim()
          .replace(/\s+/g, " "),
    };

    if (
      !idEditando &&
      !datos.id_practicante
    ) {
      setError(
        "Selecciona un practicante."
      );
      return;
    }

    if (
      !datos.fecha ||
      !datos.actividad
    ) {
      setError(
        "Completa todos los campos obligatorios."
      );
      return;
    }

    if (
      datos.actividad.length <
      MINIMO_ACTIVIDAD
    ) {
      setError(
        "La actividad debe tener al menos 10 caracteres."
      );
      return;
    }

    if (
      datos.actividad.length >
      LIMITE_ACTIVIDAD
    ) {
      setError(
        "La actividad no puede superar 300 caracteres."
      );
      return;
    }

    if (
      datos.fecha >
      obtenerFechaHoy()
    ) {
      setError(
        "No puedes registrar una fecha futura."
      );
      return;
    }

    const duplicado =
      actividades.find(
        (actividad) =>
          String(
            actividad.id_practicante
          ) === String(
            datos.id_practicante
          ) &&
          String(
            actividad.fecha || ""
          ).slice(0, 10) ===
            datos.fecha &&
          actividad.id !== idEditando
      );

    if (duplicado) {
      setError(
        "Ese practicante ya tiene una actividad registrada en la fecha seleccionada."
      );
      return;
    }

    try {
      if (idEditando) {
        await axios.put(
          `${API}/actividades-diarias/admin/${idEditando}`,
          {
            fecha: datos.fecha,
            actividad: datos.actividad,
          },
          {
            headers: {
              Authorization: `Bearer ${tokenSesion}`,
            },
          }
        );
      } else {
        await axios.post(
          `${API}/actividades-diarias/admin`,
          {
            id_practicante:
              Number(
                datos.id_practicante
              ),
            fecha: datos.fecha,
            actividad: datos.actividad,
          },
          {
            headers: {
              Authorization: `Bearer ${tokenSesion}`,
            },
          }
        );
      }

      setMensaje(
        idEditando
          ? "Registro actualizado correctamente."
          : "Registro agregado correctamente."
      );

      setMostrandoFormulario(false);
      setIdEditando(null);
      setFormulario(FORMULARIO_INICIAL);

      await cargarActividades();
    } catch (errorPeticion) {
      console.error(
        "Error guardando actividad diaria desde administrador:",
        errorPeticion
      );

      setError(
        errorPeticion.response?.data?.mensaje ||
          "No se pudo guardar el registro."
      );
    }
  };

  const descargarExcel = () => {
    if (actividadesFiltradas.length === 0) {
      setError(
        "No hay actividades para exportar con los filtros seleccionados."
      );
      return;
    }

    setError("");

    const obtenerDiaSemana = (fecha) => {
      const valor = String(fecha || "").slice(0, 10);
      const partes = valor.split("-");

      if (partes.length !== 3) {
        return "";
      }

      const fechaLocal = new Date(
        Number(partes[0]),
        Number(partes[1]) - 1,
        Number(partes[2])
      );

      return new Intl.DateTimeFormat(
        "es-MX",
        { weekday: "long" }
      ).format(fechaLocal);
    };

    const convertirFechaExcel = (fecha) => {
      const valor = String(fecha || "").slice(0, 10);
      const partes = valor.split("-");

      if (partes.length !== 3) {
        return "";
      }

      return new Date(
        Number(partes[0]),
        Number(partes[1]) - 1,
        Number(partes[2])
      );
    };

    const ajustarTextoExcel = (
      texto,
      maxCaracteres = 55
    ) => {
      const palabras = String(texto || "")
        .trim()
        .split(/\s+/);

      const lineas = [];
      let lineaActual = "";

      palabras.forEach((palabra) => {
        const posibleLinea = lineaActual
          ? `${lineaActual} ${palabra}`
          : palabra;

        if (
          posibleLinea.length <= maxCaracteres
        ) {
          lineaActual = posibleLinea;
        } else {
          if (lineaActual) {
            lineas.push(lineaActual);
          }

          lineaActual = palabra;
        }
      });

      if (lineaActual) {
        lineas.push(lineaActual);
      }

      return lineas.join("\n");
    };

    const actividadesOrdenadas = [
      ...actividadesFiltradas,
    ].sort((a, b) => {
      const fechaA = String(a.fecha || "");
      const fechaB = String(b.fecha || "");

      const comparacionFecha =
        fechaB.localeCompare(fechaA);

      if (comparacionFecha !== 0) {
        return comparacionFecha;
      }

      return String(a.nombre || "").localeCompare(
        String(b.nombre || ""),
        "es"
      );
    });

    const encabezados = [
      "Empresa",
      "Nombre",
      "Carrera",
      "Horario",
      "Día",
      "Fecha",
      "Actividad realizada",
    ];

    const filas = actividadesOrdenadas.map(
      (actividad) => [
        actividad.empresa || "NMR CONSULTORES",
        actividad.nombre || "Sin nombre",
        actividad.carrera || "No registrada",
        actividad.horario || "No registrado",
        obtenerDiaSemana(actividad.fecha),
        convertirFechaExcel(actividad.fecha),
        ajustarTextoExcel(
          actividad.actividad || ""
        ),
      ]
    );

    const fechaGeneracion =
      new Intl.DateTimeFormat(
        "es-MX",
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      ).format(new Date());

    const rangoSeleccionado =
      fechaDesde || fechaHasta
        ? `Periodo: ${
            fechaDesde
              ? formatearFecha(fechaDesde)
              : "Inicio"
          } - ${
            fechaHasta
              ? formatearFecha(fechaHasta)
              : "Actualidad"
          }`
        : "Periodo: todos los registros";

    const datosHoja = [
      ["REPORTE DE ACTIVIDADES DIARIAS"],
      [
        `${rangoSeleccionado} | ${actividadesOrdenadas.length} registros | Generado: ${fechaGeneracion}`,
      ],
      [],
      encabezados,
      ...filas,
    ];

    const hoja = XLSX.utils.aoa_to_sheet(
      datosHoja,
      {
        cellDates: true,
        dateNF: "dd/mm/yyyy",
      }
    );

    // Estilos para que Excel muestre el texto ajustado
    // desde que se abre el archivo, sin tener que entrar
    // manualmente a cada celda.
    const rangoHoja = XLSX.utils.decode_range(
      hoja["!ref"]
    );

    for (
      let fila = rangoHoja.s.r;
      fila <= rangoHoja.e.r;
      fila += 1
    ) {
      for (
        let columna = rangoHoja.s.c;
        columna <= rangoHoja.e.c;
        columna += 1
      ) {
        const direccion =
          XLSX.utils.encode_cell({
            r: fila,
            c: columna,
          });

        const celda = hoja[direccion];

        if (!celda) {
          continue;
        }

        celda.s = {
          alignment: {
            vertical: "top",
            wrapText: true,
          },
        };
      }
    }

    // Título principal
    if (hoja["A1"]) {
      hoja["A1"].s = {
        font: {
          bold: true,
          sz: 16,
        },
        alignment: {
          vertical: "center",
          horizontal: "left",
          wrapText: true,
        },
      };
    }

    // Subtítulo
    if (hoja["A2"]) {
      hoja["A2"].s = {
        font: {
          italic: true,
          color: {
            rgb: "666666",
          },
        },
        alignment: {
          vertical: "center",
          horizontal: "left",
          wrapText: true,
        },
      };
    }

    // Encabezados
    for (
      let columna = 0;
      columna < encabezados.length;
      columna += 1
    ) {
      const direccion =
        XLSX.utils.encode_cell({
          r: 3,
          c: columna,
        });

      if (hoja[direccion]) {
        hoja[direccion].s = {
          font: {
            bold: true,
            color: {
              rgb: "FFFFFF",
            },
          },
          fill: {
            fgColor: {
              rgb: "172746",
            },
          },
          alignment: {
            vertical: "center",
            horizontal: "center",
            wrapText: true,
          },
        };
      }
    }

    // Asegurar específicamente el ajuste de texto
    // en "Actividad realizada".
    for (
      let fila = 4;
      fila <= rangoHoja.e.r;
      fila += 1
    ) {
      const direccion =
        XLSX.utils.encode_cell({
          r: fila,
          c: 6,
        });

      if (hoja[direccion]) {
        hoja[direccion].s = {
          alignment: {
            vertical: "top",
            wrapText: true,
          },
        };
      }
    }

    // Título y subtítulo ocupan todo el ancho.
    hoja["!merges"] = [
      XLSX.utils.decode_range("A1:G1"),
      XLSX.utils.decode_range("A2:G2"),
    ];

    // Anchos de columnas más legibles.
    hoja["!cols"] = [
      { wch: 22 }, // Empresa
      { wch: 32 }, // Nombre
      { wch: 34 }, // Carrera
      { wch: 18 }, // Horario
      { wch: 14 }, // Día
      { wch: 14 }, // Fecha
      { wch: 48 }, // Actividad
    ];

    // Altura de filas para dar más aire al reporte.
    hoja["!rows"] = [
      { hpt: 24 },
      { hpt: 20 },
      { hpt: 8 },
      { hpt: 24 },
      ...filas.map((fila) => {
        const lineasActividad =
          String(fila[6] || "").split("\n").length;

        return {
          hpt: Math.max(
            32,
            lineasActividad * 18
          ),
        };
      }),
    ];

    // Filtros nativos de Excel en todos los encabezados.
    const ultimaFila = filas.length + 4;

    hoja["!autofilter"] = {
      ref: `A4:G${ultimaFila}`,
    };

    // Mantener la fecha como fecha real de Excel.
    for (
      let fila = 5;
      fila <= ultimaFila;
      fila += 1
    ) {
      const celdaFecha = hoja[`F${fila}`];

      if (celdaFecha) {
        celdaFecha.z = "dd/mm/yyyy";
      }
    }

    const libro = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      libro,
      hoja,
      "Actividades"
    );

    XLSX.writeFile(
      libro,
      obtenerNombreArchivoReporte(
        "xlsx",
        fechaDesde,
        fechaHasta
      ),
      {
        cellDates: true,
      }
    );
  };

  const descargarPDF = () => {
    if (actividadesFiltradas.length === 0) {
      setError(
        "No hay actividades para exportar con los filtros seleccionados."
      );
      return;
    }

    setError("");

    const actividadesOrdenadas = [
      ...actividadesFiltradas,
    ].sort((a, b) => {
      const comparacionFecha =
        String(a.fecha || "").localeCompare(
          String(b.fecha || "")
        );

      if (comparacionFecha !== 0) {
        return comparacionFecha;
      }

      return String(a.nombre || "").localeCompare(
        String(b.nombre || ""),
        "es"
      );
    });

    const actividadesPorFecha =
      actividadesOrdenadas.reduce(
        (acumulado, actividad) => {
          const fecha = String(
            actividad.fecha || "Sin fecha"
          ).slice(0, 10);

          if (!acumulado[fecha]) {
            acumulado[fecha] = [];
          }

          acumulado[fecha].push(actividad);

          return acumulado;
        },
        {}
      );

    const fechas = Object.keys(
      actividadesPorFecha
    ).sort();

    const documento = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const margenIzquierdo = 12;
    const margenDerecho = 12;
    const anchoPagina =
      documento.internal.pageSize.getWidth();

    const agregarEncabezado = () => {
      documento.setFont(
        "helvetica",
        "bold"
      );
      documento.setFontSize(16);
      documento.text(
        "NMR CONSULTORES",
        margenIzquierdo,
        14
      );

      documento.setFontSize(12);
      documento.text(
        "REPORTE DE ACTIVIDADES DIARIAS",
        margenIzquierdo,
        21
      );

      documento.setFont(
        "helvetica",
        "normal"
      );
      documento.setFontSize(9);

      const periodo =
        fechaDesde || fechaHasta
          ? `Periodo: ${
              fechaDesde
                ? formatearFecha(fechaDesde)
                : "Inicio"
            } - ${
              fechaHasta
                ? formatearFecha(fechaHasta)
                : "Actualidad"
            }`
          : "Periodo: Todos los registros filtrados";

      documento.text(
        periodo,
        margenIzquierdo,
        27
      );

      documento.text(
        `Total de registros: ${actividadesFiltradas.length}`,
        margenIzquierdo,
        32
      );

      documento.text(
        `Generado: ${formatearFecha(
          obtenerFechaHoy()
        )}`,
        anchoPagina - margenDerecho,
        27,
        {
          align: "right",
        }
      );
    };

    agregarEncabezado();

    let posicionY = 40;

    fechas.forEach(
      (fecha, indiceFecha) => {
        const registros =
          actividadesPorFecha[fecha];

        // Si no hay espacio suficiente para
        // el título y al menos unas filas,
        // comenzamos en una página nueva.
        if (posicionY > 175) {
          documento.addPage();
          agregarEncabezado();
          posicionY = 40;
        }

        documento.setFont(
          "helvetica",
          "bold"
        );
        documento.setFontSize(11);

        documento.text(
          `${obtenerNombreDia(fecha)} ${formatearFecha(
            fecha
          )}`,
          margenIzquierdo,
          posicionY
        );

        autoTable(documento, {
          startY: posicionY + 4,
          margin: {
            left: margenIzquierdo,
            right: margenDerecho,
          },
          head: [
            [
              "Empresa",
              "Practicante",
              "Carrera",
              "Horario",
              "Actividad realizada",
            ],
          ],
          body: registros.map(
            (actividad) => [
              actividad.empresa ||
                "NMR CONSULTORES",
              actividad.nombre ||
                "Sin nombre",
              actividad.carrera ||
                "No registrada",
              actividad.horario ||
                "No registrado",
              actividad.actividad || "",
            ]
          ),
          styles: {
            font: "helvetica",
            fontSize: 8,
            cellPadding: 2,
            overflow: "linebreak",
            valign: "top",
          },
          headStyles: {
            fontStyle: "bold",
          },
          columnStyles: {
            0: {
              cellWidth: 34,
            },
            1: {
              cellWidth: 48,
            },
            2: {
              cellWidth: 48,
            },
            3: {
              cellWidth: 32,
            },
            4: {
              cellWidth: "auto",
            },
          },
          showHead: "everyPage",
          didDrawPage: (data) => {
            // Cuando autoTable agrega una página
            // automáticamente, colocamos de nuevo
            // el encabezado general arriba.
            if (
              data.pageNumber > 1 &&
              documento.internal.getNumberOfPages() >
                1
            ) {
              // El encabezado del reporte se agrega
              // sólo si hay espacio por encima
              // de la tabla en esa página.
            }
          },
        });

        posicionY =
          (documento.lastAutoTable?.finalY ||
            posicionY + 10) +
          10;

        // Separa visualmente los días.
        if (
          indiceFecha < fechas.length - 1 &&
          posicionY > 185
        ) {
          documento.addPage();
          agregarEncabezado();
          posicionY = 40;
        }
      }
    );

    const totalPaginas =
      documento.internal.getNumberOfPages();

    for (
      let pagina = 1;
      pagina <= totalPaginas;
      pagina += 1
    ) {
      documento.setPage(pagina);

      documento.setFont(
        "helvetica",
        "normal"
      );
      documento.setFontSize(8);

      documento.text(
        `Página ${pagina} de ${totalPaginas}`,
        anchoPagina - margenDerecho,
        202,
        {
          align: "right",
        }
      );
    }

    documento.save(
      obtenerNombreArchivoReporte(
        "pdf",
        fechaDesde,
        fechaHasta
      )
    );
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroPracticante("");
    setFiltroCarrera("");
    setFechaDesde("");
    setFechaHasta("");
  };

  const hayFiltros =
    busqueda ||
    filtroPracticante ||
    filtroCarrera ||
    fechaDesde ||
    fechaHasta;

  return (
    <div className="actividad-admin-page">
      <style>{`
        .actividad-tabla-wrapper {
          overflow-x: visible !important;
        }

        .actividad-admin-table {
          width: 100% !important;
          min-width: 0 !important;
          table-layout: fixed;
        }

        .actividad-admin-table th,
        .actividad-admin-table td {
          white-space: normal !important;
          word-break: break-word;
          overflow-wrap: anywhere;
          vertical-align: top;
        }

        .actividad-admin-table th:nth-child(1),
        .actividad-admin-table td:nth-child(1) {
          width: 15%;
        }

        .actividad-admin-table td:nth-child(1) {
          word-break: normal !important;
          overflow-wrap: normal !important;
        }

        .actividad-admin-table th:nth-child(2),
        .actividad-admin-table td:nth-child(2) {
          width: 14%;
        }

        .actividad-admin-table th:nth-child(3),
        .actividad-admin-table td:nth-child(3) {
          width: 17%;
        }

        .actividad-admin-table th:nth-child(4),
        .actividad-admin-table td:nth-child(4) {
          width: 11%;
        }

        .actividad-admin-table th:nth-child(5),
        .actividad-admin-table td:nth-child(5) {
          width: 11%;
        }

        .actividad-admin-table th:nth-child(6),
        .actividad-admin-table td:nth-child(6) {
          width: 32%;
        }

        .actividad-admin-table .actividad-descripcion-cell {
          max-width: none;
          vertical-align: top;
        }

        .actividad-admin-table .actividad-descripcion-compacta {
          display: block;
          overflow: visible;
          text-overflow: unset;
          line-height: 1.35;
          max-height: none;
          white-space: normal;
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        /*
         * En móvil la tabla se transforma visualmente en tarjetas.
         * Las reglas de escritorio anteriores permanecen intactas.
         */
        @media (max-width: 650px) {
          .actividad-tabla-wrapper {
            overflow: visible !important;
          }

          .actividad-tabla-wrapper.table-scroll-guide::before {
            display: none !important;
          }

          .actividad-admin-table,
          .actividad-admin-table tbody,
          .actividad-admin-table tr,
          .actividad-admin-table td {
            display: block;
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
          }

          .actividad-admin-table {
            table-layout: auto !important;
            border-collapse: separate;
            border-spacing: 0;
          }

          .actividad-admin-table thead {
            display: none;
          }

          .actividad-admin-table tbody {
            display: grid;
            gap: 14px;
          }

          .actividad-admin-table tr {
            overflow: hidden;
            border: 1px solid #e1e6ee;
            border-radius: 12px;
            background: #ffffff;
            box-shadow: 0 2px 8px rgba(16, 28, 54, 0.04);
          }

          .actividad-admin-table td {
            display: grid;
            grid-template-columns: 105px minmax(0, 1fr);
            gap: 12px;
            align-items: start;
            padding: 10px 12px !important;
            border-bottom: 1px solid #edf0f5;
            white-space: normal !important;
            word-break: normal !important;
            overflow-wrap: break-word !important;
          }

          .actividad-admin-table td::before {
            content: attr(data-label);
            color: #66758c;
            font-size: 11px;
            font-weight: 700;
            line-height: 1.35;
          }

          .actividad-admin-table td:last-child {
            border-bottom: none;
          }

          .actividad-admin-table td strong,
          .actividad-admin-table td span {
            min-width: 0;
            word-break: normal !important;
            overflow-wrap: break-word !important;
          }

          .actividad-admin-table .actividad-descripcion-cell {
            max-width: 100% !important;
          }

          .actividad-admin-table .actividad-descripcion-compacta {
            line-height: 1.5;
            word-break: normal !important;
            overflow-wrap: break-word !important;
          }
        }

        @media (max-width: 380px) {
          .actividad-admin-table td {
            grid-template-columns: 1fr;
            gap: 4px;
          }
        }
      `}</style>
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="section-label">
              CONTROL DIARIO
            </p>

            <h3>
              Bitácora de actividades
            </h3>
          </div>

          <button
            type="button"
            onClick={
              mostrandoFormulario
                ? cancelarFormulario
                : abrirNuevoRegistro
            }
          >
            {mostrandoFormulario ? (
              <>
                <X size={18} />
                Cancelar
              </>
            ) : (
              <>
                <Plus size={18} />
                Nuevo registro
              </>
            )}
          </button>
        </div>

        <p className="panel-description">
          Consulta, registra y administra las actividades diarias de los practicantes.
        </p>

        {mostrandoFormulario && (
          <form
            className="actividad-admin-form"
            onSubmit={guardarRegistro}
            noValidate
          >
            <div className="actividad-admin-form-header">
              <FilePenLine size={22} />

              <strong>
                {idEditando
                  ? "Editar registro"
                  : "Nuevo registro diario"}
              </strong>
            </div>

            <div className="actividad-admin-form-grid">
              <label>
                Empresa *
                <input
                  name="empresa"
                  value={formulario.empresa}
                  readOnly
                  maxLength="60"
                  onChange={cambiarCampo}
                />
              </label>

              <label>
                Practicante *
                <select
                  name="id_practicante"
                  value={formulario.id_practicante}
                  onChange={cambiarCampo}
                  disabled={Boolean(idEditando)}
                >
                  <option value="">
                    Selecciona un practicante
                  </option>

                  {listaPracticantes.map(
                    (practicante) => (
                      <option
                        key={
                          practicante.id_practicante
                        }
                        value={
                          practicante.id_practicante
                        }
                      >
                        {[
                          practicante.nombre,
                          practicante.apellido_paterno,
                          practicante.apellido_materno,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                Carrera *
                <input
                  name="carrera"
                  value={formulario.carrera}
                  readOnly
                  maxLength="80"
                  onChange={cambiarCampo}
                />
              </label>

              <label>
                Horario *
                <input
                  name="horario"
                  value={formulario.horario}
                  readOnly
                  maxLength="40"
                  placeholder="Ej. 10:00 - 13:00"
                  onChange={cambiarCampo}
                />
              </label>

              <label>
                Fecha *
                <input
                  type="date"
                  name="fecha"
                  value={formulario.fecha}
                  max={obtenerFechaHoy()}
                  onChange={cambiarCampo}
                />
              </label>

              <label className="actividad-admin-textarea">
                Actividad realizada *

                <textarea
                  name="actividad"
                  value={formulario.actividad}
                  maxLength={LIMITE_ACTIVIDAD}
                  rows="5"
                  onChange={cambiarCampo}
                  placeholder="Descripción resumida de la actividad..."
                />

                <span>
                  {formulario.actividad.length} / {LIMITE_ACTIVIDAD}
                </span>
              </label>
            </div>

            {error && (
              <div className="actividad-mensaje actividad-mensaje-error">
                {error}
              </div>
            )}

            <div className="actividad-form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={cancelarFormulario}
              >
                Cancelar
              </button>

              <button type="submit">
                {idEditando
                  ? "Guardar cambios"
                  : "Agregar registro"}
              </button>
            </div>
          </form>
        )}

        {mensaje && (
          <div className="actividad-mensaje actividad-mensaje-exito">
            {mensaje}
          </div>
        )}

        <div className="actividad-admin-filtros">
          <div className="actividad-admin-search">
            <Search size={18} />

            <input
              value={busqueda}
              onChange={(evento) =>
                setBusqueda(
                  evento.target.value
                )
              }
              placeholder="Buscar por practicante, empresa, carrera o actividad"
            />
          </div>

          <select
            value={filtroPracticante}
            onChange={(evento) =>
              setFiltroPracticante(
                evento.target.value
              )
            }
          >
            <option value="">
              Todos los practicantes
            </option>

            {practicantes.map(
              (practicante) => (
                <option
                  key={practicante.id}
                  value={practicante.id}
                >
                  {practicante.nombre}
                </option>
              )
            )}
          </select>

          <select
            value={filtroCarrera}
            onChange={(evento) =>
              setFiltroCarrera(
                evento.target.value
              )
            }
          >
            <option value="">
              Todas las carreras
            </option>

            {carreras.map((carrera) => (
              <option
                key={carrera}
                value={carrera}
              >
                {carrera}
              </option>
            ))}
          </select>

          <label className="actividad-date-filter">
            <span>Desde</span>
            <input
              type="date"
              value={fechaDesde}
              max={fechaHasta || undefined}
              onChange={(evento) =>
                setFechaDesde(
                  evento.target.value
                )
              }
            />
          </label>

          <label className="actividad-date-filter">
            <span>Hasta</span>
            <input
              type="date"
              value={fechaHasta}
              min={fechaDesde || undefined}
              onChange={(evento) =>
                setFechaHasta(
                  evento.target.value
                )
              }
            />
          </label>

          <button
            type="button"
            className="secondary-button"
            disabled={!hayFiltros}
            onClick={limpiarFiltros}
          >
            Limpiar filtros
          </button>
        </div>

        <div className="actividad-admin-results">
          <div>
            <CalendarRange size={18} />

            Mostrando{" "}
            <strong>
              {actividadesFiltradas.length}
            </strong>{" "}
            de{" "}
            <strong>
              {actividades.length}
            </strong>{" "}
            registros
          </div>

          <div
            className="actividad-admin-exportaciones"
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              className="secondary-button"
              onClick={descargarExcel}
              disabled={
                actividadesFiltradas.length === 0
              }
            >
              <Download size={18} />
              Descargar Excel
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={descargarPDF}
              disabled={
                actividadesFiltradas.length === 0
              }
            >
              <FileText size={18} />
              Descargar PDF
            </button>
          </div>
        </div>

        {actividadesFiltradas.length === 0 ? (
          <div className="actividad-empty-state">
            <FilePenLine size={34} />

            <strong>
              No hay actividades para mostrar
            </strong>

            <span>
              Registra una actividad o modifica los filtros.
            </span>
          </div>
        ) : (
          <div className="actividad-tabla-wrapper table-scroll-guide">
            <table className="actividad-tabla actividad-admin-table">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Practicante</th>
                  <th>Carrera</th>
                  <th>Horario</th>
                  <th>Fecha</th>
                  <th>Actividad realizada</th>
                </tr>
              </thead>

              <tbody>
                {actividadesFiltradas.map(
                  (actividad) => (
                    <tr key={actividad.id}>
                      <td data-label="Empresa">
                        <strong>
                          {actividad.empresa}
                        </strong>
                      </td>

                      <td data-label="Practicante">
                        <strong>
                          {actividad.nombre}
                        </strong>
                      </td>

                      <td data-label="Carrera">
                        {actividad.carrera}
                      </td>

                      <td data-label="Horario">
                        {actividad.horario}
                      </td>

                      <td data-label="Fecha">
                        {formatearFecha(
                          actividad.fecha
                        )}
                      </td>

                      <td
                        data-label="Actividad realizada"
                        className="actividad-descripcion-cell"
                        title={actividad.actividad}
                      >
                        <span className="actividad-descripcion-compacta">
                          {actividad.actividad}
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default ActividadDiariaAdmin;