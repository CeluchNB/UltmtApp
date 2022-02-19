import { ApiError, ApiResponse } from '../types/services'

export const unwrapResponse = async (
    response: Awaited<ReturnType<typeof fetch>>,
): Promise<ApiResponse> => {
    if (response.ok) {
        return { data: await response.json() }
    } else {
        return { error: await response.text() }
    }
}

export const throwApiError = (error: any, message: string) => {
    if (error.response.data.message) {
        throw new ApiError(error.response.data.message)
    } else if (typeof error === typeof ApiError) {
        throw new ApiError(error.message)
    } else {
        throw new ApiError(message)
    }
}
