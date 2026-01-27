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

/**
 * 共通商品プロパティオプション
 */
export type PropertyOption = {
  /** プロパティID (例: "1627207") */
  propertyId: string;
  /** 値ID (例: "28332") */
  valueId: string;
  /** プロパティ名 (例: "颜色分类") */
  propertyName: string;
  /** 値 (例: "浅灰色") */
  value: string;
};

/**
 * 共通SKU情報
 */
export type CommonSkuItem = {
  /** SKU ID */
  skuId: string;
  /** 販売価格 */
  price: number;
  /** 元の価格（定価） */
  originalPrice: number;
  /** 在庫数 */
  stock: number;
  /** プロパティオプションの配列 */
  properties: PropertyOption[];
  /** SKU画像URL */
  imageUrl?: string;
};

/**
 * 共通商品画像
 */
export type CommonItemImage = {
  url: string;
};

/**
 * 共通商品情報DTO
 * - APIバージョンに依存しない統一的な商品情報
 * - ビジネスロジック層とフロントエンドで使用
 */
export type CommonTaobaoItemDto = {
  /** 成功フラグ */
  success: boolean;
  /** エラーコード */
  code: number;
  /** 商品データ */
  data: {
    /** 商品ID */
    itemId: string;
    /** 商品タイトル */
    title: string;
    /** 商品URL */
    url: string;
    /** 販売者名 */
    merchantName: string;
    /** 販売者ID */
    merchantId: string;
    /** メイン画像URL */
    mainImageUrl: string;
    /** 商品画像一覧 */
    images: CommonItemImage[];
    /** 商品説明HTML */
    description?: string;
    /** 最小注文数 */
    minOrderQuantity: number;
    /** 在庫数（全SKUの合計または代表値） */
    totalStock: number;
    /** 価格（最低価格） */
    price: number;
    /** 元の価格（定価） */
    originalPrice: number;
    /** SKU一覧 */
    skus: CommonSkuItem[];
    /** ブランド名 */
    brand?: string;
    /** カテゴリID */
    categoryId?: string;
    /** カテゴリ名 */
    categoryName?: string;
  };
};

/**
 * セラー評価情報（DSR - Detail Seller Rating）
 */
export type SellerRatingDto = {
  /** 成功フラグ */
  success: boolean;
  /** エラーコード */
  code: number;
  /** 評価データ */
  data: {
    /** 商品スコア（1-5点） */
    itemScore: number;
    /** 商品スコアの業界平均との比較値（%） */
    itemCompareValue: number;
    /** 商品スコアの比較方向（0=平均以上, 1=平均） */
    itemCompareDirection: number;
    /** 商品スコアの説明文 */
    itemScoreDescription: string;
    /** サービススコア（1-5点） */
    serviceScore: number;
    /** サービススコアの業界平均との比較値（%） */
    serviceCompareValue: number;
    /** サービススコアの比較方向（0=平均以上, 1=平均） */
    serviceCompareDirection: number;
    /** サービススコアの説明文 */
    serviceScoreDescription: string;
    /** 配送スコア（1-5点） */
    deliveryScore: number;
    /** 配送スコアの業界平均との比較値（%） */
    deliveryCompareValue: number;
    /** 配送スコアの比較方向（0=平均以上, 1=平均） */
    deliveryCompareDirection: number;
    /** 配送スコアの説明文 */
    deliveryScoreDescription: string;
    /** セラー良好率（%） */
    sellerGoodRate: number;
    /** セラークレジット */
    sellerCredit: number;
    /** DSRデータを持っているか */
    hasDsr: boolean;
  };
};
