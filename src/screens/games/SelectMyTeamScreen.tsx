import * as Constants from '../../utils/constants'
import { AppDispatch } from '../../store/store'
import BaseScreen from '../../components/atoms/BaseScreen'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import React from 'react'
import { SelectMyTeamProps } from '../../types/navigation'
import { Team } from '../../types/team'
import TeamListItem from '../../components/atoms/TeamListItem'
import { getManagingTeams } from '../../services/data/team'
import { isLoggedIn } from '../../services/data/auth'
import { setTeamOne } from '../../store/reducers/features/game/liveGameReducer'
import { useDispatch } from 'react-redux'
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { useData, useTheme } from '../../hooks'

const SelectMyTeamScreen: React.FC<SelectMyTeamProps> = ({ navigation }) => {
    const {
        theme: { colors, size },
    } = useTheme()
    const dispatch = useDispatch<AppDispatch>()

    const { data: managerTeams, loading: teamsLoading } =
        useData(getManagingTeams)
    const { data: isAuth, loading, refetch } = useData(isLoggedIn)
    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            refetch()
        })

        return unsubscribe
    })

    const onSelect = async (teamOne: Team) => {
        try {
            dispatch(setTeamOne(teamOne))
            navigation.navigate('SelectOpponent', {})
        } catch (e) {}
    }

    const onCreateTeam = async () => {
        navigation.push('Tabs', {
            screen: 'Account',
            params: { screen: 'CreateTeam' },
        })
    }

    const onLogin = async () => {
        navigation.navigate('Tabs', {
            screen: 'Account',
            params: { screen: 'Login' },
        })
    }

    const styles = StyleSheet.create({
        title: {
            marginTop: 10,
        },
        list: {
            marginTop: 20,
        },
        error: {
            color: colors.gray,
            fontSize: size.fontThirty,
        },
    })

    return (
        <BaseScreen containerWidth="80%">
            {(loading || teamsLoading) && (
                <ActivityIndicator
                    color={colors.textPrimary}
                    testID="select-team-loading"
                />
            )}
            {!loading && !isAuth && (
                <View>
                    <Text style={styles.error}>{Constants.AUTH_TO_CREATE}</Text>
                    <PrimaryButton
                        text="log in"
                        onPress={onLogin}
                        loading={false}
                    />
                </View>
            )}
            {managerTeams &&
                managerTeams.length < 1 &&
                isAuth &&
                !teamsLoading && (
                    <View>
                        <Text style={styles.error}>
                            {Constants.MANAGE_TO_CREATE}
                        </Text>
                        <PrimaryButton
                            text="create team"
                            loading={false}
                            onPress={onCreateTeam}
                        />
                    </View>
                )}
            {managerTeams && managerTeams.length > 0 && (
                <FlatList
                    style={styles.list}
                    data={managerTeams}
                    renderItem={({ item }) => {
                        return (
                            <TeamListItem
                                team={item}
                                onPress={async () => {
                                    await onSelect(item)
                                }}
                            />
                        )
                    }}
                />
            )}
        </BaseScreen>
    )
}

export default SelectMyTeamScreen
