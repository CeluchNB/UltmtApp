import * as Constants from '../../utils/constants'
import BaseScreen from '../../components/atoms/BaseScreen'
import { CreateGameContext } from '../../context/create-game-context'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import { SelectMyTeamProps } from '../../types/navigation'
import { Team } from '../../types/team'
import TeamListItem from '../../components/atoms/TeamListItem'
import { getManagingTeams } from '../../services/data/team'
import { isLoggedIn } from '../../services/data/auth'
import { selectManagerTeams } from '../../store/reducers/features/account/accountReducer'
import { useQuery } from 'react-query'
import { useSelector } from 'react-redux'
import { useTheme } from '../../hooks'
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import React, { useContext } from 'react'

const SelectMyTeamScreen: React.FC<SelectMyTeamProps> = ({ navigation }) => {
    const {
        theme: { colors, size },
    } = useTheme()

    const { setActiveTeam } = useContext(CreateGameContext)
    const profileTeams = useSelector(selectManagerTeams)

    const { data: managerTeams, isLoading: teamsLoading } = useQuery(
        ['getManagingTeams', ...profileTeams.map(team => team._id)],
        () => getManagingTeams(),
    )
    const {
        data: isAuth,
        isLoading,
        refetch,
    } = useQuery(['isLoggedIn'], () => isLoggedIn())

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            refetch()
        })

        return unsubscribe
    })

    const onSelect = async (teamOne: Team) => {
        try {
            setActiveTeam(teamOne)
            navigation.navigate('SelectOpponent', {})
        } catch (e) {
            // TODO: error display?
        }
    }

    const onCreateTeam = async () => {
        navigation.navigate('Tabs', {
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
        <BaseScreen containerWidth={80}>
            {(isLoading || teamsLoading) && (
                <ActivityIndicator
                    color={colors.textPrimary}
                    testID="select-team-loading"
                />
            )}
            {!isLoading && !isAuth && (
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
