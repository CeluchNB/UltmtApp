import BaseScreen from '../../components/atoms/BaseScreen'
import { FirstPointProps } from '../../types/navigation'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import ScreenTitle from '../../components/atoms/ScreenTitle'
import { createPoint } from '../../store/reducers/features/point/livePointReducer'
import { selectGame } from '../../store/reducers/features/game/liveGameReducer'
import { useColors } from '../../hooks'
import React, { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import {
    selectCreateError,
    selectCreateStatus,
} from '../../store/reducers/features/point/livePointReducer'
import { size, weight } from '../../theme/fonts'
import { useDispatch, useSelector } from 'react-redux'

const FirstPointScreen: React.FC<FirstPointProps> = () => {
    const { colors } = useColors()
    const dispatch = useDispatch()
    const game = useSelector(selectGame)
    const createStatus = useSelector(selectCreateStatus)
    const createError = useSelector(selectCreateError)

    const [pulling, setPulling] = useState()

    const onCreate = async (isPulling: boolean) => {
        setPulling(pulling)
        dispatch(createPoint({ pulling: isPulling, pointNumber: 6 }))
    }

    const styles = StyleSheet.create({
        title: {
            alignSelf: 'center',
            marginTop: 10,
        },
        container: {
            alignSelf: 'center',
            textAlign: 'center',
            marginTop: 10,
            width: '60%',
        },
        description: {
            color: colors.gray,
            fontSize: size.fontMedium,
            textAlign: 'center',
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
        errorText: {
            color: colors.error,
            fontSize: size.fontFifteen,
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
                    loading={createStatus === 'loading' && pulling === true}
                    onPress={async () => {
                        await onCreate(true)
                    }}
                />
                <PrimaryButton
                    style={styles.button}
                    text="receiving"
                    loading={createStatus === 'loading' && pulling === false}
                    onPress={async () => {
                        await onCreate(false)
                    }}
                />
                {createError !== undefined && (
                    <Text style={styles.errorText}>{createError}</Text>
                )}
            </View>
        </BaseScreen>
    )
}

export default FirstPointScreen