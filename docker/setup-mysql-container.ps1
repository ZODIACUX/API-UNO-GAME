Write-Host "Eliminando contenedor MySQL existente si existe..." -ForegroundColor Yellow
docker stop UNO-GAME 2>$null
docker rm UNO-GAME 2>$null

Write-Host "Eliminando volumen MySQL existente si existe..." -ForegroundColor Yellow
docker volume rm capstone_mysql_data 2>$null

Write-Host "Creando nuevo contenedor MySQL..." -ForegroundColor Green
docker run -d `
  --name UNO-GAME `
  -e MYSQL_ROOT_PASSWORD=rootpassword `
  -e MYSQL_DATABASE=game_management `
  -e MYSQL_USER=gameuser `
  -e MYSQL_PASSWORD=gamepassword `
  -p 3319:3306 `
  mysql:8.0

Write-Host "Esperando que MySQL se inicie..." -ForegroundColor Cyan
Start-Sleep -Seconds 30

Write-Host "Verificando estado del contenedor..." -ForegroundColor Cyan
docker ps

Write-Host ""
Write-Host "Contenedor MySQL creado exitosamente!" -ForegroundColor Green
Write-Host "Host: localhost" -ForegroundColor White
Write-Host "Puerto: 3319" -ForegroundColor White
Write-Host "Base de datos: game_management" -ForegroundColor White
Write-Host "Usuario: gameuser" -ForegroundColor White
Write-Host "Contraseña: gamepassword" -ForegroundColor White
Write-Host ""
Write-Host "Para conectarte: mysql -h localhost -P 3319 -u gameuser -p" -ForegroundColor Yellow