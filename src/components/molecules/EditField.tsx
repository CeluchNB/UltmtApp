import * as React from 'react'
import { IconButton } from 'react-native-paper'
import UserInput from '../atoms/UserInput'
import { useTheme } from '../../hooks'
import { Controller, useForm } from 'react-hook-form'
import { StyleSheet, Text, View } from 'react-native'

interface EditFieldProps {
    label: string
    initialValue: string
    onSubmit: (data: { value: string }) => {}
    onEdit?: () => void
}

const EditField: React.FC<EditFieldProps> = (props: EditFieldProps) => {
    const { label, initialValue, onSubmit, onEdit } = props

    const {
        theme: { colors, size, weight },
    } = useTheme()
    const [active, setActive] = React.useState(false)

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            value: initialValue,
        },
    })

    const styles = StyleSheet.create({
        label: {
            fontSize: size.fontTwenty,
            fontWeight: weight.bold,
            color: colors.textPrimary,
        },
        labelContainer: {
            flexDirection: 'row',
            display: 'flex',
            alignItems: 'center',
        },
        editContainer: {
            flexDirection: 'row',
            display: 'flex',
            width: '100%',
        },
        valueContainer: {
            flex: 1,
        },
        valueDisplay: {
            fontSize: size.fontTwenty,
            color: colors.gray,
        },
        button: {
            alignSelf: 'center',
        },
        error: {
            color: colors.error,
            width: '75%',
            alignSelf: 'center',
            marginTop: 2,
        },
    })

    return (
        <View>
            <View style={styles.labelContainer}>
                <Text style={styles.label}>{label}</Text>
                <IconButton
                    icon="pencil"
                    iconColor={colors.textPrimary}
                    onPress={() => {
                        onEdit ? onEdit() : setActive(!active)
                    }}
                    testID="ef-edit-button"
                />
            </View>
            <View style={styles.editContainer}>
                <View style={styles.valueContainer}>
                    {active ? (
                        <Controller
                            control={control}
                            rules={{
                                required: true,
                            }}
                            render={({ field: { onChange, value } }) => (
                                <UserInput
                                    placeholder={initialValue}
                                    onChangeText={onChange}
                                    value={value}
                                />
                            )}
                            name="value"
                        />
                    ) : (
                        <Text style={styles.valueDisplay}>{initialValue}</Text>
                    )}
                    {errors.value && (
                        <Text style={styles.error}>{errors.value.message}</Text>
                    )}
                </View>
                {active && (
                    <IconButton
                        style={styles.button}
                        iconColor={colors.textPrimary}
                        icon="check"
                        onPress={() => {
                            handleSubmit(onSubmit)()
                            setActive(false)
                        }}
                        testID="ef-submit-button"
                    />
                )}
            </View>
        </View>
    )
}

export default EditField
