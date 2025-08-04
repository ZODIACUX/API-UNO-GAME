# 🃏 Guía Completa de Testing - Endpoints UNO API

## 📋 Información General

- **Base URL**: `http://localhost:3000/api/uno`
- **Autenticación**: JWT Bearer Token
- **Content-Type**: `application/json`
- **Método principal**: POST (para mantener compatibilidad con especificación)

---

## 🔐 1. Autenticación y Usuarios

### 1.1 Registrar Nuevo Usuario

**Endpoint**: `POST /api/uno/register`

**Request Body**:
```json
{
  "username": "example_user",
  "email": "example@example.com",
  "password": "password123"
}
```

**Response Exitoso (201)**:
```json
{
  "message": "User registered successfully"
}
```

**Response Error (400)**:
```json
{
  "error": "User already exists"
}
```

**Test con cURL**:
```bash
curl -X POST http://localhost:3000/api/uno/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "testuser@example.com",
    "password": "password123"
  }'
```

**Validaciones**:
- ✅ Username mínimo 3 caracteres, máximo 100
- ✅ Email formato válido, máximo 150 caracteres
- ✅ Password mínimo 6 caracteres
- ✅ Username y email únicos en la base de datos

---

### 1.2 Iniciar Sesión

**Endpoint**: `POST /api/uno/login`

**Request Body**:
```json
{
  "username": "example_user",
  "password": "password123"
}
```

**Response Exitoso (200)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDAwIiwidXNlcm5hbWUiOiJleGFtcGxlX3VzZXIiLCJpYXQiOjE3MDc3NDQwMDAsImV4cCI6MTcwNzgzMDQwMH0.xyz123"
}
```

**Response Error (401)**:
```json
{
  "error": "Invalid credentials"
}
```

**Test con cURL**:
```bash
curl -X POST http://localhost:3000/api/uno/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

**Validaciones**:
- ✅ Username requerido
- ✅ Password requerido
- ✅ Credenciales válidas en BD
- ✅ Usuario activo
- ✅ Token JWT válido generado

---

### 1.3 Obtener Perfil de Usuario

**Endpoint**: `GET /api/uno/profile` o `POST /api/uno/profile`

**Request Body (POST)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Request Header (GET)**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Exitoso (200)**:
```json
{
  "username": "example_user",
  "email": "example@example.com"
}
```

**Response Error (401)**:
```json
{
  "error": "Invalid credentials"
}
```

**Test con cURL (Header)**:
```bash
curl -X GET http://localhost:3000/api/uno/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Test con cURL (Body)**:
```bash
curl -X POST http://localhost:3000/api/uno/profile \
  -H "Content-Type: application/json" \
  -d '{
    "access_token": "YOUR_TOKEN_HERE"
  }'
```

**Validaciones**:
- ✅ Token válido requerido
- ✅ Usuario existe y está activo
- ✅ No expone información sensible (password)

---

### 1.4 Cerrar Sesión

**Endpoint**: `POST /api/uno/logout`

**Request Body**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Exitoso (200)**:
```json
{
  "message": "User logged out successfully"
}
```

**Test con cURL**:
```bash
curl -X POST http://localhost:3000/api/uno/logout \
  -H "Content-Type: application/json" \
  -d '{
    "access_token": "YOUR_TOKEN_HERE"
  }'
```

**Validaciones**:
- ✅ Token requerido
- ✅ Respuesta consistente independiente del token

---

## 🎮 2. Gestión de Juegos

### 2.1 Crear Nuevo Juego

**Endpoint**: `POST /api/uno/game/create`

**Request Body**:
```json
{
  "name": "Example Game",
  "rules": "Some rules for the game...",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Exitoso (201)**:
```json
{
  "message": "Game created successfully",
  "game_id": 12345
}
```

**Response Error (401)**:
```json
{
  "error": "Access token required"
}
```

**Test con cURL**:
```bash
curl -X POST http://localhost:3000/api/uno/game/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My UNO Game",
    "rules": "Standard UNO rules",
    "access_token": "YOUR_TOKEN_HERE"
  }'
```

**Validaciones**:
- ✅ Token válido requerido
- ✅ Nombre del juego requerido (3-100 caracteres)
- ✅ Reglas opcionales
- ✅ Usuario autenticado se convierte en creador
- ✅ Game ID numérico generado

---

### 2.2 Unirse a Juego Existente

**Endpoint**: `POST /api/uno/game/join`

**Request Body**:
```json
{
  "game_id": 12345,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Exitoso (200)**:
```json
{
  "message": "User joined the game successfully"
}
```

**Response Error (404)**:
```json
{
  "error": "Game not found"
}
```

**Response Error (400)**:
```json
{
  "error": "User already in game"
}
```

**Response Error (400)**:
```json
{
  "error": "Game already started or finished"
}
```

**Test con cURL**:
```bash
curl -X POST http://localhost:3000/api/uno/game/join \
  -H "Content-Type: application/json" \
  -d '{
    "game_id": 12345,
    "access_token": "YOUR_TOKEN_HERE"
  }'
