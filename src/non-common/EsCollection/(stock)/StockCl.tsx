import { NumHandler } from '@cm/class/NumHandler'
import { Stock, StockHistory } from '@prisma/generated/prisma/client'

import { getStockConfig } from 'src/non-common/EsCollection/(stock)/getStockConfig'

type stockData = Stock & {
  StockHistory: StockHistory[]
}

export class StockCl {
  data: stockData
  config: Awaited<ReturnType<typeof getStockConfig>>
  // barometerCols: ReturnType<typeof getBarometerCols>
  constructor(stock: stockData, config) {
    this.data = stock
    this.config = config
    // this.barometerCols = getBarometerCols({config})
  }

  static getBarometerObject(config) {
    const thresholdPercent = config['上昇閾値']
    const riseWindowSize = config['上昇期間']
    const crashWindowSize = config['クラッシュ期間']
    const shortMA = config['短期移動平均'] || 5 // デフォルト5日
    const longMA = config['長期移動平均'] || 25 // デフォルト25日
    const rsiPeriod = config['RSI期間'] || 14 // デフォルト14日
    const rsiOversoldThreshold = config['RSI売られすぎ閾値'] || 30 // デフォルト30
    const macdFastPeriod = config?.['MACD短期'] || 12 // デフォルト12日
    const macdSlowPeriod = config?.['MACD長期'] || 26 // デフォルト26日
    const macdSignalPeriod = config?.['MACDシグナル'] || 9 // デフォルト9日

    const barometerCols = {
      // 【最高効果】価格と出来高の組み合わせ - 最も信頼性が高い
      priceVolumeBreakout: {
        id: 'priceVolumeBreakout',
        label: '価格・出来高同時ブレイクアウト',
        description: `【価格・出来高同時ブレイクアウト】高値ブレイクアウトと出来高ブレイクアウトが同時に発生した場合に判定します。価格と出来高の両方が急上昇することで、より信頼性の高い上昇シグナルとなります。`,
        func(stockClThis) {
          const takaneResult = barometerCols.takaneBreakout.func(stockClThis)
          const volumeResult = barometerCols.volumeBreakout.func(stockClThis)
          return takaneResult && volumeResult
        },
      },

      // 【高効果】出来高を伴った上昇 - 機関投資家の参入を示唆
      dekidakaJosho: {
        id: 'dekidakaJosho',
        label: '急上',
        description: `【出来高急増上昇】当日の終値が前日終値より${thresholdPercent}%以上上昇し、かつ出来高（取引量）が前日比で50%以上増加している場合に判定します。多くの投資家が注目し、実際に多く取引されている"勢いのある上昇"を検知します。出来高の増加は、上昇の信頼性を高める要素です。`,
        func(stockClThis) {
          const volumeThreshold = 50
          const latest = stockClThis.latest
          const previous = stockClThis.previous

          if (!latest?.Close || !previous?.Close || !latest?.Volume || !previous?.Volume) return false

          const priceRise = ((latest.Close - previous.Close) / previous.Close) * 100
          const volumeRise = ((latest.Volume - previous.Volume) / previous.Volume) * 100
          return priceRise >= thresholdPercent && volumeRise >= volumeThreshold
        },
      },

      // 【高効果】ゴールデンクロス - 最も有名で信頼性の高いテクニカル指標
      goldenCross: {
        id: 'goldenCross',
        label: 'ゴールデンクロス',
        description: `【ゴールデンクロス】短期移動平均線（${shortMA}日）が長期移動平均線（${longMA}日）を下から上に突き抜けた場合に判定します。これは上昇トレンドへの転換点とされ、買いシグナルとして多くの投資家に注目されています。移動平均線は株価の平均値を滑らかにした線で、トレンドの把握に役立ちます。`,
        func(stockClThis) {
          const previousList = stockClThis.PrevListDesc
          if (previousList.length < longMA + 1) return false

          // 今日の移動平均線
          const shortMAToday = previousList.slice(0, shortMA).reduce((sum, d) => sum + (d.Close ?? 0), 0) / shortMA

          const longMAToday = previousList.slice(0, longMA).reduce((sum, d) => sum + (d.Close ?? 0), 0) / longMA

          // 昨日の移動平均線
          const shortMAYesterday = previousList.slice(1, shortMA + 1).reduce((sum, d) => sum + (d.Close ?? 0), 0) / shortMA

          const longMAYesterday = previousList.slice(1, longMA + 1).reduce((sum, d) => sum + (d.Close ?? 0), 0) / longMA

          // ゴールデンクロス判定: 昨日は短期 < 長期、今日は短期 > 長期
          return shortMAYesterday < longMAYesterday && shortMAToday > longMAToday
        },
      },

      // 【高効果】高値ブレイクアウト - トレンド転換の強いシグナル
      takaneBreakout: {
        id: 'takaneBreakout',
        label: '高値ブレイクアウト',
        description: `【高値ブレイクアウト】当日の高値が、過去${riseWindowSize}日間の中で最も高かった値（高値）を上回った場合に判定します。これは、株価が新たな上昇局面に入ったサインとされ、トレンド転換や強い買い圧力の発生を示唆します。`,
        func(stockClThis) {
          const latest = stockClThis.latest
          const previousList = stockClThis.PrevListDesc
          if (previousList.length < riseWindowSize + 1) return false

          // 最新日を除く過去riseWindowSize日間の最高値を取得
          const maxHigh = Math.max(...previousList.slice(1, riseWindowSize + 1).map(d => d.High ?? 0))
          return (latest?.High ?? 0) > maxHigh
        },
      },

      // 【高効果】MACD強気シグナル - 早期トレンド転換検知
      macdBullish: {
        id: 'macdBullish',
        label: 'MACD強気',
        description: `【MACD強気シグナル】MACD（移動平均収束拡散法）は、短期EMA（${macdFastPeriod}日）と長期EMA（${macdSlowPeriod}日）の差（MACDライン）と、その${macdSignalPeriod}日移動平均（シグナルライン）を比較するテクニカル指標です。MACDラインがシグナルラインを下から上に突き抜けた場合（ゴールデンクロス）、買いシグナルとして判定します。トレンド転換の早期発見に有効で、移動平均線よりも敏感に反応します。`,
        func(stockClThis) {
          const previousList = stockClThis.PrevListDesc
          const requiredPeriod = Math.max(macdSlowPeriod, macdSignalPeriod) + 1
          if (previousList.length < requiredPeriod) return false

          // EMA計算用のヘルパー関数
          const calculateEMA = (data: number[], period: number): number[] => {
            const ema: number[] = []
            const multiplier = 2 / (period + 1)

            // 最初の値はSMAで初期化
            ema[0] = data.slice(0, period).reduce((sum, val) => sum + val, 0) / period

            // 2番目以降はEMA計算
            for (let i = 1; i < data.length; i++) {
              ema[i] = data[i] * multiplier + ema[i - 1] * (1 - multiplier)
            }

            return ema
          }

          // 終値データを古い順に並べ替え
          const closePrices = previousList
            .slice(0, requiredPeriod)
            .map(d => d.Close ?? 0)
            .reverse()

          if (closePrices.length < requiredPeriod) return false

          // 短期EMAと長期EMAを計算
          const fastEMA = calculateEMA(closePrices, macdFastPeriod)
          const slowEMA = calculateEMA(closePrices, macdSlowPeriod)

          // MACDライン = 短期EMA - 長期EMA
          const macdLine: number[] = []
          for (let i = macdSlowPeriod - 1; i < fastEMA.length; i++) {
            macdLine.push(fastEMA[i] - slowEMA[i])
          }

          if (macdLine.length < macdSignalPeriod + 1) return false

          // シグナルライン = MACDラインのEMA
          const signalLine = calculateEMA(macdLine, macdSignalPeriod)

          if (signalLine.length < 2) return false

          // 最新と前日のMACD・シグナル値
          const latestMacd = macdLine[macdLine.length - 1]
          const latestSignal = signalLine[signalLine.length - 1]
          const previousMacd = macdLine[macdLine.length - 2]
          const previousSignal = signalLine[signalLine.length - 2]

          // ゴールデンクロス判定: 前日はMACD < シグナル、今日はMACD > シグナル
          return previousMacd <= previousSignal && latestMacd > latestSignal
        },
      },

      // 【中高効果】急落後リバウンド - 逆張り投資の有効シグナル
      crashAndRebound: {
        id: 'crashAndRebound',
        label: '急落後リバウンド',
        description: `【急落後リバウンド】過去${crashWindowSize}日間で大きな下落（暴落）が発生し、その後直近で連続して株価が上昇に転じている場合に判定します。急落後の反発（リバウンド）を狙う投資戦略に有効です。`,
        func(stockClThis) {
          const previousList = stockClThis.PrevListDesc
          if (previousList.length < crashWindowSize + 2) return false

          const latest = stockClThis.latest
          if (!latest?.Close) return false

          // 直近の上昇を確認（最新日と前日）
          const isRising =
            (latest?.Close ?? 0) > (previousList[1]?.Close ?? 0) && (previousList[1]?.Close ?? 0) > (previousList[2]?.Close ?? 0)

          if (!isRising) return false

          // 過去の急落を確認
          let maxDropRate = 0
          for (let i = 2; i < Math.min(crashWindowSize + 2, previousList.length - 1); i++) {
            const curr = previousList[i]?.Close ?? 0
            const prev = previousList[i + 1]?.Close ?? 0
            if (!curr || !prev) continue

            const dropRate = ((curr - prev) / prev) * 100
            if (dropRate < maxDropRate) maxDropRate = dropRate
          }

          // 急落（負の大きな値）があり、かつ現在上昇中ならtrue
          return maxDropRate <= -Math.abs(thresholdPercent) && isRising
        },
      },

      // 【中高効果】RSI売られすぎからの反発
      rsiOversold: {
        id: 'rsiOversold',
        label: 'RSI売られすぎ',
        description: `【RSI売られすぎ】RSI（相対力指数）は、株価の上昇・下落の勢いを数値化したテクニカル指標です。${rsiPeriod}日間の値動きをもとに計算し、${rsiOversoldThreshold}以下の場合は「売られすぎ」と判定します。売られすぎの状態は、今後反発（上昇）する可能性が高いとされ、押し目買いの参考になります。`,
        func(stockClThis) {
          const previousList = stockClThis.PrevListDesc
          if (previousList.length < rsiPeriod + 1) return false

          // RSI計算用のデータ準備（最新日を含む）
          const closePrices = previousList
            .slice(0, rsiPeriod + 1)
            .map(d => d.Close ?? 0)
            .reverse()

          // 値上がり幅と値下がり幅を計算
          let gains = 0
          let losses = 0

          for (let i = 1; i < closePrices.length; i++) {
            const diff = closePrices[i] - closePrices[i - 1]
            if (diff > 0) {
              gains += diff
            } else if (diff < 0) {
              losses -= diff // 損失は正の値で計算
            }
          }

          // 平均値を計算
          const avgGain = gains / rsiPeriod
          const avgLoss = losses / rsiPeriod

          // RSI = 100 - (100 / (1 + RS)) RS = 平均上昇 / 平均下落
          let rsi = 0
          if (avgLoss > 0) {
            const rs = avgGain / avgLoss
            rsi = 100 - 100 / (1 + rs)
          } else if (avgGain > 0) {
            rsi = 100 // 下落なし、上昇のみの場合
          }

          return rsi <= rsiOversoldThreshold
        },
      },

      // 【中効果】出来高ブレイクアウト - 材料株の早期発見
      volumeBreakout: {
        id: 'volumeBreakout',
        label: '出来高ブレイクアウト',
        description: `【出来高ブレイクアウト】当日の出来高が過去${riseWindowSize}日間の平均出来高の2倍以上になった場合に判定します。出来高の急増は、重要なニュースや材料の発生、機関投資家の参入などを示唆し、株価の大きな動きの前兆となることが多いです。`,
        func(stockClThis) {
          const latest = stockClThis.latest
          const previousList = stockClThis.PrevListDesc
          if (previousList.length < riseWindowSize + 1) return false

          // 最新日を除く過去riseWindowSize日間の平均出来高を計算
          const avgVolume =
            previousList.slice(1, riseWindowSize + 1).reduce((sum, d) => sum + (d.Volume ?? 0), 0) / riseWindowSize
          return (latest?.Volume ?? 0) >= avgVolume * 2
        },
      },

      // 【中効果】連続上昇 - トレンドの継続性を示す
      renzokuJosho: {
        id: 'renzokuJosho',
        label: '連続上',
        description: `【連続上昇】過去${riseWindowSize}日間、毎日終値が前日より高い（連続して上昇している）場合に判定します。連続陽線や連騰と呼ばれ、強い上昇トレンドにある銘柄を見つけるのに役立ちます。`,
        func(stockClThis) {
          const previousList = stockClThis.PrevListDesc
          if (previousList.length < riseWindowSize) return false

          // 過去riseWindowSize日間で連続して上昇しているか確認
          for (let i = 0; i < riseWindowSize - 1; i++) {
            const today = previousList[i]
            const yesterday = previousList[i + 1]

            if (!yesterday?.Close || !today?.Close) return false

            if (today.Close <= yesterday.Close) {
              return false
            }
          }

          return true
        },
      },

      // 【中効果】連続陽線 - 買い圧力の強さを示す
      consecutivePositiveCloses: {
        id: 'consecutivePositiveCloses',
        label: '連続陽線',
        description: `【連続陽線】${riseWindowSize}日連続で終値が始値を上回る（陽線）場合に判定します。陽線が続くことは、買い圧力が強いことを示し、上昇トレンドの継続や新たなトレンド発生のサインとなります。`,
        func(stockClThis) {
          const previousList = stockClThis.PrevListDesc
          if (previousList.length < riseWindowSize) return false

          // 最新日から指定日数分のデータで判定
          for (let i = 0; i < riseWindowSize; i++) {
            const data = previousList[i]
            // 終値 > 始値でない（陽線でない）場合はfalse
            if ((data?.Close ?? 0) <= (data?.Open ?? 0)) {
              return false
            }
          }

          return true
        },
      },

      // 【中効果】レジスタンス突破 - 強い上昇への転換点
      resistanceBreak: {
        id: 'resistanceBreak',
        label: 'レジスタンス突破',
        description: `【レジスタンス突破】過去${riseWindowSize}日間の高値付近（レジスタンスライン）を明確に突破した場合に判定します。抵抗線の突破は、新たな上昇局面への転換点となることが多く、強い買いシグナルとされます。`,
        func(stockClThis) {
          const previousList = stockClThis.PrevListDesc
          if (previousList.length < riseWindowSize + 1) return false

          const latest = stockClThis.latest
          if (!latest?.High) return false

          // 過去の高値を取得（最新日は除く）
          const pastHighs = previousList.slice(1, riseWindowSize + 1).map(d => d.High ?? 0)
          const maxHigh = Math.max(...pastHighs)

          // 当日高値が過去の最高値を3%以上上回る
          return latest.High > maxHigh * 1.03
        },
      },

      // 【中効果】サポート反発 - 下値の堅さを確認
      supportBounce: {
        id: 'supportBounce',
        label: 'サポート反発',
        description: `【サポート反発】過去${riseWindowSize}日間の安値付近（±2%以内）で株価が反発した場合に判定します。サポートライン（支持線）からの反発は、下値の堅さを示し、上昇転換のサインとなることがあります。`,
        func(stockClThis) {
          const previousList = stockClThis.PrevListDesc
          if (previousList.length < riseWindowSize + 2) return false

          const latest = stockClThis.latest
          const previous = stockClThis.previous
          if (!latest?.Close || !previous?.Close || !latest?.Low) return false

          // 過去の安値を取得
          const pastLows = previousList.slice(2, riseWindowSize + 2).map(d => d.Low ?? 0)
          const minLow = Math.min(...pastLows)

          // 当日安値がサポート付近（±2%）で、終値が前日より上昇
          const isNearSupport = Math.abs((latest.Low - minLow) / minLow) <= 0.02
          const isPriceRising = latest.Close > previous.Close

          return isNearSupport && isPriceRising
        },
      },

      // 【基本効果】単純上昇 - 基本的だが重要な指標
      josho: {
        id: 'josho',
        label: '単純上',
        description: `【単純上昇】前日終値と当日終値を比較し、当日終値が前日終値より${thresholdPercent}%以上上昇しているかを判定します。株価が短期間で大きく上昇した銘柄を見つけるためのシンプルな指標です。短期的な値動きの強さを知りたいときに役立ちます。`,
        func(stockClThis) {
          const latest = stockClThis.latest
          const previous = stockClThis.previous
          if (!latest?.Close || !previous?.Close) return false

          const risePercent = ((latest.Close - previous.Close) / previous.Close) * 100
          return risePercent >= thresholdPercent
        },
      },

      // 【基本効果】移動平均乖離上昇
      idoHeikinKairiJosho: {
        id: 'idoHeikinKairiJosho',
        label: '移動平均乖離上昇',
        description: `【移動平均乖離上昇】当日の終値が、過去${riseWindowSize}日間の終値平均（移動平均）より${thresholdPercent}%以上上昇している場合に判定します。移動平均線から大きく上に乖離している場合は、短期的な過熱感や強い買い圧力を示します。`,
        func(stockClThis) {
          const latest = stockClThis.latest
          const previousList = stockClThis.PrevListDesc
          if (previousList.length < riseWindowSize + 1) return false

          // 最新日を除く過去riseWindowSize日間の平均を計算
          const avg = previousList.slice(1, riseWindowSize + 1).reduce((sum, d) => sum + (d.Close ?? 0), 0) / riseWindowSize
          const deviation = (((latest?.Close ?? 0) - avg) / avg) * 100
          return deviation >= thresholdPercent
        },
      },

      // 【特殊効果】スパイク上昇 - 急激な値動きでの上昇
      spikeRise: {
        id: 'spikeRise',
        label: 'スパイク上昇',
        description: `【スパイク上昇】ボラティリティ（値幅）が急拡大し、かつ株価が上昇傾向（単純上昇）である場合に判定します。大きな値動きとともに上昇しているため、強い買い圧力や新たなトレンド発生の可能性があります。`,
        func(stockClThis) {
          const spikeResult = barometerCols.spike.func(stockClThis)
          const joshoResult = barometerCols.josho.func(stockClThis)
          return spikeResult && joshoResult
        },
      },

      // 【特殊効果】低ボラティリティ - 次の大きな動きへの準備
      lowVolatility: {
        id: 'lowVolatility',
        label: '低ボラティリティ',
        description: `【低ボラティリティ】過去${riseWindowSize}日間の値幅（高値-安値）の平均が、それ以前の期間と比較して小さくなっている場合に判定します。値動きが小さくなることで、次の大きな動きに備えている可能性があります。`,
        func(stockClThis) {
          const previousList = stockClThis.PrevListDesc
          if (previousList.length < riseWindowSize * 2) return false

          // 直近期間の平均値幅
          const recentAvgRange =
            previousList.slice(0, riseWindowSize).reduce((sum, d) => sum + (d.High ?? 0) - (d.Low ?? 0), 0) / riseWindowSize

          // 前期間の平均値幅
          const previousAvgRange =
            previousList.slice(riseWindowSize, riseWindowSize * 2).reduce((sum, d) => sum + (d.High ?? 0) - (d.Low ?? 0), 0) /
            riseWindowSize

          // 直近の値幅が前期間の70%以下なら低ボラティリティ
          return recentAvgRange <= previousAvgRange * 0.7
        },
      },

      // 【基本指標】スパイク - ボラティリティ急拡大の検知
      spike: {
        id: 'spike',
        label: 'スパイク',
        description: `【ボラティリティ急拡大】当日の値幅（高値-安値）が、過去${riseWindowSize}日間の平均値幅より${thresholdPercent}倍以上大きくなった場合に判定します。値動きが急激に大きくなった（ボラティリティが高まった）局面を検知します。急な材料やイベント発生時に多く見られます。`,
        func(stockClThis) {
          const latest = stockClThis.latest
          const previousList = stockClThis.PrevListDesc
          if (previousList.length < riseWindowSize + 1) return false

          // 最新日を除く過去riseWindowSize日間の平均値幅を計算
          const avgRange =
            previousList.slice(1, riseWindowSize + 1).reduce((sum, d) => sum + (d.High ?? 0) - (d.Low ?? 0), 0) / riseWindowSize
          const todayRange = (latest?.High ?? 0) - (latest?.Low ?? 0)
          return todayRange >= avgRange * thresholdPercent
        },
      },

      // === 以下、警告・リスク管理系指標 ===

      // 【警告】暴落検知 - リスク管理用
      recentCrash: {
        id: 'recentCrash',
        label: '暴落',
        description: `【暴落】過去${crashWindowSize}日間の中で最も高かった終値から、当日の終値が${thresholdPercent}%以上下落している場合に判定します。大きな下落（急落）が発生した銘柄を検知します。リスク管理やリバウンド狙いの参考になります。`,
        func(stockClThis) {
          const previousList = stockClThis.PrevListDesc
          if (previousList.length < crashWindowSize) return false

          const latest = stockClThis.latest
          if (!latest?.Close) return false

          // crashWindowSize期間内の最高値を取得
          const periodHighest = Math.max(...previousList.slice(0, crashWindowSize).map(d => d.Close ?? 0))

          // 最高値からの下落率を計算
          const dropRate = ((latest.Close - periodHighest) / periodHighest) * 100

          // 下落率が閾値以下（より大きな負の値）ならtrue
          return dropRate <= -Math.abs(thresholdPercent)
        },
      },

      // 【警告】RSI買われすぎ - 利益確定の参考
      rsiOverbought: {
        id: 'rsiOverbought',
        label: 'RSI買われすぎ',
        description: `【RSI買われすぎ】RSI（相対力指数）が70以上の場合は「買われすぎ」と判定します。買われすぎの状態は、今後調整（下落）する可能性が高いとされ、利益確定や新規買いを控える参考になります。`,
        func(stockClThis) {
          const previousList = stockClThis.PrevListDesc
          if (previousList.length < rsiPeriod + 1) return false

          // RSI計算（rsiOversoldと同じロジック）
          const closePrices = previousList
            .slice(0, rsiPeriod + 1)
            .map(d => d.Close ?? 0)
            .reverse()

          let gains = 0
          let losses = 0

          for (let i = 1; i < closePrices.length; i++) {
            const diff = closePrices[i] - closePrices[i - 1]
            if (diff > 0) {
              gains += diff
            } else if (diff < 0) {
              losses -= diff
            }
          }

          const avgGain = gains / rsiPeriod
          const avgLoss = losses / rsiPeriod

          let rsi = 0
          if (avgLoss > 0) {
            const rs = avgGain / avgLoss
            rsi = 100 - 100 / (1 + rs)
          } else if (avgGain > 0) {
            rsi = 100
          }

          return rsi >= 70 // 買われすぎ閾値
        },
      },

      // 【警告】デッドクロス - 売りシグナル
      deathCross: {
        id: 'deathCross',
        label: 'デッドクロス',
        description: `【デッドクロス】短期移動平均線（${shortMA}日）が長期移動平均線（${longMA}日）を上から下に突き抜けた場合に判定します。これは下降トレンドへの転換点とされ、売りシグナルとして注意が必要です。ゴールデンクロスの逆パターンです。`,
        func(stockClThis) {
          const previousList = stockClThis.PrevListDesc
          if (previousList.length < longMA + 1) return false

          // 今日の移動平均線
          const shortMAToday = previousList.slice(0, shortMA).reduce((sum, d) => sum + (d.Close ?? 0), 0) / shortMA
          const longMAToday = previousList.slice(0, longMA).reduce((sum, d) => sum + (d.Close ?? 0), 0) / longMA

          // 昨日の移動平均線
          const shortMAYesterday = previousList.slice(1, shortMA + 1).reduce((sum, d) => sum + (d.Close ?? 0), 0) / shortMA
          const longMAYesterday = previousList.slice(1, longMA + 1).reduce((sum, d) => sum + (d.Close ?? 0), 0) / longMA

          // デッドクロス判定: 昨日は短期 > 長期、今日は短期 < 長期
          return shortMAYesterday > longMAYesterday && shortMAToday < longMAToday
        },
      },

      // 【警告】MACD弱気シグナル - 売りシグナル
      macdBearish: {
        id: 'macdBearish',
        label: 'MACD弱気',
        description: `【MACD弱気シグナル】MACDラインがシグナルラインを上から下に突き抜けた場合（デッドクロス）、売りシグナルとして判定します。上昇トレンドの終了や下降トレンドの開始を示唆します。`,
        func(stockClThis) {
          const previousList = stockClThis.PrevListDesc
          const requiredPeriod = Math.max(macdSlowPeriod, macdSignalPeriod) + 1
          if (previousList.length < requiredPeriod) return false

          // EMA計算用のヘルパー関数（macdBullishと同じ）
          const calculateEMA = (data: number[], period: number): number[] => {
            const ema: number[] = []
            const multiplier = 2 / (period + 1)
            ema[0] = data.slice(0, period).reduce((sum, val) => sum + val, 0) / period
            for (let i = 1; i < data.length; i++) {
              ema[i] = data[i] * multiplier + ema[i - 1] * (1 - multiplier)
            }
            return ema
          }

          const closePrices = previousList
            .slice(0, requiredPeriod)
            .map(d => d.Close ?? 0)
            .reverse()

          if (closePrices.length < requiredPeriod) return false

          const fastEMA = calculateEMA(closePrices, macdFastPeriod)
          const slowEMA = calculateEMA(closePrices, macdSlowPeriod)

          const macdLine: number[] = []
          for (let i = macdSlowPeriod - 1; i < fastEMA.length; i++) {
            macdLine.push(fastEMA[i] - slowEMA[i])
          }

          if (macdLine.length < macdSignalPeriod + 1) return false

          const signalLine = calculateEMA(macdLine, macdSignalPeriod)
          if (signalLine.length < 2) return false

          const latestMacd = macdLine[macdLine.length - 1]
          const latestSignal = signalLine[signalLine.length - 1]
          const previousMacd = macdLine[macdLine.length - 2]
          const previousSignal = signalLine[signalLine.length - 2]

          // デッドクロス判定: 前日はMACD > シグナル、今日はMACD < シグナル
          return previousMacd >= previousSignal && latestMacd < latestSignal
        },
      },

      // 【警告】スパイク下降 - 注意が必要な下落
      spikeFall: {
        id: 'spikeFall',
        label: 'スパイク下降',
        description: `【スパイク下降】ボラティリティ（値幅）が急拡大し、かつ株価が下落傾向（単純上昇でない）場合に判定します。大きな値動きとともに下落しているため、注意が必要な局面です。`,
        func(stockClThis) {
          const spikeResult = barometerCols.spike.func(stockClThis)
          const joshoResult = barometerCols.josho.func(stockClThis)
          return spikeResult && !joshoResult
        },
      },
    }

    return barometerCols
  }

