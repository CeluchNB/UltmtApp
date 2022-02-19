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
    if (typeof error === typeof ApiError) {
        throw error
    } else {
        throw new ApiError(message)
    }
}
