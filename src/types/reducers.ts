export interface LoginData {
    username: string
    password: string
}

export type Status = 'idle' | 'loading' | 'success' | 'failed'
