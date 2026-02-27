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

import type { Route } from './+types/product.$id';
import { useNavigation } from 'react-router';
import { getTaobaoApiService } from '~/services/config.server';
import { ProductDetail } from '~/components/ProductDetail';
import { ProductDetailSkeleton } from '~/components/ProductDetailSkeleton';

export function meta({ data }: Route.MetaArgs) {
  if (!data || !data.success) {
    return [{ title: 'エラー - Taobao Viewer' }];
  }

  return [
    { title: `${data.data.title} - Taobao Viewer` },
    { name: 'description', content: data.data.title },
  ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const site = (url.searchParams.get('site') as 'taobao' | '1688') || 'taobao';
  const apiVersion = url.searchParams.get('apiVersion') || 'v18';
  const itemId = params.id;

  if (!itemId) {
    throw new Response('商品IDが指定されていません', { status: 400 });
  }

  try {
    const taobaoApi = getTaobaoApiService(apiVersion);
    let productData;

    try {
      productData = await taobaoApi.fetchItemDetail(itemId, site);
    } catch (error) {
      // API returns error response (e.g., "Item not available")
      console.error('API error:', error);
      throw new Response('商品が見つかりませんでした。商品が削除されたか、IDが間違っている可能性があります。', {
        status: 404,
        statusText: 'Item Not Found'
      });
    }

    if (!productData.success) {
      throw new Response('商品データの取得に失敗しました', { status: 404 });
    }

    // セラー評価データを取得（エラーがあっても商品データは返す）
    // TODO: seller rating APIが502エラーでタイムアウトするため、一時的に無効化
    let sellerRating = null;
    // if (productData.data.merchantId) {
    //   try {
    //     sellerRating = await taobaoApi.fetchSellerRating(
    //       productData.data.merchantId
    //     );
    //   } catch (error) {
    //     console.error('Failed to fetch seller rating:', error);
    //   }
    // }

    return {
      ...productData,
      sellerRating,
    };
  } catch (error) {
    console.error('Failed to fetch product:', error);
    throw new Response('商品データの取得中にエラーが発生しました', {
      status: 500,
    });
  }
}

export default function ProductPage({ loaderData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {isLoading ? (
          <ProductDetailSkeleton />
        ) : (
          <ProductDetail
            product={loaderData}
            sellerRating={loaderData.sellerRating}
          />
        )}
      </div>
    </div>
  );
}
