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
    })

    return (
        <BaseModal visible={visible} onClose={onClose}>
            <Text style={styles.text}>{displayText}</Text>
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
                />
            </View>
        </BaseModal>
    )
}

export default ConfirmModal
