# Sistema de Control NMR

Sistema web desarrollado para **NMR Consultores** con el objetivo de administrar, registrar y dar seguimiento a las prácticas profesionales de los practicantes de la empresa.

La plataforma centraliza información relacionada con practicantes, asistencias, horarios, horas acumuladas, actividades diarias, bitácoras y notificaciones.

## Funcionalidades principales

### Administrador

- Registrar y administrar practicantes.
- Generar matrículas automáticamente.
- Administrar carreras.
- Consultar y filtrar asistencias.
- Visualizar horarios y horas acumuladas.
- Registrar y supervisar actividades diarias.
- Crear actividades de bitácora.
- Revisar y aprobar o rechazar bitácoras.
- Consultar estadísticas generales.
- Revisar el historial de actividades.
- Gestionar notificaciones relacionadas con bitácoras.

### Practicante

- Iniciar sesión de forma segura.
- Consultar información personal.
- Registrar asistencia.
- Consultar horas acumuladas.
- Registrar actividades diarias.
- Consultar actividades asignadas.
- Consultar bitácoras disponibles.
- Entregar bitácoras.
- Consultar el estado de sus entregas.
- Recibir notificaciones de nuevas bitácoras.
- Recibir notificaciones cuando una bitácora es aprobada o rechazada.


## Tecnologías utilizadas

### Frontend

- React
- Vite
- Axios
- Lucide React
- Recharts
- jsPDF
- jsPDF AutoTable
- XLSX
- HTML5
- CSS3
- JavaScript

### Backend

- Node.js
- Express
- MySQL2
- JSON Web Token (JWT)
- bcrypt
- Multer
- CORS
- dotenv

### Base de datos

El sistema utiliza una base de datos compatible con MySQL alojada en **TiDB Cloud**.

La comunicación entre el backend y la base de datos utiliza una conexión segura mediante TLS.

## Estructura general del proyecto

El proyecto está dividido en un frontend desarrollado con React y un backend encargado de proporcionar la API y comunicarse con la base de datos.

```text
Sistema-de-Control-NMR/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   └── pages/
│   └── package.json
├── database/
└── README.md
```

## Requisitos

- Node.js
- npm
- Git
- Acceso a TiDB Cloud o una base de datos compatible con MySQL

## Clonar el proyecto

```bash
git clone https://github.com/Ivan-Diaz-Contreras/Sistema-de-Control-NMR.git
cd Sistema-de-Control-NMR
```

## Instalar el Backend

```bash
cd backend
npm install
```

## Instalar el Frontend

Desde la raíz del proyecto:

```bash
cd frontend
npm install
```


## Configuración del Backend

Crear un archivo ```text
backend/.env
```

En este archivo deben configurarse las variables necesarias para la conexión con la base de datos, el puerto del servidor y la clave utilizada para JWT.

Nunca deben subirse contraseñas, tokens ni credenciales reales al repositorio.

## Ejecutar el Backend

Desde la carpeta ```text
backend
```:

```bash
npm start
```

Por defecto, el servidor puede ejecutarse en:

```text
http://localhost:3000
```

## Configuración del Frontend

Para trabajar localmente se puede crear:

```text
frontend/.env.local
```

Ejemplo:

```env
VITE_API_URL=http://localhost:3000
```

## Ejecutar el Frontend

Desde la carpeta ```text
frontend
```:

```bash
npm run dev
```

Vite normalmente inicia la aplicación en:

```text
http://localhost:5173
```

## Compilar para producción

Para comprobar que el frontend compila correctamente:

```bash
npm run build
```

Los archivos de producción se generan en:

```text
frontend/dist/
```

## Seguridad

El sistema implementa distintas medidas de seguridad:

- Autenticación mediante JSON Web Token.
- Contraseñas cifradas con bcrypt.
- Protección de rutas mediante middleware.
- Separación de permisos entre administrador y practicante.
- Uso de variables de entorno para datos sensibles.
- Comunicación segura con TiDB Cloud.

## Notificaciones

El sistema cuenta con notificaciones para informar al practicante sobre eventos importantes.

Actualmente se contemplan:

- Nueva actividad de bitácora disponible.
- Bitácora aprobada.
- Bitácora rechazada.

Las notificaciones pendientes también se representan mediante indicadores dentro del panel del practicante.

## Despliegue

El proyecto utiliza servicios independientes para cada parte del sistema:

- Frontend: Netlify.
- Backend: Render.
- Base de datos: TiDB Cloud.

## Estado del proyecto

El sistema se encuentra en desarrollo y mejora continua.

Actualmente incluye módulos de:

- Usuarios y practicantes.
- Autenticación.
- Asistencias.
- Horarios.
- Control de horas.
- Actividades diarias.
- Bitácoras.
- Historial de actividades.
- Estadísticas.
- Notificaciones.
- Exportación de información.

## Equipo de desarrollo

Proyecto desarrollado como parte de las prácticas profesionales para **NMR Consultores**.

## Repositorio

```text
https://github.com/Ivan-Diaz-Contreras/Sistema-de-Control-NMR
```
