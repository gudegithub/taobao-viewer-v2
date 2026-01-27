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

import { Card, CardContent } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import { Separator } from '~/components/ui/separator';

export function ProductDetailSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Left: Image Gallery Skeleton */}
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="w-20 h-20 rounded" />
              <Skeleton className="w-20 h-20 rounded" />
              <Skeleton className="w-20 h-20 rounded" />
            </div>
          </div>

          {/* Right: Product Info Skeleton */}
          <div className="space-y-6">
            <div>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </div>

            <Separator />

            <div className="space-y-2">
              <Skeleton className="h-10 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
