export type ApiResponse = {
    data?: any
    error?: any
}

export class ApiError {
    message: string
    constructor(message: string) {
        this.message = message
    }

    toString() {
        return this.message
    }
}
