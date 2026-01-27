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

import type { Route } from './+types/_index';
import { redirect } from 'react-router';
import { Link } from 'react-router';
import { SearchBar } from '~/components/SearchBar';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { RapidApiService } from '~/services/rapidApi.server';
import { Taobao1688ApiService } from '~/services/taobao1688Api.server';
import type { ImageSearchResultItem } from '~/types/taobao1688Api.dto';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Taobao Viewer - 商品検索' },
    { name: 'description', content: 'タオバオ・1688商品ビューア' },
  ];
}

/**
 * Taobaoまたは1688のURLから商品IDを抽出
 */
function extractItemId(url: string): { id: string; site: 'taobao' | '1688' } | null {
  try {
    const urlObj = new URL(url);

    // Taobao: https://item.taobao.com/item.htm?id=123456789
    if (urlObj.hostname.includes('taobao.com')) {
      const id = urlObj.searchParams.get('id');
      if (id) {
        return { id, site: 'taobao' };
      }
    }

    // 1688: https://detail.1688.com/offer/123456789.html
    if (urlObj.hostname.includes('1688.com')) {
      const match = urlObj.pathname.match(/\/offer\/(\d+)\.html/);
      if (match && match[1]) {
        return { id: match[1], site: '1688' };
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const searchType = formData.get('searchType');

  // URL検索
  if (searchType === 'url') {
    const url = formData.get('url');
    const apiVersion = formData.get('apiVersion') || 'v18';

    if (typeof url !== 'string' || !url.trim()) {
      return {
        error: 'URLを入力してください',
      };
    }

    const extracted = extractItemId(url.trim());

    if (!extracted) {
      return {
        error: '有効なタオバオまたは1688の商品URLを入力してください',
      };
    }

    return redirect(`/product/${extracted.id}?site=${extracted.site}&apiVersion=${apiVersion}`);
  }

  // 画像URL検索
  if (searchType === 'imageUrl') {
    const imageUrl = formData.get('imageUrl');

    if (typeof imageUrl !== 'string' || !imageUrl.trim()) {
      return {
        error: '画像URLを入力してください',
      };
    }

    try {
      const rapidApiKey = process.env.RAPIDAPI_KEY;
      const rapidApiHost = process.env.RAPIDAPI_HOST || 'taobao-1688-api1.p.rapidapi.com';

      if (!rapidApiKey) {
        throw new Error('RAPIDAPI_KEY is not configured');
      }

      const rapidApiService = new RapidApiService(rapidApiHost, rapidApiKey);
      const taobaoApiService = new Taobao1688ApiService(rapidApiService);

      const response = await taobaoApiService.searchByImageUrl(imageUrl.trim());

      if (!response.success) {
        return {
          error: '画像検索に失敗しました',
        };
      }

      return {
        searchResults: response.data.items,
        searchType: 'image',
      };
    } catch (error) {
      console.error('Image URL search error:', error);
      return {
        error: error instanceof Error ? error.message : '画像検索中にエラーが発生しました',
      };
    }
  }

  return {
    error: '無効な検索タイプです',
  };
}

export default function Home({ actionData }: Route.ComponentProps) {
  const searchResults = actionData?.searchResults as ImageSearchResultItem[] | undefined;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-7xl mx-auto space-y-6 py-8">
        <SearchBar error={actionData?.error} />

        {searchResults && searchResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">検索結果 ({searchResults.length}件)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {searchResults.map((item) => (
                <Link
                  key={item.num_iid}
                  to={`/product/${item.num_iid}?site=taobao`}
                  className="block transition-transform hover:scale-105"
                >
                  <Card className="h-full">
                    <CardHeader className="p-0">
                      <img
                        src={item.pic_url}
                        alt={item.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    </CardHeader>
                    <CardContent className="p-4">
                      <CardTitle className="text-sm line-clamp-2 mb-2">
                        {item.title}
                      </CardTitle>
                      <div className="space-y-1 text-sm">
                        <p className="font-bold">
                          ¥{item.price.toFixed(2)}
                        </p>
                        {item.nick && (
                          <p className="text-gray-600 dark:text-gray-400">
                            {item.nick}
                          </p>
                        )}
                        {item.sales && (
                          <p className="text-gray-500 text-xs">
                            販売数: {item.sales}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {searchResults && searchResults.length === 0 && (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            検索結果が見つかりませんでした
          </div>
        )}
      </div>
    </div>
  );
}
