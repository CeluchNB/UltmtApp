import * as Constants from '../../utils/constants'
import { AllScreenProps } from '../../types/navigation'
import BaseScreen from '../../components/atoms/BaseScreen'
import { DisplayTeam } from '../../types/team'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import React from 'react'
import ScreenTitle from '../../components/atoms/ScreenTitle'
import TeamListItem from '../../components/atoms/TeamListItem'
import { isLoggedIn } from '../../services/data/auth'
import { selectManagerTeams } from '../../store/reducers/features/account/accountReducer'
import { size } from '../../theme/fonts'
import { useSelector } from 'react-redux'
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { useColors, useData } from '../../hooks'

const SelectMyTeamScreen: React.FC<AllScreenProps> = ({ navigation }) => {
    const { colors } = useColors()
    const managerTeams = useSelector(selectManagerTeams)

    const { data: isAuth, loading } = useData(isLoggedIn)

    const onSelect = (teamOne: DisplayTeam) => {
        navigation.navigate('SelectOpponent', { teamOne })
    }

    const onCreateTeam = async () => {
        navigation.navigate('CreateTeam')
    }

    const onLogin = async () => {
        navigation.navigate('Account')
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
            {loading && (
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
            {managerTeams.length < 1 && isAuth && (
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
