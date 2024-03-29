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
     * Method to get all actions in the stack associated with team one
     */
    getTeamOneActions = () => {
        return this.getListOfActions(this.teamOneMap)
    }

    /**
     * Method to get all actions in the stack associated with team two
     */
    getTeamTwoActions = () => {
        return this.getListOfActions(this.teamTwoMap)
    }

    addTeamOneActions = (actions: LiveServerActionData[]) => {
        for (const action of actions) {
            this.teamOneMap.set(this.getKey(action), action)
        }
        return this
    }

    addTeamTwoActions = (actions: LiveServerActionData[]) => {
        for (const action of actions) {
            this.teamTwoMap.set(this.getKey(action), action)
        }
        return this
    }

    getAction = (
        team: TeamNumber,
        actionNumber: number,
    ): LiveServerActionData | undefined => {
        if (team === 'one') {
            return this.teamOneMap.get(this.getKey({ actionNumber }))
        } else {
            return this.teamTwoMap.get(this.getKey({ actionNumber }))
        }
    }

    getListOfActions = (
        map: Map<string, LiveServerActionData>,
    ): LiveServerActionData[] => {
        return Array.from(map.values()).sort(
            (a, b) => a.actionNumber - b.actionNumber,
        )
    }

    getKey = (action: { actionNumber: number }) => {
        const { actionNumber } = action
        return `action${actionNumber}`
    }
}

export default ActionStack
