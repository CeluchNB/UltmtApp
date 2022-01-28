import { ApiResponse } from '../types/services'

export const unwrapResponse = async (
    response: Awaited<ReturnType<typeof fetch>>,
): Promise<ApiResponse> => {
    if (response.ok) {
        return { data: await response.json() }
    } else {
        return { error: await response.text() }
    }
}
