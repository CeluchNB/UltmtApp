import { TeamNumber } from '../types/team'
import { GameSchema, PointSchema } from '../models'
import React, { ReactNode, createContext, useMemo, useState } from 'react'
import { useObject, useQuery } from './realm'

interface LiveGameContextData {
    game: GameSchema
    point: PointSchema
    teamNumber: TeamNumber
}

export const LiveGameContext = createContext<LiveGameContextData>(
    {} as LiveGameContextData,
)

// TODO: pointNumber passed as argument (default to 1)
const LiveGameProvider = ({
    children,
    gameId,
    pointNumber = 1,
}: {
    children: ReactNode
    gameId: string
    pointNumber?: number
}) => {
    const game = useObject<GameSchema>('Game', gameId)
    const pointQuery = useQuery<PointSchema>('Point', points => {
        return points.filtered(
            'gameId == $0 AND pointNumber == $1',
            gameId,
            pointNumber,
        )
    })
    const point = useMemo(() => {
        return pointQuery[0]
    }, [pointQuery])
    console.log('point players', point.teamOnePlayers)
    // TODO: GAME-REFACTOR this may need to be an argument to the context?
    const [teamNumber] = useState<TeamNumber>('one')

    // next point

    // back point

    // finish game

    return (
        <LiveGameContext.Provider
            // TODO: GAME-REFACTOR cannot have non-null assertions here, either check for null before hand or handle null on frontend
            value={{ game: game!, point: point!, teamNumber }}>
            {children}
        </LiveGameContext.Provider>
    )
}

export default LiveGameProvider
