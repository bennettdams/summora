const APP_MESSAGES = ['ok', 'errorUniqueUsername'] as const

export type AppMessage = typeof APP_MESSAGES[number]
