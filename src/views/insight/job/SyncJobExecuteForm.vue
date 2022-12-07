<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" :close-on-click-modal="false"
    :before-close="closeFormModal">

    <el-form ref="refForm" label-width="180px" :inline="false" :model="subForm" :rules="formRules" class="pr-5">
      <el-form-item label="Time Range" prop="startTime" :rules="formRules.isNotNull" label-position="left">
        <el-date-picker v-model="subForm.startEndArr" type="daterange" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
          class="widthPx-220" range-separator="-" start-placeholder="Start Time" end-placeholder="End Time"
          @change="dateTimePacking" />
      </el-form-item>
      <el-form-item label="Time Split Interval (hour)" prop="splitInterval" :rules="formRules.isNotNull"
        label-position="left">
        <el-input-number v-model="subForm.splitInterval" class="widthPx-230" min-width="300" :min="1" :max="24" />
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
/*1.初始化引入和实例化*/
const emit = defineEmits(['selectPageReq', 'hideComp'])
/*2.modal新增和修改*/
//新增
let subForm = reactive({
  jobId: '',
  startTime: '',
  endTime: '',
  splitInterval: 1,
  startEndArr: ''
})
const refForm = ref(null)
const dateTimePacking = (timeArr) => {
  if (timeArr && timeArr.length === 2) {
    subForm.startTime = timeArr[0]
    subForm.endTime = timeArr[1]
  } else {
    subForm.startTime = ''
    subForm.endTime = ''
  }
}

let confirmBtnClick = () => {
  refForm.value.validate((valid) => {
    if (valid) {
      elConfirm('Confirm', `The operation will sync data from InfluxDB to TDengine. 
      It may consume a lot of system resources.
      You could not execute more than two jobs at the same time. 
      Are you sure to execute the data sync job [${subForm.id}]?`)
        .then(() => {
          executeReq()
        })
        .catch(() => { })
    } else {
      return false
    }
  })
}
const { formRules, elMessage, elConfirm } = useElement()

const executeReq = () => {
  axiosReq({
    url: '/api/mall3/job/sync/execute',
    data: subForm,
    method: 'post',
    bfLoading: true
  }).then(() => {
    elMessage('Start executing job')
    emit('selectPageReq')
    emit('hideComp')
  })
}

/*3.弹框相关*/
//显示弹框
const { dialogTitle, dialogVisible } = useCommon()
let showModal = (detailData) => {
  dialogTitle.value = `Execute Data Sync Job [${detailData.id}]`
  dialogVisible.value = true
  subForm.jobId = detailData.id
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
