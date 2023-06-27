import { Game } from '../types/game'
import Point from '../types/point'
import React from 'react'
import { isLivePoint } from '../utils/point'
import { selectManagerTeams } from '../store/reducers/features/account/accountReducer'
import {
    Action,
    ActionFactory,
    LiveServerActionData,
    ServerActionData,
    SubscriptionObject,
} from '../types/action'
import {
    deleteLocalActionsByPoint,
    getLiveActionsByPoint,
    getViewableActionsByPoint,
} from '../services/data/point'
import {
    getGameById,
    getPointsByGame,
    reactivateInactiveGame,
} from '../services/data/game'
import { joinPoint, subscribe, unsubscribe } from '../services/data/live-action'
import { normalizeActions, normalizeLiveActions } from '../utils/point'
import {
    setLiveAction,
    setSavedAction,
    setTeams,
} from '../store/reducers/features/action/viewAction'
import { useDispatch, useSelector } from 'react-redux'

/**
 * This hook enables easy use of common game viewing functions. Many methods perform mediation
 * between live and saved points.
 */
export const useGameViewer = (gameId: string) => {
    const dispatch = useDispatch()
    const managerTeams = useSelector(selectManagerTeams)
    const [liveActions, setLiveActions] = React.useState<Action[]>([])
    const [game, setGame] = React.useState<Game>()
    const [points, setPoints] = React.useState<Point[]>([])
    const [teamOneActions, setTeamOneActions] = React.useState<Action[]>([])
    const [teamTwoActions, setTeamTwoActions] = React.useState<Action[]>([])
    const [activePoint, setActivePoint] = React.useState<Point | undefined>(
        undefined,
    )
    const [gameLoading, setGameLoading] = React.useState(false)
    const [allPointsLoading, setAllPointsLoading] = React.useState(false)
    const [pointLoading, setPointLoading] = React.useState(false)
    const [error, setError] = React.useState('')

    const loading = React.useMemo(() => {
        return gameLoading || allPointsLoading || pointLoading
    }, [gameLoading, pointLoading, allPointsLoading])

    const managingTeamId = React.useMemo(() => {
        const teamOneId = managerTeams.find(
            team => team._id === game?.teamOne._id,
        )?._id
        if (teamOneId) return teamOneId

        if (game?.teamTwo?._id) {
            return managerTeams.find(team => team._id === game.teamTwo._id)?._id
        }
        return undefined
    }, [game, managerTeams])

    const onReactivateGame = React.useCallback(async () => {
        if (!managingTeamId) {
            return
        }

        const reactivatedGame = await reactivateInactiveGame(
            gameId,
            managingTeamId,
        )
        return reactivatedGame
    }, [gameId, managingTeamId])

    const displayedActions = React.useMemo(() => {
        if (!activePoint) return []
        return isLivePoint(activePoint)
            ? normalizeLiveActions(liveActions)
            : normalizeActions(teamOneActions, teamTwoActions)
    }, [liveActions, teamOneActions, teamTwoActions, activePoint])

    React.useEffect(() => {
        initializeGame()

        return () => {
            unsubscribe()
            for (const point of points) {
                deleteLocalActionsByPoint(point._id)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameId])

    const initializeGame = async () => {
        try {
            setGameLoading(true)
            setAllPointsLoading(true)

            const gameData = await getGameById(gameId)
            setGame(gameData)

            const pointsData = await getPointsByGame(gameId)
            setPoints(pointsData)
        } catch (e: any) {
            setError(e?.message)
        } finally {
            setAllPointsLoading(false)
            setGameLoading(false)
        }
    }

    const subscriptions: SubscriptionObject = {
        client: (data: LiveServerActionData) => {
            const action = ActionFactory.createFromAction(data)
            setLiveActions(curr => [action, ...curr])
        },
        undo: ({ team, actionNumber }) => {
            setLiveActions(curr => {
                return curr.filter(
                    a =>
                        a.action.actionNumber !== actionNumber ||
                        (a.action as LiveServerActionData).teamNumber !== team,
                )
            })
        },
        error: () => {},
        point: () => {
            setLiveActions([])
            setAllPointsLoading(true)
            getGameById(gameId)
                .then(data => {
                    setGame(data)
                })
                .catch((e: any) => {
                    setError(e.message)
                })

            getPointsByGame(gameId)
                .then(data => {
                    setPoints(
                        data.sort((a, b) => a.pointNumber - b.pointNumber),
                    )
                    if (data.length > 0) {
                        setActivePoint(data[0])
                    }
                })
                .catch((e: any) => {
                    setError(e.message)
                })
                .finally(() => {
                    setAllPointsLoading(false)
                })
        },
    }

    // public
    const onSelectPoint = async (id: string) => {
        const point = getPointById(id)
        if (!point) {
            return
        }
        setActivePoint(point)
        setPointLoading(true)
        setError('')
        try {
            if (isLivePoint(point)) {
                await getLiveActions(point._id)
            } else {
                await getSavedActions(point)
            }
        } catch (e: any) {
            setError(e.message)
        } finally {
            setPointLoading(false)
        }
    }

    // public
    const onSelectAction = (
        action: ServerActionData,
    ): { gameId: string; pointId: string; live: boolean } => {
        const live = isLivePoint(activePoint)
        if (live) {
            dispatch(
                setTeams({ teamOne: game?.teamOne, teamTwo: game?.teamTwo }),
            )
            dispatch(setLiveAction(action))
        } else {
            dispatch(setSavedAction(action))
        }
        return { gameId, pointId: activePoint?._id || '', live }
    }

    // private
    const getLiveActions = async (pointId: string) => {
        setLiveActions([])
        await joinPoint(gameId, pointId)
        await subscribe(subscriptions)
        const data = await getLiveActionsByPoint(gameId, pointId)
        // TODO: if user closes and opens accordion a bunch, liveActions could grow A LOT
        // think of way to remedy this
        // normalizeActions prevents this from being a display issue
        setLiveActions(curr => [...curr, ...data])
    }

    // private
    const getSavedActions = async (point: Point) => {
        const oneActions = await getViewableActionsByPoint(
            'one',
            point._id,
            point.teamOneActions,
        )
        setTeamOneActions(oneActions)
        const twoActions = await getViewableActionsByPoint(
            'two',
            point._id,
            point.teamTwoActions,
        )
        setTeamTwoActions(twoActions)
    }

    // private
    const getPointById = (id: string): Point | undefined => {
        return points.find(p => p._id === id)
    }

    return {
        activePoint,
        allPointsLoading,
        displayedActions,
        error,
        game,
        gameLoading,
        pointLoading,
        loading,
        points,
        managingTeamId,
        onSelectAction,
        onSelectPoint,
        onReactivateGame,
        onRefresh: initializeGame,
    }
}
