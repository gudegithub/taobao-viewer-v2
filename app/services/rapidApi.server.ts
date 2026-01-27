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

export type RapidApiRequestDto = {
  method: 'post' | 'get' | 'put' | 'delete';
  path: string;
  payload?: object;
  host?: string;
};

export class RapidApiService {
  constructor(
    private host: string,
    private key: string
  ) {
    this.host = host;
    this.key = key;
  }

  public async request<T = unknown>({
    method,
    path,
    payload,
    host,
  }: RapidApiRequestDto): Promise<T> {
    const requestHost = host || this.host;
    const url = `https://${requestHost}${path}`;

    const options: RequestInit = {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': requestHost,
        'x-rapidapi-key': this.key,
      },
      body: payload ? JSON.stringify(payload) : undefined,
    };

    const response = await fetch(url, options);
    const statusCode = response.status;
    const responseText = await response.text();

    if (statusCode !== 200) {
      throw new Error(
        `RapidAPI request failed with status ${statusCode}: ${responseText}`
      );
    }

    return JSON.parse(responseText) as T;
  }

  public async requestAll<T = unknown>(
    requests: RapidApiRequestDto[]
  ): Promise<(T | null)[]> {
    const promises = requests.map(async (request, index) => {
      try {
        const url = `https://${this.host}${request.path}`;
        const options: RequestInit = {
          method: request.method.toUpperCase(),
          headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-host': this.host,
            'x-rapidapi-key': this.key,
          },
          body: request.payload ? JSON.stringify(request.payload) : undefined,
        };

        const response = await fetch(url, options);

        if (response.status !== 200) {
          return null;
        }

        const responseText = await response.text();
        return JSON.parse(responseText) as T;
      } catch (error) {
        return null;
      }
    });

    return Promise.all(promises);
  }
}
