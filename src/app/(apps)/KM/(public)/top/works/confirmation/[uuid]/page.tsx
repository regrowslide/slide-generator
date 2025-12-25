import { WorkCard } from '@app/(apps)/KM/(public)/top/WorkCard'
import { ConfirmationForm } from '@app/(apps)/KM/(public)/top/works/confirmation/[uuid]/ConfirmationForm'
import { Kaizen } from '@app/(apps)/KM/class/Kaizen'
import { Partner } from '@app/(apps)/KM/components/Partner'

import prisma from 'src/lib/prisma'
import { Alert } from '@cm/components/styles/common-components/Alert'
import { CenterScreen, C_Stack, Padding, R_Stack } from '@cm/components/styles/common-components/common-components'
import { T_LINK } from '@cm/components/styles/common-components/links'

const WorkConfirmationPage = async props => {
  const { uuid } = await props.params
  const Work = await prisma.kaizenWork.findUnique({
    where: { uuid: String(uuid) },
    include: {
      KaizenWorkImage: {},
      KaizenClient: {},
    },
  })
  if (Work?.isPublic) {
    return (
      <CenterScreen>
        <C_Stack>
          <p>
            ご承認いただいた内容は<T_LINK href="/">こちらのページ</T_LINK>にて、公開させていただいております。
          </p>
          <p>今後とも、よろしくお願いいたします。</p>
        </C_Stack>
      </CenterScreen>
    )
  }

  return (
    <Padding className={`mx-auto w-fit py-10`}>
      <C_Stack className={` mx-auto  mt-10 w-fit   justify-center gap-0  gap-y-20`}>
        <section className={`   max-w-[700px] p-1`}>
          <R_Stack>
            <strong className={` text-kaizen-cool-main text-2xl`}>ご挨拶</strong>
          </R_Stack>
          <div>
            <C_Stack className={`  gap-10`}>
              <p>いつも大変お世話になっております。</p>
              <p>このたびは、ご依頼内容について、HPで掲載許可をいただき、ありがとうございます。</p>
              <p>実績紹介のページにて、下記の通りご紹介をさせていただきたく、ご確認をお願い申し上げます。</p>
              <p>
                ロゴマーク、文言、画像などをご確認後、<strong>承認 / 差し戻し ボタン</strong>
                から送信をお願いいたします。
              </p>
              <Alert>
                <C_Stack>
                  <div>
                    <strong>承認いただく場合: </strong>
                    <span>即座にHPに反映されます。</span>
                  </div>
                  <div>
                    <strong>差し戻しの場合:</strong>
                    <span>再度内容を修正後に、ご確認いたします。</span>
                  </div>
                </C_Stack>
              </Alert>
              <p>今後とも末長くお付き合いさせていただければと思います。何卒よろしくお願い申し上げます。</p>
              <div className={`flex w-full justify-end p-1`}>{Kaizen.KaizenManiaIcon}</div>
            </C_Stack>
          </div>
        </section>

        <section className={`   max-w-[700px] p-1`}>
          <strong className={` text-kaizen-cool-main text-2xl`}>掲載予定の内容</strong>
          <C_Stack className={`gap-10`}>
            <div>
              <C_Stack className={` gap-4`}>
                <h2>実績紹介画面</h2>
                <small>
                  開発したツールのご紹介をさせていただきます。画像掲載不許可の場合は、「一般的な説明」としてシステムフローを説明する図を作成し、掲載いたします。
                </small>

                <WorkCard {...{ work: Work as any }}></WorkCard>
              </C_Stack>
            </div>
            <div>P
              <C_Stack className={`gap-4`}>
                <h2>お客様紹介画面</h2>
                <small>事業者様向けのシステム開発・業務改善のご支援実績として掲載させていただきます</small>
                <Partner {...{ p: Work?.KaizenClient, index: 0 }}></Partner>
              </C_Stack>
            </div>
          </C_Stack>
        </section>
        <section className={`  p-1`}>
          <div className={`w-fit`}>
            <strong className={` text-kaizen-cool-main text-2xl`}>承認フォーム</strong>
            <ConfirmationForm work={Work} />
          </div>
        </section>
      </C_Stack>
    </Padding>
  )
}

export default WorkConfirmationPage
