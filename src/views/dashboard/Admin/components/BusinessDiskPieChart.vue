<template>
  <div :class="className" :style="{ height: height, width: width }" />
</template>

<script setup>
import { onMounted, getCurrentInstance, reactive, onBeforeUnmount, watch } from 'vue'
import echarts from 'echarts'
//获取store和router
const props = defineProps({
  className: {
    type: String,
    default: 'chart'
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '400px'
  },
  statsData: {
    type: Array,
    required: true
  }
})
const state = reactive({
  chart: null
})

watch(
  () => props.statsData,
  (value) => {
    setOptions(value)
  },
  { immediate: false }
)

onMounted(() => {
  nextTick(() => {
    initChart()
  })
})
onBeforeUnmount(() => {
  if (!state.chart) {
    return
  }
  state.chart.dispose()
  state.chart = null
})

const { proxy } = getCurrentInstance()
const initChart = () => {
  state.chart = echarts.init(proxy.$el, 'macarons')
  setOptions(props.statsData)
}

watch(
  () => props.statsData,
  (value) => {
    setOptions(value)
  },
  { immediate: false }
)

const setOptions = (statsData) => {
  let businessNames = new Set()
  let businessHostStats = {}

  for (const systemHostStats of statsData) {
    let businessName = systemHostStats.businessName
    if (businessName === null) {
      businessName = 'Others'
    }
    businessNames.add(businessName)
    if (businessHostStats[businessName] === undefined) {
      businessHostStats[businessName] = systemHostStats.diskSize
    } else {
      businessHostStats[businessName] += systemHostStats.diskSize
    }
  }
  let businessNameArray = Array.from(businessNames)
  let memorySizeData = Object.keys(businessHostStats).map(businessName => {
    return {
      name: businessName, value: businessHostStats[businessName]
    }
  })

  state.chart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      left: 'center',
      bottom: '10',
      data: businessNameArray
    },
    series: [
      {
        name: 'Business Disk(GB)',
        type: 'pie',
        // roseType: 'area',
        radius: [40, 140],
        center: ['50%', '42%'],
        data: memorySizeData,
        // animationEasing: 'cubicInOut',
        animationDuration: 1600
      }
    ]
  })
}
</script>

<style scoped lang="scss">
</style>
