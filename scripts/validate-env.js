#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * Validates that all required environment variables are present
 */

require('dotenv').config()

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DB_HOST',
  'DB_USER', 
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
  'JWT_EXPIRES_IN'
]

const missingVars = []

console.log('🔍 Validating environment variables...')

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName)
  } else {
    console.log(`✅ ${varName}: OK`)
  }
})

if (missingVars.length > 0) {
  console.error('\n❌ Missing required environment variables:')
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`)
  })
  console.error('\nPlease check your .env file and ensure all required variables are set.')
  process.exit(1)
}

console.log('\n✅ All environment variables are valid!')