import { FieldError } from 'react-hook-form'
import React from 'react'
import { useTheme } from '../../hooks'
import { StyleSheet, Text } from 'react-native'

const FormError: React.FC<{ error?: FieldError }> = ({ error }) => {
    const {
        theme: { colors, size },
    } = useTheme()

    if (!error?.message || error?.message?.length === 0) {
        return null
    }

    const styles = StyleSheet.create({
        error: {
            marginTop: 2,
            fontSize: size.fontFifteen,
            color: colors.error,
        },
    })

    return (
        <Text style={styles.error} testID="form-error">
            {error.message}
        </Text>
    )
}

export default FormError
