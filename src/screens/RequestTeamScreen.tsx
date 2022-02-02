import * as React from 'react'
import * as RequestServices from '../store/services/request'
import * as TeamServices from '../store/services/team'
import { Props } from '../types/navigation'
import ScreenTitle from '../components/atoms/ScreenTitle'
import SearchResultItem from '../components/atoms/SearchResultItem'
import { Team } from '../types/team'
import { TextInput } from 'react-native-paper'
import { selectToken } from '../store/reducers/features/account/accountReducer'
import { useColors } from '../hooks'
import { useSelector } from 'react-redux'
import { FlatList, StyleSheet, View } from 'react-native'

const RequestTeamScreen: React.FC<Props> = ({ navigation }: Props) => {
    const { colors } = useColors()
    const [teams, setTeams] = React.useState([])
    const token = useSelector(selectToken)
    const [loading, setLoading] = React.useState(false)
    const [selectedId, setSelectedId] = React.useState('')
    const [error, setError] = React.useState('')

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
        },
        list: {
            width: '75%',
            alignSelf: 'center',
        },
    })

    const search = async (text: string) => {
        if (text.length >= 3) {
            const result = await TeamServices.searchTeam(text)
            setTeams(result.data)
        } else {
            setTeams([])
        }
    }

    const requestTeam = async (id: string) => {
        try {
            setError('')
            setLoading(true)
            setSelectedId(id)
            const response = await RequestServices.requestTeam(token, id)
            if (response.data) {
                setLoading(false)
                navigation.goBack()
            } else {
                setLoading(false)
                setError(response.error.message)
            }
        } catch (e) {
            setLoading(false)
            setError('Sorry, an error occurred. Please try again')
        }
    }

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
        </View>
    )
}

export default RequestTeamScreen
