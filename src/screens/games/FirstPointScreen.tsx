import { AppDispatch } from '../../store/store'
import BaseModal from '../../components/atoms/BaseModal'
import BaseScreen from '../../components/atoms/BaseScreen'
import { FirstPointProps } from '../../types/navigation'
import { IconButton } from 'react-native-paper'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import ScreenTitle from '../../components/atoms/ScreenTitle'
import { createPoint } from '../../store/reducers/features/point/livePointReducer'
import { selectGame } from '../../store/reducers/features/game/liveGameReducer'
import { useTheme } from '../../hooks'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import {
    selectCreateError,
    selectCreateStatus,
    selectPoint,
} from '../../store/reducers/features/point/livePointReducer'
import { useDispatch, useSelector } from 'react-redux'

const FirstPointScreen: React.FC<FirstPointProps> = ({ navigation }) => {
    const {
        theme: { colors, size, weight },
    } = useTheme()
    const dispatch = useDispatch<AppDispatch>()
    const game = useSelector(selectGame)
    const createStatus = useSelector(selectCreateStatus)
    const createError = useSelector(selectCreateError)
    const point = useSelector(selectPoint)
    const [showJoinModal, setShowJoinModal] = useState(false)

    const onCreate = async (isPulling: boolean) => {
        dispatch(
            createPoint({ pulling: isPulling, pointNumber: point.pointNumber }),
        )
    }

    useEffect(() => {
        // TODO: refactor away from this pattern
        if (createStatus === 'success') {
            navigation.navigate('LiveGameEdit', { gameId: game._id })
        }
    }, [createStatus, navigation, game])

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
            fontSize: size.fontTwenty,
            textAlign: 'center',
        },
        passcode: {
            color: colors.textPrimary,
            fontSize: size.fontThirty,
            fontWeight: weight.full,
            textAlign: 'center',
            alignSelf: 'center',
            flex: 1,
        },
        joinCodeContainer: {
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
        },
        button: {
            marginTop: 10,
        },
        errorText: {
            color: colors.error,
            fontSize: size.fontFifteen,
            marginTop: 10,
        },
        modalButton: {
            margin: 5,
        },
        text: {
            fontSize: size.fontTwenty,
            color: colors.textPrimary,
        },
    })

    return (
        <BaseScreen containerWidth={80}>
            <ScreenTitle style={styles.title} title="First Point" />
            <View style={styles.container}>
                <Text style={styles.description}>Join Passcode:</Text>
                <View style={styles.joinCodeContainer}>
                    <Text style={styles.passcode}>{game.resolveCode}</Text>
                    <IconButton
                        style={styles.button}
                        iconColor={colors.textPrimary}
                        icon="help-circle"
                        size={20}
                        onPress={() => {
                            setShowJoinModal(true)
                        }}
                    />
                </View>
            </View>
            <View style={styles.container}>
                <Text style={styles.description}>My team is</Text>
                <PrimaryButton
                    style={styles.button}
                    text="pulling"
                    disabled={createStatus === 'loading'}
                    loading={createStatus === 'loading'}
                    onPress={async () => {
                        await onCreate(true)
                    }}
                />
                <PrimaryButton
                    style={styles.button}
                    text="receiving"
                    disabled={createStatus === 'loading'}
                    loading={createStatus === 'loading'}
                    onPress={async () => {
                        await onCreate(false)
                    }}
                />
                {createError !== undefined && (
                    <Text style={styles.errorText}>{createError}</Text>
                )}
            </View>
            <BaseModal
                visible={showJoinModal}
                onClose={() => {
                    setShowJoinModal(false)
                }}>
                <Text style={styles.text}>
                    You can give this code to the other team's stat keeper. The
                    other stat keeper can join this game by selecting "Join
                    Existing Game" on the "Select Opponent" page, searching for
                    this game, then entering in this code when prompted.
                </Text>
                <PrimaryButton
                    style={[styles.button]}
                    text="confirm"
                    onPress={() => {
                        setShowJoinModal(false)
                    }}
                    loading={false}
                />
            </BaseModal>
        </BaseScreen>
    )
}

export default FirstPointScreen
