bas#!/bin/bash

# Script para testear todos los endpoints de la UNO Game API
BASE_URL="${1:-http://localhost:3000/api}"
HEALTH_URL="${2:-http://localhost:3000/health}"

# Variables globales
AUTH_TOKEN=""
TEST_USER_ID=""
TEST_GAME_ID=""
TIMESTAMP=$(date +%s)

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Funciones de logging
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_info() { echo -e "${CYAN}ℹ️  $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# Función para testear endpoints
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local use_auth=$4
    local description=$5
    
    local headers="Content-Type: application/json"
    if [ "$use_auth" = "true" ] && [ -n "$AUTH_TOKEN" ]; then
        headers="$headers -H Authorization: Bearer $AUTH_TOKEN"
    fi
    
    local curl_cmd="curl -s -X $method"
    if [ -n "$data" ]; then
        curl_cmd="$curl_cmd -d '$data'"
    fi
    curl_cmd="$curl_cmd -H '$headers' $BASE_URL$endpoint"
    
    local response=$(eval $curl_cmd)
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        log_success "$method $endpoint - $description"
        echo "$response"
    else
        log_error "$method $endpoint - $description"
        echo "Error: $response"
    fi
}

# Test health endpoint
test_health() {
    log_info "\n=== TESTING HEALTH ENDPOINT ==="
    
    local response=$(curl -s $HEALTH_URL)
    if [ $? -eq 0 ]; then
        log_success "GET /health - Server health check"
        echo "Response: $response"
    else
        log_error "GET /health - Server health check"
    fi
}

# Test root endpoint
test_root() {
    log_info "\n=== TESTING ROOT ENDPOINT ==="
    
    local response=$(curl -s $BASE_URL/)
    if [ $? -eq 0 ]; then
        log_success "GET / - Get available endpoints"
        echo "Response: $response"
    else
        log_error "GET / - Get available endpoints"
    fi
}

