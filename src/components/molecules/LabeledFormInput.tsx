import React from 'react'
import UserInput from '../atoms/UserInput'
import { useTheme } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'

interface LabeledFormInputProps {
    label: string
    value: any
    keyboardType?: 'default' | 'number-pad'
    unit?: string
    error?: string
    onChange: (...event: any[]) => void
    children?: React.ReactNode
    onLabelPress?: () => void
}

const LabeledFormInput: React.FC<LabeledFormInputProps> = props => {
    const {
        theme: { colors, size, weight },
    } = useTheme()
    const {
        children,
        label,
        value,
        keyboardType = 'default',
        unit,
        error,
        onChange,
        onLabelPress,
    } = props

    const styles = StyleSheet.create({
        container: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 5,
            marginBottom: 5,
        },
        labelText: {
            fontSize: size.fontTwenty,
            fontWeight: weight.bold,
            color: colors.textPrimary,
            width: '50%',
        },
        input: {
            width: unit ? '30%' : '50%',
        },
        unitText: {
            fontSize: size.fontFifteen,
            fontWeight: weight.bold,
            color: colors.gray,
            marginLeft: 10,
        },
        errorText: {
            color: colors.error,
            fontSize: size.fontTen,
        },
    })
    return (
        <View style={styles.container}>
            <Text style={styles.labelText} onPress={onLabelPress}>
                {label}
            </Text>
            <View style={styles.input}>
                {children ? (
                    children
                ) : (
                    <UserInput
                        placeholder={label}
                        onChangeText={onChange}
                        value={value.toString()}
                        keyboardType={keyboardType}
                    />
                )}
                {error !== undefined && (
                    <Text style={styles.errorText}>{error}</Text>
                )}
            </View>
            {unit && <Text style={styles.unitText}>{unit}</Text>}
        </View>
    )
}

export default LabeledFormInput
