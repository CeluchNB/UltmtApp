import BaseModal from '../../components/atoms/BaseModal'
import BaseScreen from '../../components/atoms/BaseScreen'
import { FirstPointProps } from '../../types/navigation'
import { GameSchema } from '../../models'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import ScreenTitle from '../../components/atoms/ScreenTitle'
import { TeamNumber } from '../../types/team'
import { useFirstPoint } from '../../hooks/game-edit-actions/use-first-point'
import { useObject } from '../../context/realm'
import { useTheme } from '../../hooks'
import { IconButton, SegmentedButtons } from 'react-native-paper'
import React, { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

const FirstPointScreen: React.FC<FirstPointProps> = ({ navigation, route }) => {
    const { gameId, team } = route.params
    const {
        theme: { colors, size, weight },
    } = useTheme()
    const [pullingTeam, setPullingTeam] = useState<string>('one')
    const game = useObject<GameSchema>('Game', gameId)
    const { mutateAsync, isLoading, error } = useFirstPoint()

    const [showJoinModal, setShowJoinModal] = useState(false)

    const onCreate = async () => {
        if (!game || !pullingTeam) return

        await mutateAsync(pullingTeam as TeamNumber)
        navigation.navigate('LiveGameEdit', { gameId: game._id, team })
    }

    const styles = StyleSheet.create({
        title: {
            alignSelf: 'center',
            marginTop: 10,
        },
        container: {
            alignSelf: 'center',
            textAlign: 'center',
            marginTop: 10,
            width: '80%',
        },
        description: {
            color: colors.gray,
            fontSize: size.fontTwenty,
            textAlign: 'center',
        },
        passcode: {
            color: colors.textPrimary,
            fontSize: size.fontThirty,
            fontWeight: weight.full,
            textAlign: 'center',
            alignSelf: 'center',
            flex: 1,
        },
        joinCodeContainer: {
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
        },
        button: {
            marginTop: 10,
        },
        errorText: {
            color: colors.error,
            fontSize: size.fontFifteen,
            marginTop: 10,
        },
        modalButton: {
            margin: 5,
        },
        segmentedButton: {
            marginTop: 10,
            marginBottom: 10,
        },
        text: {
            fontSize: size.fontTwenty,
            color: colors.textPrimary,
        },
    })

    return (
        <BaseScreen containerWidth={80}>
            <ScreenTitle style={styles.title} title="First Point" />
            <View style={styles.container}>
                <Text style={styles.description}>Join Passcode:</Text>
                <View style={styles.joinCodeContainer}>
                    <Text style={styles.passcode}>{game?.resolveCode}</Text>
                    <IconButton
                        style={styles.button}
                        iconColor={colors.textPrimary}
                        icon="help-circle"
                        size={20}
                        onPress={() => {
                            setShowJoinModal(true)
                        }}
                    />
                </View>
            </View>
            <View style={styles.container}>
                <Text style={styles.description}>My team is</Text>
                <SegmentedButtons
                    value={pullingTeam}
                    onValueChange={setPullingTeam}
                    buttons={[
                        {
                            label: 'PULLING',
                            value: team,
                            checkedColor: colors.textPrimary,
                            uncheckedColor: colors.gray,
                        },
                        {
                            label: 'RECEIVING',
                            value: team === 'one' ? 'two' : 'one',
                            checkedColor: colors.textPrimary,
                            uncheckedColor: colors.gray,
                        },
                    ]}
                    style={styles.segmentedButton}
                    theme={{
                        colors: {
                            primary: colors.textPrimary,
                        },
                    }}
                />
                <PrimaryButton
                    style={styles.button}
                    text="start"
                    disabled={isLoading}
                    loading={isLoading}
                    onPress={async () => {
                        await onCreate()
                    }}
                />

                {error !== undefined && error !== null && (
                    // TODO: GAME-REFACTOR fix
                    <Text style={styles.errorText}>{error?.toString()}</Text>
                )}
            </View>
            <BaseModal
                visible={showJoinModal}
                onClose={() => {
                    setShowJoinModal(false)
                }}>
                <Text style={styles.text}>
                    You can give this code to the other team's stat keeper. The
                    other stat keeper can join this game by selecting "Join
                    Existing Game" on the "Select Opponent" page, searching for
                    this game, then entering in this code when prompted.
                </Text>
                <PrimaryButton
                    style={[styles.button]}
                    text="confirm"
                    onPress={() => {
                        setShowJoinModal(false)
                    }}
                    loading={false}
                />
            </BaseModal>
        </BaseScreen>
    )
}

export default FirstPointScreen
