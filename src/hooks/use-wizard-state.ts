import { useState } from 'react'

export const useWizardState = <T>(initialState: T) => {
    const [backDisabled, setBackDisabled] = useState(true)
    const [nextDisabled, setNextDisabled] = useState(true)
    const [state, setState] = useState<T>(initialState)

    return {
        state,
        backDisabled,
        nextDisabled,
        setState,
        setBackDisabled,
        setNextDisabled,
    }
}
