const { exec } = require('child_process');

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stderr });
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

async function checkDocker() {
  try {
    console.log('🐳 Verificando estado de Docker...');
    
    // Verificar si Docker está disponible
    try {
      await runCommand('docker --version');
      console.log('✅ Docker está disponible');
    } catch (error) {
      console.log('❌ Docker no está disponible o no está instalado');
      return;
    }

    // Verificar contenedor UNO-GAME
    try {
      const containers = await runCommand('docker ps -a --filter name=UNO-GAME --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"');
      console.log('📋 Estado del contenedor UNO-GAME:');
      console.log(containers);
      
      // Verificar si está ejecutándose
      const runningContainers = await runCommand('docker ps --filter name=UNO-GAME --format "{{.Names}}"');
      if (runningContainers.includes('UNO-GAME')) {
        console.log('✅ Contenedor UNO-GAME está ejecutándose');
        
        // Verificar logs recientes
        const logs = await runCommand('docker logs --tail 5 UNO-GAME');
        console.log('📝 Logs recientes:');
        console.log(logs);
      } else {
        console.log('⚠️  Contenedor UNO-GAME no está ejecutándose');
        console.log('💡 Para iniciarlo: npm run docker:start');
      }
      
    } catch (error) {
      console.log('❌ Contenedor UNO-GAME no encontrado');
      console.log('💡 Puede que necesites crearlo primero');
    }

  } catch (error) {
    console.error('Error verificando Docker:', error.message);
  }
}

checkDocker();