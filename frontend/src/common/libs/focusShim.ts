/** iOSキーボードをユーザージェスチャー内で立ち上げるためのshim input参照。 */
export const focusShimRef: { current: HTMLInputElement | null } = { current: null }

/** ユーザージェスチャー内で同期的にshim inputへfocusし、iOSテンキーを表示。 */
export const focusShim = () => {
  focusShimRef.current?.focus()
}
