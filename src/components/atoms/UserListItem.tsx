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
}

const UserListItem: React.FC<UserListItemProps> = ({
    user,
    showDelete,
    showAccept,
    onDelete,
    onAccept,
}) => {
    const { colors } = useColors()

    const styles = StyleSheet.create({
        container: {
            display: 'flex',
            flexDirection: 'row',
        },
        text: {
            color: colors.gray,
            fontSize: size.fontMedium,
            fontWeight: weight.bold,
            flex: 1,
            alignSelf: 'center',
        },
        buttonStyle: {
            alignItems: 'center',
            justifyContent: 'center',
        },
    })
    return (
        <View style={styles.container}>
            <Text
                style={
                    styles.text
                }>{`${user.firstName} ${user.lastName}`}</Text>
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
