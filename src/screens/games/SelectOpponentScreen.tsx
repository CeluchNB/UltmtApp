import BaseScreen from '../../components/atoms/BaseScreen'
import { GuestTeam } from '../../types/team'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import SearchDisplay from '../../components/molecules/SearchDisplay'
import SearchResultItem from '../../components/atoms/SearchResultItem'
import SecondaryButton from '../../components/atoms/SecondaryButton'
import { SelectOpponentProps } from '../../types/navigation'
import { searchTeam } from '../../services/data/team'
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'

const SelectOpponentScreen: React.FC<SelectOpponentProps> = ({
    navigation,
    route,
}) => {
    const { initialValue } = route.params
    const [searchText, setSearchText] = useState(initialValue)

    const onSelect = (team: GuestTeam) => {
        navigation.navigate('CreateGame', { teamTwo: team })
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
