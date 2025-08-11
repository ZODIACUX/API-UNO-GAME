#!/bin/bash

echo "🎮 Configurando UNO Game API..."

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 16 o superior."
    exit 1
fi

# Verificar que MySQL esté instalado
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL no está instalado. Por favor instala MySQL 8.0 o superior."
    exit 1
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Verificar archivo .env
if [ ! -f .env ]; then
    echo "⚠️  Archivo .env no encontrado. Copiando desde .env.example..."
    cp .env.example .env
    echo "✏️  Por favor edita el archivo .env con tus configuraciones."
fi

# Crear base de datos (opcional)
echo "🗄️  ¿Deseas crear la base de datos? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "Creando base de datos uno_game..."
    mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS uno_game;"
    echo "✅ Base de datos creada."
fi

# Ejecutar migraciones
echo "🔄 Ejecutando migraciones..."
npm run migrate

# Ejecutar seeders
echo "🌱 Ejecutando seeders..."
npm run seed

echo "🎉 ¡Configuración completada!"
echo "🚀 Para iniciar el servidor ejecuta: npm run dev"

// scripts/reset-db.sh
#!/bin/bash

echo "⚠️  ¿Estás seguro de que quieres resetear la base de datos? (y/n)"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "🗄️  Reseteando base de datos..."
    
    # Eliminar y recrear base de datos
    mysql -u root -p -e "DROP DATABASE IF EXISTS uno_game; CREATE DATABASE uno_game;"
    
    # Ejecutar migraciones
    echo "🔄 Ejecutando migraciones..."
    npm run migrate
    
    # Ejecutar seeders
    echo "🌱 Ejecutando seeders..."
    npm run seed
    
    echo "✅ Base de datos reseteada correctamente."
else
    echo "❌ Operación cancelada."
fi
