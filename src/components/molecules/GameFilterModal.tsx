import BaseModal from '../atoms/BaseModal'
import PrimaryButton from '../atoms/PrimaryButton'
import { RadioButton } from 'react-native-paper'
import React from 'react'
import SecondaryButton from '../atoms/SecondaryButton'
import TextDateInput from '../atoms/TextDateInput'
import { useTheme } from '../../hooks'
import { Controller, useForm } from 'react-hook-form'
import { StyleSheet, Text, View } from 'react-native'

interface GameFilterModalProps {
    visible: boolean
    defaultValues: { live: string; after: Date; before: Date }
    onClose: (data: any) => void
}

const GameFilterModal: React.FC<GameFilterModalProps> = ({
    visible,
    defaultValues,
    onClose,
}) => {
    const {
        theme: { colors, size, weight },
    } = useTheme()
    const { control, handleSubmit, reset } = useForm({
        defaultValues,
    })

    const styles = StyleSheet.create({
        modal: {},
        titleContainer: {
            display: 'flex',
            flexDirection: 'row',
        },
        title: {
            color: colors.textPrimary,
            fontSize: size.fontThirty,
            fontWeight: weight.bold,
            flex: 1,
        },
        text: {
            color: colors.textPrimary,
            fontSize: size.fontTwenty,
            fontWeight: weight.bold,
        },
        radioLabel: { width: 250 },
        toText: {
            margin: 20,
        },
        container: {
            display: 'flex',
            flexDirection: 'row',
            marginTop: 10,
        },
        modalContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'row',
            backgroundColor: `${colors.primary}50`,
        },
        modalView: {
            backgroundColor: colors.primary,
            borderColor: colors.textPrimary,
            color: colors.textPrimary,
            borderRadius: 10,
            padding: 25,
            alignItems: 'center',
            shadowColor: colors.textPrimary,
            elevation: 5,
            flex: 1,
        },
    })

    return (
        <BaseModal
            onClose={() => {
                onClose({ ...defaultValues })
            }}
            visible={visible}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>Filters</Text>
                <SecondaryButton
                    text="clear"
                    onPress={async () => {
                        reset()
                    }}
                />
            </View>
            <View>
                <View style={styles.container}>
                    <Controller
                        control={control}
                        name="live"
                        render={({ field: { value, onChange } }) => (
                            <RadioButton.Group
                                onValueChange={onChange}
                                value={value}>
                                <View style={styles.container}>
                                    <Text
                                        style={{
                                            ...styles.text,
                                            ...styles.radioLabel,
                                        }}>
                                        All Games
                                    </Text>
                                    <RadioButton
                                        value="undefined"
                                        color={colors.textPrimary}
                                        uncheckedColor={colors.textSecondary}
                                    />
                                </View>
                                <View style={styles.container}>
                                    <Text
                                        style={{
                                            ...styles.text,
                                            ...styles.radioLabel,
                                        }}>
                                        Live Games
                                    </Text>
                                    <RadioButton
                                        value="true"
                                        color={colors.textPrimary}
                                        uncheckedColor={colors.textSecondary}
                                    />
                                </View>
                                <View style={styles.container}>
                                    <Text
                                        style={{
                                            ...styles.text,
                                            ...styles.radioLabel,
                                        }}>
                                        Completed Games
                                    </Text>
                                    <RadioButton
                                        value="false"
                                        color={colors.textPrimary}
                                        uncheckedColor={colors.textSecondary}
                                    />
                                </View>
                            </RadioButton.Group>
                        )}
                    />
                </View>
                <View style={styles.container}>
                    <Controller
                        control={control}
                        name="after"
                        render={({ field: { value, onChange } }) => (
                            <TextDateInput
                                value={value}
                                onChange={onChange}
                                style={{ backgroundColor: colors.darkPrimary }}
                            />
                        )}
                    />
                    <Text style={[styles.text, styles.toText]}>to</Text>
                    <Controller
                        control={control}
                        name="before"
                        render={({ field: { value, onChange } }) => (
                            <TextDateInput
                                value={value}
                                onChange={onChange}
                                style={{ backgroundColor: colors.darkPrimary }}
                            />
                        )}
                    />
                </View>
            </View>
            <PrimaryButton
                text="done"
                onPress={async () => {
                    handleSubmit(onClose)()
                }}
                loading={false}
            />
        </BaseModal>
    )
}

export default GameFilterModal
