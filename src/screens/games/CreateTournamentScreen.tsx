import BaseScreen from '../../components/atoms/BaseScreen'
import { CreateTournamentProps } from '../../types/navigation'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import React from 'react'
import TextDateInput from '../../components/atoms/TextDateInput'
import UserInput from '../../components/atoms/UserInput'
import { useTheme } from '../../hooks'
import { Controller, useForm } from 'react-hook-form'
import { IconButton, Tooltip } from 'react-native-paper'
import { StyleSheet, Text, View } from 'react-native'

const CreateTournamentScreen: React.FC<CreateTournamentProps> = ({ route }) => {
    const { name } = route.params
    const {
        theme: { colors, size, weight },
    } = useTheme()

    const { control, handleSubmit } = useForm({
        defaultValues: {
            name,
            eventId: '',
            startDate: new Date(),
            endDate: new Date(),
        },
    })

    const styles = StyleSheet.create({
        fieldContainer: {
            marginTop: 20,
        },
        input: {
            width: '100%',
            alignSelf: 'center',
        },
        label: {
            color: colors.textPrimary,
            fontWeight: weight.bold,
        },
        dateLabel: {
            width: '20%',
        },
        textLabel: {
            fontSize: size.fontTwenty,
        },
    })

    return (
        <BaseScreen containerWidth="80%">
            <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value } }) => {
                    return (
                        <View style={[styles.fieldContainer]}>
                            <Text style={[styles.label, styles.textLabel]}>
                                Tournament Name
                            </Text>
                            <UserInput
                                placeholder="Name"
                                onChangeText={onChange}
                                value={value}
                                style={styles.input}
                            />
                        </View>
                    )
                }}
            />
            <Controller
                control={control}
                name="eventId"
                render={({ field: { onChange, value } }) => {
                    return (
                        <View style={[styles.fieldContainer]}>
                            <View
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}>
                                <Text style={[styles.label, styles.textLabel]}>
                                    Tournament ID
                                </Text>
                                <Tooltip
                                    title={'i.e. "nationals00"'}
                                    enterTouchDelay={200}>
                                    <IconButton
                                        iconColor={colors.textPrimary}
                                        icon="help-circle"
                                        size={20}
                                        onPress={() => {}}
                                        style={{ margin: 0 }}
                                    />
                                </Tooltip>
                            </View>
                            <UserInput
                                placeholder="Unique Identifier"
                                onChangeText={onChange}
                                value={value}
                            />
                        </View>
                    )
                }}
            />
            <View style={{ display: 'flex', flexDirection: 'column' }}>
                <Controller
                    control={control}
                    name="startDate"
                    render={({ field: { onChange, value } }) => {
                        return (
                            <View style={[styles.fieldContainer]}>
                                <Text style={[styles.label, styles.dateLabel]}>
                                    Start
                                </Text>
                                <TextDateInput
                                    value={value}
                                    onChange={onChange}
                                />
                            </View>
                        )
                    }}
                />
                <Controller
                    control={control}
                    name="endDate"
                    render={({ field: { onChange, value } }) => {
                        return (
                            <View style={[styles.fieldContainer]}>
                                <Text style={[styles.label, styles.dateLabel]}>
                                    End
                                </Text>
                                <TextDateInput
                                    value={value}
                                    onChange={onChange}
                                />
                            </View>
                        )
                    }}
                />
            </View>
            <PrimaryButton text="create" onPress={() => {}} loading={false} />
        </BaseScreen>
    )
}

export default CreateTournamentScreen
