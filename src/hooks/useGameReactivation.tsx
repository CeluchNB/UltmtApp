import React from 'react'
import { getActivePointForGame } from '../services/data/point'
import { getUserId } from '../services/data/user'
import { resurrectActiveGame } from '../services/data/game'
import { useData } from './useData'
import { useDispatch } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import { Game, LocalGame } from '../types/game'
import {
    resetPoint,
    setPoint,
} from '../store/reducers/features/point/livePointReducer'
import {
    setGame,
    setTeam,
} from '../store/reducers/features/game/liveGameReducer'

export const useGameReactivation = () => {
    const navigation = useNavigation()
    const dispatch = useDispatch()
    const { data: userId } = useData(getUserId)

    const getMyTeamId = React.useCallback(
        (game: Game): string => {
            return (
                (game.creator._id === userId
                    ? game.teamOne._id
                    : game.teamTwo._id) || ''
            )
        },
        [userId],
    )

    const getTeamNumber = React.useCallback(
        (game: Game): string => {
            return game.creator._id === userId ? 'one' : 'two'
        },
        [userId],
    )

    const onResurrect = async (game: Game): Promise<LocalGame> => {
        return await resurrectActiveGame(game._id, getMyTeamId(game))
    }

    const navigateToGame = async (game: LocalGame) => {
        // get game data
        try {
            // get point data
            // either an in progress point or a new point
            // actions handled in useGameEditor
            const point = await getActivePointForGame(game)
            const myTeamNumber = getTeamNumber(game)
            dispatch(setGame(game))
            dispatch(setTeam(myTeamNumber))
            if (!point) {
                dispatch(resetPoint())
                navigation.navigate('LiveGame', { screen: 'FirstPoint' })
                return
            }
            dispatch(setPoint(point))
            if (myTeamNumber === 'one' && point?.teamOneActions.length === 0) {
                navigation.navigate('LiveGame', { screen: 'SelectPlayers' })
                return
            } else if (
                myTeamNumber === 'two' &&
                point?.teamTwoActions.length === 0
            ) {
                navigation.navigate('LiveGame', { screen: 'SelectPlayers' })
                return
            }

            navigation.navigate('LiveGame', { screen: 'LivePointEdit' })
        } catch (e) {}
    }

    return { navigateToGame, onResurrect }
}
