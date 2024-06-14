import { ApiError } from '../types/services'
import { CreateGame } from '../types/game'
import { GameSchema } from '../models'
import { Tournament } from '../types/tournament'
import { selectAccount } from '../store/reducers/features/account/accountReducer'
import { useCreateGame } from '../hooks/use-create-game'
import { useSelector } from 'react-redux'
import { DisplayTeam, GuestTeam, Team } from '../types/team'
import React, { ReactNode, createContext, useState } from 'react'

interface CreateGameContextData {
    setActiveTeam: (team: Team) => void
    setTeamTwo: (team: GuestTeam) => void
    setTournament: (tournament: Tournament) => void
    createGame: (
        data: Omit<
            CreateGame,
            'teamOne' | 'teamTwo' | 'teamTwoDefined' | 'creator'
        >,
        offline?: boolean,
    ) => Promise<GameSchema>
    tournament?: Tournament
    createLoading: boolean
    teamOne?: DisplayTeam
    teamTwo?: GuestTeam
}

export const CreateGameContext = createContext<CreateGameContextData>(
    {} as CreateGameContextData,
)

export const CreateGameProvider = ({ children }: { children: ReactNode }) => {
    const [activeTeam, setActiveTeam] = useState<DisplayTeam>()
    const [teamTwo, setTeamTwo] = useState<GuestTeam>()
    const [tournament, setTournament] = useState<Tournament>()
    const account = useSelector(selectAccount)

    const { mutateAsync, isLoading } = useCreateGame(activeTeam?._id)

    const reset = () => {
        setActiveTeam(undefined)
        setTeamTwo(undefined)
        setTournament(undefined)
    }

    const createGame = async (
        data: Omit<
            CreateGame,
            'teamOne' | 'teamTwo' | 'teamTwoDefined' | 'creator'
        >,
        offline: boolean = false,
    ) => {
        if (!activeTeam || !teamTwo) throw new ApiError('Missing team data')

        return await mutateAsync(
            {
                gameData: {
                    ...data,
                    teamOne: activeTeam,
                    teamTwo,
                    tournament,
                    teamTwoDefined: !!teamTwo._id,
                    creator: {
                        _id: account._id,
                        firstName: account.firstName,
                        lastName: account.lastName,
                        username: account.username,
                    },
                },
                offline,
            },
            { onSuccess: () => reset() },
        )
    }

    return (
        <CreateGameContext.Provider
            value={{
                teamOne: activeTeam,
                teamTwo,
                tournament,
                setActiveTeam,
                setTeamTwo,
                setTournament,
                createGame: createGame,
                createLoading: isLoading,
            }}>
            {children}
        </CreateGameContext.Provider>
    )
}
