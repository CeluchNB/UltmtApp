import * as React from 'react'
import { DisplayTeam } from '../types/team'
import MapSection from '../components/molecules/MapSection'
import { Props } from '../types/navigation'
import ScreenTitle from '../components/atoms/ScreenTitle'
// import Section from '../components/molecules/Section'
import TeamListItem from '../components/atoms/TeamListItem'
import { useColors } from '../hooks/index'
import { useSelector } from 'react-redux'
import { FlatList, StyleSheet, View } from 'react-native'
import {
    selectManagerTeams,
    selectPlayerTeams,
} from '../store/reducers/features/account/accountReducer'

const ManageTeams: React.FC<Props> = ({ navigation }: Props) => {
    const { colors } = useColors()
    const playerTeams = useSelector(selectPlayerTeams)
    const managerTeams = useSelector(selectManagerTeams)

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
            backgroundColor: colors.primary,
        },
        title: {
            alignSelf: 'center',
        },
        sectionContainer: {
            width: '75%',
            alignSelf: 'center',
            flex: 1,
        },
    })

    const openTeamDetails = async (item: DisplayTeam) => {
        navigation.navigate('TeamDetails', {
            id: item._id,
            place: item.place,
            name: item.name,
        })
    }

    return (
        <View style={styles.screen}>
            <FlatList
                data={[]}
                renderItem={() => <View />}
                ListHeaderComponent={
                    <ScreenTitle style={styles.title} title="Manage Teams" />
                }
                ListFooterComponent={
                    <View style={styles.sectionContainer}>
                        <MapSection
                            title="Teams I Play For"
                            showButton={true}
                            showCreateButton={false}
                            onButtonPress={() => {
                                navigation.navigate('RequestTeam')
                            }}
                            buttonText="request team"
                            error={
                                playerTeams.length === 0
                                    ? 'You have not played for any teams yet'
                                    : undefined
                            }
                            listData={playerTeams}
                            renderItem={item => {
                                return (
                                    <TeamListItem key={item._id} team={item} />
                                )
                            }}
                        />
                        <MapSection
                            title="Teams I Manage"
                            showButton={true}
                            showCreateButton={false}
                            onButtonPress={() => {
                                navigation.navigate('CreateTeam')
                            }}
                            buttonText="create team"
                            error={
                                managerTeams.length === 0
                                    ? 'You have not managed any teams yet'
                                    : undefined
                            }
                            listData={managerTeams}
                            renderItem={item => {
                                return (
                                    <TeamListItem
                                        key={item._id}
                                        team={item}
                                        onPress={() => openTeamDetails(item)}
                                    />
                                )
                            }}
                        />
                    </View>
                }
            />
        </View>
    )
}

export default ManageTeams
