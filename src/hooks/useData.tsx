import { ApiError } from '../types/services'
import { useCallback, useEffect, useRef, useState } from 'react'

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
    const isMounted = useRef(false)

    const refetch = useCallback(async () => {
        if (!isMounted.current) {
            return
        }
        setLoading(true)
        setError(undefined)
        try {
            const result = await method(...args)
            setData(result)
        } catch (e) {
            setError(e as unknown as ApiError)
        } finally {
            setLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...args])

    useEffect(() => {
        isMounted.current = true
        refetch()
        return () => {
            isMounted.current = false
        }
    }, [refetch])

    return { data, loading, error, refetch }
}

export function useLazyData<T>(
    method: (...methodArgs: any[]) => Promise<T>,
): UseLazyData<T> {
    const [data, setData] = useState<T>()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<ApiError | undefined>(undefined)
    const isMounted = useRef(false)

    useEffect(() => {
        isMounted.current = true
        return () => {
            isMounted.current = false
        }
    })

    const fetch = async (...args: any[]) => {
        setError(undefined)
        if (!isMounted.current) {
            return
        }
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
