<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="1450px" height="700px" :close-on-click-modal="false"
    :before-close="closeFormModal">

    <el-steps :active="activeStep" finish-status="success" style="margin-bottom: 40px;">
      <el-step title="Basic Setting*" />
      <el-step title="Bind Module" />
      <el-step title="Bind Host" />
      <el-step title="Rule*" />
    </el-steps>
    <el-form ref="refForm" label-width="150px" :inline="false" :model="subForm" :rules="formRules" class="pr-5"
      label-position="top">
      <el-form-item v-show="activeStep === 0" label="Name" prop="name" :rules="formRules.isNotNull"
        label-position="left">
        <el-input v-model="subForm.name" min-width="300" placeholder="Name" :disabled="isEditDialog" />
      </el-form-item>
      <el-form-item v-show="activeStep === 0" label="Aggregate Interval(s)" prop="secondPerPeriod"
        :rules="formRules.isNotNull" label-position="left">
        <el-input v-model="subForm.secondPerPeriod" min-width="300" placeholder="Aggregate Interval(s)" />
      </el-form-item>
      <div v-show="activeStep === 0" style="height:410px"></div>
      <el-form-item v-show="activeStep === 1" label="" prop="bindModules" label-position="top">
        <div>
          <el-tree-select v-model="bindModuleIds" :data="selectBoxDatasource" multiple :render-after-expand="true"
            show-checkbox collapse-tags style="width:400px" />
          <el-table :data="subForm.bindModules" :border="false" style="width:100%" height="500">
            <el-table-column label="Module Id" prop="moduleId" width="120" />
            <el-table-column label="Module Name" prop="instance.name" min-width="150" />
            <el-table-column label="Module Weight" prop="instance.weight" width="120" />
            <el-table-column label="Business Name" prop="instance.businessName" min-width="120" />
            <el-table-column label="System Name" prop="instance.systemName" min-width="120" />
            <el-table-column label="Set Name" prop="instance.setName" min-width="120" />
            <el-table-column fixed="right" label="Operations" width="100">
              <template #default="scope">
                <el-button link type="primary" size="small" @click.prevent="deleteBindModule(scope.row)">
                  Remove
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form-item>
      <el-form-item v-show="activeStep === 2" label="" prop="bindHosts" label-position="top">
        <div>
          <el-select-v2 v-model="bindHostIds" filterable :options="hostOptions"
            placeholder="Support filter, please select" multiple show-checkbox collapse-tags style="width:500px" />
          <el-table :data="subForm.bindHosts" :border="false" style="width:100%" height="500">
            <el-table-column label="Host Id" prop="hostId" width="120" />
            <el-table-column label="Host Name" prop="hostName" min-width="200" />
            <el-table-column label="Intranet Ip" prop="detail.intranetIp" min-width="200" />
            <el-table-column label="Internet Ip" prop="detail.internetIp" min-width="200" />
            <el-table-column fixed="right" label="Operations" width="100">
              <template #default="scope">
                <el-button link type="primary" size="small" @click.prevent="deleteBindHost(scope.row)">
                  Remove
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form-item>
      <el-form-item v-show="activeStep === 3" label="" prop="rules" :rules="formRules.isNotNull" label-position="top"
        style="width: 100%">
        <div>
          <el-table :data="subForm.rules" :border="false" height="526" scrollbar-always-on style="width:100%">
            <el-table-column label="Weight" prop="weight" width="100">
              <template #default="{ row }">
                <el-input-number v-model="row.weight" :precision="1" :step="1" size="small" :min="1"
                  controls-position="right" style="width:80px" />
              </template>
            </el-table-column>

            <el-table-column label="Rule Type" prop="type">
              <template #default="{ row }">
                <el-select v-model="row.type" placeholder="Rule Type">
                  <el-option v-for="item in ruleTypeOptions" :key="item.value" :label="item.display"
                    :value="item.value" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="Metric" prop="metricId" min-width="150">
              <template #default="{ row }">
                <el-select-v2 v-model="row.metricId" :options="metricOptions" placeholder="Please select metric"
                  :disabled="row.type != 2" />
              </template>
            </el-table-column>

            <el-table-column label="Detection Function">
              <template #default="{ row }">
                <el-select v-model="row.detectionFunction" placeholder="Detection Function" :disabled="row.type != 2">
                  <el-option v-for="item in detectionFunctionOptions" :key="item.value" :label="item.display"
                    :value="item.value" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="Baseline" prop="baselineCfgId" min-width="150">
              <template #default="{ row }">
                <el-select-v2 v-model="row.baselineCfgId" :options="baselineOptions"
                  :disabled="row.detectionFunction != 3" placeholder="Please select baseline"
                  @change="ruleBaselineSelectChange(row.baselineCfgId)" />
              </template>
            </el-table-column>
            <el-table-column label="Baseline Field Name" prop="baselineField" min-width="150">
              <template #default="{ row }">
                <el-select-v2 v-model="row.baselineField" :options="baselineFieldOptions"
                  :disabled="row.detectionFunction != 3" placeholder="Please select baseline feild" />
              </template>
            </el-table-column>
            <el-table-column label="Baseline Field Function">
              <template #default="{ row }">
                <el-select v-model="row.baselineFunction" placeholder="Field function"
                  :disabled="row.detectionFunction != 3">
                  <el-option v-for="item in functionOptions" :key="item.value" :label="item.display"
                    :value="item.value" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="Baseline Field Expression" prop="baselineFieldExpression" width="120">
              <template #default="{ row }">
                <el-input v-model="row.baselineFieldExpression" :rows="3" type="textarea"
                  :disabled="row.detectionFunction != 3" />
              </template>
            </el-table-column>
            <el-table-column label="Condition JS Script" prop="conditionScript" min-width="200">
              <template #default="{ row }">
                <el-input v-model="row.conditionScript" :rows="3" type="textarea"
                  placeholder="Please input Javascript, the result should be bool" />
              </template>
            </el-table-column>
            <el-table-column label="Score JS Script" prop="scoreScript" min-width="200">
              <template #default="{ row }">
                <el-input v-model="row.scoreScript" :rows="3" type="textarea"
                  placeholder="Please input Javascript, the result should be number" />
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="Operations" width="80">
              <template #header>
                <el-button link type="primary" size="small" @click.prevent="addRule()">
                  <el-icon style="vertical-align: middle">
                    <FolderAdd />
                  </el-icon>
                  <span style="vertical-align: middle">Add</span>
                </el-button>
              </template>
              <template #default="scope">
                <el-button link type="primary" size="small" @click.prevent="deleteRule(scope.$index)">
                  Remove
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button v-show="activeStep > 0" @click="previousStep">Previous</el-button>
        <el-button v-show="activeStep < 3" @click="nextStep">Next</el-button>
        <el-button @click="closeFormModal">Cancel</el-button>
        <el-button v-show="activeStep === 3" type="primary" @click="confirmBtnClick">Submit</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { FolderAdd } from '@element-plus/icons-vue'
