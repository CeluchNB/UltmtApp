import { RealmProvider } from '@ultmt-app/context/realm'
import { QueryClient, QueryClientProvider } from 'react-query'
import React, { ReactNode } from 'react'

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
