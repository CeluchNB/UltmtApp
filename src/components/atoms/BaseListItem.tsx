import * as React from 'react'
import { IconButton } from 'react-native-paper'
import { useTheme } from '../../hooks'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export interface BaseListItemProps {
    showDelete?: boolean
    showAccept?: boolean
    onDelete?: () => {}
    onAccept?: () => {}
    onPress?: () => {}
    requestStatus?: string
    error?: string
    children?: React.ReactNode
}

const BaseListItem: React.FC<BaseListItemProps> = ({
    showDelete,
    showAccept,
    onDelete,
    onAccept,
    onPress,
    requestStatus,
    error,
    children,
}) => {
    const {
        theme: { colors, size, weight },
    } = useTheme()

    const styles = StyleSheet.create({
        container: {
            display: 'flex',
            flexDirection: 'row',
            marginBottom: 5,
        },
        textContainer: {
            // flex: 1,
            alignSelf: 'center',
        },
        text: {
            color: colors.gray,
            fontSize: size.fontTwenty,
            fontWeight: weight.bold,
        },
        buttonStyle: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        acceptedText: {
            fontSize: size.fontTen,
            fontWeight: weight.bold,
            color: colors.success,
        },
        deniedText: {
            fontSize: size.fontTen,
            fontWeight: weight.bold,
            color: colors.error,
        },
        pendingText: {
            fontSize: size.fontTen,
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
        <View>
            <View style={styles.container}>
                <View style={styles.textContainer}>
                    <TouchableOpacity onPress={onPress}>
                        {children}
                        {requestStatus === 'approved' && (
                            <Text style={styles.acceptedText}>Accepted</Text>
                        )}
                        {requestStatus === 'denied' && (
                            <Text style={styles.deniedText}>Denied</Text>
                        )}
                        {requestStatus === 'pending' && (
                            <Text style={styles.pendingText}>Pending</Text>
                        )}
                        {error && (
                            <Text style={styles.deniedText}>{error}</Text>
                        )}
                    </TouchableOpacity>
                </View>
                {showAccept && (
                    <IconButton
                        style={styles.buttonStyle}
                        iconColor={colors.success}
                        icon="plus"
                        onPress={onAccept}
                        testID="accept-button"
                    />
                )}
                {showDelete && (
                    <IconButton
                        style={styles.buttonStyle}
                        iconColor={colors.error}
                        icon="close"
                        onPress={onDelete}
                        testID="delete-button"
                    />
                )}
                {onPress && (
                    <IconButton
                        style={styles.buttonStyle}
                        iconColor={colors.textPrimary}
                        icon="chevron-right"
                        onPress={onPress}
                        testID="go-button"
                    />
                )}
            </View>
        </View>
    )
}

export default BaseListItem
