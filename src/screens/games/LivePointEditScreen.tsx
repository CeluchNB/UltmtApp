import BaseScreen from '../../components/atoms/BaseScreen'
import GameHeader from '../../components/molecules/GameHeader'
import PlayerActionView from '../../components/molecules/PlayerActionView'
import React from 'react'
import { SubscriptionObject } from '../../types/action'
import { selectGame } from '../../store/reducers/features/game/liveGameReducer'
import { selectPoint } from '../../store/reducers/features/point/livePointReducer'
import { useSelector } from 'react-redux'
import { joinPoint, subscribe } from '../../services/data/action'

const LivePointEditScreen: React.FC<{}> = () => {
    const game = useSelector(selectGame)
    const point = useSelector(selectPoint)

    const subscriptions: SubscriptionObject = {
        client: data => {
            console.log('data', data)
        },
        undo: data => {
            console.log('undo data', data)
        },
        error: data => {
            console.log('error data', data)
        },
    }

    React.useEffect(() => {
        joinPoint(game._id, point._id).then(() => {
            subscribe(subscriptions)
        })

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // const onCatch = async () => {
    //     await addAction(
    //         {
    //             actionType: ActionType.CATCH,
    //             playerOne: point.teamOnePlayers[num],
    //             playerTwo: point.teamOnePlayers[(num + 1) % 7],
    //             tags: [],
    //         },
    //         point._id,
    //     )
    //     setNum(n => {
    //         return (n + 1) % 7
    //     })
    // }

    return (
        <BaseScreen containerWidth="80%">
            <GameHeader game={game} />
            <PlayerActionView
                players={point.teamOnePlayers}
                pulling={point.pullingTeam._id === game.teamOne._id}
            />
        </BaseScreen>
    )
}

export default LivePointEditScreen
