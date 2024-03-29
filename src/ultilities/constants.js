export const HttpStatusCode = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_PERMISSION: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER: 500
}

export const WHITELIST_DOMAINS = [
  'http://localhost:3000',
  'https://localhost:3000',
  'http://localhost:3001',
  'https://localhost:3443',
  'http://web.minhmai.software'
]

export const ROLE = {
  WORKPLACE_ADMIN: 'workplace_admin',
  WORKPLACE_OWNER: 'workplace_owner',
  WORKPLACE_USER: 'workplace_user',
  BOARD_ADMIN: 'board_admin',
  BOARD_OWNER: 'board_owner',
  BOARD_USER: 'board_user',
  CARD_ADMIN: 'card_admin',
  CARD_OWNER: 'card_owner',
  CARD_USER: 'card_user',
  TASK_USER: 'task_user'
}

export const ROWS_NUMBER = {
  USER_LIST_DROPDOWN: 4,
  DASHBOARD_USER_LIST: 20,
  NOTIFICATION_LIST_DROP: 20
}