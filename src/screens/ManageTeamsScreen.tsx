import * as React from 'react'
import { AppDispatch } from '../store/store'
import { DisplayTeam } from '../types/team'
import IconButtonText from '../components/atoms/IconButtonText'
import { ManageTeamsProps } from '../types/navigation'
import MapSection from '../components/molecules/MapSection'
import TeamListItem from '../components/atoms/TeamListItem'
import { useTheme } from '../hooks'
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

const getRequestsButton = ({ navigation }: ManageTeamsProps) => {
    return (
        <IconButtonText
            text="Requests"
            icon="email-outline"
            onPress={() => {
                navigation.navigate('UserRequests')
            }}
        />
    )
}

const ManageTeams: React.FC<ManageTeamsProps> = props => {
    const { navigation } = props
    const {
        theme: { colors, size },
    } = useTheme()
    const dispatch = useDispatch<AppDispatch>()
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
        navigation.setOptions({
            headerRight: () => {
                return getRequestsButton(props)
            },
        })
        return unsubscribe
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const openTeamDetails = async (item: DisplayTeam) => {
        navigation.navigate('ManagedTeamDetails', {
            id: item._id,
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
        error: {
            width: '80%',
            alignSelf: 'center',
            fontSize: size.fontThirty,
            color: colors.gray,
        },
        container: {
            width: '80%',
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
                <View style={styles.container}>
                    <MapSection
                        title="Playing With"
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
                                            },
                                        )
                                    }}
                                />
                            )
                        }}
                    />
                    <MapSection
                        title="Managing"
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
