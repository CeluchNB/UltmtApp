import * as React from 'react'
import { DisplayTeam } from '../types/team'
import IconButtonText from '../components/atoms/IconButtonText'
import MapSection from '../components/molecules/MapSection'
import { Props } from '../types/navigation'
import ScreenTitle from '../components/atoms/ScreenTitle'
import TeamListItem from '../components/atoms/TeamListItem'
import { size } from '../theme/fonts'
import { useColors } from '../hooks/index'
import {
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native'
import {
    fetchProfile,
    leaveManagerRole,
    leaveTeam,
    selectArchiveTeams,
    selectLeaveManagerError,
    selectManagerTeams,
    selectPlayerTeams,
} from '../store/reducers/features/account/accountReducer'
import { useDispatch, useSelector } from 'react-redux'

const ManageTeams: React.FC<Props> = ({ navigation }: Props) => {
    const { colors } = useColors()
    const dispatch = useDispatch()
    const playerTeams = useSelector(selectPlayerTeams)
    const managerTeams = useSelector(selectManagerTeams)
    const archiveTeams = useSelector(selectArchiveTeams)
    const leaveManagerError = useSelector(selectLeaveManagerError)

    const [leaveManagerTeamId, setLeaveManagerTeamId] = React.useState('')
    const [refreshing, setRefreshing] = React.useState(false)

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            dispatch(fetchProfile())
        })
        return unsubscribe
    })

    const openTeamDetails = async (item: DisplayTeam) => {
        navigation.navigate('ManagedTeamDetails', {
            id: item._id,
            place: item.place,
            name: item.name,
        })
    }

    // Do it outside of redux?
    // 'eventError' in redux vs. 'pageError'?
    const onLeaveTeam = (teamId: string) => {
        dispatch(leaveTeam({ teamId }))
    }

    const onLeaveManagerRole = (teamId: string) => {
        setLeaveManagerTeamId(teamId)
        dispatch(leaveManagerRole({ teamId }))
    }

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
            backgroundColor: colors.primary,
        },
        title: {
            flex: 1,
            textAlignVertical: 'center',
        },
        error: {
            width: '75%',
            alignSelf: 'center',
            fontSize: size.fontLarge,
            color: colors.gray,
        },
        container: {
            width: '75%',
            alignSelf: 'center',
        },
        headerContainer: {
            display: 'flex',
            flexDirection: 'row',
            marginLeft: 10,
            marginBottom: 20,
        },
        requestsButton: {
            margin: 10,
        },
    })

    return (
        <SafeAreaView style={styles.screen}>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={async () => {
                            setRefreshing(true)
                            dispatch(fetchProfile())
                            setRefreshing(false)
                        }}
                    />
                }
                testID="mt-scroll-view">
                <View style={styles.headerContainer}>
                    <ScreenTitle style={styles.title} title="Manage Teams" />
                    <IconButtonText
                        style={styles.requestsButton}
                        text="Requests"
                        icon="email-outline"
                        onPress={() => {
                            navigation.navigate('UserRequestsScreen')
                        }}
                    />
                </View>
                <View style={styles.container}>
                    <MapSection
                        title="Teams I Play For"
                        showButton={false}
                        showCreateButton={true}
                        onCreatePress={() => {
                            navigation.navigate('RequestTeam')
                        }}
                        error={
                            playerTeams.length === 0
                                ? 'You have not played for any teams yet'
                                : undefined
                        }
                        listData={playerTeams}
                        renderItem={team => {
                            return (
                                <TeamListItem
                                    key={team._id}
                                    team={team}
                                    showDelete={true}
                                    onDelete={async () => {
                                        onLeaveTeam(team._id)
                                    }}
                                    onPress={async () => {
                                        navigation.navigate(
                                            'PublicTeamDetails',
                                            {
                                                id: team._id,
                                                place: team.place,
                                                name: team.name,
                                            },
                                        )
                                    }}
                                />
                            )
                        }}
                    />
                    <MapSection
                        title="Teams I Manage"
                        showButton={false}
                        showCreateButton={true}
                        onCreatePress={() => {
                            navigation.navigate('CreateTeam')
                        }}
                        error={
                            managerTeams.length === 0
                                ? 'You have not managed any teams yet'
                                : undefined
                        }
                        listData={managerTeams}
                        renderItem={team => {
                            return (
                                <TeamListItem
                                    key={team._id}
                                    team={team}
                                    onPress={() => openTeamDetails(team)}
                                    showDelete={true}
                                    onDelete={async () => {
                                        onLeaveManagerRole(team._id)
                                    }}
                                    error={
                                        leaveManagerError &&
                                        team._id === leaveManagerTeamId
                                            ? leaveManagerError
                                            : undefined
                                    }
                                />
                            )
                        }}
                    />
                    <MapSection
                        title="Past Teams"
                        showButton={false}
                        showCreateButton={false}
                        error={
                            archiveTeams.length === 0
                                ? 'All of your teams are still active'
                                : undefined
                        }
                        listData={archiveTeams}
                        renderItem={team => {
                            return (
                                <TeamListItem
                                    key={team._id}
                                    team={team}
                                    onPress={async () => {
                                        navigation.navigate(
                                            'PublicTeamDetails',
                                            {
                                                id: team._id,
                                                place: team.place,
                                                name: team.name,
                                                archive: true,
                                            },
                                        )
                                    }}
                                    showDelete={false}
                                    showAccept={false}
                                />
                            )
                        }}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default ManageTeams
