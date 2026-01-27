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

// V18 Response Types
export type V18Parameter = {
  groupCode: string;
  type: string;
  typename: string;
  code: string;
  name: string;
  pic: string | null;
};

export type V18GoodsGroupItem = {
  properties: string;
  properties_name: string;
  price: number;
  keyPrice: string;
  quantity: string;
  sku_id: number;
};

export type V18ItemDetailResponseDto = {
  success: boolean;
  data: {
    info: {
      iid: string;
      num_iid: string;
      title: string;
      props_name: string;
      parameter: Record<string, V18Parameter[]>;
      bizinfo: {
        sid: string;
        title: string;
        shop_score: {
          item_score: string;
          delivery_score: string;
          service_score: string;
        };
      };
      nick: string;
      detail_url: string;
      status: string;
      approve_status: string;
      shopurl: string;
      shopType: string;
      location: {
        state: string;
        city: string;
      };
      pic_url: string;
      imagePhoto: string;
      imgString: string;
      cid: string;
      price: number;
      express_fee: string;
      freight: string;
      minNumber: number;
      goods_sum: number;
      desc: string;
      rank_arr: string;
      arrow_level: string;
      parameterSort: number[];
      ratePrice: string;
      rateExpress_fee: string;
    };
    preferential: Record<string, number>;
    goodsGroup: Record<string, V18GoodsGroupItem>;
    keywords: string;
    title: string;
    description: string;
  };
  code: number;
};

// V28 Response Types
export type SkuItem = {
  price: number;
  total_price: number;
  orginal_price: number;
  properties: string;
  properties_name: string;
  quantity: number;
  sku_id: number;
};

// V40 Response Types
export type V40SkuAttr = {
  code: string;
  name: string;
  enumValue: string;
  enumImageUrl: string;
};

export type V40SkuVo = {
  skuNo: string;
  spuNo: string;
  channel: string;
  skuAttr: V40SkuAttr[];
  price: number;
  priceCny: number;
  originalPrice: number | null;
  originalPriceCny: number | null;
  stock: number;
  discount: number;
};

export type V40ItemDetailResponseDto = {
  success: boolean;
  data: {
    spuNo: string;
    channel: string;
    subject: string;
    description: string;
    mainImg: string;
    imageList: string[];
    detailUrl: string;
    startQuantity: number;
    price: number;
    priceCny: number;
    originalPrice: number | null;
    originalPriceCny: number | null;
    skuVoList: V40SkuVo[];
    tagList: any[] | null;
    favorite: boolean;
    shopId: string;
    shopName: string;
    discount: number;
  };
  code: number;
};

export type ItemImage = {
  url: string;
};

export type DescImage = {
  properties: string;
  url: string;
};

export type Taobao1688ItemDetailResponseDto = {
  success: boolean;
  data: {
    title: string;
    title_cn: string;
    nick: string;
    min_num: number;
    num_iid: number;
    detail_url: string;
    brand: string;
    brandId: string;
    pic_url: string;
    num: number;
    price: number;
    total_price: number;
    suggestive_price: number;
    orginal_price: number;
    desc?: string;
    item_imgs?: ItemImage[];
    desc_img?: DescImage[];
    props_list?: Record<string, string>;
    skus?: {
      sku: SkuItem[];
    };
    seller_id?: string;
    shop_id?: number;
    seller_info?: {
      nick: string;
      shop_logo: string;
      shop_name: string;
      title: string;
      zhuy: string;
      sid: number;
    };
    sales?: number;
    status?: number;
  };
  code: number;
};

export type Taobao1688SkuInfoResponseDto = {
  success: boolean;
  data: {
    title: string;
    title_cn: string;
    nick: string;
    min_num: number;
    num_iid: number;
    detail_url: string;
    brand: string;
    brandId: string;
    pic_url: string;
    num: number;
    price: number;
    total_price: number;
    suggestive_price: number;
    orginal_price: number;
    skus?: {
      sku: SkuItem[];
    };
  };
  code: number;
};

/**
 * ShopDsrInfo APIのレスポンス型
 */
export type ShopDsrInfoResponseDto = {
  ret_id: number;
  ret_code: number;
  ret_message: string;
  ret_body: string | {
    item_score: number;
    item_compare_value: number;
    item_compare_direction: number;
    item_score_description: string;
    service_score: number;
    service_compare_value: number;
    service_compare_direction: number;
    service_score_description: string;
    delivery_score: number;
    delivery_compare_value: number;
    delivery_compare_direction: number;
    delivery_score_description: string;
    seller_good_rate: number;
    seller_credit: number;
    has_dsr: boolean;
  };
};
