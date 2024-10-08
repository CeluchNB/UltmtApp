import { Button } from 'react-native-paper'
import GameHeader from '../molecules/GameHeader'
import LiveGameActionView from './LiveGameActionView'
import { LiveGameContext } from '../../context/live-game-context'
import { LiveGameWizardState } from '../../types/game'
import { useLiveGameWizard } from '../../hooks/game-edit-actions/use-live-game-wizard'
import { useTheme } from '../../hooks'
import React, { useContext } from 'react'
import { SafeAreaView, StyleSheet, View } from 'react-native'

interface LiveGameWizardProps {
    state?: LiveGameWizardState
}

const LiveGameWizard: React.FC<LiveGameWizardProps> = ({
    state: initialState,
}) => {
    const { game } = useContext(LiveGameContext)
    const {
        state,
        backDisabled,
        nextDisabled,
        backLoading,
        nextLoading,
        next,
        back,
        navigate,
    } = useLiveGameWizard(initialState)
    const {
        theme: { colors, size },
    } = useTheme()

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
        rightActionButton: {
            flexDirection: 'row-reverse',
        },
    })

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.flexShrink}>
                <GameHeader game={game} editing={true} header={true} />
            </View>
            <View style={styles.flexOne}>
                <LiveGameActionView state={state} onNavigate={navigate} />
            </View>
            <View style={[styles.flexRow, styles.flexShrink]}>
                <Button
                    textColor={colors.textPrimary}
                    onPress={() => back()}
                    loading={backLoading}
                    style={[styles.flexOne]}
                    disabled={backDisabled || backLoading || nextLoading}
                    labelStyle={{ fontSize: size.fontFifteen }}
                    theme={{ colors: { onSurfaceDisabled: colors.gray } }}
                    icon="arrow-left">
                    Back
                </Button>
                <Button
                    textColor={colors.textPrimary}
                    onPress={() => next()}
                    loading={nextLoading}
                    style={[styles.flexOne]}
                    contentStyle={styles.rightActionButton}
                    theme={{ colors: { onSurfaceDisabled: colors.gray } }}
                    labelStyle={{ fontSize: size.fontFifteen }}
                    disabled={nextDisabled || backLoading || nextLoading}
                    icon="arrow-right">
                    {state === LiveGameWizardState.LOG_ACTIONS
                        ? 'Finish Point'
                        : 'Start Point'}
                </Button>
            </View>
        </SafeAreaView>
    )
}

export default LiveGameWizard
