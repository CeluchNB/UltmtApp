describe('Team Management', () => {
    beforeAll(async () => {
        await device.launchApp({ newInstance: true })
        await element(by.id('account')).tap()
        // nacho
        // await element(by.text('CREATE ACCOUNT')).tap()
        // await element(by.label('First Name')).atIndex(0).typeText('Ignacio')
        // await element(by.label('Last Name')).atIndex(0).typeText('Varga')
        // await element(by.label('Username')).atIndex(0).typeText('nacho')
        // await element(by.label('Email')).atIndex(0).typeText('nacho@email.com')
        // await element(by.label('Password')).atIndex(0).typeText('12Pass!!')
        // await element(by.text('CREATE')).tap()
        // await expect(element(by.text('Ignacio Varga'))).toBeVisible()
        // await element(by.text('SIGN OUT')).tap()
        await createAccount('Ignacio', 'Varga', 'nacho')

        // gus
        // await element(by.text('CREATE ACCOUNT')).tap()
        // await element(by.label('First Name')).atIndex(0).typeText('Gustavo')
        // await element(by.label('Last Name')).atIndex(0).typeText('Fring')
        // await element(by.label('Username')).atIndex(0).typeText('gus')
        // await element(by.label('Email')).atIndex(0).typeText('gus@email.com')
        // await element(by.label('Password')).atIndex(0).typeText('12Pass!!')
        // await element(by.text('CREATE')).tap()
        // await expect(element(by.text('Gustavo Fring'))).toBeVisible()
        // await element(by.text('SIGN OUT')).tap()
        await createAccount('Gustavo', 'Fring', 'gus')

        // jesse
        // await element(by.text('CREATE ACCOUNT')).tap()
        // await element(by.label('First Name')).atIndex(0).typeText('Jesse')
        // await element(by.label('Last Name')).atIndex(0).typeText('Pinkman')
        // await element(by.label('Username')).atIndex(0).typeText('jesse')
        // await element(by.label('Email')).atIndex(0).typeText('jesse@email.com')
        // await element(by.label('Password')).atIndex(0).typeText('12Pass!!')
        // await element(by.text('CREATE')).tap()
        // await expect(element(by.text('Jesse Pinkman'))).toBeVisible()
        // await element(by.text('SIGN OUT')).tap()
        await createAccount('Jesse', 'Pinkman', 'jesse')

        // // walt
        // await element(by.text('CREATE ACCOUNT')).tap()
        // await element(by.label('First Name')).atIndex(0).typeText('Walter')
        // await element(by.label('Last Name')).atIndex(0).typeText('White')
        // await element(by.label('Username')).atIndex(0).typeText('heisenberg')
        // await element(by.label('Email'))
        //     .atIndex(0)
        //     .typeText('heisenber@email.com')
        // await element(by.label('Password')).atIndex(0).typeText('12Pass!!')
        // await element(by.text('CREATE')).tap()
        // await expect(element(by.text('Walter White'))).toBeVisible()
        // await element(by.text('SIGN OUT')).tap()

        // // skyler
        // await element(by.text('CREATE ACCOUNT')).tap()
        // await element(by.label('First Name')).atIndex(0).typeText('Skyler')
        // await element(by.label('Last Name')).atIndex(0).typeText('White')
        // await element(by.label('Username')).atIndex(0).typeText('sky')
        // await element(by.label('Email')).atIndex(0).typeText('sky@email.com')
        // await element(by.label('Password')).atIndex(0).typeText('12Pass!!')
        // await element(by.text('CREATE')).tap()
        // await expect(element(by.text('Skyler White'))).toBeVisible()
        // await element(by.text('SIGN OUT')).tap()

        // // lalo
        // await element(by.text('CREATE ACCOUNT')).tap()
        // await element(by.label('First Name')).atIndex(0).typeText('Eduardo')
        // await element(by.label('Last Name')).atIndex(0).typeText('Salamanca')
        // await element(by.label('Username')).atIndex(0).typeText('lalo')
        // await element(by.label('Email')).atIndex(0).typeText('lalo@email.com')
        // await element(by.label('Password')).atIndex(0).typeText('12Pass!!')
        // await element(by.text('CREATE')).tap()
        // await expect(element(by.text('Eduardo Salamanca'))).toBeVisible()
        // await element(by.text('SIGN OUT')).tap()

        // // hector
        // await element(by.text('CREATE ACCOUNT')).tap()
        // await element(by.label('First Name')).atIndex(0).typeText('Hector')
        // await element(by.label('Last Name')).atIndex(0).typeText('Salamanca')
        // await element(by.label('Username')).atIndex(0).typeText('hector')
        // await element(by.label('Email')).atIndex(0).typeText('hector@email.com')
        // await element(by.label('Password')).atIndex(0).typeText('12Pass!!')
        // await element(by.text('CREATE')).tap()
        // await expect(element(by.text('Hector Salamanca'))).toBeVisible()
        // await element(by.text('SIGN OUT')).tap()
    })

    beforeEach(async () => {
        await device.launchApp({ newInstance: true })
        await element(by.id('account')).tap()
    })

    it('Create team', async () => {
        await login('nacho')
        await element(by.text('MANAGE TEAMS')).tap()
        await element(by.id('create-button')).atIndex(1).tap()
        await element(by.id('team-place-input')).typeText('Albuquerque')
        await element(by.id('team-name-input')).typeText('Cookers')
        await element(by.id('team-handle-input')).typeText('acook')
        await element(by.text('CREATE')).tap()
        await expect(element(by.text('Managing'))).toBeVisible()
        await expect(element(by.text('Albuquerque Cookers'))).toBeVisible()
        await expect(element(by.text('@acook'))).toBeVisible()
    })

    it('Player perform request and team accept request', async () => {
        await element(by.text('SIGN OUT')).tap()
        await login('gus')
        await element(by.text('MANAGE TEAMS')).tap()
        await element(by.id('create-button')).atIndex(0).tap()
        await element(by.id('search-input')).atIndex(0).typeText('acook')
        await element(by.id('search-result-item')).tap()
        await element(by.id('search-result-item')).tap()
        await element(by.id('account')).tap()
        await element(by.text('SIGN OUT')).tap()
        await login('nacho')
        await element(by.text('MANAGE TEAMS')).tap()
        await element(by.text('@acook')).tap()
        await element(by.text('MANAGE REQUESTS')).tap()
        await element(by.id('accept-button')).tap()
        // FIX FOR iOS
        await device.pressBack()
        await expect(element(by.text('Gustavo Fring'))).toBeVisible()
        await expect(element(by.text('@gus'))).toBeVisible()
    })

    it('Accept team request to join team', async () => {
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
        await device.pressBack()
        await element(by.id('profile-flat-list')).swipe('down')
        await expect(element(by.text('Albuquerque Cookers'))).toBeVisible()
        await expect(element(by.text('@acook'))).toBeVisible()
    })

    // it('Deny player request to join team', async () => {})

    // it('Deny team request to join team', async () => {})

    const login = async (username: string) => {
        await element(by.label('Username or Email')).typeText(username)
        await element(by.label('Password')).typeText('12Pass!!')
        await element(by.text('LOGIN')).tap()
    }

    const createAccount = async (
        firstName: string,
        lastName: string,
        username: string,
    ) => {
        await element(by.text('CREATE ACCOUNT')).tap()
        await element(by.label('First Name')).atIndex(0).typeText(firstName)
        await element(by.label('Last Name')).atIndex(0).typeText(lastName)
        await element(by.label('Username')).atIndex(0).typeText(username)
        await element(by.label('Email'))
            .atIndex(0)
            .typeText(`${username}@email.com`)
        await element(by.label('Password')).atIndex(0).typeText('12Pass!!')
        await element(by.text('CREATE')).tap()
        await expect(element(by.text(`${firstName} ${lastName}`))).toBeVisible()
        await element(by.text('SIGN OUT')).tap()
    }
})
