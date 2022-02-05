import * as React from 'react'
import { IconButton } from 'react-native-paper'
import { useColors } from '../../hooks'
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { size, weight } from '../../theme/fonts'

interface UserSearchResultItemProps {
    name: string
    username: string
    loading: boolean
    onPress: () => {}
    error?: string
}

const UserSearchResultItem: React.FC<UserSearchResultItemProps> = ({
    name,
    username,
    loading,
    onPress,
    error,
}) => {
    const { colors } = useColors()

    const styles = StyleSheet.create({
        container: {
            display: 'flex',
            flexDirection: 'row',
            margin: 5,
        },
        nameContainer: {
            flex: 1,
            alignSelf: 'center',
        },
        name: {
            color: colors.gray,
            fontSize: size.fontMedium,
            fontWeight: weight.full,
        },
        username: {
            color: colors.textSecondary,
            fontSize: size.fontFifteen,
            fontWeight: weight.full,
        },
        buttonStyle: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        error: {
            color: colors.error,
            fontSize: size.fontFifteen,
            fontWeight: weight.medium,
        },
    })

    return (
        <View>
            <TouchableOpacity
                style={styles.container}
                onPress={onPress}
                disabled={loading}>
                <View style={styles.nameContainer}>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.username}>{username}</Text>
                </View>
                {!loading && (
                    <IconButton
                        style={styles.buttonStyle}
                        color={colors.success}
                        icon="plus"
                        onPress={onPress}
                    />
                )}
                {loading && (
                    <ActivityIndicator
                        size="small"
                        color={colors.gray}
                        animating={loading}
                    />
                )}
            </TouchableOpacity>
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    )
}

export default UserSearchResultItem
