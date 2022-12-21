import PrimaryButton from './PrimaryButton'
import React from 'react'
import { useColors } from '../../hooks'
import { StyleSheet, Text, TextInput, View } from 'react-native'

const CHAR_LIMIT = 160

interface CommentInputProps {
    loading: boolean
    onSend: (comment: string) => void
}

const CommentInput: React.FC<CommentInputProps> = ({ loading, onSend }) => {
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
        input: {
            backgroundColor: colors.darkPrimary,
            color: colors.textPrimary,
            flex: 1,
        },
        count: {
            color: isUnderCharLimit ? colors.textPrimary : colors.error,
        },
    })

    return (
        <View style={styles.container}>
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
            <View>
                <Text style={styles.count}>
                    {value.length} / {CHAR_LIMIT}
                </Text>
                <PrimaryButton
                    text="send"
                    loading={loading}
                    disabled={!isUnderCharLimit}
                    onPress={() => {
                        onSend(value)
                    }}
                />
            </View>
        </View>
    )
}

export default CommentInput
