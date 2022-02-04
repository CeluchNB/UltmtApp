import * as React from 'react'
import * as RequestServices from '../store/services/request'
import * as UserServices from '../store/services/user'
import { DisplayUser } from '../types/user'
import { RequestUserProps } from '../types/navigation'
import ScreenTitle from '../components/atoms/ScreenTitle'
import { TextInput } from 'react-native-paper'
import UserSearchResultItem from '../components/atoms/UserSearchResultItem'
import { selectToken } from '../store/reducers/features/account/accountReducer'
import { useColors } from '../hooks'
import { useSelector } from 'react-redux'
import { FlatList, StyleSheet, View } from 'react-native'

const RequestUserScreen: React.FC<RequestUserProps> = ({ route }) => {
    const { colors } = useColors()
    const { id } = route.params
    const token = useSelector(selectToken)
    const [players, setPlayers] = React.useState([])
    // const [selectedPlayers, setSelectedPlayers] = React.useState([])
    const [requestLoading, setRequestLoading] = React.useState(false)
    const [selectedId, setSelectedId] = React.useState('')

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
        list: {
            width: '75%',
            alignSelf: 'center',
        },
    })

    const search = async (term: string) => {
        if (term.length < 3) {
            return
        }

        try {
            const result = await UserServices.searchUsers(term)
            setPlayers(result.data.users)
        } catch (error) {
            console.log('search error', error)
            // HANDLE ERROR
        }
    }

    const requestUser = async (userId: string) => {
        try {
            setRequestLoading(true)
            setSelectedId(userId)
            const result = await RequestServices.requestUser(token, userId, id)
            if (result.data) {
            } else {
                console.log('request response error', result.error)
                // HANDLE ERROR
            }
            setRequestLoading(false)
        } catch (error) {
            console.log('request handle error', error)
            // HANDLE ERROR
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
            <FlatList
                style={styles.list}
                data={players}
                keyExtractor={item => item._id}
                renderItem={({ item }: { item: DisplayUser }) => (
                    <UserSearchResultItem
                        name={`${item.firstName} ${item.lastName}`}
                        username={`@${item.username}`}
                        loading={selectedId === item._id && requestLoading}
                        onPress={() => requestUser(item._id)}
                    />
                )}
            />
        </View>
    )
}

export default RequestUserScreen
