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

import { RapidApiService } from './rapidApi.server';
import { Taobao1688ApiService } from './taobao1688Api.server';

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
}

let taobaoApiServiceInstance: Taobao1688ApiService | null = null;

export function getTaobaoApiService(): Taobao1688ApiService {
  if (!taobaoApiServiceInstance) {
    const rapidApiHost = getEnvVar('RAPIDAPI_HOST');
    const rapidApiKey = getEnvVar('RAPIDAPI_KEY');
    const apiVersion = process.env.API_VERSION || 'v40';

    const rapidApiService = new RapidApiService(rapidApiHost, rapidApiKey);
    taobaoApiServiceInstance = new Taobao1688ApiService(
      rapidApiService,
      apiVersion
    );
  }

  return taobaoApiServiceInstance;
}
