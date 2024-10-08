import BaseModal from '../atoms/BaseModal'
import { Chip } from 'react-native-paper'
import { DisplayUser } from '../../types/user'
import { LiveGameContext } from '../../context/live-game-context'
import PrimaryButton from '../atoms/PrimaryButton'
import { nameSort } from '../../utils/player'
import { useTheme } from '../../hooks'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useState } from 'react'

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
    const { players: allPlayers } = useContext(LiveGameContext)
    const [playerOne, setPlayerOne] = useState<DisplayUser | undefined>(
        undefined,
    )
    const [playerOneIndex, setPlayerOneIndex] = useState<number | undefined>(
        undefined,
    )
    const [playerTwo, setPlayerTwo] = useState<DisplayUser | undefined>(
        undefined,
    )
    const [playerTwoIndex, setPlayerTwoIndex] = useState<number | undefined>(
        undefined,
    )

    const availablePlayers = React.useMemo(() => {
        return allPlayers
            ?.filter(
                player => !activePlayers.map(p => p._id).includes(player._id),
            )
            .sort(nameSort)
    }, [allPlayers, activePlayers])

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
