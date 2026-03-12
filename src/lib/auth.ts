import {betterAuth} from 'better-auth'
import {prismaAdapter} from 'better-auth/adapters/prisma'
import {admin} from 'better-auth/plugins'
import prisma from 'src/lib/prisma'

// セッション有効期限（秒）
const maxAge = process.env.NEXT_PUBLIC_ROOTPATH === 'Grouping' ? 60 * 60 : 30 * 24 * 60 * 60

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,

  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    },
    line: {
      clientId: process.env.LINE_CLIENT_ID ?? '',
      clientSecret: process.env.LINE_CLIENT_SECRET ?? '',
    },
  },

  session: {
    expiresIn: maxAge,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5分間キャッシュ
    },
  },

  user: {
    additionalFields: {
      code: {type: 'string', required: false},
      sortOrder: {type: 'number', required: false, defaultValue: 0},
      hiredAt: {type: 'string', required: false},
      retiredAt: {type: 'string', required: false},
      transferredAt: {type: 'string', required: false},
      yukyuCategory: {type: 'string', required: false},
      kana: {type: 'string', required: false},
      password: {type: 'string', required: false},
      type: {type: 'string', required: false},
      role: {type: 'string', required: false, defaultValue: 'user'},
      tempResetCode: {type: 'string', required: false},
      schoolId: {type: 'number', required: false},
      rentaStoreId: {type: 'number', required: false},
      type2: {type: 'string', required: false},
      shopId: {type: 'number', required: false},
      membershipName: {type: 'string', required: false},
      damageNameMasterId: {type: 'number', required: false},
      color: {type: 'string', required: false},
      app: {type: 'string', required: false},
      lineUserId: {type: 'string', required: false},
      employeeCode: {type: 'string', required: false},
      phone: {type: 'string', required: false},
      avatar: {type: 'string', required: false},
      bcc: {type: 'string', required: false},
      counselingStoreId: {type: 'number', required: false},
      storeId: {type: 'number', required: false},
      departmentId: {type: 'number', required: false},
      dentalClinicId: {type: 'number', required: false},
      rgStoreId: {type: 'number', required: false},
    },
  },

  plugins: [
    admin({
      impersonationSessionDuration: 60 * 60, // 1時間
    }),
  ],

  // GoogleOAuth: 既存ユーザーのみ許可（自動作成を抑止）
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google', 'line'],
    },
  },
})

export type Session = typeof auth.$Infer.Session
