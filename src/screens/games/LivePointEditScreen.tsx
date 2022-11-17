import { ActionType } from '../../types/action'
import BaseScreen from '../../components/atoms/BaseScreen'
import GameHeader from '../../components/molecules/GameHeader'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import React from 'react'
import { selectGame } from '../../store/reducers/features/game/liveGameReducer'
import { selectPoint } from '../../store/reducers/features/point/livePointReducer'
import { useSelector } from 'react-redux'
import { addAction, joinPoint, listen } from '../../services/data/action'
const LivePointEditScreen: React.FC<{}> = () => {
    const game = useSelector(selectGame)
    const point = useSelector(selectPoint)
    const [num, setNum] = React.useState(0)

    React.useEffect(() => {
        joinPoint(game._id, point._id).then(() => {
            console.log('joined point')
            listen().then(() => {
                console.log('listening')
            })
        })

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const onCatch = async () => {
        console.log('game', game._id, point._id)
        console.log('adding action')
        await addAction(
            {
                actionType: ActionType.CATCH,
                playerOne: point.teamOnePlayers[num],
                playerTwo: point.teamOnePlayers[(num + 1) % 7],
                tags: [],
            },
            point._id,
        )
        setNum(n => {
            return (n + 1) % 7
        })
    }

    return (
        <BaseScreen containerWidth="80%">
            <GameHeader game={game} />
            <PrimaryButton loading={false} text="catch" onPress={onCatch} />
        </BaseScreen>
    )
}

export default LivePointEditScreen
