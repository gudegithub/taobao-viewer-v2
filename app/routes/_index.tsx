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
import { extractItemId } from '~/utils/url-extractor';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Taobao Viewer - 商品検索' },
    { name: 'description', content: 'タオバオ・1688商品ビューア' },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const url = formData.get('url');
  const apiProvider = formData.get('apiProvider') || 'auto';

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

  return redirect(`/product/${extracted.id}?site=${extracted.site}&apiProvider=${apiProvider}`);
}

export default function Home({ actionData }: Route.ComponentProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <SearchBar error={actionData?.error} />
    </div>
  );
}