import { watch } from 'vue';
/*1.初始化引入和实例化*/
const emit = defineEmits(['selectPageReq', 'hideComp'])
const activeStep = ref(0)
/*2.modal新增和修改*/
//绑定的模块ID列表
const bindModuleIds = ref([])
//模块select选择框数据模型
const selectBoxDatasource = ref([])
//所有模块<id, module>映射
const allModule = ref({})
//绑定的主机ID列表
const bindHostIds = ref([])
//主机select选择框数据模型
const hostOptions = ref([])
//所有主机<id, host>映射
const allHost = ref({})
//metric指标选择框数据模型
const metricOptions = ref([])
//所有指标<id, MetricCfgDTO>映射
const allMetricCfg = ref({})
//baseline动态基线指标选择框数据模型
const baselineOptions = ref([])
//所有指标<id, BaselineCfgDTO>映射
const allBaselineCfg = ref({})
//baseline动态基线指标选择框数据模型
const baselineFieldOptions = ref([])

let subForm = reactive({
  id: null,
  name: '',
  secondPerPeriod: 60,
  bindModules: [],
  bindHosts: [],
  rules: []
})
const refForm = ref(null)
const { formRules, elMessage } = useElement()

const previousStep = () => {
  activeStep.value = --activeStep.value % 4
}

const nextStep = () => {
  activeStep.value = ++activeStep.value % 4
}

//删除绑定模块
const deleteBindModule = (row) => {
  let bindModuleIdValues = JSON.parse(JSON.stringify(bindModuleIds.value))
  bindModuleIdValues.splice(bindModuleIdValues.findIndex(v => v === row.moduleId), 1)
  bindModuleIds.value = bindModuleIdValues
}

//根据修改的健康度配置参数初始化选择模块ID
const initBindModuleIds = () => {
  if (subForm.bindModules) {
    let moduleIds = []
    for (const module of subForm.bindModules) {
      moduleIds.push(module.moduleId);
    }
    bindModuleIds.value = moduleIds;
  }
}

