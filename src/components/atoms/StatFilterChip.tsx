import { Chip } from 'react-native-paper'
import React from 'react'
import { StyleSheet } from 'react-native'
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

    const styles = StyleSheet.create({
        chip: {
            backgroundColor: selected ? colors.textPrimary : colors.primary,
            borderColor: colors.textPrimary,
            marginRight: 5,
        },
    })
    return (
        <Chip
            mode="outlined"
            textStyle={{
                color: selected ? colors.primary : colors.textPrimary,
            }}
            style={styles.chip}
            onPress={onPress}>
            {name}
        </Chip>
    )
}

export default StatFilterChip
