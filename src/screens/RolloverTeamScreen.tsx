import * as React from 'react'
import * as TeamData from '../services/data/team'
import CheckBox from '@react-native-community/checkbox'
import { Picker } from '@react-native-picker/picker'
import PrimaryButton from '../components/atoms/PrimaryButton'
import { Props } from '../types/navigation'
import ScreenTitle from '../components/atoms/ScreenTitle'
import { Team } from '../types/team'
import { Controller, useForm } from 'react-hook-form'
import { StyleSheet, Text, View } from 'react-native'
import {
    selectTeam,
    setTeam,
} from '../store/reducers/features/team/managedTeamReducer'
import { size, weight } from '../theme/fonts'
import { useColors, useLazyData } from '../hooks'
import { useDispatch, useSelector } from 'react-redux'

interface RolloverTeamFormData {
    copyPlayers: boolean
    season: string
}

const RolloverTeamScreen: React.FC<Props> = ({ navigation }) => {
    const { colors } = useColors()
    const dispatch = useDispatch()
    const team = useSelector(selectTeam)
    const currentYear = new Date().getFullYear()
    const years = [
        currentYear.toString(),
        `${currentYear} - ${currentYear + 1}`,
        (currentYear + 1).toString(),
    ]
    const { control, handleSubmit } = useForm({
        defaultValues: {
            copyPlayers: false,
            season: years[0],
        },
    })

    const {
        data: teamData,
        fetch,
        loading,
        error,
    } = useLazyData<Team>(TeamData.rollover)

    const rolloverTeam = async (data: RolloverTeamFormData) => {
        const seasonArray = data.season.split(' - ')
        const seasonStart = seasonArray[0]
        const seasonEnd = seasonArray[seasonArray.length - 1]

        await fetch(team?._id || '', data.copyPlayers, seasonStart, seasonEnd)
    }

    React.useEffect(() => {
        if (teamData) {
            dispatch(setTeam(teamData))
            navigation.navigate('ManagedTeamDetails', {
                id: teamData._id,
                name: teamData.name,
                place: teamData.place,
            })
        }
    })

    const styles = StyleSheet.create({
        screen: {
            backgroundColor: colors.primary,
            height: '100%',
            alignItems: 'center',
        },
        checkboxContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            width: '75%',
        },
        checkboxTitle: {
            flex: 1,
        },
        checkbox: {
            alignSelf: 'center',
            marginTop: 25,
        },
        sectionTitle: {
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
        warning: {
            color: colors.textSecondary,
            alignSelf: 'center',
            width: '75%',
            marginBottom: 10,
        },
        error: {
            color: colors.error,
            alignSelf: 'center',
            width: '75%',
            marginBottom: 10,
        },
    })

    return (
        <View style={styles.screen}>
            <ScreenTitle title="Start New Season" />
            <View style={styles.checkboxContainer}>
                <Text
                    style={{ ...styles.sectionTitle, ...styles.checkboxTitle }}>
                    Keep Current Players
                </Text>
                <Controller
                    name="copyPlayers"
                    control={control}
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
                            style={styles.checkbox}
                        />
                    )}
                />
            </View>
            <Text style={styles.warning}>
                You can always add and drop players later
            </Text>
            <Text style={styles.sectionTitle}>Season</Text>
            <Controller
                name="season"
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                    <Picker
                        style={styles.picker}
                        selectedValue={value}
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
                )}
            />
            <Text style={styles.warning}>
                Warning: You will not be able to edit the current season after
                starting the new season.
            </Text>
            <Text style={styles.warning}>
                Pending requests for this team will all be deleted.
            </Text>
            {error && <Text style={styles.error}>{error.message}</Text>}
            <PrimaryButton
                text="Submit"
                loading={loading}
                onPress={handleSubmit(rolloverTeam)}
            />
        </View>
    )
}

export default RolloverTeamScreen
