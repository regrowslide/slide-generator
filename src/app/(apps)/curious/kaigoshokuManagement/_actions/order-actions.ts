'use server'

import type { Prisma } from '@prisma/generated/prisma/client'
import prisma from 'src/lib/prisma'
import type {
  KgOrder,
  KgOrderWithRelations,
  KgOrderLine,
  KgOrderFormData,
  OrderFilter,
} from '../types'

// 受注一覧取得
export const getOrders = async (params?: {
  where?: Prisma.KgOrderWhereInput
  orderBy?: Prisma.KgOrderOrderByWithRelationInput
  take?: number
  skip?: number
}): Promise<KgOrderWithRelations[]> => {
  const { where, orderBy, take, skip } = params ?? {}

  return await prisma.kgOrder.findMany({
    where,
    orderBy: orderBy ?? { deliveryDate: 'desc' },
    take,
    skip,
    include: {
      KgFacilityMaster: true,
      KgOrderLine: {
        orderBy: { sortOrder: 'asc' },
        include: {
          KgDietTypeMaster: true,
          KgMenuRecipe: true,
        },
      },
    },
  }) as KgOrderWithRelations[]
}

// フィルター条件で受注一覧取得
export const getOrdersByFilter = async (
  filter: OrderFilter
): Promise<KgOrderWithRelations[]> => {
  const where: Prisma.KgOrderWhereInput = {}

  if (filter.facilityId) {
    where.facilityId = filter.facilityId
  }
  if (filter.deliveryDateFrom || filter.deliveryDateTo) {
    where.deliveryDate = {
      gte: filter.deliveryDateFrom,
      lte: filter.deliveryDateTo,
    }
  }
  if (filter.status) {
    where.status = filter.status
  }

  return await getOrders({ where })
}

// 受注詳細取得
export const getOrder = async (id: number): Promise<KgOrderWithRelations | null> => {
  return await prisma.kgOrder.findUnique({
    where: { id },
    include: {
      KgFacilityMaster: true,
      KgOrderLine: {
        orderBy: { sortOrder: 'asc' },
        include: {
          KgDietTypeMaster: true,
          KgMenuRecipe: true,
        },
      },
    },
  }) as KgOrderWithRelations | null
}

// 受注作成
export const createOrder = async (data: KgOrderFormData): Promise<KgOrder> => {
  return await prisma.kgOrder.create({
    data: {
      facilityId: data.facilityId,
      orderDate: data.orderDate,
      deliveryDate: data.deliveryDate,
      status: data.status,
      sourceType: data.sourceType,
      note: data.note,
      KgOrderLine: {
        create: data.lines.map((line, index) => ({
          mealType: line.mealType,
          dietTypeId: line.dietTypeId,
          menuRecipeId: line.menuRecipeId,
          rawName: line.rawName,
          quantity: line.quantity,
          sortOrder: index,
        })),
      },
    },
  })
}

// 受注更新
export const updateOrder = async (
  id: number,
  data: Partial<{
    facilityId: number | null
    orderDate: Date
    deliveryDate: Date
    status: string
    sourceType: string
    note: string | null
  }>
): Promise<KgOrder> => {
  return await prisma.kgOrder.update({
    where: { id },
    data,
  })
}

// 受注削除
export const deleteOrder = async (id: number): Promise<void> => {
  await prisma.kgOrder.delete({
    where: { id },
  })
}

// 受注明細追加
export const createOrderLine = async (data: {
  orderId: number
  mealType: string
  dietTypeId: number
  menuRecipeId?: number
  rawName?: string
  quantity: number
  sortOrder?: number
}): Promise<KgOrderLine> => {
  return await prisma.kgOrderLine.create({
    data: {
      orderId: data.orderId,
      mealType: data.mealType,
      dietTypeId: data.dietTypeId,
      menuRecipeId: data.menuRecipeId,
      rawName: data.rawName,
      quantity: data.quantity,
      sortOrder: data.sortOrder ?? 0,
    },
  })
}

// 受注明細更新
export const updateOrderLine = async (
  id: number,
  data: Partial<{
    mealType: string
    dietTypeId: number
    menuRecipeId: number | null
    rawName: string | null
    quantity: number
    alert: string | null
    status: string
    confirmedAt: Date | null
  }>
): Promise<KgOrderLine> => {
  return await prisma.kgOrderLine.update({
    where: { id },
    data,
  })
}

// 受注明細削除
export const deleteOrderLine = async (id: number): Promise<void> => {
  await prisma.kgOrderLine.delete({
    where: { id },
  })
}

// 受注明細を一括確認
export const confirmOrderLines = async (orderLineIds: number[]): Promise<void> => {
  await prisma.kgOrderLine.updateMany({
    where: { id: { in: orderLineIds } },
    data: {
      status: 'confirmed',
      confirmedAt: new Date(),
    },
  })
}

// 受注ステータス更新
export const updateOrderStatus = async (
  id: number,
  status: string
): Promise<KgOrder> => {
  return await prisma.kgOrder.update({
    where: { id },
    data: { status },
  })
}

// 配送日で受注を集計（製造指示用）
export const getOrderSummaryByDeliveryDate = async (
  deliveryDate: Date
): Promise<
  {
    mealType: string
    dietTypeId: number
    dietTypeName: string
    menuRecipeId: number | null
    recipeName: string | null
    totalQuantity: number
  }[]
> => {
  const orders = await prisma.kgOrder.findMany({
    where: { deliveryDate },
    include: {
      KgOrderLine: {
        include: {
          KgDietTypeMaster: true,
          KgMenuRecipe: true,
        },
      },
    },
  })

  // 集計用のマップ
  const summaryMap = new Map<
    string,
    {
      mealType: string
      dietTypeId: number
      dietTypeName: string
      menuRecipeId: number | null
      recipeName: string | null
      totalQuantity: number
    }
  >()

  orders.forEach((order) => {
    order.KgOrderLine.forEach((line) => {
      const key = `${line.mealType}-${line.dietTypeId}-${line.menuRecipeId ?? 'null'}`
      const existing = summaryMap.get(key)

      if (existing) {
        existing.totalQuantity += line.quantity
      } else {
        summaryMap.set(key, {
          mealType: line.mealType,
          dietTypeId: line.dietTypeId,
          dietTypeName: line.KgDietTypeMaster.name,
          menuRecipeId: line.menuRecipeId,
          recipeName: line.KgMenuRecipe?.name ?? null,
          totalQuantity: line.quantity,
        })
      }
    })
  })

  return Array.from(summaryMap.values())
}
