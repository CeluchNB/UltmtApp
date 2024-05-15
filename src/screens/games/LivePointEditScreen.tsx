import { LivePointEditProps } from '../../types/navigation'
// import PointEditProvider from '../../context/point-edit-context'
import PointEditView from '../../components/organisms/PointEditView'
import React from 'react'

const LivePointEditScreen: React.FC<LivePointEditProps> = () => {
    return (
        // <PointEditProvider>
        <PointEditView />
        // </PointEditProvider>
    )
}

export default LivePointEditScreen
