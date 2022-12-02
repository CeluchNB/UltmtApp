import BaseScreen from '../../components/atoms/BaseScreen'
import GameHeader from '../../components/molecules/GameHeader'
import { GuestUser } from '../../types/user'
import { LiveGameProps } from '../../types/navigation'
import PlayerActionView from '../../components/organisms/PlayerActionView'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import React from 'react'
import TeamActionView from '../../components/organisms/TeamActionView'
import { isPulling } from '../../utils/points'
import {
    ActionType,
    ClientActionType,
    SubscriptionObject,
} from '../../types/action'
import {
    addAction,
    joinPoint,
    subscribe,
    undoAction,
    unsubscribe,
} from '../../services/data/action'
import { createPoint, finishPoint } from '../../services/data/point'
import { getAction, getValidTeamActions } from '../../utils/actions'
import {
    selectGame,
    selectTeam,
    updateScore,
} from '../../store/reducers/features/game/liveGameReducer'
import {
    selectPoint,
    setPoint,
} from '../../store/reducers/features/point/livePointReducer'
import { useDispatch, useSelector } from 'react-redux'

const LivePointEditScreen: React.FC<LiveGameProps> = ({ navigation }) => {
    const game = useSelector(selectGame)
    const team = useSelector(selectTeam)
    const point = useSelector(selectPoint)
    const dispatch = useDispatch()
    const [actionStack, setActionStack] = React.useState<
        { playerIndex?: number; actionType: ClientActionType }[]
    >([])
    const [resolvedAction, setResolvedAction] = React.useState(0)
    const [liveError, setLiveError] = React.useState<string | undefined>(
        undefined,
    )

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
            setResolvedAction(data.actionNumber || 0)
        },
        undo: () => {
            setLiveError(undefined)
            setResolvedAction(curr => curr - 1)
        },
        error: data => {
            setLiveError(data?.message)
        },
    }

    React.useEffect(() => {
        joinPoint(game._id, point._id)
        return () => {
            unsubscribe()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const onUndo = () => {
        undoAction(point._id)
        setActionStack(stack => {
            return stack.filter((_item, i) => {
                return i !== stack.length - 1
            })
        })
    }

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

    const onAction = (
        playerIndex: number,
        actionType: ClientActionType,
        tags: string[],
    ) => {
        // TODO: find new, reliable place for this
        subscribe(subscriptions)
        const action = getAction(
            actionType,
            team || 'one',
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
    }

    const onTeamAction = (
        actionType: ClientActionType,
        tags: string[],
        playerOne?: GuestUser,
        playerTwo?: GuestUser,
    ) => {
        subscribe(subscriptions)
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
    }

    const getActiveAction = (): {
        playerIndex?: number
        actionType?: ClientActionType
    } => {
        if (actionStack.length < 1) {
            return { playerIndex: undefined, actionType: undefined }
        }
        if (resolvedAction > actionStack.length || resolvedAction === 0) {
            return {
                playerIndex: actionStack[actionStack.length - 1].playerIndex,
                actionType: actionStack[actionStack.length - 1].actionType,
            }
        }
        return {
            playerIndex: actionStack[resolvedAction - 1].playerIndex,
            actionType: actionStack[resolvedAction - 1].actionType,
        }
    }

    const onFinishPoint = async () => {
        const prevPoint = await finishPoint(point._id)
        const { teamOneScore, teamTwoScore } = prevPoint
        dispatch(updateScore({ teamOneScore, teamTwoScore }))
        let pulling = false
        if (
            team === 'one' &&
            getActiveAction().actionType === ActionType.TEAM_ONE_SCORE
        ) {
            pulling = true
        } else if (
            team === 'two' &&
            getActiveAction().actionType === ActionType.TEAM_TWO_SCORE
        ) {
            pulling = true
        }
        const newPoint = await createPoint(pulling, point.pointNumber + 1)
        dispatch(setPoint(newPoint))
        navigation.reset({ index: 0, routes: [{ name: 'SelectPlayers' }] })
    }

    return (
        <BaseScreen containerWidth="80%">
            <GameHeader game={game} />
            <PlayerActionView
                players={activePlayers}
                pulling={isPulling(point, game, team)}
                prevAction={getActiveAction().actionType}
                activePlayer={getActiveAction().playerIndex}
                undoDisabled={actionStack.length === 0}
                loading={resolvedAction < actionStack.length}
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
                loading={false}
                disabled={
                    actionStack.length > 0 &&
                    actionStack[actionStack.length - 1].actionType !==
                        ActionType.TEAM_ONE_SCORE &&
                    actionStack[actionStack.length - 1].actionType !==
                        ActionType.TEAM_TWO_SCORE
                }
            />
        </BaseScreen>
    )
}

export default LivePointEditScreen
