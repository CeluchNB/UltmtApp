import { LiveGameContext } from '../../context/live-game-context'
import LivePointUtilityBar from '../molecules/LivePointUtilityBar'
import PlayerActionView from './PlayerActionView'
import { PointEditContext } from '../../context/point-edit-context'
import TeamActionView from './TeamActionView'
import { isPulling } from '../../utils/point'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '../../hooks'
import { ActionFactory, ActionType, TeamActionList } from '../../types/action'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useContext } from 'react'

const PointEditView: React.FC<{}> = () => {
    const navigation = useNavigation()
    const {
        theme: { colors, size, weight },
    } = useTheme()
    const [finishError, setFinishError] = React.useState<string | undefined>(
        undefined,
    )
    const { game, point, team } = useContext(LiveGameContext)
    const { myTeamActions, waiting, error, onUndo } =
        React.useContext(PointEditContext)

    const teamActions = React.useMemo(() => {
        const actionListData = new TeamActionList(myTeamActions, team)
        return actionListData.actionList
    }, [myTeamActions, team])

    if (!point || !game) {
        return null
    }

    // TODO: GAME-REFACTOR
    // const onFinishPoint = async () => {
    //     try {
    //         setFinishPointLoading(true)
    //         setFinishError(undefined)
    //         await finishPoint()

    //         // TODO: GAME-REFACTOR
    //     } catch (e) {
    //         setFinishError(
    //             (e as ApiError).message ?? Constants.FINISH_POINT_ERROR,
    //         )
    //     } finally {
    //         setFinishPointLoading(false)
    //     }
    // }

    // TODO: GAME-REFACTOR
    // const onFinishGame = async () => {
    //     try {
    //         setFinishGameLoading(true)
    //         await finishGame()
    //         navigation.navigate('Tabs', {
    //             screen: 'Account',
    //             params: { screen: 'Profile', initial: false },
    //         })
    //     } catch (e) {
    //         setFinishError(
    //             (e as ApiError).message ?? Constants.FINISH_GAME_ERROR,
    //         )
    //     } finally {
    //         setFinishGameLoading(false)
    //     }
    // }

    const onUndoPress = async () => {
        if (myTeamActions.length > 0) {
            await onUndo()
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
                            onUndo={onUndoPress}
                            onEdit={() => {
                                // TODO: GAME-REFACTOR
                                // navigation.navigate('EditGame')
                            }}
                        />
                        <PlayerActionView
                            pulling={isPulling(point, game, team)}
                            actionStack={myTeamActions}
                            loading={waiting}
                            team={team}
                        />
                        <TeamActionView actions={teamActions} />
                        {/* 
                            // TODO: GAME-REFACTOR
                            <PrimaryButton
                            style={styles.button}
                            onPress={onFinishGame}
                            text="finish game"
                            loading={finishGameLoading}
                            disabled={finishDisable}
                        /> */}
                        {finishError && (
                            <Text style={styles.error}>{finishError}</Text>
                        )}
                        {/* {myTeamActions.length > 0 && (
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
