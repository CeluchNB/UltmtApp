import * as React from 'react'
import BaseModal from '../atoms/BaseModal'
import Clipboard from '@react-native-clipboard/clipboard'
import { IconButton } from 'react-native-paper'
import PrimaryButton from '../atoms/PrimaryButton'
import { useTheme } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'

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
    const {
        theme: { colors, size, weight },
    } = useTheme()

    const styles = StyleSheet.create({
        codeIntro: {
            fontSize: size.fontFifteen,
            color: colors.textSecondary,
            fontWeight: weight.full,
            alignSelf: 'center',
        },
        code: {
            fontSize: size.fontThirty,
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
        doneButton: {
            marginTop: 10,
        },
    })

    const copyCode = () => {
        Clipboard.setString(code)
    }

    return (
        <BaseModal visible={visible} onClose={onClose}>
            {code.length > 0 && (
                <View>
                    <Text style={styles.codeIntro}>Your code is</Text>
                    <View style={styles.codeContainer}>
                        <Text style={styles.code}>{code}</Text>
                        <IconButton
                            iconColor={colors.textPrimary}
                            style={styles.copyButton}
                            onPress={copyCode}
                            icon="content-copy"
                            testID="create-button"
                        />
                    </View>
                    <Text style={styles.codeIntro}>
                        This code is valid for 24 hours.
                    </Text>
                </View>
            )}
            {error.length > 0 && <Text style={styles.error}>{error}</Text>}
            <PrimaryButton
                style={styles.doneButton}
                text="done"
                loading={false}
                onPress={onClose}
            />
        </BaseModal>
    )
}

export default BulkCodeModal
