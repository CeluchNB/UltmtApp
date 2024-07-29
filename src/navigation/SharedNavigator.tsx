import CommentScreen from '../screens/games/CommentScreen'
import GameStatsScreen from '../screens/games/GameStatsScreen'
import PublicTeamScreen from '../screens/PublicTeamScreen'
import PublicUserScreen from '../screens/PublicUserScreen'
import React from 'react'
import ViewGameScreen from '../screens/games/ViewGameScreen'

export const getStack = (Stack: any) => {
    return [
        <Stack.Screen
            key="CommonPublicUserDetails"
            name="PublicUserDetails"
            component={PublicUserScreen}
            initialParams={{
                userId: '',
            }}
        />,
        <Stack.Screen
            key="CommonPublicTeamDetails"
            name="PublicTeamDetails"
            component={PublicTeamScreen}
            initialParams={{ id: '' }}
        />,
        <Stack.Screen
            key="CommonViewGame"
            name="ViewGame"
            component={ViewGameScreen}
            options={{
                title: '',
                headerBackTitle: 'Back',
            }}
        />,
        <Stack.Screen
            key="CommonComment"
            name="Comment"
            component={CommentScreen}
            options={{
                headerBackTitle: 'Back',
                title: 'Comments',
            }}
        />,
        <Stack.Screen
            key="CommonGameStates"
            name="GameStats"
            component={GameStatsScreen}
            options={{ title: '', headerBackTitle: 'Back' }}
        />,
    ]
}
