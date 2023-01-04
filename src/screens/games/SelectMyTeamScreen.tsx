import * as Constants from '../../utils/constants'
import { AllScreenProps } from '../../types/navigation'
import { AppDispatch } from '../../store/store'
import BaseScreen from '../../components/atoms/BaseScreen'
import { DisplayTeam } from '../../types/team'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import React from 'react'
import ScreenTitle from '../../components/atoms/ScreenTitle'
import TeamListItem from '../../components/atoms/TeamListItem'
import { fetchProfile } from '../../store/reducers/features/account/accountReducer'
import { isLoggedIn } from '../../services/data/auth'
import { size } from '../../theme/fonts'
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import {
    selectFetchProfileLoading,
    selectManagerTeams,
} from '../../store/reducers/features/account/accountReducer'
import { useColors, useData } from '../../hooks'
import { useDispatch, useSelector } from 'react-redux'

const SelectMyTeamScreen: React.FC<AllScreenProps> = ({ navigation }) => {
    const { colors } = useColors()
    const dispatch = useDispatch<AppDispatch>()
    const managerTeams = useSelector(selectManagerTeams)
    const fetchProfileLoading = useSelector(selectFetchProfileLoading)

    const { data: isAuth, loading, refetch } = useData(isLoggedIn)
    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            refetch()
        })

        return unsubscribe
    })

    React.useEffect(() => {
        if (isAuth && managerTeams.length < 1) {
            dispatch(fetchProfile())
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuth])

    const onSelect = (teamOne: DisplayTeam) => {
        navigation.navigate('SelectOpponent', { teamOne })
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
            fontSize: size.fontLarge,
        },
    })

    return (
        <BaseScreen containerWidth="80%">
            <ScreenTitle style={styles.title} title="Select My Team" />
            {(loading || fetchProfileLoading) && (
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
            {managerTeams.length < 1 && isAuth && !fetchProfileLoading && (
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
            {managerTeams.length > 0 && (
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
            )}
        </BaseScreen>
    )
}

export default SelectMyTeamScreen
