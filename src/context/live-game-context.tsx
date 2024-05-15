import { LiveGameWizardState } from '../types/game'
import { TeamNumber } from '../types/team'
import { useWizardState } from '../hooks/use-wizard-state'
import { GameSchema, PointSchema } from '../models'
import React, { ReactNode, createContext, useMemo, useState } from 'react'
import { useObject, useQuery } from './realm'

interface LiveGameContextData {
    game: GameSchema
    point: PointSchema
    team: TeamNumber
    wizardState: ReturnType<typeof useWizardState<LiveGameWizardState>>
    setCurrentPointNumber: (pointNumber: number) => void
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

    // TODO: GAME-REFACTOR this may need to be an argument to the context?
    const [team] = useState<TeamNumber>('one')
    const wizardState = useWizardState(LiveGameWizardState.SET_PLAYERS)

    // finish game

    return (
        <LiveGameContext.Provider
            // TODO: GAME-REFACTOR cannot have non-null assertions here, either check for null before hand or handle null on frontend
            value={{
                game: game!,
                point: point!,
                team,
                wizardState,
                setCurrentPointNumber,
            }}>
            {children}
        </LiveGameContext.Provider>
    )
}

export default LiveGameProvider
