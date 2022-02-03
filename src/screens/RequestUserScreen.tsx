import * as React from 'react'
import * as UserServices from '../store/services/user'
import { DisplayUser } from '../types/user'
import ScreenTitle from '../components/atoms/ScreenTitle'
import { TextInput } from 'react-native-paper'
import UserSearchResultItem from '../components/atoms/UserSearchResultItem'
import { useColors } from '../hooks'
import { FlatList, StyleSheet, View } from 'react-native'

const RequestUserScreen: React.FC<{}> = () => {
    const { colors } = useColors()
    const [players, setPlayers] = React.useState([])
    // const [selectedPlayers, setSelectedPlayers] = React.useState([])

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
                    />
                )}
            />
        </View>
    )
}

export default RequestUserScreen
