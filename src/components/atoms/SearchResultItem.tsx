import * as React from 'react'
import { useColors } from '../../hooks'
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { size, weight } from '../../theme/fonts'

interface SearchResultItemProps {
    item: string
    onPress: () => void
    loading: boolean
    error?: string
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({
    item,
    onPress,
    loading,
    error,
}) => {
    const { colors } = useColors()
    const styles = StyleSheet.create({
        text: {
            color: colors.textPrimary,
            fontSize: size.fontMedium,
            fontWeight: weight.full,
            margin: 5,
        },
        opacity: {
            display: 'flex',
            flexDirection: 'row',
        },
        separator: {
            height: 1,
            backgroundColor: colors.textSecondary,
        },
        error: {
            fontSize: size.fontSmall,
            marginBottom: 2,
            color: colors.error,
        },
    })

    return (
        <View>
            <TouchableOpacity style={styles.opacity} onPress={onPress}>
                <Text style={styles.text}>{item}</Text>
                <ActivityIndicator
                    size="small"
                    color={colors.textPrimary}
                    animating={loading}
                />
            </TouchableOpacity>
            {error && <Text style={styles.error}>{error}</Text>}
            <View style={styles.separator} />
        </View>
    )
}

export default SearchResultItem
