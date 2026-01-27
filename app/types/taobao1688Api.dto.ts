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
