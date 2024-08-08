import BaseScreen from '../../components/atoms/BaseScreen'
import { CreateGameContext } from '../../context/create-game-context'
import { GuestTeam } from '../../types/team'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import SearchDisplay from '../../components/molecules/SearchDisplay'
import SearchResultItem from '../../components/atoms/SearchResultItem'
import SecondaryButton from '../../components/atoms/SecondaryButton'
import { SelectOpponentProps } from '../../types/navigation'
import { searchTeam } from '../../services/data/team'
import React, { useContext, useState } from 'react'
import { StyleSheet, View } from 'react-native'

const SelectOpponentScreen: React.FC<SelectOpponentProps> = ({
    navigation,
    route,
}) => {
    const { initialValue } = route.params
    const { setTeamTwo } = useContext(CreateGameContext)
    const [searchText, setSearchText] = useState(initialValue)

    const onSelect = (team: GuestTeam) => {
        setTeamTwo(team)
        navigation.reset({
            index: 1,
            routes: [{ name: 'Tabs' }, { name: 'CreateGame' }],
        })
    }

    const styles = StyleSheet.create({
        searchContainer: {
            height: '80%',
        },
        button: {
            margin: 10,
        },
    })

    return (
        <BaseScreen containerWidth={80}>
            <View style={styles.searchContainer}>
                <SearchDisplay
                    placeholder="Search teams..."
                    value={searchText}
                    search={searchTeam}
                    renderItem={({ item }) => {
                        return (
                            <SearchResultItem
                                header={`${item.place} ${item.name}`}
                                subheader={`@${item.teamname}`}
                                onPress={() => onSelect(item)}
                                loading={false}
                            />
                        )
                    }}
                    onChangeText={text => {
                        setSearchText(text)
                    }}
                />
            </View>
            <PrimaryButton
                style={styles.button}
                text="continue with guest team"
                onPress={async () => {
                    if (searchText) {
                        onSelect({ name: searchText })
                    }
                }}
                loading={false}
                disabled={(searchText?.length || 0) === 0}
            />
            <SecondaryButton
                style={styles.button}
                text="join existing game"
                onPress={async () => {
                    navigation.navigate('JoinGame')
                }}
            />
        </BaseScreen>
    )
}

export default SelectOpponentScreen
