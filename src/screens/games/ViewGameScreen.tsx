import BaseScreen from '../../components/atoms/BaseScreen'
import Point from '../../types/point'
import PointAccordionGroup from '../../components/organisms/PointAccordionGroup'
import { ViewGameProps } from '../../types/navigation'
import { getPointsByGame } from '../../services/data/game'
import React, { useEffect } from 'react'

const ViewGameScreen: React.FC<ViewGameProps> = ({ route }) => {
    const {
        params: { gameId },
    } = route
    const [points, setPoints] = React.useState<Point[]>([])

    useEffect(() => {
        getPointsByGame(gameId).then(data => {
            setPoints(data)
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <BaseScreen containerWidth="100%">
            <PointAccordionGroup
                points={points}
                teamOne={{ name: 'Temper' }}
                teamTwo={{ name: 'Truck Stop' }}
            />
        </BaseScreen>
    )
}

export default ViewGameScreen
