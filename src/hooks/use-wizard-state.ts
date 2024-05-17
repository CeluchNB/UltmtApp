import { useState } from 'react'

// TODO: GAME-REFACTOR can delete (as of 05/16/2024)
export const useWizardState = <T>(initialState: T) => {
    const [backDisabled, setBackDisabled] = useState(true)
    const [nextDisabled, setNextDisabled] = useState(true)
    const [backLoading, setBackLoading] = useState(false)
    const [nextLoading, setNextLoading] = useState(false)
    const [state, setState] = useState<T>(initialState)

    return {
        state,
        backDisabled,
        nextDisabled,
        backLoading,
        nextLoading,
        setState,
        setBackDisabled,
        setNextDisabled,
        setBackLoading,
        setNextLoading,
    }
}
