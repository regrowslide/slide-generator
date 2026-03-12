type roleArray = string[] | string
type session = any
export function roleIs(roleArray: roleArray, session: session) {
  typeof roleArray === 'string' && (roleArray = [roleArray])
  return roleArray.includes(session?.role)
}

export function typeIs(roleArray: roleArray, session: session) {
  typeof roleArray === 'string' && (roleArray = [roleArray])
  return roleArray.includes(session?.type)
}

export function userIs(key, roleArray: roleArray, session: session) {
  typeof roleArray === 'string' && (roleArray = [roleArray])
  return roleArray.includes(session?.[key])
}

export const judgeIsAdmin = (session: session) => {
  const admin = roleIs('admin', session)

  return {
    admin,
  }
}
