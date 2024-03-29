import * as React from 'react'
import { ApiError } from '../types/services'
import { AppDispatch } from '../store/store'
import { ManagedTeamDetailsProps } from '../types/navigation'
import MapSection from '../components/molecules/MapSection'
import PrimaryButton from '../components/atoms/PrimaryButton'
import { RequestType } from '../types/request'
import SecondaryButton from '../components/atoms/SecondaryButton'
import { Team } from '../types/team'
import UserListItem from '../components/atoms/UserListItem'
import { getManagedTeam } from '../services/data/team'
import { useQuery } from 'react-query'
import { useTheme } from '../hooks'
import {
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from 'react-native'
import {
    removePlayer,
    selectTeam,
    setTeam,
    toggleRosterStatus,
} from '../store/reducers/features/team/managedTeamReducer'

import { useDispatch, useSelector } from 'react-redux'

const ManageTeamDetailsScreen: React.FC<ManagedTeamDetailsProps> = ({
    navigation,
    route,
}: ManagedTeamDetailsProps) => {
    const { id } = route.params
    const dispatch = useDispatch<AppDispatch>()
    const team = useSelector(selectTeam)

    const {
        theme: { colors, size, weight },
    } = useTheme()

    const {
        data: teamData,
        isLoading: teamLoading,
        refetch,
        error,
        isError,
    } = useQuery<Team, ApiError>(
        ['getManagedTeam', { id }],
        () => getManagedTeam(id),
        {
            onSuccess(data) {
                dispatch(setTeam(data))
            },
        },
    )

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            if (!teamLoading) {
                refetch()
            }
        })
        return () => {
            unsubscribe()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    React.useEffect(() => {
        navigation.setOptions({
            title: `${teamData?.place || ''} ${teamData?.name || ''}`,
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [teamData])

    const teamSettings = async () => {
        navigation.navigate('TeamSettings')
    }

    const onRemovePlayer = async (userId: string) => {
        dispatch(removePlayer({ id, userId }))
    }

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
            backgroundColor: colors.primary,
            flex: 1,
        },
        headerContainer: {
            alignItems: 'center',
        },
        date: {
            textAlign: 'center',
            fontSize: size.fontFifteen,
            fontWeight: weight.medium,
            color: colors.textPrimary,
            marginBottom: 5,
        },
        teamname: {
            textAlign: 'center',
            fontSize: size.fontTwenty,
            color: colors.textPrimary,
            marginBottom: 5,
        },
        listContainer: {
            width: '75%',
            alignSelf: 'center',
        },
        error: {
            color: colors.error,
            fontSize: size.fontThirty,
            width: '75%',
        },
        newSeasonButton: {
            marginTop: 10,
        },
        rosterOpenContainer: {
            display: 'flex',
            flexDirection: 'row',
            margin: 5,
        },
        rosterOpenText: {
            color: colors.gray,
            fontSize: size.fontTwenty,
            flex: 1,
        },
    })

    if (isError && error) {
        return (
            <SafeAreaView style={styles.screen}>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            colors={[colors.textSecondary]}
                            tintColor={colors.textSecondary}
                            refreshing={teamLoading}
                            onRefresh={async () => {
                                refetch()
                            }}
                        />
                    }
                    testID="mtd-flat-list">
                    <View style={styles.headerContainer}>
                        <Text style={styles.error}>
                            {(error as ApiError).message}
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.screen}>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        colors={[colors.textSecondary]}
                        tintColor={colors.textSecondary}
                        refreshing={teamLoading}
                        onRefresh={async () => {
                            refetch()
                        }}
                    />
                }
                testID="mtd-flat-list">
                <View style={styles.headerContainer}>
                    <Text style={styles.teamname}>@{team?.teamname}</Text>
                    {team?.seasonStart === team?.seasonEnd ? (
                        <Text style={styles.date}>
                            {new Date(team?.seasonStart || '').getUTCFullYear()}
                        </Text>
                    ) : (
                        <Text style={styles.date}>
                            {new Date(
                                team?.seasonStart || '',
                            ).getUTCFullYear() +
                                ' - ' +
                                new Date(
                                    team?.seasonEnd || '',
                                ).getUTCFullYear()}
                        </Text>
                    )}
                    <PrimaryButton
                        text="manage requests"
                        loading={false}
                        onPress={async () => {
                            navigation.navigate('TeamRequests')
                        }}
                    />
                    <SecondaryButton
                        style={styles.newSeasonButton}
                        text="Settings"
                        onPress={teamSettings}
                    />
                </View>
                <View style={styles.listContainer}>
                    <MapSection
                        title="Managers"
                        listData={team?.managers || []}
                        renderItem={manager => (
                            <UserListItem
                                key={manager._id}
                                user={manager}
                                onPress={async () => {
                                    navigation.navigate('PublicUserDetails', {
                                        userId: manager._id,
                                    })
                                }}
                            />
                        )}
                        loading={teamLoading}
                        showButton={false}
                        showCreateButton={true}
                        onCreatePress={() => {
                            navigation.navigate('RequestUser', {
                                type: RequestType.MANAGER,
                            })
                        }}
                    />
                    <View style={styles.rosterOpenContainer}>
                        <Text style={styles.rosterOpenText}>Roster Open</Text>
                        <Switch
                            thumbColor={colors.textPrimary}
                            trackColor={{
                                false: colors.gray,
                                true: colors.textSecondary,
                            }}
                            ios_backgroundColor={colors.gray}
                            value={team?.rosterOpen}
                            onValueChange={() => {
                                dispatch(
                                    toggleRosterStatus({
                                        id: team?._id || '',
                                        open: !team?.rosterOpen,
                                    }),
                                )
                            }}
                            testID="roster-open-switch"
                        />
                    </View>
                    <MapSection
                        title="Players"
                        listData={team?.players || []}
                        renderItem={user => (
                            <UserListItem
                                key={user._id}
                                user={user}
                                showDelete={true}
                                showAccept={false}
                                onPress={async () => {
                                    navigation.navigate('PublicUserDetails', {
                                        userId: user._id,
                                    })
                                }}
                                onDelete={() => onRemovePlayer(user._id)}
                            />
                        )}
                        loading={teamLoading}
                        showButton={false}
                        showCreateButton={true}
                        onCreatePress={() => {
                            navigation.navigate('RequestUser', {
                                type: RequestType.PLAYER,
                            })
                        }}
                        error={
                            team?.players && team.players.length <= 0
                                ? 'No players on this team'
                                : undefined
                        }
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default ManageTeamDetailsScreen
