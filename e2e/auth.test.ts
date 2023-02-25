import { by, device, element, expect } from 'detox'

describe('Auth Flow', () => {
    beforeAll(async () => {})

    beforeEach(async () => {
        await device.launchApp({ newInstance: true })
    })

    it('Forgot Password', async () => {
        await element(by.text('FORGOT PASSWORD?')).tap()
        await expect(element(by.text('Enter your email'))).toBeVisible()
    })

    it('Create Account', async () => {
        await element(by.text('CREATE ACCOUNT')).tap()
        await element(by.label('First Name')).atIndex(0).typeText('First')
        await element(by.label('Last Name')).atIndex(0).typeText('Last')
        await element(by.label('Username')).atIndex(0).typeText('firstlast')
        await element(by.label('Email'))
            .atIndex(0)
            .typeText('firstlast@email.com')
        await element(by.label('Password')).atIndex(0).typeText('12Pass!!')
        await element(by.text('CREATE')).tap()
        await expect(element(by.text('First Last'))).toBeVisible()
    })
})
