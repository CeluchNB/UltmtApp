import React, { ReactNode } from 'react'
import { RealmProvider, useRealm } from '../../src/context/realm'

export const withRealm = (
    children: ReactNode,
    setup?: (realm: ReturnType<typeof useRealm>) => void,
) => {
    const WithRealm = ({ children: child2 }: { children: ReactNode }) => {
        const realm = useRealm()

        setup?.(realm)
        return <>{child2}</>
    }
    return (
        <RealmProvider>
            <WithRealm>{children}</WithRealm>
        </RealmProvider>
    )
}
