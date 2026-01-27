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

import { useState, useMemo, useEffect } from 'react';
import type { CommonTaobaoItemDto, PropertyOption } from '~/types/common.dto';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import { ExternalLink, Store } from 'lucide-react';

type PropertyGroup = {
  propertyId: string;
  propertyName: string;
  options: PropertyOption[];
};

type ProductDetailProps = {
  product: CommonTaobaoItemDto;
};

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // プロパティグループを作成（全SKUからプロパティを集約し重複排除）
  const propertyGroups = useMemo<PropertyGroup[]>(() => {
    const groupsMap = new Map<string, PropertyGroup>();

    product.data.skus.forEach((sku) => {
      sku.properties.forEach((prop) => {
        if (!groupsMap.has(prop.propertyId)) {
          groupsMap.set(prop.propertyId, {
            propertyId: prop.propertyId,
            propertyName: prop.propertyName,
            options: [],
          });
        }

        const group = groupsMap.get(prop.propertyId)!;
        const existingOption = group.options.find(
          (opt) => opt.valueId === prop.valueId
        );

        if (!existingOption) {
          group.options.push(prop);
        }
      });
    });

    return Array.from(groupsMap.values());
  }, [product.data.skus]);

  // 選択されたオプションに基づいてSKUをフィルタリング
  const availableSkus = useMemo(() => {
    return product.data.skus.filter((sku) => {
      return Object.entries(selectedOptions).every(([propId, valueId]) => {
        return sku.properties.some(
          (prop) => prop.propertyId === propId && prop.valueId === valueId
        );
      });
    });
  }, [product.data.skus, selectedOptions]);

  // 選択されたSKU（1つに絞り込まれた場合のみ）
  const selectedSku = useMemo(() => {
    return availableSkus.length === 1 ? availableSkus[0] : null;
  }, [availableSkus]);

  // オプションが選択可能かチェック（少なくとも1つのSKUが該当するか）
  const isOptionAvailable = (propertyId: string, valueId: string): boolean => {
    const tempOptions = { ...selectedOptions, [propertyId]: valueId };

    return product.data.skus.some((sku) => {
      return Object.entries(tempOptions).every(([propId, valId]) => {
        return sku.properties.some(
          (prop) => prop.propertyId === propId && prop.valueId === valId
        );
      });
    });
  };

  // 初期選択：各プロパティグループの最初のオプションを自動選択
  useEffect(() => {
    if (propertyGroups.length > 0 && Object.keys(selectedOptions).length === 0) {
      const initialOptions: Record<string, string> = {};
      propertyGroups.forEach((group) => {
        if (group.options.length > 0) {
          initialOptions[group.propertyId] = group.options[0].valueId;
        }
      });
      setSelectedOptions(initialOptions);
    }
  }, [propertyGroups, selectedOptions]);

  const handleOptionClick = (propertyId: string, valueId: string) => {
    setSelectedOptions((prev) => {
      return {
        ...prev,
        [propertyId]: valueId,
      };
    });
  };

  const displayPrice = selectedSku
    ? selectedSku.price
    : product.data.price;
  const displayOriginalPrice = selectedSku
    ? selectedSku.originalPrice
    : product.data.originalPrice;
  const displayStock = selectedSku
    ? selectedSku.stock
    : product.data.totalStock;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* 左側：画像ギャラリー */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              <img
                src={product.data.images[currentImageIndex]?.url || product.data.mainImageUrl}
                alt={product.data.title}
                className="w-full h-full object-contain"
              />
            </div>
            {product.data.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.data.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden ${
                      index === currentImageIndex
                        ? 'border-primary'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.data.title} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 右側：商品情報 */}
          <div className="space-y-6">
            <div>
              <CardTitle className="text-2xl mb-2">
                {product.data.title}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                {product.data.merchantName || '販売者情報なし'}
              </CardDescription>
            </div>

            <Separator />

            {/* 価格 */}
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-taobao-orange">
                  ¥{displayPrice.toLocaleString()}
                </span>
                {displayOriginalPrice > displayPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    ¥{displayOriginalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="mt-2">
                <Badge
                  variant={displayStock > 0 ? 'default' : 'destructive'}
                >
                  在庫: {displayStock > 0 ? `${displayStock}個` : '在庫切れ'}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* SKUプロパティ選択 */}
            {propertyGroups.length > 0 && (
              <div className="space-y-4">
                {propertyGroups.map((group) => (
                  <div key={group.propertyId}>
                    <div className="mb-2 font-medium text-sm">
                      {group.propertyName}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.options.map((option) => {
                        const isSelected =
                          selectedOptions[group.propertyId] === option.valueId;
                        const isAvailable = isOptionAvailable(
                          group.propertyId,
                          option.valueId
                        );

                        return (
                          <div
                            key={option.valueId}
                            onClick={() =>
                              isAvailable &&
                              handleOptionClick(group.propertyId, option.valueId)
                            }
                            className={`
                              inline-flex items-center justify-center rounded-md text-sm font-medium
                              px-3 py-2 cursor-pointer select-text transition-colors
                              ${
                                isSelected
                                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                  : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                              }
                              ${
                                !isAvailable
                                  ? 'opacity-50 cursor-not-allowed pointer-events-none'
                                  : ''
                              }
                            `}
                          >
                            {option.value}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Separator />

            {/* アクション */}
            <div>
              <a
                href={product.data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full" size="lg">
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Taobaoで開く
                </Button>
              </a>
            </div>

            {/* ブランド情報 */}
            {product.data.brand && (
              <>
                <Separator />
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    ブランド:{' '}
                  </span>
                  <span className="font-medium">{product.data.brand}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 商品説明 */}
        {product.data.description && (
          <>
            <Separator />
            <div className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl">商品説明</CardTitle>
              </CardHeader>
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: product.data.description }}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
