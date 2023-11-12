import { reactivateGame } from '../services/data/game'
import { useDispatch } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
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

    const onReactivateGame = async (gameId: string, managingTeamId: string) => {
        const { game, team, activePoint, hasActiveActions } =
            await reactivateGame(gameId, managingTeamId)

        dispatch(setGame(game))
        dispatch(setTeam(team))
        if (!activePoint) {
            dispatch(resetPoint())
            navigation.navigate('LiveGame', { screen: 'FirstPoint' })
            return
        }

        dispatch(setPoint(activePoint))
        if (hasActiveActions) {
            navigation.navigate('LiveGame', { screen: 'LivePointEdit' })
        } else {
            navigation.navigate('LiveGame', { screen: 'SelectPlayers' })
        }
    }

    return { onReactivateGame }
}
