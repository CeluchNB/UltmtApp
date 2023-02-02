import BaseModal from '../atoms/BaseModal'
import PrimaryButton from '../atoms/PrimaryButton'
import React from 'react'
import SecondaryButton from '../atoms/SecondaryButton'
import { size } from '../../theme/fonts'
import { useColors } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'

interface ConfirmModalProps {
    visible: boolean
    displayText: string
    loading: boolean
    onConfirm: () => {}
    onCancel: () => {}
    onClose: () => {}
}

const ConfirmModal: React.FC<ConfirmModalProps> = props => {
    const { visible, displayText, loading, onConfirm, onCancel, onClose } =
        props
    const { colors } = useColors()

    const styles = StyleSheet.create({
        text: {
            fontSize: size.fontMedium,
            color: colors.textPrimary,
        },
        buttonContainer: {
            display: 'flex',
            flexDirection: 'row',
            marginTop: 10,
        },
        button: { margin: 5 },
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
                    style={styles.button}
                    text="confirm"
                    onPress={onConfirm}
                    loading={loading}
                />
            </View>
        </BaseModal>
    )
}

export default ConfirmModal
