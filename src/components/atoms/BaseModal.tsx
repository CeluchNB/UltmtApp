import React from 'react'
import { useTheme } from '../../hooks'
import {
    Keyboard,
    Modal,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native'

interface BaseModalProps {
    visible: boolean
    children?: React.ReactNode
    onClose: (...args: any) => void
}

const BaseModal: React.FC<BaseModalProps> = props => {
    const { visible, children, onClose } = props
    const {
        theme: { colors },
    } = useTheme()

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
            backgroundColor: colors.darkPrimary,
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
            <TouchableOpacity
                style={styles.modalContainer}
                onPressOut={onClose}
                activeOpacity={1}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalView}>{children}</View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    )
}

export default BaseModal
