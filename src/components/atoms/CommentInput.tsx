import PrimaryButton from './PrimaryButton'
import React from 'react'
import { size } from '../../theme/fonts'
import { useColors } from '../../hooks'
import { StyleSheet, Text, TextInput, View } from 'react-native'

const CHAR_LIMIT = 160

interface CommentInputProps {
    loading: boolean
    error: string
    onSend: (comment: string) => void
}

const CommentInput: React.FC<CommentInputProps> = ({
    loading,
    error,
    onSend,
}) => {
    const { colors } = useColors()
    const [value, setValue] = React.useState('')
    const isUnderCharLimit = React.useMemo(() => {
        return value.length <= CHAR_LIMIT
    }, [value])

    const styles = StyleSheet.create({
        container: {
            padding: 5,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.darkPrimary,
            borderBottomColor: colors.textPrimary,
            borderBottomWidth: 1,
        },
        inputContainer: {
            flex: 1,
        },
        input: {
            backgroundColor: colors.darkPrimary,
            color: colors.textPrimary,
        },
        count: {
            color: isUnderCharLimit ? colors.textPrimary : colors.error,
        },
        error: {
            color: colors.error,
            fontSize: size.fontSmall,
        },
    })

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholderTextColor={colors.gray}
                    multiline={true}
                    placeholder="Add a comment..."
                    value={value}
                    onChangeText={v => {
                        setValue(v)
                    }}
                />
                {error.length > 0 && <Text style={styles.error}>{error}</Text>}
            </View>
            <View>
                <Text style={styles.count}>
                    {value.length} / {CHAR_LIMIT}
                </Text>
                <PrimaryButton
                    text="send"
                    loading={loading}
                    disabled={
                        loading || value.length === 0 || !isUnderCharLimit
                    }
                    onPress={() => {
                        setValue('')
                        onSend(value)
                    }}
                />
            </View>
        </View>
    )
}

export default CommentInput