import type { CategoryResponse } from "./types"

/** カテゴリのグリフ表示 (symbolがあればsymbol、無ければname頭文字を大文字)。 */
export const categoryGlyph = (c: Pick<CategoryResponse, "name" | "symbol">): string => {
  if (c.symbol && c.symbol.trim().length > 0) {
    return c.symbol
  }
  const first = [...c.name][0] ?? ""
  return first.toUpperCase()
}
