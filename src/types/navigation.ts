import { LiveGameWizardState } from './game'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RequestType } from './request'
import { TeamNumber } from './team'
import {
    CompositeScreenProps,
    NavigatorScreenParams,
} from '@react-navigation/native'

export enum SecureEditField {
    EMAIL,
    PASSWORD,
}

export type SharedStackParamList = {
    PublicTeamDetails: {
        id: string
        archive?: boolean
    }
    PublicUserDetails: {
        userId: string
        tab?: 'games' | 'stats'
    }
    ViewGame: { gameId: string }
    Comment: {
        gameId: string
        pointId: string
        live: boolean
    }
    GameStats: { gameId: string }
    ActiveGames: undefined
}

export type AccountStackParamList = {
    Login: undefined
    Profile: undefined
    CreateAccount: undefined
    CreateTeam: undefined
    ForgotPassword: undefined
    ManageTeams: undefined
    RequestTeam: undefined
    ManagedTeamDetails: { id: string }
    TeamSettings: undefined
    PublicTeamDetails: {
        id: string
        archive?: boolean
    }
    PublicUserDetails: {
        userId: string
        tab?: 'games' | 'stats'
    }
    RequestUser: { type: RequestType }
    AddGuest: { teamId: string }
    ResetPassword: undefined
    RolloverTeam: undefined
    UserRequests: undefined
    TeamRequests: undefined
    JoinByCode: undefined
    TeamGames: undefined
    ActiveGames: undefined
    OfflineGameOptions: { gameId: string }
} & SharedStackParamList

export type GameStackParamList = {
    GameHome: undefined
    GameSearch: { live: string }
} & SharedStackParamList

export type TabParamList = {
    Account: NavigatorScreenParams<AccountStackParamList>
    Games: NavigatorScreenParams<GameStackParamList>
}

export type LiveGameParamList = {
    FirstPoint: { gameId: string; team: TeamNumber }
    EditGame: { gameId: string }
    LiveGameEdit: {
        gameId: string
        team: TeamNumber
        state?: LiveGameWizardState
        pointNumber?: number
    }
    LineBuilder: {
        gameId: string
        teamId: string
    }
}

export type TopLevelParamList = {
    Tabs: NavigatorScreenParams<TabParamList>
    CreateGame: undefined
    SelectMyTeam: undefined
    SelectOpponent: { initialValue?: string }
    SearchTournaments: undefined
    CreateTournament: { name?: string }
    JoinGame: undefined
    LiveGame: NavigatorScreenParams<LiveGameParamList>
    Settings: undefined
    SecureEdit: { title: string; value: string; field: SecureEditField }
    Information: undefined
}

export type AllScreenProps = NativeStackScreenProps<
    TopLevelParamList &
        TabParamList &
        AccountStackParamList &
        GameStackParamList &
        // GameCreationParamList &
        LiveGameParamList,
    'Tabs'
>

export type SettingsScreenProps = CompositeScreenProps<
    NativeStackScreenProps<TopLevelParamList, 'Settings'>,
    NativeStackScreenProps<AllScreenProps>
>

export type SecureEditProps = NativeStackScreenProps<
    TopLevelParamList,
    'SecureEdit'
>

// Account
export type ProfileProps = CompositeScreenProps<
    NativeStackScreenProps<AccountStackParamList, 'Profile'>,
    NativeStackScreenProps<TopLevelParamList>
>
export type LoginProps = NativeStackScreenProps<AccountStackParamList, 'Login'>
export type CreateAccountProps = NativeStackScreenProps<
    AccountStackParamList,
    'CreateAccount'
>
export type CreateTeamProps = NativeStackScreenProps<
    AccountStackParamList,
    'CreateTeam'
>
export type ManageTeamsProps = NativeStackScreenProps<
    AccountStackParamList,
    'ManageTeams'
>
export type ManagedTeamDetailsProps = NativeStackScreenProps<
    AccountStackParamList,
    'ManagedTeamDetails'
>
export type TeamSettingsProps = NativeStackScreenProps<
    AccountStackParamList,
    'TeamSettings'
>
export type PublicTeamDetailsProps = NativeStackScreenProps<
    AccountStackParamList,
    'PublicTeamDetails'
