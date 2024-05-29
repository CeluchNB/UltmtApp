import ChangePullingTeamModal from '../molecules/ChangePullingTeamModal'
import ConfirmModal from '../molecules/ConfirmModal'
import GuestPlayerModal from '../molecules/GuestPlayerModal'
import { LiveGameContext } from '../../context/live-game-context'
import LivePointUtilityBar from '../molecules/LivePointUtilityBar'
import { PointEditContext } from '../../context/point-edit-context'
import { isPulling } from '../../utils/point'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '../../hooks'
import { Chip, IconButton, Tooltip } from 'react-native-paper'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useState } from 'react'

const SelectPlayersView: React.FC<{}> = () => {
    const navigation = useNavigation()
    const {
        theme: { colors, size },
    } = useTheme()
    const { game, point, team, teamId, players } = useContext(LiveGameContext)
    const { selectPlayers } = useContext(PointEditContext)
    const { selectedPlayers, toggleSelection } = selectPlayers

    const [guestModalVisible, setGuestModalVisible] = useState(false)
    const [pullingModalVisible, setPullingModalVisible] = useState(false)
    const [confirmModalVisible, setConfirmModalVisible] = useState(false)

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
                data={players}
                testID="players-flat-list"
                style={styles.flatList}
                ListHeaderComponent={
                    <View>
                        <Text style={styles.description}>
                            {game.playersPerPoint} players on next{' '}
                            {isPulling(point, game, team) ? 'D ' : 'O '}
                            point
                        </Text>
                        <View style={styles.container}>
                            <Chip
                                testID="active-warning-chip"
                                mode="outlined"
                                onPress={() => {}}
                                style={styles.setPullingChip}>
                                <Text style={styles.setPullingText}>
                                    CHANGE PULLING TEAM
                                </Text>
                            </Chip>
                        </View>
                        <LivePointUtilityBar
                            loading={false}
                            undoDisabled={true}
                            onUndo={() => {}}
                            onEdit={() => {
                                navigation.navigate('LiveGame', {
                                    screen: 'EditGame',
                                })
                            }}
                            actionButton={{
                                title: 'Add Guest',
                                loading: false,
                                leftIcon: 'plus',
                                disabled: false,
                                onAction: () => setGuestModalVisible(true),
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
                    return (
                        <Chip
                            style={styles.chip}
                            mode="outlined"
                            onPress={() => {
                                toggleSelection(item)
                            }}
                            selectedColor={
                                selectedPlayers.includes(item)
                                    ? colors.textPrimary
                                    : colors.gray
                            }
                            ellipsizeMode="tail">
                            {item.firstName} {item.lastName}{' '}
                            <Text style={{ color: colors.textPrimary }}>
                                ({item.pointsPlayed} - {item.assists} -{' '}
                                {item.goals} - {item.blocks} - {item.turnovers})
                            </Text>
                        </Chip>
                    )
                }}
                ListFooterComponent={
                    <View>
                        {/* {isError && (
                                TODO: GAME-REFACTOR display add guest error in live point utility bar
                                <Text style={styles.errorText}>
                                    {error?.toString()}
                                </Text>
                            )} */}
                    </View>
                }
            />
            <GuestPlayerModal
                visible={guestModalVisible}
                teamId={teamId ?? ''}
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
                    // TODO: GAME-REFACTOR
                    // setTimeout(() => {
                    //     navigation.reset({
                    //         index: 0,
                    //         routes: [{ name: 'LivePointEdit' }],
                    //     })
                    // }, 50)
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
        </View>
    )
}

export default SelectPlayersView
