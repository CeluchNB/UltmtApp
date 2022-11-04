import { AllScreenProps } from '../../types/navigation'
import BaseScreen from '../../components/atoms/BaseScreen'
import { DisplayTeam } from '../../types/team'
import React from 'react'
import ScreenTitle from '../../components/atoms/ScreenTitle'
import TeamListItem from '../../components/atoms/TeamListItem'
import { selectManagerTeams } from '../../store/reducers/features/account/accountReducer'
import { useSelector } from 'react-redux'
import { FlatList, StyleSheet } from 'react-native'

const SelectMyTeamScreen: React.FC<AllScreenProps> = ({ navigation }) => {
    const managerTeams = useSelector(selectManagerTeams)

    const onSelect = (teamOne: DisplayTeam) => {
        navigation.navigate('SelectOpponent', { teamOne })
    }

    const styles = StyleSheet.create({
        title: {
            marginTop: 10,
        },
        list: {
            marginTop: 20,
        },
    })

    return (
        <BaseScreen containerWidth="80%">
            <ScreenTitle style={styles.title} title="Select My Team" />
            <FlatList
                style={styles.list}
                data={managerTeams}
                renderItem={({ item }) => {
                    return (
                        <TeamListItem
                            team={item}
                            onPress={async () => {
                                onSelect(item)
                            }}
                        />
                    )
                }}
            />
        </BaseScreen>
    )
}

export default SelectMyTeamScreen
