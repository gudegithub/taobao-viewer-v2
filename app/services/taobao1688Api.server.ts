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

import { RapidApiService, type RapidApiRequestDto } from './rapidApi.server';
import { convertShopDsrInfoToCommon } from './sellerRating.server';
import type {
  V18ItemDetailResponseDto,
  V40ItemDetailResponseDto,
  Taobao1688ItemDetailResponseDto,
  Taobao1688SkuInfoResponseDto,
  ShopDsrInfoResponseDto,
} from '../types/taobao1688Api.dto';
import type {
  CommonTaobaoItemDto,
  CommonSkuItem,
  PropertyOption,
  SellerRatingDto,
} from '../types/common.dto';

/**
 * V18 APIレスポンスを共通DTOに変換
 */
export function convertV18ToCommon(
  v18: V18ItemDetailResponseDto
): CommonTaobaoItemDto {
  // APIがエラーレスポンスを返した場合
  if (!v18.success) {
    throw new Error((v18 as any).message || 'Failed to fetch item data');
  }

  if (!v18.data || !v18.data.info) {
    throw new Error('Invalid v18 response: data is missing');
  }

  const { info, goodsGroup, preferential } = v18.data;

  // 画像をimgStringから抽出（<img src="..." />形式）
  const images: { url: string }[] = [];
  if (info.imgString) {
    const imgMatches = info.imgString.matchAll(/src="([^"]+)"/g);
    for (const match of imgMatches) {
      images.push({ url: match[1].replace('_80x80.jpg', '') });
    }
  }

  // SKU情報を変換
  const skus: CommonSkuItem[] = Object.values(goodsGroup).map((sku) => {
    // properties_nameから各プロパティを抽出
    // 例: "20509:28314:尺码:S;1627207:28332:颜色分类:浅灰色"
    const properties: PropertyOption[] = [];
    const propPairs = sku.properties_name.split(';').filter((p) => p.trim());

    propPairs.forEach((pair) => {
      const parts = pair.split(':');
      if (parts.length >= 4) {
        const [propertyId, valueId, propertyName, value] = parts;
        properties.push({
          propertyId,
          propertyName,
          valueId,
          value,
        });
      }
    });

    return {
      skuId: sku.sku_id.toString(),
      price: sku.price,
      originalPrice: sku.price,
      stock: parseInt(sku.quantity, 10),
      properties,
    };
  });

  // 総在庫を計算
  const totalStock = skus.reduce((sum, sku) => sum + sku.stock, 0);

  // 価格範囲を取得
  const minPrice = preferential.min || info.price;
  const maxPrice = preferential.max || info.price;

  return {
    success: v18.success,
    code: v18.code,
    data: {
      itemId: info.num_iid,
      title: info.title,
      url: info.detail_url,
      merchantName: info.nick,
      merchantId: info.bizinfo?.sid || '',
      mainImageUrl: info.pic_url,
      images,
      description: info.desc,
      minOrderQuantity: info.minNumber || 1,
      totalStock,
      price: minPrice,
      originalPrice: maxPrice,
      skus,
      brand: '',
    },
  };
}

/**
 * V40 APIレスポンスを共通DTOに変換
 */
export function convertV40ToCommon(
  v40: V40ItemDetailResponseDto
): CommonTaobaoItemDto {
  // APIがエラーレスポンスを返した場合
  if (!v40.success) {
    throw new Error((v40 as any).message || 'Failed to fetch item data');
  }

  if (!v40.data) {
    throw new Error('Invalid v40 response: data is missing');
  }

  const skus: CommonSkuItem[] = (v40.data.skuVoList || []).map((sku) => {
    const properties: PropertyOption[] = sku.skuAttr.map((attr) => {
      return {
        propertyId: attr.code,
        valueId: attr.enumValue,
        propertyName: attr.name,
        value: attr.enumValue,
      };
    });

    return {
      skuId: sku.skuNo,
      price: sku.price,
      originalPrice: sku.originalPrice || sku.price,
      stock: sku.stock,
      properties,
      imageUrl: sku.skuAttr[0]?.enumImageUrl || '',
    };
  });

  const totalStock = skus.reduce((sum, sku) => sum + sku.stock, 0);

  return {
    success: v40.success,
    code: v40.code,
    data: {
      itemId: v40.data.spuNo,
      title: v40.data.subject,
      url: v40.data.detailUrl,
      merchantName: v40.data.shopName,
      merchantId: v40.data.shopId,
      mainImageUrl: v40.data.mainImg,
      images: v40.data.imageList.map((url) => ({ url })),
      description: v40.data.description,
      minOrderQuantity: v40.data.startQuantity || 1,
      totalStock,
      price: v40.data.price,
      originalPrice: v40.data.originalPrice || v40.data.price,
      skus,
      brand: '',
      categoryId: '',
      categoryName: '',
    },
  };
}

/**
 * V28 APIレスポンスを共通DTOに変換
 */
