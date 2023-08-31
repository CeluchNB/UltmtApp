import * as React from 'react'
import * as TeamData from '../services/data/team'
import { CreateTeam } from '../types/team'
import { CreateTeamProps } from '../types/navigation'
import { Picker } from '@react-native-picker/picker'
import PrimaryButton from '../components/atoms/PrimaryButton'
import UserInput from '../components/atoms/UserInput'
import { getFormFieldRules } from '../utils/form-utils'
import { useTheme } from '../hooks'
import validator from 'validator'
import { Controller, useForm } from 'react-hook-form'
import { StyleSheet, Text, View } from 'react-native'

interface CreateTeamFormData {
    place: string
    name: string
    teamname: string
    season: string
}

const CreateTeamScreen: React.FC<CreateTeamProps> = ({ navigation }) => {
    const [loading, setLoading] = React.useState(false)
    const currentYear = new Date().getFullYear()
    const years = [
        currentYear.toString(),
        `${currentYear} - ${currentYear + 1}`,
        (currentYear + 1).toString(),
    ]
    const [error, setError] = React.useState('')

    const {
        theme: { colors, size, weight },
    } = useTheme()
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            place: '',
            name: '',
            teamname: '',
            season: currentYear.toString(),
        },
    })

    const createTeam = async (data: CreateTeamFormData) => {
        setLoading(true)
        const seasonSplit = data.season.split(' - ')
        const createTeamData: CreateTeam = {
            place: data.place,
            name: data.name,
            teamname: data.teamname,
            seasonStart: seasonSplit[0],
            seasonEnd: seasonSplit[seasonSplit.length - 1],
        }

        try {
            await TeamData.createTeam(createTeamData)
            setLoading(false)
            navigation.goBack()
        } catch (e: any) {
            setLoading(false)
            setError(e.message ?? 'Error creating this team. Please try again')
        }
    }

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
            backgroundColor: colors.primary,
        },
        title: { alignSelf: 'center' },
        input: {
            width: '75%',
            alignSelf: 'center',
            marginTop: 20,
        },
        pickerTitle: {
            color: colors.textPrimary,
            fontSize: size.fontTwenty,
            fontWeight: weight.bold,
            width: '75%',
            alignSelf: 'center',
            marginTop: 20,
        },
        picker: {
            color: colors.textPrimary,
            width: '75%',
            alignSelf: 'center',
            backgroundColor: colors.primary,
        },
        button: {
            marginTop: 20,
            alignSelf: 'center',
        },
        error: {
            fontSize: size.fontFifteen,
            color: colors.error,
            width: '75%',
            alignSelf: 'center',
        },
    })

    return (
        <View style={styles.screen}>
            <Controller
                name="place"
                control={control}
                rules={getFormFieldRules('Team location', true, undefined, 20)}
                render={({ field: { onChange, value } }) => (
                    <UserInput
                        style={styles.input}
                        placeholder="Team Location"
                        onChangeText={onChange}
                        value={value}
                        testID="team-place-input"
                    />
                )}
            />
            {errors.place && (
                <Text style={styles.error}>{errors.place.message}</Text>
            )}
            <Controller
                name="name"
                control={control}
                rules={getFormFieldRules('Team name', true, undefined, 20)}
                render={({ field: { onChange, value } }) => (
                    <UserInput
                        style={styles.input}
                        placeholder="Team Name"
                        onChangeText={onChange}
                        value={value}
                        testID="team-name-input"
                    />
                )}
            />
            {errors.name && (
                <Text style={styles.error}>{errors.name.message}</Text>
            )}
            <Controller
                name="teamname"
                control={control}
                rules={getFormFieldRules('Team handle', true, 2, 20, [
                    {
                        test: (v: string) => {
                            return validator.isAlphanumeric(v)
                        },
                        message:
                            'Team handle can only contain letters and numbers',
                    },
                ])}
                render={({ field: { onChange, value } }) => (
                    <UserInput
                        style={styles.input}
                        placeholder="Team Handle"
                        onChangeText={onChange}
                        value={value}
                        testID="team-handle-input"
                    />
                )}
            />
            {errors.teamname && (
                <Text style={styles.error}>{errors.teamname.message}</Text>
            )}
            <Text style={styles.pickerTitle}>Season</Text>
            <Controller
                name="season"
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                    <Picker
                        style={styles.picker}
                        selectedValue={value}
                        itemStyle={{ color: colors.textPrimary }}
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
            {error.length > 0 && <Text style={styles.error}>{error}</Text>}
            <PrimaryButton
                style={styles.button}
                text="Create"
                onPress={handleSubmit(createTeam)}
                loading={loading}
            />
        </View>
    )
}

export default CreateTeamScreen
