import * as React from 'react'
import * as TeamServices from '../store/services/team'
import { CreateTeam } from '../types/team'
import { Picker } from '@react-native-picker/picker'
import PrimaryButton from '../components/atoms/PrimaryButton'
import { Props } from '../types/navigation'
import ScreenTitle from '../components/atoms/ScreenTitle'
import UserInput from '../components/atoms/UserInput'
import { selectAccount } from '../store/reducers/features/account/accountReducer'
import { useColors } from '../hooks'
import { useSelector } from 'react-redux'
import { Controller, useForm } from 'react-hook-form'
import { StyleSheet, Text, View } from 'react-native'
import { size, weight } from '../theme/fonts'

interface CreateTeamFormData {
    place: string
    name: string
    teamname: string
    season: string
}

const CreateTeamScreen: React.FC<Props> = ({ navigation }: Props) => {
    const account = useSelector(selectAccount)
    const [loading, setLoading] = React.useState(false)
    const currentYear = new Date().getFullYear()
    const years = [
        currentYear.toString(),
        `${currentYear} - ${currentYear + 1}`,
        (currentYear + 1).toString(),
    ]

    const { colors } = useColors()
    const { control, handleSubmit } = useForm({
        defaultValues: {
            place: '',
            name: '',
            teamname: '',
            season: currentYear.toString(),
        },
    })

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
            fontSize: size.fontMedium,
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
        const response = await TeamServices.createTeam(
            account.token,
            createTeamData,
        )
        setLoading(false)
        if (response.data) {
            navigation.goBack()
        } else {
            // HANDLE ERROR
        }
    }

    return (
        <View style={styles.screen}>
            <ScreenTitle style={styles.title} title="Create Team" />
            <Controller
                name="place"
                control={control}
                rules={{
                    required: true,
                }}
                render={({ field: { onChange, value } }) => (
                    <UserInput
                        style={styles.input}
                        placeholder="Team City"
                        onChangeText={onChange}
                        value={value}
                    />
                )}
            />
            <Controller
                name="name"
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                    <UserInput
                        style={styles.input}
                        placeholder="Team Name"
                        onChangeText={onChange}
                        value={value}
                    />
                )}
            />
            <Controller
                name="teamname"
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                    <UserInput
                        style={styles.input}
                        placeholder="Team Handle"
                        onChangeText={onChange}
                        value={value}
                    />
                )}
            />
            <Text style={styles.pickerTitle}>Season</Text>
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
                style={styles.button}
                text="Create"
                onPress={handleSubmit(createTeam)}
                loading={loading}
            />
        </View>
    )
}

export default CreateTeamScreen
