import * as Constants from '../../utils/constants'
import ActionDisplayItem from '../../components/atoms/ActionDisplayItem'
import { ActionType } from '../../types/action'
import { ApiError } from '../../types/services'
import BaseScreen from '../../components/atoms/BaseScreen'
import GameHeader from '../../components/molecules/GameHeader'
import { LivePointEditProps } from '../../types/navigation'
import LivePointStatus from '../../components/molecules/LivePointStatus'
import PlayerActionView from '../../components/organisms/PlayerActionView'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import React from 'react'
import TeamActionView from '../../components/organisms/TeamActionView'
import { getValidTeamActions } from '../../utils/action'
import { isPulling } from '../../utils/point'
import { useColors } from '../../hooks'
import { useGameEditor } from '../../hooks'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { size, weight } from '../../theme/fonts'

const LivePointEditScreen: React.FC<LivePointEditProps> = ({ navigation }) => {
    // hooks
    const { colors } = useColors()
    const [finishPointLoading, setFinishPointLoading] = React.useState(false)
    const [finishError, setFinishError] = React.useState<string | undefined>(
        undefined,
    )
    const [finishGameLoading, setFinishGameLoading] = React.useState(false)
    const {
        actions,
        activePlayers,
        error,
        game,
        lastAction,
        myTeamActions,
        point,
        waiting,
        team,
        onPlayerAction,
        onTeamAction,
        onUndo,
        onFinishPoint: finishPoint,
        onFinishGame: finishGame,
    } = useGameEditor()

    const finishDisable = React.useMemo(() => {
        return (
            finishPointLoading ||
            finishGameLoading ||
            (lastAction?.actionType !== ActionType.TEAM_ONE_SCORE &&
                lastAction?.actionType !== ActionType.TEAM_TWO_SCORE)
        )
    }, [finishGameLoading, finishPointLoading, lastAction?.actionType])

    const onFinishPoint = async () => {
        try {
            setFinishPointLoading(true)
            setFinishError(undefined)
            await finishPoint()

            navigation.reset({ index: 0, routes: [{ name: 'SelectPlayers' }] })
        } catch (e) {
            setFinishError(
                (e as ApiError).message ?? Constants.FINISH_POINT_ERROR,
            )
        } finally {
            setFinishPointLoading(false)
        }
    }

    const onFinishGame = async () => {
        try {
            setFinishGameLoading(true)
            await finishGame()
            // navigation.reset({ index: 0, routes: [{ name:  }]})
            navigation.navigate('Tabs', {
                screen: 'Account',
                params: { screen: 'Profile' },
            })
        } catch (e) {
            setFinishError(
                (e as ApiError).message ?? Constants.FINISH_GAME_ERROR,
            )
        } finally {
            setFinishGameLoading(false)
        }
    }

    const onUndoPress = async () => {
        if (actions.length > 0) {
            await onUndo()
        } else {
            navigation.navigate('SelectPlayers')
        }
    }

    const styles = StyleSheet.create({
        error: {
            color: colors.error,
            fontSize: size.fontFifteen,
        },
        header: {
            color: colors.textPrimary,
            fontSize: size.fontMedium,
            fontWeight: weight.full,
            margin: 5,
        },
        button: {
            margin: 5,
        },
    })

    return (
        <BaseScreen containerWidth="80%">
            <FlatList
                data={[]}
                renderItem={() => <View />}
                ListHeaderComponent={
                    <View>
                        <GameHeader game={game} />
                        <LivePointStatus
                            error={error}
                            loading={waiting}
                            undoDisabled={false}
                            onUndo={onUndoPress}
                        />
                        <PlayerActionView
                            players={activePlayers}
                            pulling={isPulling(point, game, team)}
                            actionStack={myTeamActions}
                            loading={waiting}
                            onAction={onPlayerAction}
                        />
                        <TeamActionView
                            actions={getValidTeamActions(myTeamActions)}
                            onAction={onTeamAction}
                        />
                        <PrimaryButton
                            style={styles.button}
                            onPress={onFinishPoint}
                            text="next point"
                            loading={finishPointLoading}
                            disabled={finishDisable}
                        />
                        <PrimaryButton
                            style={styles.button}
                            onPress={onFinishGame}
                            text="finish game"
                            loading={finishGameLoading}
                            disabled={finishDisable}
                        />
                        {finishError && (
                            <Text style={styles.error}>{finishError}</Text>
                        )}
                        {actions.length > 0 && (
                            <View>
                                <Text style={styles.header}>Last Action</Text>
                                <ActionDisplayItem
                                    action={actions[actions.length - 1]}
                                    teamOne={game.teamOne}
                                    teamTwo={game.teamTwo}
                                />
                            </View>
                        )}
                    </View>
                }
            />
        </BaseScreen>
    )
}

export default LivePointEditScreen
