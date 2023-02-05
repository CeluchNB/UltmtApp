import * as React from 'react'
import { IconButton } from 'react-native-paper'
import { useTheme } from '../../hooks'
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'

export interface UserSearchResultItemProps {
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
    const {
        theme: { colors, size, weight },
    } = useTheme()

    const styles = StyleSheet.create({
        container: {
            display: 'flex',
            flexDirection: 'row',
        },
        nameContainer: {
            flex: 1,
            alignSelf: 'center',
        },
        name: {
            color: colors.gray,
            fontSize: size.fontTwenty,
            fontWeight: weight.full,
        },
        username: {
            color: colors.textPrimary,
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
                        iconColor={colors.success}
                        icon="plus"
                        onPress={onPress}
                    />
                )}
                {loading && (
                    <ActivityIndicator
                        size="small"
                        color={colors.gray}
                        animating={loading}
                        testID="loading-spinner"
                    />
                )}
            </TouchableOpacity>
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    )
}

export default UserSearchResultItem
