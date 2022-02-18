import * as React from 'react'
import * as RequestServices from '../store/services/request'
import * as UserServices from '../store/services/user'
import { DisplayUser } from '../types/user'
import { RequestUserProps } from '../types/navigation'
import ScreenTitle from '../components/atoms/ScreenTitle'
import UserSearchResultItem from '../components/atoms/UserSearchResultItem'
import { selectToken } from '../store/reducers/features/account/accountReducer'
import { useColors } from '../hooks'
import { useSelector } from 'react-redux'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { IconButton, TextInput } from 'react-native-paper'
import { size, weight } from '../theme/fonts'

const RequestUserScreen: React.FC<RequestUserProps> = ({ route }) => {
    const { colors } = useColors()
    const { id } = route.params
    const token = useSelector(selectToken)
    const [players, setPlayers] = React.useState([])
    const [selectedPlayers, setSelectedPlayers] = React.useState<DisplayUser[]>(
        [],
    )
    const [requestLoading, setRequestLoading] = React.useState(false)
    const [selectedId, setSelectedId] = React.useState('')
    const [error, setError] = React.useState('')
    const [searchError, setSearchError] = React.useState('')

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

    const search = async (term: string) => {
        setError('')
        if (term.length < 3) {
            setSearchError('')
            setPlayers([])
            return
        }

        try {
            const result = await UserServices.searchUsers(term)
            if (result.data) {
                if (!result.data?.users || result.data.users.length < 1) {
                    throw Error('error')
                }
                setSearchError('')
                setPlayers(result.data.users)
            } else {
                throw Error('Error')
            }
        } catch (e) {
            setPlayers([])
            setSearchError('No results from this search, please try again')
        }
    }

    const requestUser = async (user: DisplayUser) => {
        setError('')
        try {
            setRequestLoading(true)
            setSelectedId(user._id)
            const result = await RequestServices.requestUser(
                token,
                user._id,
                id,
            )
            if (result.data) {
                setSelectedPlayers([user, ...selectedPlayers])
            } else {
                setError(result.error.message)
            }
            setRequestLoading(false)
        } catch (e) {
            setError('Unable to request user')
        }
    }

    return (
        <View style={styles.screen}>
            <ScreenTitle style={styles.title} title="Add Players" />
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
                placeholder="Search players..."
            />
            {searchError.length > 0 && (
                <Text style={styles.error}>{searchError}</Text>
            )}
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
