import GameHeader from '../molecules/GameHeader'
import LiveGameActionView from './LiveGameActionView'
import { LiveGameContext } from '../../context/live-game-context'
import PrimaryButton from '../atoms/PrimaryButton'
import { useLiveGameWizard } from '../../hooks/game-edit-actions/use-live-game-wizard'
import React, { useContext } from 'react'
import { SafeAreaView, StyleSheet, View } from 'react-native'

const LiveGameWizard: React.FC<{}> = () => {
    const { game } = useContext(LiveGameContext)
    const {
        state,
        backDisabled,
        nextDisabled,
        backLoading,
        nextLoading,
        next,
        back,
    } = useLiveGameWizard()

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
                <LiveGameActionView state={state} />
            </View>
            <View style={[styles.flexRow, styles.flexShrink]}>
                <PrimaryButton
                    style={[styles.flexOne]}
                    disabled={backDisabled || backLoading || nextLoading}
                    text="Back"
                    loading={backLoading}
                    onPress={back}
                />
                <PrimaryButton
                    style={[styles.flexOne]}
                    disabled={nextDisabled || nextLoading || backLoading}
                    text="Next"
                    loading={nextLoading}
                    onPress={next}
                />
            </View>
        </SafeAreaView>
    )
}

export default LiveGameWizard
