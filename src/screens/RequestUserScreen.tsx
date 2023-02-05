import * as React from 'react'
import * as RequestData from '../services/data/request'
import * as TeamData from '../services/data/team'
import BulkCodeModal from '../components/molecules/BulkCodeModal'
import { DisplayUser } from '../types/user'
import { IconButton } from 'react-native-paper'
import { RequestType } from '../types/request'
import { RequestUserProps } from '../types/navigation'
import SearchBar from '../components/atoms/SearchBar'
import SecondaryButton from '../components/atoms/SecondaryButton'
import UserSearchResultItem from '../components/atoms/UserSearchResultItem'
import { searchUsers } from '../services/data/user'
import { selectTeam } from '../store/reducers/features/team/managedTeamReducer'
import { useSelector } from 'react-redux'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { useLazyData, useTheme } from '../hooks'

const RequestUserScreen: React.FC<RequestUserProps> = ({
    navigation,
    route,
}) => {
    const { type } = route.params
    const {
        theme: { colors, size, weight },
    } = useTheme()
    const team = useSelector(selectTeam)
    const [players, setPlayers] = React.useState<DisplayUser[]>([])
    const [selectedPlayers, setSelectedPlayers] = React.useState<DisplayUser[]>(
        [],
    )
    const [requestLoading, setRequestLoading] = React.useState(false)
    const [selectedId, setSelectedId] = React.useState('')
    const [error, setError] = React.useState('')
    const [searchError, setSearchError] = React.useState('')
    const [displayCodeModal, setDisplayCodeModal] = React.useState(false)

    const {
        loading: bulkCodeLoading,
        data: bulkJoinCode,
        error: bulkJoinError,
        fetch: fetchCode,
    } = useLazyData<string>(TeamData.createBulkJoinCode)

    React.useEffect(() => {
        navigation.setOptions({
            title: `Add ${
                type === RequestType.PLAYER ? 'Players' : 'Managers'
            }`,
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const search = async (term: string) => {
        setError('')
        if (term.length < 3) {
            setSearchError('')
            setPlayers([])
            return
        }

        try {
            const users = await searchUsers(term)
            if (users.length <= 0) {
                throw new Error()
            }
            setPlayers(users)
        } catch (e) {
            setPlayers([])
            setSearchError('No results from this search, please try again')
        }
    }

    const requestUser = async (user: DisplayUser) => {
        try {
            setError('')
            setRequestLoading(true)
            setSelectedId(user._id)
            switch (type) {
                case RequestType.PLAYER:
                    await RequestData.requestUser(user._id, team?._id || '')
                    break
                case RequestType.MANAGER:
                    await TeamData.addManager(team?._id || '', user._id)
                    break
            }
            setSelectedPlayers([user, ...selectedPlayers])
        } catch (e: any) {
            setError(e.message)
        } finally {
            setRequestLoading(false)
        }
    }

    const requestBulkCode = async () => {
        await fetchCode(team?._id || '')
        setDisplayCodeModal(true)
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
            width: '75%',
        },
        error: {
            color: colors.gray,
            width: '75%',
            fontSize: size.fontThirty,
            fontWeight: weight.normal,
            alignSelf: 'center',
        },
        list: {
            width: '75%',
            alignSelf: 'center',
            flexGrow: 0,
        },
        separator: {
            height: 2,
            width: '75%',
            backgroundColor: colors.gray,
            alignSelf: 'center',
            marginBottom: 10,
            marginTop: 10,
        },
        playerContainer: {
            flexDirection: 'row',
        },
        playerItem: {
            color: colors.success,
            fontSize: size.fontTwenty,
            fontWeight: weight.full,
            flex: 1,
            alignSelf: 'center',
        },
        bulkCodeButton: {
            alignSelf: 'center',
        },
    })

    return (
        <View style={styles.screen}>
            <SearchBar
                placeholder={`Search ${
                    type === RequestType.PLAYER ? 'players' : 'managers'
                }...`}
                style={styles.input}
                onChangeText={search}
            />
            <SecondaryButton
                style={styles.bulkCodeButton}
                text="create bulk join code"
                loading={bulkCodeLoading}
                onPress={async () => {
                    await requestBulkCode()
                }}
            />
            {searchError.length > 0 && (
                <Text style={styles.error}>{searchError}</Text>
            )}
            <BulkCodeModal
                code={bulkJoinCode || ''}
                error={bulkJoinError?.message || ''}
                visible={displayCodeModal}
                onClose={() => {
                    setDisplayCodeModal(false)
                }}
            />
            <FlatList
                style={styles.list}
                data={players}
                keyExtractor={item => item._id}
                renderItem={({ item }: { item: DisplayUser }) => (
                    <UserSearchResultItem
                        name={`${item.firstName} ${item.lastName}`}
                        username={`@${item.username}`}
                        loading={selectedId === item._id && requestLoading}
                        onPress={() => requestUser(item)}
                        error={
                            selectedId === item._id && error.length > 0
                                ? error
                                : undefined
                        }
                    />
                )}
            />
            {selectedPlayers.length > 0 && <View style={styles.separator} />}
            <FlatList
                style={styles.list}
                data={selectedPlayers}
                keyExtractor={item => item._id}
                renderItem={({ item }: { item: DisplayUser }) => {
                    return (
                        <View style={styles.playerContainer}>
                            <Text
                                style={
                                    styles.playerItem
                                }>{`${item.firstName} ${item.lastName}`}</Text>
                            <IconButton
                                icon="check"
                                iconColor={colors.success}
                                disabled
                            />
                        </View>
                    )
                }}
            />
        </View>
    )
}

export default RequestUserScreen
