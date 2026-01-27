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
import { SearchBar } from '~/components/SearchBar';

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

export default function Home({ actionData }: Route.ComponentProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <SearchBar error={actionData?.error} />
    </div>
  );
}
