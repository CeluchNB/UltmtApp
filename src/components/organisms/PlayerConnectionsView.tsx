import ConnectionsStatView from '../atoms/ConnectionsStatView'
import { Dropdown } from 'react-native-element-dropdown'
import { FilteredGamePlayer } from '../../types/stats'
import React from 'react'
import { filterConnectionStats } from '../../services/data/stats'
import { useQuery } from 'react-query'
import { useTheme } from '../../hooks'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

interface PlayerConnectionsViewProps {
    players: FilteredGamePlayer[]
    games?: string[]
    teams?: string[]
}

const PlayerConnectionsView: React.FC<PlayerConnectionsViewProps> = ({
    players,
    games = [],
    teams = [],
}) => {
    const {
        theme: { colors, size },
    } = useTheme()

    const [throwerId, setThrowerId] = React.useState<string | undefined>('')
    const [receiverId, setReceiverId] = React.useState<string | undefined>('')
    const { data, isLoading, error } = useQuery(
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
        errorText: {
            color: colors.gray,
            fontSize: size.fontTwenty,
            textAlign: 'center',
        },
        selectedTextStyle: {
            color: colors.textPrimary,
        },
        containerStyle: {
            backgroundColor: colors.darkPrimary,
            borderColor: colors.darkPrimary,
        },
        itemTextStyle: { color: colors.darkGray },
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
                {isLoading && (
                    <ActivityIndicator
                        size="small"
                        color={colors.textPrimary}
                    />
                )}
                {data && (
                    <View style={{ margin: 10 }}>
                        <ConnectionsStatView connection={data} />
                    </View>
                )}
                {error ? (
                    <Text style={styles.errorText}>
                        No connections from Player One to Player Two
                    </Text>
                ) : null}
            </View>
        </View>
    )
}

export default PlayerConnectionsView
