<template>
  <div class="agd-root">
    <modal-2 ref="modal">
      <template #header>
        <div class="agd-head">
          <span class="agd-mark"><i class="fas fa-robot"></i></span>
          <div class="agd-head-text">
            <div class="agd-head-title">AI Gen Draft<em class="agd-head-badge">Process Attached Files.</em></div>
            <div class="agd-head-sub">สร้างเอกสารฉบับร่างจากไฟล์แนบ</div>
          </div>
          <span v-if="tokenIn !== null" class="agd-token">
            <i class="fas fa-microchip"></i>
            <b>{{ tokenIn.toLocaleString() }}</b> in
            <span class="agd-token-dot"></span>
            <b>{{ tokenOut.toLocaleString() }}</b> out
          </span>
        </div>
      </template>
      <template #body>
        <ol class="agd-steps">
          <li :class="stepClass(1)">
            <span class="agd-step-node"><i class="fas fa-check"></i><em>1</em></span>
            <span class="agd-step-text">
              <b>แนบไฟล์</b>
              <small>รูปภาพ / PDF / Word / Excel</small>
            </span>
          </li>
          <li :class="stepClass(2)">
            <span class="agd-step-node"><i class="fas fa-check"></i><em>2</em></span>
            <span class="agd-step-text">
              <b>ให้ AI อ่านเอกสาร</b>
              <small>สรุปหัวข้อและแยก Task</small>
            </span>
          </li>
          <li :class="stepClass(3)">
            <span class="agd-step-node"><i class="fas fa-check"></i><em>3</em></span>
            <span class="agd-step-text">
              <b>ตรวจทานและบันทึก</b>
              <small>ระบบรันเลขที่เอกสารให้ทันที</small>
            </span>
          </li>
        </ol>

        <div class="agd-grid">
          <!-- ซ้าย : ไฟล์แนบ -->
          <div class="agd-side">
            <section class="agd-card">
              <header class="agd-card-head">
                <span class="agd-card-title"><i class="fas fa-paperclip"></i> แนบไฟล์ / ไฟล์วิดีโอ</span>
                <span class="agd-chip"><b>{{ attachFile.length }}</b> / {{ maxFile }}</span>
              </header>
              <div class="agd-card-body">
                <div class="agd-drop"
                     :class="{'is-over': dragOver, 'is-busy': uploading}"
                     @click="pickFile()"
                     @dragover.prevent="dragOver = true"
                     @dragleave.prevent="dragOver = false"
                     @drop.prevent="onDrop">
                  <span class="agd-drop-icon">
                    <i :class="uploading ? 'fas fa-spinner fa-spin' : 'fas fa-cloud-upload-alt'"></i>
                  </span>
                  <span class="agd-drop-title">{{ uploading ? 'กำลังอัพโหลดไฟล์...' : 'วางไฟล์ที่นี่ หรือคลิกเพื่ออัพโหลด' }}</span>
                  <span class="agd-drop-sub">รองรับสูงสุด {{ maxFile }} ไฟล์</span>
                </div>
                <input ref="picker" type="file" multiple class="agd-picker" @change="onPick" />

                <ul v-if="attachFile.length" class="agd-file-list">
                  <li v-for="(x, idx) in attachFile" :key="x.itemno" class="agd-file">
                    <span class="agd-file-ext" :class="'is-' + fileKind(x.docfilename)">{{ fileExt(x.docfilename) }}</span>
                    <span class="agd-file-body">
                      <a class="agd-file-name" :title="x.docfilename" @click.prevent="previewFile(x)">{{ x.docfilename }}</a>
                      <input type="text" class="agd-file-desc" v-model.trim="x.docdesc" placeholder="คำอธิบายไฟล์ (ไม่บังคับ)" />
                    </span>
                    <button type="button" class="agd-icon-btn is-danger" title="ลบไฟล์" @click="delFile(x)">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </li>
                </ul>
              </div>
            </section>

            <section class="agd-card">
              <header class="agd-card-head">
                <span class="agd-card-title"><i class="fas fa-comment-dots"></i> ข้อความเพิ่มเติม</span>
                <span class="agd-chip is-ghost">ไม่บังคับ</span>
              </header>
              <div class="agd-card-body">
                <textarea class="agd-textarea" rows="3" v-model.trim="remark"
                          placeholder="อธิบายเพิ่มเติมให้ AI เข้าใจบริบทของไฟล์แนบ เช่น ระบบ/หน้าจอที่เกี่ยวข้อง"></textarea>
              </div>
            </section>
          </div>

          <!-- ขวา : ผลลัพธ์ -->
          <div class="agd-side">
            <section class="agd-card agd-req">
              <header class="agd-card-head">
                <span class="agd-card-title"><i class="fa fa-user-circle"></i> ผู้แจ้งเรื่อง</span>
              </header>
              <div class="agd-card-body">
                <div class="agd-req-top">
                  <span class="agd-avatar">{{ initial }}</span>
                  <span class="agd-req-name">{{ auth.empname || '-' }}</span>
                </div>
                <dl class="agd-req-grid">
                  <div><dt><i class="fa fa-envelope"></i> Email</dt><dd>{{ auth.empmail || '-' }}</dd></div>
                  <div><dt><i class="fa fa-phone"></i> Phone No.</dt><dd>{{ auth.emptel || '-' }}</dd></div>
                  <div><dt><i class="fa fa-mobile"></i> มือถือ</dt><dd>{{ auth.empmob || '-' }}</dd></div>
                </dl>
              </div>
            </section>

            <section v-if="!hasResult" class="agd-card agd-blank">
              <span class="agd-blank-glyph">
                <i class="fas fa-file-alt"></i>
                <em class="agd-blank-spark"><i class="fas fa-magic"></i></em>
              </span>
              <p class="agd-blank-title">ยังไม่มีฉบับร่าง</p>
              <p class="agd-blank-text">
                แนบไฟล์ทางซ้าย แล้วกด <b>Process Doc.</b><br />
                AI จะอ่านทุกไฟล์ สรุปหัวข้อ และแยกออกเป็น Task ให้อัตโนมัติ
              </p>
            </section>

            <template v-else>
              <section class="agd-card">
                <header class="agd-card-head">
                  <span class="agd-card-title"><i class="fas fa-file-signature"></i> เอกสาร (Header)</span>
                </header>
                <div class="agd-card-body">
                  <label class="agd-label">
                    Subject
                    <span class="agd-counter" :class="{'is-over': (draft.subject || '').length > 100}">
                      {{ (draft.subject || '').length }} / 100
                    </span>
                  </label>
                  <input type="text" class="agd-input" maxlength="100" v-model.trim="draft.subject" />

                  <label class="agd-label">รายละเอียด</label>
                  <textarea class="agd-textarea" rows="5" v-model.trim="draft.detail"></textarea>
                </div>
              </section>

              <section class="agd-card">
                <header class="agd-card-head">
                  <span class="agd-card-title"><i class="fas fa-tasks"></i> รายการงานที่ AI แยกได้</span>
                  <span class="agd-chip is-ai"><b>{{ draft.tasks.length }}</b> Task</span>
                </header>
                <div class="agd-card-body">
                  <ol class="agd-tasks">
                    <li v-for="(t, idx) in draft.tasks" :key="idx" class="agd-task">
                      <span class="agd-task-no">{{ idx + 1 }}</span>
                      <div class="agd-task-body">
                        <div class="agd-task-head">
                          <span class="agd-task-title">Task ที่ {{ idx + 1 }}</span>
                          <button type="button" class="agd-icon-btn" title="ลบรายการ" @click="delTask(idx)">
                            <i class="fas fa-times"></i>
                          </button>
                        </div>
                        <label class="agd-label">
                          Subject
                          <span class="agd-counter" :class="{'is-over': (t.subject || '').length > 100}">
                            {{ (t.subject || '').length }} / 100
                          </span>
                        </label>
                        <input type="text" class="agd-input" maxlength="100" v-model.trim="t.subject" />
                        <label class="agd-label">รายละเอียด</label>
                        <textarea class="agd-textarea" rows="4" v-model.trim="t.detail"></textarea>
                      </div>
                    </li>
                  </ol>
                  <button type="button" class="agd-add" @click="addTask()">
                    <i class="fas fa-plus"></i> เพิ่ม Task
                  </button>
                </div>
              </section>
            </template>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="agd-foot">
          <button type="button" class="agd-btn is-ai" @click="LLMDoc()" :disabled="processing || uploading || attachFile.length === 0">
            <i :class="processing ? 'fas fa-spinner fa-spin' : 'fas fa-bolt'"></i>
            <span>{{ processing ? 'AI กำลังอ่านเอกสาร...' : 'Process Doc.' }}</span>
          </button>
          <span class="agd-foot-note" v-if="hasResult">ตรวจทานข้อความก่อนบันทึก — แก้ไขได้ทุกช่อง</span>
          <button type="button" class="agd-btn is-save" @click="saveDraft()" :disabled="saving || processing || draft.tasks.length === 0">
            <i :class="saving ? 'fas fa-spinner fa-spin' : 'fas fa-save'"></i>
            <span>{{ saving ? 'กำลังบันทึก...' : 'บันทึกฉบับร่าง' }}</span>
          </button>
        </div>
      </template>
    </modal-2>
  </div>
