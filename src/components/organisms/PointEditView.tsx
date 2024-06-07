import { LiveGameContext } from '../../context/live-game-context'
import LivePointUtilityBar from '../molecules/LivePointUtilityBar'
import PlayerActionView from './PlayerActionView'
import { PointEditContext } from '../../context/point-edit-context'
import TeamActionView from './TeamActionView'
import { isPulling } from '../../utils/point'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '../../hooks'
import { ActionType, TeamActionList } from '../../types/action'
import { FlatList, StyleSheet, View } from 'react-native'
import React, { useContext, useMemo } from 'react'

const PointEditView: React.FC<{}> = () => {
    const {
        theme: { colors, size, weight },
    } = useTheme()
    const {
        game,
        point,
        team,
        finishGameLoading,
        finishGameError,
        finishGame,
    } = useContext(LiveGameContext)
    const {
        myTeamActions,
        waiting,
        error: actionError,
        onUndo,
        nextPoint,
    } = useContext(PointEditContext)
    const navigation = useNavigation()

    const error = useMemo(() => {
        return [finishGameError, actionError, nextPoint.error]
            .filter(msg => !!msg)
            .join(' ')
    }, [finishGameError, actionError, nextPoint])

    const finishGameDisabled = useMemo(() => {
        const lastAction = myTeamActions[myTeamActions.length - 1]
        return (
            !lastAction ||
            ![ActionType.TEAM_ONE_SCORE, ActionType.TEAM_TWO_SCORE].includes(
                lastAction.actionType,
            )
        )
    }, [myTeamActions])

    const teamActions = React.useMemo(() => {
        const actionListData = new TeamActionList(myTeamActions, team)
        return actionListData.actionList
    }, [myTeamActions, team])

    if (!point || !game) {
        return null
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
        <View>
            <FlatList
                data={[]}
                renderItem={() => <View />}
                ListHeaderComponent={
                    <View style={styles.container}>
                        <LivePointUtilityBar
                            error={error}
                            loading={waiting}
                            undoDisabled={waiting || myTeamActions.length === 0}
                            onUndo={onUndo}
                            onEdit={() => {
                                navigation.navigate('LiveGame', {
                                    screen: 'EditGame',
                                    params: {
                                        gameId: game._id,
                                    },
                                })
                            }}
                            actionButton={{
                                title: 'Finish Game',
                                loading: finishGameLoading,
                                leftIcon: 'arrow-right',
                                disabled: finishGameDisabled,
                                onAction: finishGame,
                            }}
                        />
                        <PlayerActionView
                            pulling={isPulling(point, game, team)}
                            actionStack={myTeamActions}
                            loading={waiting}
                            team={team}
                        />
                        <TeamActionView actions={teamActions} />
                        {/* TODO: GAME-REFACTOR {myTeamActions.length > 0 && (
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
                        )} */}
                    </View>
                }
            />
        </View>
    )
}

export default PointEditView
