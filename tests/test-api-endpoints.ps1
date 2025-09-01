# Script para testear todos los endpoints de la UNO Game API
param(
    [string]$BaseUrl = "http://localhost:3000/api",
    [string]$HealthUrl = "http://localhost:3000/health"
)

$Global:AuthToken = ""
$Global:TestUserId = ""
$Global:TestGameId = ""

# Colores para output
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Body = $null,
        [bool]$UseAuth = $false,
        [string]$Description = ""
    )
    
    $headers = @{ "Content-Type" = "application/json" }
    if ($UseAuth -and $Global:AuthToken) {
        $headers["Authorization"] = "Bearer $Global:AuthToken"
    }
    
    try {
        $params = @{
            Uri = "$BaseUrl$Endpoint"
            Method = $Method
            Headers = $headers
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-RestMethod @params
        Write-Success "$Method $Endpoint - $Description"
        return @{ Success = $true; Data = $response }
    }
    catch {
        Write-Error "$Method $Endpoint - $Description"
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

function Test-HealthEndpoint {
    Write-Info "`n=== TESTING HEALTH ENDPOINT ==="
    
    try {
        $response = Invoke-RestMethod -Uri $HealthUrl -Method GET
        Write-Success "GET /health - Server health check"
        Write-Host "   Status: $($response.status)" -ForegroundColor Blue
    }
    catch {
        Write-Error "GET /health - Server health check"
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Test-RootEndpoint {
    Write-Info "`n=== TESTING ROOT ENDPOINT ==="
    
    $result = Test-Endpoint -Method "GET" -Endpoint "/" -Description "Get available endpoints"
    if ($result.Success) {
        Write-Host "   Available endpoints: $($result.Data.availableEndpoints.Count)" -ForegroundColor Blue
    }
}

function Test-AuthEndpoints {
    Write-Info "`n=== TESTING AUTH ENDPOINTS ==="
    
    # Generate unique test user
    $timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
    $testUser = @{
        username = "testuser_$timestamp"
        email = "test_$timestamp@example.com"
        password = "testpassword123"
    } | ConvertTo-Json
    
    # Test registration
    $registerResult = Test-Endpoint -Method "POST" -Endpoint "/auth/register" -Body $testUser -Description "Register new user"
    if ($registerResult.Success) {
        $Global:TestUserId = $registerResult.Data.userId
    }
    
    # Test login
    $loginData = @{
        username = "testuser_$timestamp"
        password = "testpassword123"
    } | ConvertTo-Json
    
    $loginResult = Test-Endpoint -Method "POST" -Endpoint "/auth/login" -Body $loginData -Description "User login"
    if ($loginResult.Success) {
        $Global:AuthToken = $loginResult.Data.access_token
        Write-Host "   Token obtained: $($Global:AuthToken -ne '')" -ForegroundColor Blue
    }
    
    # Test get profile (requires auth)
    Test-Endpoint -Method "GET" -Endpoint "/auth/profile" -UseAuth $true -Description "Get user profile"
    
    # Test logout
    Test-Endpoint -Method "POST" -Endpoint "/auth/logout" -UseAuth $true -Description "User logout"
}

function Test-CardEndpoints {
    Write-Info "`n=== TESTING CARD ENDPOINTS ==="
    
    # Get all cards
    Test-Endpoint -Method "GET" -Endpoint "/cards" -UseAuth $true -Description "Get all cards"
    
    # Create a new card
    $cardData = @{
        type = "NUMBER"
        color = "RED"
        value = "5"
    } | ConvertTo-Json
    
    Test-Endpoint -Method "POST" -Endpoint "/cards" -Body $cardData -UseAuth $true -Description "Create new card"
    
    # Get cards by type
    Test-Endpoint -Method "GET" -Endpoint "/cards/type/NUMBER" -UseAuth $true -Description "Get cards by type"
    
    # Get cards by color
    Test-Endpoint -Method "GET" -Endpoint "/cards/color/RED" -UseAuth $true -Description "Get cards by color"
    
    # Create batch cards
    $batchData = @{
        cards = @(
            @{ type = "NUMBER"; color = "BLUE"; value = "3" },
            @{ type = "NUMBER"; color = "GREEN"; value = "7" }
        )
    } | ConvertTo-Json -Depth 3
    
    Test-Endpoint -Method "POST" -Endpoint "/cards/batch" -Body $batchData -UseAuth $true -Description "Create batch cards"
}

function Test-UnoGameEndpoints {
    Write-Info "`n=== TESTING UNO GAME ENDPOINTS ==="
    
    # Get all games
    Test-Endpoint -Method "GET" -Endpoint "/uno-games/games" -UseAuth $true -Description "Get all games"
    
    # Create a new game
    $gameData = @{
        name = "Test Game $(Get-Date -Format 'yyyyMMdd_HHmmss')"
        maxPlayers = 4
    } | ConvertTo-Json
    
    $createResult = Test-Endpoint -Method "POST" -Endpoint "/uno-games/games" -Body $gameData -UseAuth $true -Description "Create new game"
    if ($createResult.Success) {
        $Global:TestGameId = $createResult.Data.id
    }
    
    # Get active games
    Test-Endpoint -Method "GET" -Endpoint "/uno-games/games/active" -UseAuth $true -Description "Get active games"
    
    # Get specific game
    if ($Global:TestGameId) {
        Test-Endpoint -Method "GET" -Endpoint "/uno-games/games/$Global:TestGameId" -UseAuth $true -Description "Get specific game"
        
        # Start game
        Test-Endpoint -Method "POST" -Endpoint "/uno-games/games/$Global:TestGameId/start" -UseAuth $true -Description "Start game"
        
        # Draw card
        Test-Endpoint -Method "POST" -Endpoint "/uno-games/games/$Global:TestGameId/draw" -UseAuth $true -Description "Draw card"
    }
}

function Test-GamePlayerEndpoints {
    Write-Info "`n=== TESTING GAME PLAYER ENDPOINTS ==="
    
    if (-not $Global:TestGameId) {
        Write-Warning "Skipping game player tests - no test game available"
        return
    }
    
    # Join game
    Test-Endpoint -Method "POST" -Endpoint "/game-players/$Global:TestGameId/join" -UseAuth $true -Description "Join game"
    
    # Get game players
    Test-Endpoint -Method "GET" -Endpoint "/game-players/$Global:TestGameId/players" -UseAuth $true -Description "Get game players"
    
    # Set ready status
    $readyData = @{ ready = $true } | ConvertTo-Json
    Test-Endpoint -Method "PUT" -Endpoint "/game-players/$Global:TestGameId/ready" -Body $readyData -UseAuth $true -Description "Set ready status"
    
    # Leave game
    Test-Endpoint -Method "POST" -Endpoint "/game-players/$Global:TestGameId/leave" -UseAuth $true -Description "Leave game"
}

function Test-ParticipantEndpoints {
    Write-Info "`n=== TESTING PARTICIPANT ENDPOINTS ==="
    
    # Get leaderboard
    Test-Endpoint -Method "GET" -Endpoint "/participants/leaderboard" -Description "Get leaderboard"
    
    # Get participant stats
    if ($Global:TestUserId) {
        Test-Endpoint -Method "GET" -Endpoint "/participants/participants/$Global:TestUserId/stats" -Description "Get participant stats"
    }
    
    # Join game as participant
    if ($Global:TestGameId) {
        Test-Endpoint -Method "POST" -Endpoint "/participants/games/$Global:TestGameId/join" -UseAuth $true -Description "Join game as participant"
        
        # Get game participants
        Test-Endpoint -Method "GET" -Endpoint "/participants/games/$Global:TestGameId/participants" -Description "Get game participants"
        
        # Leave game as participant
        Test-Endpoint -Method "DELETE" -Endpoint "/participants/games/$Global:TestGameId/leave" -UseAuth $true -Description "Leave game as participant"
    }
}

function Test-ScoreEndpoints {
    Write-Info "`n=== TESTING SCORE ENDPOINTS ==="
    
    # Get high scores
    Test-Endpoint -Method "GET" -Endpoint "/scores/scores/high-scores" -Description "Get high scores"
    
    if ($Global:TestGameId) {
        # Get game scores
        Test-Endpoint -Method "GET" -Endpoint "/scores/games/$Global:TestGameId/scores" -Description "Get game scores"
        
        # Create score
        $scoreData = @{
            participantId = $Global:TestUserId
            score = 100
            position = 1
        } | ConvertTo-Json
        
        $createScoreResult = Test-Endpoint -Method "POST" -Endpoint "/scores/games/$Global:TestGameId/scores" -Body $scoreData -UseAuth $true -Description "Create score"
        
        # Calculate final scores
        Test-Endpoint -Method "POST" -Endpoint "/scores/games/$Global:TestGameId/calculate-scores" -UseAuth $true -Description "Calculate final scores"
    }
    
    if ($Global:TestUserId) {
        # Get participant scores
        Test-Endpoint -Method "GET" -Endpoint "/scores/participants/$Global:TestUserId/scores" -Description "Get participant scores"
    }
}

# Main execution
function Start-ApiTests {
    Write-Host "🚀 STARTING UNO GAME API ENDPOINT TESTS" -ForegroundColor Cyan
    Write-Host "Base URL: $BaseUrl" -ForegroundColor Blue
    Write-Host "Health URL: $HealthUrl" -ForegroundColor Blue
    Write-Host "=" * 60 -ForegroundColor Cyan
    
    try {
        Test-HealthEndpoint
        Test-RootEndpoint
        Test-AuthEndpoints
        Test-CardEndpoints
        Test-UnoGameEndpoints
        Test-GamePlayerEndpoints
        Test-ParticipantEndpoints
        Test-ScoreEndpoints
        
        Write-Host "`n🎉 ALL TESTS COMPLETED!" -ForegroundColor Green
        Write-Host "Check the results above for any failed endpoints." -ForegroundColor Blue
        
        if ($Global:AuthToken) {
            Write-Host "`nAuth Token for manual testing:" -ForegroundColor Yellow
            Write-Host $Global:AuthToken -ForegroundColor White
        }
    }
    catch {
        Write-Host "`n❌ Test suite failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Run tests
Start-ApiTests