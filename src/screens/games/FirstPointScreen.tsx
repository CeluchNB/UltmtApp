import BaseScreen from '../../components/atoms/BaseScreen'
import { FirstPointProps } from '../../types/navigation'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import React from 'react'
import ScreenTitle from '../../components/atoms/ScreenTitle'
import { selectGame } from '../../store/reducers/features/game/liveGameReducer'
import { useColors } from '../../hooks'
import { useSelector } from 'react-redux'
import { StyleSheet, Text, View } from 'react-native'
import { size, weight } from '../../theme/fonts'

const FirstPointScreen: React.FC<FirstPointProps> = () => {
    const { colors } = useColors()
    const game = useSelector(selectGame)

    const styles = StyleSheet.create({
        title: {
            alignSelf: 'center',
            marginTop: 10,
        },
        container: {
            alignSelf: 'center',
            textAlign: 'center',
            marginTop: 10,
        },
        description: {
            color: colors.gray,
            fontSize: size.fontMedium,
        },
        passcode: {
            color: colors.textPrimary,
            fontSize: size.fontLarge,
            fontWeight: weight.full,
            textAlign: 'center',
        },
        button: {
            marginTop: 10,
        },
    })

    return (
        <BaseScreen containerWidth="80%">
            <ScreenTitle style={styles.title} title="First Point" />
            <View style={styles.container}>
                <Text style={styles.description}>Join Passcode:</Text>
                <Text style={styles.passcode}>{game.resolveCode}</Text>
            </View>
            <View style={styles.container}>
                <Text style={styles.description}>My team is</Text>
                <PrimaryButton
                    style={styles.button}
                    text="pulling"
                    loading={false}
                    onPress={async () => {}}
                />
                <PrimaryButton
                    style={styles.button}
                    text="receiving"
                    loading={false}
                    onPress={async () => {}}
                />
            </View>
        </BaseScreen>
    )
}

export default FirstPointScreen
