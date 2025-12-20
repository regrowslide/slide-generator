import { TbmRouteGroupStandardSalary } from "@prisma/generated/prisma/client"


/**
 * 指定日の時点で有効な標準給料を取得する
 *
 * @param standardSalaries - TbmRouteGroupStandardSalary の配列
 * @param date - 対象日
 * @returns 対象日時点で有効な標準給料レコード（見つからない場合は undefined）
 */
export const getStandardSalaryOnDate = (
  standardSalaries: TbmRouteGroupStandardSalary[],
  date: Date
): TbmRouteGroupStandardSalary | undefined => {
  // startDate の降順でソートして、指定日以前で最も新しいものを取得
  return standardSalaries
    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
    .find(salary => salary.startDate <= date)
}

/**
 * 指定日の時点で有効な標準給料額を取得する
 *
 * @param standardSalaries - TbmRouteGroupStandardSalary の配列
 * @param date - 対象日
 * @returns 対象日時点で有効な標準給料額（見つからない場合は null）
 */
export const getStandardSalaryAmountOnDate = (
  standardSalaries: TbmRouteGroupStandardSalary[],
  date: Date
): number | null => {
  const salaryRecord = getStandardSalaryOnDate(standardSalaries, date)
  return salaryRecord?.salary ?? null
}
