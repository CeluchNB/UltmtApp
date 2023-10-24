import { ApiError } from '../types/services'
import { useEffect, useRef, useState } from 'react'

interface UseLazyData<R> {
    loading: boolean
    data: R | undefined
    error: ApiError | undefined
    fetch: (...args: any[]) => void
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
