/**
 * Seller Rating Service
 * Unified service for fetching seller ratings across different API providers
 */

import { RapidApiService } from './rapidApi.server';
import type { ShopDsrInfoResponseDto } from '../types/taobao1688Api.dto';
import type { SellerRatingDto } from '../types/common.dto';

/**
 * Convert ShopDsrInfo API response to common DTO
 */
export function convertShopDsrInfoToCommon(
  response: ShopDsrInfoResponseDto
): SellerRatingDto {
  // ret_bodyが文字列の場合はパースする
  const ret_body = typeof response.ret_body === 'string'
    ? JSON.parse(response.ret_body)
    : response.ret_body;

  return {
    success: response.ret_code === 0,
    code: response.ret_code,
    data: {
      itemScore: ret_body.item_score,
      itemCompareValue: ret_body.item_compare_value,
      itemCompareDirection: ret_body.item_compare_direction,
      itemScoreDescription: ret_body.item_score_description,
      serviceScore: ret_body.service_score,
      serviceCompareValue: ret_body.service_compare_value,
      serviceCompareDirection: ret_body.service_compare_direction,
      serviceScoreDescription: ret_body.service_score_description,
      deliveryScore: ret_body.delivery_score,
      deliveryCompareValue: ret_body.delivery_compare_value,
      deliveryCompareDirection: ret_body.delivery_compare_direction,
      deliveryScoreDescription: ret_body.delivery_score_description,
      sellerGoodRate: ret_body.seller_good_rate,
      sellerCredit: ret_body.seller_credit,
      hasDsr: ret_body.has_dsr,
    },
  };
}

/**
 * Seller Rating Service
 * Provides unified interface for fetching seller ratings
 */
export class SellerRatingService {
  constructor(private rapidApiService: RapidApiService) {}

  /**
   * Fetch seller rating for Taobao sellers
   * @param sellerId The seller ID
   * @param site The site ('taobao' or '1688')
   * @returns SellerRatingDto or null if not available
   */
  async fetchSellerRating(
    sellerId: string,
    site: 'taobao' | '1688' = 'taobao'
  ): Promise<SellerRatingDto | null> {
    if (!sellerId) {
      console.log('SellerRatingService: No seller ID provided');
      return null;
    }

    // Only Taobao sellers are supported via Legacy API endpoint
    if (site === 'taobao') {
      try {
        console.log('SellerRatingService: Fetching seller rating for ID:', sellerId);
        return await this.fetchFromLegacyApi(sellerId);
      } catch (error) {
        console.error('SellerRatingService: Failed to fetch seller rating:', error);
        return null;
      }
    }

    // 1688 sellers: Rating data comes from item detail response
    // (1688 DataHub API includes seller info in the item_detail endpoint)
    console.log('SellerRatingService: 1688 seller ratings are provided via item detail API');
    return null;
  }

  /**
   * Fetch seller rating from Legacy API endpoint
   * Uses taobao-tmall-data-service.p.rapidapi.com
   */
  private async fetchFromLegacyApi(sellerId: string): Promise<SellerRatingDto> {
    const response = await this.rapidApiService.request<ShopDsrInfoResponseDto>({
      method: 'get',
      path: `/Shop/WebShopScoreGet.ashx?seller_id=${sellerId}`,
      host: 'taobao-tmall-data-service.p.rapidapi.com',
    });

    return convertShopDsrInfoToCommon(response);
  }
}
