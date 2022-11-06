import BaseScreen from '../../components/atoms/BaseScreen'
import { FirstPointProps } from '../../types/navigation'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import React from 'react'
import ScreenTitle from '../../components/atoms/ScreenTitle'
import { selectGame } from '../../store/reducers/features/game/liveGameReducer'
import { useSelector } from 'react-redux'
import { Text, View } from 'react-native'

const FirstPointScreen: React.FC<FirstPointProps> = () => {
    const game = useSelector(selectGame)

    return (
        <BaseScreen containerWidth="80%">
            <ScreenTitle title="First Point" />
            <View>
                <Text>Join Passcode:</Text>
                <Text>{game.resolveCode}</Text>
            </View>
            <View>
                <Text>{game.teamOne.name} is</Text>
                <PrimaryButton
                    text="pulling"
                    loading={false}
                    onPress={async () => {}}
                />
                <PrimaryButton
                    text="receiving"
                    loading={false}
                    onPress={async () => {}}
                />
            </View>
        </BaseScreen>
    )
}

export default FirstPointScreen
