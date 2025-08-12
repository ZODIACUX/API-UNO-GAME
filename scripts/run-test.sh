#!/bin/bash

echo "🧪 Ejecutando tests del proyecto UNO Game API..."

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado."
    exit 1
fi

# Verificar que las dependencias estén instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Verificar archivo .env.test
if [ ! -f .env.test ]; then
    echo "⚠️  Archivo .env.test no encontrado. Creando desde ejemplo..."
    cp .env.example .env.test
    echo "✏️  Edita .env.test con la configuración de base de datos de test."
fi

# Ejecutar tests de base de datos
echo "🗄️  Probando conexión a base de datos de test..."
NODE_ENV=test node test-connection.js

if [ $? -ne 0 ]; then
    echo "❌ Error de conexión a base de datos de test."
    exit 1
fi

# Ejecutar migraciones en base de datos de test
echo "🔄 Ejecutando migraciones en base de datos de test..."
NODE_ENV=test npm run migrate

# Ejecutar tests por categoría
echo "🧪 Ejecutando tests unitarios..."

echo "📋 Tests CRUD - Gestión de Jugadores..."
npm test -- tests/unit/crud/player.crud.test.js

echo "🎮 Tests CRUD - Administración de Juegos..."
npm test -- tests/unit/crud/game.crud.test.js

echo "🃏 Tests CRUD - Administración de Tarjetas..."
npm test -- tests/unit/crud/card.crud.test.js

echo "🏆 Tests CRUD - Gestión de Scores..."
npm test -- tests/unit/crud/score.crud.test.js

echo "🗄️  Tests de Interacción con Base de Datos..."
npm test -- tests/unit/crud/database.interaction.test.js

echo "🔐 Tests de Autenticación..."
npm test -- tests/unit/auth/authentication.test.js

echo "🎯 Tests de Funcionalidad de Juego..."
npm test -- tests/unit/game/game.functionality.test.js

# Ejecutar tests de integración
echo "🔗 Tests de Integración..."
npm test -- tests/integration/

# Generar reporte de cobertura
echo "📊 Generando reporte de cobertura..."
npm run test:coverage

echo "✅ ¡Tests completados!"
echo "📋 Revisa el reporte de cobertura en coverage/lcov-report/index.html"