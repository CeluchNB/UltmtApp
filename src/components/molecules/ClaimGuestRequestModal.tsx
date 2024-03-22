import BaseModal from '../atoms/BaseModal'
import PrimaryButton from '../atoms/PrimaryButton'
import React from 'react'
import SecondaryButton from '../atoms/SecondaryButton'
import { useTheme } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'

interface ClaimGuestRequestModalProps {
    visible: boolean
    loading: boolean
    successMessage?: string
    errorMessage?: string
    onRequest: () => {}
    onClose: () => {}
}

const ClaimGuestRequestModal: React.FC<ClaimGuestRequestModalProps> = ({
    visible,
    loading,
    successMessage,
    errorMessage,
    onRequest,
    onClose,
}) => {
    const {
        theme: { colors, size },
    } = useTheme()

    const styles = StyleSheet.create({
        informationText: {
            color: colors.textPrimary,
            fontSize: size.fontTwenty,
        },
        successText: {
            color: colors.success,
            fontSize: size.fontFifteen,
        },
        errorText: {
            color: colors.error,
            fontSize: size.fontFifteen,
        },
        buttonContainer: {
            flexDirection: 'row',
        },
        button: {
            margin: 5,
        },
    })

    return (
        <BaseModal visible={visible} onClose={onClose}>
            <Text style={styles.informationText}>
                This user is a guest. If this user's data belongs to you, you
                can claim this guest. A team manager must approve the claim
                before it takes effect.
            </Text>
            {successMessage && (
                <Text style={styles.successText}>{successMessage}</Text>
            )}
            {errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
            )}
            <View style={styles.buttonContainer}>
                <SecondaryButton
                    style={styles.button}
                    text="close"
                    onPress={onClose}
                />
                <PrimaryButton
                    style={styles.button}
                    text="request"
                    onPress={onRequest}
                    loading={loading}
                    disabled={loading || successMessage !== undefined}
                />
            </View>
        </BaseModal>
    )
}

export default ClaimGuestRequestModal
