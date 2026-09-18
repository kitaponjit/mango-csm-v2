import { formatDateFilter } from '../../../vue-filters'

export function formatWarrantyItemReferenceDate(value: string | null | undefined): string {
  return formatDateFilter(value, 'DD/MM/YYYY')
}
