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
        await setDarkMode(theme.id !== 'dark')
        setTheme(curr => {
            if (curr.id === 'dark') {
                console.log('setting light')
                return LightTheme
            } else {
                console.log('setting dark')
                return DarkTheme
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
