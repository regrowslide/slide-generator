import {NextRequest, NextResponse} from 'next/server'
import prisma from '@/lib/prisma'
import {RulesResponse} from '@appDir/(apps)/hakobun-analysis/types'

// ルール一覧取得
export async function GET(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url)
    const clientId = searchParams.get('client_id')

    if (!clientId) {
      return NextResponse.json(
        {
          success: false,
          error: 'client_id は必須です',
        } as RulesResponse,
        {status: 400}
      )
    }

    const client = await prisma.hakobunClient.findUnique({
      where: {clientId},
    })

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          error: `クライアント "${clientId}" が見つかりません`,
        } as RulesResponse,
        {status: 404}
      )
    }

    const rules = await prisma.hakobunRule.findMany({
      where: {hakobunClientId: client.id},
      orderBy: [{priority: 'asc'}, {createdAt: 'desc'}],
    })

    return NextResponse.json({
      success: true,
      rules,
    } as RulesResponse)
  } catch (error) {
    console.error('Get rules error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      } as RulesResponse,
      {status: 500}
    )
  }
}

// ルール作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {client_id, target_category, rule_description, priority} = body

    if (!client_id || !target_category || !rule_description) {
      return NextResponse.json(
        {
          success: false,
          error: 'client_id, target_category, rule_description は必須です',
        },
        {status: 400}
      )
    }

    const client = await prisma.hakobunClient.findUnique({
      where: {clientId: client_id},
    })

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          error: `クライアント "${client_id}" が見つかりません`,
        },
        {status: 404}
      )
    }

    const rule = await prisma.hakobunRule.create({
      data: {
        targetCategory: target_category,
        ruleDescription: rule_description,
        priority: priority || 'Medium',
        hakobunClientId: client.id,
      },
    })

    return NextResponse.json({
      success: true,
      rule,
    })
  } catch (error) {
    console.error('Create rule error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}

// ルール更新
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {id, target_category, rule_description, priority} = body

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'id は必須です',
        },
        {status: 400}
      )
    }

    const rule = await prisma.hakobunRule.update({
      where: {id},
      data: {
        ...(target_category && {targetCategory: target_category}),
        ...(rule_description && {ruleDescription: rule_description}),
        ...(priority && {priority}),
      },
    })

    return NextResponse.json({
      success: true,
      rule,
    })
  } catch (error) {
    console.error('Update rule error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}

// ルール削除
export async function DELETE(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'id は必須です',
        },
        {status: 400}
      )
    }

    await prisma.hakobunRule.delete({
      where: {id: parseInt(id)},
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Delete rule error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}
