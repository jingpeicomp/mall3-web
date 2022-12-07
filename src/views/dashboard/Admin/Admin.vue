<template>
  <div class="dashboard-editor-container">
    <GithubCorner class="github-corner" />
    <PanelGroup @handleSetLineChartData="handleSetLineChartData" />
    <!-- <el-row style="background: #fff; padding: 16px 16px 0; margin-bottom: 32px">
      <LineChart :chart-data="lineChartData ?? {}" />
    </el-row> -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <BusinessHostPieChart :stats-data="state.systemHostStats" />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <BusinessCpuPieChart :stats-data="state.systemHostStats" />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <BusinessMemoryPieChart :stats-data="state.systemHostStats" />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <BusinessDiskPieChart :stats-data="state.systemHostStats" />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { toRefs, reactive } from 'vue'
import GithubCorner from '@/views/dashboard/GithubCorner'
import PanelGroup from './components/PanelGroup.vue'
import BusinessHostPieChart from './components/BusinessHostPieChart.vue'
import BusinessCpuPieChart from './components/BusinessCpuPieChart.vue'
import BusinessMemoryPieChart from './components/BusinessMemoryPieChart.vue'
import BusinessDiskPieChart from './components/BusinessDiskPieChart.vue'
const lineChart = {
  newVisitis: {
    expectedData: [100, 120, 161, 134, 105, 160, 165],
    actualData: [120, 82, 91, 154, 162, 140, 145]
  },
  messages: {
    expectedData: [200, 192, 120, 144, 160, 130, 140],
    actualData: [180, 160, 151, 106, 145, 150, 130]
  },
  purchases: {
    expectedData: [80, 100, 121, 104, 105, 90, 100],
    actualData: [120, 90, 100, 138, 142, 130, 130]
  },
  shoppings: {
    expectedData: [130, 140, 141, 142, 145, 150, 160],
    actualData: [120, 82, 91, 154, 162, 140, 130]
  }
}
const state = reactive({
  lineChartData: lineChart.newVisitis,
  systemHostStats: []
})

const handleSetLineChartData = (type) => {
  state.lineChartData = lineChartData[type]
}
let { lineChartData } = toRefs(state)

onMounted(() => {
  queryBusinessHostStats()
})

const queryBusinessHostStats = () => {
  axiosReq({
    url: '/api/mall3/cmdb/host/stats/system',
    method: 'get'
  }).then((resData) => {
    state.systemHostStats = resData.data
  })
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  // background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
