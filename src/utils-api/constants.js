const GAME_STATUS = {
  WAITING: 'waiting',
  IN_PROGRESS: 'in_progress',
  FINISHED: 'finished'
}

const CARD_COLORS = {
  RED: 'red',
  BLUE: 'blue',
  GREEN: 'green',
  YELLOW: 'yellow',
  WILD: 'wild'
}

const CARD_TYPES = {
  NUMBER: 'number',
  SKIP: 'skip',
  REVERSE: 'reverse',
  DRAW_TWO: 'draw_two',
  WILD: 'wild',
  WILD_DRAW_FOUR: 'wild_draw_four'
}

const CARD_LOCATIONS = {
  HAND: 'hand',
  DECK: 'deck',
  DISCARD: 'discard'
}

const GAME_DIRECTIONS = {
  CLOCKWISE: 'clockwise',
  COUNTERCLOCKWISE: 'counterclockwise'
}

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
}

const JWT_EXPIRES_IN = '24h'

const GAME_SETTINGS = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 10,
  DEFAULT_MAX_PLAYERS: 4,
  INITIAL_CARDS_COUNT: 7
}

module.exports = {
  GAME_STATUS,
  CARD_COLORS,
  CARD_TYPES,
  CARD_LOCATIONS,
  GAME_DIRECTIONS,
  HTTP_STATUS,
  JWT_EXPIRES_IN,
  GAME_SETTINGS
}
