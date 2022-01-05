import { useColorScheme } from 'react-native'
import { ColorPalette, darkColors, lightColors } from '../theme/colors'

export const useColors = (): { colors: ColorPalette; isDarkMode: boolean } => {
    const isDarkMode = useColorScheme() === 'dark'
    return { colors: isDarkMode ? darkColors : lightColors, isDarkMode }
}
