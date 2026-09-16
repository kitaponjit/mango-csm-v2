import type { TargetLanguage } from '~/services/localization/localization-adapter'

export const MAS002_TEXTS: Record<TargetLanguage, Record<string, string>> = {
  en: {
    'mas002.title': 'Warranty Item list', 'mas002.description': 'Configure warranty items.', 'mas002.count': 'Total records',
    'mas002.number': 'No.', 'mas002.codeColumn': 'Warranty Code', 'mas002.nameColumn': 'Warranty Name', 'mas002.groupColumn': 'Warranty Group',
    'mas002.durationColumn': 'Duration', 'mas002.activeColumn': 'Active', 'mas002.addUserColumn': 'Added By', 'mas002.addDateColumn': 'Added At', 'mas002.editUserColumn': 'Edited By', 'mas002.editDateColumn': 'Edited At', 'mas002.yes': 'Yes', 'mas002.no': 'No',
    'mas002.searchBy': 'Search By', 'mas002.searchFieldCode': 'Warranty Code', 'mas002.searchFieldName': 'Warranty Name',
    'mas002.search': 'Search', 'mas002.activeFilter': 'Active', 'mas002.first': 'First', 'mas002.prev': 'Previous',
    'mas002.next': 'Next', 'mas002.last': 'Last', 'mas002.new': 'New', 'mas002.edit': 'Edit', 'mas002.delete': 'Delete',
    'mas002.import': 'Import', 'mas002.export': 'Export', 'mas002.importTitle': 'Import Warranty Items', 'mas002.importPreview': 'Preview rows', 'mas002.importUpload': 'Upload', 'mas002.importCancel': 'Cancel', 'mas002.importSuccess': 'Import completed successfully.', 'mas002.importEmpty': 'Nothing to import — paste rows and map the columns.', 'mas002.authChecking': 'Checking your session', 'mas002.authRequired': 'Sign-in required',
    'mas002.authUnavailable': 'The sign-in page is currently unavailable.', 'mas002.accessDeniedTitle': 'Access denied',
    'mas002.accessDeniedMessage': 'You do not have access to Warranty Items.', 'mas002.accessErrorTitle': 'Unable to check Warranty Item access',
    'mas002.accessRetry': 'Check access again', 'mas002.readOnly': 'Read only', 'mas002.loading': 'Loading Warranty Items',
    'mas002.empty': 'No Warranty Items found', 'mas002.error': 'Unable to load Warranty Items',
    'mas002.invalidResponse': 'The server returned an invalid Warranty Item list.', 'mas002.retry': 'Try again',
  },
  th: {
    'mas002.title': 'รายการงานประกัน', 'mas002.description': 'ตั้งค่ารายการงานประกัน', 'mas002.count': 'จำนวนข้อมูลทั้งหมด',
    'mas002.number': 'ลำดับ', 'mas002.codeColumn': 'Warranty Code', 'mas002.nameColumn': 'Warranty Name', 'mas002.groupColumn': 'Warranty Group',
    'mas002.durationColumn': 'ระยะเวลา', 'mas002.activeColumn': 'Active', 'mas002.addUserColumn': 'ผู้เพิ่ม', 'mas002.addDateColumn': 'วันที่เพิ่ม', 'mas002.editUserColumn': 'ผู้แก้ไข', 'mas002.editDateColumn': 'วันที่แก้ไข', 'mas002.yes': 'ใช่', 'mas002.no': 'ไม่ใช่',
    'mas002.searchBy': 'ค้นหาจาก', 'mas002.searchFieldCode': 'Warranty Code', 'mas002.searchFieldName': 'Warranty Name',
    'mas002.search': 'ค้นหา', 'mas002.activeFilter': 'Active', 'mas002.first': 'หน้าแรก', 'mas002.prev': 'ก่อนหน้า',
    'mas002.next': 'ถัดไป', 'mas002.last': 'หน้าสุดท้าย', 'mas002.new': 'เพิ่ม', 'mas002.edit': 'แก้ไข', 'mas002.delete': 'ลบ',
    'mas002.import': 'นำเข้า', 'mas002.export': 'ส่งออก', 'mas002.authChecking': 'กำลังตรวจสอบการเข้าสู่ระบบ', 'mas002.authRequired': 'ต้องเข้าสู่ระบบ',
    'mas002.authUnavailable': 'ไม่สามารถเปิดหน้าลงชื่อเข้าใช้ได้ในขณะนี้', 'mas002.accessDeniedTitle': 'ไม่มีสิทธิ์เข้าถึง',
    'mas002.accessDeniedMessage': 'คุณไม่มีสิทธิ์เข้าถึงรายการงานประกัน', 'mas002.accessErrorTitle': 'ไม่สามารถตรวจสอบสิทธิ์ได้',
    'mas002.accessRetry': 'ตรวจสอบสิทธิ์อีกครั้ง', 'mas002.readOnly': 'ดูข้อมูลได้อย่างเดียว', 'mas002.loading': 'กำลังโหลดรายการงานประกัน',
    'mas002.empty': 'ไม่พบรายการงานประกัน', 'mas002.error': 'ไม่สามารถโหลดรายการงานประกันได้',
    'mas002.invalidResponse': 'เซิร์ฟเวอร์ส่งข้อมูลรายการงานประกันไม่ถูกต้อง', 'mas002.retry': 'ลองอีกครั้ง',
  },
}
