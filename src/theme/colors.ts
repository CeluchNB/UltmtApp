export interface ColorPalette {
    primary: string
    secondary: string
    textPrimary: string
    textSecondary: string
    success: string
    error: string
    gray: string
    darkGray: string
    darkPrimary: string
}

export const lightColors: ColorPalette = {
    primary: '#ffffff',
    secondary: '#303030',
    textPrimary: '#3183ff',
    textSecondary: '#ffd600',
    success: '#40dd50',
    error: '#ff0000',
    gray: '#707070',
    darkGray: '#303030',
    darkPrimary: '#cccccc',
}

export const darkColors: ColorPalette = {
    primary: '#303030',
    secondary: '#ffffff',
    textPrimary: '#ffd600',
    textSecondary: '#31adff',
    success: '#40dd50',
    error: '#ff0000',
    gray: '#ababab',
    darkGray: '#ebebeb',
    darkPrimary: '#2a2a2a',
}
