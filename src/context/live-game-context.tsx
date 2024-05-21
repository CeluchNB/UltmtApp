import { TeamNumber } from '../types/team'
import { GameSchema, PointSchema } from '../models'
import React, { ReactNode, createContext, useMemo, useState } from 'react'
import { useObject, useQuery } from './realm'

interface LiveGameContextData {
    game: GameSchema
    point: PointSchema
    team: TeamNumber
    setCurrentPointNumber: (pointNumber: number) => void
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
    const game = useObject<GameSchema>('Game', gameId)

    const [currentPointNumber, setCurrentPointNumber] = useState(pointNumber)
    const pointQuery = useQuery<PointSchema>(
        'Point',
        points => {
            return points.filtered(
                'gameId == $0 AND pointNumber == $1',
                gameId,
                currentPointNumber,
            )
        },
        [currentPointNumber],
    )
    const point = useMemo(() => {
        return pointQuery[0]
    }, [pointQuery])

    const [team] = useState<TeamNumber>(teamNumber)

    // TODO: GAME-REFACTOR finish game

    return (
        <LiveGameContext.Provider
            // TODO: GAME-REFACTOR cannot have non-null assertions here, either check for null before hand or handle null on frontend
            value={{
                game: game!,
                point: point!,
                team,
                setCurrentPointNumber,
            }}>
            {children}
        </LiveGameContext.Provider>
    )
}

export default LiveGameProvider
