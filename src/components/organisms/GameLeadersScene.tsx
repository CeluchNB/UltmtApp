import LeaderListItem from '../atoms/LeaderListItem'
import React from 'react'
import SecondaryButton from '../atoms/SecondaryButton'
import { convertGameStatsToLeaderItems } from '../../utils/stats'
import { getGameStats } from '../../services/data/stats'
import { useQuery } from 'react-query'
import { FlatList, StyleSheet, View } from 'react-native'

interface GameLeadersSceneProps {
    gameId: string
}
const GameLeadersScene: React.FC<GameLeadersSceneProps> = ({ gameId }) => {
    const { data } = useQuery(['gameStats', { gameId }], () =>
        getGameStats(gameId),
    )

    const leaderList = React.useMemo(() => {
        return convertGameStatsToLeaderItems(data)
    }, [data])

    const styles = StyleSheet.create({
        button: {
            width: '50%',
            alignSelf: 'flex-end',
            margin: 5,
        },
    })

    return (
        <View>
            <SecondaryButton
                style={styles.button}
                text="more stats"
                onPress={async () => {}}
            />
            <FlatList
                data={leaderList}
                renderItem={({ item }) => {
                    return <LeaderListItem leader={item} />
                }}
            />
        </View>
    )
}

export default GameLeadersScene
