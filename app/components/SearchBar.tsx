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
import { Search, Loader2 } from 'lucide-react';
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

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Form method="post" className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Input
            name="url"
            type="text"
            defaultValue={defaultValue}
            placeholder="タオバオまたは1688の商品URLを入力"
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
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
        )}
      </Form>
    </div>
  );
}
