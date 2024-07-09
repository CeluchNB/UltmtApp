import { ApiError, LocalError } from '../types/services'

export const throwApiError = (error: any, message: string) => {
    if (error.data?.message) {
        throw new ApiError(error.data.message)
    } else if (error.message) {
        throw new ApiError(error.message)
    } else {
        throw new ApiError(message)
    }
}

export const throwLocalError = (message: string) => {
    throw new LocalError(message)
}

export const isTokenExpired = (exp?: number): boolean => {
    const currentTime = Math.floor(new Date().getTime() / 1000)

    if (!exp || exp <= currentTime) {
        return true
    }
    return false
}

export const addQueryParam = (url: string, name: string, value?: any) => {
    if (value === undefined || value === null) {
        return url
    }
    if (!url.includes('?')) {
        return `${url}?${name}=${value}`
    }
    return `${url}&${name}=${value}`
}
