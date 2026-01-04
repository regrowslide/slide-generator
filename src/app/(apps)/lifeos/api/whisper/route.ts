import {NextRequest, NextResponse} from 'next/server'
import OpenAI from 'openai'

/**
 * Whisper API Route Handler
 * 音声ファイルをテキストに変換（ストリーミング対応）
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json(
        {
          success: false,
          error: '音声ファイルが必要です',
        },
        {status: 400}
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'OPENAI_API_KEY環境変数が設定されていません',
        },
        {status: 500}
      )
    }

    const openai = new OpenAI({apiKey})

    // FileオブジェクトをFileLikeオブジェクトに変換
    // OpenAI SDKはFileオブジェクトを直接受け取れるが、Next.jsのFormDataから取得したFileを確実に処理するため
    const fileBuffer = await audioFile.arrayBuffer()
    const fileBlob = new Blob([fileBuffer], {type: audioFile.type})

    // FileLikeオブジェクトを作成（nameプロパティが必要）
    const fileLike = new File([fileBlob], audioFile.name || 'recording.webm', {
      type: audioFile.type || 'audio/webm',
    })

    // Whisper APIを呼び出し
    const transcription = await openai.audio.transcriptions.create({
      file: fileLike,
      model: 'whisper-1',
      language: 'ja', // 日本語を指定
      response_format: 'json',
    })

    return NextResponse.json({
      success: true,
      text: transcription.text,
    })
  } catch (error) {
    console.error('Whisper API エラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}
