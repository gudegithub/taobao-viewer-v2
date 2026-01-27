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

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductDetail } from '../ProductDetail';
import type { CommonTaobaoItemDto } from '~/types/common.dto';

describe('ProductDetail', () => {
  const mockProduct: CommonTaobaoItemDto = {
    success: true,
    code: 200,
    data: {
      itemId: '12345',
      title: 'Test Product',
      url: 'https://item.taobao.com/item.htm?id=12345',
      merchantName: 'Test Seller',
      merchantId: 'seller-1',
      mainImageUrl: 'https://example.com/main.jpg',
      images: [{ url: 'https://example.com/1.jpg' }],
      minOrderQuantity: 1,
      totalStock: 100,
      price: 100,
      originalPrice: 150,
      skus: [
        {
          skuId: 'sku-1',
          price: 100,
          originalPrice: 150,
          stock: 50,
          properties: [
            {
              propertyId: 'color',
              valueId: 'red',
              propertyName: 'Color',
              value: 'Red',
            },
          ],
        },
        {
          skuId: 'sku-2',
          price: 120,
          originalPrice: 150,
          stock: 30,
          properties: [
            {
              propertyId: 'color',
              valueId: 'blue',
              propertyName: 'Color',
              value: 'Blue',
            },
          ],
        },
      ],
    },
  };

  describe('Basic Rendering', () => {
    it('should render product title', () => {
      render(<ProductDetail product={mockProduct} />);
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    it('should render price', () => {
      render(<ProductDetail product={mockProduct} />);
      expect(screen.getByText(/¥100/)).toBeInTheDocument();
    });

    it('should render merchant name', () => {
      render(<ProductDetail product={mockProduct} />);
      expect(screen.getByText('Test Seller')).toBeInTheDocument();
    });
  });

  describe('SKU Selection Logic', () => {
    it('should display property groups', () => {
      render(<ProductDetail product={mockProduct} />);
      expect(screen.getByText('Color')).toBeInTheDocument();
    });

    it('should display all property options', () => {
      render(<ProductDetail product={mockProduct} />);
      expect(screen.getByRole('button', { name: 'Red' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Blue' })).toBeInTheDocument();
    });

    it('should update price when selecting different SKU', async () => {
      const user = userEvent.setup();
      render(<ProductDetail product={mockProduct} />);

      const blueButton = screen.getByRole('button', { name: 'Blue' });
      await user.click(blueButton);

      expect(screen.getByText(/¥120/)).toBeInTheDocument();
    });

    it('should show correct stock for selected SKU', async () => {
      const user = userEvent.setup();
      render(<ProductDetail product={mockProduct} />);

      const blueButton = screen.getByRole('button', { name: 'Blue' });
      await user.click(blueButton);

      expect(screen.getByText(/在庫: 30個/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle product with no SKUs', () => {
      const productWithoutSkus = {
        ...mockProduct,
        data: { ...mockProduct.data, skus: [] },
      };

      render(<ProductDetail product={productWithoutSkus} />);
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
  });
});
