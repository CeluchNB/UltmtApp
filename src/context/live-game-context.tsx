import { InGameStatsUser } from '../types/user'
import { TeamNumber } from '../types/team'
import { parseInGameStatsUser } from '../utils/in-game-stats'
import { useFinishGame } from '../hooks/game-edit-actions/use-finish-game'
import { useQuery } from './realm'
import { GameSchema, PointSchema } from '../models'
import React, { ReactNode, createContext, useMemo, useState } from 'react'

interface LiveGameContextData {
    game?: GameSchema
    point?: PointSchema
    team: TeamNumber
    teamId?: string
    players: InGameStatsUser[] | undefined
    tags: string[]
    addTag: (tag: string) => void
    setCurrentPointNumber: (pointNumber: number) => void
    finishGameMutation: {
        finishGame: () => Promise<void>
        finishGameLoading: boolean
        finishGameError?: string
        finishGameReset: () => void
    }
}

export const LiveGameContext = createContext<LiveGameContextData>(
    {} as LiveGameContextData,
)

const LiveGameProvider = ({
    children,
    gameId,
    pointNumber = 1,
    teamNumber = 'one',
}: {
    children: ReactNode
    gameId: string
    pointNumber?: number
    teamNumber?: TeamNumber
}) => {
    // NOT AN IDEAL IMPLEMENTATION - useObject would be better - https://github.com/realm/realm-js/issues/5620
    const game = useQuery<GameSchema>('Game').filtered(`_id == '${gameId}'`)[0]

    const [currentPointNumber, setCurrentPointNumber] = useState(pointNumber)
    const pointQuery = useQuery<PointSchema>(
        {
            type: 'Point',
            query: collection => {
                return collection.filtered(
                    'gameId == $0 AND pointNumber == $1',
                    gameId,
                    currentPointNumber,
                )
            },
        },
        [currentPointNumber],
    )
    const point = useMemo(() => {
        return pointQuery[0]
    }, [pointQuery])

    const [team] = useState<TeamNumber>(teamNumber)
    const teamId = useMemo(() => {
        return team === 'one' ? game?.teamOne._id : game?.teamTwo._id
    }, [team, game])
    const [tags, setTags] = useState(['huck', 'break', 'layout'])

    const addTag = (tag: string) => {
        setTags(curr => [...curr, tag])
    }

    const players = useMemo(() => {
        if (team === 'one') {
            return game?.teamOnePlayers
                .slice()
                .sort((a, b) =>
                    `${a.firstName} ${a.lastName}`.localeCompare(
                        `${b.firstName} ${b.lastName}`,
                    ),
                )
                .map(user => parseInGameStatsUser(user))
        } else if (team === 'two') {
            return game?.teamTwoPlayers
                .slice()
                .sort((a, b) =>
                    `${a.firstName} ${a.lastName}`.localeCompare(
                        `${b.firstName} ${b.lastName}`,
                    ),
                )
                .map(user => parseInGameStatsUser(user))
        }
    }, [game, team])

    const {
        mutateAsync: finishGame,
        isLoading: finishGameLoading,
        error: finishGameError,
        reset: finishGameReset,
    } = useFinishGame(gameId)

    return (
        <LiveGameContext.Provider
            value={{
                game,
                point,
                team,
                players,
                teamId,
                tags,
                addTag,
                setCurrentPointNumber,
                finishGameMutation: {
                    finishGame,
                    finishGameReset,
                    finishGameLoading,
                    finishGameError: finishGameError?.message,
                },
            }}>
            {children}
        </LiveGameContext.Provider>
    )
}

export default LiveGameProvider
