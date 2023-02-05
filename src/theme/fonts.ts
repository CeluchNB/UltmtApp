import Metrics from './metrics'
import { FontSize, FontWeight } from '../types/theme'

const size: FontSize = {
    fontTen: Metrics.screenWidth * (10 / 365),
    fontFifteen: Metrics.screenWidth * (15 / 365),
    fontTwenty: Metrics.screenWidth * (20 / 365),
    fontThirty: Metrics.screenWidth * (30 / 365),
    fontFourty: Metrics.screenWidth * (40 / 365),
}

const weight: FontWeight = {
    full: '900',
    medium: '600',
    low: '400',
    bold: 'bold',
    normal: 'normal',
}

export { size, weight }
