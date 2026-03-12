'use client'

import { R_Stack } from '@cm/components/styles/common-components/common-components'
import { authClient } from 'src/lib/auth-client'

export const LineLoginButton = ({ callbackUrl }: { callbackUrl: string }) => {
  return (
    <button
      className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#06C755] px-4 py-3 font-medium text-white shadow-sm transition hover:bg-[#05b34c] cursor-pointer"
      onClick={async () => {
        await authClient.signIn.social({
          provider: 'line',
          callbackURL: callbackUrl,
        })
      }}
    >
      <R_Stack className="gap-2">
        <LineIcon />
        <span>LINEでログイン</span>
      </R_Stack>
    </button>
  )
}

const LineIcon = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C6.48 2 2 5.81 2 10.5c0 4.01 3.16 7.38 7.43 8.21.29.06.68.19.78.44.09.22.06.57.03.8l-.13.76c-.04.22-.17.87.76.47.93-.39 5.02-2.96 6.85-5.07C19.73 13.82 22 12.33 22 10.5 22 5.81 17.52 2 12 2zm-3.5 11h-2a.5.5 0 01-.5-.5v-4a.5.5 0 011 0V12h1.5a.5.5 0 010 1zm1.5-.5a.5.5 0 01-1 0v-4a.5.5 0 011 0v4zm4 0a.5.5 0 01-.85.35L11.5 10.7v1.8a.5.5 0 01-1 0v-4a.5.5 0 01.85-.35l1.65 2.15V8.5a.5.5 0 011 0v4zm3.5-.5h-2v-1h1.5a.5.5 0 000-1H15.5v-1h2a.5.5 0 000-1h-2.5a.5.5 0 00-.5.5v4a.5.5 0 00.5.5h2.5a.5.5 0 000-1z"
        fill="white"
      />
    </svg>
  )
}
