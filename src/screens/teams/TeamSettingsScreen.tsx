import BaseScreen from '../../components/atoms/BaseScreen'
import { Button } from 'react-native-paper'
import ConfirmModal from '../../components/molecules/ConfirmModal'
import { TeamSettingsProps } from '../../types/navigation'
import { leaveManagerRole } from '../../services/data/user'
import { selectTeam } from '../../store/reducers/features/team/managedTeamReducer'
import { useMutation } from 'react-query'
import { useSelector } from 'react-redux'
import { useTheme } from '../../hooks'
import React, { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { archiveTeam, deleteTeam } from '../../services/data/team'

const TeamSettingsScreen: React.FC<TeamSettingsProps> = ({ navigation }) => {
    const {
        theme: { colors, size, weight },
    } = useTheme()

    const team = useSelector(selectTeam)

    const [modalVisible, setModalVisible] = useState(false)
    const [teamAction, setTeamAction] = useState<
        'delete' | 'archive' | 'leave'
    >()

    const {
        mutate: deleteTeamMutation,
        isLoading: deleteLoading,
        isError: isDeleteError,
        error: deleteError,
    } = useMutation(() => deleteTeam(team?._id ?? ''), {
        onSuccess: () => {
            navigation.navigate('ManageTeams')
        },
    })

    const {
        mutate: archiveTeamMutation,
        isLoading: archiveLoading,
        isError: isArchiveError,
        error: archiveError,
    } = useMutation(() => archiveTeam(team?._id ?? ''), {
        onSuccess: () => {
            navigation.navigate('ManageTeams')
        },
    })

    const {
        mutate: leaveTeamMutation,
        isLoading: leaveLoading,
        isError: isLeaveLoading,
        error: leaveError,
    } = useMutation(() => leaveManagerRole(team?._id ?? ''), {
        onSuccess: () => {
            navigation.navigate('ManageTeams')
        },
    })

    const isError = isDeleteError || isArchiveError || isLeaveLoading
    const error = deleteError || archiveError || leaveError

    const confirmColor = React.useMemo(() => {
        switch (teamAction) {
            case 'delete':
            case 'leave':
                return colors.error
            case 'archive':
                return colors.success
            default:
                return colors.textPrimary
        }
    }, [teamAction, colors])

    const rolloverSeason = async () => {
        // navigate to rollover screen
        navigation.navigate('RolloverTeam')
    }

    const styles = StyleSheet.create({
        teamTitle: {
            textAlign: 'center',
            fontSize: size.fontThirty,
            color: colors.textPrimary,
            marginBottom: 5,
        },
        teamname: {
            textAlign: 'center',
            fontSize: size.fontTwenty,
            color: colors.textPrimary,
            marginBottom: 5,
        },
        date: {
            textAlign: 'center',
            fontSize: size.fontFifteen,
            fontWeight: weight.medium,
            color: colors.textPrimary,
            marginBottom: 5,
        },
        buttonContainer: {
            flexDirection: 'row',
            marginTop: 10,
            gap: 10,
        },
        button: {
            flex: 1,
        },
        error: {
            color: colors.error,
        },
    })

    return (
        <BaseScreen containerWidth={90}>
            <Text style={styles.teamTitle}>
                {team?.place} {team?.name}
            </Text>
            <Text style={styles.teamname}>@{team?.teamname}</Text>
            {team?.seasonStart === team?.seasonEnd ? (
                <Text style={styles.date}>
                    {new Date(team?.seasonStart || '').getUTCFullYear()}
                </Text>
            ) : (
                <Text style={styles.date}>
                    {new Date(team?.seasonStart || '').getUTCFullYear() +
                        ' - ' +
                        new Date(team?.seasonEnd || '').getUTCFullYear()}
                </Text>
            )}
            <View style={styles.buttonContainer}>
                <Button
                    style={styles.button}
                    mode="contained"
                    buttonColor={colors.textPrimary}
                    textColor={colors.primary}
                    uppercase={true}
                    onPress={rolloverSeason}>
                    Rollover
                </Button>
                <Button
                    style={styles.button}
                    mode="contained"
                    buttonColor={colors.error}
                    textColor={colors.primary}
                    uppercase={true}
                    onPress={async () => {
                        setTeamAction('leave')
                        setModalVisible(true)
                    }}
                    loading={leaveLoading}>
                    Leave
                </Button>
            </View>
            <View style={styles.buttonContainer}>
                <Button
                    style={styles.button}
                    mode="contained"
                    buttonColor={colors.error}
                    textColor={colors.primary}
                    uppercase={true}
                    onPress={async () => {
                        setTeamAction('delete')
                        setModalVisible(true)
                    }}
                    loading={deleteLoading}>
                    Delete
                </Button>
                <Button
                    style={styles.button}
                    mode="contained"
                    buttonColor={colors.success}
                    textColor={colors.primary}
                    uppercase={true}
                    onPress={async () => {
                        setTeamAction('archive')
                        setModalVisible(true)
                    }}
                    loading={archiveLoading}>
                    Archive
                </Button>
            </View>
            {isError && (
                <Text style={styles.error}>Error: {error?.toString()}</Text>
            )}
            <ConfirmModal
                visible={modalVisible}
                displayText={`Are you sure you want to ${teamAction} this team? You cannot undo this action.`}
                loading={false}
                confirmColor={confirmColor}
                onCancel={async () => setModalVisible(false)}
                onConfirm={async () => {
                    switch (teamAction) {
                        case 'delete':
                            return deleteTeamMutation()
                        case 'archive':
                            return archiveTeamMutation()
                        case 'leave':
                            return leaveTeamMutation()
                        default:
                            return
                    }
                }}
                onClose={async () => setModalVisible(false)}
            />
        </BaseScreen>
    )
}

export default TeamSettingsScreen
