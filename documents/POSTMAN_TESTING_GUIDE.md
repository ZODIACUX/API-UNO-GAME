# Guía de Testeo con Postman - Sistema UNO Challenge

## 📋 Descripción General

Esta guía te ayudará a testear completamente el **Sistema UNO Challenge (Requirement 5)** y el **Sistema UNO Call (Requirement 4)** usando la colección de Postman proporcionada.

## 🚀 Configuración Inicial

### 1. Importar la Colección
1. Abre Postman
2. Haz clic en "Import"
3. Selecciona el archivo `UNO_Challenge_System_Postman_Collection.json`
4. La colección se importará con todas las variables configuradas

### 2. Variables de Entorno
La colección incluye estas variables automáticas:
- `base_url`: http://localhost:3000/api
- `access_token`: Se llena automáticamente al hacer login
- `game_id`: Se llena automáticamente al crear un juego

### 3. Verificar que el Servidor Esté Corriendo
Asegúrate de que el servidor esté ejecutándose:
```bash
npm start
```

## 📝 Secuencia de Testeo Recomendada

### Paso 1: Autenticación
Ejecuta en orden:

1. **Register User 1 (Challenger)**
   - Registra el primer usuario que hará los challenges
   - Respuesta esperada: `201 Created`

2. **Register User 2 (Challenged)**
   - Registra el segundo usuario que será challengeado
   - Respuesta esperada: `201 Created`

3. **Login User 1 (Challenger)**
   - Inicia sesión y guarda el token automáticamente
   - Respuesta esperada: `200 OK` con `access_token`

### Paso 2: Configuración del Juego
Ejecuta en orden:

4. **Create Game**
   - Crea un nuevo juego UNO
   - El `game_id` se guarda automáticamente
   - Respuesta esperada: `201 Created`

5. **Join Game (User 2)**
   - El segundo usuario se une al juego
   - Respuesta esperada: `200 OK`

6. **Start Game**
   - Inicia el juego
   - Respuesta esperada: `200 OK`

### Paso 3: Testear Sistema UNO Call (Requirement 4)

7. **Call UNO - Valid**
   - Prueba una llamada UNO válida
   - Respuesta esperada: `200 OK` o mensaje apropiado según el estado del juego

8. **Call UNO - Invalid Action**
   - Prueba con una acción inválida
   - Respuesta esperada: `400 Bad Request`

9. **Call UNO - Missing Player**
   - Prueba sin especificar jugador
   - Respuesta esperada: `400 Bad Request`

### Paso 4: Testear Sistema UNO Challenge (Requirement 5)

10. **Challenge UNO - Valid Challenge**
    - Prueba un challenge válido
    - Respuesta esperada: Depende del estado del juego
    - Posibles respuestas:
      - `200 OK`: Challenge exitoso
      - `400 Bad Request`: Challenge fallido
      - `404 Not Found`: No hay juego activo

11. **Challenge UNO - Self Challenge (Invalid)**
    - Prueba un jugador challengeándose a sí mismo
    - Respuesta esperada: `400 Bad Request`

12. **Challenge UNO - Missing Challenger**
    - Prueba sin especificar challenger
    - Respuesta esperada: `400 Bad Request`

13. **Challenge UNO - Missing Challenged Player**
    - Prueba sin especificar jugador challengeado
    - Respuesta esperada: `400 Bad Request`

14. **Challenge UNO - Empty Challenger**
    - Prueba con challenger vacío
    - Respuesta esperada: `400 Bad Request`

15. **Challenge UNO - Empty Body**
    - Prueba con cuerpo vacío
    - Respuesta esperada: `400 Bad Request`

## 🔍 Casos de Prueba Específicos

### Validación de Entrada (Joi Schema)
- ✅ Campos requeridos presentes
- ✅ Tipos de datos correctos
- ✅ Longitud de strings válida
- ✅ Valores permitidos para `action`

### Lógica de Negocio
- ✅ No permitir auto-challenges
- ✅ Validar existencia de jugadores
- ✅ Verificar estado del juego
- ✅ Aplicar penalizaciones correctamente

### Integración con UNO Call System
- ✅ Verificar si el jugador llamó UNO
- ✅ Aplicar penalización si no llamó UNO
- ✅ Rechazar challenge si sí llamó UNO

## 📊 Respuestas Esperadas

### Challenge Exitoso
```json
{
  "message": "Challenge successful. challenged1 forgot to say UNO and draws 2 cards.",
  "nextPlayer": "challenger1"
}
```

### Challenge Fallido
```json
{
  "message": "Challenge failed. challenged1 said UNO on time."
}
```

### Error de Validación
```json
{
  "error": "Validation error",
  "details": ["\"challenger\" is required"]
}
```

### No Hay Juego Activo
```json
{
  "message": "No active game found"
}
```

## 🐛 Troubleshooting

### Problema: "No active game found"
**Solución**: Asegúrate de haber ejecutado la secuencia completa de configuración del juego.

### Problema: Token expirado
**Solución**: Ejecuta nuevamente "Login User 1" para obtener un nuevo token.

### Problema: Error 500
**Solución**: Verifica que la base de datos esté funcionando y que el servidor esté corriendo correctamente.

### Problema: Validación falla
**Solución**: Verifica que el JSON esté bien formateado y contenga todos los campos requeridos.

## 📈 Métricas de Éxito

Para considerar el testeo exitoso, debes verificar:

- ✅ Todos los endpoints responden correctamente
- ✅ La validación Joi funciona para todos los casos
- ✅ Los challenges válidos se procesan correctamente
- ✅ Los challenges inválidos se rechazan apropiadamente
- ✅ La integración con el sistema UNO Call funciona
- ✅ Las penalizaciones se aplican correctamente
- ✅ El historial de challenges se mantiene

## 🎯 Endpoints Principales

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| PATCH | `/uno/call` | Llamar UNO (Requirement 4) |
| POST | `/uno/challenge` | Challengear UNO (Requirement 5) |
| POST | `/game/create` | Crear juego |
| POST | `/game/start` | Iniciar juego |
| POST | `/register` | Registrar usuario |
| POST | `/login` | Iniciar sesión |

## 🔧 Configuración Avanzada

### Variables Personalizadas
Puedes modificar estas variables en Postman:
- `base_url`: Cambiar si usas otro puerto
- `access_token`: Usar token específico si es necesario
- `game_id`: Usar ID de juego específico

### Scripts de Prueba Automática
La colección incluye scripts que:
- Guardan automáticamente tokens de acceso
- Extraen y guardan IDs de juego
- Validan respuestas básicas

¡Listo para testear el Sistema UNO Challenge completo! 🎮