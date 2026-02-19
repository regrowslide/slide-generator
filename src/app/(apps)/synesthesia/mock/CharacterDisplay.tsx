'use client'

import {AnimatePresence, motion} from 'framer-motion'
import {convertHexToRGBA} from '@cm/lib/methods/colors'

type CharacterDisplayProps = {
  char: string
  mappedColor?: string // 既にマッピング済みの色
}

const CharacterDisplay = ({char, mappedColor}: CharacterDisplayProps) => {
  return (
    <div className="relative flex items-center justify-center h-[200px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={char}
          initial={{opacity: 0, scale: 0.5, y: 20}}
          animate={{opacity: 1, scale: 1, y: 0}}
          exit={{opacity: 0, scale: 0.8, y: -20}}
          transition={{duration: 0.3, ease: 'easeOut'}}
          className="text-[8rem] leading-none font-bold select-none"
          style={{
            // マッピング済みなら背景にうっすら色を表示
            textShadow: mappedColor ? `0 0 40px ${convertHexToRGBA(mappedColor, 0.4)}` : undefined,
            color: mappedColor ? mappedColor : undefined,
          }}
        >
          {char}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default CharacterDisplay
