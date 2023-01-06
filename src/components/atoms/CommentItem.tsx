import { Comment } from '../../types/action'
import { IconButton } from 'react-native-paper'
import React from 'react'
import { size } from '../../theme/fonts'
import { useColors } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'

interface CommentInputProps {
    comment: Comment
    userId: string
    onDelete: (number: number) => void
}

const CommentItem: React.FC<CommentInputProps> = ({
    comment,
    userId,
    onDelete,
}) => {
    const { user, comment: commentText } = comment
    const { colors } = useColors()

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
            color: colors.gray,
        },
        comment: {
            fontSize: size.fontFifteen,
            color: colors.textPrimary,
        },
    })
    return (
        <View style={styles.container}>
            <View style={styles.commentContainer}>
                <Text style={styles.name}>
                    {user.firstName} {user.lastName}
                </Text>
                <Text style={styles.comment}>{commentText}</Text>
            </View>
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
