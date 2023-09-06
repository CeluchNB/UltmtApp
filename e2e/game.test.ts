import { by, device, element, expect } from 'detox'

describe('Game', () => {
    beforeAll(async () => {
        await device.uninstallApp()
        await device.installApp()
        await device.launchApp({
            newInstance: true,
            permissions: { userTracking: 'YES' },
        })
        await element(by.id('account')).tap()
        try {
            await element(by.text('SIGN OUT')).tap()
        } catch {}
        await login('lb')
    })

    it('Run Full Game', async () => {
        // CREATE GAME
        await element(by.id('games')).tap()
        await element(by.id('create-button-fab')).tap()
        await element(by.text('@mixtape')).tap()
        await element(by.id('search-input')).typeText('test')
        await element(by.text('CONTINUE WITH GUEST TEAM')).tap()
        await element(by.text('START')).tap()
        await element(by.text('PULLING')).tap()

        // RUN THROUGH GAME
        // POINT 1
        await selectPlayers([
            'Aimie Kawai',
            'Alex Nelson',
            'Alexa Romersa',
            'Arianne Lozano',
            'Bert Cherry',
            'Billy Katz',
            'Brandon Li',
        ])
        await element(by.text('START')).tap()
        await element(by.text('PULL')).atIndex(0).tap()
        await element(by.text('BLOCK')).atIndex(1).tap()
        await element(by.text('PICKUP')).atIndex(1).tap()
        await element(by.text('CATCH')).atIndex(3).tap()
        await element(by.text('CATCH')).atIndex(2).tap()
        await element(by.text('SCORE')).atIndex(5).tap()
        await element(by.text('NEXT POINT')).tap()

        // POINT 2
        await selectPlayers([
            'Cassie Wong',
            'Cori Bigham',
            'Denise Blohowiak',
            'Dominic Cavalero',
            'Emily Decker',
            'Frances Gellert',
            'Husayn Carnegie',
        ])
        await element(by.text('START')).tap()
        await element(by.text('PULL')).atIndex(0).tap()
        await element(by.text('THEY SCORE')).tap()
        await element(by.text('NEXT POINT')).tap()

        // POINT 3
        await selectPlayers([
            'Jack Brown',
            'Jesse Bolton',
            'Kahyee Fong',
            'Khalif El-Salaam',
            'Lexi Garrity',
            'Marc Munoz',
            "Mario O'Brien",
        ])
        await element(by.id('players-flat-list')).swipe('up')
        await element(by.text('START')).tap()
        await element(by.text('PICKUP')).atIndex(1).tap()
        await element(by.text('CATCH')).atIndex(0).tap()
        await element(by.text('CATCH')).atIndex(2).tap()
        await element(by.text('CATCH')).atIndex(3).tap()
        await element(by.text('CATCH')).atIndex(4).tap()
        await element(by.text('CATCH')).atIndex(5).tap()
        await element(by.text('CATCH')).atIndex(4).tap()
        await element(by.text('CATCH')).atIndex(3).tap()
        await element(by.text('CATCH')).atIndex(2).tap()
        await element(by.text('SCORE')).atIndex(3).tap()
        await element(by.text('FINISH GAME')).tap()

        // VIEW GAME ON HOME SCREEN
        await element(by.id('account')).tap()
        try {
            await element(by.text('SIGN OUT')).tap()
        } catch {}
        await login('aimiekawai')
        await expect(element(by.text('Mixtape vs. test'))).toBeVisible()
        await expect(element(by.text('2 - 1'))).toBeVisible()
        await element(by.text('Mixtape vs. test')).tap()

        // VIEW GAME ON DETAILS SCREEN
        try {
            await element(by.text('Allow')).tap()
        } catch {}
        await element(by.text('SHOW INFO')).tap()
        await expect(element(by.text('Game To: 15'))).toBeVisible()
        await element(by.text('HIDE INFO')).tap()
        await element(by.text('Mixtape')).atIndex(1).tap()
        await expect(
            element(by.text('Lexi Garrity scores from Kahyee Fong')),
        ).toBeVisible()

        // LEAVE COMMENT
        await element(by.text('Lexi Garrity scores from Kahyee Fong')).tap()
        await element(by.id('comment-input')).typeText('Test comment')
        await element(by.text('SEND')).tap()
        await expect(element(by.text('Test comment'))).toBeVisible()

        // NAVIGATE BACK TO GAME
        await element(by.id('comment-list')).tap()
        await element(by.id('account')).tap()
        await element(by.text('Mixtape vs. test')).tap()

        // VIEW LEADER STATS
        await element(by.text('Lexi Garrity scores from Kahyee Fong')).swipe(
            'left',
        )
        // await expect(element(by.text('Goals')).atIndex(1)).toBeVisible()
        await expect(element(by.text('Brandon Li')).atIndex(0)).toBeVisible()
        // await expect(element(by.text('Assists')).atIndex(1)).toBeVisible()
        await expect(element(by.text('Alexa Romersa')).atIndex(0)).toBeVisible()
        // await expect(element(by.text('+ / -')).atIndex(1)).toBeVisible()
        await expect(element(by.text('Alex Nelson')).atIndex(0)).toBeVisible()
        // await expect(element(by.text('Blocks')).atIndex(1)).toBeVisible()
        await expect(element(by.text('Alex Nelson')).atIndex(1)).toBeVisible()

        await expect(element(by.text('MORE STATS')).atIndex(0)).toBeVisible()
    })

    const login = async (username: string) => {
        await element(by.label('Username or Email'))
            .atIndex(0)
            .typeText(username)
        await element(by.label('Password')).atIndex(0).typeText('12Pass!!')
        await element(by.text('LOGIN')).tap()
    }

    const selectPlayers = async (players: string[]) => {
        for (const player of players) {
            await element(by.text(player)).tap()
        }
    }
})
