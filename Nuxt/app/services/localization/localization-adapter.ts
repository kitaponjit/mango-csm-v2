export type TargetLanguage = 'th' | 'en'

interface StorageReader {
  getItem(key: string): string | null
}

const thai: Record<string, string> = {
  'auth.title': 'เข้าสู่ระบบ',
  'auth.description': 'ใช้บัญชี Mango ของคุณเพื่อเปิดรายการอัปเดตโปรแกรม',
  'auth.formTitle': 'ข้อมูลเข้าสู่ระบบ',
  'auth.company': 'ชื่อบริษัท',
  'auth.companyLoading': 'กำลังโหลดรายชื่อบริษัท…',
  'auth.companySelect': 'เลือกบริษัท',
  'auth.companyLoadFailed': 'โหลดรายชื่อบริษัทไม่สำเร็จ สามารถกรอกรหัสบริษัทแทนได้',
  'auth.companyRetry': 'ลองอีกครั้ง',
  'auth.user': 'ชื่อผู้ใช้',
  'auth.password': 'รหัสผ่าน',
  'auth.submit': 'เข้าสู่ระบบ',
  'auth.submitting': 'กำลังเข้าสู่ระบบ…',
  'auth.failed': 'เข้าสู่ระบบไม่สำเร็จ',
  'auth.required': 'กรุณากรอกรหัสบริษัท ชื่อผู้ใช้ และรหัสผ่าน',
  'auth.unavailableTitle': 'ไม่สามารถเข้าสู่ระบบได้',
  'auth.unavailableMessage': 'บริการแบ็กเอนด์สำหรับเข้าสู่ระบบไม่พร้อมใช้งานในขณะนี้ กรุณาติดต่อผู้ดูแลระบบแล้วลองอีกครั้ง',
  'auth.backToManual': 'กลับไปหน้ารายการอัปเดต',
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
  'manual.authChecking': 'กำลังตรวจสอบสถานะการเข้าสู่ระบบ',
  'manual.authRequired': 'ต้องเข้าสู่ระบบ',
  'manual.authUnavailable': 'ไม่สามารถเปิดหน้าลงชื่อเข้าใช้ได้ในขณะนี้ เนื่องจากบริการแบ็กเอนด์ไม่พร้อมใช้งาน กรุณาติดต่อผู้ดูแลระบบแล้วลองอีกครั้ง',
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
  'auth.title': 'Sign in',
  'auth.description': 'Use your Mango account to open the program update list.',
  'auth.formTitle': 'Account details',
  'auth.company': 'Company',
  'auth.companyLoading': 'Loading companies…',
  'auth.companySelect': 'Select a company',
  'auth.companyLoadFailed': 'Could not load companies. Enter the company code instead.',
  'auth.companyRetry': 'Try again',
  'auth.user': 'User name',
  'auth.password': 'Password',
  'auth.submit': 'Sign in',
  'auth.submitting': 'Signing in…',
  'auth.failed': 'Sign-in failed',
  'auth.required': 'Enter your company code, user name, and password.',
  'auth.unavailableTitle': 'Sign-in unavailable',
  'auth.unavailableMessage': 'The backend sign-in service is currently unavailable. Contact your administrator, then try again.',
  'auth.backToManual': 'Return to program updates',
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
  'manual.authChecking': 'Checking your session',
  'manual.authRequired': 'Sign-in required',
  'manual.authUnavailable': 'The sign-in page is currently unavailable because the backend service is not running. Contact your administrator, then try again.',
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
