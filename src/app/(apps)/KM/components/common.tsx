'use client'

import { Contact } from '@app/(apps)/KM/components/Contact'

import { Services } from '@app/(apps)/KM/components/Services'
import { Works } from '@app/(apps)/KM/components/Works'


import useWindowSize from '@cm/hooks/useWindowSize'
import { cl } from '@cm/lib/methods/common'
import { Button } from '@cm/components/styles/common-components/Button'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { useCallback, useState } from 'react'

export const EasyProfile = ({ kaizenClient, works }) => {
  return (
    <C_Stack id="EasyProfile" className={`mx-auto  items-center gap-[80px] `}>
      <div className={`w-full`}>
        {getFirstLayerMenus({
          kaizenClient,
          works,
        }).map((fMenu, i) => {
          return (
            <div id={fMenu.id} key={i} className={`  relative pb-[240px] shadow-md `}>
              <h2 className={`bg-primary-main sticky top-0 z-20 m-0 p-2 text-2xl text-white`}>{fMenu.label}</h2>
              <div className={``}> {fMenu.component}</div>
            </div>
          )
        })}
      </div>

      <TableOfContents
        {...{
          firstLayerMenus: getFirstLayerMenus({
            kaizenClient,
            works,
          }),
        }}
      />
    </C_Stack>
  )
}

export const getFirstLayerMenus = ({ kaizenClient, works }) => {
  return [
    {
      id: 'mainActivity',
      label: 'お仕事',
      component: <Services {...{ kaizenClient }} />,
      kaizenClient,
      works,

    },
    { id: 'works', label: '実績・制作物', component: <Works works={works} /> },
    { id: 'works', label: 'お問い合わせ', component: <Contact /> },
  ]
}



export const TableOfContents = ({ firstLayerMenus }) => {
  const [showMenuInSP, setshowMenuInSP] = useState(false)
  const { device } = useWindowSize()

  const scrollToElement = useCallback(id => {
    const element = document?.getElementById(id)
    element?.scrollIntoView?.({ behavior: 'smooth' })
  }, [])

  const renderContents = () => {
    return (
      <section className={`bg-kaizen-cool-light z-100 rounded-md p-4  shadow-md   `}>
        <div>
          <h3>Contents</h3>
          <div onClick={() => scrollToElement('introduction')} className={` underline underline-offset-2`}>
            <R_Stack className={` items-start`}>
              <span>{'改善マニアとは？'}</span>
            </R_Stack>
          </div>
          <C_Stack>
            {firstLayerMenus.map((fisrtLayerMenu, i) => {
              return (
                <div key={i}>
                  <div
                    onClick={() => scrollToElement(fisrtLayerMenu.id)}
                    // href={`#${fisrtLayerMenu.id}`}
                    className={` underline underline-offset-2`}
                  >
                    <R_Stack className={` items-start`}>
                      <span>{i + 1}.</span>
                      <span>{fisrtLayerMenu.label}</span>
                    </R_Stack>
                  </div>
                  <div className={`ml-4`}>
                    {fisrtLayerMenu?.secondLayerMenus?.map((secondLayerMenu, j) => {
                      return (
                        <div
                          key={j}
                          onClick={() => scrollToElement(secondLayerMenu.id)}
                          // href={`#${secondLayerMenu.id}`}
                          className={` underline underline-offset-2`}
                        >
                          <R_Stack className={` items-start`}>
                            <span>{j + 1}.</span>
                            <span>{secondLayerMenu.label}</span>
                          </R_Stack>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </C_Stack>
        </div>
      </section>
    )
  }

  if (device.SP) {
    return (
      <div className={`z-50`}>
        <Button onClick={() => setshowMenuInSP(prev => !prev)} className={cl(`fixed bottom-6 right-2 z-10 p-1 `)}>
          メニュー
        </Button>
        {showMenuInSP && (
          <>
            <div className="fixed inset-0 bg-black opacity-40 z-40" onClick={() => setshowMenuInSP(prev => !prev)}></div>
            <div className={`  center-x fixed top-[100px]  z-100  w-[90vw]    opacity-100 `}>
              <div>{renderContents()}</div>
            </div>
          </>
        )}
      </div>
    )
  } else {
    return (
      <div className={`fixed bottom-[50px] right-[30px] z-50 opacity-60    duration-300 hover:opacity-100`}>
        {renderContents()}
      </div>
    )
  }
}
