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
import { TaobaoDataHubApiService } from './taobaoDataHubApi.server';
import { DataHub1688ApiService } from './datahub1688Api.server';
import { TaobaoTmall1688ApiService } from './taobaoTmall1688Api.server';
import { Taobao1688V10ApiService } from './taobao1688v10Api.server';
import { SellerRatingService } from './sellerRating.server';
import type { CommonTaobaoItemDto } from '../types/common.dto';

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
}

export type ApiProvider = 'v18' | 'v28' | 'v40' | 'datahub' | '1688datahub' | 'tmall1688' | 'v10' | 'auto';

const taobaoApiServiceInstances: Map<string, Taobao1688ApiService> = new Map();
const dataHubApiServiceInstance: Map<string, TaobaoDataHubApiService> = new Map();
const dataHub1688ApiServiceInstance: Map<string, DataHub1688ApiService> = new Map();
const tmall1688ApiServiceInstance: Map<string, TaobaoTmall1688ApiService> = new Map();
const v10ApiServiceInstance: Map<string, Taobao1688V10ApiService> = new Map();
let sellerRatingServiceInstance: SellerRatingService | null = null;

export function getTaobaoApiService(
  provider: ApiProvider = 'v28'
): Taobao1688ApiService | TaobaoDataHubApiService | DataHub1688ApiService | TaobaoTmall1688ApiService | Taobao1688V10ApiService {
  if (provider === 'v10') {
    const key = 'v10';
    if (!v10ApiServiceInstance.has(key)) {
      const rapidApiKey = getEnvVar('RAPIDAPI_KEY');
      const rapidApiService = new RapidApiService('taobao-1688-api1.p.rapidapi.com', rapidApiKey);
      const instance = new Taobao1688V10ApiService(rapidApiService);
      v10ApiServiceInstance.set(key, instance);
    }
    return v10ApiServiceInstance.get(key)!;
  }

  if (provider === 'tmall1688') {
    const key = 'tmall1688';
    if (!tmall1688ApiServiceInstance.has(key)) {
      const rapidApiKey = getEnvVar('RAPIDAPI_KEY');
      const rapidApiService = new RapidApiService('taobao-tmall-16881.p.rapidapi.com', rapidApiKey);
      const instance = new TaobaoTmall1688ApiService(rapidApiService);
      tmall1688ApiServiceInstance.set(key, instance);
    }
    return tmall1688ApiServiceInstance.get(key)!;
  }

  if (provider === '1688datahub') {
    const key = '1688datahub';
    if (!dataHub1688ApiServiceInstance.has(key)) {
      const rapidApiKey = getEnvVar('RAPIDAPI_1688_DATAHUB_KEY');
      const rapidApiService = new RapidApiService('1688-datahub.p.rapidapi.com', rapidApiKey);
      const instance = new DataHub1688ApiService(rapidApiService);
      dataHub1688ApiServiceInstance.set(key, instance);
    }
    return dataHub1688ApiServiceInstance.get(key)!;
  }

  if (provider === 'datahub') {
    const key = 'datahub';
    if (!dataHubApiServiceInstance.has(key)) {
      const rapidApiKey = getEnvVar('RAPIDAPI_KEY');
      const rapidApiService = new RapidApiService('taobao-datahub.p.rapidapi.com', rapidApiKey);
      const instance = new TaobaoDataHubApiService(rapidApiService);
      dataHubApiServiceInstance.set(key, instance);
    }
    return dataHubApiServiceInstance.get(key)!;
  }

  // v18, v28, v40 - Legacy API versions
  const apiVersion = provider;
  if (!taobaoApiServiceInstances.has(apiVersion)) {
    const rapidApiHost = getEnvVar('RAPIDAPI_HOST');
    const rapidApiKey = getEnvVar('RAPIDAPI_KEY');

    const rapidApiService = new RapidApiService(rapidApiHost, rapidApiKey);
    const instance = new Taobao1688ApiService(
      rapidApiService,
      apiVersion
    );
    taobaoApiServiceInstances.set(apiVersion, instance);
  }

  return taobaoApiServiceInstances.get(apiVersion)!;
}

/**
 * Fetch item detail with automatic fallback between multiple API providers
 * Tries APIs in order: v28 → v18 → v10 → tmall1688 → v40
 */
export async function fetchItemDetailWithFallback(
  itemId: string,
  site: 'taobao' | '1688' = 'taobao'
): Promise<CommonTaobaoItemDto> {
  const apiProviders: ApiProvider[] = [
    'v28',
    'v18',
    'v10',
    'tmall1688',
    'v40',
  ];

  const errors: Array<{ provider: string; error: string }> = [];

  for (const provider of apiProviders) {
    try {
      console.log(`[Auto Mode] Trying ${provider}...`);
      const apiService = getTaobaoApiService(provider);
      const result = await apiService.fetchItemDetail(itemId, site);
      console.log(`[Auto Mode] Success with ${provider}`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push({ provider, error: errorMessage });
      console.log(`[Auto Mode] Failed with ${provider}: ${errorMessage}`);
      // Continue to next provider
    }
  }

  // All APIs failed
  const errorDetails = errors.map(e => `${e.provider}: ${e.error}`).join('; ');
  throw new Error(`All APIs failed. Errors: ${errorDetails}`);
}

/**
 * Get seller rating service instance (singleton)
 */
export function getSellerRatingService(): SellerRatingService {
  if (!sellerRatingServiceInstance) {
    const rapidApiKey = getEnvVar('RAPIDAPI_KEY');
    const rapidApiService = new RapidApiService('taobao-tmall-data-service.p.rapidapi.com', rapidApiKey);
    sellerRatingServiceInstance = new SellerRatingService(rapidApiService);
  }
  return sellerRatingServiceInstance;
}
