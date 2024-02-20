import BaseListItem from './BaseListItem'
import { ClaimGuestRequest } from '../../types/claim-guest-request'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import React from 'react'
import { useTheme } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'

interface ClaimGuestRequestProps {
    request: ClaimGuestRequest
}

const ClaimGuestRequestItem: React.FC<ClaimGuestRequestProps> = ({
    request,
}) => {
    const {
        theme: { colors },
    } = useTheme()

    const styles = StyleSheet.create({
        container: {
            borderStyle: 'solid',
            borderLeftWidth: 2,
            borderColor: colors.textSecondary,
            paddingLeft: 5,
            marginTop: 5,
        },
        text: {
            color: colors.textPrimary,
        },
        user: {
            color: colors.textPrimary,
        },
    })

    return (
        <BaseListItem showDelete showAccept requestStatus={request.status}>
            <View style={styles.container}>
                <View>
                    <Text style={styles.text}>
                        {request.user.firstName} {request.user.lastName}
                    </Text>
                    <Text style={styles.text}>@{request.user.username}</Text>
                </View>
                <Icon color={colors.gray} name="arrow-down" size={20} />
                <View>
                    <Text style={styles.text}>
                        {request.guest.firstName} {request.guest.lastName}{' '}
                        (guest)
                    </Text>
                </View>
            </View>
        </BaseListItem>
    )
}

export default ClaimGuestRequestItem
