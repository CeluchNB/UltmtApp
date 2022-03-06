import { ApiError } from '../types/services'

export const throwApiError = (error: any, message: string) => {
    if (error.response?.data?.message) {
        throw new ApiError(error.response.data.message)
    } else if (typeof error === typeof ApiError) {
        throw new ApiError(error.message)
    } else {
        throw new ApiError(message)
    }
}
