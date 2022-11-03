import BaseScreen from '../components/atoms/BaseScreen'
import React from 'react'
import SearchDisplay from '../components/molecules/SearchDisplay'
import SearchResultItem from '../components/atoms/SearchResultItem'
import { Team } from '../types/team'
import { searchTeam } from '../services/data/team'

const SelectOpponentScreen: React.FC<{}> = () => {
    const onSelect = (team: Team) => {
        console.log('got team', team)
    }
    return (
        <BaseScreen containerWidth="80%">
            <SearchDisplay
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
            />
        </BaseScreen>
    )
}

export default SelectOpponentScreen
