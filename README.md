# Proyecto Capstone - UNO Game API

## 📋 Descripción del Proyecto

Este proyecto implementa una API completa para el juego UNO, desarrollada como parte del Proyecto Capstone. La implementación incluye todos los sistemas principales del juego, con especial énfasis en el **Sistema UNO Challenge (Requirement 5)** y el **Sistema UNO Call (Requirement 4)**.

## 🎯 Funcionalidades Principales

### ✅ Sistemas Implementados

1. **Sistema de Autenticación** - Registro, login y gestión de usuarios
2. **Sistema de Gestión de Juegos** - Crear, unirse, iniciar y finalizar juegos
3. **Sistema de Distribución de Cartas** - Distribución automática de cartas (Requirement 1)
4. **Sistema de Jugada de Cartas** - Lógica para jugar cartas (Requirement 2)
5. **Sistema de Robo de Cartas** - Mecánica para robar cartas (Requirement 3)
6. **Sistema UNO Call** - Llamar UNO cuando queda 1 carta (Requirement 4)
7. **Sistema UNO Challenge** - Challengear jugadores que no llamaron UNO (Requirement 5)

### 🎮 Sistema UNO Challenge (Requirement 5) - IMPLEMENTADO

El sistema permite a los jugadores challengear a otros que tienen una carta pero no han llamado UNO:

- **Validación de Challenges**: Verifica condiciones válidas para challenges
- **Penalización**: Aplica 2 cartas de penalización si el challenge es exitoso
- **Integración**: Se integra con el Sistema UNO Call para verificar el estado
- **Historial**: Mantiene registro de todos los challenges realizados
- **Funciones Recursivas**: Implementa procesamiento recursivo de múltiples challenges
- **Generadores**: Utiliza generadores para monitoreo continuo de oportunidades

## 🏗️ Arquitectura del Proyecto

### Principios SOLID Implementados

- **Single Responsibility**: Cada servicio tiene una responsabilidad específica
- **Open/Closed**: Extensible mediante plugins y interfaces
- **Liskov Substitution**: Implementación correcta de herencia
- **Interface Segregation**: Interfaces específicas y cohesivas
- **Dependency Inversion**: Inyección de dependencias implementada

### Patrones de Diseño

- **Result Monad**: Manejo consistente de errores
- **Repository Pattern**: Abstracción de acceso a datos
- **Service Layer**: Lógica de negocio encapsulada
- **Plugin Architecture**: Sistema extensible de reglas

## 📁 Estructura del Proyecto

```
capstone/
├── documents/
│   ├── POSTMAN_TESTING_GUIDE.md
│   └── collections/
│       └── UNO_Challenge_System_Postman_Collection.json
├── images/
├── src/
│   ├── controllers/
│   │   └── UnoController.js
│   ├── core/
│   │   └── services/
│   │       ├── UnoCallService.js
│   │       └── UnoChallengeService.js
│   ├── entities/
│   │   └── GamePlayer.js
│   ├── routes/
│   │   └── unoRoutes.js
│   ├── validation/
│   │   └── unoSchemas.js
│   ├── tests/
│   │   ├── test-uno-call.js
│   │   ├── test-uno-challenge.js
│   │   ├── test-uno-challenge-simple.js
│   │   └── test-uno-challenge-direct.js
│   └── app.js
├── tests/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js (v16 o superior)
- MySQL (v8.0 o superior)
- npm o yarn

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd capstone
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. **Configurar base de datos**
```bash
npm run setup:database
```

5. **Ejecutar migraciones**
```bash
npm run migrate
```

6. **Iniciar el servidor**
```bash
npm start
```

## 🧪 Testing

### Tests Automatizados

El proyecto incluye tests completos para el Sistema UNO Challenge:

```bash
# Ejecutar todos los tests
npm test

# Tests específicos del UNO Challenge System
node src/tests/test-uno-challenge.js
node src/tests/test-uno-challenge-simple.js
node src/tests/test-uno-challenge-direct.js
```

### Testing con Postman

1. **Importar la colección**
   - Archivo: `documents/collections/UNO_Challenge_System_Postman_Collection.json`

2. **Seguir la guía**
   - Documento: `documents/POSTMAN_TESTING_GUIDE.md`

3. **Ejecutar secuencia de tests**
   - 16 requests organizados en 6 categorías
   - Variables automáticas configuradas
   - Validación completa de todos los endpoints

## 📡 API Endpoints

### Sistema UNO Challenge (Requirement 5)

```http
POST /api/uno/challenge
Content-Type: application/json

{
  "challenger": "Player1",
  "challengedPlayer": "Player2"
}
```

**Respuestas:**

- **Challenge Exitoso (200)**:
```json
{
  "message": "Challenge successful. Player2 forgot to say UNO and draws 2 cards.",
  "nextPlayer": "Player3"
}
```

- **Challenge Fallido (400)**:
```json
{
  "message": "Challenge failed. Player2 said UNO on time."
}
```

### Sistema UNO Call (Requirement 4)

```http
PATCH /api/uno/call
Content-Type: application/json

{
  "player": "Player1",
  "action": "Say UNO"
}
```

## 🔧 Tecnologías Utilizadas

- **Backend**: Node.js, Express.js
- **Base de Datos**: MySQL, TypeORM
- **Validación**: Joi
- **Testing**: Jest, Postman
- **Arquitectura**: Clean Architecture, SOLID Principles
- **Patrones**: Repository, Service Layer, Result Monad

## 📊 Cobertura de Funcionalidades

- ✅ **Requirement 1**: Sistema de Distribución de Cartas
- ✅ **Requirement 2**: Sistema de Jugada de Cartas  
- ✅ **Requirement 3**: Sistema de Robo de Cartas
- ✅ **Requirement 4**: Sistema UNO Call
- ✅ **Requirement 5**: Sistema UNO Challenge

## 🎯 Sistema UNO Challenge - Detalles Técnicos

### Funcionalidades Principales

1. **Procesamiento de Challenges**
   - Validación de condiciones
   - Verificación de estado UNO
   - Aplicación de penalizaciones

2. **Integración con UNO Call**
   - Verificación automática de llamadas UNO
   - Sincronización de estados
   - Validación cruzada

3. **Funciones Recursivas**
   - Procesamiento de múltiples challenges
   - Monitoreo recursivo de oportunidades
   - Gestión de estados complejos

4. **Generadores**
   - Monitoreo continuo de oportunidades
   - Yield de eventos de challenge
   - Gestión eficiente de memoria

### Casos de Uso Cubiertos

- ✅ Challenge válido (jugador no llamó UNO)
- ✅ Challenge inválido (jugador sí llamó UNO)
- ✅ Auto-challenge (rechazado)
- ✅ Validación de entrada
- ✅ Manejo de errores
- ✅ Integración con sistema de turnos

## 📝 Documentación Adicional

- **Guía de Testing**: `documents/POSTMAN_TESTING_GUIDE.md`
- **Implementación SOLID**: `SOLID_PRINCIPLES_IMPLEMENTATION.md`
- **Distribución de Cartas**: `CARD_DISTRIBUTION_IMPLEMENTATION.md`
- **Guía de API**: `API-TESTING-GUIDE.md`

## 👥 Contribución

Este proyecto sigue las mejores prácticas de desarrollo:

- Código limpio y bien documentado
- Arquitectura escalable y mantenible
- Testing completo y automatizado
- Documentación exhaustiva

## 📄 Licencia

Proyecto académico - Universidad JALA

---

**Proyecto Capstone - Programación 4**  
**Sistema UNO Challenge (Requirement 5) - COMPLETAMENTE IMPLEMENTADO** ✅