</template>

<script type="text/javascript">
  export default {
    data() {
      return {
        auth: window.auth,
        maxFile: 10,
        attachFile: [],
        remark: '',
        dragOver: false,
        uploading: false,
        processing: false,
        saving: false,
        tokenIn: null,
        tokenOut: null,
        draft: {
          subject: '',
          detail: '',
          tasks: []
        }
      }
    },
    computed: {
      hasResult() {
        return this.draft.tasks.length > 0 || !$xt.isEmpty(this.draft.subject)
      },
      step() {
        if (this.attachFile.length === 0) return 1
        return this.hasResult ? 3 : 2
      },
      initial() {
        return (this.auth.empname || '?').replace(/^(นาย|นาง|นางสาว)\s*/, '').trim().charAt(0)
      }
    },
    methods: {
      async openModal() {
        this.$set(this, 'attachFile', [])
        this.$set(this, 'draft', { subject: '', detail: '', tasks: [] })
        this.remark = ''
        this.tokenIn = null
        this.tokenOut = null
        this.processing = false
        this.uploading = false
        this.saving = false

        this.$refs.modal.setSize('modal-xl agd-dlg')
        await this.$refs.modal.openModal()
      },
      pickFile() {
        if (this.uploading) return
        this.$refs.picker.click()
      },
      onPick(e) {
        this.uploadFiles(Array.from(e.target.files || []))
        e.target.value = ''
      },
      onDrop(e) {
        this.dragOver = false
        this.uploadFiles(Array.from(e.dataTransfer?.files || []))
      },
      async uploadFiles(files) {
        if (!files.length) return
        if (this.attachFile.length + files.length > this.maxFile) {
          $msg.alert(`warning`, `แนบไฟล์ได้สูงสุด ${this.maxFile} ไฟล์`, `warning`)
          return
        }

        this.uploading = true
        try {
          for (const f of files) {
            let form = new FormData()
            form.append('file', f)
            form.append('type', 'p')

            let rsp = await $xt.postServerForm(`Anywhere/Center/FileUploadToTemp`, form)
            if (!rsp.success) {
              throw rsp.error
            }

            let max = this.attachFile.length == 0 ? 1 : ($linq(this.attachFile).max(x => x.itemno) || 0) + 1
            this.attachFile.push({
              itemno: max,
              pathto: rsp.id,
              docfilename: rsp.filename,
              docdesc: rsp.filename,
              ext: rsp.ext
            })
          }
        }
        catch (ex) {
          $msg.alert(`เกิดข้อผิดพลาด`, ex.toString(), `danger`)
        }
        finally {
          this.uploading = false
        }
      },
      delFile(x) {
        this.$set(this, 'attachFile', $linq(this.attachFile).where(w => w.itemno != x.itemno).toArray())
      },
      previewFile(x) {
        window.open(window.dataServer + `Api/File/DownLoad?id=${x.pathto}`, '_blank')
      },
      fileExt(name) {
        return ((name || '').split('.').pop() || '?').toLowerCase().substring(0, 4)
      },
      fileKind(name) {
        let ext = this.fileExt(name)
        if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'img'
        if (ext == 'pdf') return 'pdf'
        if (['xls', 'xlsx', 'csv'].includes(ext)) return 'xls'
        if (['doc', 'docx'].includes(ext)) return 'doc'
        if (['zip', 'rar'].includes(ext)) return 'zip'
        if (['mp4', 'mp3'].includes(ext)) return 'med'
        return 'txt'
      },
      stepClass(n) {
        return { 'is-done': this.step > n, 'is-active': this.step === n }
      },
      addTask() {
        this.draft.tasks.push({ subject: '', detail: '' })
      },
      delTask(idx) {
        this.draft.tasks.splice(idx, 1)
      },
      async LLMDoc() {
        if (this.attachFile.length === 0) {
          $msg.alert(`warning`, 'กรุณาแนบไฟล์อย่างน้อย 1 ไฟล์', `warning`)
          return
        }

        this.processing = true
        try {
          let f = {
            files: $linq(this.attachFile).select(x => {
              return { filename: x.docfilename, pathto: x.pathto, docdesc: x.docdesc }
            }).toArray(),
            remark: this.remark
          }

          let rsp = await $xt.postServerJson(`CSM/Data/AiGenDraft`, f)
          if (!rsp.success) {
            $msg.alert(`warning`, rsp.error, `warning`)
            return
          }

          this.$set(this, 'draft', {
            subject: rsp.data.subject || '',
            detail: rsp.data.detail || '',
            tasks: rsp.data.tasks || []
          })
          this.tokenIn = rsp.data.token_usage_in || 0
          this.tokenOut = rsp.data.token_usage_out || 0
        }
        catch (ex) {
          $msg.alert(`เกิดข้อผิดพลาด`, ex.toString(), `danger`)
        }
        finally {
          this.processing = false
        }
      },
      async saveDraft() {
        if (!await $msg.confirm(`คุณต้องการบักทึกข้อมูลแบบฉบับร่างก่อน ใช่หรือไม่ เนื่องจากระบบจะทำการรันเลขที่เอกสารให้ทันที`)) {
          return
        }

        this.saving = true
        try {
          let attachItemno = 0
          let attach = []
          this.draft.tasks.forEach((t, idx) => {
            this.attachFile.forEach(x => {
              attach.push({
                itemno: ++attachItemno,
                ref_itemno: idx + 1,
                item_type: 'B',
                filepath: x.pathto,
                filename: x.docfilename,
                description: x.docdesc,
                add_user: this.auth.userid,
                add_dt: new Date()
              })
            })
          })

          let f = {
            form: {
              job_date: new Date(),
              subject: this.draft.subject,
              remark: this.draft.detail,
              request_empno: this.auth.empno,
              request_empno_tmp: this.auth.empno,
              job_priority: '1'
            },
            detail: this.draft.tasks.map((x, idx) => {
              return {
                itemno: idx + 1,
                subject: x.subject,
                detail: x.detail,
                status: 'W',
                status_tmp: 'W',
                is_db: false,
                add_user: this.auth.userid,
                add_dt: new Date()
              }
            }),
            risk: [],
            attach
          }

          let rsp = await $xt.postServerJson(`CSM/Data/CSM_CreateTemplete`, f)
          if (!rsp.success) {
            throw rsp.error
          }

          $notify.success('บันทึกฉบับร่างเรียบร้อยแล้ว')
          await this.$refs.modal.closeModal()
          this.$emit('saved', rsp.data)
        }
        catch (ex) {
          $msg.alert(`เกิดข้อผิดพลาด`, ex.toString(), `danger`)
        }
        finally {
          this.saving = false
        }
      }
    }
  }