//查询所有业务模块
const queryModuleTree = () => {
  axiosReq({
    url: '/api/mall3/cmdb/module/tree',
    method: 'get',
    bfLoading: true
  }).then((resData) => {
    let businessData = []
    let moduleMap = {}
    for (const business of resData.data) {
      let businessItem = { label: business.name, value: business.id, children: [] }
      if (business.children) {
        for (const system of business.children) {
          let systemItem = { label: system.name, value: system.id, children: [] }
          if (system.children) {
            for (const set of system.children) {
              let setItem = { label: set.name, value: set.id, children: [] }
              if (set.children) {
                for (const module of set.children) {
                  let moduleItem = { label: module.name, value: module.id, children: [] }
                  setItem.children.push(moduleItem);
                  moduleMap[module.id] = {
                    moduleId: module.id,
                    instance: {
                      id: module.id, name: module.name, weight: module.weight, businessId: business.id,
                      businessName: business.name, systemId: system.id, systemName: system.name, setId: set.id,
                      setName: set.name
                    }
                  }
                }
                if (setItem.children) {
                  systemItem.children.push(setItem);
                }
              }
            }
            if (systemItem.children) {
              businessItem.children.push(systemItem);
            }
          }
        }
        if (businessItem.children) {
          businessData.push(businessItem)
        }
      }
    }
    selectBoxDatasource.value = businessData;
    allModule.value = moduleMap;
    initBindModuleIds();
  })
}

watch(bindModuleIds, (newValue, oldValue) => {
  if (newValue != oldValue) {
    let bindModules = []
    for (const moduleId of bindModuleIds.value) {
      if (allModule.value[moduleId]) {
        bindModules.push(allModule.value[moduleId])
      }
    }
    subForm.bindModules = bindModules;
  }
})

//删除绑定服务器
let deleteBindHost = (row) => {
  let bindHostIdValues = JSON.parse(JSON.stringify(bindHostIds.value))
  bindHostIdValues.splice(bindHostIdValues.findIndex(v => v === row.hostId), 1)
  bindHostIds.value = bindHostIdValues
}

//根据修改的健康度配置参数初始化选择模块ID
const initBindHostIds = () => {
  if (subForm.bindHosts) {
    let hostIds = []
    for (const host of subForm.bindHosts) {
      hostIds.push(host.hostId);
    }
    bindHostIds.value = hostIds;
  }
}

//从服务端查询所有主机信息
const queryAllHost = () => {
  axiosReq({
    url: '/api/mall3/cmdb//host/all',
    method: 'get',
    bfLoading: true
  }).then((resData) => {
    let hostMap = {}
    let options = []
    for (const host of resData.data) {
      hostMap[host.id] = host
      options.push({ value: host.id, display: `${host.name} ${host.intranetIp} ${host.internetIp}` })
    }
    allHost.value = hostMap
    hostOptions.value = options
    initBindHostIds()
  })
}

watch(bindHostIds, (newValue, oldValue) => {
  if (newValue != oldValue) {
    let bindHosts = []
    for (const hostId of bindHostIds.value) {
      if (allHost.value[hostId]) {
        let host = allHost.value[hostId]
        bindHosts.push({ hostId: host.id, hostName: host.name, detail: host })
      }
    }
    subForm.bindHosts = bindHosts;
  }
})

//rule相关
let ruleTypeOptions = [
  {
    value: 1,
    display: 'Alarm',
  },
  {
    value: 2,
    display: 'Metric',
  },
  {
    value: 3,
    display: 'Availability',
  },
]
let formatRuleType = (type) => {
  for (const item of ruleTypeOptions) {
    if (item.value === type) {
      return item.display;
    }
  }
  return '';
}

let detectionFunctionOptions = [
  {
    value: 1,
    display: 'Value',
  },
  {
    value: 2,
    display: 'Change rate',
  },
  {
    value: 3,
    display: 'Baseline ratio',
  }
]
let formatdetectionFunction = (type) => {
  for (const item of detectionFunctionOptions) {
    if (item.value === type) {
      return item.display;
    }
  }
  return '';
}
let functionOptions = [
  {
    value: 1,
    display: 'COUNT',
  },
  {
    value: 2,
    display: 'AVG',
  },
  {
    value: 3,
    display: 'SUM',
  },
  {
    value: 4,
    display: 'TWA',
  },
  {
    value: 5,
    display: 'STDDEV',
  },
  {
    value: 6,
    display: 'MIN',
  }, {
    value: 7,
    display: 'MAX',
  },
  {
    value: 8,
    display: 'FIRST',
  },
  {
    value: 9,
    display: 'LAST',
  }
]
let formatFunction = (type) => {
  for (const item of functionOptions) {
    if (item.value === type) {
      return item.display;
    }
  }
  return '';
}

//从服务端查询所有Metric信息
const queryAllMetric = () => {
  let data = { pageNumber: 0, pageSize: 1000 }
  axiosReq({
    url: '/api/mall3/cfg/metric',
    data,
    method: 'get',
    isParams: true,
    bfLoading: true
  }).then((resData) => {
    let metricMap = {}
    let options = []
    let records = resData.data?.content
    for (const meticCfg of records) {
      metricMap[meticCfg.id] = meticCfg
      options.push({ value: meticCfg.id, display: `${meticCfg.name} ${meticCfg.id}` })
    }
    allMetricCfg.value = metricMap
    metricOptions.value = options
  })
}

