/**
 * Copy a value to the clipboard, then auto-clear it after `clearAfterMs`
 * if the clipboard still contains the same value. Prevents sensitive data
 * (account numbers, codes) from lingering after a copy action.
 */
export async function copyWithAutoClear(value: string, clearAfterMs = 30_000): Promise<void> {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    throw new Error("Clipboard API unavailable.");
  }
  await navigator.clipboard.writeText(value);

  setTimeout(async () => {
    try {
      const current = await navigator.clipboard.readText();
      if (current === value) {
        await navigator.clipboard.writeText("");
      }
    } catch {
      // Read permission may be denied — best-effort clear only.
    }
  }, clearAfterMs);
}
