# Capstone - UNO Game API

## Descripción
API REST para el juego de cartas UNO desarrollada como proyecto capstone. Esta aplicación permite crear y gestionar partidas de UNO multijugador con funcionalidades completas del juego tradicional.

## Características
- Sistema de autenticación JWT
- Gestión de usuarios y partidas
- Lógica completa del juego UNO
- API RESTful con validación de datos
- Base de datos MySQL con TypeORM
- Pruebas unitarias e integración
- Documentación de API con Postman

## Tecnologías Utilizadas
- **Backend**: Node.js, Express.js
- **Base de Datos**: MySQL
- **ORM**: TypeORM
- **Autenticación**: JWT (JSON Web Tokens)
- **Validación**: Joi
- **Testing**: Jest
- **Documentación**: Postman Collections

## Estructura del Proyecto
```
capstone/
|-- documents/
|    |-- collections/
|    |    |-- UNO-Game-API-VERIFIED-Collection.json
|-- images/
|    |-- (capturas de pantalla y diagramas)
|-- src/
|    |-- controllers/
|    |-- middleware/
|    |-- models/
|    |-- routes/
|    |-- services/
|    |-- utils/
|    |-- config/
|    |-- tests/
|    |-- app.js
|    |-- server.js
|-- .env
|-- .gitignore
|-- package.json
|-- package-lock.json
|-- README.md
```

## Instalación

### Prerrequisitos
- Node.js >= 16.0.0
- MySQL >= 8.0
- npm >= 8.0.0

### Pasos de Instalación
1. Clonar el repositorio:
```bash
git clone https://gitlab.com/[usuario]/capstone.git
cd capstone
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. Configurar base de datos:
```bash
npm run setup-db
```

5. Ejecutar migraciones:
```bash
npm run migrate
```

## Uso

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

### Testing
```bash
# Ejecutar todas las pruebas
npm test

# Pruebas con cobertura
npm run test:coverage

# Pruebas unitarias
npm run test:unit
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### Usuarios
- `GET /api/users` - Obtener usuarios
- `GET /api/users/:id` - Obtener usuario por ID

### Juegos
- `POST /api/games` - Crear nueva partida
- `GET /api/games` - Obtener partidas
- `POST /api/games/:id/join` - Unirse a partida
- `POST /api/games/:id/play` - Jugar carta

## Documentación de API
La documentación completa de la API está disponible en las colecciones de Postman ubicadas en `documents/collections/`.

## Testing
El proyecto incluye pruebas unitarias e integración:
- Cobertura mínima: 60%
- Framework: Jest
- Configuración en `package.json`

## Contribución
Este es un proyecto académico desarrollado como capstone. Para contribuir:
1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Autor
**Juan Pavas** - Estudiante JALAU
- Email: [tu-email@jala.university]
- GitLab: [@juan-pavas-semetre-5]

## Licencia
Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## Estado del Proyecto
🚧 **En Desarrollo Activo** - Proyecto capstone en progreso

### Funcionalidades Completadas
- ✅ Sistema de autenticación
- ✅ Gestión de usuarios
- ✅ CRUD de partidas
- ✅ Lógica básica del juego
- ✅ Pruebas unitarias

### Próximas Funcionalidades
- 🔄 Lógica avanzada del juego
- 🔄 Sistema de puntuación
- 🔄 Multijugador en tiempo real
- 🔄 Interfaz web

## Notas de Desarrollo
- Todas las entregas se realizan mediante Pull Requests
- Seguimiento de progreso incremental
- Documentación actualizada en cada iteración
