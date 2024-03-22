import * as React from 'react'
import * as TeamData from '../services/data/team'
import { Button } from 'react-native-paper'
import { CreateTeam } from '../types/team'
import { CreateTeamProps } from '../types/navigation'
import { Picker } from '@react-native-picker/picker'
import PrimaryButton from '../components/atoms/PrimaryButton'
import TeamListItem from '../components/atoms/TeamListItem'
import UniqueUserInput from '../components/atoms/UniqueUserInput'
import UserInput from '../components/atoms/UserInput'
import { getFormFieldRules } from '../utils/form-utils'
import { useQuery } from 'react-query'
import { useTheme } from '../hooks'
import validator from 'validator'
import {
    ActionSheetIOS,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { Control, Controller, useForm, useWatch } from 'react-hook-form'

interface CreateTeamFormData {
    place: string
    name: string
    teamname: string
    season: string
}

const TeamDisplayPreview = ({
    control,
}: {
    control: Control<CreateTeamFormData>
}) => {
    const {
        theme: { colors, size, weight },
    } = useTheme()

    const place = useWatch({
        control,
        name: 'place',
    })
    const name = useWatch({ control, name: 'name' })
    const teamname = useWatch({ control, name: 'teamname' })
    const season = useWatch({ control, name: 'season' })

    const seasonSplit = season.split(' - ')

    const styles = StyleSheet.create({
        title: {
            color: colors.textPrimary,
            fontSize: size.fontTwenty,
            fontWeight: weight.bold,
            marginBottom: 10,
        },
        container: {
            width: '75%',
            alignSelf: 'center',
            marginTop: 20,
        },
    })

    const totalLength = place.length + name.length + teamname.length

    if (totalLength === 0) {
        return null
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Display preview</Text>
            <TeamListItem
                team={{
                    _id: 'test',
                    place,
                    name,
                    teamname,
                    seasonStart: seasonSplit[0],
                    seasonEnd: seasonSplit[seasonSplit.length - 1],
                }}
            />
        </View>
    )
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

    const teamname = useWatch({ control, name: 'teamname' })

    const { data: teamnameIsTaken, isLoading: teamnameLoading } = useQuery(
        [{ teamnameIsTaken: teamname }],
        () => TeamData.teamnameIsTaken(teamname),
        { staleTime: 10000, enabled: teamname.length > 1 },
    )

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
        itemTitle: {
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
            pickerStyleType: 'dropdown',
            margin: 0,
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
        datePickerButton: {
            flexDirection: 'row-reverse',
        },
    })

    return (
        <View style={styles.screen}>
            <ScrollView>
                <Controller
                    name="place"
                    control={control}
                    rules={getFormFieldRules(
                        'Team location',
                        true,
                        undefined,
                        20,
                    )}
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
                        <UniqueUserInput
                            style={styles.input}
                            placeholder="Team Handle"
                            fieldName="team handle"
                            value={value}
                            valid={teamname.length > 1}
                            taken={teamnameIsTaken}
                            loading={teamnameLoading}
                            onChange={onChange}
                        />
                    )}
                />
                {errors.teamname && (
                    <Text style={styles.error}>{errors.teamname.message}</Text>
                )}
                <Text style={styles.itemTitle}>Season</Text>
                <Controller
                    name="season"
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { onChange, value } }) => {
                        if (Platform.OS === 'android') {
                            return (
                                <Picker
                                    style={styles.picker}
                                    selectedValue={value}
                                    itemStyle={{ color: colors.textPrimary }}
                                    dropdownIconColor={colors.textPrimary}
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
                            )
                        } else {
                            return (
                                <Button
                                    textColor={colors.textPrimary}
                                    contentStyle={styles.datePickerButton}
                                    icon="chevron-down"
                                    onPress={() => {
                                        ActionSheetIOS.showActionSheetWithOptions(
                                            {
                                                options: [...years, 'Cancel'],
                                                cancelButtonIndex: years.length,
                                                userInterfaceStyle: 'dark',
                                            },
                                            (buttonIndex: number) => {
                                                if (buttonIndex === 3) return

                                                onChange(years[buttonIndex])
                                            },
                                        )
                                    }}>
                                    {value}
                                </Button>
                            )
                        }
                    }}
                />
                {error.length > 0 && <Text style={styles.error}>{error}</Text>}
                <TeamDisplayPreview control={control} />
                <PrimaryButton
                    style={styles.button}
                    text="Create"
                    onPress={handleSubmit(createTeam)}
                    loading={loading}
                />
            </ScrollView>
        </View>
    )
}

export default CreateTeamScreen
