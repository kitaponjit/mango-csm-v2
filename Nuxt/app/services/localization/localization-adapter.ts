export type TargetLanguage = 'th' | 'en'

interface StorageReader {
  getItem(key: string): string | null
}

const thai: Record<string, string> = {
  'manual.title': 'รายการอัพเดทโปรแกรม',
  'manual.description': 'ค้นหาและเปิดดูรายละเอียดการอัปเดตแยกตามโมดูล',
  'manual.filters': 'ตัวกรองรายการ',
  'manual.dateMode': 'ค้นหาตามวันที่',
  'manual.revisionMode': 'ค้นหาตาม Revision',
  'manual.startDate': 'วันที่เริ่มต้น',
  'manual.endDate': 'วันที่สิ้นสุด',
  'manual.startRevision': 'Revision เริ่มต้น',
  'manual.endRevision': 'Revision สิ้นสุด',
  'manual.condition': 'เงื่อนไข',
  'manual.search': 'ค้นหา',
  'manual.between': 'ระหว่าง',
  'manual.moreThan': 'มากกว่า',
  'manual.lessThan': 'น้อยกว่า',
  'manual.equal': 'เท่ากับ',
  'manual.number': 'ลำดับ',
  'manual.revision': 'Revision No.',
  'manual.subject': 'หัวข้อ',
  'manual.date': 'วันที่',
  'manual.loading': 'กำลังโหลดรายการอัปเดต',
  'manual.empty': 'ไม่พบรายการอัพเดทซอฟต์แวร์',
  'manual.error': 'ไม่สามารถโหลดรายการอัปเดตได้',
  'manual.retry': 'ลองอีกครั้ง',
  'manual.attachments': 'เอกสารแนบ',
  'manual.attachmentLoading': 'กำลังโหลดเอกสารแนบ',
  'manual.attachmentEmpty': 'ไม่พบเอกสารแนบ',
  'manual.attachmentError': 'ไม่สามารถโหลดเอกสารแนบได้',
  'manual.open': 'เปิดไฟล์',
  'manual.download': 'ดาวน์โหลด',
  'manual.close': 'ปิดหน้าต่าง',
}

const english: Record<string, string> = {
  'manual.title': 'Program update list',
  'manual.description': 'Search and review update details by module.',
  'manual.filters': 'List filters',
  'manual.dateMode': 'Search by date',
  'manual.revisionMode': 'Search by revision',
  'manual.startDate': 'Start date',
  'manual.endDate': 'End date',
  'manual.startRevision': 'Start revision',
  'manual.endRevision': 'End revision',
  'manual.condition': 'Condition',
  'manual.search': 'Search',
  'manual.between': 'Between',
  'manual.moreThan': 'Greater than',
  'manual.lessThan': 'Less than',
  'manual.equal': 'Equal to',
  'manual.number': '#',
  'manual.revision': 'Revision No.',
  'manual.subject': 'Subject',
  'manual.date': 'Date',
  'manual.loading': 'Loading program updates',
  'manual.empty': 'No software updates found',
  'manual.error': 'Unable to load program updates',
  'manual.retry': 'Try again',
  'manual.attachments': 'Attachments',
  'manual.attachmentLoading': 'Loading attachments',
  'manual.attachmentEmpty': 'No attachments found',
  'manual.attachmentError': 'Unable to load attachments',
  'manual.open': 'Open file',
  'manual.download': 'Download',
  'manual.close': 'Close dialog',
}

export interface LocalizationAdapter {
  language: TargetLanguage
  t(key: string): string
}

export function createLocalizationAdapter(storage: StorageReader): LocalizationAdapter {
  let preference: string | null = null
  try {
    preference = storage.getItem('user_lang')
  }
  catch {
    preference = null
  }

  const language: TargetLanguage = preference?.toUpperCase() === 'EN' ? 'en' : 'th'
  const dictionary = language === 'en' ? english : thai

  return {
    language,
    t(key) {
      return dictionary[key] ?? thai[key] ?? key
    },
  }
}
