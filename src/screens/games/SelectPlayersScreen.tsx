import { AppDispatch } from '../../store/store'
import BaseScreen from '../../components/atoms/BaseScreen'
import { Chip } from 'react-native-paper'
import GameHeader from '../../components/molecules/GameHeader'
import GuestPlayerModal from '../../components/molecules/GuestPlayerModal'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import SecondaryButton from '../../components/atoms/SecondaryButton'
import { SelectPlayersProps } from '../../types/navigation'
import { isPulling } from '../../utils/point'
import { reactivatePoint } from '../../services/data/point'
import { size } from '../../theme/fonts'
import { useColors } from '../../hooks'
import { FlatList, LogBox, StyleSheet, Text } from 'react-native'
import React, { useState } from 'react'
import {
    resetSetPlayersStatus,
    selectPoint,
    selectSetPlayersError,
    selectSetPlayersStatus,
    setPlayers,
    setPoint,
} from '../../store/reducers/features/point/livePointReducer'
import {
    selectGame,
    selectTeam,
} from '../../store/reducers/features/game/liveGameReducer'
import { useDispatch, useSelector } from 'react-redux'

const SelectPlayersScreen: React.FC<SelectPlayersProps> = ({ navigation }) => {
    // ignore flatlist flex wrap warning
    LogBox.ignoreLogs(['`flexWrap: `wrap`` is'])
    const { colors } = useColors()
    const game = useSelector(selectGame)
    const team = useSelector(selectTeam)
    const point = useSelector(selectPoint)
    const status = useSelector(selectSetPlayersStatus)
    const error = useSelector(selectSetPlayersError)
    const dispatch = useDispatch<AppDispatch>()
    const [selectedPlayers, setSelectedPlayers] = useState<number[]>([])
    const [modalVisible, setModalVisible] = useState(false)

    const playerList = React.useMemo(() => {
        if (team === 'one') {
            return game.teamOnePlayers
        }
        return game.teamTwoPlayers
    }, [game, team])

    React.useEffect(() => {
        if (status === 'success') {
            dispatch(resetSetPlayersStatus())
            navigation.reset({ index: 0, routes: [{ name: 'LivePointEdit' }] })
        }
    }, [status, navigation, dispatch])

    // no guaranteed unique attribute of GuestPlayer
    // must select by index
    const toggleSelection = (i: number) => {
        if (selectedPlayers.includes(i)) {
            setSelectedPlayers(prev => {
                return prev.filter(s => s !== i)
            })
        } else {
            setSelectedPlayers(prev => {
                return [i, ...prev]
            })
        }
    }

    const onSetPlayers = async () => {
        const players = playerList.filter((_p, i) =>
            selectedPlayers.includes(i),
        )
        dispatch(setPlayers({ players }))
    }

    const onLastPoint = async () => {
        const reactivatedPoint = await reactivatePoint(
            point._id,
            point.pointNumber - 1,
            team,
        )
        dispatch(setPoint(reactivatedPoint))
        navigation.reset({ index: 0, routes: [{ name: 'LivePointEdit' }] })
    }

    const styles = StyleSheet.create({
        description: {
            color: colors.gray,
            fontSize: size.fontLarge,
            marginBottom: 10,
            textAlign: 'center',
        },
        flatListContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        chip: {
            borderRadius: 8,
            margin: 5,
            backgroundColor: colors.primary,
            borderWidth: 2,
        },
        errorText: {
            color: colors.error,
            fontSize: size.fontFifteen,
            marginTop: 10,
        },
        button: {
            marginTop: 10,
        },
    })

    return (
        <BaseScreen containerWidth="80%">
            <GameHeader game={game} />
            {point.pointNumber > 1 && !game.teamTwoActive && (
                <SecondaryButton
                    style={styles.button}
                    text="last point"
                    onPress={onLastPoint}
                />
            )}
            <Text style={styles.description}>
                {game.playersPerPoint} players on next{'\n'}
                {isPulling(point, game, team) ? 'D ' : 'O '}
                point
            </Text>
            <FlatList
                contentContainerStyle={styles.flatListContainer}
                data={playerList}
                renderItem={({ item, index }) => {
                    return (
                        <Chip
                            style={styles.chip}
                            mode="outlined"
                            onPress={() => {
                                toggleSelection(index)
                            }}
                            selectedColor={
                                selectedPlayers.includes(index)
                                    ? colors.textPrimary
                                    : colors.gray
                            }
                            ellipsizeMode="tail">
                            {item.firstName} {item.lastName}
                        </Chip>
                    )
                }}
            />
            {status === 'failed' && (
                <Text style={styles.errorText}>{error}</Text>
            )}
            <SecondaryButton
                style={styles.button}
                onPress={async () => {
                    setModalVisible(true)
                }}
                text="add guest"
            />
            <PrimaryButton
                style={styles.button}
                text="start"
                disabled={
                    selectedPlayers.length !== game.playersPerPoint ||
                    status === 'loading'
                }
                onPress={onSetPlayers}
                loading={status === 'loading'}
            />
            <GuestPlayerModal
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false)
                }}
            />
        </BaseScreen>
    )
}

export default SelectPlayersScreen