  get prevListAsc() {
    return this.data.StockHistory.sort((a, b) => (a?.Date?.getTime() ?? 0) - (b?.Date?.getTime() ?? 0))
  }

  get PrevListDesc() {
    return this.data.StockHistory.sort((a, b) => (b?.Date?.getTime() ?? 0) - (a?.Date?.getTime() ?? 0))
  }

  get latest() {
    return this.PrevListDesc.find(d => d.Close !== null)
  }

  get previous() {
    const omitLatest = this.PrevListDesc.filter(data => {
      return data.Close !== null && data.id !== this.latest?.id
    })

    return omitLatest.find(d => d.Close !== null)
  }

  get prices() {
    const { averageBuyPrice, heldCount } = this.data
    const latestClose = this.latest?.Close ?? 0

    const buyPriceSum = (averageBuyPrice ?? 0) * (heldCount ?? 0)
    const currentPriceSum = (latestClose ?? 0) * (heldCount ?? 0)

    return {
      currentPriceSum,
      buyPriceSum,
      profit: heldCount ? currentPriceSum - buyPriceSum : null,
    }
  }

  getLastHistory(index: number = 0): StockHistory {
    const descHistory = [...(this.data.StockHistory ?? [])].sort((a, b) => (b?.Date?.getTime() ?? 0) - (a?.Date?.getTime() ?? 0))
    return descHistory?.[index]
  }

