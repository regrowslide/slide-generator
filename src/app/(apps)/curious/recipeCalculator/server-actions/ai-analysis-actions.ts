'use server'

import {findIngredientByFuzzyName} from './ingredient-master-actions'
import {
  createRecipe,
  addRecipeIngredient,
  updateRecipe,
  recalculateRecipeCosts,
  type RecipeWithIngredients,
} from './recipe-actions'

// AI解析結果の型
export interface ParsedIngredient {
  name: string
  amount: number
  unit: string
}

export interface AiAnalysisResult {
  recipeName: string
  ingredients: ParsedIngredient[]
}

// AIプロバイダーの型
export type AiProvider = 'openai' | 'gemini'

// 共通のプロンプト
const IMAGE_ANALYSIS_PROMPT = `この画像からレシピ名と材料リストを抽出してください。

以下のJSON形式で返してください:
{
  "recipeName": "レシピ名",
  "ingredients": [
    {"name": "材料名", "amount": 数値, "unit": "単位(g/kg/ml/l/cc)"}
  ]
}

注意:
- 数値は必ず数値型で返してください
- 単位は可能な限りg, kg, ml, l, ccのいずれかに正規化してください
- 読み取れない場合は推測せず、読み取れた情報のみ返してください
- 材料名は日本語で返してください`

// OpenAI APIでレシピテキストを解析
export const analyzeRecipeText = async (text: string): Promise<AiAnalysisResult> => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEYが設定されていません')
  }

  const prompt = `以下のレシピテキストから、レシピ名と材料リストを抽出してください。

レシピテキスト:
${text}

以下のJSON形式で返してください:
{
  "recipeName": "レシピ名",
  "ingredients": [
    {"name": "材料名", "amount": 数値, "unit": "単位(g/kg/ml/l/cc)"}
  ]
}

注意:
- 数値は必ず数値型で返してください
- 単位は可能な限りg, kg, ml, l, ccのいずれかに正規化してください
- 材料名は簡潔に（「国産」「新鮮」などの修飾語は元のまま含める）`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{role: 'user', content: prompt}],
      temperature: 0,
      response_format: {type: 'json_object'},
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenAI API error: ${errorText}`)
  }

  const data = await response.json()

  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('OpenAI APIからの応答が空です')
  }

  return JSON.parse(content) as AiAnalysisResult
}

// OpenAI APIでレシピ画像を解析（Vision API）
const analyzeRecipeImageWithOpenAI = async (imageBase64: string): Promise<AiAnalysisResult> => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEYが設定されていません')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: IMAGE_ANALYSIS_PROMPT,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
                detail: 'high', // 高精細モード
              },
            },
          ],
        },
      ],
      temperature: 0,
      max_tokens: 4000,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenAI Vision API error: ${errorText}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('OpenAI APIからの応答が空です')
  }

  // JSONを抽出（マークダウンコードブロック対応）
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/)
  const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content

  return JSON.parse(jsonStr) as AiAnalysisResult
}

// Gemini APIでレシピ画像を解析
const analyzeRecipeImageWithGemini = async (imageBase64: string): Promise<AiAnalysisResult> => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEYが設定されていません')
  }

  // Base64データからprefixを除去
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
  const mimeType = imageBase64.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/png'

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {text: IMAGE_ANALYSIS_PROMPT},
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 4000,
          responseMimeType: 'application/json',
        },
      }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini API error: ${errorText}`)
  }

  const data = await response.json()
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!content) {
    throw new Error('Gemini APIからの応答が空です')
  }

  // JSONを抽出（マークダウンコードブロック対応）
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/)
  const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content

  return JSON.parse(jsonStr) as AiAnalysisResult
}

/**
 * レシピ画像を解析（プロバイダー選択可能）
 * @param imageBase64 Base64エンコードされた画像
 * @param provider AIプロバイダー（デフォルト: gemini - 日本語OCRに優れる）
 *
 * プロバイダー比較:
 * - gemini: 日本語テキスト認識に優れ、表形式データの抽出精度が高い。コスト効率が良い。
 * - openai: 汎用性が高く安定した結果を返すが、日本語OCRはGeminiに劣る場合がある。
 */
export const analyzeRecipeImage = async (imageBase64: string, provider: AiProvider = 'gemini'): Promise<AiAnalysisResult> => {
  if (provider === 'gemini') {
    return analyzeRecipeImageWithGemini(imageBase64)
  }
  return analyzeRecipeImageWithOpenAI(imageBase64)
}

// AIで一般的な食材名に変換（Web検索用）
const normalizeIngredientNameForSearch = async (ingredientName: string): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return ingredientName

  const prompt = `以下の食材名を、業務用食材の価格検索に適した一般的な名称に変換してください。

【入力】
"${ingredientName}"

【ルール】
- ブランド名、産地名、修飾語を削除（例：「北海道産有機玉ねぎ」→「玉ねぎ」）
- 部位がある場合は残す（例：「鶏むね肉」→「鶏むね肉」）
- 加工状態は残す（例：「むきエビ」→「むきエビ」）
- 調味料は一般名に（例：「特製タレ」→「醤油」のような変換はしない、そのまま）

【回答】
変換後の食材名のみを返してください（説明不要）`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          contents: [{parts: [{text: prompt}]}],
          generationConfig: {temperature: 0, maxOutputTokens: 50},
        }),
      }
    )

    if (!response.ok) return ingredientName

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    return content || ingredientName
  } catch {
    return ingredientName
  }
}

