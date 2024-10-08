import * as Constants from '../../utils/constants'
import BaseScreen from '../../components/atoms/BaseScreen'
import { CreateGameContext } from '../../context/create-game-context'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import SearchBar from '../../components/atoms/SearchBar'
import { SearchTournamentProps } from '../../types/navigation'
import { Tournament } from '../../types/tournament'
import TournamentListItem from '../../components/atoms/TournamentListItem'
import { searchTournaments } from '../../services/data/tournament'
import { useTheme } from '../../hooks'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useContext } from 'react'

const SearchTournamentScreen: React.FC<SearchTournamentProps> = ({
    navigation,
}) => {
    const {
        theme: { colors, size },
    } = useTheme()
    const [query, setQuery] = React.useState('')
    const [tournaments, setTournaments] = React.useState<Tournament[]>([])
    const [error, setError] = React.useState('')
    const { setTournament } = useContext(CreateGameContext)

    const search = async (q: string) => {
        try {
            setQuery(q)
            setError('')
            setTournaments([])
            const result = await searchTournaments(q)
            setTournaments(result)
        } catch (e: any) {
            setError(e?.message ?? Constants.SEARCH_TOURNAMENT_ERROR)
        }
    }

    const styles = StyleSheet.create({
        list: {
            height: '98%',
            width: '90%',
            alignSelf: 'center',
        },
        error: {
            width: '75%',
            alignSelf: 'center',
            textAlign: 'center',
            fontSize: size.fontThirty,
            color: colors.gray,
        },
        contentContainerStyle: {
            flexGrow: 1,
        },
        footer: {
            flex: 1,
            justifyContent: 'flex-end',
        },
    })

    return (
        <BaseScreen containerWidth={90}>
            <FlatList
                style={styles.list}
                data={tournaments}
                contentContainerStyle={styles.contentContainerStyle}
                ListHeaderComponent={
                    <View>
                        <SearchBar
                            placeholder="Search Tournaments..."
                            onChangeText={search}
                        />
                        {error.length > 0 && (
                            <Text style={styles.error}>{error}</Text>
                        )}
                    </View>
                }
                ListFooterComponentStyle={styles.footer}
                ListFooterComponent={
                    <PrimaryButton
                        text="create tournament"
                        onPress={() => {
                            navigation.navigate('CreateTournament', {
                                name: query,
                            })
                        }}
                        loading={false}
                    />
                }
                renderItem={({ item }) => {
                    return (
                        <TournamentListItem
                            tournament={item}
                            onPress={async () => {
                                setTournament(item)
                                navigation.goBack()
                            }}
                        />
                    )
                }}
            />
        </BaseScreen>
    )
}

export default SearchTournamentScreen
