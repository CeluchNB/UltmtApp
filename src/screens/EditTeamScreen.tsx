import BaseScreen from '../components/atoms/BaseScreen'
import React from 'react'
import { Text, View } from 'react-native'

interface EditTeamScreenProps {
    teamId: string
    designation: string
}

const EditTeamScreen: React.FC<EditTeamScreenProps> = ({ teamId }) => {
    return (
        <BaseScreen containerWidth={90}>
            <View>
                <Text>Test</Text>
            </View>
        </BaseScreen>
    )
}

export default EditTeamScreen