```

**Validaciones**:
- ✅ Token válido requerido
- ✅ Game ID numérico requerido
- ✅ Juego debe existir
- ✅ Juego debe estar en estado "waiting"
- ✅ Usuario no puede estar ya en el juego

---

### 2.3 Iniciar Juego

**Endpoint**: `POST /api/uno/game/start`

**Request Body**:
```json
{
  "game_id": 12345,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Exitoso (200)**:
```json
{
  "message": "Game started successfully"
}
```

**Response Error (403)**:
```json
{
  "error": "Only game creator can start the game"
}
```

**Response Error (400)**:
```json
{
  "error": "Need at least 2 players to start"
}
```

**Test con cURL**:
```bash
curl -X POST http://localhost:3000/api/uno/game/start \
  -H "Content-Type: application/json" \
  -d '{
    "game_id": 12345,
    "access_token": "CREATOR_TOKEN_HERE"
  }'
```

**Validaciones**:
- ✅ Token válido requerido
- ✅ Solo el creador puede iniciar el juego
- ✅ Mínimo 2 jugadores para iniciar
- ✅ Juego cambia a estado "in_progress"

---

### 2.4 Abandonar Juego

**Endpoint**: `POST /api/uno/game/leave`

**Request Body**:
```json
{
  "game_id": 12345,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Exitoso (200)**:
```json
{
  "message": "User left the game successfully"
}
```

**Response Error (404)**:
```json
{
  "error": "User not in game"
}
```

**Test con cURL**:
```bash
curl -X POST http://localhost:3000/api/uno/game/leave \
  -H "Content-Type: application/json" \
  -d '{
    "game_id": 12345,
    "access_token": "YOUR_TOKEN_HERE"
  }'
