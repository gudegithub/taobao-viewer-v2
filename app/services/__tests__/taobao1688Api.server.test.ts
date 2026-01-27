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

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  Taobao1688ApiService,
  convertV40ToCommon,
  convertV28ToCommon,
} from '../taobao1688Api.server';
import type {
  V40ItemDetailResponseDto,
  Taobao1688ItemDetailResponseDto,
} from '../../types/taobao1688Api.dto';

describe('Taobao1688ApiService', () => {
  describe('convertV40ToCommon', () => {
    it('should convert V40 response to common DTO', () => {
      const v40Response: V40ItemDetailResponseDto = {
        success: true,
        code: 200,
        data: {
          spuNo: '12345',
          channel: 'taobao',
          subject: 'Test Product',
          description: 'Test Description',
          mainImg: 'https://example.com/main.jpg',
          imageList: ['https://example.com/1.jpg', 'https://example.com/2.jpg'],
          detailUrl: 'https://item.taobao.com/item.htm?id=12345',
          startQuantity: 1,
          price: 100,
          priceCny: 100,
          originalPrice: 150,
          originalPriceCny: 150,
          skuVoList: [
            {
              skuNo: 'sku-1',
              spuNo: '12345',
              channel: 'taobao',
              skuAttr: [
                {
                  code: 'color',
                  name: '颜色',
                  enumValue: 'red',
                  enumImageUrl: 'https://example.com/red.jpg',
                },
              ],
              price: 100,
              priceCny: 100,
              originalPrice: 150,
              originalPriceCny: 150,
              stock: 50,
              discount: 0,
            },
          ],
        },
      };

      const result = convertV40ToCommon(v40Response);

      expect(result.success).toBe(true);
      expect(result.code).toBe(200);
      expect(result.data.itemId).toBe('12345');
      expect(result.data.title).toBe('Test Product');
      expect(result.data.price).toBe(100);
      expect(result.data.originalPrice).toBe(150);
      expect(result.data.skus).toHaveLength(1);
      expect(result.data.skus[0].skuId).toBe('sku-1');
      expect(result.data.skus[0].properties).toHaveLength(1);
      expect(result.data.skus[0].properties[0].propertyName).toBe('颜色');
      expect(result.data.totalStock).toBe(50);
    });

    it('should throw error if data is missing', () => {
      const invalidResponse = {
        success: false,
        code: 400,
      } as unknown as V40ItemDetailResponseDto;

      expect(() => convertV40ToCommon(invalidResponse)).toThrow(
        'Invalid v40 response: data is missing'
      );
    });

    it('should handle empty SKU list', () => {
      const v40Response: V40ItemDetailResponseDto = {
        success: true,
        code: 200,
        data: {
          spuNo: '12345',
          channel: 'taobao',
          subject: 'Test Product',
          description: 'Test Description',
          mainImg: 'https://example.com/main.jpg',
          imageList: [],
          detailUrl: 'https://item.taobao.com/item.htm?id=12345',
          startQuantity: 1,
          price: 100,
          priceCny: 100,
          originalPrice: null,
          originalPriceCny: null,
          skuVoList: [],
        },
      };

      const result = convertV40ToCommon(v40Response);

      expect(result.data.skus).toHaveLength(0);
      expect(result.data.totalStock).toBe(0);
      expect(result.data.originalPrice).toBe(100);
    });
  });

  describe('convertV28ToCommon', () => {
    it('should convert V28 response to common DTO', () => {
      const v28Response: Taobao1688ItemDetailResponseDto = {
        success: true,
        code: 200,
        data: {
          title: 'Test Product',
          title_cn: 'テスト商品',
          nick: 'Test Seller',
          min_num: 1,
          num_iid: 12345,
          detail_url: 'https://item.taobao.com/item.htm?id=12345',
          brand: 'Test Brand',
          brandId: 'brand-1',
          pic_url: 'https://example.com/main.jpg',
          num: 100,
          price: 100,
          total_price: 100,
          suggestive_price: 150,
          orginal_price: 150,
          desc: 'Test description',
          item_imgs: [
            { url: 'https://example.com/1.jpg' },
            { url: 'https://example.com/2.jpg' },
          ],
          props_list: {
            '1627207:28332': 'Color:Red',
          },
          skus: {
            sku: [
              {
                price: 100,
                total_price: 100,
                orginal_price: 150,
                properties: '1627207:28332',
                properties_name: '1627207:28332:Color:Red',
                quantity: 50,
                sku_id: 111,
              },
            ],
          },
        },
      };

      const result = convertV28ToCommon(v28Response);

      // 基本的な変換が動作することを確認（詳細なデータは検証しない）
      expect(result.success).toBe(true);
      expect(result.code).toBe(200);
      expect(result.data.itemId).toBe('12345');
      expect(result.data.skus).toHaveLength(1);
      expect(result.data.skus[0].properties.length).toBeGreaterThan(0);
    });

    it('should handle missing SKUs', () => {
      const v28Response: Taobao1688ItemDetailResponseDto = {
        success: true,
        code: 200,
        data: {
          title: 'Test Product',
          title_cn: '',
          nick: 'Test Seller',
          min_num: 1,
          num_iid: 12345,
          detail_url: 'https://item.taobao.com/item.htm?id=12345',
          brand: '',
          brandId: '',
          pic_url: 'https://example.com/main.jpg',
          num: 100,
          price: 100,
          total_price: 100,
          suggestive_price: 150,
          orginal_price: 150,
        },
      };

      const result = convertV28ToCommon(v28Response);

      expect(result.data.skus).toHaveLength(0);
      expect(result.data.images).toHaveLength(0);
    });

    it('should parse multiple SKU properties correctly', () => {
      const v28Response: Taobao1688ItemDetailResponseDto = {
        success: true,
        code: 200,
        data: {
          title: 'Test Product',
          title_cn: '',
          nick: 'Test Seller',
          min_num: 1,
          num_iid: 12345,
          detail_url: 'https://item.taobao.com/item.htm?id=12345',
          brand: '',
          brandId: '',
          pic_url: 'https://example.com/main.jpg',
          num: 100,
          price: 100,
          total_price: 100,
          suggestive_price: 150,
          orginal_price: 150,
          props_list: {
            '1627207:28332': 'Color:Red',
            '20509:28314': 'Size:S',
          },
          skus: {
            sku: [
              {
                price: 100,
                total_price: 100,
                orginal_price: 150,
                properties: '1627207:28332;20509:28314',
                properties_name: '1627207:28332:Color:Red;20509:28314:Size:S',
                quantity: 50,
                sku_id: 111,
              },
            ],
          },
        },
      };

      const result = convertV28ToCommon(v28Response);

      // 複数プロパティが正しくパースされることを確認
      expect(result.data.skus[0].properties).toHaveLength(2);
      expect(result.data.skus[0].properties[0].propertyId).toBeTruthy();
      expect(result.data.skus[0].properties[0].valueId).toBeTruthy();
      expect(result.data.skus[0].properties[1].propertyId).toBeTruthy();
      expect(result.data.skus[0].properties[1].valueId).toBeTruthy();
    });
  });
});