  get riseRate(): number {
    const latest = this.latest
    const previous = this.previous

    if (!latest?.Close || !previous?.Close) return 0

    const rate = NumHandler.round(((latest.Close - previous.Close) / previous.Close) * 100, 2)
    return rate
  }

  get barometer() {
    const barometerCols = StockCl.getBarometerObject(this.config)
    const barometerObject = Object.fromEntries(
      Object.values(barometerCols).map((d: any) => {
        const id = d.id
        return [id, d.func(this)]
      })
    )

    return barometerObject
  }

  // MACD値を取得するメソッド
  getMacdValues() {
    const macdFastPeriod = this.config?.['MACD短期'] || 12
    const macdSlowPeriod = this.config?.['MACD長期'] || 26
    const macdSignalPeriod = this.config?.['MACDシグナル'] || 9

    const previousList = this.PrevListDesc
    const requiredPeriod = Math.max(macdSlowPeriod, macdSignalPeriod) + 10 // 余裕を持って多めに取得

    if (previousList.length < requiredPeriod) return null

    // EMA計算用のヘルパー関数
    const calculateEMA = (data: number[], period: number): number[] => {
      const ema: number[] = []
      const multiplier = 2 / (period + 1)

      // 最初の値はSMAで初期化
      ema[0] = data.slice(0, period).reduce((sum, val) => sum + val, 0) / period

      // 2番目以降はEMA計算
      for (let i = 1; i < data.length; i++) {
        ema[i] = data[i] * multiplier + ema[i - 1] * (1 - multiplier)
      }

      return ema
    }

    // 終値データを古い順に並べ替え
    const closePrices = previousList
      .slice(0, requiredPeriod)
      .map(d => d.Close ?? 0)
      .reverse()

    if (closePrices.length < requiredPeriod) return null

    // 短期EMAと長期EMAを計算
    const fastEMA = calculateEMA(closePrices, macdFastPeriod)
    const slowEMA = calculateEMA(closePrices, macdSlowPeriod)

    // MACDライン = 短期EMA - 長期EMA
    const macdLine: number[] = []
    for (let i = macdSlowPeriod - 1; i < fastEMA.length; i++) {
      macdLine.push(fastEMA[i] - slowEMA[i])
    }

    if (macdLine.length < macdSignalPeriod) return null

    // シグナルライン = MACDラインのEMA
    const signalLine = calculateEMA(macdLine, macdSignalPeriod)

    // ヒストグラム = MACDライン - シグナルライン
    const histogram: number[] = []
    for (let i = 0; i < Math.min(macdLine.length, signalLine.length); i++) {
      histogram.push(macdLine[i] - signalLine[i])
    }

    return {
      macdLine,
      signalLine,
      histogram,
      dates: previousList
        .slice(0, macdLine.length)
        .map(d => d.Date)
        .filter((date): date is Date => date !== null)
        .reverse(),
    }
  }

