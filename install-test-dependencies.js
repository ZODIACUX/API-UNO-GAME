const { execSync } = require('child_process')
const fs = require('fs')

console.log('🔧 Verificando dependencias para pruebas de API...')

// Verificar si axios está instalado
try {
  require('axios')
  console.log('✅ axios ya está instalado')
} catch (error) {
  console.log('📦 Instalando axios...')
  try {
    execSync('npm install axios', { stdio: 'inherit' })
    console.log('✅ axios instalado correctamente')
  } catch (installError) {
    console.error('❌ Error instalando axios:', installError.message)
    process.exit(1)
  }
}

// Verificar si dotenv está instalado
try {
  require('dotenv')
  console.log('✅ dotenv ya está instalado')
} catch (error) {
  console.log('📦 Instalando dotenv...')
  try {
    execSync('npm install dotenv', { stdio: 'inherit' })
    console.log('✅ dotenv instalado correctamente')
  } catch (installError) {
    console.error('❌ Error instalando dotenv:', installError.message)
    process.exit(1)
  }
}

// Verificar archivo .env
if (!fs.existsSync('.env')) {
  console.log('⚠️  Archivo .env no encontrado')
  console.log('💡 Asegúrate de tener configurado el archivo .env con las credenciales de la base de datos')
} else {
  console.log('✅ Archivo .env encontrado')
}

console.log('\n🎉 ¡Todas las dependencias están listas!')
console.log('\n📋 Comandos disponibles:')
console.log('  node test-api-endpoints.js                    - Ejecutar pruebas con Node.js')
console.log('  powershell -File test-api-endpoints.ps1       - Ejecutar pruebas con PowerShell')
console.log('  bash test-api-endpoints.sh                    - Ejecutar pruebas con Bash')
console.log('\n📖 Para más información, consulta: API-TESTING-GUIDE.md')
