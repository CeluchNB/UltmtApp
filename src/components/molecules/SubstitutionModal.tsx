import BaseModal from '../atoms/BaseModal'
import { Chip } from 'react-native-paper'
import { DisplayUser } from '../../types/user'
import PrimaryButton from '../atoms/PrimaryButton'
import React from 'react'
import { nameSort } from '../../utils/player'
import {
    selectActiveTeam,
    // selectGame,
    // selectTeam,
} from '../../store/reducers/features/game/liveGameReducer'
import { useSelector } from 'react-redux'
import { useTheme } from '../../hooks'
import { FlatList, StyleSheet, Text, View } from 'react-native'

interface SubstitutionModalProps {
    visible: boolean
    activePlayers: DisplayUser[]
    onClose: () => void
    onSubmit: (playerOne: DisplayUser, playerTwo: DisplayUser) => void
}

/*
    The substitution modal handles the updates to the live point reducer.
*/
const SubstitutionModal: React.FC<SubstitutionModalProps> = ({
    visible,
    activePlayers,
    onClose,
    onSubmit,
}) => {
    const {
        theme: { colors, size },
    } = useTheme()
    const activeTeam = useSelector(selectActiveTeam)
    const [playerOne, setPlayerOne] = React.useState<DisplayUser | undefined>(
        undefined,
    )
    const [playerOneIndex, setPlayerOneIndex] = React.useState<
        number | undefined
    >(undefined)
    const [playerTwo, setPlayerTwo] = React.useState<DisplayUser | undefined>(
        undefined,
    )
    const [playerTwoIndex, setPlayerTwoIndex] = React.useState<
        number | undefined
    >(undefined)

    const availablePlayers = React.useMemo(() => {
        return activeTeam.players
            .filter(
                player => !activePlayers.map(p => p._id).includes(player._id),
            )
            .sort(nameSort)
    }, [activeTeam.players, activePlayers])

    const handleSubstitution = async () => {
        if (playerOne && playerTwo && playerOneIndex !== undefined) {
            // create new array with new player
            onSubmit(playerOne, playerTwo)
            reset()
        }
    }

    const reset = () => {
        setPlayerOne(undefined)
        setPlayerTwo(undefined)
        setPlayerOneIndex(undefined)
        setPlayerTwoIndex(undefined)
    }

    const styles = StyleSheet.create({
        flatListContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        text: {
            color: colors.textPrimary,
            fontSize: size.fontTwenty,
        },
        chip: {
            borderRadius: 8,
            margin: 5,
            backgroundColor: colors.primary,
            borderWidth: 2,
        },
        container: {
            height: 300,
        },
    })

    return (
        <BaseModal
            visible={visible}
            onClose={() => {
                reset()
                onClose()
            }}>
            <View style={styles.container}>
                <Text style={styles.text}>Player to Remove</Text>
                <FlatList
                    contentContainerStyle={styles.flatListContainer}
                    data={activePlayers}
                    renderItem={({ item, index }) => {
                        return (
                            <Chip
                                style={styles.chip}
                                mode="outlined"
                                onPress={() => {
                                    setPlayerOne(item)
                                    setPlayerOneIndex(index)
                                }}
                                selectedColor={
                                    playerOneIndex === index
                                        ? colors.textPrimary
                                        : colors.gray
                                }
                                ellipsizeMode="tail">
                                {item.firstName} {item.lastName}
                            </Chip>
                        )
                    }}
                />
            </View>
            <View style={styles.container}>
                <Text style={styles.text}>Player to Add</Text>
                <FlatList
                    contentContainerStyle={styles.flatListContainer}
                    data={availablePlayers}
                    renderItem={({ item, index }) => {
                        return (
                            <Chip
                                style={styles.chip}
                                mode="outlined"
                                onPress={() => {
                                    setPlayerTwo(item)
                                    setPlayerTwoIndex(index)
                                }}
                                selectedColor={
                                    playerTwoIndex === index
                                        ? colors.textPrimary
                                        : colors.gray
                                }
                                ellipsizeMode="tail">
                                {item.firstName} {item.lastName}
                            </Chip>
                        )
                    }}
                />
            </View>
            <PrimaryButton
                text="substitute"
                loading={false}
                disabled={!playerOne || !playerTwo}
                onPress={handleSubstitution}
            />
        </BaseModal>
    )
}

export default SubstitutionModal
