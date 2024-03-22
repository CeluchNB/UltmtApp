import { ApiError } from '../../types/services'
import MapSection from '../molecules/MapSection'
import React from 'react'
import TeamListItem from '../atoms/TeamListItem'
import { User } from '../../types/user'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '../../hooks'
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'

export interface PublicUserTeamSceneProps {
    loading: boolean
    refetch: () => void
    user?: User
    error: ApiError | null
}

const PublicUserTeamScene: React.FC<PublicUserTeamSceneProps> = ({
    loading,
    refetch,
    user,
    error,
}) => {
    const navigation = useNavigation()
    const {
        theme: { size, colors },
    } = useTheme()

    const teams = React.useMemo(() => {
        const allTeams = [
            ...(user?.playerTeams || []),
            ...(user?.managerTeams || []),
        ].sort(
            (a, b) =>
                new Date(b.seasonStart).getFullYear() -
                new Date(a.seasonStart).getFullYear(),
        )
        const teamMap = new Map()
        allTeams.forEach(team => {
            if (!teamMap.has(team._id)) {
                teamMap.set(team._id, team)
            }
        })
        return new Array(...teamMap.values())
    }, [user])

    const styles = StyleSheet.create({
        scrollView: {
            height: '100%',
        },
        sectionContainer: {
            width: '75%',
            alignSelf: 'center',
        },
        error: {
            alignSelf: 'center',
            padding: 10,
            fontSize: size.fontThirty,
            color: colors.gray,
        },
    })

    return (
        <ScrollView
            style={styles.scrollView}
            refreshControl={
                <RefreshControl
                    colors={[colors.textSecondary]}
                    tintColor={colors.textSecondary}
                    refreshing={loading}
                    onRefresh={() => {
                        refetch()
                    }}
                />
            }
            testID="public-user-team-scroll-view">
            {teams.length === 0 && (
                <Text style={styles.error}>
                    This user has not joined any teams yet
                </Text>
            )}
            {error ? (
                <Text style={styles.error}>{error.message}</Text>
            ) : (
                <View style={styles.sectionContainer}>
                    <MapSection
                        listData={teams}
                        renderItem={team => {
                            return (
                                <TeamListItem
                                    key={team._id}
                                    team={team}
                                    onPress={async () => {
                                        navigation.navigate(
                                            'PublicTeamDetails',
                                            { id: team._id },
                                        )
                                    }}
                                />
                            )
                        }}
                        loading={loading}
                        showButton={false}
                        showCreateButton={false}
                    />
                </View>
            )}
        </ScrollView>
    )
}

export default PublicUserTeamScene
