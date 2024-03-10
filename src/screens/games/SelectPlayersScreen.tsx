import { AppDispatch } from '../../store/store'
import BaseScreen from '../../components/atoms/BaseScreen'
import ChangePullingTeamModal from '../../components/molecules/ChangePullingTeamModal'
import ConfirmModal from '../../components/molecules/ConfirmModal'
import { DisplayUser } from '../../types/user'
import GameHeader from '../../components/molecules/GameHeader'
import GuestPlayerModal from '../../components/molecules/GuestPlayerModal'
import LivePointUtilityBar from '../../components/molecules/LivePointUtilityBar'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import SecondaryButton from '../../components/atoms/SecondaryButton'
import { SelectPlayersProps } from '../../types/navigation'
import { getTeamById } from '../../services/data/team'
import { isPulling } from '../../utils/point'
import { reactivatePoint } from '../../services/data/point'
import { setPlayers } from '../../services/data/point'
import { useTheme } from '../../hooks'
import { Chip, IconButton, Tooltip } from 'react-native-paper'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import {
    addPlayers,
    selectActiveTeam,
    selectGame,
    selectTeam,
    subtractPlayerStats,
    updateScore,
} from '../../store/reducers/features/game/liveGameReducer'
import {
    selectPoint,
    setPoint,
} from '../../store/reducers/features/point/livePointReducer'
import { useDispatch, useSelector } from 'react-redux'
import { useMutation, useQuery } from 'react-query'

const SelectPlayersScreen: React.FC<SelectPlayersProps> = ({ navigation }) => {
    const {
        theme: { colors, size },
    } = useTheme()
    const game = useSelector(selectGame)
    const team = useSelector(selectTeam)
    const point = useSelector(selectPoint)
    const activeTeam = useSelector(selectActiveTeam)
    const dispatch = useDispatch<AppDispatch>()

    const [selectedPlayers, setSelectedPlayers] = useState<number[]>([])
    const [guestModalVisible, setGuestModalVisible] = useState(false)
    const [pullingModalVisible, setPullingModalVisible] = useState(false)
    const [confirmModalVisible, setConfirmModalVisible] = useState(false)

    // keep players up to date with any team edits
    useQuery(
        ['getLocalTeam', { teamId: activeTeam._id }],
        () => getTeamById(activeTeam._id),
        {
            onSuccess(localTeam) {
                dispatch(addPlayers(localTeam.players))
            },
        },
    )

    const {
        mutateAsync: setPlayerMutation,
        isLoading,
        error,
        isError,
    } = useMutation((players: DisplayUser[]) => setPlayers(point._id, players))

    const playerList = React.useMemo(() => {
        return activeTeam.players
            .slice()
            .sort((a, b) =>
                `${a.firstName} ${a.lastName}`.localeCompare(
                    `${b.firstName} ${b.lastName}`,
                ),
            )
    }, [activeTeam.players])

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

        const data = await setPlayerMutation(players)
        if (data.pullingTeam._id === point.pullingTeam._id) {
            // very weird case: putting dispatch before reset prevents reset
            // 'await'-ing dispatch also prevents this, but feels worse than dispatch after navigate
            navigation.reset({
                index: 0,
                routes: [{ name: 'LivePointEdit' }],
            })
            dispatch(setPoint(data))
        } else {
            dispatch(setPoint(data))
            setConfirmModalVisible(true)
        }
    }

    const onLastPoint = async () => {
        try {
            const reactivatedPoint = await reactivatePoint(
                point._id,
                point.pointNumber - 1,
                team,
            )
            dispatch(subtractPlayerStats({ pointId: point._id }))

            dispatch(setPoint(reactivatedPoint))
            dispatch(
                updateScore({
                    teamOneScore: reactivatedPoint.teamOneScore,
                    teamTwoScore: reactivatedPoint.teamTwoScore,
                }),
            )

            navigation.reset({ index: 0, routes: [{ name: 'LivePointEdit' }] })
        } catch (e) {
            // TODO: error display?
        }
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
        statsKeyContainer: {
            flexDirection: 'row',
            alignSelf: 'flex-end',
            justifyContent: 'center',
            alignContent: 'center',
            textAlignVertical: 'center',
        },
        statsKey: {
            color: colors.textPrimary,
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
            margin: 5,
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
                    ListHeaderComponentStyle={styles.headerFooterContainer}
                    ListFooterComponentStyle={styles.headerFooterContainer}
                    data={playerList}
                    testID="players-flat-list"
                    ListHeaderComponent={
                        <View>
                            <GameHeader header editing game={game} />
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
                            <View style={styles.statsKeyContainer}>
                                <Text style={styles.statsKey}>
                                    (PP/A/G/B/T)
                                </Text>
                                <Tooltip
                                    title="Points Played/Assists/Goals/Blocks/Turnovers"
                                    enterTouchDelay={150}>
                                    <IconButton
                                        iconColor={colors.textPrimary}
                                        icon="help-circle"
                                        size={20}
                                        onPress={() => {}}
                                    />
                                </Tooltip>
                            </View>
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
                                {item.firstName} {item.lastName} (
                                {item.pointsPlayed}/{item.assists}/{item.goals}/
                                {item.blocks}/{item.turnovers})
                            </Chip>
                        )
                    }}
                    ListFooterComponent={
                        <View>
                            {isError && (
                                <Text style={styles.errorText}>
                                    {error?.toString()}
                                </Text>
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
                                        game.playersPerPoint || isLoading
                                }
                                onPress={onSetPlayers}
                                loading={isLoading}
                            />
                        </View>
                    }
                />
            </View>
            <GuestPlayerModal
                visible={guestModalVisible}
                teamId={activeTeam._id}
                onClose={() => {
                    setGuestModalVisible(false)
                }}
            />
            <ConfirmModal
                visible={confirmModalVisible}
                loading={false}
                displayText="The stat keeper for the other team has switched the pulling and receiving teams. Do you wish to continue?"
                confirmColor={colors.textPrimary}
                onCancel={async () => setConfirmModalVisible(false)}
                onClose={async () => setConfirmModalVisible(false)}
                onConfirm={async () => {
                    setConfirmModalVisible(false)
                    // set timeout needed to prevent known issue: https://github.com/react-navigation/react-navigation/issues/11201
                    setTimeout(() => {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'LivePointEdit' }],
                        })
                    }, 50)
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
