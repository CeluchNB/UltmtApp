import * as Constants from '../../utils/constants'
import ActionDisplayItem from '../../components/atoms/ActionDisplayItem'
import { ApiError } from '../../types/services'
import BaseScreen from '../../components/atoms/BaseScreen'
import GameHeader from '../../components/molecules/GameHeader'
import { GuestUser } from '../../types/user'
import { LiveGameProps } from '../../types/navigation'
import PlayerActionView from '../../components/organisms/PlayerActionView'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import React from 'react'
import TeamActionView from '../../components/organisms/TeamActionView'
import { useColors } from '../../hooks'
import {
    ActionType,
    ClientActionType,
    LiveServerAction,
    SubscriptionObject,
} from '../../types/action'
import { StyleSheet, Text, View } from 'react-native'
import {
    addAction,
    joinPoint,
    subscribe,
    undoAction,
    unsubscribe,
} from '../../services/data/action'
import { createPoint, finishPoint } from '../../services/data/point'
import { getAction, getValidTeamActions } from '../../utils/action'
import { isPulling, isPullingNext } from '../../utils/point'
import {
    selectGame,
    selectTeam,
    updateScore,
} from '../../store/reducers/features/game/liveGameReducer'
import {
    selectPoint,
    setPoint,
} from '../../store/reducers/features/point/livePointReducer'
import { size, weight } from '../../theme/fonts'
import { useDispatch, useSelector } from 'react-redux'

const LivePointEditScreen: React.FC<LiveGameProps> = ({ navigation }) => {
    // hooks
    const { colors } = useColors()
    const game = useSelector(selectGame)
    const team = useSelector(selectTeam)
    const point = useSelector(selectPoint)
    const dispatch = useDispatch()
    const [actionStack, setActionStack] = React.useState<
        { playerIndex?: number; actionType: ClientActionType }[]
    >([])
    const [liveError, setLiveError] = React.useState<string | undefined>(
        undefined,
    )
    const [finishLoading, setFinishLoading] = React.useState(false)
    const [finishError, setFinishError] = React.useState<string | undefined>(
        undefined,
    )
    const [resolvedActions, setResolvedActions] = React.useState<
        LiveServerAction[]
    >([])

    const activePlayers = React.useMemo(() => {
        if (team === 'one') {
            return point.teamOnePlayers
        } else {
            return point.teamTwoPlayers
        }
    }, [point, team])

    const subscriptions: SubscriptionObject = {
        client: data => {
            setLiveError(undefined)
            setResolvedActions(curr => [...curr, data])
        },
        undo: () => {
            setLiveError(undefined)
            setResolvedActions(curr => curr.slice(0, curr.length - 2))
        },
        error: data => {
            setLiveError(data?.message)
        },
    }

    React.useEffect(() => {
        joinPoint(game._id, point._id).then(() => {
            subscribe(subscriptions)
        })
        return () => {
            unsubscribe()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // event functions
    const onUndo = () => {
        undoAction(point._id)
        setActionStack(stack => {
            return stack.filter((_item, i) => {
                return i !== stack.length - 1
            })
        })
        setFinishError(undefined)
    }

    const onAction = (
        playerIndex: number,
        actionType: ClientActionType,
        tags: string[],
    ) => {
        const action = getAction(
            actionType,
            team,
            tags,
            getPlayerOne(playerIndex),
            getPlayerTwo(),
        )
        addAction(action, point._id)
        setActionStack(stack => {
            return [
                ...stack,
                {
                    playerIndex,
                    actionType: action.actionType,
                },
            ]
        })
        setFinishError(undefined)
    }

    const onTeamAction = (
        actionType: ClientActionType,
        tags: string[],
        playerOne?: GuestUser,
        playerTwo?: GuestUser,
    ) => {
        const action = getAction(
            actionType,
            team === 'one' ? 'two' : 'one',
            tags,
            playerOne || activePlayers[getActiveAction().playerIndex || 0],
            playerTwo,
        )
        addAction(action, point._id)
        setActionStack(stack => {
            return [
                ...stack,
                {
                    playerIndex: undefined,
                    actionType: action.actionType,
                },
            ]
        })
        setFinishError(undefined)
    }

    const onFinishPoint = async () => {
        try {
            setFinishLoading(true)
            setFinishError(undefined)
            const prevPoint = await finishPoint(point._id)
            const { teamOneScore, teamTwoScore } = prevPoint
            dispatch(updateScore({ teamOneScore, teamTwoScore }))

            const newPoint = await createPoint(
                isPullingNext(team, getActiveAction().actionType),
                point.pointNumber + 1,
            )
            dispatch(setPoint(newPoint))

            navigation.reset({ index: 0, routes: [{ name: 'SelectPlayers' }] })
        } catch (e) {
            setFinishError(
                (e as ApiError).message ?? Constants.FINISH_POINT_ERROR,
            )
        } finally {
            setFinishLoading(false)
        }
    }

    // util functions
    const getPlayerOne = (playerIndex: number) => {
        return activePlayers[playerIndex]
    }

    const getPlayerTwo = () => {
        return actionStack.length > 0
            ? activePlayers[
                  actionStack[actionStack.length - 1].playerIndex || 0
              ]
            : undefined
    }

    const getActiveAction = (): {
        playerIndex?: number
        actionType?: ClientActionType
    } => {
        if (actionStack.length < 1) {
            return { playerIndex: undefined, actionType: undefined }
        } else if (
            resolvedActions.length > actionStack.length ||
            resolvedActions.length === 0
        ) {
            return {
                playerIndex: actionStack[actionStack.length - 1].playerIndex,
                actionType: actionStack[actionStack.length - 1].actionType,
            }
        }
        return {
            playerIndex: actionStack[resolvedActions.length - 1].playerIndex,
            actionType: actionStack[resolvedActions.length - 1].actionType,
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
    })

    return (
        <BaseScreen containerWidth="80%">
            <GameHeader game={game} />
            <PlayerActionView
                players={activePlayers}
                pulling={isPulling(point, game, team)}
                prevAction={getActiveAction().actionType}
                activePlayer={getActiveAction().playerIndex}
                undoDisabled={actionStack.length === 0}
                loading={resolvedActions.length < actionStack.length}
                error={liveError}
                onAction={onAction}
                onUndo={onUndo}
            />
            <TeamActionView
                actions={getValidTeamActions(actionStack)}
                onAction={onTeamAction}
            />
            <PrimaryButton
                onPress={onFinishPoint}
                text="finish point"
                loading={finishLoading}
                disabled={
                    finishLoading ||
                    actionStack.length === 0 ||
                    (actionStack.length > 0 &&
                        actionStack[actionStack.length - 1].actionType !==
                            ActionType.TEAM_ONE_SCORE &&
                        actionStack[actionStack.length - 1].actionType !==
                            ActionType.TEAM_TWO_SCORE)
                }
            />
            {finishError && <Text style={styles.error}>{finishError}</Text>}
            {resolvedActions.length > 0 && (
                <View>
                    <Text style={styles.header}>Last Action</Text>
                    <ActionDisplayItem
                        action={resolvedActions[resolvedActions.length - 1]}
                        teamOne={game.teamOne}
                        teamTwo={game.teamTwo}
                    />
                </View>
            )}
        </BaseScreen>
    )
}

export default LivePointEditScreen
