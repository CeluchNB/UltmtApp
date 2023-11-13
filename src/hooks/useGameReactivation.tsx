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

        console.log('got data', game, team, activePoint, hasActiveActions)
        // set necessary data in redux
        dispatch(setGame(game))
        dispatch(setTeam(team))
        if (!activePoint) {
            console.log('navigating to first point')
            dispatch(resetPoint())
            navigation.navigate('LiveGame', { screen: 'FirstPoint' })
        } else {
            dispatch(setPoint(activePoint))
            if (hasActiveActions) {
                console.log('navigating to live point')
                navigation.navigate('LiveGame', { screen: 'LivePointEdit' })
            } else {
                console.log('navigating to select players')
                navigation.navigate('LiveGame', { screen: 'SelectPlayers' })
            }
        }
    }

    return { onReactivateGame }
}
