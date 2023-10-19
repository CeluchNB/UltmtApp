import { AppDispatch } from '../../store/store'
import BaseScreen from '../../components/atoms/BaseScreen'
import ChangePullingTeamModal from '../../components/molecules/ChangePullingTeamModal'
import { Chip } from 'react-native-paper'
import GameHeader from '../../components/molecules/GameHeader'
import GuestPlayerModal from '../../components/molecules/GuestPlayerModal'
import LivePointUtilityBar from '../../components/molecules/LivePointUtilityBar'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import SecondaryButton from '../../components/atoms/SecondaryButton'
import { SelectPlayersProps } from '../../types/navigation'
import { isPulling } from '../../utils/point'
import { reactivatePoint } from '../../services/data/point'
import { useTheme } from '../../hooks'
import { FlatList, LogBox, StyleSheet, Text, View } from 'react-native'
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
    updateScore,
} from '../../store/reducers/features/game/liveGameReducer'
import { useDispatch, useSelector } from 'react-redux'

const SelectPlayersScreen: React.FC<SelectPlayersProps> = ({ navigation }) => {
    // ignore flatlist flex wrap warning
    LogBox.ignoreLogs(['`flexWrap: `wrap`` is'])
    const {
        theme: { colors, size },
    } = useTheme()
    const game = useSelector(selectGame)
    const team = useSelector(selectTeam)
    const point = useSelector(selectPoint)
    const status = useSelector(selectSetPlayersStatus)
    const error = useSelector(selectSetPlayersError)
    const dispatch = useDispatch<AppDispatch>()
    const [selectedPlayers, setSelectedPlayers] = useState<number[]>([])
    const [guestModalVisible, setGuestModalVisible] = useState(false)
    const [pullingModalVisible, setPullingModalVisible] = useState(false)

    const playerList = React.useMemo(() => {
        let players
        if (team === 'one') {
            players = game.teamOnePlayers
        } else {
            players = game.teamTwoPlayers
        }
        return players
            .slice()
            .sort((a, b) =>
                `${a.firstName} ${a.lastName}`.localeCompare(
                    `${b.firstName} ${b.lastName}`,
                ),
            )
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
        try {
            const reactivatedPoint = await reactivatePoint(
                point._id,
                point.pointNumber - 1,
                team,
            )
            dispatch(setPoint(reactivatedPoint))
            dispatch(
                updateScore({
                    teamOneScore: reactivatedPoint.teamOneScore,
                    teamTwoScore: reactivatedPoint.teamTwoScore,
                }),
            )
            navigation.reset({ index: 0, routes: [{ name: 'LivePointEdit' }] })
        } catch (e) {}
    }

    const onPressSetPulling = () => {
        setPullingModalVisible(true)
    }

    const styles = StyleSheet.create({
        description: {
            color: colors.gray,
            fontSize: size.fontTwenty,
            marginBottom: 10,
            textAlign: 'center',
        },
        container: {
            alignSelf: 'center',
        },
        headerFooterContainer: { width: '100%' },
        flatListContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignSelf: 'center',
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
        setPullingChip: {
            backgroundColor: colors.primary,
            borderColor: colors.textPrimary,
        },
        setPullingText: {
            color: colors.textPrimary,
            fontSize: size.fontTen,
        },
    })

    return (
        <BaseScreen containerWidth={90}>
            <View style={styles.container}>
                <FlatList
                    contentContainerStyle={styles.flatListContainer}
                    ListHeaderComponentStyle={styles.headerFooterContainer}
                    ListFooterComponentStyle={styles.headerFooterContainer}
                    data={playerList}
                    testID="players-flat-list"
                    ListHeaderComponent={
                        <View>
                            <GameHeader header game={game} />
                            <Text style={styles.description}>
                                {game.playersPerPoint} players on next{' '}
                                {isPulling(point, game, team) ? 'D ' : 'O '}
                                point
                            </Text>
                            <View style={styles.container}>
                                <Chip
                                    testID="active-warning-chip"
                                    mode="outlined"
                                    onPress={onPressSetPulling}
                                    style={styles.setPullingChip}>
                                    <Text style={styles.setPullingText}>
                                        CHANGE PULLING TEAM
                                    </Text>
                                </Chip>
                            </View>
                            <LivePointUtilityBar
                                loading={false}
                                undoDisabled={
                                    point.pointNumber === 1 ||
                                    game.teamTwoActive
                                }
                                onUndo={onLastPoint}
                                onEdit={() => {
                                    navigation.navigate('EditGame')
                                }}
                            />
                        </View>
                    }
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
                    ListFooterComponent={
                        <View>
                            {status === 'failed' && (
                                <Text style={styles.errorText}>{error}</Text>
                            )}
                            <SecondaryButton
                                style={styles.button}
                                onPress={async () => {
                                    setGuestModalVisible(true)
                                }}
                                text="add guest"
                            />
                            <PrimaryButton
                                style={styles.button}
                                text="start"
                                disabled={
                                    selectedPlayers.length !==
                                        game.playersPerPoint ||
                                    status === 'loading'
                                }
                                onPress={onSetPlayers}
                                loading={status === 'loading'}
                            />
                        </View>
                    }
                />
            </View>
            <GuestPlayerModal
                visible={guestModalVisible}
                onClose={() => {
                    setGuestModalVisible(false)
                }}
            />
            <ChangePullingTeamModal
                game={game}
                pointId={point._id}
                team={
                    game.teamOne._id === point.pullingTeam._id ? 'one' : 'two'
                }
                visible={pullingModalVisible}
                onClose={() => {
                    setPullingModalVisible(false)
                }}
            />
        </BaseScreen>
    )
}

export default SelectPlayersScreen
