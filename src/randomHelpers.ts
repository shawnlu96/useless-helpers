export function getRandomBewteen(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function shuffleArray<T>(array: T[]): T[] {
  // 创建数组的一个副本，以避免修改原始数组
  const shuffledArray = [...array]

  for (let i = shuffledArray.length - 1; i > 0; i--) {
    // 随机选择一个比当前元素索引小的元素
    const j = Math.floor(Math.random() * (i + 1))

    // 交换当前元素与随机选中的元素
    ;[shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]
  }

  return shuffledArray
}
