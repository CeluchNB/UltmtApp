import * as React from 'react'
import { DisplayUser } from '../../types/user'
import { IconButton } from 'react-native-paper'
import { useColors } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'
import { size, weight } from '../../theme/fonts'

interface UserListItemProps {
    user: DisplayUser
    showDelete: boolean
    showAccept: boolean
    onDelete?: () => {}
    onAccept?: () => {}
    requestStatus?: string
}

const UserListItem: React.FC<UserListItemProps> = ({
    user,
    showDelete,
    showAccept,
    onDelete,
    onAccept,
    requestStatus,
}) => {
    const { colors } = useColors()

    const styles = StyleSheet.create({
        container: {
            display: 'flex',
            flexDirection: 'row',
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
    })
    return (
        <View style={styles.container}>
            <View style={styles.textContainer}>
                <Text
                    style={
                        styles.text
                    }>{`${user.firstName} ${user.lastName}`}</Text>
                {requestStatus === 'approved' && (
                    <Text style={styles.acceptedText}>Accepted</Text>
                )}
                {requestStatus === 'denied' && (
                    <Text style={styles.deniedText}>Denied</Text>
                )}
                {requestStatus === 'pending' && (
                    <Text style={styles.pendingText}>Pending</Text>
                )}
            </View>
            {showAccept && (
                <IconButton
                    style={styles.buttonStyle}
                    color={colors.success}
                    icon="plus"
                    onPress={onAccept}
                />
            )}
            {showDelete && (
                <IconButton
                    style={styles.buttonStyle}
                    color={colors.error}
                    icon="close"
                    onPress={onDelete}
                />
            )}
        </View>
    )
}

export default UserListItem
