import BaseModal from '../atoms/BaseModal'
import { Chip } from 'react-native-paper'
import PrimaryButton from '../atoms/PrimaryButton'
import React from 'react'
import ScreenTitle from '../atoms/ScreenTitle'
import SecondaryButton from '../atoms/SecondaryButton'
import UserInput from '../atoms/UserInput'
import { useColors } from '../../hooks'
import { FlatList, LogBox, StyleSheet, View } from 'react-native'
import {
    addTag,
    selectTags,
} from '../../store/reducers/features/game/liveGameReducer'
import { useDispatch, useSelector } from 'react-redux'

interface PlayerActionTagModalProps {
    visible: boolean
    onClose: (submit: boolean, tags: string[]) => void
}

const PlayerActionTagModal: React.FC<PlayerActionTagModalProps> = ({
    visible,
    onClose,
}) => {
    LogBox.ignoreLogs(['`flexWrap: `wrap`` is'])
    const { colors } = useColors()
    const dispatch = useDispatch()
    const tags = useSelector(selectTags)
    const [newTag, setNewTag] = React.useState('')
    const [selectedTags, setSelectedTags] = React.useState<string[]>([])

    const onAddTag = () => {
        if (newTag.length > 0) {
            dispatch(addTag(newTag))
        }
        setNewTag('')
    }

    const toggleTagSelection = (item: string) => {
        if (selectedTags.includes(item)) {
            setSelectedTags(prev => {
                return prev.filter(s => s !== item)
            })
        } else {
            setSelectedTags(prev => {
                return [item, ...prev]
            })
        }
    }

    const onChangeText = (text: string) => {
        setNewTag(text)
    }

    const styles = StyleSheet.create({
        chip: {
            borderRadius: 8,
            margin: 5,
            backgroundColor: colors.primary,
            borderWidth: 2,
        },
        listContainer: {
            height: 200,
        },
        flatListContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        newTagContainer: {
            flexDirection: 'row',
            marginBottom: 10,
        },
        input: {
            flex: 1,
            marginRight: 10,
        },
        addButtonContainer: {
            alignSelf: 'center',
        },
    })

    return (
        <BaseModal
            visible={visible}
            onClose={() => {
                onClose(false, [])
            }}>
            <ScreenTitle title="Tags" />
            <View style={styles.listContainer}>
                <FlatList
                    contentContainerStyle={styles.flatListContainer}
                    scrollEnabled={true}
                    scrollToOverflowEnabled={true}
                    data={tags}
                    renderItem={({ item }) => {
                        return (
                            <Chip
                                style={styles.chip}
                                mode="outlined"
                                onPress={() => {
                                    toggleTagSelection(item)
                                }}
                                selectedColor={
                                    selectedTags.includes(item)
                                        ? colors.textPrimary
                                        : colors.gray
                                }
                                ellipsizeMode="tail">
                                {item}
                            </Chip>
                        )
                    }}
                />
            </View>
            <View style={styles.newTagContainer}>
                <UserInput
                    style={styles.input}
                    placeholder="New tag..."
                    value={newTag}
                    onChangeText={onChangeText}
                />
                <View style={styles.addButtonContainer}>
                    <SecondaryButton
                        text="add"
                        onPress={async () => {
                            onAddTag()
                        }}
                    />
                </View>
            </View>
            <PrimaryButton
                text="done"
                loading={false}
                onPress={async () => {
                    onClose(true, selectedTags)
                    setSelectedTags([])
                }}
            />
        </BaseModal>
    )
}

export default PlayerActionTagModal
