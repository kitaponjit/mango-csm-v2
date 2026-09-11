import { ref } from '@vue/composition-api'

function customOrderBy(array, ...selectors) {
  const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });

  return [...array].sort((a, b) => {
    for (const selector of selectors) {
      const aField = selector(a);
      const bField = selector(b);

      const [dirKeyA] = Object.keys(aField);
      const [dirKeyB] = Object.keys(bField);

      const dirA = dirKeyA.toLowerCase() === 'desc' ? -1 : 1;
      const dirB = dirKeyB.toLowerCase() === 'desc' ? -1 : 1;

      const valA = aField[dirKeyA];
      const valB = bField[dirKeyB];

      const cmp = typeof valA === 'number' && typeof valB === 'number'
        ? valA - valB
        : collator.compare(String(valA ?? ''), String(valB ?? ''));

      if (cmp !== 0) return dirA * cmp;
    }
    return 0;
  });
}

function customGroupBy(array, keyFn) {
  const assertPrimitiveOrPlainObject = (value) => {
    // primitive type (รวม null ด้วย)
    if (value === null) return;
    if (["string", "number", "bigint", "boolean", "undefined", "symbol"].includes(typeof value)) {
      return;
    }

    // ตรวจสอบว่าเป็น plain object เท่านั้น
    if (typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
      return;
    }

    // ถ้าไม่ใช่ → โยน error
    throw new TypeError(`customGroupBy : Value is not a primitive type or plain object: ${value}`);
  }

  const map = new Map();

  for (const item of array) {
    const key0 = keyFn(item);

    assertPrimitiveOrPlainObject(key0)

    const key = JSON.stringify(key0);

    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(item);
  }

  return Array.from(map.entries()).map(([key, values]) => ({ key: JSON.parse(key), values }));
}

const serviceType = ref([])
const departments = ref([])
const depEmp = ref({})
const condInput = ref({})
const rawData = ref([])
const filterdData = ref([])
const filterdData2 = ref([])
const priority = ref([])
const allComplete = ref([])

const statusCodeData = [
  { id: 'W', name: 'Wait' },
  { id: 'H', name: 'Hold' },
  { id: 'I', name: 'In Progress' },
  { id: 'B', name: 'Send Back' },
  { id: 'S', name: 'Send Pretest' },
  { id: 'T', name: 'Test' },
  { id: 'X', name: 'Send To QC' },
  { id: 'U', name: 'Update Program' },
  { id: 'Y', name: 'Complete' },
  { id: 'R', name: 'Reject' },
  { id: 'N', name: 'Cancel' },
]

const chartGrid = () => ({
  containLabel: true,
  left: 8,
  right: 16,
  top: 32,
  bottom: 4
})

const chartTooltip = () => ({
  trigger: 'axis',
  axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(29, 43, 83, .05)' } },
  confine: true,
  backgroundColor: '#1d2b53',
  borderWidth: 0,
  padding: [8, 12],
  textStyle: { color: '#ffffff', fontSize: 12 },
  extraCssText: 'border-radius:10px;box-shadow:0 14px 30px -14px rgba(19,29,59,.9);'
})

const chartXAxis = (data) => ({
  type: 'category',
  data,
  axisLine: { lineStyle: { color: '#dfe4ee' } },
  axisTick: { show: false },
  axisLabel: {
    interval: 0,
    rotate: 45, //If the label names are too long you can manage this by rotating the label.
    color: '#5b6478',
    fontSize: 11
  }
})

const chartYAxis = () => ({
  type: 'value',
  axisLine: { show: false },
  axisTick: { show: false },
  axisLabel: { color: '#8a93a8', fontSize: 11 },
  splitLine: { lineStyle: { color: '#eef1f7', type: 'dashed' } }
})

const chartBarStyle = () => ({
  barMaxWidth: 46,
  itemStyle: { borderRadius: [4, 4, 0, 0] },
  emphasis: { itemStyle: { shadowBlur: 12, shadowColor: 'rgba(29, 43, 83, .35)' } },
  label: {
    show: true,
    position: 'top',
    color: '#2a3550',
    fontSize: 11,
    fontWeight: 600
  }
})

const createBarOption = (data) => {
  return {
    grid: chartGrid(),
    tooltip: chartTooltip(),
    xAxis: chartXAxis(data.map(x => x.name)),
    yAxis: chartYAxis(),
    series: [
      {
        data: data.map(x => ({ value: x.value, itemStyle: { color: x.color || undefined }, details: x.details || [] })),
        type: 'bar',
        ...chartBarStyle()
      }
    ]
  };
}

const createBarOption2 = (data, lables) => {
  let series = [];
  let legend = data.map(z => z.name)

  data.forEach(z => {
    let name = z.name
    series.push({
      name,
      data: z.data.map(x => ({ value: x.value, itemStyle: { color: x.color || undefined }, details: x.details || [] })),
      type: 'bar',
      ...chartBarStyle()
    })
  })

  return {
    grid: chartGrid(),
    tooltip: chartTooltip(),
    xAxis: chartXAxis(lables),
    yAxis: chartYAxis(),
    series,
    //legend
  };
}

const chartClick = (e) => {
  let nw = window.open(window.baseUrl + 'page/it_dev_dashboard/it_dev_dashboard_001_details', '_blank')
  nw.window.pass_data = JSON.stringify(e?.data?.details || [])
}

function debounce(func, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

function dummy() { }

(() => {
  if (!Array.prototype.customOrderBy) {
    Object.defineProperty(Array.prototype, 'customOrderBy', {
      value: function (...selectors) {
        return customOrderBy(this, ...selectors);
      },
      enumerable: false
    });
  }

  if (!Array.prototype.customGroupBy) {
    Object.defineProperty(Array.prototype, 'customGroupBy', {
      value: function (keyFn) {
        return customGroupBy(this, keyFn);
      },
      enumerable: false
    });
  }
})();

export {
  dummy,
  statusCodeData,
  debounce,
  serviceType,
  condInput,
  rawData,
  filterdData,
  filterdData2,
  createBarOption,
  createBarOption2,
  chartClick,
  departments,
  depEmp,
  priority,
  allComplete
}
