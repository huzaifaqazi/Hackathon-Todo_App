import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PasswordField } from './password-field';

describe('PasswordField', () => {
  const mockOnChange = jest.fn();
  const mockOnToggleVisibility = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    mockOnToggleVisibility.mockClear();
  });

  it('should render password field with correct attributes', () => {
    render(
      <PasswordField
        label="Password"
        id="password"
        name="password"
        showPassword={false}
        onToggleVisibility={mockOnToggleVisibility}
        value="testpassword"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByLabelText('Password');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('id', 'password');
    expect(input).toHaveAttribute('name', 'password');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveValue('testpassword');
  });

  it('should update value when typing', () => {
    render(
      <PasswordField
        label="Password"
        id="password"
        name="password"
        showPassword={false}
        onToggleVisibility={mockOnToggleVisibility}
        value="testpassword"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByLabelText('Password');
    fireEvent.change(input, { target: { value: 'newpassword' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          name: 'password',
          value: 'newpassword'
        })
      })
    );
  });

  it('should toggle password visibility', () => {
    render(
      <PasswordField
        label="Password"
        id="password"
        name="password"
        showPassword={false}
        onToggleVisibility={mockOnToggleVisibility}
        value="testpassword"
        onChange={mockOnChange}
      />
    );

    const button = screen.getByLabelText('Show password');
    fireEvent.click(button);

    expect(mockOnToggleVisibility).toHaveBeenCalledTimes(1);
  });

  it('should show error message when provided', () => {
    render(
      <PasswordField
        label="Password"
        id="password"
        name="password"
        showPassword={false}
        onToggleVisibility={mockOnToggleVisibility}
        value="testpassword"
        onChange={mockOnChange}
        error="Password is required"
      />
    );

    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('should show text when password visibility is toggled on', () => {
    render(
      <PasswordField
        label="Password"
        id="password"
        name="password"
        showPassword={true}
        onToggleVisibility={mockOnToggleVisibility}
        value="testpassword"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'text');
  });
});