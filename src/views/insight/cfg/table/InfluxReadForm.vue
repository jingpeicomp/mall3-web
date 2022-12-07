<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="50vw" :close-on-click-modal="false"
    :before-close="closeFormModal">
    <el-form ref="refForm" label-width="200px" :inline="false" :model="subForm" :rules="formRules" class="pr-5">
      <el-form-item label="InfluxDB Name" prop="influxName" :rules="formRules.isNotNull" label-position="left">
        <el-select v-model="subForm.influxName" min-width="300" placeholder="InfluxDB Name">
          <el-option v-for="item in influxNameOptions" :key="item.value" :label="item.display" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="InfluxDB Database" prop="influxDatabase" :rules="formRules.isNotNull" label-position="left">
        <el-input v-model="subForm.influxDatabase" min-width="300" placeholder="InfluxDB Database" />
      </el-form-item>

      <el-form-item label="InfluxDB Measurement(Table)" prop="influxTable" label-position="left">
        <el-input v-model="subForm.influxTable" min-width="300"
          placeholder="Empty field means all measurements(tables) in the database" />
      </el-form-item>

      <el-form-item label="TDengine Database" prop="tdengineDatabase" label-position="left">
        <el-input v-model="subForm.tdengineDatabase" min-width="300"
          placeholder="Empty field means same as InfluxDB database" />
      </el-form-item>

      <el-form-item v-if="showResult" label="Read Result" prop="result" label-position="left">
        <div>
          <el-table :data="readResult" :border="false">
            <el-table-column label="Table Meta ID" prop="id" min-width="150">
            </el-table-column>
            <el-table-column label="Database" prop="database" min-width="200">
            </el-table-column>
            <el-table-column label="Table " prop="name" min-width="200">
            </el-table-column>
          </el-table>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeFormModal">Close</el-button>
        <el-button type="primary" @click="readBtnClick">Read</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
/*1.初始化引入和实例化*/
const emit = defineEmits(['selectPageReq', 'hideComp'])
/*2.modal*/
let subForm = reactive({
  influxName: '',
  influxDatabase: '',
  influxTable: '',
  tdengineDatabase: ''
})
const refForm = ref(null)
let influxNameOptions = ref([])
const queryInfluxNames = () => {
  axiosReq({
    url: '/api/mall3/cfg/table/influx',
    method: 'get',
    bfLoading: true
  })
    .then((resData) => {
      let options = []
      if (resData.data) {
        for (const name of resData.data) {
          options.push({ value: name, display: name })
        }
      }
      influxNameOptions.value = options
    })
}

let showResult = ref(false)
let readBtnClick = () => {
  refForm.value.validate((valid) => {
    if (valid) {
      readFromInflux()
    } else {
      return false
    }
  })
}
const { formRules, elMessage } = useElement()
const readResult = ref([])
const readFromInflux = () => {
  axiosReq({
    url: '/api/mall3/cfg/table/read/influx',
    data: subForm,
    method: 'post', //--c
    bfLoading: true,
    timeout: 120000
  }).then((resData) => {
    elMessage(`Read table meta from InfluxDB successfully, the result size is ${resData.data.length}`)
    readResult.value = resData.data
    showResult.value = true
  })
}

/*3.弹框相关*/
//显示弹框
const { dialogTitle, dialogVisible } = useCommon()
let showModal = () => {
  dialogTitle.value = 'Read Table Meta From InfluxDB'
  dialogVisible.value = true
  queryInfluxNames()
}
//关闭弹框
let closeFormModal = () => {
  if (showResult.value) {
    emit('selectPageReq')
  }
  emit('hideComp')
}

//导出给refs使用
defineExpose({
  showModal
})

//导出属性到页面中使用
// let {levelList} = toRefs(state);
</script>

<style scoped lang="scss">
</style>
