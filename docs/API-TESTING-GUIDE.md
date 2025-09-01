# Guía de Pruebas de API - UNO Game API

Esta guía te ayudará a probar todos los endpoints de la UNO Game API usando los scripts automatizados incluidos.

## Scripts Disponibles

### 1. Script de Node.js (`test-api-endpoints.js`)
**Recomendado para desarrollo**
- Más detallado y con mejor manejo de errores
- Requiere Node.js y las dependencias del proyecto
- Colores en consola para mejor legibilidad

### 2. Script de PowerShell (`test-api-endpoints.ps1`)
**Recomendado para Windows**
- Nativo de Windows, no requiere instalaciones adicionales
- Interfaz colorida y fácil de leer
- Manejo robusto de errores

### 3. Script de Bash (`test-api-endpoints.sh`)
**Recomendado para Linux/Mac**
- Usa curl, disponible en la mayoría de sistemas Unix
- Ligero y rápido
- Compatible con Git Bash en Windows

## Preparación

### Paso 1: Asegurar que el servidor esté corriendo
```bash
# Iniciar Docker y MySQL
powershell -ExecutionPolicy Bypass -File setup-mysql-container.ps1

# Probar conexión a la base de datos
node test-db-connection.js

# Iniciar el servidor
npm start
```

### Paso 2: Verificar que el servidor responda
```bash
curl http://localhost:3000/health
```

## Uso de los Scripts

### Opción 1: Node.js Script
```bash
# Instalar dependencias si no están instaladas
npm install axios

# Ejecutar pruebas
node test-api-endpoints.js
```

### Opción 2: PowerShell Script
```powershell
# Ejecutar con configuración por defecto
powershell -ExecutionPolicy Bypass -File test-api-endpoints.ps1

# Ejecutar con URL personalizada
powershell -ExecutionPolicy Bypass -File test-api-endpoints.ps1 -BaseUrl "http://localhost:3000/api"
```

### Opción 3: Bash Script
```bash
# Hacer el script ejecutable (Linux/Mac)
chmod +x test-api-endpoints.sh

# Ejecutar con configuración por defecto
./test-api-endpoints.sh

# Ejecutar con URL personalizada
./test-api-endpoints.sh "http://localhost:3000/api" "http://localhost:3000/health"

# En Windows con Git Bash
bash test-api-endpoints.sh
```

## Endpoints Probados

### 🔐 Autenticación (`/api/auth`)
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión
- `GET /auth/profile` - Obtener perfil (requiere auth)
- `POST /auth/logout` - Cerrar sesión

### 🃏 Cartas (`/api/cards`)
- `GET /cards` - Obtener todas las cartas
- `POST /cards` - Crear nueva carta
- `GET /cards/:id` - Obtener carta por ID
- `GET /cards/type/:type` - Obtener cartas por tipo
- `GET /cards/color/:color` - Obtener cartas por color
- `POST /cards/batch` - Crear múltiples cartas

### 🎮 Juegos UNO (`/api/uno-games`)
- `GET /uno-games/games` - Obtener todos los juegos
- `POST /uno-games/games` - Crear nuevo juego
- `GET /uno-games/games/active` - Obtener juegos activos
- `GET /uno-games/games/:id` - Obtener juego específico
- `POST /uno-games/games/:id/start` - Iniciar juego
- `POST /uno-games/games/:id/play` - Jugar carta
- `POST /uno-games/games/:id/draw` - Robar carta

### 👥 Jugadores (`/api/game-players`)
- `GET /game-players/:gameId/players` - Obtener jugadores del juego
- `POST /game-players/:gameId/join` - Unirse al juego
- `POST /game-players/:gameId/leave` - Salir del juego
- `PUT /game-players/:gameId/ready` - Marcar como listo

### 🏆 Participantes (`/api/participants`)
- `GET /participants/leaderboard` - Obtener tabla de líderes
- `GET /participants/participants/:userId/stats` - Obtener estadísticas
- `POST /participants/games/:gameId/join` - Unirse como participante
- `DELETE /participants/games/:gameId/leave` - Salir como participante
- `GET /participants/games/:gameId/participants` - Obtener participantes

### 📊 Puntuaciones (`/api/scores`)
- `GET /scores/scores/high-scores` - Obtener puntuaciones altas
- `GET /scores/games/:gameId/scores` - Obtener puntuaciones del juego
- `POST /scores/games/:gameId/scores` - Crear puntuación
- `PUT /scores/scores/:id` - Actualizar puntuación
- `GET /scores/participants/:participantId/scores` - Obtener puntuaciones del participante
- `POST /scores/games/:gameId/calculate-scores` - Calcular puntuaciones finales

### 🏥 Sistema
- `GET /health` - Verificar estado del servidor
- `GET /api/` - Obtener endpoints disponibles

## Interpretación de Resultados

### ✅ PASS (Verde)
El endpoint funciona correctamente y devuelve una respuesta válida.

### ❌ FAIL (Rojo)
El endpoint falló. Posibles causas:
- Servidor no está corriendo
- Base de datos no conectada
- Error en el código del endpoint
- Datos de prueba inválidos

### ⚠️ WARNING (Amarillo)
Prueba omitida por falta de datos previos (ej: no hay token de autenticación).

## Solución de Problemas

### Error: "ECONNREFUSED"
```bash
# El servidor no está corriendo
npm start
```

### Error: "Access denied for user"
```bash
# Problema con la base de datos
powershell -ExecutionPolicy Bypass -File setup-mysql-container.ps1
node test-db-connection.js
```

### Error: "401 Unauthorized"
- El token de autenticación expiró o es inválido
- Ejecuta primero las pruebas de autenticación

### Error: "404 Not Found"
- Verifica que la URL base sea correcta
- Asegúrate de que el servidor esté en el puerto correcto

## Personalización

### Cambiar URL Base
```bash
# En variables de entorno
export API_BASE_URL="http://localhost:3001/api"

# O directamente en los scripts
```

### Agregar Nuevos Tests
Edita cualquiera de los scripts para agregar nuevos endpoints:

```javascript
// En test-api-endpoints.js
async function testNewEndpoint() {
  const result = await makeRequest('GET', '/new-endpoint', null, true);
  // ... lógica de prueba
}
```

## Automatización

### Integración Continua
```bash
# Agregar a package.json
"scripts": {
  "test:api": "node test-api-endpoints.js",
  "test:api:ps": "powershell -ExecutionPolicy Bypass -File test-api-endpoints.ps1"
}

# Ejecutar
npm run test:api
```

### Pruebas Programadas
```bash
# Crear tarea programada para ejecutar pruebas cada hora
# Windows Task Scheduler o cron en Linux
```

## Notas Importantes

1. **Orden de Ejecución**: Los scripts ejecutan las pruebas en orden lógico (auth primero, luego endpoints que requieren auth)

2. **Datos de Prueba**: Se crean usuarios y juegos temporales con timestamps únicos

3. **Limpieza**: Los scripts no limpian datos de prueba automáticamente

4. **Tokens**: Los tokens de autenticación se muestran al final para pruebas manuales

5. **Logs**: Todos los errores se muestran con detalles para facilitar el debugging

## Contribuir

Para agregar nuevos endpoints o mejorar las pruebas:

1. Edita el script correspondiente
2. Agrega la documentación aquí
3. Prueba que funcione correctamente
4. Actualiza esta guía

---

**¡Happy Testing! 🚀**