/**
 * LifeOS シードデータ
 * デフォルトカテゴリを拡張スキーマ形式で投入
 */

import {PrismaClient} from '@prisma/generated/prisma/client'
import {PrismaPg} from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
}) as any
const prisma = new PrismaClient({adapter})

interface EnrichedSchemaField {
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object'
  label: string
  displayType?: 'text' | 'number' | 'boolean' | 'date' | 'url' | 'enum'
  unit?: string
  required?: boolean
  enum?: string[]
  min?: number
  max?: number
  description?: string
}

type EnrichedSchema = Record<string, EnrichedSchemaField>

interface CategorySeed {
  name: string
  description: string
  schema: EnrichedSchema
}

const defaultCategories: CategorySeed[] = [
  {
    name: '運動',
    description: 'ランニング、ジム、スポーツなどの運動記録',
    schema: {
      duration: {
        type: 'number',
        label: '時間',
        displayType: 'number',
        unit: '分',
        min: 0,
      },
      distance: {
        type: 'number',
        label: '距離',
        displayType: 'number',
        unit: 'km',
        min: 0,
      },
      activity: {
        type: 'string',
        label: '運動種目',
        displayType: 'text',
      },
      calories: {
        type: 'number',
        label: '消費カロリー',
        displayType: 'number',
        unit: 'kcal',
        min: 0,
      },
    },
  },
  {
    name: '健康',
    description: '体重、血圧、体調などの健康記録',
    schema: {
      weight: {
        type: 'number',
        label: '体重',
        displayType: 'number',
        unit: 'kg',
        min: 0,
      },
      bloodPressureHigh: {
        type: 'number',
        label: '血圧（上）',
        displayType: 'number',
        unit: 'mmHg',
      },
      bloodPressureLow: {
        type: 'number',
        label: '血圧（下）',
        displayType: 'number',
        unit: 'mmHg',
      },
      note: {
        type: 'string',
        label: 'メモ',
        displayType: 'text',
      },
    },
  },
  {
    name: 'タスク',
    description: 'やることリスト、タスク管理',
    schema: {
      title: {
        type: 'string',
        label: 'タスク名',
        displayType: 'text',
        required: true,
      },
      status: {
        type: 'string',
        label: 'ステータス',
        displayType: 'enum',
        enum: ['pending', 'in-progress', 'completed'],
      },
      priority: {
        type: 'string',
        label: '優先度',
        displayType: 'enum',
        enum: ['low', 'medium', 'high'],
      },
      dueDate: {
        type: 'date',
        label: '期限',
        displayType: 'date',
      },
    },
  },
  {
    name: '食事',
    description: '食事内容、カロリー記録',
    schema: {
      mealType: {
        type: 'string',
        label: '食事タイプ',
        displayType: 'enum',
        enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      },
      calories: {
        type: 'number',
        label: 'カロリー',
        displayType: 'number',
        unit: 'kcal',
        min: 0,
      },
      description: {
        type: 'string',
        label: '内容',
        displayType: 'text',
      },
    },
  },
  {
    name: '睡眠',
    description: '睡眠時間、睡眠の質の記録',
    schema: {
      duration: {
        type: 'number',
        label: '睡眠時間',
        displayType: 'number',
        unit: '時間',
        min: 0,
        max: 24,
      },
      quality: {
        type: 'number',
        label: '睡眠の質',
        displayType: 'number',
        min: 1,
        max: 5,
      },
      bedTime: {
        type: 'date',
        label: '就寝時刻',
        displayType: 'date',
      },
      wakeTime: {
        type: 'date',
        label: '起床時刻',
        displayType: 'date',
      },
    },
  },
  {
    name: '気分',
    description: '日々の気分や感情の記録',
    schema: {
      mood: {
        type: 'string',
        label: '気分',
        displayType: 'enum',
        enum: ['happy', 'neutral', 'sad', 'angry', 'anxious'],
      },
      energyLevel: {
        type: 'number',
        label: 'エネルギーレベル',
        displayType: 'number',
        min: 1,
        max: 5,
      },
      note: {
        type: 'string',
        label: 'メモ',
        displayType: 'text',
      },
    },
  },
  {
    name: '読書',
    description: '読んだ本やページ数の記録',
    schema: {
      bookTitle: {
        type: 'string',
        label: '書籍名',
        displayType: 'text',
        required: true,
      },
      pagesRead: {
        type: 'number',
        label: 'ページ数',
        displayType: 'number',
        unit: 'ページ',
        min: 0,
      },
      note: {
        type: 'string',
        label: '感想・メモ',
        displayType: 'text',
      },
    },
  },
  {
    name: '学習',
    description: '学習内容や時間の記録',
    schema: {
      subject: {
        type: 'string',
        label: '学習科目',
        displayType: 'text',
        required: true,
      },
      duration: {
        type: 'number',
        label: '学習時間',
        displayType: 'number',
        unit: '時間',
        min: 0,
      },
      note: {
        type: 'string',
        label: 'メモ',
        displayType: 'text',
      },
    },
  },
  {
    name: '仕事',
    description: '仕事の活動記録',
    schema: {
      project: {
        type: 'string',
        label: 'プロジェクト',
        displayType: 'text',
      },
      activity: {
        type: 'string',
        label: '活動内容',
        displayType: 'text',
        required: true,
      },
      duration: {
        type: 'number',
        label: '作業時間',
        displayType: 'number',
        unit: '時間',
        min: 0,
      },
    },
  },
  {
    name: '支出',
    description: '日々の支出記録',
    schema: {
      item: {
        type: 'string',
        label: '品目',
        displayType: 'text',
        required: true,
      },
      amount: {
        type: 'number',
        label: '金額',
        displayType: 'number',
        unit: '円',
        min: 0,
      },
      expenseCategory: {
        type: 'string',
        label: '支出カテゴリ',
        displayType: 'text',
      },
    },
  },
  {
    name: 'ジャーナリング',
    description: '日々の思考や出来事を自由に記録',
    schema: {
      content: {
        type: 'string',
        label: '内容',
        displayType: 'text',
        required: true,
      },
      mood: {
        type: 'string',
        label: '気分',
        displayType: 'enum',
        enum: ['positive', 'neutral', 'negative'],
      },
    },
  },
  {
    name: 'プログラミング',
    description: 'プログラミング活動の記録',
    schema: {
      activity: {
        type: 'string',
        label: '活動内容',
        displayType: 'text',
        required: true,
      },
      project: {
        type: 'string',
        label: 'プロジェクト',
        displayType: 'text',
      },
      duration: {
        type: 'number',
        label: '作業時間',
        displayType: 'number',
        unit: '時間',
        min: 0,
      },
      language: {
        type: 'string',
        label: '言語/技術',
        displayType: 'text',
      },
    },
  },
  {
    name: '一般',
    description: '特定のカテゴリに属さない汎用的なログ',
    schema: {
      content: {
        type: 'string',
        label: '内容',
        displayType: 'text',
        required: true,
      },
      note: {
        type: 'string',
        label: 'メモ',
        displayType: 'text',
      },
    },
  },
]

async function main() {
  console.log('🌱 LifeOS シードデータの投入を開始します...')

  for (const category of defaultCategories) {
    try {
      const existing = await prisma.lifeOSCategory.findUnique({
        where: {name: category.name},
      })

      if (existing) {
        // 既存のカテゴリを更新
        await prisma.lifeOSCategory.update({
          where: {name: category.name},
          data: {
            description: category.description,
            schema: category.schema as any,
          },
        })
        console.log(`✓ カテゴリ「${category.name}」を更新しました`)
      } else {
        // 新規カテゴリを作成
        await prisma.lifeOSCategory.create({
          data: {
            name: category.name,
            description: category.description,
            schema: category.schema as any,
          },
        })
        console.log(`✓ カテゴリ「${category.name}」を作成しました`)
      }
    } catch (error) {
      console.error(`✗ カテゴリ「${category.name}」の処理に失敗:`, error)
    }
  }

  console.log('🎉 LifeOS シードデータの投入が完了しました')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
