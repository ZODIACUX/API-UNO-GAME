# Estructura del Proyecto

Este documento describe la nueva organización de archivos del proyecto UNO Game API.

## Estructura de Carpetas

### Raíz del Proyecto
Los siguientes archivos permanecen en la raíz por ser esenciales:
- `package.json` - Configuración del proyecto y dependencias
- `package-lock.json` - Lockfile de dependencias
- `index.js` - Punto de entrada principal de la aplicación
- `.gitignore` - Archivos ignorados por Git
- `.env.example` - Ejemplo de variables de entorno
- `.env.test` - Variables de entorno para testing

### `/config/` - Archivos de Configuración
- `.babelrc` - Configuración de Babel
- `.eslintrc.js` - Configuración de ESLint
- `ormconfig.js` - Configuración de TypeORM
- `.dockerignore` - Archivos ignorados por Docker

### `/docker/` - Archivos Docker
- `docker-compose.yml` - Configuración de Docker Compose
- `Dockerfile` - Imagen Docker de la aplicación
- `setup-mysql-container.bat` - Script de setup para Windows
- `setup-mysql-container.ps1` - Script de setup para PowerShell

### `/docs/` - Documentación
- `README.md` - Documentación principal del proyecto
- `API-TESTING-GUIDE.md` - Guía para testing de la API
- `INSTRUCCIONES-DOCKER.md` - Instrucciones de Docker
- `SOLID_PRINCIPLES_IMPLEMENTATION.md` - Implementación de principios SOLID
- `PROJECT-STRUCTURE.md` - Este documento

### `/tests/` - Scripts de Testing
- `test-api-endpoints.js` - Testing de endpoints de la API
- `test-api-endpoints.ps1` - Script PowerShell para testing
- `test-api-endpoints.sh` - Script Bash para testing
- `test-db-connection.js` - Test de conexión a base de datos
- `test-nextTurn.js` - Test de funcionalidad nextTurn
- `test-uno-endpoints.js` - Test específico de endpoints UNO
- `install-test-dependencies.js` - Instalador de dependencias de testing

### `/src/` - Código Fuente
Mantiene la estructura existente con:
- `app.js` y `server.js` - Configuración de la aplicación
- `config/` - Configuración de base de datos
- `controllers/` - Controladores de la API
- `middlewares/` - Middlewares de Express
- `models/` - Modelos de datos
- `routes/` - Definición de rutas
- `services/` - Lógica de negocio
- `tests/` - Tests unitarios e integración
- `utils/` - Utilidades

## Archivos de Referencia

Para mantener la compatibilidad, se crearon archivos de referencia en la raíz que apuntan a las configuraciones en sus nuevas ubicaciones:

- `.babelrc` → `config/.babelrc`
- `.eslintrc.js` → `config/.eslintrc.js`
- `ormconfig.js` → `config/ormconfig.js`
- `docker-compose.yml` → Actualizado para referenciar `docker/Dockerfile`

## Beneficios de la Nueva Estructura

1. **Organización Clara**: Archivos agrupados por propósito
2. **Raíz Limpia**: Solo archivos esenciales en la raíz
3. **Mantenibilidad**: Fácil localización de archivos específicos
4. **Escalabilidad**: Estructura preparada para crecimiento del proyecto
5. **Compatibilidad**: Mantiene funcionalidad existente

## Comandos Verificados

Los siguientes comandos funcionan correctamente después de la reorganización:
- `npm run lint` - ESLint funciona correctamente
- `docker-compose config` - Docker Compose valida correctamente
- `npm run docker:start` - Inicia contenedores Docker
- `npm run test` - Ejecuta tests