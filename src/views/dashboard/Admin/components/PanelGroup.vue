<template>
  <el-row :gutter="40" class="panel-group">
    <el-col :xs="12" :sm="12" :md="12" :lg="8" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('newVisitis')">
        <div class="card-panel-icon-wrapper icon-people">
          <svg-icon icon-class="server" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">Hosts</div>
          <span class="card-panel-num">{{ stats.hostNumber }}</span>
          <!--<count-to :start-val="0" :end-val="102400" :duration="2600" class="card-panel-num" />-->
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :md="12" :lg="8" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('messages')">
        <div class="card-panel-icon-wrapper icon-message">
          <svg-icon icon-class="cpu" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">Cpu(cores)</div>
          <span class="card-panel-num">{{ stats.cpuCoreNumber }}</span>
          <!--<count-to :start-val="0" :end-val="81212" :duration="3000" class="card-panel-num" />-->
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :md="12" :lg="8" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('purchases')">
        <div class="card-panel-icon-wrapper icon-money">
          <svg-icon icon-class="memory" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">Memory(GB)</div>
          <span class="card-panel-num">{{ (stats.memorySize / 1024).toFixed(0) }}</span>
          <!--<count-to :start-val="0" :end-val="9280" :duration="3200" class="card-panel-num" />-->
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :md="12" :lg="8" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('shoppings')">
        <div class="card-panel-icon-wrapper icon-shopping">
          <svg-icon icon-class="disk" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">Disk(GB)</div>
          <span class="card-panel-num">{{ stats.diskSize }}</span>
          <!-- <CountTo :start-val="0" :end-val="13600" class="card-panel-num" />-->
        </div>
      </div>
    </el-col>

    <el-col :xs="12" :sm="12" :md="12" :lg="8" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('shoppings')">
        <div class="card-panel-icon-wrapper icon-alarm">
          <svg-icon icon-class="alarm1" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">Unrecovered Alarms</div>
          <span class="card-panel-num">{{ stats.unrecoveredCount }}</span>
          <!-- <CountTo :start-val="0" :end-val="13600" class="card-panel-num" />-->
        </div>
      </div>
    </el-col>

    <el-col :xs="12" :sm="12" :md="12" :lg="8" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('shoppings')">
        <div class="card-panel-icon-wrapper icon-interval">
          <svg-icon icon-class="time" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">Recovery Interval(s)</div>
          <span class="card-panel-num">{{ stats.averageRecoveredInterval }}</span>
          <!-- <CountTo :start-val="0" :end-val="13600" class="card-panel-num" />-->
        </div>
      </div>
    </el-col>

  </el-row>
</template>

<script setup>
const emit = defineEmits(['handleSetLineChartData'])
const handleSetLineChartData = (type) => {
  emit('handleSetLineChartData', type)
}

onMounted(() => {
  queryHostStats()
})

let stats = reactive({
  hostNumber: 0,
  cpuCoreNumber: 0,
  memorySize: 0,
  diskSize: 0,
  averageRecoveredInterval: 0,
  last7DaysCount: 0,
  unrecoveredCount: 0,
})
let queryHostStats = () => {
  axiosReq({
    url: '/api/mall3/cmdb//host/stats/all',
    method: 'get'
  }).then((resData) => {
    const data = resData.data
    Object.keys(data).forEach((fItem) => {
      Object.keys(stats).forEach((sItem) => {
        if (fItem === sItem) {
          stats[sItem] = data[sItem]
        }
      })
    })
  })
  axiosReq({
    url: '/api/mall3/alarm/stats',
    method: 'get'
  }).then((resData) => {
    const data = resData.data
    Object.keys(data).forEach((fItem) => {
      Object.keys(stats).forEach((sItem) => {
        if (fItem === sItem) {
          stats[sItem] = data[sItem]
        }
      })
    })
  })
}

</script>

<style lang="scss" scoped>
.panel-group {
  margin-top: 18px;

  .card-panel-col {
    margin-bottom: 32px;
  }

  .card-panel {
    min-height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.05);

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-people {
        background: #40c9c6;
      }

      .icon-message {
        background: #36a3f7;
      }

      .icon-money {
        background: #f4516c;
      }

      .icon-shopping {
        background: #f27be4;
      }

      .icon-interval {
        background: #9cca97;
      }

      .icon-alarm {
        background: #620101;
      }
    }

    .icon-people {
      color: #40c9c6;
    }

    .icon-message {
      color: #36a3f7;
    }

    .icon-money {
      color: #f4516c;
    }

    .icon-shopping {
      color: #f27be4;
    }

    .icon-interval {
      color: #9cca97;
    }

    .icon-alarm {
      color: #620101;
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 48px;
    }

    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}

@media (max-width: 550px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>
