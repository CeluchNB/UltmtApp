import * as React from 'react'
import BaseListItem from './BaseListItem'
import { DisplayUser } from '../../types/user'
import { useColors } from '../../hooks'
import { StyleSheet, Text } from 'react-native'
import { size, weight } from '../../theme/fonts'

export interface UserListItemProps {
    user: DisplayUser
    showDelete?: boolean
    showAccept?: boolean
    onDelete?: () => {}
    onAccept?: () => {}
    onPress?: () => {}
    requestStatus?: string
    error?: string
}

const UserListItem: React.FC<UserListItemProps> = props => {
    const { colors } = useColors()
    const { user } = props

    const styles = StyleSheet.create({
        text: {
            color: colors.gray,
            fontSize: size.fontMedium,
            fontWeight: weight.bold,
        },
        usernameText: {
            fontSize: size.fontFifteen,
            fontWeight: weight.normal,
            color: colors.textPrimary,
        },
    })

    return (
        <BaseListItem {...props}>
            <Text
                style={
                    styles.text
                }>{`${user.firstName} ${user.lastName}`}</Text>
            <Text style={styles.usernameText}>@{user.username}</Text>
        </BaseListItem>
    )
}

export default UserListItem
