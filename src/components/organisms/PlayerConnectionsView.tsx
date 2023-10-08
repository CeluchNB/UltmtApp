import ConnectionsStatView from '../atoms/ConnectionsStatView'
import { Dropdown } from 'react-native-element-dropdown'
import { FilteredGamePlayer } from '../../types/stats'
import React from 'react'
import { filterConnectionStats } from '../../services/data/stats'
import { useQuery } from 'react-query'
import { useTheme } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'

interface PlayerConnectionsViewProps {
    players: FilteredGamePlayer[]
    throwerId?: string
    receiverId?: string
    games?: string[]
    teams?: string[]
}

const PlayerConnectionsView: React.FC<PlayerConnectionsViewProps> = ({
    players,
    throwerId: propsThrowerId,
    receiverId: propsReceiverId,
    games = [],
    teams = [],
}) => {
    const {
        theme: { colors, size },
    } = useTheme()

    const [throwerId, setThrowerId] = React.useState<string | undefined>(
        propsThrowerId,
    )
    const [receiverId, setReceiverId] = React.useState<string | undefined>(
        propsReceiverId,
    )
    const { data, isLoading } = useQuery(
        ['filterConnections', { throwerId, receiverId, games, teams }],
        () =>
            filterConnectionStats(
                throwerId || '',
                receiverId || '',
                games,
                teams,
            ),
        {
            enabled: throwerId?.length !== 0 && receiverId?.length !== 0,
            retry: 0,
        },
    )

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
                <Text style={styles.toText}>to</Text>
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
                    />
                </View>
            </View>
        </View>
    )
}

export default PlayerConnectionsView
