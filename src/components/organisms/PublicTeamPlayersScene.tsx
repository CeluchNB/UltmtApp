import MapSection from '../molecules/MapSection'
import React from 'react'
import { Team } from '../../types/team'
import UserListItem from '../atoms/UserListItem'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '../../hooks'
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'

interface PublicTeamPlayersSceneProps {
    team: Team
    error: string
    onRefresh: () => Promise<void>
}

const PublicTeamPlayersScene: React.FC<PublicTeamPlayersSceneProps> = ({
    team,
    error,
    onRefresh,
}) => {
    const {
        theme: { colors, size, weight },
    } = useTheme()
    const navigation = useNavigation()
    // const [team, setTeam] = React.useState({} as Team)
    const [refreshing, setRefreshing] = React.useState(false)
    // const [error, setError] = React.useState<string>('')

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
            backgroundColor: colors.primary,
            flex: 1,
        },
        headerContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignSelf: 'center',
            alignItems: 'center',
        },
        date: {
            fontSize: size.fontFifteen,
            fontWeight: weight.medium,
            color: colors.textPrimary,
        },
        teamname: {
            fontSize: size.fontTwenty,
            color: colors.textPrimary,
        },
        bodyContainer: {
            width: '100%',
            alignSelf: 'center',
        },
        error: {
            color: colors.gray,
            fontSize: size.fontThirty,
            fontWeight: weight.bold,
            textAlign: 'center',
        },
    })

    return (
        <ScrollView
            testID="public-team-scroll-view"
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    colors={[colors.textSecondary]}
                    onRefresh={async () => {
                        setRefreshing(true)
                        await onRefresh()
                        setRefreshing(false)
                    }}
                />
            }>
            <View style={styles.bodyContainer}>
                {error.length > 0 ? (
                    <Text style={styles.error}>{error}</Text>
                ) : (
                    <MapSection
                        title="Players"
                        listData={team.players}
                        showButton={false}
                        showCreateButton={false}
                        renderItem={user => {
                            return (
                                <UserListItem
                                    key={user._id}
                                    user={user}
                                    showDelete={false}
                                    showAccept={false}
                                    onPress={async () => {
                                        navigation.navigate('Tabs', {
                                            screen: 'Account',
                                            params: {
                                                screen: 'PublicUserDetails',
                                                params: { userId: user._id },
                                            },
                                        })
                                    }}
                                />
                            )
                        }}
                    />
                )}
            </View>
        </ScrollView>
    )
}

export default PublicTeamPlayersScene
