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
    onChange: (...event: any[]) => void
}

const LabeledFormInput: React.FC<LabeledFormInputProps> = props => {
    const { colors } = useColors()
    const {
        children,
        label,
        value,
        keyboardType = 'default',
        unit,
        onChange,
    } = props

    const styles = StyleSheet.create({
        container: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
        },
        labelText: {
            fontSize: size.fontLarge,
            fontWeight: weight.bold,
            color: colors.textPrimary,
            width: '50%',
        },
        input: {
            width: unit ? '30%' : '50%',
        },
        unitText: {
            fontSize: size.fontMedium,
            fontWeight: weight.bold,
            color: colors.gray,
            marginLeft: 10,
        },
    })
    return (
        <View style={styles.container}>
            <Text style={styles.labelText}>{label}</Text>
            {children ? (
                children
            ) : (
                <UserInput
                    style={styles.input}
                    placeholder={label}
                    onChangeText={onChange}
                    value={value.toString()}
                    keyboardType={keyboardType}
                />
            )}
            {unit && <Text style={styles.unitText}>{unit}</Text>}
        </View>
    )
}

export default LabeledFormInput