>
export type PublicUserDetailsProps = NativeStackScreenProps<
    AccountStackParamList,
    'PublicUserDetails'
>
export type RequestUserProps = NativeStackScreenProps<
    AccountStackParamList,
    'RequestUser'
>
export type AddGuestProps = NativeStackScreenProps<
    AccountStackParamList,
    'AddGuest'
>
export type RequestTeamProps = NativeStackScreenProps<
    AccountStackParamList,
    'RequestTeam'
>
export type RolloverTeamProps = NativeStackScreenProps<
    AccountStackParamList,
    'RolloverTeam'
>
export type ForgotPasswordProps = NativeStackScreenProps<
    AccountStackParamList,
    'ForgotPassword'
>
export type ResetPasswordProps = NativeStackScreenProps<
    AccountStackParamList,
    'ResetPassword'
>
export type UserRequestProps = NativeStackScreenProps<
    AccountStackParamList,
    'UserRequests'
>
export type TeamRequestProps = NativeStackScreenProps<
    AccountStackParamList,
    'TeamRequests'
>
export type JoinByCodeProps = NativeStackScreenProps<
    AccountStackParamList,
    'JoinByCode'
>

// Game Stack
export type GameHomeProps = CompositeScreenProps<
    NativeStackScreenProps<GameStackParamList, 'GameHome'>,
    NativeStackScreenProps<TopLevelParamList>
>

export type GameSearchProps = CompositeScreenProps<
    NativeStackScreenProps<GameStackParamList, 'GameSearch'>,
    NativeStackScreenProps<TopLevelParamList>
>
export type ViewGameProps = NativeStackScreenProps<
    GameStackParamList,
    'ViewGame'
>
export type CommentProps = NativeStackScreenProps<GameStackParamList, 'Comment'>
export type GameStatsProps = NativeStackScreenProps<
    GameStackParamList,
    'GameStats'
>

// Game Creation Flow
export type CreateGameProps = CompositeScreenProps<
    NativeStackScreenProps<TopLevelParamList, 'CreateGame'>,
    NativeStackScreenProps<AllScreenProps>
>
export type SelectOpponentProps = NativeStackScreenProps<
    TopLevelParamList,
    'SelectOpponent'
>
export type JoinGameProps = CompositeScreenProps<
    NativeStackScreenProps<TopLevelParamList, 'JoinGame'>,
    CompositeScreenProps<
        NativeStackScreenProps<TopLevelParamList>,
        NativeStackScreenProps<LiveGameParamList>
    >
>
export type SelectMyTeamProps = CompositeScreenProps<
    NativeStackScreenProps<TopLevelParamList, 'SelectMyTeam'>,
    CompositeScreenProps<
        NativeStackScreenProps<TopLevelParamList>,
        NativeStackScreenProps<LiveGameParamList>
    >
>
export type SearchTournamentProps = NativeStackScreenProps<
    TopLevelParamList,
    'SearchTournaments'
>
export type CreateTournamentProps = NativeStackScreenProps<
    TopLevelParamList,
    'CreateTournament'
>

// Live Game
export type FirstPointProps = NativeStackScreenProps<
    LiveGameParamList,
    'FirstPoint'
>
export type EditGameProps = NativeStackScreenProps<
    LiveGameParamList,
    'EditGame'
>
export type LiveGameProps = NativeStackScreenProps<
    LiveGameParamList,
    'LiveGameEdit'
>
export type LineBuilderProps = NativeStackScreenProps<
    LiveGameParamList,
    'LineBuilder'
>

export type TeamGameProps = CompositeScreenProps<
    NativeStackScreenProps<AccountStackParamList, 'TeamGames'>,
    NativeStackScreenProps<TopLevelParamList>
>
export type ActiveGamesProps = CompositeScreenProps<
    NativeStackScreenProps<AccountStackParamList, 'ActiveGames'>,
    NativeStackScreenProps<TopLevelParamList>
>
export type OfflineGameOptionsProps = NativeStackScreenProps<
    AccountStackParamList,
    'OfflineGameOptions'
>

declare global {
    namespace ReactNavigation {
        interface RootParamList
            extends TopLevelParamList,
                SharedStackParamList {}
    }
}
