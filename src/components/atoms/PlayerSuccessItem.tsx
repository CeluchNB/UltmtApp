import { GuestUser } from '../../types/user'
import { IconButton } from 'react-native-paper'
import React from 'react'
import { useTheme } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'

interface PlayerSuccessItemProps {
    user: GuestUser
}

const PlayerSuccessItem: React.FC<PlayerSuccessItemProps> = ({ user }) => {
    const {
        theme: { colors, size, weight },
    } = useTheme()

    const styles = StyleSheet.create({
        playerContainer: {
            flexDirection: 'row',
        },
        playerItem: {
            color: colors.success,
            fontSize: size.fontTwenty,
            fontWeight: weight.full,
            flex: 1,
            alignSelf: 'center',
        },
    })

    return (
        <View style={styles.playerContainer}>
            <Text
                style={
                    styles.playerItem
                }>{`${user.firstName} ${user.lastName}`}</Text>
            <IconButton icon="check" iconColor={colors.success} disabled />
        </View>
    )
}

export default PlayerSuccessItem