//从服务端查询所有动态基线信息
const queryAllBaseline = () => {
  let data = { pageNumber: 0, pageSize: 1000 }
  axiosReq({
    url: '/api/mall3/cfg/baseline',
    data,
    method: 'get',
    isParams: true,
    bfLoading: true
  }).then((resData) => {
    let baselineMap = {}
    let options = []
    let records = resData.data?.content
    for (const baselineCfg of records) {
      baselineMap[baselineCfg.id] = baselineCfg
      options.push({ value: baselineCfg.id, display: `${baselineCfg.name} ${baselineCfg.id}` })
    }
    allBaselineCfg.value = baselineMap
    baselineOptions.value = options
  })
}

//基线选择变更事件处理函数
const ruleBaselineSelectChange = (value) => {
  if (value && allBaselineCfg.value[value]) {
    let baselineCfg = allBaselineCfg.value[value]
    if (baselineCfg.fields) {
      let fields = []
      for (const field of baselineCfg.fields) {
        fields.push({ value: field.afterName, display: field.afterName })
      }
      baselineFieldOptions.value = fields
      return
    }
  }

  baselineFieldOptions.value = []
}

//删除评估规则
let deleteRule = (index) => {
  let rules = JSON.parse(JSON.stringify(subForm.rules))
  rules.splice(index, 1)
  subForm.rules = rules
}
//添加评估规则
let addRule = () => {
  let rules = JSON.parse(JSON.stringify(subForm.rules))
  if (rules == null) {
    rules = []
  }
  rules.push({ weight: 1.0 })
  subForm.rules = rules
}


//判断聚合字段是否合法
let validateField = () => {
  for (const rule of subForm.rules) {
    let isValid = true
    if (!rule.type) {
      isValid = false
    }
    else if (rule.type === 2) {//metric
      if (!rule.metricId || !rule.detectionFunction) {
        isValid = false
      } else if (rule.detectionFunction == 3) {
        if ((!rule.baselineCfgId || !rule.baselineField || !rule.baselineFunction) && !rule.baselineFieldExpression) {
          isValid = false
        }
      }
      if (!rule.conditionScript || !rule.scoreScript) {
        isValid = false;
      }
    }

    if (!isValid) {
      elMessage('Rule config is invalid', 'error')
      return false;
    }
  }

  return true;
}

let convertFormData = (data) => {
  if (data.bindHosts) {
    let hosts = data.bindHosts.map(item => {
      return { id: item.hostId, name: item.hostName }
    })
    data.bindHosts = hosts
  }
  if (data.bindModules) {
    let modules = data.bindModules.map(item => { return { id: item.moduleId } })
    data.bindModules = modules
  }
}

let confirmBtnClick = () => {
  refForm.value.validate((valid) => {
    if (!valid) {
      elMessage('Health config is invalid', 'error')
      return false
    }
    else if (valid) {
      if (!validateField()) {
        return false
      }
      if (subForm.id) {
        updateReq()
      } else {
        insertReq()
      }
    }
  })
}

const insertReq = () => {
  const data = JSON.parse(JSON.stringify(subForm))
  delete data.id
  convertFormData(data)
  axiosReq({
    url: '/api/mall3/cfg/health',
    data: data,
    method: 'post',
    bfLoading: true
  }).then(() => {
    elMessage('Add successfully')
    emit('selectPageReq')
    emit('hideComp')
  })
}
//修改
const reshowData = (row) => {
  Object.keys(row).forEach((fItem) => {
    Object.keys(subForm).forEach((sItem) => {
      if (fItem === sItem) {
        subForm[sItem] = row[sItem]
      }
    })
  })
}
let updateReq = () => {
  const data = JSON.parse(JSON.stringify(subForm))
  convertFormData(data)
  return axiosReq({
    url: `/api/mall3/cfg/health/${data.id}`,
    data,
    method: 'put',
    bfLoading: true
  }).then(() => {
    elMessage('Update successfully')
    emit('selectPageReq')
    emit('hideComp')
  })
}

/*3.弹框相关*/
//显示弹框
const { dialogTitle, dialogVisible } = useCommon()
const isEditDialog = ref(false);
let showModal = (isEdit, detailData) => {
  queryModuleTree()
  queryAllHost()
  queryAllMetric()
  queryAllBaseline()

  if (isEdit) {
    dialogTitle.value = `Edit Health [${detailData.id}]`
    dialogVisible.value = true
    isEditDialog.value = true
    reshowData(detailData)
  } else {
    dialogTitle.value = 'Add Health'
    dialogVisible.value = true
    isEditDialog.value = false
  }
}
//关闭弹框
let closeFormModal = () => {
  emit('hideComp')
}

//导出给refs使用
defineExpose({
  showModal
})

</script>

<style scoped lang="scss">
</style>