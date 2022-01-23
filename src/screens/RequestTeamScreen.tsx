import * as React from 'react'
import * as TeamServices from '../store/services/team'
import { Props } from '../types/navigation'
import ScreenTitle from '../components/atoms/ScreenTitle'
import { Team } from '../types/team'
import { TextInput } from 'react-native-paper'
import { useColors } from '../hooks'
import { FlatList, StyleSheet, Text, View } from 'react-native'

const RequestTeamScreen: React.FC<Props> = () => {
    const { colors } = useColors()
    const [teams, setTeams] = React.useState([])

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
            backgroundColor: colors.primary,
        },
    })

    const search = async (text: string) => {
        if (text.length >= 3) {
            const result = await TeamServices.searchTeam(text)
            console.log(result)
            setTeams(result.data)
        }
    }

    return (
        <View style={styles.screen}>
            <ScreenTitle title="Request Team" />
            <TextInput onChangeText={search} />
            <FlatList
                data={teams}
                renderItem={({ item }: { item: Team }) => {
                    return <Text>{`${item.place} ${item.name}`}</Text>
                }}
            />
        </View>
    )
}

export default RequestTeamScreen
