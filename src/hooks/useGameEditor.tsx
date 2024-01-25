import { UpdateGame } from '../types/game'
import { editGame } from '../services/data/game'
import { parseUpdateGame } from '../utils/game'
import {
    selectGame,
    setGame,
} from '../store/reducers/features/game/liveGameReducer'
import { useDispatch, useSelector } from 'react-redux'

export const useGameEditor = () => {
    const dispatch = useDispatch()
    const game = useSelector(selectGame)

    const onEditGame = async (gameData: UpdateGame) => {
        const data = parseUpdateGame(gameData)
        const result = await editGame(game._id, data)
        dispatch(setGame(result))
    }

    return {
        game,
        onEditGame,
    }
}
