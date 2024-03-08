import { reactivateGame } from '../services/data/game'
import { useDispatch } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import {
    resetPoint,
    setPoint,
} from '../store/reducers/features/point/livePointReducer'
import {
    setActiveTeamId,
    setGame,
    setTeam,
} from '../store/reducers/features/game/liveGameReducer'

export const useGameReactivation = () => {
    const navigation = useNavigation()
    const dispatch = useDispatch()

    const onReactivateGame = async (gameId: string, managingTeamId: string) => {
        const { game, team, activePoint, hasActiveActions } =
            await reactivateGame(gameId, managingTeamId)

        // set necessary data in redux
        dispatch(setGame(game))
        dispatch(setTeam(team))
        // TODO: this is not a great implementation
        dispatch(
            setActiveTeamId(
                team === 'one' ? game.teamOne._id : game.teamTwo._id,
            ),
        )
        if (!activePoint) {
            dispatch(resetPoint())
            navigation.navigate('LiveGame', { screen: 'FirstPoint' })
        } else {
            dispatch(setPoint(activePoint))
            if (hasActiveActions) {
                navigation.navigate('LiveGame', { screen: 'LivePointEdit' })
            } else {
                navigation.navigate('LiveGame', { screen: 'SelectPlayers' })
            }
        }
    }

    return { onReactivateGame }
}
