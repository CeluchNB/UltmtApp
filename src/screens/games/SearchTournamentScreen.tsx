import * as Constants from '../../utils/constants'
import BaseScreen from '../../components/atoms/BaseScreen'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import React from 'react'
import SearchBar from '../../components/atoms/SearchBar'
import { SeearchTournamentProps } from '../../types/navigation'
import { Tournament } from '../../types/tournament'
import TournamentListItem from '../../components/atoms/TournamentListItem'
import { searchTournaments } from '../../services/data/tournament'
import { setTournament } from '../../store/reducers/features/game/liveGameReducer'
import { useDispatch } from 'react-redux'
import { useTheme } from '../../hooks'
import { FlatList, StyleSheet, Text } from 'react-native'

const SearchTournamentScreen: React.FC<SeearchTournamentProps> = ({
    navigation,
}) => {
    const {
        theme: { colors, size },
    } = useTheme()
    const dispatch = useDispatch()
    const [tournaments, setTournaments] = React.useState<Tournament[]>([])
    const [error, setError] = React.useState('')

    const search = async (q: string) => {
        try {
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
            height: '80%',
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
    })

    return (
        <BaseScreen containerWidth="90%">
            <SearchBar
                placeholder="Search tournaments..."
                onChangeText={search}
            />
            {error.length > 0 && <Text style={styles.error}>{error}</Text>}
            <FlatList
                style={styles.list}
                data={tournaments}
                renderItem={({ item }) => {
                    return (
                        <TournamentListItem
                            tournament={item}
                            onPress={async () => {
                                dispatch(setTournament(item))
                                navigation.goBack()
                            }}
                        />
                    )
                }}
            />
            <PrimaryButton
                text="create tournament"
                onPress={() => {}}
                loading={false}
            />
        </BaseScreen>
    )
}

export default SearchTournamentScreen