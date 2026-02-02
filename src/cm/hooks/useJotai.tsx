
import { atom, useAtom } from 'jotai'
import { atomFamily } from 'jotai-family'
import { useMemo } from 'react'

export const useJotai = useAtom

export type atomKey = string

export type atomTypes = {}
type myAtomFamilyParams = { atomKey: atomKey; defaultState: any }

const myAtomFamily = atomFamily(
  (param: myAtomFamilyParams) => {
    return atom(param.defaultState)
  },
  (a, b) => a.atomKey === b.atomKey
)

export const useJotaiByKey = <S,>(atomKey: any, defaultState: any) => {
  const param = useMemo<myAtomFamilyParams>(
    () => ({
      atomKey,
      defaultState,
    }),
    [atomKey, defaultState]
  )

  const jotai = useAtom<S>(myAtomFamily(param))
  const [state, setState] = jotai

  return useMemo(() => {
    type State = S
    type SetState = (update: State | ((prev: State) => State)) => void
    return [state, setState] as [S, SetState]
  }, [state, setState])
}

export const jotai_showAwards = atom<boolean>(false)
export const jotai_masterKeyDisplayedContentsSelector = atom<boolean>(false)
export const jotai_moveStudent = atom<null | { id: number }>(null)
export const jotaiStudentGroups = atom<any[] | null>(null)

export const jotai_pdfPages = atom<Blob[]>([])
export const jotai_pdfImages = atom<string[]>([])
