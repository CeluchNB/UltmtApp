import { RealmProvider } from '@ultmt-app/context/realm'
import {
    LiveGameContext,
    LiveGameContextData,
} from '@ultmt-app/context/live-game-context'
import { QueryClient, QueryClientProvider } from 'react-query'
import React, { ReactNode, useEffect } from 'react'

const client = new QueryClient()
export const TopLevelComponent = ({ children }: { children: ReactNode }) => {
    return (
        <RealmProvider>
            <QueryClientProvider client={client}>
                {children}
            </QueryClientProvider>
        </RealmProvider>
    )
}

export const LiveGameComponent = ({
    children,
    init,
    args,
}: {
    children: ReactNode
    init: () => {}
    args: Partial<LiveGameContextData>
}) => {
    useEffect(() => {
        init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <TopLevelComponent>
            <LiveGameContext.Provider value={args as LiveGameContextData}>
                {children}
            </LiveGameContext.Provider>
        </TopLevelComponent>
    )
}