</script>


<!-- ทุกค่าสีเขียนตรง ไม่ใช้ CSS custom property เพราะ var() ไม่ resolve บน runtime ของแอปนี้ -->
<style scoped>
  /* ══ header ══════════════════════════════════════════════════ */
  .agd-head {
    position: relative;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 15px 60px 15px 20px;
    overflow: hidden;
  }

  .agd-head::after {
    content: '';
    position: absolute;
    top: -80px;
    left: -40px;
    width: 260px;
    height: 260px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 255, 255, .3) 0%, rgba(255, 255, 255, 0) 68%);
    pointer-events: none;
  }

  .agd-mark {
    position: relative;
    z-index: 1;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border-radius: 13px;
    background: linear-gradient(150deg, #ffffff 0%, #e9dcff 100%);
    color: #7c3aed;
    font-size: 18px;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, .5) inset, 0 10px 24px -8px rgba(29, 12, 79, .5);
  }

  .agd-head-text {
    position: relative;
    z-index: 1;
    min-width: 0;
  }

  .agd-head-title {
    display: flex;
    align-items: center;
    gap: 9px;
    font-family: 'Manrope', 'Prompt', sans-serif;
    font-size: 17px;
    font-weight: 700;
    line-height: 1.2;
    color: #ffffff;
    letter-spacing: .2px;
  }

  .agd-head-badge {
    font-family: 'Manrope', 'Prompt', sans-serif;
    font-style: normal;
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 1.5px;
    padding: 3px 8px;
    border-radius: 5px;
    color: #ffffff;
    background: rgba(255, 255, 255, .2);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, .55) inset;
  }

  .agd-head-sub {
    font-family: 'Sarabun', 'Prompt', sans-serif;
    font-size: 12.5px;
    color: rgba(255, 255, 255, .82);
    margin-top: 3px;
  }

  .agd-token {
    position: relative;
    z-index: 1;
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 7px 13px;
    border-radius: 9px;
    background: rgba(255, 255, 255, .16);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, .3) inset;
    font-family: 'Manrope', 'Prompt', sans-serif;
    font-size: 11.5px;
    color: rgba(255, 255, 255, .85);
  }

  .agd-token b {
    color: #ffffff;
    font-weight: 700;
  }

  .agd-token i {
    color: #f0abfc;
  }

  .agd-token-dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: rgba(255, 255, 255, .4);
  }

  /* ══ step rail ═══════════════════════════════════════════════ */
  .agd-steps {
    display: flex;
    list-style: none;
    margin: 0 0 18px;
    padding: 0;
    border-radius: 13px;
    background: #ffffff;
    border: 1px solid #c5d0e0;
    box-shadow: 0 1px 2px rgba(13, 21, 32, .05), 0 8px 18px -12px rgba(13, 21, 32, .3);
    overflow: hidden;
  }

  .agd-steps li {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 16px;
    min-width: 0;
  }

  .agd-steps li + li {
    border-left: 1px solid #dde4ee;
  }

  .agd-steps .is-active {
    background: linear-gradient(180deg, rgba(109, 74, 255, .09) 0%, rgba(109, 74, 255, .02) 100%);
    box-shadow: inset 0 3px 0 #7c5cff;
  }

  .agd-step-node {
    position: relative;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #eef2f8;
    box-shadow: 0 0 0 1.5px #ccd6e4 inset;
    color: #8290a3;
    font-family: 'Manrope', 'Prompt', sans-serif;
    font-size: 12px;
    font-weight: 700;
    transition: all .25s ease;
  }

  .agd-step-node i {
    display: none;
    font-size: 11px;
  }

  .agd-step-text {
    min-width: 0;
    line-height: 1.35;
  }

  .agd-step-text b {
    display: block;
    font-family: 'Manrope', 'Prompt', sans-serif;
    font-size: 13.5px;
    font-weight: 600;
    color: #46536a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .agd-step-text small {
    display: block;
    font-family: 'Sarabun', 'Prompt', sans-serif;
    font-size: 11.5px;
    color: #808d9f;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .agd-steps .is-active .agd-step-node {
    background: linear-gradient(150deg, #7c5cff 0%, #b344f5 100%);
    box-shadow: 0 0 0 4px #ece5ff, 0 6px 14px -6px #6d4aff;
    color: #ffffff;
  }

  .agd-steps .is-active .agd-step-text b {
    color: #0d1520;
    font-weight: 700;
  }

  .agd-steps .is-done .agd-step-node {
    background: #dff3ec;
    box-shadow: 0 0 0 1.5px #93d6c1 inset;
    color: #0b8763;
  }

  .agd-steps .is-done .agd-step-node i {
    display: block;
  }

  .agd-steps .is-done .agd-step-node em {
    display: none;
  }

  .agd-steps .is-done .agd-step-text b {
    color: #46536a;
  }

  /* ══ layout ══════════════════════════════════════════════════ */
  .agd-grid {
    display: grid;
    grid-template-columns: minmax(0, 41%) minmax(0, 59%);
    gap: 16px;
    align-items: start;
  }

  @media (max-width: 1100px) {
    .agd-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .agd-side {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
  }

  /* ══ card ════════════════════════════════════════════════════ */
  .agd-card {
    background: #ffffff;
    border: 1px solid #c5d0e0;
    border-radius: 13px;
    box-shadow: 0 1px 2px rgba(13, 21, 32, .05), 0 8px 18px -12px rgba(13, 21, 32, .3);
    overflow: hidden;
    animation: agd-rise .42s cubic-bezier(.22, 1, .36, 1) backwards;
  }

  .agd-side:first-child .agd-card:nth-child(1) { animation-delay: .04s; }
  .agd-side:first-child .agd-card:nth-child(2) { animation-delay: .10s; }
  .agd-side:last-child .agd-card:nth-child(1) { animation-delay: .07s; }
  .agd-side:last-child .agd-card:nth-child(2) { animation-delay: .13s; }
  .agd-side:last-child .agd-card:nth-child(3) { animation-delay: .19s; }

  @keyframes agd-rise {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: none; }
  }

  .agd-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 11px 15px;
    background: linear-gradient(180deg, #f7f9fd 0%, #eff3f9 100%);
    border-bottom: 1px solid #d4dde9;
    border-left: 3px solid #6d4aff;
  }

  .agd-req .agd-card-head {
    border-left-color: #2f8de4;
  }

  .agd-card-title {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'Manrope', 'Prompt', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: .2px;
    color: #0d1520;
  }

  .agd-card-title i {
    color: #6d4aff;
    font-size: 13px;
  }

  .agd-req .agd-card-title i {
    color: #2f8de4;
  }

  .agd-card-body {
    padding: 15px;
  }

  .agd-chip {
    flex-shrink: 0;
    padding: 3px 11px;
    border-radius: 20px;
    background: #ffffff;
    box-shadow: 0 0 0 1px #ccd6e4 inset;
    color: #4a5768;
    font-family: 'Manrope', 'Prompt', sans-serif;
    font-size: 11.5px;
  }

  .agd-chip b {
    color: #0d1520;
    font-weight: 700;
  }

  .agd-chip.is-ghost {
    background: transparent;
    color: #79859a;
  }

  .agd-chip.is-ai {
    background: #6d4aff;
    box-shadow: none;
    color: #ffffff;
  }

  .agd-chip.is-ai b {
    color: #ffffff;
  }

  /* ══ dropzone ════════════════════════════════════════════════ */
  .agd-drop {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    border-radius: 12px;
    border: 2px dashed #a9b8cd;
    background-color: #f7f9fd;
    background-image: radial-gradient(rgba(13, 21, 32, .07) 1px, transparent 1px);
    background-size: 14px 14px;
    cursor: pointer;
    overflow: hidden;
    transition: border-color .2s ease, background-color .2s ease, transform .2s ease, box-shadow .2s ease;
  }

  .agd-drop:hover {
    border-color: #6d4aff;
    background-color: #f6f3ff;
  }

  .agd-drop.is-over {
    border-color: #6d4aff;
    background-color: #ece5ff;
    transform: translateY(-2px);
    box-shadow: 0 16px 32px -18px rgba(109, 74, 255, .95);
  }

  .agd-drop.is-busy {
    cursor: progress;
    border-style: solid;
    border-color: #6d4aff;
  }

  .agd-drop.is-busy::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: linear-gradient(100deg, rgba(109, 74, 255, 0) 20%, rgba(109, 74, 255, .18) 50%, rgba(109, 74, 255, 0) 80%);
    animation: agd-sweep 1.15s linear infinite;
  }

  @keyframes agd-sweep {
    from { transform: translateX(-100%); }
    to { transform: translateX(100%); }
  }

  .agd-drop-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    margin-bottom: 10px;
    border-radius: 14px;
    background: linear-gradient(150deg, #7c5cff 0%, #b344f5 100%);
    color: #ffffff;
    font-size: 19px;
    box-shadow: 0 12px 24px -10px rgba(109, 74, 255, .95);
  }

  .agd-drop-title {
    font-family: 'Sarabun', 'Prompt', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #0d1520;
  }

  .agd-drop-sub {
    font-family: 'Sarabun', 'Prompt', sans-serif;
    font-size: 12px;
    color: #79859a;
    margin-top: 2px;
  }

  .agd-picker {
    display: none;
  }

  /* ══ file list ═══════════════════════════════════════════════ */
  .agd-file-list {
    list-style: none;
    margin: 13px 0 0;
    padding: 0;
    max-height: 268px;
    overflow-y: auto;
  }

  .agd-file {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 9px 11px;
    margin-bottom: 8px;
    border: 1px solid #dbe3ee;
    border-radius: 10px;
    background: #fbfcfe;
    transition: border-color .16s ease, background .16s ease;
  }

  .agd-file:last-child {
    margin-bottom: 0;
  }

  .agd-file:hover {
    border-color: #a9b8cd;
    background: #ffffff;
  }

  .agd-file-ext {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 36px;
    border-radius: 8px;
    font-family: 'Manrope', 'Prompt', sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .5px;
    text-transform: uppercase;
    color: #ffffff;
    background: #64748b;
  }

  .agd-file-ext.is-pdf { background: #d93a3a; }
  .agd-file-ext.is-xls { background: #10935f; }
  .agd-file-ext.is-doc { background: #2166c9; }
  .agd-file-ext.is-img { background: #d17c0b; }
  .agd-file-ext.is-zip { background: #7d5bd0; }
  .agd-file-ext.is-med { background: #c8408d; }

  .agd-file-body {
    flex: 1;
    min-width: 0;
  }

  .agd-file-name {
    display: block;
    font-family: 'Sarabun', 'Prompt', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #0d1520;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .agd-file-name:hover {
    color: #6d4aff;
    text-decoration: underline;
  }

  .agd-file-desc {
    width: 100%;
    border: none;
    background: transparent;
    padding: 3px 0 0;
    font-family: 'Sarabun', 'Prompt', sans-serif;
    font-size: 12px;
    color: #5b6879;
  }

  .agd-file-desc:focus {
    outline: none;
    color: #0d1520;
  }

  .agd-icon-btn {
    flex-shrink: 0;
    width: 30px;
    height: 30px;
    border: none;
    background: none;
    border-radius: 8px;
    color: #79859a;
    cursor: pointer;
    transition: all .16s ease;
  }

  .agd-icon-btn:hover {
    background: #eef2f8;
    color: #0d1520;
  }

  .agd-icon-btn.is-danger:hover {
    background: #fde8e8;
    color: #d93a3a;
  }

  /* ══ requester ═══════════════════════════════════════════════ */
  .agd-req-top {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 13px;
    margin-bottom: 13px;
    border-bottom: 1px dashed #d4dde9;
  }

  .agd-avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 12px;
    background: linear-gradient(150deg, #4fb2ff 0%, #2a7fd4 100%);
    color: #ffffff;
    font-family: 'Sarabun', 'Prompt', sans-serif;
    font-size: 17px;
    font-weight: 700;
    box-shadow: 0 10px 20px -10px rgba(47, 141, 228, .95);
  }

  .agd-req-name {
    font-family: 'Sarabun', 'Prompt', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: #0d1520;
  }

  .agd-req-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 12px;
    margin: 0;
  }

  .agd-req-grid dt {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'Manrope', 'Prompt', sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .7px;
    text-transform: uppercase;
    color: #79859a;
    margin-bottom: 3px;
  }

  .agd-req-grid dt i {
    color: #2f8de4;
    font-size: 11px;
  }

  .agd-req-grid dd {
    margin: 0;
    font-family: 'Sarabun', 'Prompt', sans-serif;
    font-size: 13.5px;
    color: #0d1520;
  }

  /* ══ blank state ═════════════════════════════════════════════ */
  .agd-blank {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 48px 30px;
    border: 2px dashed #b9c6d8;
    background: rgba(255, 255, 255, .55);
    box-shadow: none;
  }

  .agd-blank-glyph {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 70px;
    height: 70px;
    margin-bottom: 18px;
    border-radius: 21px;
    background: #ffffff;
    border: 1px solid #ccd6e4;
    color: #8290a3;
    font-size: 27px;
    box-shadow: 0 10px 22px -14px rgba(13, 21, 32, .6);
  }

  .agd-blank-spark {
    position: absolute;
    right: -10px;
    bottom: -8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 29px;
    height: 29px;
    border-radius: 10px;
    background: linear-gradient(150deg, #7c5cff 0%, #b344f5 100%);
    color: #ffffff;
    font-size: 12px;
    font-style: normal;
    box-shadow: 0 10px 20px -8px rgba(109, 74, 255, .95);
    animation: agd-pulse 2.6s ease-in-out infinite;
  }

  @keyframes agd-pulse {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-3px) scale(1.07); }
  }

  .agd-blank-title {
    margin: 0 0 7px;
    font-family: 'Manrope', 'Prompt', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: #46536a;
  }

  .agd-blank-text {
    margin: 0;
    font-family: 'Sarabun', 'Prompt', sans-serif;
    font-size: 13px;
    line-height: 1.8;
    color: #79859a;
  }

  .agd-blank-text b {
    color: #6d4aff;
    font-weight: 700;
  }

  /* ══ fields ══════════════════════════════════════════════════ */
  .agd-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin: 15px 0 6px;
    font-family: 'Manrope', 'Prompt', sans-serif;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: .9px;
    text-transform: uppercase;
    color: #46536a;
  }

  .agd-label:first-child {
    margin-top: 0;
  }

  .agd-counter {
    letter-spacing: 0;
    text-transform: none;
    font-weight: 600;
    color: #79859a;
  }

  .agd-counter.is-over {
    color: #d93a3a;
  }

  .agd-input,
  .agd-textarea {
    width: 100%;
    border: 1px solid #c5d0e0;
    border-radius: 9px;
    padding: 10px 12px;
    background: #ffffff;
    box-shadow: 0 1px 2px rgba(13, 21, 32, .05) inset;
    font-family: 'Sarabun', 'Prompt', sans-serif;
    font-size: 13.5px;
    color: #0d1520;
    transition: border-color .18s ease, box-shadow .18s ease;
  }

  .agd-textarea {
    resize: vertical;
    line-height: 1.75;
  }

  .agd-input:hover,
  .agd-textarea:hover {
    border-color: #9fb0c6;
  }

  .agd-input:focus,
  .agd-textarea:focus {
    outline: none;
    border-color: #6d4aff;
    box-shadow: 0 0 0 3.5px rgba(109, 74, 255, .16);
  }

  /* ══ tasks ═══════════════════════════════════════════════════ */
  .agd-tasks {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .agd-task {
    position: relative;
    display: flex;
    gap: 12px;
    padding-bottom: 14px;
  }

  .agd-task::before {
    content: '';
    position: absolute;
    left: 14px;
    top: 32px;
    bottom: 0;
    width: 2px;
    background: #dde4ee;
  }

  .agd-task:last-child {
    padding-bottom: 0;
  }

  .agd-task:last-child::before {
    display: none;
  }

  .agd-task-no {
    position: relative;
    z-index: 1;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: linear-gradient(150deg, #7c5cff 0%, #b344f5 100%);
    color: #ffffff;
    font-family: 'Manrope', 'Prompt', sans-serif;
    font-size: 12.5px;
    font-weight: 700;
    box-shadow: 0 0 0 3px #ffffff, 0 6px 14px -7px rgba(109, 74, 255, .95);
  }

  .agd-task-body {
    flex: 1;
    min-width: 0;
    padding: 12px 14px 14px;
    border: 1px solid #ccd6e4;
    border-radius: 12px;
    background: #f9fbfe;
  }

  .agd-task-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .agd-task-title {
    font-family: 'Manrope', 'Prompt', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: #0d1520;
  }

  .agd-add {
    width: 100%;
    margin-top: 4px;
    padding: 11px;
    border: 2px dashed #c5d0e0;
    border-radius: 11px;
    background: none;
    font-family: 'Manrope', 'Prompt', sans-serif;
    font-size: 12.5px;
    font-weight: 700;
    color: #6a778a;
    cursor: pointer;
    transition: all .18s ease;
  }

  .agd-add:hover {
    border-color: #6d4aff;
    color: #6d4aff;
    background: #f6f3ff;
  }

  /* ══ footer ══════════════════════════════════════════════════ */
  .agd-foot {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 13px 18px;
  }

  .agd-foot-note {
    flex: 1;
    text-align: center;
    font-family: 'Sarabun', 'Prompt', sans-serif;
    font-size: 12px;
    color: #7b869a;
  }

  .agd-btn {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    padding: 11px 24px;
    border: none;
    border-radius: 10px;
    font-family: 'Manrope', 'Prompt', sans-serif;
    font-size: 13.5px;
    font-weight: 700;
    letter-spacing: .2px;
    color: #ffffff;
    cursor: pointer;
    white-space: nowrap;
    transition: transform .16s ease, box-shadow .16s ease, background .16s ease;
  }

  .agd-btn:last-child {
    margin-left: auto;
  }

  .agd-foot-note ~ .agd-btn {
    margin-left: 0;
  }

  .agd-btn i {
    font-size: 13px;
  }

  .agd-btn:disabled {
    cursor: not-allowed;
    background: #eaeff8 !important;
    color: #a3b0c4 !important;
    box-shadow: 0 0 0 1px #dde5f2 inset !important;
    transform: none !important;
  }

  .agd-btn:not(:disabled):hover {
    transform: translateY(-1px);
  }

  .agd-btn.is-ai {
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, #7c5cff 0%, #b344f5 100%);
    box-shadow: 0 10px 24px -12px rgba(109, 74, 255, 1);
  }

  .agd-btn.is-ai:not(:disabled):hover {
    box-shadow: 0 16px 32px -12px rgba(109, 74, 255, 1);
  }

  .agd-btn.is-ai::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: linear-gradient(100deg, rgba(255, 255, 255, 0) 25%, rgba(255, 255, 255, .34) 50%, rgba(255, 255, 255, 0) 75%);
    transform: translateX(-100%);
  }

  .agd-btn.is-ai:not(:disabled):hover::after {
    animation: agd-sweep 1.1s ease-in-out;
  }

  .agd-btn.is-save {
    background: linear-gradient(135deg, #19c78d 0%, #0ea272 100%);
    box-shadow: 0 10px 24px -12px rgba(25, 199, 141, 1);
  }

  .agd-btn.is-save:not(:disabled):hover {
    box-shadow: 0 16px 32px -12px rgba(25, 199, 141, 1);
  }

  .agd-file-list::-webkit-scrollbar {
    width: 9px;
  }

  .agd-file-list::-webkit-scrollbar-thumb {
    border: 3px solid transparent;
    background-clip: padding-box;
    border-radius: 9px;
    background-color: rgba(13, 21, 32, .22);
  }

  .agd-file-list::-webkit-scrollbar-track {
    background: transparent;
  }

  /* ══ dark mode ═══════════════════════════════════════════════ */
  body.dark-mode .agd-steps,
  body.dark-mode .agd-card {
    background: #151b26;
    border-color: #2f3b4e;
    box-shadow: 0 1px 2px rgba(0, 0, 0, .45), 0 8px 20px -12px rgba(0, 0, 0, .85);
  }

  body.dark-mode .agd-steps li + li {
    border-left-color: #2f3b4e;
  }

  body.dark-mode .agd-step-node {
    background: #1e2634;
    box-shadow: 0 0 0 1.5px #354357 inset;
    color: #8492a6;
  }

  body.dark-mode .agd-steps .is-active {
    background: linear-gradient(180deg, rgba(147, 51, 234, .18) 0%, rgba(147, 51, 234, .03) 100%);
  }

  body.dark-mode .agd-steps .is-active .agd-step-node {
    box-shadow: 0 0 0 4px rgba(109, 74, 255, .2), 0 6px 14px -6px #6d4aff;
  }

  body.dark-mode .agd-steps .is-done .agd-step-node {
    background: rgba(15, 157, 118, .2);
    box-shadow: 0 0 0 1.5px rgba(15, 157, 118, .45) inset;
    color: #34d3a5;
  }

  body.dark-mode .agd-step-text b,
  body.dark-mode .agd-steps .is-active .agd-step-text b,
  body.dark-mode .agd-card-title,
  body.dark-mode .agd-req-name,
  body.dark-mode .agd-task-title,
  body.dark-mode .agd-file-name,
  body.dark-mode .agd-drop-title,
  body.dark-mode .agd-req-grid dd {
    color: #e7ecf3;
  }

  body.dark-mode .agd-step-text small,
  body.dark-mode .agd-drop-sub,
  body.dark-mode .agd-file-desc,
  body.dark-mode .agd-blank-text,
  body.dark-mode .agd-req-grid dt {
    color: #8b98ab;
  }

  body.dark-mode .agd-card-head {
    background: linear-gradient(180deg, #1c2432 0%, #171e2a 100%);
    border-bottom-color: #2f3b4e;
  }

  body.dark-mode .agd-label,
  body.dark-mode .agd-blank-title,
  body.dark-mode .agd-add {
    color: #9aa7b8;
  }

  body.dark-mode .agd-chip {
    background: #10161f;
    box-shadow: 0 0 0 1px #354357 inset;
    color: #9aa7b8;
  }

  body.dark-mode .agd-chip b {
    color: #e7ecf3;
  }

  body.dark-mode .agd-drop {
    border-color: #3a4761;
    background-color: #10161f;
    background-image: radial-gradient(rgba(255, 255, 255, .05) 1px, transparent 1px);
  }

  body.dark-mode .agd-drop:hover,
  body.dark-mode .agd-drop.is-over {
    border-color: #9333ea;
    background-color: rgba(109, 74, 255, .12);
  }

  body.dark-mode .agd-file {
    background: #10161f;
    border-color: #2b3648;
  }

  body.dark-mode .agd-file:hover {
    background: #1a2231;
    border-color: #3d4b62;
  }

  body.dark-mode .agd-icon-btn:hover {
    background: #232c3c;
    color: #e7ecf3;
  }

  body.dark-mode .agd-req-top {
    border-bottom-color: #2f3b4e;
  }

  body.dark-mode .agd-input,
  body.dark-mode .agd-textarea {
    background: #0e131b;
    border-color: #35435a;
    color: #ffffff;
    box-shadow: none;
  }

  body.dark-mode .agd-input:hover,
  body.dark-mode .agd-textarea:hover {
    border-color: #485975;
  }

  body.dark-mode .agd-input:focus,
  body.dark-mode .agd-textarea:focus {
    border-color: #9333ea;
    box-shadow: 0 0 0 3.5px rgba(147, 51, 234, .22);
  }

  body.dark-mode .agd-blank {
    border-color: #35435a;
    background: rgba(21, 27, 38, .5);
  }

  body.dark-mode .agd-blank-glyph {
    background: #151b26;
    border-color: #2f3b4e;
    color: #6b7889;
  }

  body.dark-mode .agd-task::before {
    background: #2f3b4e;
  }

  body.dark-mode .agd-task-no {
    box-shadow: 0 0 0 3px #151b26, 0 6px 14px -7px rgba(109, 74, 255, .95);
  }

  body.dark-mode .agd-task-body {
    background: #10161f;
    border-color: #2b3648;
  }

  body.dark-mode .agd-add {
    border-color: #35435a;
  }

  body.dark-mode .agd-add:hover {
    border-color: #9333ea;
    color: #b98cff;
    background: rgba(147, 51, 234, .1);
  }

  body.dark-mode .agd-file-list::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, .18);
  }

  body.dark-mode .agd-foot-note {
    color: #8b98ab;
  }

  body.dark-mode .agd-btn:disabled {
    background: rgba(255, 255, 255, .08) !important;
    color: rgba(255, 255, 255, .38) !important;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, .12) inset !important;
  }
</style>

<!-- modal chrome : ไม่ scoped และเกาะที่ .agd-dlg บน .modal-dialog โดยตรง
     เพื่อไม่ต้องพึ่ง deep selector (>>>) ที่ loader ของโปรเจกต์นี้ไม่ compile -->
<style>
  .agd-dlg .modal-content {
    border: none !important;
    border-radius: 16px;
    box-shadow: 0 34px 80px -26px rgba(9, 14, 22, .6), 0 4px 12px rgba(9, 14, 22, .14);
  }

  .agd-dlg .modal-header {
    position: relative;
    padding: 0;
    border: none !important;
    background: linear-gradient(112deg, #3b2fb8 0%, #6d4aff 46%, #b344f5 100%) !important;
  }

  .agd-dlg .modal-header::after {
    background: linear-gradient(90deg, rgba(255, 255, 255, .2) 0%, #f0abfc 50%, rgba(255, 255, 255, .2) 100%);
  }

  .agd-dlg .modal-header .modal-header-inner {
    padding: 0;
  }

  .agd-dlg .modal-header .close {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 2;
    width: 32px;
    height: 32px;
    margin: 0;
    border-radius: 9px;
    background: rgba(255, 255, 255, .12);
    color: #fff;
    opacity: .85;
    text-shadow: none;
    font-size: 21px;
    line-height: 28px;
    transition: all .18s ease;
  }

  .agd-dlg .modal-header .close:hover {
    opacity: 1;
    background: rgba(255, 255, 255, .24);
  }

  .agd-dlg .modal-body {
    padding: 18px 20px 22px;
    background-color: #f2f6fd !important;
    background-image: radial-gradient(rgba(109, 74, 255, .09) 1px, transparent 1px);
    background-size: 17px 17px;
  }

  .agd-dlg .modal-footer {
    padding: 0;
    border-top: 1px solid #e3e9f6 !important;
    background: linear-gradient(180deg, #ffffff 0%, #f4f7fd 100%) !important;
  }

  .agd-dlg .modal-body::-webkit-scrollbar {
    width: 10px;
  }

  .agd-dlg .modal-body::-webkit-scrollbar-thumb {
    border: 3px solid transparent;
    background-clip: padding-box;
    border-radius: 10px;
    background-color: rgba(13, 21, 32, .26);
  }

  .agd-dlg .modal-body::-webkit-scrollbar-thumb:hover {
    background-color: rgba(13, 21, 32, .4);
  }

  body.dark-mode .agd-dlg .modal-content {
    background: #0a0e15;
  }

  body.dark-mode .agd-dlg .modal-body {
    background-color: #0a0e15 !important;
    background-image: radial-gradient(rgba(255, 255, 255, .055) 1px, transparent 1px);
  }

  body.dark-mode .agd-dlg .modal-footer {
    border-top-color: #1e2634 !important;
    background: linear-gradient(180deg, #121821 0%, #0c1117 100%) !important;
  }

  body.dark-mode .agd-dlg .modal-body::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, .2);
  }
</style>
