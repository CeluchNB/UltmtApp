import ConnectionsStatView from '../atoms/ConnectionsStatView'
import { Dropdown } from 'react-native-element-dropdown'
import { IconButton } from 'react-native-paper'
import React from 'react'
import { useQuery } from 'react-query'
import { useTheme } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'
import {
    filterConnectionStats,
    getConnectionStats,
} from '../../services/data/stats'

interface PlayerConnectionsViewProps {
    players: { playerId: string; firstName: string; lastName: string }[]
    throwerId?: string
    games?: string[]
    teams?: string[]
}

const PlayerConnectionsView: React.FC<PlayerConnectionsViewProps> = ({
    players,
    throwerId: propThrowerId = '',
    games = [],
    teams = [],
}) => {
    const {
        theme: { colors, size },
    } = useTheme()

    const [throwerId, setThrowerId] = React.useState<string | undefined>(
        propThrowerId,
    )
    const [receiverId, setReceiverId] = React.useState<string | undefined>('')

    const filteredDataEnabled = React.useMemo(() => {
        return (
            throwerId?.length !== 0 &&
            receiverId?.length !== 0 &&
            (games.length > 0 || teams.length > 0)
        )
    }, [throwerId, receiverId, games, teams])

    const totalDataEnabled = React.useMemo(() => {
        return (
            throwerId?.length !== 0 &&
            receiverId?.length !== 0 &&
            games.length === 0 &&
            teams.length === 0
        )
    }, [throwerId, receiverId, games, teams])

    const { data: filteredData, isLoading: filteredLoading } = useQuery(
        ['filterConnections', { throwerId, receiverId, games, teams }],
        () => filterConnectionStats(throwerId, receiverId, games, teams),
        {
            enabled: filteredDataEnabled,
            retry: 0,
        },
    )

    const { data: totalData, isLoading: totalLoading } = useQuery(
        ['connections', { throwerId, receiverId }],
        () => getConnectionStats(throwerId, receiverId),
        {
            enabled: totalDataEnabled,
            retry: 0,
        },
    )

    const isLoading = React.useMemo(() => {
        return filteredLoading || totalLoading
    }, [filteredLoading, totalLoading])

    const data = React.useMemo(() => {
        if (filteredDataEnabled) return filteredData
        if (totalDataEnabled) return totalData
    }, [filteredData, totalData, filteredDataEnabled, totalDataEnabled])

    const playerData = React.useMemo(() => {
        return players.map(player => ({
            value: player.playerId,
            label: `${player.firstName} ${player.lastName}`,
        }))
    }, [players])

    const styles = StyleSheet.create({
        title: {
            fontSize: size.fontThirty,
            color: colors.textSecondary,
        },
        dropdownContainer: {
            display: 'flex',
            flexDirection: 'row',
        },
        dropdown: {
            flexGrow: 1,
            borderWidth: 0.5,
            borderColor: colors.textSecondary,
            borderRadius: 4,
            padding: 4,
            color: colors.textPrimary,
        },
        toText: {
            color: colors.gray,
            fontSize: size.fontFifteen,
            marginHorizontal: 5,
            alignSelf: 'center',
        },
        selectedTextStyle: {
            color: colors.textPrimary,
        },
        containerStyle: {
            backgroundColor: colors.darkPrimary,
            borderColor: colors.darkPrimary,
        },
        itemTextStyle: { color: colors.darkGray },
        switchButton: {
            padding: 0,
            marginVertical: 0,
            marginHorizontal: 5,
        },
        connectionsContainer: {
            margin: 10,
        },
    })

    return (
        <View>
            <Text style={styles.title}>Player Connections</Text>
            <View style={styles.dropdownContainer}>
                <Dropdown
                    style={styles.dropdown}
                    selectedTextStyle={styles.selectedTextStyle}
                    containerStyle={styles.containerStyle}
                    itemTextStyle={styles.itemTextStyle}
                    placeholderStyle={styles.selectedTextStyle}
                    activeColor={colors.textSecondary}
                    data={playerData}
                    labelField="label"
                    valueField="value"
                    onChange={v => setThrowerId(v.value)}
                    value={throwerId}
                    placeholder="Player One"
                />
                <View>
                    <Text style={styles.toText}>to</Text>
                    <IconButton
                        icon="sync"
                        iconColor={colors.textPrimary}
                        style={styles.switchButton}
                        onPress={() => {
                            const currentThrowerId = throwerId
                            setThrowerId(receiverId)
                            setReceiverId(currentThrowerId)
                        }}
                    />
                </View>
                <Dropdown
                    style={styles.dropdown}
                    selectedTextStyle={styles.selectedTextStyle}
                    containerStyle={styles.containerStyle}
                    itemTextStyle={styles.itemTextStyle}
                    placeholderStyle={styles.selectedTextStyle}
                    activeColor={colors.textSecondary}
                    data={playerData}
                    labelField="label"
                    valueField="value"
                    onChange={v => setReceiverId(v.value)}
                    value={receiverId}
                    placeholder="Player Two"
                />
            </View>
            <View>
                <View style={styles.connectionsContainer}>
                    <ConnectionsStatView
                        loading={isLoading}
                        connection={data}
                        playerOne={
                            playerData.find(value => value.value === throwerId)
                                ?.label
                        }
                        playerTwo={
                            playerData.find(value => value.value === receiverId)
                                ?.label
                        }
                    />
                </View>
            </View>
        </View>
    )
}

export default PlayerConnectionsView
