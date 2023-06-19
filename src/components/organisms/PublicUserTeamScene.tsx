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
    error?: ApiError
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

    const styles = StyleSheet.create({
        sectionContainer: {
            width: '75%',
            alignSelf: 'center',
        },
        error: {
            alignSelf: 'center',
            fontSize: size.fontThirty,
            color: colors.gray,
        },
    })

    return (
        <ScrollView
            refreshControl={
                <RefreshControl
                    colors={[colors.textSecondary]}
                    refreshing={loading}
                    onRefresh={() => {
                        refetch()
                    }}
                />
            }
            testID="public-user-team-scroll-view">
            {error ? (
                <Text style={styles.error}>{error.message}</Text>
            ) : (
                <View style={styles.sectionContainer}>
                    <MapSection
                        listData={user?.playerTeams ?? []}
                        renderItem={team => {
                            return (
                                <TeamListItem
                                    key={team._id}
                                    team={team}
                                    onPress={async () => {
                                        navigation.navigate('Tabs', {
                                            screen: 'Account',
                                            params: {
                                                screen: 'PublicTeamDetails',
                                                params: {
                                                    id: team._id,
                                                },
                                            },
                                        })
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
