import { Game } from '../types/game'
import { getActivePointForGame } from '../services/data/point'
import { resurrectActiveGame } from '../services/data/game'
import { selectAccount } from '../store/reducers/features/account/accountReducer'
import { useNavigation } from '@react-navigation/native'
import {
    resetPoint,
    setPoint,
} from '../store/reducers/features/point/livePointReducer'
import {
    setGame,
    setTeam,
} from '../store/reducers/features/game/liveGameReducer'
import { useDispatch, useSelector } from 'react-redux'

export const useGameReactivation = () => {
    const navigation = useNavigation()
    const account = useSelector(selectAccount)
    const dispatch = useDispatch()

    const getMyTeamId = (game: Game): string => {
        return (
            (game.creator._id === account._id
                ? game.teamOne._id
                : game.teamTwo._id) || ''
        )
    }

    const getTeamNumber = (game: Game): string => {
        return game.creator._id === account._id ? 'one' : 'two'
    }

    const onResurrect = async (
        game: Game,
    ): Promise<Game & { offline: boolean }> => {
        return await resurrectActiveGame(game._id, getMyTeamId(game))
    }

    const navigateToGame = async (activeGame: Game & { offline: boolean }) => {
        // get game data
        try {
            const game = await resurrectActiveGame(
                activeGame._id,
                getMyTeamId(activeGame),
            )

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
