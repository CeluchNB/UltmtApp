import { LiveServerActionData } from '../types/action'
import { TeamNumber } from '../types/team'

/**
 * Class to track actions for both teams in a point.
 */
class ActionStack {
    teamOneMap = new Map<string, LiveServerActionData>()
    teamTwoMap = new Map<string, LiveServerActionData>()

    reconcileAction = (action: LiveServerActionData): ActionStack => {
        if (action.teamNumber === 'one') {
            this.teamOneMap.set(this.getKey(action), action)
            return this
        } else {
            this.teamTwoMap.set(this.getKey(action), action)
            return this
        }
    }

    undoAction = (data: {
        team: TeamNumber
        actionNumber: number
    }): ActionStack => {
        const { team, actionNumber } = data

        if (team === 'one') {
            this.teamOneMap.delete(this.getKey({ actionNumber }))
            return this
        } else {
            this.teamTwoMap.delete(this.getKey({ actionNumber }))
            return this
        }
    }

    /**
     * Method to get all actions in the stack associated with a team
     */
    getTeamOneActions = () => {
        return this.getListOfActions(this.teamOneMap)
    }

    getTeamTwoActions = () => {
        return this.getListOfActions(this.teamTwoMap)
    }

    private getListOfActions = (
        map: Map<string, LiveServerActionData>,
    ): LiveServerActionData[] => {
        return Array.from(map.values()).sort(
            (a, b) => b.actionNumber - a.actionNumber,
        )
    }

    private getKey = (action: { actionNumber: number }) => {
        const { actionNumber } = action
        return `action${actionNumber}`
    }
}

export default ActionStack
