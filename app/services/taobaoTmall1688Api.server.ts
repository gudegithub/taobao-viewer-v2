/**
 * Taobao Tmall 1688 API Service
 * RapidAPI: https://rapidapi.com/belchiorarkad-FqvHs2EDOtP/api/taobao-tmall-1688
 */

import { RapidApiService } from './rapidApi.server';
import type { CommonTaobaoItemDto } from '../types/common.dto';

/**
 * Taobao Tmall 1688 API Response Interface
 */
export interface TaobaoTmall1688ItemResponse {
  item: {
    num_iid: string;
    title: string;
    pic_url: string;
    num: number | null;
    detail_url: string;
    price: string;
    total_price: number;
    suggestive_price: number;
    shop_name: string;
    priceRange: any[];
    item_imgs: Array<{ url: string }>;
    item_prop_list: Array<{
      id: string;
      name: string;
      prop_value: Array<{
        id: string;
        image: string;
        value: string;
      }>;
      prop_value_list: Array<{
        check: string;
        description: string;
        format: any;
        hint: string;
        i18n: any;
        image: string;
        unit: string;
        value: string;
        id: string;
      }>;
    }>;
    [key: string]: any;
  };
}

/**
 * Convert Taobao Tmall 1688 API response to Common DTO
 */
export function convertTmall1688ToCommon(
  response: TaobaoTmall1688ItemResponse
): CommonTaobaoItemDto {
  if (!response.item) {
    throw new Error('Invalid Tmall 1688 response: item is missing');
  }

  const { item } = response;

  // Convert SKUs from item_prop_list
  const skus: any[] = [];
  if (item.item_prop_list && item.item_prop_list.length > 0) {
    // For now, create a simple SKU structure
    // In a real implementation, you'd combine color/size variations
    skus.push({
      skuId: item.num_iid,
      price: parseFloat(item.price),
      originalPrice: item.suggestive_price || parseFloat(item.price),
      stock: item.num || 0,
      properties: [],
    });
  }

  // Process images
  const images = item.item_imgs && item.item_imgs.length > 0
    ? item.item_imgs
    : [{ url: item.pic_url }];

  return {
    success: true,
    code: 200,
    data: {
      itemId: item.num_iid,
      title: item.title,
      url: item.detail_url,
      merchantName: item.shop_name || '',
      merchantId: '',
      mainImageUrl: item.pic_url,
      images,
      description: '',
      minOrderQuantity: 1,
      totalStock: item.num || 0,
      price: parseFloat(item.price),
      originalPrice: item.suggestive_price || parseFloat(item.price),
      skus,
      brand: '',
      categoryId: '',
      categoryName: '',
    },
  };
}

export class TaobaoTmall1688ApiService {
  constructor(private rapidApiService: RapidApiService) {}

  /** Fetch item detail */
  public async fetchItemDetail(
    id: string,
    site: 'taobao' | '1688' = 'taobao'
  ): Promise<CommonTaobaoItemDto> {
    console.log('Taobao Tmall 1688 API: Fetching item detail for ID:', id);

    const response =
      await this.rapidApiService.request<TaobaoTmall1688ItemResponse>({
        method: 'get',
        path: `/api/tkl/item/detail?provider=${site}&id=${id}`,
        host: 'taobao-tmall-16881.p.rapidapi.com',
      });

    console.log('Taobao Tmall 1688 API: Success');
    return convertTmall1688ToCommon(response);
  }

  /** Fetch seller rating (not supported) */
  public async fetchSellerRating(sellerId: string): Promise<any> {
    // This API does not support seller rating endpoint
    return null;
  }
}