export function convertV28ToCommon(
  v28: Taobao1688ItemDetailResponseDto
): CommonTaobaoItemDto {
  // APIがエラーレスポンスを返した場合
  if (!v28.success) {
    throw new Error((v28 as any).message || 'Failed to fetch item data');
  }

  if (!v28.data) {
    throw new Error('Invalid v28 response: data is missing');
  }

  const skus: CommonSkuItem[] =
    v28.data.skus?.sku.map((sku) => {
      const properties: PropertyOption[] = [];
      const propPairs = sku.properties.split(';');

      propPairs.forEach((pair) => {
        const [propertyId, valueId] = pair.split(':');
        const key = `${propertyId}:${valueId}`;
        const propValue = v28.data.props_list?.[key] || '';

        if (propValue) {
          const [propertyName, value] = propValue.split(':');
          properties.push({
            propertyId,
            valueId,
            propertyName,
            value,
          });
        }
      });

      return {
        skuId: sku.sku_id.toString(),
        price: sku.price,
        originalPrice: sku.orginal_price,
        stock: sku.quantity,
        properties,
      };
    }) || [];

  // セラーIDを取得（優先順位: seller_info.sid > shop_id > seller_id）
  const merchantId = v28.data.seller_info?.sid
    ? v28.data.seller_info.sid.toString()
    : v28.data.shop_id
    ? v28.data.shop_id.toString()
    : v28.data.seller_id || '';

  // セラー名を取得（優先順位: seller_info.shop_name > nick）
  const merchantName = v28.data.seller_info?.shop_name || v28.data.nick;

  return {
    success: v28.success,
    code: v28.code,
    data: {
      itemId: v28.data.num_iid.toString(),
      title: v28.data.title_cn || v28.data.title,
      url: v28.data.detail_url,
      merchantName,
      merchantId,
      mainImageUrl: v28.data.pic_url,
      images: v28.data.item_imgs?.map((img) => ({ url: img.url })) || [],
      description: v28.data.desc,
      minOrderQuantity: v28.data.min_num,
      totalStock: v28.data.num,
      price: v28.data.price,
      originalPrice: v28.data.orginal_price,
      skus,
      brand: v28.data.brand,
      categoryId: '',
      categoryName: '',
    },
  };
}

export class Taobao1688ApiService {
  constructor(
    private rapidApiService: RapidApiService,
    private apiVersion: string = 'v28'
  ) {}

  /** 商品詳細を取得する（共通DTO形式） */
  public async fetchItemDetail(
    id: string,
    site: 'taobao' | '1688' = 'taobao'
  ): Promise<CommonTaobaoItemDto> {
    if (this.apiVersion === 'v40') {
      const v40Response =
        await this.rapidApiService.request<V40ItemDetailResponseDto>({
          method: 'get',
          path: `/v40/detail?itemId=${id}&site=${site}`,
        });
      return convertV40ToCommon(v40Response);
    }

    if (this.apiVersion === 'v18') {
      const v18Response =
        await this.rapidApiService.request<V18ItemDetailResponseDto>({
          method: 'get',
          path: `/v18/detail?itemId=${id}&site=${site}`,
        });
      return convertV18ToCommon(v18Response);
    }

    // v28
    const v28Response =
      await this.rapidApiService.request<Taobao1688ItemDetailResponseDto>({
        method: 'get',
        path: `/v28/detail?itemId=${id}&site=${site}`,
      });
    return convertV28ToCommon(v28Response);
  }

  /** 商品詳細を複数取得する */
  public async fetchItemDetails(
    ids: string[]
  ): Promise<(Taobao1688ItemDetailResponseDto | null)[]> {
    const requests: RapidApiRequestDto[] = ids.map((id) => {
      return {
        method: 'get',
        path: `/v28/detail?itemId=${id}&site=taobao`,
      };
    });
    return this.rapidApiService.requestAll<Taobao1688ItemDetailResponseDto>(
      requests
    );
  }

  /** SKU情報を取得する */
  public async fetchSkuInfo(id: string): Promise<Taobao1688SkuInfoResponseDto> {
    const response =
      await this.rapidApiService.request<Taobao1688SkuInfoResponseDto>({
        method: 'get',
        path: `/v28/detail?itemId=${id}&site=taobao`,
      });
    return response;
  }

  /** SKU情報を複数取得する */
  public async fetchSkuInfos(
    ids: string[]
  ): Promise<(Taobao1688SkuInfoResponseDto | null)[]> {
    const requests: RapidApiRequestDto[] = ids.map((id) => {
      return {
        method: 'get',
        path: `/v28/detail?itemId=${id}&site=taobao`,
      };
    });
    return this.rapidApiService.requestAll<Taobao1688SkuInfoResponseDto>(
      requests
    );
  }

  /** セラー評価情報を取得する */
  public async fetchSellerRating(sellerId: string): Promise<SellerRatingDto> {
    const response =
      await this.rapidApiService.request<ShopDsrInfoResponseDto>({
        method: 'get',
        path: `/Shop/WebShopScoreGet.ashx?seller_id=${sellerId}`,
        host: 'taobao-tmall-data-service.p.rapidapi.com',
      });

    return convertShopDsrInfoToCommon(response);
  }
}
