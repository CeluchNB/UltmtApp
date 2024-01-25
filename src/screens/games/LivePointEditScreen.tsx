import { LivePointEditProps } from '../../types/navigation'
import PointEditProvider from '../../context/point-edit-context'
import PointEditView from '../../components/organisms/PointEditView'
import React from 'react'

const LivePointEditScreen: React.FC<LivePointEditProps> = ({ navigation }) => {
    return (
        <PointEditProvider>
            <PointEditView navigation={navigation} />
        </PointEditProvider>
    )
}

export default LivePointEditScreen
