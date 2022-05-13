import * as React from 'react'
import PrimaryButton from '../components/atoms/PrimaryButton'
import { Props } from '../types/navigation'
import ScreenTitle from '../components/atoms/ScreenTitle'
import { selectToken } from '../store/reducers/features/account/accountReducer'
import { useColors } from '../hooks'
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native'
import {
    selectOpenLoading,
    selectTeam,
    toggleRosterStatus,
} from '../store/reducers/features/team/managedTeamReducer'
import { useDispatch, useSelector } from 'react-redux'

const TeamRequestsScreen: React.FC<Props> = () => {
    const dispatch = useDispatch()
    const { colors } = useColors()

    const team = useSelector(selectTeam)
    const openLoading = useSelector(selectOpenLoading)
    const token = useSelector(selectToken)

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
            backgroundColor: colors.primary,
            flex: 1,
        },
        title: {
            textAlign: 'center',
        },
    })

    return (
        <SafeAreaView style={styles.screen}>
            <ScrollView>
                <ScreenTitle
                    title={`${team?.place} ${team?.name} Requests`}
                    style={styles.title}
                />
                <PrimaryButton
                    text={`${team?.rosterOpen ? 'Close' : 'Open'} Roster`}
                    loading={openLoading}
                    onPress={async () => {
                        dispatch(
                            toggleRosterStatus({
                                token,
                                id: team?._id || '',
                                open: !team?.rosterOpen,
                            }),
                        )
                    }}
                />
            </ScrollView>
        </SafeAreaView>
    )
}

export default TeamRequestsScreen
