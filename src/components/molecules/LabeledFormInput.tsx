import React from 'react'
import UserInput from '../atoms/UserInput'
import { useColors } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'
import { size, weight } from '../../theme/fonts'

interface LabeledFormInputProps {
    label: string
    value: any
    keyboardType?: 'default' | 'number-pad'
    unit?: string
    error?: string
    onChange: (...event: any[]) => void
    children?: React.ReactNode
}

const LabeledFormInput: React.FC<LabeledFormInputProps> = props => {
    const { colors } = useColors()
    const {
        children,
        label,
        value,
        keyboardType = 'default',
        unit,
        error,
        onChange,
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
            fontSize: size.fontMedium,
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
            fontSize: size.fontSmall,
        },
    })
    return (
        <View style={styles.container}>
            <Text style={styles.labelText}>{label}</Text>
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
