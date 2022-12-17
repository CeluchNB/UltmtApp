import { Comment } from '../../types/action'
import React from 'react'
import { size } from '../../theme/fonts'
import { useColors } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'

interface CommentInputProps {
    comment: Comment
    onDelete: (number: number) => void
}

const CommentItem: React.FC<CommentInputProps> = ({ comment }) => {
    const { user, comment: commentText } = comment
    const { colors } = useColors()

    const styles = StyleSheet.create({
        container: {
            backgroundColor: colors.darkPrimary,
            padding: 20,
            alignItems: 'flex-start',
        },
        name: {
            fontSize: size.fontFifteen,
            color: colors.gray,
        },
        comment: {
            fontSize: size.fontMedium,
            color: colors.textPrimary,
        },
    })
    return (
        <View style={styles.container}>
            <Text style={styles.name}>
                {user.firstName} {user.lastName}
            </Text>
            <Text style={styles.comment}>{commentText}</Text>
        </View>
    )
}

export default CommentItem
