@echo off
echo Eliminando contenedor MySQL existente si existe...
docker stop UNO-GAME 2>nul
docker rm UNO-GAME 2>nul

echo Eliminando volumen MySQL existente si existe...
docker volume rm capstone_mysql_data 2>nul

echo Creando nuevo contenedor MySQL...
docker run -d ^
  --name UNO-GAME ^
  -e MYSQL_ROOT_PASSWORD=rootpassword ^
  -e MYSQL_DATABASE=game_management ^
  -e MYSQL_USER=gameuser ^
  -e MYSQL_PASSWORD=gamepassword ^
  -p 3319:3306 ^
  mysql:8.0

echo Esperando que MySQL se inicie...
timeout /t 30 /nobreak

echo Verificando estado del contenedor...
docker ps

echo.
echo Contenedor MySQL creado exitosamente!
echo Host: localhost
echo Puerto: 3319
echo Base de datos: game_management
echo Usuario: gameuser
echo Contraseña: gamepassword
echo.
echo Para conectarte: mysql -h localhost -P 3319 -u gameuser -p