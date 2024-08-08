import { ApiError } from '../../types/services'
import BaseModal from '../atoms/BaseModal'
import PrimaryButton from '../atoms/PrimaryButton'
import React from 'react'
import SecondaryButton from '../atoms/SecondaryButton'
import { useTheme } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'

interface ConfirmModalProps {
    visible: boolean
    displayText: string
    loading: boolean
    confirmColor?: string
    error?: ApiError | string | null
    onConfirm: () => {}
    onCancel: () => {}
    onClose: () => {}
}

const ConfirmModal: React.FC<ConfirmModalProps> = props => {
    const {
        theme: { colors, size },
    } = useTheme()
    const {
        visible,
        displayText,
        loading,
        confirmColor = colors.primary,
        error,
        onConfirm,
        onCancel,
        onClose,
    } = props

    const styles = StyleSheet.create({
        text: {
            fontSize: size.fontTwenty,
            color: colors.textPrimary,
        },
        buttonContainer: {
            display: 'flex',
            flexDirection: 'row',
            marginTop: 10,
        },
        button: { margin: 5 },
        confirmButton: {
            backgroundColor: confirmColor,
        },
        error: {
            color: colors.error,
            fontSize: size.fontFifteen,
        },
    })

    return (
        <BaseModal visible={visible} onClose={onClose}>
            <Text style={styles.text}>{displayText}</Text>
            {error && <Text style={styles.error}>{error.toString()}</Text>}
            <View style={styles.buttonContainer}>
                <SecondaryButton
                    style={styles.button}
                    text="cancel"
                    onPress={onCancel}
                />
                <PrimaryButton
                    style={[styles.button, styles.confirmButton]}
                    text="confirm"
                    onPress={onConfirm}
                    loading={loading}
                    disabled={loading}
                />
            </View>
        </BaseModal>
    )
}

export default ConfirmModal
