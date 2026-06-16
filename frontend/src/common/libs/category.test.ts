import { describe, expect, it } from "vitest"

import { categoryGlyph } from "./category"

describe("categoryGlyph", () => {
  it("returns symbol when present", () => {
    expect(categoryGlyph({ name: "Food", symbol: "🍔" })).toBe("🍔")
  })

  it("falls back to uppercased first character when symbol is null", () => {
    expect(categoryGlyph({ name: "food", symbol: null })).toBe("F")
  })

  it("treats whitespace-only symbol as empty and falls back to name", () => {
    expect(categoryGlyph({ name: "transport", symbol: "  " })).toBe("T")
  })

  it("handles multi-byte unicode (e.g. Japanese) safely", () => {
    expect(categoryGlyph({ name: "食費", symbol: null })).toBe("食")
  })

  it("returns empty string when name is empty and no symbol", () => {
    expect(categoryGlyph({ name: "", symbol: null })).toBe("")
  })
})
