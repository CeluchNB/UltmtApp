import Metrics from './metrics'

const size = {
    fontSmall: Metrics.screenWidth * (10 / 365),
    fontMedium: Metrics.screenWidth * (20 / 365),
    fontLarge: Metrics.screenWidth * (30 / 365),
    fontExtraLarge: Metrics.screenWidth * (40 / 365),
}

type WeightStyle = '900' | '600' | '400' | 'bold' | 'normal'
const weight = {
    full: '900' as WeightStyle,
    medium: '600' as WeightStyle,
    low: '400' as WeightStyle,
    bold: 'bold' as WeightStyle,
    normal: 'normal' as WeightStyle,
}

export { size, weight }
