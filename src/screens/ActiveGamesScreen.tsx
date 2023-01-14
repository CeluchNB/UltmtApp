import { ActiveGamesProps } from '../types/navigation'
import BaseScreen from '../components/atoms/BaseScreen'
import { Game } from '../types/game'
import GameListItem from '../components/atoms/GameListItem'
import React from 'react'
import ScreenTitle from '../components/atoms/ScreenTitle'
import { getActiveGames } from '../services/data/game'
import { selectAccount } from '../store/reducers/features/account/accountReducer'
import { useData } from '../hooks'
import { useSelector } from 'react-redux'
import { FlatList, StyleSheet } from 'react-native'

const ActiveGamesScreen: React.FC<ActiveGamesProps> = () => {
    const account = useSelector(selectAccount)
    const { data: games } = useData<Game[]>(getActiveGames, account._id)

    const styles = StyleSheet.create({
        list: { marginTop: 10 },
    })

    return (
        <BaseScreen containerWidth="80%">
            <ScreenTitle title="Active Games" />
            <FlatList
                style={styles.list}
                data={games}
                renderItem={({ item }) => {
                    return (
                        <GameListItem
                            game={item}
                            teamId={
                                item.creator._id === account._id
                                    ? item.teamOne._id
                                    : item.teamTwo._id
                            }
                            onPress={() => {}}
                        />
                    )
                }}
            />
        </BaseScreen>
    )
}

export default ActiveGamesScreen
