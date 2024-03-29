import BaseModal from '../../components/atoms/BaseModal'
import BaseScreen from '../../components/atoms/BaseScreen'
import ConfirmModal from '../../components/molecules/ConfirmModal'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import { TeamSettingsProps } from '../../types/navigation'
import { leaveManagerRole } from '../../services/data/user'
import { selectTeam } from '../../store/reducers/features/team/managedTeamReducer'
import { useMutation } from 'react-query'
import { useSelector } from 'react-redux'
import { useTheme } from '../../hooks'
import { Button, IconButton } from 'react-native-paper'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { archiveTeam, deleteTeam } from '../../services/data/team'

const ACTION_DESCRIPTIONS = [
    {
        action: 'Rollover',
        description:
            'Create a new season of this team. Further options will be available.',
    },
    {
        action: 'Leave',
        description:
            'Remove yourself from this team as a manager. You can only do this if there are other managers associated with the team.',
    },
    {
        action: 'Delete',
        description:
            'Remove this team from the database. This will not delete games associated with the team. No one will be able to access this team.',
    },
    {
        action: 'Archive',
        description:
            'This team will still exist, but cannot be edited or used for games anymore.',
    },
]

const TeamSettingsScreen: React.FC<TeamSettingsProps> = ({ navigation }) => {
    const {
        theme: { colors, size, weight },
    } = useTheme()

    const team = useSelector(selectTeam)

    const [confirmModalVisible, setConfirmModalVisible] = useState(false)
    const [explainModalVisible, setExplainModalVisible] = useState(false)
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
            setConfirmModalVisible(false)
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
            setConfirmModalVisible(false)
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
            setConfirmModalVisible(false)
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
        helpButton: {
            alignSelf: 'flex-end',
        },
        error: {
            color: colors.error,
        },
        modalAction: {
            color: colors.textPrimary,
            marginBottom: 10,
            fontSize: size.fontFifteen,
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
            <IconButton
                style={styles.helpButton}
                iconColor={colors.textPrimary}
                icon="help-circle"
                size={20}
                onPress={() => {
                    setExplainModalVisible(true)
                }}
            />
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
                        setConfirmModalVisible(true)
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
                        setConfirmModalVisible(true)
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
                        setConfirmModalVisible(true)
                    }}
                    loading={archiveLoading}>
                    Archive
                </Button>
            </View>
            {isError && (
                <Text style={styles.error}>Error: {error?.toString()}</Text>
            )}
            <ConfirmModal
                visible={confirmModalVisible}
                displayText={`Are you sure you want to ${teamAction} this team? You cannot undo this action.`}
                loading={false}
                confirmColor={confirmColor}
                onCancel={async () => setConfirmModalVisible(false)}
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
                onClose={async () => setConfirmModalVisible(false)}
            />
            <BaseModal
                visible={explainModalVisible}
                onClose={() => {
                    setExplainModalVisible(false)
                }}>
                <View>
                    <Text style={styles.teamname}>Actions Explanation:</Text>
                    <FlatList
                        data={ACTION_DESCRIPTIONS}
                        renderItem={({ item: { action, description } }) => {
                            return (
                                <Text
                                    style={
                                        styles.modalAction
                                    }>{`${action} - ${description}`}</Text>
                            )
                        }}
                    />
                    <PrimaryButton
                        text="close"
                        onPress={() => setExplainModalVisible(false)}
                        loading={false}
                    />
                </View>
            </BaseModal>
        </BaseScreen>
    )
}

export default TeamSettingsScreen
