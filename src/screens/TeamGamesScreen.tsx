import BaseScreen from '../components/atoms/BaseScreen'
import { Game } from '../types/game'
import GameListItem from '../components/atoms/GameListItem'
import React from 'react'
import ScreenTitle from '../components/atoms/ScreenTitle'
import { TeamGameProps } from '../types/navigation'
import { getGamesByTeam } from '../services/data/game'
import { useColors } from '../hooks'
import { useSelector } from 'react-redux'
import { SectionList, StyleSheet, Text } from 'react-native'
import {
    selectManagerTeams,
    selectPlayerTeams,
} from '../store/reducers/features/account/accountReducer'
import { size, weight } from '../theme/fonts'

const TeamGameScreen: React.FC<TeamGameProps> = ({ navigation }) => {
    const { colors } = useColors()
    const managerTeams = useSelector(selectManagerTeams)
    const playerTeams = useSelector(selectPlayerTeams)
    const [games, setGames] = React.useState<Game[][]>([])

    const allTeams = React.useMemo(() => {
        const map = new Map()
        managerTeams.forEach(team => {
            map.set(team._id, team)
        })
        playerTeams.forEach(team => {
            map.set(team._id, team)
        })
        return [...map.values()]
    }, [managerTeams, playerTeams])

    const data = React.useMemo(() => {
        const tempGames: { title: string; data: Game[]; index: number }[] = []
        games.forEach((g, index) => {
            if (g.length === 0) {
                return
            }
            const sortedGames = g.sort(
                (a, b) =>
                    new Date(b.startTime).getTime() -
                    new Date(a.startTime).getTime(),
            )
            tempGames.push({
                title: `${allTeams[index].place} ${allTeams[index].name}`,
                data: sortedGames,
                index: index,
            })
        })
        return tempGames
    }, [games, allTeams])

    React.useEffect(() => {
        const promises = allTeams.map(team => getGamesByTeam(team._id))

        Promise.all(promises).then(g => {
            setGames(g)
        })
    }, [allTeams])

    const styles = StyleSheet.create({
        teamTitle: {
            color: colors.textPrimary,
            fontSize: size.fontLarge,
            fontWeight: weight.bold,
        },
    })

    return (
        <BaseScreen containerWidth="80%">
            <ScreenTitle title="Your Games" />
            <SectionList
                sections={data}
                keyExtractor={item => item._id}
                renderSectionHeader={({ section: { title } }) => {
                    return <Text style={styles.teamTitle}>{title}</Text>
                }}
                renderItem={({ item, section }) => {
                    return (
                        <GameListItem
                            game={item}
                            teamId={allTeams[section.index]._id}
                            onPress={() => {
                                navigation.navigate('Tabs', {
                                    screen: 'Games',
                                    params: {
                                        screen: 'ViewGame',
                                        params: { gameId: item._id },
                                    },
                                })
                            }}
                        />
                    )
                }}
            />
        </BaseScreen>
    )
}

export default TeamGameScreen