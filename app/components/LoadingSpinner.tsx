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

import { Loader2 } from 'lucide-react';

type LoadingSpinnerProps = {
  message?: string;
  className?: string;
};

export function LoadingSpinner({
  message = '読み込み中...',
  className = ''
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin text-taobao-orange" />
      <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
}
