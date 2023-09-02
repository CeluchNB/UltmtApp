import ActionDisplayItem from '../../components/atoms/ActionDisplayItem'
import BaseScreen from '../../components/atoms/BaseScreen'
import CommentInput from '../../components/atoms/CommentInput'
import CommentItem from '../../components/atoms/CommentItem'
import { CommentProps } from '../../types/navigation'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { FlatList, StyleSheet, View } from 'react-native'
import { useCommenter, useTheme } from '../../hooks'

const CommentScreen: React.FC<CommentProps> = ({ route }) => {
    const { gameId, pointId, live } = route.params
    const navigation = useNavigation()
    const {
        theme: { colors },
    } = useTheme()
    const {
        action,
        teamOne,
        teamTwo,
        loading,
        error,
        isAuth,
        userId,
        handleSubmitComment,
        handleDeleteComment,
    } = useCommenter(gameId, pointId, live)

    const styles = StyleSheet.create({
        container: {
            display: 'flex',
            height: '100%',
        },
        commentContainer: {
            marginTop: 20,
            backgroundColor: colors.darkPrimary,
            flex: 1,
        },
        divider: {
            backgroundColor: colors.gray,
            height: 1,
        },
    })

    const divider = () => <View style={styles.divider} />

    return (
        <BaseScreen containerWidth="100%">
            <View style={styles.container}>
                <ActionDisplayItem
                    action={action}
                    teamOne={teamOne || { name: 'team one' }}
                    teamTwo={teamTwo || { name: 'team two' }}
                />
                <View style={styles.commentContainer}>
                    <CommentInput
                        loading={loading}
                        error={error}
                        isLoggedIn={isAuth || false}
                        onSend={handleSubmitComment}
                    />
                    <FlatList
                        data={action.action.comments}
                        ItemSeparatorComponent={divider}
                        testID="comment-list"
                        renderItem={({ item }) => {
                            return (
                                <CommentItem
                                    userId={userId || ''}
                                    comment={item}
                                    onDelete={handleDeleteComment}
                                    onPress={id => {
                                        navigation.navigate('Tabs', {
                                            screen: 'Account',
                                            params: {
                                                screen: 'PublicUserDetails',
                                                params: { userId: id },
                                                initial: false,
                                            },
                                        })
                                    }}
                                />
                            )
                        }}
                    />
                </View>
            </View>
        </BaseScreen>
    )
}

export default CommentScreen
