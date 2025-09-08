# Plan de Pruebas JMeter - API UNO Game

Este archivo contiene el plan de pruebas automatizado para todos los endpoints de la API del juego UNO utilizando Apache JMeter.

## 📋 Descripción

El plan de pruebas `jmeter-test-plan.jmx` incluye pruebas automatizadas para:

- ✅ **Autenticación y Usuarios** (3 endpoints)
- ✅ **Gestión de Juegos UNO** (8 endpoints) 
- ✅ **Acciones de Juego** (6 endpoints)
- ✅ **Endpoints TypeORM** (9 endpoints)
- ✅ **Endpoints SOLID** (5 endpoints)

**Total: 31 endpoints automatizados**

## 🚀 Configuración Previa

### 1. Instalar Apache JMeter

Descarga JMeter desde: https://jmeter.apache.org/download_jmeter.cgi

### 2. Iniciar el servidor
```bash
npm run dev
```

El servidor debe estar ejecutándose en `http://localhost:3000`

### 3. Variables de entorno
- `BASE_URL`: http://localhost:3000
- `API_PREFIX`: /api

## 📁 Estructura del Plan de Pruebas

### Thread Group 1: Autenticación y Usuarios
- **1.1** Registrar Usuario (`POST /api/auth/register`)
- **1.2** Iniciar Sesión (`POST /api/auth/login`) 
- **1.3** Obtener Perfil (`GET /api/auth/profile`)

### Thread Group 2: Gestión de Juegos UNO
- **2.1** Crear Juego (`POST /api/game/create`)
- **2.2** Unirse a Juego (`POST /api/game/join`)
- **2.3** Iniciar Juego (`POST /api/game/start`)
- **2.4** Obtener Estado del Juego (`POST /api/game/state`)
- **2.5** Obtener Jugadores del Juego (`POST /api/game/players`)
- **2.6** Obtener Jugador Actual (`POST /api/game/current-player`)
- **2.7** Obtener Carta Superior (`POST /api/game/top-card`)
- **2.8** Obtener Puntuaciones (`POST /api/game/scores`)

### Thread Group 3: Acciones de Juego UNO
- **3.1** Distribuir Cartas (`POST /api/cards/deal`)
- **3.2** Siguiente Turno (`POST /api/nextTurn`)
- **3.3** Jugar Carta (`POST /api/playCard`)
- **3.4** Robar Carta (`POST /api/drawCard`)
- **3.5** Llamar UNO (`PATCH /api/uno/call`)
- **3.6** Desafiar UNO (`POST /api/uno/challenge`)

### Thread Group 4: Endpoints TypeORM
- **4.1** Obtener Todas las Cartas (`GET /api/cards`)
- **4.2** Obtener Cartas por Tipo (`GET /api/cards/type/NUMBER`)
- **4.3** Obtener Cartas por Color (`GET /api/cards/color/RED`)
- **4.4** Obtener Participantes del Juego (`GET /api/participants/games/{id}/participants`)
- **4.5** Obtener Estadísticas de Participante (`GET /api/participants/participants/{id}/stats`)
- **4.6** Obtener Leaderboard (`GET /api/participants/leaderboard`)
- **4.7** Obtener Puntuaciones TypeORM (`GET /api/scores`)
- **4.8** Obtener Juegos UNO (`GET /api/uno-games`)
- **4.9** Obtener Jugadores del Juego TypeORM (`GET /api/game-players`)

### Thread Group 5: Endpoints SOLID (Week07)
- **5.1** Crear Juego SOLID (`POST /api/uno-games/games`)
- **5.2** Obtener Estado del Juego SOLID (`GET /api/uno-games/games/{id}/state`)
- **5.3** Obtener Mano del Jugador (`GET /api/uno-games/games/{id}/hand`)
- **5.4** Obtener Historial del Juego (`GET /api/uno-games/games/{id}/history`)
- **5.5** Obtener Detalles del Juego (`GET /api/uno-games/games/{id}/details`)

## ⚡ Cómo Ejecutar las Pruebas

### Opción 1: Interfaz Gráfica (GUI)
1. Abrir JMeter
2. File → Open → Seleccionar `jmeter-test-plan.jmx`
3. Clic en **"Start"** (▶️) o usar **F5**
4. **Para ejecutar TODO: Hacer clic en "Run All"**

### Opción 2: Línea de Comandos (Headless)
```bash
# Navegar al directorio de JMeter
cd /path/to/jmeter/bin

# Ejecutar todas las pruebas
jmeter -n -t "D:\PROYECTOS\JALAU\PROGRA4\CAPSTONE\jmeter-test-plan.jmx" -l results.jtl -e -o report/

# Con parámetros personalizados
jmeter -n -t jmeter-test-plan.jmx -l results.jtl -Jserver.host=localhost -Jserver.port=3000
```

## 📊 Reportes y Visualización

El plan incluye varios listeners para monitoreo:

- **View Results Tree**: Detalles de cada request/response
- **Summary Report**: Resumen estadístico
- **View Results in Table**: Vista tabular de resultados
- **Graph Results**: Gráficos de rendimiento

## 🔧 Características Especiales

### Autenticación Automática
- Registro automático de usuario con datos aleatorios
- Login automático y extracción del token JWT
- Uso automático del token en endpoints que requieren autenticación

### Variables Dinámicas
- **userId**: Extraído automáticamente del registro
- **username**: Generado aleatoriamente
- **token**: JWT token para autenticación
- **gameId**: ID del juego creado automáticamente
- **solidGameId**: ID del juego SOLID creado

### Datos de Prueba
- Usuarios con nombres aleatorios (`testuser_1234`)
- Emails únicos (`testuser1234@test.com`)
- IDs de juego dinámicos
- Datos de cartas realistas (colores, tipos)

## 🎯 Validaciones Incluidas

- ✅ Status codes HTTP esperados
- ✅ Extracción de tokens y IDs
- ✅ Headers de autenticación automáticos
- ✅ Payloads JSON válidos
- ✅ Manejo de variables entre requests

## 🔍 Monitoreo de Resultados

### Durante la ejecución observa:
- **Response codes**: 200, 201, 401, etc.
- **Response times**: Tiempo de respuesta por endpoint
- **Throughput**: Requests por segundo
- **Errors**: Fallos y errores de conexión

### En caso de errores comunes:
- **401 Unauthorized**: Verificar que el servidor esté funcionando
- **404 Not Found**: Confirmar que los endpoints existen
- **500 Internal Server Error**: Revisar logs del servidor
- **Connection refused**: Asegurar que el servidor esté en puerto 3000

## 💡 Notas Importantes

1. **Orden de ejecución**: Los Thread Groups se ejecutan secuencialmente
2. **Dependencias**: Algunos endpoints dependen de datos creados en pasos anteriores
3. **Autenticación**: El token se reutiliza automáticamente
4. **Datos aleatorios**: Cada ejecución genera datos únicos
5. **Logs del servidor**: Revisar la consola del servidor para debugging

## 🎬 Para el Video de Demostración

1. Abrir JMeter
2. Cargar el archivo `jmeter-test-plan.jmx`
3. Asegurar que el servidor esté corriendo
4. **Hacer clic en "Start" o "Run All"**
5. Mostrar la ejecución automática de todos los 31 endpoints
6. Revisar los resultados en los diferentes listeners

¡El plan está listo para demostrar que todos los endpoints funcionan correctamente con un solo clic! 🚀