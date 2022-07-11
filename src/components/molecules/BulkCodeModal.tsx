import * as React from 'react'
import Clipboard from '@react-native-clipboard/clipboard'
import { IconButton } from 'react-native-paper'
import PrimaryButton from '../atoms/PrimaryButton'
import { useColors } from '../../hooks'
import { Modal, StyleSheet, Text, View } from 'react-native'
import { size, weight } from '../../theme/fonts'

interface BulkCodeModalProps {
    code: string
    error: string
    visible: boolean
    onClose: () => void
}
const BulkCodeModal: React.FC<BulkCodeModalProps> = ({
    code,
    error,
    visible,
    onClose,
}) => {
    const { colors } = useColors()

    const styles = StyleSheet.create({
        codeIntro: {
            fontSize: size.fontFifteen,
            color: colors.textSecondary,
            fontWeight: weight.full,
            alignSelf: 'center',
        },
        code: {
            fontSize: size.fontLarge,
            letterSpacing: 2,
            color: colors.textSecondary,
            fontWeight: weight.full,
            marginBottom: 10,
        },
        codeContainer: {
            flexDirection: 'row',
        },
        copyButton: {
            flex: 0,
        },
        error: {
            fontSize: size.fontFifteen,
            color: colors.error,
            marginBottom: 10,
        },
        modalContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 30,
        },
        modalView: {
            margin: 20,
            backgroundColor: colors.darkGray,
            borderRadius: 10,
            padding: 25,
            alignItems: 'center',
            shadowColor: colors.darkPrimary,
            shadowOffset: {
                width: 5,
                height: 5,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
        },
    })

    const copyCode = () => {
        Clipboard.setString(code)
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            testID="bulk-code-modal">
            <View style={styles.modalContainer}>
                <View style={styles.modalView}>
                    {code.length > 0 && (
                        <View>
                            <Text style={styles.codeIntro}>Your code is</Text>
                            <View style={styles.codeContainer}>
                                <Text style={styles.code}>{code}</Text>
                                <IconButton
                                    color={colors.darkPrimary}
                                    style={styles.copyButton}
                                    onPress={copyCode}
                                    icon="content-copy"
                                    testID="create-button"
                                />
                            </View>
                        </View>
                    )}
                    {error.length > 0 && (
                        <Text style={styles.error}>{error}</Text>
                    )}
                    <PrimaryButton
                        text="done"
                        loading={false}
                        onPress={async () => {
                            onClose()
                        }}
                    />
                </View>
            </View>
        </Modal>
    )
}

export default BulkCodeModal
