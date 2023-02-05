import * as Preferences from '../services/data/preferences'
import { ColorPalette } from '../types/theme'
import { darkColors, lightColors } from '../theme/colors'
import { useEffect, useRef, useState } from 'react'

export const useColors = (): { colors: ColorPalette; isDarkMode: boolean } => {
    const [isDarkMode, setIsDarkMode] = useState(true)
    const isMounted = useRef(false)
    useEffect(() => {
        isMounted.current = true
        Preferences.isDarkMode().then(dark => {
            if (isMounted.current) {
                setIsDarkMode(dark)
            }
        })
        return () => {
            isMounted.current = false
        }
    })
    return { colors: isDarkMode ? darkColors : lightColors, isDarkMode }
}
