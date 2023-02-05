import React from 'react'
import { ThemeContext } from '../theme/context'

export const useTheme = () => React.useContext(ThemeContext)
