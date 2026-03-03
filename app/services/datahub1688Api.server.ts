/**
 * 1688 DataHub API Service
 * RapidAPI: https://rapidapi.com/ecommdatahub/api/1688-datahub
 * Endpoint: /item_detail
 */

import { RapidApiService } from './rapidApi.server';
import { ensureProtocol } from './urlUtils.server';
import type {
  CommonTaobaoItemDto,
  CommonSkuItem,
  PropertyOption,
  SellerRatingDto,
} from '../types/common.dto';

const API_HOST = '1688-datahub.p.rapidapi.com';

/**
 * 1688 DataHub API Response Interfaces
 */
export interface DataHub1688Response {
  result: {
    status: {
      data: 'success' | 'error';
      code: number;
      msg?: Record<string, string>;
    };
    settings?: {
      locale: string;
      currency: string;
      itemId: string;
    };
    item?: DataHub1688Item;
    seller?: DataHub1688Seller;
    delivery?: {
      shipsFrom: string;
      freeShipping: string;
    };
  };
}

export interface DataHub1688Item {
  itemId: string;
  title: string;
  catId: string;
  rootCatId: string;
  sales: string;
  itemUrl: string;
  images: string[];
  video?: {
    id: string;
    thumbnail: string;
    url: string;
  };
  properties?: {
    cut: string;
    list: Array<{ name: string; value: string }>;
  };
  description?: {
    url: string;
    images: string[];
  };
  sku: {
    def: {
      quantity: number;
      price: string;
      unit: string;
      minOrder: string;
    };
    saleInfo: {
      skuRangePrice: Array<{ startAmount: string; price: string }>;
      price: string | null;
      promotionPrice: Array<{ startAmount: string; price: string }>;
    };
    base: Array<{
      specsId: string;
      skuId: string;
      propMap: string;
      price: string;
      promotionPrice: string;
      quantity: string;
      soldCount: string;
    }>;
    props: Array<{
      pid: number;
      name: string;
      values: Array<{
        vid: number;
        name: string;
        image?: string;
      }>;
    }>;
  };
}

export interface DataHub1688Seller {
  sellerId: string;
  sellerTitle: string;
  storeTitle: string;
  storeId: string;
  storeUrl: string;
  storeImage: string;
  storeAge: string;
  storeRating: string;
  storeReturnBuyRate: string;
  storeEvaluates: Array<{
    title: string;
    score: number;
    level: string;
  }>;
}

/**
 * Build SKU property lookup from props definition
 */
function buildPropLookup(
  props: DataHub1688Item['sku']['props']
): Map<string, { propertyId: string; propertyName: string; valueId: string; value: string }> {
  const lookup = new Map<string, { propertyId: string; propertyName: string; valueId: string; value: string }>();
  for (const prop of props) {
    for (const val of prop.values) {
      lookup.set(`${prop.pid}:${val.vid}`, {
        propertyId: prop.pid.toString(),
        propertyName: prop.name,
        valueId: val.vid.toString(),
        value: val.name,
      });
    }
  }
  return lookup;
}

/**
 * Convert 1688 DataHub API response to Common DTO
 */
