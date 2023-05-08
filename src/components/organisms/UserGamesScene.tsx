import BaseScreen from '../atoms/BaseScreen'
import { DisplayTeam } from '../../types/team'
import { Game } from '../../types/game'
import GameListItem from '../atoms/GameListItem'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '../../hooks'
import { SectionList, StyleSheet, Text } from 'react-native'

export interface UserGamesSceneProps {
    gameLists: { title: string; data: Game[]; index: number }[]
    teams: DisplayTeam[]
}

const UserGamesScene: React.FC<UserGamesSceneProps> = ({
    gameLists,
    teams,
}) => {
    const {
        theme: { colors, size, weight },
    } = useTheme()
    const navigation = useNavigation()

    const styles = StyleSheet.create({
        teamTitle: {
            color: colors.textPrimary,
            fontSize: size.fontThirty,
            fontWeight: weight.bold,
        },
    })

    return (
        <BaseScreen containerWidth="80%">
            <SectionList
                sections={gameLists}
                keyExtractor={item => item._id}
                renderSectionHeader={({ section: { title } }) => {
                    return <Text style={styles.teamTitle}>{title}</Text>
                }}
                renderItem={({ item, section }) => {
                    return (
                        <GameListItem
                            game={item}
                            teamId={teams[section.index]._id}
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

export default UserGamesScene
