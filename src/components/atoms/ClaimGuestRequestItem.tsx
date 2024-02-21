import BaseListItem from './BaseListItem'
import { ClaimGuestRequest } from '../../types/claim-guest-request'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'

interface ClaimGuestRequestProps {
    request: ClaimGuestRequest
    onAccept: (requestId: string) => Promise<void>
    onDeny: (requestId: string) => Promise<void>
}

const ClaimGuestRequestItem: React.FC<ClaimGuestRequestProps> = ({
    request,
    onAccept,
    onDeny,
}) => {
    const navigation = useNavigation()
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

    if (!request.guest) return null

    return (
        <BaseListItem
            showDelete={request.status === 'pending'}
            showAccept={request.status === 'pending'}
            onAccept={async () => {
                onAccept(request._id)
            }}
            onDelete={async () => {
                onDeny(request._id)
            }}
            onPress={async () => {
                navigation.navigate('Tabs', {
                    screen: 'Account',
                    params: {
                        screen: 'PublicUserDetails',
                        params: { userId: request.userId },
                    },
                })
            }}
            requestStatus={request.status}>
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
