const requiredEnvVars = [
  'DB_HOST',
  'DB_PORT', 
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_NAME',
  'PORT',
  'NODE_ENV',
  'JWT_SECRET'
];

const optionalEnvVars = [
  'RATE_LIMIT_WINDOW_MS',
  'RATE_LIMIT_MAX_REQUESTS',
  'CORS_ORIGIN',
  'LOG_LEVEL',
  'LOG_FILE'
];

function validateEnvironment() {
  const missing = [];
  const warnings = [];

  // Verificar variables requeridas
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // Verificar variables opcionales
  optionalEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  });

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Optional environment variables not set (using defaults):');
    warnings.forEach(varName => {
      console.warn(`   - ${varName}`);
    });
  }

  // Validaciones específicas
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.error('❌ JWT_SECRET must be at least 32 characters long');
    process.exit(1);
  }

  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET === 'your_super_secret_jwt_key_here_change_in_production_min_32_chars') {
    console.error('❌ JWT_SECRET must be changed in production environment');
    process.exit(1);
  }

  console.log('✅ Environment variables validated successfully');
}

module.exports = { validateEnvironment };

// Si se ejecuta directamente
if (require.main === module) {
  require('dotenv').config();
  validateEnvironment();
}