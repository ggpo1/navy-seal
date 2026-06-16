export function getSeaLionShareUrl(id: string): string {
  return `${window.location.origin}/share/sealions/${id}`
}

export function getSeaLionOgImageUrl(id: string): string {
  return `${window.location.origin}/api/sealions/${id}/og-image`
}

export async function copyTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}
