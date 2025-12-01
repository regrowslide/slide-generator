'use client'

import React from 'react'
import {Check} from 'lucide-react'
import {R_Stack} from '@cm/components/styles/common-components/common-components'

interface StepperProps {
  currentStep: 1 | 2 | 3 | 4
  onStepClick?: (step: 1 | 2 | 3 | 4) => void
}

const steps = [
  {number: 1, label: '設定 & アップロード'},
  {number: 2, label: 'コンテキスト入力'},
  {number: 3, label: '結果確認・編集'},
  {number: 4, label: '最終生成'},
] as const

export const Stepper: React.FC<StepperProps> = ({currentStep, onStepClick}) => {
  return (
    <div className="w-full">
      <R_Stack className="items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = step.number as 1 | 2 | 3 | 4
          const isCompleted = currentStep > stepNumber
          const isCurrent = currentStep === stepNumber
          const isClickable = onStepClick && (isCompleted || isCurrent)

          return (
            <React.Fragment key={step.number}>
              <div className="flex items-center">
                <button
                  onClick={() => isClickable && onStepClick(stepNumber)}
                  disabled={!isClickable}
                  className={`flex flex-col items-center gap-2 ${
                    isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : isCompleted
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isCompleted ? <Check className="w-6 h-6" /> : step.number}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    currentStep > stepNumber ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          )
        })}
      </R_Stack>
    </div>
  )
}

