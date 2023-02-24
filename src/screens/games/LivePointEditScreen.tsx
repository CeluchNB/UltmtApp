import * as Constants from '../../utils/constants'
import ActionDisplayItem from '../../components/atoms/ActionDisplayItem'
import { ApiError } from '../../types/services'
import BaseScreen from '../../components/atoms/BaseScreen'
import GameHeader from '../../components/molecules/GameHeader'
import { LivePointEditProps } from '../../types/navigation'
import LivePointUtilityBar from '../../components/molecules/LivePointUtilityBar'
import PlayerActionView from '../../components/organisms/PlayerActionView'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import React from 'react'
import TeamActionView from '../../components/organisms/TeamActionView'
import { isPulling } from '../../utils/point'
import {
    ActionFactory,
    ActionType,
    TeamActionListData,
} from '../../types/action'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { useGameEditor, useTheme } from '../../hooks'

const LivePointEditScreen: React.FC<LivePointEditProps> = ({ navigation }) => {
    // hooks
    const {
        theme: { colors, size, weight },
    } = useTheme()
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
        onAction,
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

    const teamActions = React.useMemo(() => {
        const actionListData = new TeamActionListData(myTeamActions, team)
        return actionListData.actionList
    }, [myTeamActions, team])

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
        container: {
            width: '80%',
            alignSelf: 'center',
        },
        error: {
            color: colors.error,
            fontSize: size.fontFifteen,
        },
        header: {
            color: colors.textPrimary,
            fontSize: size.fontTwenty,
            fontWeight: weight.full,
            margin: 5,
        },
        button: {
            margin: 5,
        },
    })

    return (
        <BaseScreen containerWidth="100%">
            <FlatList
                data={[]}
                renderItem={() => <View />}
                ListHeaderComponent={
                    <View style={styles.container}>
                        <GameHeader game={game} />
                        <LivePointUtilityBar
                            error={error}
                            loading={waiting}
                            undoDisabled={false}
                            onUndo={onUndoPress}
                            onEdit={() => {
                                navigation.navigate('EditGame')
                            }}
                        />
                        <PlayerActionView
                            players={activePlayers}
                            pulling={isPulling(point, game, team)}
                            actionStack={myTeamActions}
                            loading={waiting}
                            team={team}
                            onAction={onAction}
                        />
                        <TeamActionView
                            actions={teamActions}
                            onAction={onAction}
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
                                    // TODO: Change this
                                    action={ActionFactory.createFromAction(
                                        actions[actions.length - 1],
                                    )}
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
