import { Chip } from 'react-native-paper'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import React from 'react'
import { useTheme } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'

interface ActiveGameWarningProps {
    count?: number
    onPress: () => void
}

const ActiveGameWarning: React.FC<ActiveGameWarningProps> = ({
    count,
    onPress,
}) => {
    const {
        theme: { colors },
    } = useTheme()

    if (!count || count <= 0) {
        return null
    }

    const rightIcon = () => (
        <Icon
            color={colors.textPrimary}
            name="chevron-right"
            size={20}
            testID="chip-close"
        />
    )

    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
        },
        chip: {
            backgroundColor: colors.primary,
            borderColor: colors.textPrimary,
        },
        text: {
            color: colors.textPrimary,
        },
    })

    return (
        <View style={styles.container}>
            <Chip
                mode="outlined"
                closeIcon={rightIcon}
                onPress={onPress}
                onClose={onPress}
                style={styles.chip}>
                <Text style={styles.text}>
                    You have {count} active game{count > 1 ? 's' : ''}
                </Text>
            </Chip>
        </View>
    )
}

export default ActiveGameWarning
