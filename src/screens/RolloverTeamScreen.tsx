import * as React from 'react'
import { ApiError } from '../types/services'
import BaseScreen from '../components/atoms/BaseScreen'
import { Button } from 'react-native-paper'
import CheckBox from '@react-native-community/checkbox'
import { Picker } from '@react-native-picker/picker'
import PrimaryButton from '../components/atoms/PrimaryButton'
import { RolloverTeamProps } from '../types/navigation'
import { rollover } from '../services/data/team'
import { useMutation } from 'react-query'
import { useTheme } from '../hooks'
import {
    ActionSheetIOS,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import {
    selectTeam,
    setTeam,
} from '../store/reducers/features/team/managedTeamReducer'
import { useDispatch, useSelector } from 'react-redux'

interface RolloverTeamFormData {
    copyPlayers: boolean
    season: string
}

const RolloverTeamScreen: React.FC<RolloverTeamProps> = ({ navigation }) => {
    const {
        theme: { colors, size, weight },
    } = useTheme()
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

    const { mutate, isLoading, error, isError } = useMutation(
        ({
            teamId,
            copyPlayers,
            seasonStart,
            seasonEnd,
        }: {
            teamId: string
            copyPlayers: boolean
            seasonStart: string
            seasonEnd: string
        }) => rollover(teamId, copyPlayers, seasonStart, seasonEnd),
    )

    const rolloverTeam = async (data: RolloverTeamFormData) => {
        const seasonArray = data.season.split(' - ')
        const seasonStart = seasonArray[0]
        const seasonEnd = seasonArray[seasonArray.length - 1]

        mutate(
            {
                teamId: team?._id || '',
                copyPlayers: data.copyPlayers,
                seasonStart,
                seasonEnd,
            },
            {
                onSuccess(teamData) {
                    dispatch(setTeam(teamData))
                    navigation.navigate('ManagedTeamDetails', {
                        id: teamData._id,
                    })
                },
            },
        )
    }

    const styles = StyleSheet.create({
        screen: {
            backgroundColor: colors.primary,
            height: '100%',
            alignItems: 'center',
        },
        scrollView: {
            alignItems: 'center',
        },
        explainText: {
            color: colors.textPrimary,
            fontSize: size.fontTwenty,
            width: '75%',
            alignSelf: 'center',
            textAlign: 'center',
        },
        checkboxContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            width: '75%',
            marginBottom: 15,
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
            fontSize: size.fontTwenty,
            fontWeight: weight.bold,
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
            marginBottom: 10,
        },
        error: {
            color: colors.error,
            alignSelf: 'center',
            marginBottom: 10,
        },
        datePickerButton: {
            flexDirection: 'row-reverse',
        },
    })

    return (
        <BaseScreen containerWidth={90}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                <Text style={styles.explainText}>
                    Create a new team with the same name for a new year
                </Text>
                <View style={styles.checkboxContainer}>
                    <Text
                        style={{
                            ...styles.sectionTitle,
                            ...styles.checkboxTitle,
                        }}>
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
                                boxType="square"
                                tintColor={colors.gray}
                                onFillColor={colors.textPrimary}
                                onCheckColor={colors.primary}
                                onTintColor={colors.textPrimary}
                                onAnimationType="bounce"
                                offAnimationType="bounce"
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
                <Text style={styles.warning}>
                    Warning: You will not be able to edit the current season
                    after starting the new season.
                </Text>
                <Text style={styles.warning}>
                    Pending requests for this team will all be deleted.
                </Text>
                {isError && (
                    <Text style={styles.error}>
                        {(error as ApiError).message}
                    </Text>
                )}
                <PrimaryButton
                    text="Submit"
                    loading={isLoading}
                    onPress={handleSubmit(rolloverTeam)}
                />
            </ScrollView>
        </BaseScreen>
    )
}

export default RolloverTeamScreen
