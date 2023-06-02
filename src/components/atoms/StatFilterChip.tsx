import { Chip } from 'react-native-paper'
import React from 'react'
import { useTheme } from '../../hooks'

interface StatFilterChipProps {
    name: string
    selected: boolean
    onPress: () => void
}
const StatFilterChip: React.FC<StatFilterChipProps> = ({
    name,
    selected,
    onPress,
}) => {
    const {
        theme: { colors },
    } = useTheme()
    return (
        <Chip
            mode="outlined"
            textStyle={{
                color: selected ? colors.primary : colors.textPrimary,
            }}
            style={{
                backgroundColor: selected ? colors.textPrimary : colors.primary,
                borderColor: colors.textPrimary,
            }}
            onPress={onPress}>
            {name}
        </Chip>
    )
}

export default StatFilterChip
