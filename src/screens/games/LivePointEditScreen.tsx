import BaseScreen from '../../components/atoms/BaseScreen'
import GameHeader from '../../components/molecules/GameHeader'
import PlayerActionView from '../../components/molecules/PlayerActionView'
import React from 'react'
import { getAction } from '../../utils/actions'
import { selectGame } from '../../store/reducers/features/game/liveGameReducer'
import { selectPoint } from '../../store/reducers/features/point/livePointReducer'
import { useSelector } from 'react-redux'
import { ActionType, SubscriptionObject } from '../../types/action'
import { addAction, joinPoint, subscribe } from '../../services/data/action'

const LivePointEditScreen: React.FC<{}> = () => {
    const game = useSelector(selectGame)
    const point = useSelector(selectPoint)
    const [activePlayer, setActivePlayer] = React.useState<number | undefined>(
        undefined,
    )
    const [prevAction, setPrevAction] = React.useState<
        ActionType | 'score' | undefined
    >(undefined)

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

    const onAction = (index: number, actionType: ActionType | 'score') => {
        const action = getAction(
            actionType,
            activePlayer
                ? point.teamOnePlayers[activePlayer]
                : point.teamOnePlayers[index],
            activePlayer ? point.teamOnePlayers[index] : undefined,
        )
        addAction(action, point._id)
        setActivePlayer(index)
        setPrevAction(actionType)
    }

    return (
        <BaseScreen containerWidth="80%">
            <GameHeader game={game} />
            <PlayerActionView
                players={point.teamOnePlayers}
                pulling={point.pullingTeam._id === game.teamOne._id}
                prevAction={prevAction}
                activePlayer={activePlayer}
                onAction={onAction}
            />
        </BaseScreen>
    )
}

export default LivePointEditScreen