  // /**
  //  * 前日比上昇率検知
  //  * SimpleRise: 前日終値と当日終値の上昇率が閾値以上か判定
  //  */
  // get josho(): boolean {
  //   return this.barometerCols?.['josho']?.func(this) ?? false
  // }
  // get dekidakaJosho(): boolean {
  //   return this.barometerCols?.['dekidakaJosho']?.func(this) ?? false
  // }
  // get renzokuJosho(): boolean {
  //   return this.barometerCols?.['renzokuJosho']?.func(this) ?? false
  // }
  // get takaneBreakout(): boolean {
  //   return this.barometerCols?.['takaneBreakout']?.func(this) ?? false
  // }
  // get idoHeikinKairiJosho(): boolean {
  //   return this.barometerCols?.['idoHeikinKairiJosho']?.func(this) ?? false
  // }
  // get spike(): boolean {
  //   return this.barometerCols?.['spike']?.func(this) ?? false
  // }
  // get spikeRise(): boolean {
  //   return this.barometerCols?.['spikeRise']?.func(this) ?? false
  // }
  // get spikeFall(): boolean {
  //   return this.barometerCols?.['spikeFall']?.func(this) ?? false
  // }
  // get recentCrash(): boolean {
  //   return this.barometerCols?.['recentCrash']?.func(this) ?? false
  // }

  // get barometer() {
  //   const result = Object.fromEntries(
  //     Object.values(this.barometerCols).map((d: any) => {
  //       const id = d.id
  //       return [id, this[id]]
  //     })
  //   )
  //   return result
  // }
}
