import * as Constants from '../../utils/constants'
import ActionDisplayItem from '../atoms/ActionDisplayItem'
import { ApiError } from '../../types/services'
import BaseScreen from '../atoms/BaseScreen'
import GameHeader from '../molecules/GameHeader'
import LivePointUtilityBar from '../molecules/LivePointUtilityBar'
import PlayerActionView from './PlayerActionView'
import { PointEditContext } from '../../context/point-edit-context'
import PrimaryButton from '../atoms/PrimaryButton'
import React from 'react'
import TeamActionView from './TeamActionView'
import { isPulling } from '../../utils/point'
import { useTheme } from '../../hooks'
import { ActionFactory, ActionType, TeamActionList } from '../../types/action'
import { FlatList, StyleSheet, Text, View } from 'react-native'

const PointEditView: React.FC<{ navigation: any }> = ({ navigation }) => {
    const {
        theme: { colors, size, weight },
    } = useTheme()
    const [finishPointLoading, setFinishPointLoading] = React.useState(false)
    const [finishError, setFinishError] = React.useState<string | undefined>(
        undefined,
    )
    const [finishGameLoading, setFinishGameLoading] = React.useState(false)
    const {
        myTeamActions,
        team,
        waiting,
        game,
        point,
        error,
        onUndo,
        onFinishPoint: finishPoint,
        onFinishGame: finishGame,
    } = React.useContext(PointEditContext)

    const finishDisable = React.useMemo(() => {
        const lastAction = myTeamActions[myTeamActions.length - 1]
        return (
            finishPointLoading ||
            finishGameLoading ||
            (lastAction?.actionType !== ActionType.TEAM_ONE_SCORE &&
                lastAction?.actionType !== ActionType.TEAM_TWO_SCORE)
        )
    }, [finishGameLoading, finishPointLoading, myTeamActions])

    const teamActions = React.useMemo(() => {
        const actionListData = new TeamActionList(myTeamActions, team)
        return actionListData.actionList
    }, [myTeamActions, team])

    if (!point || !game) {
        return null
    }

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
                params: { screen: 'Profile', initial: false },
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
        if (myTeamActions.length > 0) {
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
        <BaseScreen containerWidth={100}>
            <FlatList
                data={[]}
                renderItem={() => <View />}
                ListHeaderComponent={
                    <View style={styles.container}>
                        <GameHeader header editing game={game} />
                        <LivePointUtilityBar
                            error={error}
                            loading={waiting}
                            undoDisabled={waiting}
                            onUndo={onUndoPress}
                            onEdit={() => {
                                navigation.navigate('EditGame')
                            }}
                        />
                        <PlayerActionView
                            pulling={isPulling(point, game, team)}
                            actionStack={myTeamActions}
                            loading={waiting}
                            team={team}
                        />
                        <TeamActionView actions={teamActions} />
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
                        {myTeamActions.length > 0 && (
                            <View>
                                <Text style={styles.header}>Last Action</Text>
                                <ActionDisplayItem
                                    action={ActionFactory.createFromAction(
                                        myTeamActions[myTeamActions.length - 1],
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

export default PointEditView
