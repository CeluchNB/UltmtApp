import { ActiveGamesProps } from '../types/navigation'
import BaseScreen from '../components/atoms/BaseScreen'
import { Game } from '../types/game'
import GameListItem from '../components/atoms/GameListItem'
import React from 'react'
import ScreenTitle from '../components/atoms/ScreenTitle'
import { getActivePointForGame } from '../services/data/point'
import { selectAccount } from '../store/reducers/features/account/accountReducer'
import { useData } from '../hooks'
import { FlatList, StyleSheet } from 'react-native'
import { getActiveGames, resurrectActiveGame } from '../services/data/game'
import {
    resetPoint,
    setPoint,
} from '../store/reducers/features/point/livePointReducer'
import {
    setGame,
    setTeam,
} from '../store/reducers/features/game/liveGameReducer'
import { useDispatch, useSelector } from 'react-redux'

const ActiveGamesScreen: React.FC<ActiveGamesProps> = ({ navigation }) => {
    const account = useSelector(selectAccount)
    const dispatch = useDispatch()
    const { data: games } = useData<Game[]>(getActiveGames, account._id)

    const getMyTeamId = (game: Game): string => {
        return (
            (game.creator._id === account._id
                ? game.teamOne._id
                : game.teamTwo._id) || ''
        )
    }

    const getTeamNumber = (game: Game): string => {
        return game.creator._id === account._id ? 'one' : 'two'
    }

    const navigateToGame = async (activeGame: Game) => {
        // get game data
        const game = await resurrectActiveGame(
            activeGame._id,
            getMyTeamId(activeGame),
        )
        // get point data
        // either an in progress point or a new point
        // actions handled in useGameEditor
        const point = await getActivePointForGame(game)
        const myTeamNumber = getTeamNumber(game)
        dispatch(setGame(game))
        dispatch(setTeam(myTeamNumber))
        if (!point) {
            dispatch(resetPoint())
            navigation.navigate('LiveGame', { screen: 'FirstPoint' })
            return
        }
        dispatch(setPoint(point))
        if (myTeamNumber === 'one' && point?.teamOneActions.length === 0) {
            navigation.navigate('LiveGame', { screen: 'SelectPlayers' })
            return
        } else if (
            myTeamNumber === 'two' &&
            point?.teamTwoActions.length === 0
        ) {
            navigation.navigate('LiveGame', { screen: 'SelectPlayers' })
            return
        }

        navigation.navigate('LiveGame', { screen: 'LivePointEdit' })
    }

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
                            teamId={getMyTeamId(item)}
                            onPress={() => {
                                navigateToGame(item)
                            }}
                        />
                    )
                }}
            />
        </BaseScreen>
    )
}

export default ActiveGamesScreen
