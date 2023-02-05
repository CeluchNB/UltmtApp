import DarkTheme from './dark'
import LightTheme from './light'
import React from 'react'
import { Theme } from '../types/theme'
import { isDarkMode, setDarkMode } from '../services/data/preferences'

interface ProvidedValue {
    theme: Theme
    toggleTheme: () => void
}

export const ThemeContext = React.createContext<ProvidedValue>({
    theme: DarkTheme,
    toggleTheme: () => {},
})

interface Props {
    children?: React.ReactNode
}

export const ThemeProvider = React.memo<Props>(props => {
    const [theme, setTheme] = React.useState(DarkTheme)

    React.useEffect(() => {
        isDarkMode().then(isDark => {
            if (!isDark) {
                setTheme(LightTheme)
            }
        })
    }, [])

    const ToggleThemeCallback = React.useCallback(async () => {
        setTheme(curr => {
            setDarkMode(curr.id !== 'dark')
            if (curr.id === 'dark') {
                return LightTheme
            } else {
                return DarkTheme
            }
        })
    }, [])

    const MemoizedValue = React.useMemo(() => {
        const value: ProvidedValue = {
            theme: theme,
            toggleTheme: ToggleThemeCallback,
        }
        return value
    }, [theme, ToggleThemeCallback])

    return (
        <ThemeContext.Provider value={MemoizedValue}>
            {props.children}
        </ThemeContext.Provider>
    )
})