# Test auth endpoints
test_auth() {
    log_info "\n=== TESTING AUTH ENDPOINTS ==="
    
    # Register user
    local register_data="{\"username\":\"testuser_$TIMESTAMP\",\"email\":\"test_$TIMESTAMP@example.com\",\"password\":\"testpassword123\"}"
    local register_response=$(curl -s -X POST -H "Content-Type: application/json" -d "$register_data" $BASE_URL/auth/register)
    
    if echo "$register_response" | grep -q "success\|token\|user"; then
        log_success "POST /auth/register - Register new user"
        TEST_USER_ID=$(echo "$register_response" | grep -o '"userId":[0-9]*' | cut -d':' -f2)
    else
        log_error "POST /auth/register - Register new user"
        echo "Response: $register_response"
    fi
    
    # Login user
    local login_data="{\"username\":\"testuser_$TIMESTAMP\",\"password\":\"testpassword123\"}"
    local login_response=$(curl -s -X POST -H "Content-Type: application/json" -d "$login_data" $BASE_URL/auth/login)
    
    if echo "$login_response" | grep -q "access_token"; then
        log_success "POST /auth/login - User login"
        AUTH_TOKEN=$(echo "$login_response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
        echo "Token obtained: ${AUTH_TOKEN:0:20}..."
    else
        log_error "POST /auth/login - User login"
        echo "Response: $login_response"
    fi
    
    # Get profile
    if [ -n "$AUTH_TOKEN" ]; then
        local profile_response=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" $BASE_URL/auth/profile)
        if echo "$profile_response" | grep -q "username\|email"; then
            log_success "GET /auth/profile - Get user profile"
        else
            log_error "GET /auth/profile - Get user profile"
            echo "Response: $profile_response"
        fi
        
        # Logout
        local logout_response=$(curl -s -X POST -H "Authorization: Bearer $AUTH_TOKEN" $BASE_URL/auth/logout)
        if echo "$logout_response" | grep -q "success\|logout"; then
            log_success "POST /auth/logout - User logout"
        else
            log_error "POST /auth/logout - User logout"
            echo "Response: $logout_response"
        fi
    fi
}

# Test card endpoints
test_cards() {
    log_info "\n=== TESTING CARD ENDPOINTS ==="
    
    if [ -z "$AUTH_TOKEN" ]; then
        log_warning "Skipping card tests - no auth token available"
        return
    fi
    
    # Get all cards
    local cards_response=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" $BASE_URL/cards)
    if [ $? -eq 0 ]; then
        log_success "GET /cards - Get all cards"
    else
        log_error "GET /cards - Get all cards"
    fi
    
    # Create card
    local card_data='{"type":"NUMBER","color":"RED","value":"5"}'
    local create_response=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $AUTH_TOKEN" -d "$card_data" $BASE_URL/cards)
    if echo "$create_response" | grep -q "id\|success"; then
        log_success "POST /cards - Create new card"
    else
        log_error "POST /cards - Create new card"
        echo "Response: $create_response"
    fi
    
    # Get cards by type
    local type_response=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" $BASE_URL/cards/type/NUMBER)
    if [ $? -eq 0 ]; then
        log_success "GET /cards/type/:type - Get cards by type"
    else
        log_error "GET /cards/type/:type - Get cards by type"
    fi
    
    # Get cards by color
    local color_response=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" $BASE_URL/cards/color/RED)
    if [ $? -eq 0 ]; then
        log_success "GET /cards/color/:color - Get cards by color"
    else
        log_error "GET /cards/color/:color - Get cards by color"
    fi
}

# Test uno game endpoints
test_uno_games() {
    log_info "\n=== TESTING UNO GAME ENDPOINTS ==="
    
    if [ -z "$AUTH_TOKEN" ]; then
        log_warning "Skipping uno game tests - no auth token available"
        return
    fi
    
    # Get all games
    local games_response=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" $BASE_URL/uno-games/games)
    if [ $? -eq 0 ]; then
        log_success "GET /uno-games/games - Get all games"
    else
        log_error "GET /uno-games/games - Get all games"
    fi
    
    # Create game
    local game_data="{\"name\":\"Test Game $TIMESTAMP\",\"maxPlayers\":4}"
    local create_response=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $AUTH_TOKEN" -d "$game_data" $BASE_URL/uno-games/games)
    if echo "$create_response" | grep -q "id\|success"; then
        log_success "POST /uno-games/games - Create new game"
        TEST_GAME_ID=$(echo "$create_response" | grep -o '"id":[0-9]*' | cut -d':' -f2)
    else
        log_error "POST /uno-games/games - Create new game"
        echo "Response: $create_response"
    fi
    
    # Get active games
    local active_response=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" $BASE_URL/uno-games/games/active)
    if [ $? -eq 0 ]; then
        log_success "GET /uno-games/games/active - Get active games"
    else
        log_error "GET /uno-games/games/active - Get active games"
    fi
}

# Test participant endpoints
test_participants() {
    log_info "\n=== TESTING PARTICIPANT ENDPOINTS ==="
    
    # Get leaderboard (no auth required)
    local leaderboard_response=$(curl -s $BASE_URL/participants/leaderboard)
    if [ $? -eq 0 ]; then
        log_success "GET /participants/leaderboard - Get leaderboard"
    else
        log_error "GET /participants/leaderboard - Get leaderboard"
    fi
    
    # Get participant stats
    if [ -n "$TEST_USER_ID" ]; then
        local stats_response=$(curl -s $BASE_URL/participants/participants/$TEST_USER_ID/stats)
        if [ $? -eq 0 ]; then
            log_success "GET /participants/participants/:userId/stats - Get participant stats"
        else
            log_error "GET /participants/participants/:userId/stats - Get participant stats"
        fi
    fi
}

# Test score endpoints
test_scores() {
    log_info "\n=== TESTING SCORE ENDPOINTS ==="
    
    # Get high scores
    local high_scores_response=$(curl -s $BASE_URL/scores/scores/high-scores)
    if [ $? -eq 0 ]; then
        log_success "GET /scores/scores/high-scores - Get high scores"
    else
        log_error "GET /scores/scores/high-scores - Get high scores"
    fi
    
    # Get game scores
    if [ -n "$TEST_GAME_ID" ]; then
        local game_scores_response=$(curl -s $BASE_URL/scores/games/$TEST_GAME_ID/scores)
        if [ $? -eq 0 ]; then
            log_success "GET /scores/games/:gameId/scores - Get game scores"
        else
            log_error "GET /scores/games/:gameId/scores - Get game scores"
        fi
    fi
}

# Main execution
main() {
    echo -e "${CYAN}🚀 STARTING UNO GAME API ENDPOINT TESTS${NC}"
    echo -e "${BLUE}Base URL: $BASE_URL${NC}"
    echo -e "${BLUE}Health URL: $HEALTH_URL${NC}"
    echo -e "${CYAN}============================================${NC}"
    
    test_health
    test_root
    test_auth
    test_cards
    test_uno_games
    test_participants
    test_scores
    
    echo -e "\n${GREEN}🎉 ALL TESTS COMPLETED!${NC}"
    echo -e "${BLUE}Check the results above for any failed endpoints.${NC}"
    
    if [ -n "$AUTH_TOKEN" ]; then
        echo -e "\n${YELLOW}Auth Token for manual testing:${NC}"
        echo -e "${CYAN}$AUTH_TOKEN${NC}"
    fi
}

# Run main function
main "$@"