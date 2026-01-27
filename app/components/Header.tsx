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

import { Link, Form, useNavigation } from 'react-router';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Search, Loader2 } from 'lucide-react';

export function Header() {
  const navigation = useNavigation();
  const isSearching = navigation.state !== 'idle';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-950/95 dark:supports-[backdrop-filter]:bg-gray-950/60">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity">
          <span className="text-taobao-orange">Taobao</span>
          <span className="text-gray-900 dark:text-white">Viewer</span>
        </Link>

        {/* Search Bar */}
        <Form method="post" action="/" className="flex-1 max-w-2xl">
          <div className="flex gap-2">
            <Input
              name="url"
              type="text"
              placeholder="タオバオまたは1688の商品URLを入力"
              className="flex-1"
              required
              disabled={isSearching}
            />
            <Button type="submit" disabled={isSearching} size="sm">
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="sr-only">検索</span>
            </Button>
          </div>
        </Form>
      </div>
    </header>
  );
}
