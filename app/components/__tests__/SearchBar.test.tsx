/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SearchBar } from '../SearchBar';

// Mock React Router Form component
vi.mock('react-router', () => ({
  Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
}));

describe('SearchBar', () => {
  it('should render input field', () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(
      'タオバオまたは1688の商品URLを入力'
    );
    expect(input).toBeInTheDocument();
  });

  it('should render search button', () => {
    render(<SearchBar />);
    const button = screen.getByRole('button', { name: /検索/i });
    expect(button).toBeInTheDocument();
  });

  it('should display error message when provided', () => {
    const errorMessage = 'Invalid URL';
    render(<SearchBar error={errorMessage} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});
