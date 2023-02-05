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

export interface FontSize {
    fontTen: number
    fontFifteen: number
    fontTwenty: number
    fontThirty: number
    fontFourty: number
}

export type Weight = '900' | '600' | '400' | 'bold' | 'normal'
export interface FontWeight {
    full: Weight
    medium: Weight
    low: Weight
    bold: Weight
    normal: Weight
}

export interface Theme {
    id: string
    colors: ColorPalette
    size: FontSize
    weight: FontWeight
}
