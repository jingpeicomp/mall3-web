<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="50vw" :close-on-click-modal="false"
    :before-close="closeFormModal">
    <el-form ref="refForm" label-width="150px" :inline="false" :model="subForm" :rules="formRules" class="pr-5">
      <el-form-item label="InfluxDB Name" prop="influxName" :rules="formRules.isNotNull" label-position="left">
        <el-select v-model="subForm.influxName" min-width="300" placeholder="InfluxDB Name" style="width:100%">
          <el-option v-for="item in influxNameOptions" :key="item.value" :label="item.display" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="InfluxDB Database" prop="influxDatabase" :rules="formRules.isNotNull" label-position="left">
        <el-input v-model="subForm.influxDatabase" min-width="300" placeholder="InfluxDB Database" />
      </el-form-item>
      <el-form-item label="InfluxDB Measurement" prop="influxTable" :rules="formRules.isNotNull" label-position="left">
        <el-input v-model="subForm.influxTable" min-width="300" placeholder="InfluxDB Measurement" />
      </el-form-item>
      <el-form-item label="TDengine Name" prop="tdengineName" :rules="formRules.isNotNull" label-position="left">
        <el-select v-model="subForm.tdengineName" min-width="300" placeholder="TDengine Name" style="width:100%">
          <el-option v-for="item in tdengineNameOptions" :key="item.value" :label="item.display" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="TDengine Database" prop="tdengineDatabase" :rules="formRules.isNotNull"
        label-position="left">
        <el-select v-model="subForm.tdengineDatabase" min-width="400" placeholder="Select TDengine Database"
          style="width:100%">
          <el-option v-for="item in tdengineDatabaseOptions" :key="item.value" :label="item.display"
            :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="TDengine Table" prop="tdengineTable" :rules="formRules.isNotNull" label-position="left">
        <el-select v-model="subForm.tdengineTable" min-width="400" placeholder="Select TDengine Table"
          style="width:100%">
          <el-option v-for="item in tdengineTableOptions" :key="item.value" :label="item.display" :value="item.value" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeFormModal">Cancel</el-button>
        <el-button type="primary" @click="confirmBtnClick">Submit</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { watch } from 'vue';

/*1.初始化引入和实例化*/
const emit = defineEmits(['selectPageReq', 'hideComp'])
/*2.modal新增和修改*/
//新增
let subForm = reactive({
  influxName: '',
  influxDatabase: '',
  influxTable: '',
  tdengineName: '',
  tdengineDatabase: '',
  tdengineTable: ''
})
const refForm = ref(null)

let confirmBtnClick = () => {
  refForm.value.validate((valid) => {
    if (valid) {
      insertReq()
    } else {
      return false
    }
  })
}
const { formRules, elMessage } = useElement()

//tdengine name
let tdengineNameOptions = ref([])
const queryTdengineNames = () => {
  axiosReq({
    url: '/api/mall3/cfg/table/tdengine',
    method: 'get',
    bfLoading: true
  }).then((resData) => {
    let options = []
    if (resData.data) {
      for (const name of resData.data) {
        options.push({ value: name, display: name })
      }
    }
    tdengineNameOptions.value = options
  })
}
//influx name
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

//tdengine database
let tdengineDatabaseOptions = ref([])
const queryTdengineDatabase = () => {
  axiosReq({
    url: '/api/mall3/cfg/table/databases',
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
      tdengineDatabaseOptions.value = options
    })
}

//tdengine table
let tdengineTableOptions = ref([])
const queryTdengineTables = () => {
  axiosReq({
    url: '/api/mall3/cfg/table/names',
    data: { database: subForm.tdengineDatabase },
    isParams: true,
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
      tdengineTableOptions.value = options
    })
}
watch(
  () => subForm.tdengineDatabase,
  (tdengineDatabase) => {
    queryTdengineTables()
    subForm.tdengineTable = ''
  }
)

const insertReq = () => {
  axiosReq({
    url: '/api/mall3/job/sync',
    data: subForm,
    method: 'post',
    bfLoading: true
  }).then(() => {
    elMessage('Add successfully')
    emit('selectPageReq')
    emit('hideComp')
  })
}

/*3.弹框相关*/
//显示弹框
const { dialogTitle, dialogVisible } = useCommon()
let showModal = () => {
  queryInfluxNames()
  queryTdengineNames()
  queryTdengineDatabase()
  queryTdengineTables()
  dialogTitle.value = 'Add Data Sync Job'
  dialogVisible.value = true
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
