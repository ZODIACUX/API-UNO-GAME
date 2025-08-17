# Instrucciones para Configurar Docker y MySQL

## Paso 1: Iniciar Docker Desktop
1. Presiona `Windows + R`
2. Escribe `Docker Desktop` y presiona Enter
3. O busca "Docker Desktop" en el menú de inicio y ábrelo
4. Espera a que Docker Desktop se inicie completamente (verás el ícono en la bandeja del sistema)

## Paso 2: Verificar que Docker está funcionando
Ejecuta en la terminal:
```bash
docker ps
```
Si funciona, deberías ver una lista (puede estar vacía).

## Paso 3: Crear el contenedor MySQL
Una vez que Docker esté funcionando, ejecuta uno de estos comandos:

### Opción A: Script de PowerShell
```powershell
powershell -ExecutionPolicy Bypass -File setup-mysql-container.ps1
```

### Opción B: Script de Batch
```cmd
setup-mysql-container.bat
```

### Opción C: Comando manual
```bash
docker run -d --name UNO-GAME -e MYSQL_ROOT_PASSWORD=rootpassword -e MYSQL_DATABASE=game_management -e MYSQL_USER=gameuser -e MYSQL_PASSWORD=gamepassword -p 3319:3306 mysql:8.0
```

## Paso 4: Verificar la conexión
```bash
node test-db-connection.js
```

## Paso 5: Iniciar el servidor
```bash
npm start
```

## Configuración actual del .env:
- Host: localhost
- Puerto: 3319
- Usuario: gameuser
- Contraseña: gamepassword
- Base de datos: game_management

## Solución de problemas:
- Si Docker no inicia, reinicia tu computadora
- Si el puerto 3319 está ocupado, cambia el puerto en docker-compose.yml
- Si hay errores de permisos, ejecuta la terminal como administrador