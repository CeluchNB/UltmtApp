import React from 'react'
import { useColors } from '../../hooks'
import { Modal, StyleSheet, View } from 'react-native'

interface BaseModalProps {
    visible: boolean
    onClose: (...args: any) => void
}

const BaseModal: React.FC<BaseModalProps> = props => {
    const { visible, children, onClose } = props
    const { colors } = useColors()

    const styles = StyleSheet.create({
        modalContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'row',
            backgroundColor: `${colors.primary}50`,
        },
        modalView: {
            backgroundColor: colors.primary,
            borderColor: colors.textPrimary,
            color: colors.textPrimary,
            borderRadius: 10,
            padding: 25,
            alignItems: 'center',
            shadowColor: colors.textPrimary,
            elevation: 5,
            flex: 1,
            margin: 20,
        },
    })
    return (
        <Modal
            animationType="slide"
            visible={visible}
            onRequestClose={onClose}
            transparent={true}
            testID="base-modal">
            <View style={styles.modalContainer}>
                <View style={styles.modalView}>{children}</View>
            </View>
        </Modal>
    )
}

export default BaseModal
