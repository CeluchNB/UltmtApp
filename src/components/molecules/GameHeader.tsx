import { Button } from 'react-native-paper'
import React from 'react'
import TeamScore from '../atoms/TeamScore'
import { Tournament } from '../../types/tournament'
import dayjs from 'dayjs'
import { useTheme } from '../../hooks'
import { DisplayTeam, GuestTeam } from '../../types/team'
import { StyleSheet, Text, View } from 'react-native'

interface GameHeaderProps {
    game: {
        teamOne: DisplayTeam
        teamTwo: GuestTeam
        teamOneScore: number
        teamTwoScore: number
        teamOneActive: boolean
        teamTwoActive: boolean
        scoreLimit: number
        halfScore: number
        startTime: string | Date
        timeoutPerHalf: number
        floaterTimeout: boolean
        softcapMins: number
        hardcapMins: number
        tournament?: Tournament
    }
    header?: boolean
}

const GameHeader: React.FC<GameHeaderProps> = ({ game, header }) => {
    const {
        theme: { colors, size, weight },
    } = useTheme()

    const [displayData, setDisplayData] = React.useState(false)

    const styles = StyleSheet.create({
        container: {
            display: 'flex',
            flexDirection: 'column',
        },
        baseContainer: {
            display: 'flex',
            flexDirection: 'row',
        },
        descriptionText: {
            flex: 1,
            color: colors.gray,
            textAlign: 'center',
            marginTop: 20,
            fontSize: size.fontFifteen,
            fontWeight: weight.full,
        },
        infoText: {
            color: colors.textPrimary,
            marginTop: 5,
            letterSpacing: 0.6,
            fontWeight: weight.medium,
        },
        infoButton: {
            alignSelf: 'center',
        },
    })

    return (
        <View style={styles.container}>
            <View style={styles.baseContainer}>
                <TeamScore
                    name={game.teamOne.name}
                    teamname={game.teamOne.teamname}
                    score={game.teamOneScore}
                />
                <Text style={styles.descriptionText}>
                    {game.teamOneActive || game.teamTwoActive
                        ? `Game to ${game.scoreLimit}`
                        : ''}
                </Text>
                <TeamScore
                    name={game.teamTwo.name}
                    teamname={game.teamTwo.teamname}
                    score={game.teamTwoScore}
                />
            </View>
            {displayData && (
                <View>
                    <Text style={styles.infoText}>
                        Game To: {game.scoreLimit}
                    </Text>
                    <Text style={styles.infoText}>
                        Half At: {game.halfScore}
                    </Text>
                    <Text style={styles.infoText}>
                        Start Time:{' '}
                        {dayjs(game.startTime).format('MM/DD/YYYY @ hh:mma')}
                    </Text>
                    <Text style={styles.infoText}>
                        Timeouts: {game.timeoutPerHalf} per half
                        {game.floaterTimeout ? ' + floater' : ''}
                    </Text>
                    <Text style={styles.infoText}>
                        Softcap At: {game.softcapMins} min
                    </Text>
                    <Text style={styles.infoText}>
                        Hardcap At: {game.hardcapMins} min
                    </Text>

                    <Text style={styles.infoText}>
                        Tournament: {game.tournament?.name ?? 'N/A'}
                    </Text>
                </View>
            )}
            {header && (
                <Button
                    style={styles.infoButton}
                    uppercase
                    textColor={colors.textPrimary}
                    mode="text"
                    onPress={() => {
                        setDisplayData(curr => !curr)
                    }}>
                    {displayData ? 'hide info' : 'show info'}
                </Button>
            )}
        </View>
    )
}

export default GameHeader
