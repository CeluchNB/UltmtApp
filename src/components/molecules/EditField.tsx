import * as React from 'react'
import { IconButton } from 'react-native-paper'
import UserInput from '../atoms/UserInput'
import { useColors } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'
import { size, weight } from '../../theme/fonts'

interface EditFieldProps {
    label: string
    value: string
    onSubmit: () => {}
    onEdit?: () => void
}

const EditField: React.FC<EditFieldProps> = (props: EditFieldProps) => {
    const { label, value, onSubmit, onEdit } = props

    const { colors } = useColors()
    const [active, setActive] = React.useState(false)

    const styles = StyleSheet.create({
        label: {
            fontSize: size.fontMedium,
            fontWeight: weight.bold,
            color: colors.textPrimary,
            textAlignVertical: 'center',
        },
        labelContainer: {
            flexDirection: 'row',
            display: 'flex',
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
            fontSize: size.fontMedium,
            color: colors.gray,
        },
        button: {
            alignSelf: 'center',
        },
    })

    return (
        <View>
            <View style={styles.labelContainer}>
                <Text style={styles.label}>{label}</Text>
                <IconButton
                    icon="pencil"
                    color={colors.textPrimary}
                    onPress={() => {
                        onEdit ? onEdit() : setActive(!active)
                    }}
                />
            </View>
            <View style={styles.editContainer}>
                <View style={styles.valueContainer}>
                    {active ? (
                        <UserInput placeholder={value} />
                    ) : (
                        <Text style={styles.valueDisplay}>{value}</Text>
                    )}
                </View>
                {active && (
                    <IconButton
                        style={styles.button}
                        color={colors.textPrimary}
                        icon="check"
                        onPress={onSubmit}
                    />
                )}
            </View>
        </View>
    )
}

export default EditField
