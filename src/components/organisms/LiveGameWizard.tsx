import GameHeader from '../molecules/GameHeader'
import LiveGameActionView from './LiveGameActionView'
import { LiveGameContext } from '../../context/live-game-context'
import { PointEditContext } from '../../context/point-edit-context'
import PrimaryButton from '../atoms/PrimaryButton'
import React, { useContext } from 'react'
import { SafeAreaView, StyleSheet, View } from 'react-native'

const LiveGameWizard: React.FC<{}> = () => {
    const { game, wizardState } = useContext(LiveGameContext)
    const { next } = useContext(PointEditContext)
    const { nextDisabled, backDisabled } = wizardState

    const styles = StyleSheet.create({
        screen: {
            width: '100%',
            height: '100%',
            flexDirection: 'column',
            flex: 1,
        },
        flexOne: {
            flex: 1,
        },
        flexShrink: {
            flexShrink: 0,
        },
        flexRow: {
            flexDirection: 'row',
        },
    })

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.flexShrink}>
                <GameHeader game={game} editing={true} header={true} />
            </View>
            <View style={styles.flexOne}>
                <LiveGameActionView />
            </View>
            <View style={[styles.flexRow, styles.flexShrink]}>
                <PrimaryButton
                    style={[styles.flexOne]}
                    disabled={backDisabled}
                    text="Back"
                    loading={false}
                    onPress={() => {
                        // TODO: GAME-REFACTOR
                    }}
                />
                <PrimaryButton
                    style={[styles.flexOne]}
                    disabled={nextDisabled}
                    text="Next"
                    loading={false}
                    onPress={() => next()}
                />
            </View>
        </SafeAreaView>
    )
}

export default LiveGameWizard
