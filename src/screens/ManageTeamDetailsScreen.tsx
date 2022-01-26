import * as React from 'react'
import PrimaryButton from '../components/atoms/PrimaryButton'
import ScreenTitle from '../components/atoms/ScreenTitle'
import SecondaryButton from '../components/atoms/SecondaryButton'
import { TeamDetailsProps } from '../types/navigation'
import { useColors } from '../hooks'
import { StyleSheet, View } from 'react-native'

const ManageTeamDetailsScreen: React.FC<TeamDetailsProps> = ({
    route,
}: TeamDetailsProps) => {
    const { colors } = useColors()
    const { id, place, name } = route.params

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
            backgroundColor: colors.primary,
            alignItems: 'center',
        },
        title: {
            textAlign: 'center',
        },
    })

    const toggleRosterStatus = async () => {
        console.log('toggle roster status of team:', id)
    }

    const rolloverSeason = async () => {
        console.log('rolling over season')
    }

    return (
        <View style={styles.screen}>
            <ScreenTitle title={`${place} ${name}`} style={styles.title} />
            <PrimaryButton
                text="Open Roster"
                loading={false}
                onPress={toggleRosterStatus}
            />
            <SecondaryButton text="Start New Season" onPress={rolloverSeason} />
        </View>
    )
}

export default ManageTeamDetailsScreen
