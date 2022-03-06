import * as React from 'react'
import * as RequestData from '../services/data/request'
import * as TeamData from '../services/data/team'
import { Props } from '../types/navigation'
import ScreenTitle from '../components/atoms/ScreenTitle'
import SearchResultItem from '../components/atoms/SearchResultItem'
import { Team } from '../types/team'
import { TextInput } from 'react-native-paper'
import { size } from '../theme/fonts'
import { useColors } from '../hooks'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import {
    addRequest,
    selectToken,
} from '../store/reducers/features/account/accountReducer'
import { useDispatch, useSelector } from 'react-redux'

const RequestTeamScreen: React.FC<Props> = ({ navigation }: Props) => {
    const { colors } = useColors()
    const [teams, setTeams] = React.useState<Team[]>([])
    const token = useSelector(selectToken)
    const dispatch = useDispatch()
    const [loading, setLoading] = React.useState(false)
    const [selectedId, setSelectedId] = React.useState('')
    const [error, setError] = React.useState('')
    const [searchError, setSearchError] = React.useState('')

    const search = async (text: string) => {
        setSearchError('')
        if (text.length < 3) {
            setTeams([])
        }
        try {
            const teamsResponse = await TeamData.searchTeam(text)
            setTeams(teamsResponse)
        } catch (e: any) {
            setSearchError(e.message ?? 'No search results from this query.')
        }
    }

    const requestTeam = async (id: string) => {
        try {
            setError('')
            setLoading(true)
            setSelectedId(id)
            const request = await RequestData.requestTeam(token, id)
            dispatch(addRequest(request._id))

            setLoading(false)
            navigation.goBack()
        } catch (e: any) {
            setLoading(false)
            setError(e.message)
        }
    }

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
            backgroundColor: colors.primary,
        },
        title: {
            alignSelf: 'center',
        },
        input: {
            backgroundColor: colors.primary,
            color: colors.textPrimary,
            width: '75%',
            alignSelf: 'center',
            marginBottom: 5,
        },
        error: {
            width: '75%',
            alignSelf: 'center',
            fontSize: size.fontLarge,
            color: colors.gray,
        },
        list: {
            width: '75%',
            alignSelf: 'center',
        },
    })

    return (
        <View style={styles.screen}>
            <ScreenTitle style={styles.title} title="Request Team" />
            <TextInput
                mode="flat"
                style={[styles.input]}
                underlineColor={colors.textPrimary}
                activeUnderlineColor={colors.textPrimary}
                placeholderTextColor={colors.gray}
                onChangeText={search}
                theme={{
                    colors: {
                        text: colors.textPrimary,
                    },
                }}
                placeholder="Search teams..."
            />
            {searchError.length > 0 ? (
                <Text style={styles.error}>{searchError}</Text>
            ) : (
                <FlatList
                    style={styles.list}
                    data={teams}
                    keyExtractor={item => item._id}
                    renderItem={({ item }: { item: Team }) => {
                        return (
                            <SearchResultItem
                                header={`${item.place} ${item.name}`}
                                subheader={`@${item.teamname}`}
                                onPress={() => requestTeam(item._id)}
                                loading={selectedId === item._id && loading}
                                error={
                                    error.length > 0 && selectedId === item._id
                                        ? error
                                        : undefined
                                }
                            />
                        )
                    }}
                />
            )}
        </View>
    )
}

export default RequestTeamScreen
