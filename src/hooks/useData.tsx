import { ApiError } from '../types/services'
import { useCallback, useEffect, useState } from 'react'

interface UseData<R> {
    loading: boolean
    data: R | undefined
    error: ApiError | undefined
    refetch: () => void
}

interface UseLazyData<R> {
    loading: boolean
    data: R | undefined
    error: ApiError | undefined
    fetch: (...args: any[]) => void
}

export function useData<T>(
    method: (...methodArgs: any[]) => Promise<T>,
    ...args: any[]
): UseData<T> {
    const [data, setData] = useState<T>()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<ApiError | undefined>(undefined)

    const refetch = useCallback(async () => {
        setLoading(true)
        try {
            console.log('calling refetch')
            const result = await method(...args)
            setData(result)
        } catch (e) {
            setError(e as unknown as ApiError)
        } finally {
            setLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        refetch()
    }, [refetch])

    return { data, loading, error, refetch }
}

export function useLazyData<T>(
    method: (...methodArgs: any[]) => Promise<T>,
): UseLazyData<T> {
    const [data, setData] = useState<T>()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<ApiError | undefined>(undefined)

    const fetch = async (...args: any[]) => {
        setLoading(true)
        try {
            const result = await method(...args)
            setData(result)
        } catch (e) {
            setError(e as unknown as ApiError)
        } finally {
            setLoading(false)
        }
    }

    return { data, loading, error, fetch }
}
