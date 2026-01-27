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

import { Form, useNavigation } from 'react-router';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Search, Loader2, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';

type SearchBarProps = {
  defaultValue?: string;
  defaultVersion?: string;
  error?: string;
};

export function SearchBar({
  defaultValue = '',
  defaultVersion = 'v18',
  error,
}: SearchBarProps) {
  const navigation = useNavigation();
  const isSearching = navigation.state !== 'idle';
  const [apiVersion, setApiVersion] = useState(defaultVersion);
  const [imageUrl, setImageUrl] = useState('');

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* URL検索フォーム */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            URL検索
          </CardTitle>
          <CardDescription>
            タオバオまたは1688の商品URLから検索
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="flex flex-col gap-4">
            <input type="hidden" name="searchType" value="url" />
            <div className="flex gap-2">
              <Input
                name="url"
                type="text"
                defaultValue={defaultValue}
                placeholder="https://item.taobao.com/item.htm?id=..."
                className="flex-1"
                required
                disabled={isSearching}
              />
              <input type="hidden" name="apiVersion" value={apiVersion} />
              <Select
                value={apiVersion}
                onValueChange={setApiVersion}
                disabled={isSearching}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="v18" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v18">v18</SelectItem>
                  <SelectItem value="v28">v28</SelectItem>
                  <SelectItem value="v40">v40</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" disabled={isSearching}>
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    検索中...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" /> 検索
                  </>
                )}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>

      {/* 画像検索フォーム */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            画像検索
          </CardTitle>
          <CardDescription>
            画像URLまたは画像ファイルから類似商品を検索
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 画像URL検索 */}
          <Form method="post" className="flex flex-col gap-4">
            <input type="hidden" name="searchType" value="imageUrl" />
            <div className="flex gap-2">
              <Input
                name="imageUrl"
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="画像URLを入力"
                className="flex-1"
                required
                disabled={isSearching}
              />
              <Button type="submit" disabled={isSearching || !imageUrl}>
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    検索中...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" /> URL検索
                  </>
                )}
              </Button>
            </div>
          </Form>

          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              💡 ヒント: Taobaoの商品画像を右クリック→「画像アドレスをコピー」して、上の画像URLフィールドに貼り付けてください。
            </p>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 text-center">
          {error}
        </div>
      )}
    </div>
  );
}
