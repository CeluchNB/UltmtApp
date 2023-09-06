import * as React from 'react'
import * as RequestData from '../services/data/request'
import * as TeamData from '../services/data/team'
import BaseModal from '../components/atoms/BaseModal'
import PrimaryButton from '../components/atoms/PrimaryButton'
import { RequestTeamProps } from '../types/navigation'
import SearchBar from '../components/atoms/SearchBar'
import SearchResultItem from '../components/atoms/SearchResultItem'
import SecondaryButton from '../components/atoms/SecondaryButton'
import { Team } from '../types/team'
import { addRequest } from '../store/reducers/features/account/accountReducer'
import { useDispatch } from 'react-redux'
import { useTheme } from '../hooks'
import { FlatList, StyleSheet, Text, View } from 'react-native'

const RequestTeamScreen: React.FC<RequestTeamProps> = ({ navigation }) => {
    const {
        theme: { colors, size },
    } = useTheme()
    const [teams, setTeams] = React.useState<Team[]>([])
    const dispatch = useDispatch()
    const [loading, setLoading] = React.useState(false)
    const [selectedId, setSelectedId] = React.useState('')
    const [error, setError] = React.useState('')
    const [searchError, setSearchError] = React.useState('')
    const [modalVisible, setModalVisible] = React.useState(false)

    const search = async (text: string) => {
        setSearchError('')
        if (text.length < 3) {
            setTeams([])
            return
        }
        try {
            const teamsResponse = await TeamData.searchTeam(text)
            setTeams(teamsResponse)
        } catch (e: any) {
            setSearchError(e.message ?? 'No search results from this query.')
        }
    }

    const requestTeam = async (team: Team) => {
        if (!team.rosterOpen) {
            setModalVisible(true)
            return
        }
        try {
            setError('')
            setLoading(true)
            setSelectedId(team._id)
            const request = await RequestData.requestTeam(team._id)
            dispatch(addRequest(request._id))

            setLoading(false)
            navigation.goBack()
        } catch (e: any) {
            setLoading(false)
            setError(e.message)
        }
    }

    const displayError = (item: Team) => {
        if (error.length > 0 && selectedId === item._id) {
            return error
        } else if (!item.rosterOpen) {
            return 'Closed'
        }
        return undefined
    }

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
            backgroundColor: colors.primary,
        },
        title: {
            alignSelf: 'center',
        },
        joinButton: {
            alignSelf: 'center',
        },
        input: {
            width: '75%',
        },
        error: {
            width: '75%',
            alignSelf: 'center',
            fontSize: size.fontThirty,
            color: colors.gray,
        },
        list: {
            width: '75%',
            alignSelf: 'center',
        },
        modalText: {
            color: colors.textSecondary,
            fontSize: size.fontFifteen,
            marginBottom: 15,
        },
    })

    return (
        <View style={styles.screen}>
            <SearchBar
                style={styles.input}
                onChangeText={search}
                placeholder="Search teams..."
            />
            <SecondaryButton
                style={styles.joinButton}
                text="join by code"
                onPress={async () => {
                    navigation.navigate('JoinByCode')
                }}
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
                                onPress={() => requestTeam(item)}
                                loading={selectedId === item._id && loading}
                                error={displayError(item)}
                            />
                        )
                    }}
                />
            )}
            <BaseModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}>
                <Text style={styles.modalText}>
                    You cannot request to join this team. A team's manager can
                    permit requests from the team's page.
                </Text>
                <PrimaryButton
                    text="done"
                    onPress={() => setModalVisible(false)}
                    loading={false}
                />
            </BaseModal>
        </View>
    )
}

export default RequestTeamScreen
