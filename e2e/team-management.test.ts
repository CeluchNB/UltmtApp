import { by, device, element, expect } from 'detox'

describe('Account Management', () => {
    beforeEach(async () => {
        await device.uninstallApp()
        await device.installApp()
        await device.launchApp({ newInstance: true })
        await element(by.id('account')).tap()
        try {
            await element(by.text('SIGN OUT')).tap()
        } catch {}
    })

    it('Create account', async () => {
        await element(by.text('CREATE ACCOUNT')).tap()
        await element(by.label('First Name')).atIndex(0).typeText('Saul')
        await element(by.label('Last Name')).atIndex(0).typeText('Goodman')
        await element(by.label('Username'))
            .atIndex(0)
            .typeText('bettercallsaul')
        await element(by.label('Email'))
            .atIndex(0)
            .typeText('bettercallsaul@email.com')
        await element(by.label('Password')).atIndex(0).typeText('12Pass!!')
        await element(by.text('CREATE')).tap()
        await expect(element(by.text('Saul Goodman'))).toBeVisible()
        await expect(element(by.text('@bettercallsaul'))).toBeVisible()
        await expect(element(by.text('Stats'))).toBeVisible()
    })

    it('Create team', async () => {
        await login('nacho')
        await element(by.text('MANAGE TEAMS')).tap()
        await element(by.id('create-button')).atIndex(1).tap()
        await element(by.id('team-place-input')).typeText('Albuquerque')
        await element(by.id('team-name-input')).typeText('Cookers')
        await element(by.id('team-handle-input')).typeText('acook')
        await element(by.id('team-handle-input')).tapReturnKey()
        await element(by.text('CREATE')).tap()
        await expect(element(by.text('Managing'))).toBeVisible()
        await expect(element(by.text('Albuquerque Cookers'))).toBeVisible()
        await expect(element(by.text('@acook'))).toBeVisible()
    })

    it('Accept player request to join team', async () => {
        await login('gus')
        await element(by.text('MANAGE TEAMS')).tap()
        await element(by.id('create-button')).atIndex(0).tap()
        await element(by.id('search-input')).atIndex(0).typeText('acook')
        await element(by.id('search-result-item')).tap()
        if (device.getPlatform() === 'android') {
            await element(by.id('search-result-item')).tap()
        }
        await element(by.id('account')).tap()
        await element(by.text('SIGN OUT')).tap()
        await login('nacho')
        await element(by.text('MANAGE TEAMS')).tap()
        await element(by.text('@acook')).tap()
        await element(by.text('MANAGE REQUESTS')).tap()
        await element(by.id('accept-button')).tap()
        await element(by.id('account')).tap()
        await element(by.text('MANAGE TEAMS')).tap()
        await element(by.text('@acook')).tap()
        await expect(element(by.text('Gustavo Fring'))).toBeVisible()
        await expect(element(by.text('@gus'))).toBeVisible()
    })

    it('Accept team request to join team', async () => {
        await login('nacho')
        await element(by.id('account')).tap()
        await element(by.text('MANAGE TEAMS')).tap()
        await element(by.text('@acook')).tap()
        await element(by.id('create-button')).atIndex(1).tap()
        await element(by.id('search-input')).atIndex(0).typeText('jesse')
        await element(by.text('@jesse')).tap()
        await element(by.text('@jesse')).tap()
        await element(by.id('account')).tap()
        await element(by.text('SIGN OUT')).tap()
        await login('jesse')
        await element(by.text('Requests')).tap()
        await element(by.id('accept-button')).tap()
        await element(by.id('account')).tap()
        await element(by.id('profile-flat-list')).swipe('down')
        await expect(element(by.text('Albuquerque Cookers'))).toBeVisible()
        await expect(element(by.text('@acook'))).toBeVisible()
    })

    it('Deny player request to join team', async () => {
        await login('heisenberg')
        await element(by.text('Requests')).tap()
        await element(by.id('create-button')).tap()
        await element(by.id('search-input')).atIndex(0).typeText('acook')
        await element(by.id('search-result-item')).tap()
        if (device.getPlatform() === 'android') {
            await element(by.id('search-result-item')).tap()
        }
        await element(by.id('account')).tap()
        await element(by.text('SIGN OUT')).tap()
        await login('nacho')
        await element(by.text('MANAGE TEAMS')).tap()
        await element(by.text('@acook')).tap()
        await element(by.text('MANAGE REQUESTS')).tap()
        await element(by.id('delete-button')).atIndex(0).tap()
        await element(by.id('account')).tap()
        await element(by.text('MANAGE TEAMS')).tap()
        await element(by.text('@acook')).tap()
        await expect(element(by.text('@heisenberg'))).not.toBeVisible()
        await element(by.id('account')).tap()
        await element(by.text('SIGN OUT')).tap()
        await login('heisenberg')
        await element(by.text('Requests')).tap()
        await expect(element(by.text('@acook'))).toBeVisible()
        await expect(element(by.text('Denied'))).toBeVisible()
    })

    it('Deny team request to join team', async () => {
        await login('nacho')
        await element(by.text('MANAGE TEAMS')).tap()
        await element(by.text('@acook')).tap()
        await element(by.id('create-button')).atIndex(1).tap()
        await element(by.id('search-input')).atIndex(0).typeText('sky')
        await element(by.text('@sky')).tap()
        await element(by.text('@sky')).tap()
        await element(by.id('account')).tap()
        await element(by.text('SIGN OUT')).tap()
        await login('sky')
        await element(by.text('Requests')).tap()
        await element(by.id('delete-button')).tap()
        await element(by.id('account')).tap()
        await element(by.id('profile-flat-list')).swipe('down')
        await expect(element(by.text('Albuquerque Cookers'))).not.toBeVisible()
        await expect(element(by.text('@acook'))).not.toBeVisible()
    })

    const login = async (username: string) => {
        await element(by.label('Username or Email'))
            .atIndex(0)
            .typeText(username)
        await element(by.label('Password')).atIndex(0).typeText('12Pass!!')
        await element(by.text('LOGIN')).tap()
    }

    // const createAccount = async (
    //     firstName: string,
    //     lastName: string,
    //     username: string,
    // ) => {
    //     await element(by.id('account')).tap()
    //     try {
    //         await element(by.text('SIGN OUT')).tap()
    //     } catch {}
    //     await element(by.text('CREATE ACCOUNT')).tap()
    //     await element(by.label('First Name')).atIndex(0).typeText(firstName)
    //     await element(by.label('Last Name')).atIndex(0).typeText(lastName)
    //     await element(by.label('Username')).atIndex(0).typeText(username)
    //     await element(by.label('Email'))
    //         .atIndex(0)
    //         .typeText(`${username}@email.com`)
    //     await element(by.label('Password')).atIndex(0).typeText('12Pass!!')
    //     await element(by.text('CREATE')).tap()
    //     await expect(element(by.text(`${firstName} ${lastName}`))).toBeVisible()
    //     await element(by.text('SIGN OUT')).tap()
    // }
})