```

**Validaciones**:
- ✅ Token válido requerido
- ✅ Usuario debe estar en el juego
- ✅ Usuario se elimina de participantes

---

### 2.5 Finalizar Juego

**Endpoint**: `POST /api/uno/game/end`

**Request Body**:
```json
{
  "game_id": 12345,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Exitoso (200)**:
```json
{
  "message": "Game ended successfully"
}
```

**Response Error (403)**:
```json
{
  "error": "Only game creator can end the game"
}
```

**Test con cURL**:
```bash
curl -X POST http://localhost:3000/api/uno/game/end \
  -H "Content-Type: application/json" \
  -d '{
    "game_id": 12345,
    "access_token": "CREATOR_TOKEN_HERE"
  }'
```

**Validaciones**:
- ✅ Token válido requerido
- ✅ Solo el creador puede finalizar el juego
- ✅ Juego cambia a estado "finished"

---

## 📊 3. Información del Juego

### 3.1 Obtener Estado del Juego

**Endpoint**: `POST /api/uno/game/state`

**Request Body**:
```json
{
  "game_id": 12345
}
```

**Response Exitoso (200)**:
```json
{
  "game_id": 12345,
  "state": "in_progress"
}
```

**Response Error (404)**:
```json
{
  "error": "Game not found"
}
```

**Test con cURL**:
```bash
curl -X POST http://localhost:3000/api/uno/game/state \
  -H "Content-Type: application/json" \
  -d '{
    "game_id": 12345
  }'
```

**Estados Posibles**:
- `waiting` - Esperando jugadores
- `in_progress` - Juego en curso
- `finished` - Juego terminado

**Validaciones**:
- ✅ Game ID requerido
- ✅ Juego debe existir
- ✅ Estado debe ser uno de los valores válidos

---

### 3.2 Obtener Lista de Jugadores

**Endpoint**: `POST /api/uno/game/players`

**Request Body**:
```json
{
  "game_id": 12345
}
```

**Response Exitoso (200)**:
```json
{
  "game_id": 12345,
  "players": ["Player1", "Player2", "Player3"]
}
```

**Test con cURL**:
```bash
curl -X POST http://localhost:3000/api/uno/game/players \
  -H "Content-Type: application/json" \
  -d '{
    "game_id": 12345
  }'
```

**Validaciones**:
- ✅ Game ID requerido
- ✅ Retorna array de nombres de usuario
- ✅ Lista actualizada de participantes activos

---

### 3.3 Obtener Jugador Actual

**Endpoint**: `POST /api/uno/game/current-player`

**Request Body**:
```json
{
  "game_id": 12345
}
```

**Response Exitoso (200)**:
```json
{
  "game_id": 12345,
  "current_player": "Player1"
}
```

**Test con cURL**:
```bash
curl -X POST http://localhost:3000/api/uno/game/current-player \
  -H "Content-Type: application/json" \
  -d '{
    "game_id": 12345
  }'
```

**Validaciones**:
- ✅ Game ID requerido
- ✅ Retorna nombre del jugador actual
- ✅ Jugador debe ser participante del juego

---

### 3.4 Obtener Carta Superior

**Endpoint**: `POST /api/uno/game/top-card`

**Request Body**:
```json
{
  "game_id": 12345
}
```

**Response Exitoso (200)**:
```json
{
  "game_id": 12345,
  "top_card": "Red 7"
}
```

**Test con cURL**:
```bash
curl -X POST http://localhost:3000/api/uno/game/top-card \
  -H "Content-Type: application/json" \
  -d '{
    "game_id": 12345
  }'
```

**Formatos de Carta**:
- Cartas numeradas: `"Red 5"`, `"Blue 0"`, `"Green 9"`
- Cartas especiales: `"Yellow Skip"`, `"Red Reverse"`, `"Blue Draw Two"`
- Cartas comodín: `"Wild"`, `"Wild Draw Four"`

**Validaciones**:
- ✅ Game ID requerido
- ✅ Retorna carta en formato string
- ✅ Carta representa el tope de la pila de descarte

---

### 3.5 Obtener Puntuaciones

**Endpoint**: `POST /api/uno/game/scores`

**Request Body**:
```json
{
  "game_id": 12345
}
```

**Response Exitoso (200)**:
```json
{
  "game_id": 12345,
  "scores": {
    "Player1": 100,
    "Player2": 75,
    "Player3": 120
  }
}
```

**Test con cURL**:
```bash
curl -X POST http://localhost:3000/api/uno/game/scores \
  -H "Content-Type: application/json" \
  -d '{
    "game_id": 12345
  }'
```

**Validaciones**:
- ✅ Game ID requerido
- ✅ Retorna objeto con jugador como clave y score como valor
- ✅ Scores son números enteros no negativos

---

## 🧪 4. Scripts de Testing Automatizado

### 4.1 Script Completo de Testing

```bash
#!/bin/bash
# save as test-uno-complete.sh

API_URL="http://localhost:3000/api/uno"
echo "🃏 Starting UNO API Complete Test Suite..."

# Variables
TIMESTAMP=$(date +%s)
USER1="player1_${TIMESTAMP}"
USER2="player2_${TIMESTAMP}"
EMAIL1="player1_${TIMESTAMP}@test.com"
EMAIL2="player2_${TIMESTAMP}@test.com"
PASSWORD="testpass123"

echo "👥 Test users: $USER1, $USER2"

# 1. Register users
echo "1️⃣ Registering users..."
curl -s -X POST $API_URL/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USER1\",\"email\":\"$EMAIL1\",\"password\":\"$PASSWORD\"}" | jq .

curl -s -X POST $API_URL/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USER2\",\"email\":\"$EMAIL2\",\"password\":\"$PASSWORD\"}" | jq .

# 2. Login users
echo "2️⃣ Logging in users..."
TOKEN1=$(curl -s -X POST $API_URL/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USER1\",\"password\":\"$PASSWORD\"}" | jq -r '.access_token')

TOKEN2=$(curl -s -X POST $API_URL/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USER2\",\"password\":\"$PASSWORD\"}" | jq -r '.access_token')

echo "🔑 Token1: ${TOKEN1:0:20}..."
echo "🔑 Token2: ${TOKEN2:0:20}..."

# 3. Get profiles
echo "3️⃣ Getting user profiles..."
curl -s -X POST $API_URL/profile \
  -H "Content-Type: application/json" \
  -d "{\"access_token\":\"$TOKEN1\"}" | jq .

# 4. Create game
echo "4️⃣ Creating game..."
GAME_RESPONSE=$(curl -s -X POST $API_URL/game/create \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Game ${TIMESTAMP}\",\"rules\":\"Test rules\",\"access_token\":\"$TOKEN1\"}")

GAME_ID=$(echo $GAME_RESPONSE | jq -r '.game_id')
echo "🎮 Game created: $GAME_ID"

# 5. Player2 joins game
echo "5️⃣ Player2 joining game..."
curl -s -X POST $API_URL/game/join \
  -H "Content-Type: application/json" \
  -d "{\"game_id\":$GAME_ID,\"access_token\":\"$TOKEN2\"}" | jq .

# 6. Get players
echo "6️⃣ Getting players..."
curl -s -X POST $API_URL/game/players \
  -H "Content-Type: application/json" \
  -d "{\"game_id\":$GAME_ID}" | jq .

# 7. Start game
echo "7️⃣ Starting game..."
curl -s -X POST $API_URL/game/start \
  -H "Content-Type: application/json" \
  -d "{\"game_id\":$GAME_ID,\"access_token\":\"$TOKEN1\"}" | jq .

# 8. Get game state
echo "8️⃣ Getting game state..."
curl -s -X POST $API_URL/game/state \
  -H "Content-Type: application/json" \
  -d "{\"game_id\":$GAME_ID}" | jq .

# 9. Get current player
echo "9️⃣ Getting current player..."
curl -s -X POST $API_URL/game/current-player \
  -H "Content-Type: application/json" \
  -d "{\"game_id\":$GAME_ID}" | jq .

# 10. Get top card
echo "🔟 Getting top card..."
curl -s -X POST $API_URL/game/top-card \
  -H "Content-Type: application/json" \
  -d "{\"game_id\":$GAME_ID}" | jq .

# 11. Get scores
echo "1️⃣1️⃣ Getting scores..."
curl -s -X POST $API_URL/game/scores \
  -H "Content-Type: application/json" \
  -d "{\"game_id\":$GAME_ID}" | jq .

# 12. End game
echo "1️⃣2️⃣ Ending game..."
curl -s -X POST $API_URL/game/end \
  -H "Content-Type: application/json" \
  -d "{\"game_id\":$GAME_ID,\"access_token\":\"$TOKEN1\"}" | jq .

# 13. Logout users
echo "1️⃣3️⃣ Logging out users..."
curl -s -X POST $API_URL/logout \
  -H "Content-Type: application/json" \
  -d "{\"access_token\":\"$TOKEN1\"}" | jq .

curl -s -X POST $API_URL/logout \
  -H "Content-Type: application/json" \
  -d "{\"access_token\":\"$TOKEN2\"}" | jq .

echo "✅ UNO API Complete Test Suite Finished!"
```

### 4.2 Script de Testing Individual

```bash
# Test individual de endpoint
test_endpoint() {
    local endpoint="$1"
    local method="$2"
    local data="$3"
    local expected_status="$4"
    
    echo "🧪 Testing: $method $endpoint"
    
    response=$(curl -s -w "%{http_code}" -X $method "$API_URL/$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data")
    
    status_code="${response: -3}"
    body="${response%???}"
    
    if [ "$status_code" -eq "$expected_status" ]; then
        echo "✅ PASS: Status $status_code"
        echo "📄 Response: $body" | jq . 2>/dev/null || echo "$body"
    else
        echo "❌ FAIL: Expected $expected_status, got $status_code"
        echo "📄 Response: $body"
    fi
    echo "---"
}

# Ejemplos de uso:
test_endpoint "register" "POST" '{"username":"test","email":"test@test.com","password":"123456"}' 201
test_endpoint "login" "POST" '{"username":"test","password":"123456"}' 200
```

---

## 📚 5. Casos de Prueba por Categoría

### 5.1 Tests de Autenticación

| Test Case | Endpoint | Expected Status | Description |
|-----------|----------|----------------|-------------|
| AUTH_001 | POST /register | 201 | Registro exitoso con datos válidos |
| AUTH_002 | POST /register | 400 | Error por usuario duplicado |
| AUTH_003 | POST /register | 400 | Error por email duplicado |
| AUTH_004 | POST /register | 400 | Error por datos inválidos |
| AUTH_005 | POST /login | 200 | Login exitoso con credenciales válidas |
| AUTH_006 | POST /login | 401 | Error por credenciales inválidas |
| AUTH_007 | POST /login | 401 | Error por usuario inexistente |
| AUTH_008 | GET /profile | 200 | Perfil obtenido con token válido |
| AUTH_009 | GET /profile | 401 | Error por token inválido |
| AUTH_010 | POST /logout | 200 | Logout exitoso |

### 5.2 Tests de Gestión de Juegos

| Test Case | Endpoint | Expected Status | Description |
|-----------|----------|----------------|-------------|
| GAME_001 | POST /game/create | 201 | Juego creado exitosamente |
| GAME_002 | POST /game/create | 401 | Error sin token |
| GAME_003 | POST /game/join | 200 | Usuario se une exitosamente |
| GAME_004 | POST /game/join | 404 | Error por juego inexistente |
| GAME_005 | POST /game/join | 400 | Error por usuario ya en juego |
| GAME_006 | POST /game/start | 200 | Juego iniciado exitosamente |
| GAME_007 | POST /game/start | 403 | Error por no ser creador |
| GAME_008 | POST /game/start | 400 | Error por pocos jugadores |
| GAME_009 | POST /game/leave | 200 | Usuario abandona exitosamente |
| GAME_010 | POST /game/end | 200 | Juego finalizado exitosamente |

### 5.3 Tests de Información del Juego

| Test Case | Endpoint | Expected Status | Description |
|-----------|----------|----------------|-------------|
| INFO_001 | POST /game/state | 200 | Estado obtenido correctamente |
| INFO_002 | POST /game/state | 404 | Error por juego inexistente |
| INFO_003 | POST /game/players | 200 | Lista de jugadores obtenida |
| INFO_004 | POST /game/current-player | 200 | Jugador actual obtenido |
| INFO_005 | POST /game/top-card | 200 | Carta superior obtenida |
| INFO_006 | POST /game/scores | 200 | Puntuaciones obtenidas |

---

## 🔍 6. Debugging y Troubleshooting

### 6.1 Errores Comunes

**Error 401 - Unauthorized**
```json
{
  "error": "Access token required"
}
```
- Verificar que el token esté incluido en el request
- Verificar que el token no haya expirado
- Verificar que el usuario esté activo

**Error 400 - Bad Request**
```json
{
  "error": "Validation error",
  "errors": ["Username is required"]
}
```
- Verificar que todos los campos requeridos estén presentes
- Verificar que los datos cumplan las validaciones

**Error 404 - Not Found**
```json
{
  "error": "Game not found"
}
```
- Verificar que el game_id exista
- Verificar que no se haya eliminado el juego

### 6.2 Herramientas de Debug

**Ver logs del servidor**:
```bash
# En desarrollo
npm run dev

# Ver logs específicos
tail -f logs/app.log
```

**Verificar base de datos**:
```sql
-- Ver usuarios
SELECT id, username, email, isActive FROM users;

-- Ver juegos
SELECT id, name, status, creatorId FROM uno_games;

-- Ver participantes
SELECT gameId, userId, username, isReady FROM game_participants;
```

**Test de conectividad**:
```bash
# Health check general
curl http://localhost:3000/api/health

# Test básico de endpoint
curl -X POST http://localhost:3000/api/uno/register \
  -H "Content-Type: application/json" \
  -d '{"username":"debug","email":"debug@test.com","password":"123456"}' \
  -v
```

---

## ✅ 7. Checklist de Testing Completo

### Pre-Testing
- [ ] Servidor corriendo en localhost:3000
- [ ] MySQL conectado y funcionando
- [ ] Variables de entorno configuradas (.env)
- [ ] JWT_SECRET configurado
- [ ] Base de datos inicializada

### Testing de Autenticación
- [ ] Registro de usuario nuevo
- [ ] Login con credenciales válidas
- [ ] Obtener perfil con token válido
- [ ] Manejo de errores de autenticación
- [ ] Logout exitoso

### Testing de Juegos
- [ ] Crear juego con usuario autenticado
- [ ] Segundo usuario se une al juego
- [ ] Iniciar juego con creador
- [ ] Obtener información del juego
- [ ] Finalizar juego

### Testing de Errores
- [ ] Registro con datos duplicados
- [ ] Login con credenciales inválidas
- [ ] Acceso sin token
- [ ] Operaciones con juego inexistente
- [ ] Operaciones sin permisos

### Post-Testing
- [ ] Limpieza de datos de prueba
- [ ] Verificación de logs
- [ ] Documentación de resultados

---

**🎉 ¡Con esta guía tienes todo lo necesario para testear completamente la API UNO!**