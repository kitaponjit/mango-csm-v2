import type { WarrantyItemDeleteTarget } from './warranty-item-delete-service'

export function escapeWarrantyItemConfirmationText(value: string): string {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return value.replace(/[&<>"']/g, character => entities[character] ?? character)
}

export function formatWarrantyItemDeleteConfirmation(
  target: Pick<WarrantyItemDeleteTarget, 'code' | 'name'>,
): string {
  return `Delete Warranty Item ${escapeWarrantyItemConfirmationText(target.code)} — ${escapeWarrantyItemConfirmationText(target.name)}?`
}