// 価格検索結果の型
export interface PriceSearchResult {
  productName: string // 検索で見つかった商品名
  productId: string | null // 商品ID（あれば）
  productUrl: string | null // 商品ページURL
  price: number // 販売価格（円）
  priceText: string // 価格表示テキスト
  weight: number | null // 重量（g）
  weightText: string | null // 重量表示テキスト
  pricePerKg: number // キロ単価（円/kg）
  source: string // 取得元（A-Price, 楽天市場, Web検索）
}

// 価格検索API呼び出し（AIで一般化した名称で検索）
export const searchIngredientPrice = async (ingredientName: string): Promise<PriceSearchResult | null> => {
  try {
    // AIで一般的な食材名に変換
    const normalizedName = await normalizeIngredientNameForSearch(ingredientName)

    const baseUrl = process.env.NEXT_PUBLIC_BASEPATH || ''
    const searchQuery = `${normalizedName} 業務用`

    const response = await fetch(`${baseUrl}/curious/api/price-search?q=${encodeURIComponent(searchQuery)}`, {
      method: 'GET',
    })

    if (!response.ok) return null

    const data = await response.json()

    if (data.success && data.product?.pricePerKg) {
      const sourceMap: Record<string, string> = {
        'a-price': 'A-Price',
        rakuten: '楽天市場',
        market: 'Web検索',
      }

      return {
        productName: data.product.name,
        productId: data.product.productId,
        productUrl: data.product.productUrl,
        price: data.product.price,
        priceText: data.product.priceText,
        weight: data.product.weight,
        weightText: data.product.weightText,
        pricePerKg: data.product.pricePerKg,
        source: sourceMap[data.source] || 'Web検索',
      }
    }

    return null
  } catch {
    return null
  }
}

// AI解析→マスタ照合→外部検索の一連のフローを実行
export const executeFullAnalysis = async (
  input: {text?: string; imageBase64?: string},
  _onProgress?: (phase: string, message: string, progress: number) => void
): Promise<RecipeWithIngredients> => {
  let analysisResult: AiAnalysisResult

  if (input.imageBase64) {
    analysisResult = await analyzeRecipeImage(input.imageBase64)
  } else if (input.text) {
    analysisResult = await analyzeRecipeText(input.text)
  } else {
    throw new Error('テキストまたは画像を指定してください')
  }

  // レシピ作成
  const recipe = await createRecipe({
    name: analysisResult.recipeName || '解析レシピ',
    sourceType: input.imageBase64 ? 'image' : 'text',
  })

  await updateRecipe(recipe.id, {status: 'analyzing'})

  const pendingIngredients: {parsed: ParsedIngredient; index: number}[] = []

  for (let i = 0; i < analysisResult.ingredients.length; i++) {
    const parsed = analysisResult.ingredients[i]
    const masterMatch = await findIngredientByFuzzyName(parsed.name)

    if (masterMatch) {
      await addRecipeIngredient({
        recipeId: recipe.id,
        ingredientMasterId: masterMatch.id,
        name: masterMatch.name,
        originalName: parsed.name,
        amount: parsed.amount,
        unit: parsed.unit,
        pricePerKg: masterMatch.price,
        yieldRate: masterMatch.yield,
        isExternal: false,
        source: `社内マスタ`,
        status: 'done',
        matchReason: masterMatch.name === parsed.name ? '完全一致' : '表記揺れ照合',
      })
    } else {
      await addRecipeIngredient({
        recipeId: recipe.id,
        ingredientMasterId: null,
        name: parsed.name,
        originalName: parsed.name,
        amount: parsed.amount,
        unit: parsed.unit,
        pricePerKg: 0,
        yieldRate: 100,
        isExternal: false,
        source: '未登録',
        status: 'pending',
      })
      pendingIngredients.push({parsed, index: i})
    }
  }

  // 外部検索
  if (pendingIngredients.length > 0) {
    const {getRecipe, updateRecipeIngredient} = await import('./recipe-actions')
    const latestRecipe = await getRecipe(recipe.id)

    for (const {parsed} of pendingIngredients) {
      const priceResult = await searchIngredientPrice(parsed.name)

      const ingredient = latestRecipe?.RcRecipeIngredient.find(
        ing => ing.originalName === parsed.name && ing.status === 'pending'
      )

      if (ingredient) {
        if (priceResult) {
          await updateRecipeIngredient(ingredient.id, {
            pricePerKg: priceResult.price,
            isExternal: true,
            source: priceResult.source,
            status: 'done',
          })
        } else {
          await updateRecipeIngredient(ingredient.id, {
            status: 'error',
            source: '価格未取得',
          })
        }
      }
    }
  }

  const finalRecipe = await recalculateRecipeCosts(recipe.id)
  await updateRecipe(recipe.id, {status: 'completed'})

  return finalRecipe!
}
