import BaseScreen from '../../components/atoms/BaseScreen'
import GameHeader from '../../components/molecules/GameHeader'
import PlayerActionView from '../../components/organisms/PlayerActionView'
import React from 'react'
import TeamActionView from '../../components/organisms/TeamActionView'
import { selectPoint } from '../../store/reducers/features/point/livePointReducer'
import { useSelector } from 'react-redux'
import { ClientActionType, SubscriptionObject } from '../../types/action'
import {
    addAction,
    joinPoint,
    subscribe,
    undoAction,
} from '../../services/data/action'
import { getAction, getValidTeamActions } from '../../utils/actions'
import {
    selectGame,
    selectTeam,
} from '../../store/reducers/features/game/liveGameReducer'

const LivePointEditScreen: React.FC<{}> = () => {
    const game = useSelector(selectGame)
    const team = useSelector(selectTeam)
    const point = useSelector(selectPoint)
    const [actionStack, setActionStack] = React.useState<
        { playerIndex: number; actionType: ClientActionType }[]
    >([])
    const [resolvedAction, setResolvedAction] = React.useState(0)
    const [liveError, setLiveError] = React.useState<string | undefined>(
        undefined,
    )

    const subscriptions: SubscriptionObject = {
        client: data => {
            console.log('got data', data)
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const onAction = (
        playerIndex: number,
        actionType: ClientActionType,
        tags: string[],
    ) => {
        subscribe(subscriptions)
        const action = getAction(
            actionType,
            team || 'one',
            tags,
            actionStack.length > 0
                ? point.teamOnePlayers[
                      actionStack[actionStack.length - 1].playerIndex
                  ]
                : point.teamOnePlayers[playerIndex],
            actionStack.length > 0
                ? point.teamOnePlayers[
                      actionStack[actionStack.length - 1].playerIndex
                  ]
                : undefined,
        )
        addAction(action, point._id)
        setActionStack(stack => {
            return [
                ...stack,
                {
                    playerIndex,
                    actionType,
                },
            ]
        })
    }

    const onUndo = () => {
        undoAction(point._id)
        setActionStack(stack => {
            return stack.filter((_item, i) => {
                return i !== stack.length - 1
            })
        })
    }

    const onTeamAction = (action: ClientActionType, tags: string[]) => {
        console.log('got action', action, tags)
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

    const isPulling = () => {
        if (team === 'one') {
            return point.pullingTeam._id === game.teamOne._id
        }
        return point.pullingTeam._id !== game.teamOne._id
    }

    return (
        <BaseScreen containerWidth="80%">
            <GameHeader game={game} />
            <PlayerActionView
                players={
                    team === 'one' ? point.teamOnePlayers : point.teamTwoPlayers
                }
                pulling={isPulling()}
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
        </BaseScreen>
    )
}

export default LivePointEditScreen
