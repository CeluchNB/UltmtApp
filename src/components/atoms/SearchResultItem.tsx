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
    header: string
    subheader?: string
    onPress: () => void
    loading: boolean
    error?: string
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({
    header,
    subheader,
    onPress,
    loading,
    error,
}) => {
    const { colors } = useColors()
    const styles = StyleSheet.create({
        header: {
            color: colors.gray,
            fontSize: size.fontMedium,
            fontWeight: weight.full,
        },
        subheader: {
            color: colors.textPrimary,
            fontSize: size.fontFifteen,
            fontWeight: weight.full,
        },
        opacity: {
            display: 'flex',
            flexDirection: 'row',
        },
        itemContainer: {
            flex: 1,
        },
        separator: {
            height: 1,
            marginTop: 10,
            marginBottom: 10,
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
                <View style={styles.itemContainer}>
                    <Text style={styles.header}>{header}</Text>
                    {subheader && (
                        <Text style={styles.subheader}>{subheader}</Text>
                    )}
                </View>
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
