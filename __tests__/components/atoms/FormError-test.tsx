import { FieldError } from 'react-hook-form'
import FormError from '../../../src/components/atoms/FormError'
import React from 'react'
import { render, screen } from '@testing-library/react-native'

describe('FormError', () => {
    it('renders without error', () => {
        render(<FormError />)
        expect(screen.queryByTestId('form-error')).toBeNull()
    })

    it('renders without message', () => {
        render(<FormError error={{ message: '' } as FieldError} />)
        expect(screen.queryByTestId('form-error')).toBeNull()
    })

    it('renders with message', () => {
        render(<FormError error={{ message: 'Test error' } as FieldError} />)
        expect(screen.queryByTestId('form-error')).toBeTruthy()
        expect(screen.queryByText('Test error')).toBeTruthy()
    })
})
