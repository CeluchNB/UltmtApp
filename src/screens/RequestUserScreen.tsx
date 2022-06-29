import * as React from 'react'
import * as RequestData from '../services/data/request'
import * as TeamData from '../services/data/team'
import { DisplayUser } from '../types/user'
import { RequestType } from '../types/request'
import { RequestUserProps } from '../types/navigation'
import ScreenTitle from '../components/atoms/ScreenTitle'
// import SecondaryButton from '../components/atoms/SecondaryButton'
import UserSearchResultItem from '../components/atoms/UserSearchResultItem'
import { searchUsers } from '../services/data/user'
import { selectTeam } from '../store/reducers/features/team/managedTeamReducer'
import { selectToken } from '../store/reducers/features/account/accountReducer'
import { useColors } from '../hooks'
import { useSelector } from 'react-redux'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { IconButton, TextInput } from 'react-native-paper'
import { size, weight } from '../theme/fonts'

const RequestUserScreen: React.FC<RequestUserProps> = ({ route }) => {
    const { type } = route.params
    const { colors } = useColors()
    const team = useSelector(selectTeam)
    const token = useSelector(selectToken)
    const [players, setPlayers] = React.useState<DisplayUser[]>([])
    const [selectedPlayers, setSelectedPlayers] = React.useState<DisplayUser[]>(
        [],
    )
    const [requestLoading, setRequestLoading] = React.useState(false)
    const [selectedId, setSelectedId] = React.useState('')
    const [error, setError] = React.useState('')
    const [searchError, setSearchError] = React.useState('')

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
                    await RequestData.requestUser(
                        token,
                        user._id,
                        team?._id || '',
                    )
                    break
                case RequestType.MANAGER:
                    await TeamData.addManager(token, team?._id || '', user._id)
                    break
            }
            setSelectedPlayers([user, ...selectedPlayers])
        } catch (e: any) {
            setError(e.message)
        } finally {
            setRequestLoading(false)
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
            color: colors.gray,
            width: '75%',
            fontSize: size.fontLarge,
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
            fontSize: size.fontMedium,
            fontWeight: weight.full,
            flex: 1,
            alignSelf: 'center',
        },
    })

    return (
        <View style={styles.screen}>
            <ScreenTitle
                style={styles.title}
                title={`Add ${
                    type === RequestType.PLAYER ? 'Players' : 'Managers'
                }`}
            />
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
                placeholder={`Search ${
                    type === RequestType.PLAYER ? 'players' : 'managers'
                }...`}
            />
            {searchError.length > 0 && (
                <Text style={styles.error}>{searchError}</Text>
            )}
            {/* <SecondaryButton
                text="create bulk join code"
                onPress={async () => {

                }}
            /> */}
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
                                color={colors.success}
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
