export type ApiResponse = {
    data?: any
    error?: any
}

class Error {
    message: string
    constructor(message: string) {
        this.message = message
    }

    toString() {
        return this.message
    }
}
export class ApiError extends Error {}
export class LocalError extends Error {}
