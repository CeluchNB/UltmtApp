export interface ColorPalette {
    primary: string
    secondary: string
    textPrimary: string
    textSecondary: string
    success: string
    error: string
}

export const lightColors: ColorPalette = {
    primary: '#ffffff',
    secondary: '#090909',
    textPrimary: '#3183ff',
    textSecondary: '#ffd600',
    success: '#40dd50',
    error: '#ff0000',
}

export const darkColors: ColorPalette = {
    primary: '#090909',
    secondary: '#ffffff',
    textPrimary: '#ffd600',
    textSecondary: '#31adff',
    success: '#40dd50',
    error: '#ff0000',
}
