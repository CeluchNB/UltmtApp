import { Game } from '../types/game'
import Point from '../types/point'
import React from 'react'
import { isLivePoint } from '../utils/point'
import { useDispatch } from 'react-redux'
import {
    LiveServerAction,
    SavedServerAction,
    ServerAction,
    SubscriptionObject,
} from '../types/action'
import {
    deleteLocalActionsByPoint,
    getActionsByPoint,
    getLiveActionsByPoint,
} from '../services/data/point'
import { getGameById, getPointsByGame } from '../services/data/game'
import { joinPoint, subscribe, unsubscribe } from '../services/data/live-action'
import { normalizeActions, normalizeLiveActions } from '../utils/point'
import {
    setLiveAction,
    setSavedAction,
    setTeams,
} from '../store/reducers/features/action/viewAction'

/**
 * This hook enables easy use of common game viewing functions. Many methods perform mediation
 * between live and saved points.
 */
export const useGameViewer = (gameId: string) => {
    const dispatch = useDispatch()
    const [liveActions, setLiveActions] = React.useState<LiveServerAction[]>([])
    const [game, setGame] = React.useState<Game>()
    const [points, setPoints] = React.useState<Point[]>([])
    const [teamOneActions, setTeamOneActions] = React.useState<
        SavedServerAction[]
    >([])
    const [teamTwoActions, setTeamTwoActions] = React.useState<
        SavedServerAction[]
    >([])
    const [activePoint, setActivePoint] = React.useState<Point | undefined>(
        undefined,
    )
    const [gameLoading, setGameLoading] = React.useState(false)
    const [allPointsLoading, setAllPointsLoading] = React.useState(false)
    const [pointLoading, setPointLoading] = React.useState(false)
    const [error, setError] = React.useState('')

    const displayedActions = React.useMemo(() => {
        if (!activePoint) return []
        return isLivePoint(activePoint)
            ? normalizeLiveActions(liveActions)
            : normalizeActions(teamOneActions, teamTwoActions)
    }, [liveActions, teamOneActions, teamTwoActions, activePoint])

    const loading = React.useMemo(() => {
        return gameLoading || allPointsLoading || pointLoading
    }, [gameLoading, pointLoading, allPointsLoading])

    React.useEffect(() => {
        setGameLoading(true)
        setAllPointsLoading(true)

        getGameById(gameId)
            .then(data => {
                setGame(data)
            })
            .catch((e: any) => {
                setError(e.message)
            })
            .finally(() => {
                setAllPointsLoading(false)
            })

        getPointsByGame(gameId)
            .then(data => {
                setPoints(data)
            })
            .catch((e: any) => {
                setError(e.message)
            })
            .finally(() => {
                setGameLoading(false)
            })

        return () => {
            unsubscribe()
            for (const point of points) {
                deleteLocalActionsByPoint(point._id)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameId])

    const subscriptions: SubscriptionObject = {
        client: (data: LiveServerAction) => {
            setLiveActions(curr => [data, ...curr])
        },
        undo: () => {
            // TODO: potential error with both teams?
            setLiveActions(curr => curr.slice(1))
        },
        error: () => {},
        point: () => {
            console.log('got new point')
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
                    setPoints(data)
                    if (data.length > 0) {
                        console.log('setting active point', data[0]._id)
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

    const onSelectAction = (
        action: ServerAction,
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
        const oneActions = await getActionsByPoint(
            'one',
            point._id,
            point.teamOneActions,
        )
        setTeamOneActions(oneActions)
        const twoActions = await getActionsByPoint(
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
        onSelectAction,
        onSelectPoint,
    }
}
