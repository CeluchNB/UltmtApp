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

export const isTokenExpired = (exp?: number): boolean => {
    const currentTime = Math.floor(new Date().getTime() / 1000)

    if (!exp || exp <= currentTime) {
        return true
    }
    return false
}

export const addQueryParam = (url: string, name: string, value?: any) => {
    if (!value) {
        return url
    }
    if (!url.includes('?')) {
        return `${url}?${name}=${value}`
    }
    return `${url}&${name}=${value}`
}
