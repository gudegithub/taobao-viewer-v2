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
import { ErrorMessage } from '~/components/ErrorMessage';

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
  const url = formData.get('url');

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

  return redirect(`/product/${extracted.id}?site=${extracted.site}`);
}

export default function Home({ actionData }: Route.ComponentProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* エラーメッセージ */}
        {actionData?.error && (
          <div className="mb-6">
            <ErrorMessage message={actionData.error} />
          </div>
        )}

        {/* メインコンテンツ */}
        <div>
          <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Taobao <span className="text-taobao-orange">Viewer</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            タオバオ・1688の商品情報を簡単に表示
          </p>
        </div>

        {/* 使い方 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            使い方
          </h2>
          <ol className="text-left space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-taobao-orange text-white flex items-center justify-center text-sm font-bold">
                1
              </span>
              <span>上部の検索バーにタオバオまたは1688の商品URLを入力</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-taobao-orange text-white flex items-center justify-center text-sm font-bold">
                2
              </span>
              <span>検索ボタンをクリック</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-taobao-orange text-white flex items-center justify-center text-sm font-bold">
                3
              </span>
              <span>商品情報、価格、SKU情報を確認</span>
            </li>
          </ol>
        </div>

        {/* 対応URL形式 */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p className="mb-2 font-medium">対応URL形式:</p>
          <div className="space-y-1 font-mono text-xs">
            <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded">
              Taobao: https://item.taobao.com/item.htm?id=...
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded">
              1688: https://detail.1688.com/offer/....html
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
