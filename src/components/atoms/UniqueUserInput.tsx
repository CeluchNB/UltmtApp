import React from 'react'
import UserInput from './UserInput'
import { useTheme } from '../../hooks'
import {
    ActivityIndicator,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from 'react-native'

interface UniqueUserInputProps {
    placeholder: string
    loading: boolean
    taken?: boolean
    valid: boolean
    fieldName: string
    value: string
    onChange?: (...event: any[]) => void
    style?: StyleProp<ViewStyle>
}

const UniqueUserInput: React.FC<UniqueUserInputProps> = props => {
    const {
        placeholder,
        loading,
        taken,
        valid,
        fieldName,
        value,
        style,
        onChange,
    } = props

    const {
        theme: { colors },
    } = useTheme()

    const styles = StyleSheet.create({
        error: {
            color: colors.error,
            width: '75%',
            alignSelf: 'center',
        },
        affirmation: {
            color: colors.success,
            width: '75%',
            alignSelf: 'center',
        },
        activityIndicator: {
            alignItems: 'flex-start',
            alignSelf: 'center',
            width: '75%',
        },
    })

    return (
        <View>
            <UserInput
                style={style}
                placeholder={placeholder}
                value={value}
                onChangeText={onChange}
            />
            <View>
                {loading && (
                    <ActivityIndicator
                        style={styles.activityIndicator}
                        color={colors.textPrimary}
                        size="small"
                    />
                )}
                {taken === true && valid && (
                    <Text style={styles.error}>
                        This {fieldName} is already taken.
                    </Text>
                )}
                {taken === false && valid && (
                    <Text style={styles.affirmation}>
                        You can use this {fieldName}.
                    </Text>
                )}
            </View>
        </View>
    )
}

export default UniqueUserInput