export function convertDataHub1688ToCommon(
  response: DataHub1688Response
): CommonTaobaoItemDto {
  const { status, item, seller } = response.result;

  if (status.data === 'error' || !item) {
    const errorMsg = status.msg
      ? Object.values(status.msg).join(', ')
      : 'Failed to fetch item data';
    throw new Error(`1688 DataHub API Error (${status.code}): ${errorMsg}`);
  }

  // Parse price range (e.g., "0.19 - 0.22")
  const priceParts = item.sku.def.price.split('-').map((p) => p.trim());
  const minPrice = parseFloat(priceParts[0]) || 0;
  const maxPrice = parseFloat(priceParts[priceParts.length - 1]) || minPrice;

  // Build property lookup for SKU mapping
  const propLookup = buildPropLookup(item.sku.props);

  // Convert SKUs
  const skus: CommonSkuItem[] = item.sku.base.map((sku) => {
    // Parse propMap (e.g., "0:0;1:3") to get properties
    const properties: PropertyOption[] = sku.propMap
      .split(';')
      .map((pair) => propLookup.get(pair))
      .filter((p): p is PropertyOption => p !== undefined);

    // Find SKU image from prop values
    const imageUrl = properties.reduce<string | undefined>((found, prop) => {
      if (found) return found;
      const skuProp = item.sku.props.find(
        (p) => p.pid.toString() === prop.propertyId
      );
      const skuVal = skuProp?.values.find(
        (v) => v.vid.toString() === prop.valueId
      );
      return skuVal?.image ? ensureProtocol(skuVal.image) : undefined;
    }, undefined);

    return {
      skuId: sku.skuId,
      price: parseFloat(sku.promotionPrice || sku.price) || minPrice,
      originalPrice: parseFloat(sku.price) || minPrice,
      stock: parseInt(sku.quantity, 10),
      properties,
      imageUrl,
    };
  });

  // Total stock
  const totalStock =
    skus.length > 0
      ? skus.reduce((sum, sku) => sum + sku.stock, 0)
      : item.sku.def.quantity;

  // Images with protocol
  const images = item.images.map((url) => ({ url: ensureProtocol(url) }));

  return {
    success: true,
    code: status.code,
    data: {
      itemId: item.itemId,
      title: item.title,
      url: `https:${item.itemUrl}`,
      merchantName: seller?.storeTitle || '',
      merchantId: seller?.sellerId || '',
      mainImageUrl: images[0]?.url || '',
      images,
      description: item.description?.images
        ? item.description.images
            .map((img) => `<img src="${ensureProtocol(img)}" style="width:100%;display:block;" />`)
            .join('')
        : '',
      minOrderQuantity: parseInt(item.sku.def.minOrder, 10) || 1,
      totalStock,
      price: minPrice,
      originalPrice: maxPrice,
      skus,
      brand:
        item.properties?.list.find((p) => p.name === '品牌')?.value || '',
      categoryId: item.catId,
      categoryName: '',
    },
  };
}

/**
 * Convert seller evaluates to SellerRatingDto
 */
export function convertDataHub1688SellerToRating(
  seller: DataHub1688Seller
): SellerRatingDto {
  const evaluates = seller.storeEvaluates || [];
  const itemEval = evaluates.find((e) => e.title === '货描');
  const serviceEval = evaluates.find((e) => e.title === '响应');
  const deliveryEval = evaluates.find((e) => e.title === '发货');

  return {
    success: true,
    code: 0,
    data: {
      itemScore: itemEval?.score || 0,
      itemCompareValue: 0,
      itemCompareDirection: 0,
      itemScoreDescription: itemEval?.title || '',
      serviceScore: serviceEval?.score || 0,
      serviceCompareValue: 0,
      serviceCompareDirection: 0,
      serviceScoreDescription: serviceEval?.title || '',
      deliveryScore: deliveryEval?.score || 0,
      deliveryCompareValue: 0,
      deliveryCompareDirection: 0,
      deliveryScoreDescription: deliveryEval?.title || '',
      sellerGoodRate: parseFloat(seller.storeReturnBuyRate) || 0,
      sellerCredit: parseInt(seller.storeRating, 10) || 0,
      hasDsr: evaluates.length > 0,
    },
  };
}

export class DataHub1688ApiService {
  /** Cache seller info from last item_detail response */
  private cachedSeller: DataHub1688Seller | null = null;

  constructor(private rapidApiService: RapidApiService) {}

  /** Fetch item detail via /item_detail endpoint */
  public async fetchItemDetail(
    id: string,
    _site: 'taobao' | '1688' = '1688'
  ): Promise<CommonTaobaoItemDto> {
    const response =
      await this.rapidApiService.request<DataHub1688Response>({
        method: 'get',
        path: `/item_detail?itemId=${id}`,
        host: API_HOST,
      });

    // Cache seller info for subsequent fetchSellerRating call
    this.cachedSeller = response.result?.seller ?? null;

    return convertDataHub1688ToCommon(response);
  }

  /** Fetch seller rating from cached item_detail response */
  public async fetchSellerRating(_sellerId: string): Promise<SellerRatingDto | null> {
    if (!this.cachedSeller) {
      return null;
    }
    return convertDataHub1688SellerToRating(this.cachedSeller);
  }
}
