import ChangePullingTeamModal from '../molecules/ChangePullingTeamModal'
import ConfirmModal from '../molecules/ConfirmModal'
import GuestPlayerModal from '../molecules/GuestPlayerModal'
import { LineSchema } from '../../models'
import { LiveGameContext } from '../../context/live-game-context'
import LivePointUtilityBar from '../molecules/LivePointUtilityBar'
import { PointEditContext } from '../../context/point-edit-context'
import { isPulling } from '../../utils/point'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '../../hooks'
import { Chip, IconButton, Tooltip } from 'react-native-paper'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useMemo, useState } from 'react'

interface SelectPlayersViewProps {
    onNavigate: () => void
}

const SelectPlayersView: React.FC<SelectPlayersViewProps> = ({
    onNavigate,
}) => {
    const navigation = useNavigation()
    const {
        theme: { colors, size },
    } = useTheme()
    const { game, point, team, teamId } = useContext(LiveGameContext)
    const {
        selectPlayers,
        setPlayers,
        backPoint,
        pullingMismatchConfirmVisible,
        setPullingMismatchConfirmVisible,
        switchPullingTeam,
    } = useContext(PointEditContext)

    const {
        playerOptions,
        lineOptions,
        toggleSelection,
        toggleLine,
        clearSelection,
    } = selectPlayers

    const [guestModalVisible, setGuestModalVisible] = useState(false)
    const [pullingModalVisible, setPullingModalVisible] = useState(false)

    const error = useMemo(() => {
        return [setPlayers.error, backPoint.error]
            .filter(msg => !!msg)
            .join(' ')
    }, [setPlayers, backPoint])

    const onSelectLine = (line: LineSchema) => {
        const lineId = line._id
        if (!lineId) return

        clearSelection()
        toggleLine(line._id?.toHexString() ?? '')
    }

    const styles = StyleSheet.create({
        flatList: {
            margin: 5,
        },
        description: {
            color: colors.gray,
            fontSize: size.fontTwenty,
            marginBottom: 10,
            textAlign: 'center',
        },
        container: { alignSelf: 'center' },
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
        <View>
            <FlatList
                ListHeaderComponentStyle={styles.headerFooterContainer}
                ListFooterComponentStyle={styles.headerFooterContainer}
                data={Object.values(playerOptions)}
                testID="players-flat-list"
                style={styles.flatList}
                ListHeaderComponent={
                    <View>
                        <Text style={styles.description}>
                            {game?.playersPerPoint} players on next{' '}
                            {isPulling(point, game, team) ? 'D ' : 'O '}
                            point
                        </Text>
                        <View style={styles.container}>
                            <Chip
                                testID="active-warning-chip"
                                mode="outlined"
                                onPress={() => {
                                    setPullingModalVisible(true)
                                }}
                                style={styles.setPullingChip}>
                                <Text style={styles.setPullingText}>
                                    CHANGE PULLING TEAM
                                </Text>
                            </Chip>
                        </View>
                        <LivePointUtilityBar
                            loading={false}
                            undoButton={{
                                onPress: () => {},
                                visible: false,
                                disabled: true,
                            }}
                            lineBuilderButton={{
                                onPress: () => {
                                    navigation.navigate('LiveGame', {
                                        screen: 'LineBuilder',
                                        params: {
                                            gameId: game?._id ?? '',
                                            teamId: teamId ?? '',
                                        },
                                    })
                                },
                                visible: true,
                                disabled: false,
                            }}
                            onEdit={() => {
                                navigation.navigate('LiveGame', {
                                    screen: 'EditGame',
                                    params: { gameId: game?._id ?? '' },
                                })
                            }}
                            actionButton={{
                                title: 'Add Guest',
                                loading: false,
                                leftIcon: 'plus',
                                disabled: false,
                                onAction: () => setGuestModalVisible(true),
                            }}
                            error={error}
                        />
                        <FlatList
                            data={Object.values(lineOptions)}
                            horizontal={true}
                            renderItem={({ item }) => {
                                return (
                                    <Chip
                                        selectedColor={
                                            item.selected
                                                ? colors.textPrimary
                                                : colors.gray
                                        }
                                        style={styles.chip}
                                        onPress={() => {
                                            onSelectLine(item.line)
                                        }}>
                                        {item.line.name}
                                    </Chip>
                                )
                            }}
                        />
                        <View style={styles.statsKeyContainer}>
                            <Text style={styles.statsKey}>
                                (PP - A - G - B - T)
                            </Text>
                            <Tooltip
                                title="Points Played - Assists - Goals - Blocks - Turnovers"
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
                renderItem={({ item }) => {
                    const { player, selected } = item
                    return (
                        <Chip
                            style={styles.chip}
                            mode="outlined"
                            onPress={() => {
                                toggleSelection(player)
                            }}
                            selectedColor={
                                selected ? colors.textPrimary : colors.gray
                            }
                            ellipsizeMode="tail">
                            {player.firstName} {player.lastName}{' '}
                            <Text style={{ color: colors.textPrimary }}>
                                ({player.pointsPlayed} - {player.assists} -{' '}
                                {player.goals} - {player.blocks} -{' '}
                                {player.turnovers})
                            </Text>
                        </Chip>
                    )
                }}
            />
            <GuestPlayerModal
                visible={guestModalVisible}
                teamId={teamId ?? ''}
                onClose={() => {
                    setGuestModalVisible(false)
                }}
            />
            <ConfirmModal
                visible={pullingMismatchConfirmVisible}
                loading={false}
                displayText="The stat keeper for the other team has switched the pulling and receiving teams. Do you wish to continue?"
                confirmColor={colors.textPrimary}
                onCancel={async () => setPullingMismatchConfirmVisible(false)}
                onClose={async () => setPullingMismatchConfirmVisible(false)}
                onConfirm={async () => {
                    await switchPullingTeam()
                    setPullingMismatchConfirmVisible(false)
                    onNavigate()
                }}
            />
            <ChangePullingTeamModal
                visible={pullingModalVisible}
                onClose={() => {
                    setPullingModalVisible(false)
                }}
            />
        </View>
    )
}

export default SelectPlayersView
