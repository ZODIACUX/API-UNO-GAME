require('dotenv').config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const requiredEnvVars = [
  'NODE_ENV',
  'DB_HOST',
  'DB_PORT', 
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET'
];

const optionalEnvVars = [
  'PORT',
  'RATE_LIMIT_WINDOW_MS',
  'RATE_LIMIT_MAX_REQUESTS',
  'CORS_ORIGIN',
  'LOG_LEVEL',
  'LOG_FILE'
];

function validateEnvironment() {
  const missing = [];
  const warnings = [];

  console.log(`🔍 Validando variables de entorno (${process.env.NODE_ENV})...`);

  // Verificar variables requeridas
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    } else {
      console.log(`✅ ${varName}: ${varName === 'JWT_SECRET' || varName.includes('PASSWORD') ? '***' : process.env[varName]}`);
    }
  });

  // Verificar variables opcionales
  optionalEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(varName);
    } else {
      console.log(`✅ ${varName}: ${process.env[varName]}`);
    }
  });

  if (missing.length > 0) {
    console.error('❌ Variables de entorno faltantes:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    
    console.error('\n💡 Soluciones:');
    console.error('1. Crea el archivo .env.test con las variables necesarias');
    console.error('2. Copia .env.example a .env.test si existe');
    console.error('3. Verifica que las variables estén definidas correctamente');
    
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Variables opcionales no definidas (usando valores por defecto):');
    warnings.forEach(varName => {
      console.warn(`   - ${varName}`);
    });
  }

  // Validaciones específicas
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.error('❌ JWT_SECRET debe tener al menos 32 caracteres');
    process.exit(1);
  }

  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.includes('test')) {
    console.error('❌ JWT_SECRET de test no debe usarse en producción');
    process.exit(1);
  }

  // Validar puerto
  const port = parseInt(process.env.PORT);
  if (port && (port < 1000 || port > 65535)) {
    console.error('❌ PORT debe estar entre 1000 y 65535');
    process.exit(1);
  }

  console.log('✅ Validación de variables de entorno completada');
  return true;
}

// Si se ejecuta directamente
if (require.main === module) {
  validateEnvironment();
}

module.exports = { validateEnvironment };