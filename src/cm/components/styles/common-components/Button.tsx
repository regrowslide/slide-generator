import { cn } from '@shadcn/lib/utils'
import { htmlProps } from '@cm/types/utility-types'
import { colorVariants } from '@cm/lib/methods/colorVariants'

import { tv } from 'tailwind-variants'

export const Button = (
  props: htmlProps & {
    color?: colorVariants
    active?: boolean
    size?: 'xs' | 'sm' | 'md' | 'lg'
  }
) => {
  const { className, style, color = 'gray', active, size = 'md', ...rest } = props

  const buttonVariants = tv({
    base: cn(
      `t-btn   shadow-none!   shadow-md `,
      `flex items-center gap-1`,
      `ease-in-out transform transition-all`,
      `ring-1 `,
      `focus:outline-none focus:ring-2  focus:ring-opacity-50`,
      `disabled:opacity-50 disabled:cursor-not-allowed `
    ),
    variants: {
      color: btnColorVariants,
      size: {
        xs: 'text-[12px] py-[2px] px-[8px] ',
        sm: 'text-[14px] py-[4px] px-[10px] ',
        md: 'text-[16px] py-[6px] px-[14px] ',
        lg: 'text-[18px] py-[6px] px-[18px] ',
      },
      active: {
        false: 'opacity-40!',
        true: 'cursor-pointer',
      },
    },
    defaultVariants: {
      size: 'md',
      active: true,
    },
  })

  return (
    <button
      {...{
        className: buttonVariants({
          color: color as any,
          size,
          active: active !== false,
          class: className,
        }),
        style,
        ...rest,
      }}
    />
  )
}

export const btnColorVariants = {
  gray: 'bg-gray-300 text-gray-700  border-none ring-0',
  red: 'bg-error-main text-white  ring-red-400 ',
  blue: 'bg-blue-main text-white  ring-blue-400 ',
  green: 'bg-green-main text-white  ring-green-400 ',
  orange: 'bg-orange-main text-white  ring-orange-400 ',
  yellow: 'bg-yellow-main text-white  ring-yellow-400 ',
  sub: 'bg-sub-main text-white   ',
  primary: 'bg-primary-main text-white  ring-primary-main ',
}
