import axios from 'axios';
import moment from 'moment'
import * as mathjs from 'mathjs';
import { dummy } from './databus.js';

export default class PPN {
  #api;
  #computedHoliday;
  #computedPlan;
  #comptedPg;
  #comptedMh;
  #comptedDep;
  #computedEmp;
  #rawTasks;
  #pre_event;
  #at_date

  constructor({ maincode = '', pre_event = '', at_date = moment().format('YYYY-MM-DD') }) {
    dummy();
    this.#at_date = at_date;
    this.#pre_event = pre_event;
    this.#api = this.#createAxios({ maincode, pre_event });
  }

  #createAxios({ maincode = '', pre_event = '' }) {
    return axios.create({
      baseURL: "https://api.mangoanywhere.com/mango_team_api/",  // base URL
      timeout: 15000,                       // timeout (ms)
      headers: { "Content-Type": "application/json" },
      params: {
        maincode,   // query param ติดไปทุก request
        pre_event
      }
    });
  }

  #normalizeText(text) {
    return typeof text === 'string'
      ? text.toUpperCase().trim().replace(/\s+/g, ' ')
      : text;
  }

  #formatName({ empfullname_t = '' }) {
    const name_spliter = empfullname_t.split(' ');
    return [...[...name_spliter].slice(1, name_spliter.length), ...[name_spliter[0]]].join(' ').trim();
  }

  async #getDatafromHw(endpoint) {
    return await this.#api.get(endpoint)
  }

  async #getHoliday() {
    const { data = [] } = await this.#getDatafromHw(`/wbs_weekend`);

    const formatted = Object.create(null);

    for (const { plan_code, weekend_date } of data) {
      // ถ้า weekend_date เป็น 'YYYY-MM-DD...' ตัดแค่ 10 ตัวอักษร
      const d = weekend_date && weekend_date.length >= 10
        ? weekend_date.slice(0, 10)
        : weekend_date;

      // cache object ราย plan_code
      const bucket = formatted[plan_code] || (formatted[plan_code] = Object.create(null));
      bucket[d] = 1;
    }

    this.#computedHoliday = formatted
    //console.log(this.#computedHoliday)
  };

  async #getPlan() {
    const { data = [] } = await this.#getDatafromHw(`/plan2`);

    // ใช้ plain object ไม่มี prototype
    const out = Object.create(null);

    for (const x of data) {
      // ข้าม record ที่ pn_active เป็น 'N'
      if ((x.pn_active || 'Y') === 'N') continue;

      // clone บางส่วนกัน side-effect (ถ้าไม่ต้องการแก้ x ต้นฉบับ)
      const i = { ...x };

      // normalize ชื่อแผน: ระวังชื่อ field (เดิมใช้ทั้ง plan_name และ planname)
      if (i.plan_name) {
        i.plan_name = this.#normalizeText(i.plan_name);
      } else if (i.planname) {
        i.plan_name = this.#normalizeText(i.planname);
      }

      // สร้าง owner_index: 'a,b,c' -> { a:1, b:1, c:1 }
      const owners = (i.owner || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      if (owners.length) {
        const idx = Object.create(null);;
        for (const id of owners) idx[id] = 1;
        i.owner_index = idx;
      } else {
        i.owner_index = Object.create(null);;
      }

      out[i.plan_code] = i;
    }

    this.#computedPlan = out;
    //console.log(this.#computedPlan)
  }

  async #getProgressAndManhours() {
    const [
      { data: pg = [] },
      { data: mh = [] }
    ] = await Promise.all([
      this.#getDatafromHw(`/progress2`),
      this.#getDatafromHw(`/manhours`)
    ]);

    this.#comptedPg = Object.create(null)
    pg.reduce((pg_group, item) => {
      const { plan_code = '', wbsid = '', qty = 0, progress_datetime } = item;

      const plan = (pg_group[plan_code] ??= Object.create(null));
      const task = (plan[wbsid] ??= Object.create(null));

      const date_format = progress_datetime.slice(0, 10);
      task[date_format] = mathjs.round((task[date_format] || 0) + qty, 2);

      return pg_group;
    }, this.#comptedPg);

    this.#comptedMh = Object.create(null)
    mh.reduce((mh_group, item) => {
      const { plan_code = '', taskid = '', manhour_pg = 0 } = item;
      const plan = mh_group[plan_code] ??= Object.create(null);
      plan[taskid] = mathjs.round((plan[taskid] ?? 0) + manhour_pg, 2);

      return mh_group;
    }, this.#comptedMh);

    //console.log(this.#comptedPg)
    //console.log(this.#comptedMh)
  }

  async #getTasks() {
    let { data = [] } = await this.#getDatafromHw(`/task2`);
    for (const i of data) {
      i.wbs_id = (i.wbs_id || '').trim()

      if (!i.wbs_id || !i.start_date) { continue }

      i.taskname &&= this.#normalizeText(i.taskname);
      i.levels = i.wbs_id.split('.').length
      i.start_date &&= moment(i.start_date).format('YYYY-MM-DD');
    }
    this.#rawTasks = data;

    //console.log(this.#rawTasks)
  }

  async #getEmp() {
    const [
      { data: data_dep = [] },
      { data: data_emp = [] }
    ] = await Promise.all([
      this.#getDatafromHw(`/department`),
      this.#getDatafromHw(`/employee`)
    ]);

    this.#comptedDep = data_dep
      .reduce((acc, i) => {
        i.dpt_name &&= this.#normalizeText(i.dpt_name)
        acc[i.dpt_code] = i;
        return acc;
      }, Object.create(null));

    this.#computedEmp = data_emp
      .reduce((acc, i) => {
        let { empno, empfullname_t = '', empresign, dpt_code } = i;
        const { dpt_name: department = '' } = this.#comptedDep[dpt_code] || {};

        empfullname_t = this.#normalizeText(empfullname_t)
        const formatted_name = this.#formatName({ empfullname_t })

        if (empresign !== 'Y' && department) {
          const members = (this.#comptedDep[dpt_code].members ||= []);
          members.push(empno);
        }

        i.empfullname_t = empfullname_t;
        i.formatted_name = formatted_name;
        i.department = department;

        acc[`${empno}`] = i;
        return acc
      }, Object.create(null));

    //console.log(this.#comptedDep)
    //console.log(this.#computedEmp)
  }

  #computedProgress({ plan_code = '', pre_event = '', start_date, qty = 0, duration = 0 }) {
    const qty_day = duration === 0 ? 0 : mathjs.round(qty / duration, 2);
    const mm = moment(start_date).startOf('day');

    const work_date = Object.create(null);
    const holidays =
      this.#computedHoliday[plan_code] ||
      this.#computedHoliday[pre_event] ||
      Object.create(null);

    let daycount = 0;
    let qty_acc = 0;
    let end_date = start_date;

    for (let i = 0; i <= 100000; i++) {
      // ใช้ format
      const date_format = mm.format('YYYY-MM-DD');
      end_date = date_format;

      // เพิ่ม 1 วันเพื่อใช้ใน loop ถัดไป
      mm.add(1, 'days');

      // ข้ามถ้าเป็นวันหยุด
      if (holidays[date_format]) continue;

      // บวกวันทำงานไป 1 วัน
      daycount++;

      // วันสุดท้าย
      if (daycount === duration) {
        const lastQty = mathjs.round(qty - qty_acc, 2);
        work_date[date_format] = { qty_day: lastQty, qty_acc: qty, qty_acc_per: 100 };
        break;
      }

      // วันปกติ
      const nextAcc = mathjs.round(qty_acc + qty_day, 2);
      if (nextAcc > qty) {
        work_date[date_format] = {
          qty_day: 0,
          qty_acc: qty_acc,
          qty_acc_per: mathjs.round((qty_acc / qty) * 100, 8)
        };
      } else {
        qty_acc = nextAcc;
        work_date[date_format] = {
          qty_day,
          qty_acc,
          qty_acc_per: mathjs.round((qty_acc / qty) * 100, 8)
        };
      }
    }

    return { end_date, work_date };
  }

  #getStatus({ at, start_date, end_date, qty_progress_per, qty_acc_per }) {
    if (qty_progress_per === 100) return 'completed';
    if (at < start_date && qty_progress_per === 0) return 'notstart';
    if (at < end_date && qty_progress_per < qty_acc_per) return 'lated';
    if (at < end_date && qty_progress_per < 100) return 'inprocess';
    if (at >= end_date && qty_progress_per < 100) return 'overdue';
    return 'inprocess';
  }

  #getWorkDate({ at, end_date, work_date }) {
    let key = '';

    if (work_date[at]) {
      key = at;
    } else if (at > end_date) {
      key = end_date;
    } else {
      key = Object.keys(work_date).toReversed().find(f => f <= at) || '';
    }

    const {
      qty_day: qty_today = 0,
      qty_acc = 0,
      qty_acc_per = 0
    } = work_date[key] || Object.create(null);

    return {
      qty_today,
      qty_acc,
      qty_acc_per
    }
  }

  #fixPercent(p) {
    if (p > 100) return 100;
    if (p < 0) return 0;
    return p;
  }

  #getQtyProgress({ plan_code, taskid, at }) {
    const pg = this.#comptedPg[plan_code]?.[taskid] || Object.create(null);

    const qty_progress = Object.keys(pg)
      .reduce((acc, i) => {
        return mathjs.round(acc + (i <= at ? (pg[i] || 0) : 0), 2);
      }, 0) || 0;

    return qty_progress;
  }

  #getTodayProgress({ plan_code, taskid, start_date, end_date, qty, work_date = Object.create(null) }) {
    const at = this.#at_date;

    const {
      qty_day: qty_today = 0,
      qty_acc = 0,
      qty_acc_per = 0
    } = this.#getWorkDate({ at, end_date, work_date });

    const qty_progress = this.#getQtyProgress({ plan_code, taskid, at });

    const manhour = this.#comptedMh[plan_code]?.[taskid] || 0;

    const qty_progress_per = this.#fixPercent(qty === 0 ? 0 : mathjs.round((qty_progress / qty) * 100, 2));

    const status = this.#getStatus({ at, start_date, end_date, qty_progress_per, qty_acc_per });

    return {
      qty_today,
      qty_acc,
      qty_acc_per,
      qty_progress,
      qty_progress_per,
      manhour,
      status
    };
  }

  #getTaskOwner({ owner_id = '' }) {
    const workers = owner_id
      .trim()
      .split(',')
      .filter(f => f)
      .map(m => ({ empno: m, emp_name: this.#computedEmp[m]?.formatted_name || m }));

    return { workers }
  }

  #createTaskIndexer() {
    return this.#rawTasks
      .reduce((acc, item) => {
        const { plan_code, taskid } = item;

        const plan = acc[plan_code] ||= Object.create(null);
        plan[taskid] = item;

        return acc;
      }, Object.create(null));
  }

  #getPath({ plan_code = '', taskid = '', taskIndexer = Object.create(null) }) {
    const path = [];
    const { taskid_h: parent_inner, taskname: task_name_inner } = taskIndexer[plan_code]?.[taskid] || Object.create(null);
    let parent = parent_inner;

    path.push(task_name_inner);

    while (taskIndexer[plan_code]?.[parent]) {
      const { taskname: task_name, taskid_h: parent_item } = taskIndexer[plan_code]?.[parent] || Object.create(null);
      path.push(task_name);
      parent = parent_item;
    }

    const { plan_name = '' } = this.#computedPlan[plan_code] || Object.create(null);

    path.push(plan_name);

    return { task_path: this.#normalizeText(path.toReversed().join(' >> ') || '') };
  }

  #processData() {
    const taskIndexer = this.#createTaskIndexer();

    const computedTasks = [];

    for (const item of this.#rawTasks) {
      // ข้อมูลจาก tasks
      let {
        plan_code,
        pre_event,
        taskid,
        taskname: task_name,
        start_date,
        qty = 0,
        duration,
        task_type,
        wbs_id,
        other_wbs: csm_no = '',
        owner_id = '',
        levels
      } = item;

      //ข้อมูลจากแผนโดยอ้างอิงจาก plan_code
      let {
        plan_name,
        pn_active
      } = this.#computedPlan[plan_code] || Object.create(null);

      // สนใจแต่ task ไม่เอา head task และ แผนต้อง active
      if (task_type !== 'task' || pn_active !== 'Y') { continue }

      // สร้าง task path
      const {
        task_path
      } = this.#getPath({ plan_code, taskid, taskIndexer });

      // หา work_date และ end_date
      const {
        end_date,
        work_date
      } = this.#computedProgress({ plan_code, pre_event, start_date, qty, duration });

      // การคำนวน accumulate
      const {
        qty_today,
        qty_acc,
        qty_acc_per,
        qty_progress,
        qty_progress_per,
        manhour,
        status
      } = this.#getTodayProgress({ plan_code, taskid, start_date, end_date, qty, work_date });

      // หา workers
      const { workers } = this.#getTaskOwner({ owner_id });

      // เพิ่มข้อมูลเข้าไปใน list
      computedTasks.push({
        plan_code,
        taskid,
        wbs_id,
        levels,
        plan_name,
        task_name,
        task_path,
        csm_no,
        duration,
        start_date,
        end_date,
        qty_today,
        qty_acc,
        qty_acc_per,
        qty_progress,
        qty_progress_per,
        manhour,
        status,
        workers
      });
    }

    return computedTasks
  }

  async reloadData() {
    console.time('fetch_data')
    await Promise.all([
      this.#getEmp(),
      this.#getHoliday(),
      this.#getPlan(),
      this.#getProgressAndManhours(),
      this.#getTasks()

    ]);
    console.timeEnd('fetch_data')
  }

  getProcessedData() {
    console.time('process_data')
    const computedTasks = this.#processData();
    console.timeEnd('process_data')
    //console.log(computedTasks)

    return computedTasks;
  }

  getDepartments() {
    return JSON.parse(JSON.stringify(this.#comptedDep))
  }

  getEmployee() {
    return JSON.parse(JSON.stringify(this.#computedEmp))
  }
}
