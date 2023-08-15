import { Comment } from '../../types/action'
import { IconButton } from 'react-native-paper'
import React from 'react'
import { useTheme } from '../../hooks'
import { Pressable, StyleSheet, Text, View } from 'react-native'

interface CommentInputProps {
    comment: Comment
    userId: string
    onDelete: (number: number) => void
    onPress: (userId: string) => void
}

const CommentItem: React.FC<CommentInputProps> = ({
    comment,
    userId,
    onDelete,
    onPress,
}) => {
    const { user, comment: commentText } = comment
    const {
        theme: { colors, size },
    } = useTheme()

    const styles = StyleSheet.create({
        container: {
            backgroundColor: colors.darkPrimary,
            padding: 20,
            display: 'flex',
            flexDirection: 'row',
        },
        commentContainer: {
            alignItems: 'flex-start',
            flex: 1,
        },
        name: {
            fontSize: size.fontFifteen,
            color: colors.textSecondary,
            textDecorationLine: 'underline',
        },
        comment: {
            fontSize: size.fontFifteen,
            color: colors.textPrimary,
        },
    })
    return (
        <View style={styles.container}>
            <Pressable
                style={styles.commentContainer}
                onPress={() => onPress(userId)}>
                <Text style={styles.name}>
                    {user.firstName} {user.lastName}
                </Text>
                <Text style={styles.comment}>{commentText}</Text>
            </Pressable>
            {userId.length > 0 && userId === comment.user._id && (
                <IconButton
                    icon="close"
                    iconColor={colors.error}
                    onPress={() => {
                        onDelete(comment.commentNumber)
                    }}
                />
            )}
        </View>
    )
}

export default CommentItem
