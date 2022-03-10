import * as React from 'react'
import { DisplayUser } from '../../types/user'
import { IconButton } from 'react-native-paper'
import { useColors } from '../../hooks'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { size, weight } from '../../theme/fonts'

export interface UserListItemProps {
    user: DisplayUser
    showDelete: boolean
    showAccept: boolean
    onDelete?: () => {}
    onAccept?: () => {}
    onPress?: () => {}
    requestStatus?: string
    error?: string
}

const UserListItem: React.FC<UserListItemProps> = ({
    user,
    showDelete,
    showAccept,
    onDelete,
    onAccept,
    onPress,
    requestStatus,
    error,
}) => {
    const { colors } = useColors()

    const styles = StyleSheet.create({
        container: {
            display: 'flex',
            flexDirection: 'row',
            marginBottom: 5,
        },
        textContainer: {
            flex: 1,
            alignSelf: 'center',
        },
        text: {
            color: colors.gray,
            fontSize: size.fontMedium,
            fontWeight: weight.bold,
        },
        buttonStyle: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        acceptedText: {
            fontSize: size.fontSmall,
            fontWeight: weight.bold,
            color: colors.success,
        },
        deniedText: {
            fontSize: size.fontSmall,
            fontWeight: weight.bold,
            color: colors.error,
        },
        pendingText: {
            fontSize: size.fontSmall,
            fontWeight: weight.bold,
            color: colors.gray,
        },
        usernameText: {
            fontSize: size.fontFifteen,
            fontWeight: weight.normal,
            color: colors.textPrimary,
        },
    })

    return (
        <View style={styles.container}>
            <View style={styles.textContainer}>
                <TouchableOpacity onPress={onPress}>
                    <Text
                        style={
                            styles.text
                        }>{`${user.firstName} ${user.lastName}`}</Text>
                    <Text style={styles.usernameText}>@{user.username}</Text>
                    {requestStatus === 'approved' && (
                        <Text style={styles.acceptedText}>Accepted</Text>
                    )}
                    {requestStatus === 'denied' && (
                        <Text style={styles.deniedText}>Denied</Text>
                    )}
                    {requestStatus === 'pending' && (
                        <Text style={styles.pendingText}>Pending</Text>
                    )}
                    {error && <Text style={styles.deniedText}>{error}</Text>}
                </TouchableOpacity>
            </View>
            {showAccept && (
                <IconButton
                    style={styles.buttonStyle}
                    color={colors.success}
                    icon="plus"
                    onPress={onAccept}
                    testID="accept-button"
                />
            )}
            {showDelete && (
                <IconButton
                    style={styles.buttonStyle}
                    color={colors.error}
                    icon="close"
                    onPress={onDelete}
                    testID="delete-button"
                />
            )}
            {onPress && (
                <IconButton
                    style={styles.buttonStyle}
                    color={colors.textPrimary}
                    icon="chevron-right"
                    onPress={onPress}
                    testID="go-button"
                />
            )}
        </View>
    )
}

export default UserListItem
