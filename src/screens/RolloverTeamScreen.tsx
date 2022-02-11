import * as React from 'react'
import CheckBox from '@react-native-community/checkbox'
import { Picker } from '@react-native-picker/picker'
import PrimaryButton from '../components/atoms/PrimaryButton'
import { RolloverTeamProps } from '../types/navigation'
import ScreenTitle from '../components/atoms/ScreenTitle'
import { useColors } from '../hooks'
import { Controller, useForm } from 'react-hook-form'
import { StyleSheet, Text, View } from 'react-native'

interface RolloverTeamFormData {
    copyPlayers: boolean
    season: string
}

const RolloverTeamScreen: React.FC<RolloverTeamProps> = ({ route }) => {
    const { colors } = useColors()
    const { id } = route.params
    const { control, handleSubmit } = useForm({
        defaultValues: {
            copyPlayers: true,
            season: '',
        },
    })
    const currentYear = new Date().getFullYear()
    const years = [
        currentYear.toString(),
        `${currentYear} - ${currentYear + 1}`,
        (currentYear + 1).toString(),
    ]

    const styles = StyleSheet.create({
        screen: {
            backgroundColor: colors.primary,
            height: '100%',
            alignItems: 'center',
        },
        checkboxContainer: {
            flexDirection: 'row',
        },
        checkbox: {
            color: colors.textPrimary,
        },
        picker: {
            color: colors.textPrimary,
            width: '75%',
            alignSelf: 'center',
            backgroundColor: colors.primary,
        },
    })

    const rollover = async (data: RolloverTeamFormData) => {
        console.log('rolling over with data', id, data)
    }

    return (
        <View style={styles.screen}>
            <ScreenTitle title="Start New Season" />
            <View style={styles.checkboxContainer}>
                <Text>Keep Current Players</Text>
                <Controller
                    name="copyPlayers"
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { onChange, value } }) => (
                        <CheckBox
                            value={value}
                            onValueChange={onChange}
                            tintColors={{
                                true: colors.textPrimary,
                                false: colors.gray,
                            }}
                            onFillColor={colors.textPrimary}
                            onCheckColor={colors.textPrimary}
                        />
                    )}
                />
            </View>
            <Text>Season</Text>
            <Controller
                name="season"
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                    <Picker
                        style={styles.picker}
                        selectedValue={value}
                        prompt="Season"
                        onValueChange={onChange}>
                        {years.map(year => {
                            return (
                                <Picker.Item
                                    value={year}
                                    label={year}
                                    key={year}
                                />
                            )
                        })}
                    </Picker>
                )}
            />
            <PrimaryButton
                text="Submit"
                loading={false}
                onPress={handleSubmit(rollover)}
            />
        </View>
    )
}

export default RolloverTeamScreen
