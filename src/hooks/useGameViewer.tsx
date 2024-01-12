import { Game } from '../types/game'
import Point from '../types/point'
import React from 'react'
import { Socket } from 'socket.io-client'
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
    logGameOpen,
} from '../services/data/game'
import {
    isLivePoint,
    normalizeActions,
    normalizeLiveActions,
} from '../utils/point'
import {
    setLiveAction,
    setSavedAction,
    setTeams,
} from '../store/reducers/features/action/viewAction'
import { useDispatch, useSelector } from 'react-redux'

export interface GameViewerData {
    activePoint: Point | undefined
    allPointsLoading: boolean
    displayedActions: (
        | Action
        | {
              ad: boolean
          }
    )[]
    error: string
    game: Game | undefined
    gameLoading: boolean
    pointLoading: boolean
    loading: boolean
    points: Point[]
    managingTeamId: string | undefined
    onSelectAction: (action: ServerActionData) => {
        gameId: string
        pointId: string
        live: boolean
    }
    onSelectPoint: (id: string) => Promise<void>
    onRefresh: () => Promise<void>
}
/**
 * This hook enables easy use of common game viewing functions. Many methods perform mediation
 * between live and saved points.
 */
export const useGameViewer = (
    gameId: string,
    socket?: Socket,
): GameViewerData => {
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
            return managerTeams.find(team => team._id === game.teamTwo?._id)
                ?._id
        }
        return undefined
    }, [game, managerTeams])

    const displayedActions = React.useMemo(() => {
        if (!activePoint) return []
        return isLivePoint(activePoint)
            ? normalizeLiveActions(liveActions)
            : normalizeActions(teamOneActions, teamTwoActions)
    }, [liveActions, teamOneActions, teamTwoActions, activePoint])

    React.useEffect(() => {
        initializeGame()

        return () => {
            // TODO: new socket implementation
            // unsubscribe()
            socket?.removeAllListeners()
            socket?.disconnect()
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

            const openedGame = await logGameOpen(gameId)
            if (openedGame) {
                setGame(openedGame)
            }
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
                await initializeLivePoint(point._id)
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

    const onRefresh = async () => {
        await initializeGame()
        if (activePoint) {
            await onSelectPoint(activePoint?._id)
        }
    }

    // private
    const initializeLivePoint = async (pointId: string) => {
        setLiveActions([])

        console.log('in get live actions')
        if (!socket) return
        console.log('past guard')

        // TODO: new socket implementation
        // await joinPoint(gameId, pointId)
        // TODO: new socket implementation
        // await subscribe(subscriptions)
        // socket.io.on('open', () => {
        console.log('in game view open')
        socket.removeAllListeners()
        socket.emit('join:point', gameId, pointId)
        socket.on('action:client', subscriptions.client)
        socket.on('action:undo:client', subscriptions.undo)
        socket.on('action:error', subscriptions.error)
        socket.on('point:next:client', subscriptions.point)
        // })
        socket.io.on('open', () => {
            // TODO: new socket implementation - reconnect not working
            console.log('rejoining point')
            socket.emit('join:point', gameId, pointId)
        })

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
        onRefresh,
    }
}
