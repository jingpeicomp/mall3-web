<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="50vw" :close-on-click-modal="false"
    :before-close="closeFormModal">
    <el-form ref="refForm" label-width="200px" :inline="false" :model="subForm" :rules="formRules" class="pr-5">
      <el-form-item label="TDegnine Name" prop="tdengineName" :rules="formRules.isNotNull" label-position="left">
        <el-select v-model="subForm.tdengineName" min-width="300" placeholder="TDegnine Name">
          <el-option v-for="item in tdengineNameOptions" :key="item.value" :label="item.display" :value="item.value" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeFormModal">Close</el-button>
        <el-button type="primary" @click="writeBtnClick">Create Table</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { FolderAdd } from '@element-plus/icons-vue'
/*1.初始化引入和实例化*/
const emit = defineEmits(['selectPageReq', 'hideComp'])
/*2.modal*/
let subForm = reactive({
  tdengineName: '',
  tableMetaId: null
})
const refForm = ref(null)
let tdengineNameOptions = ref([])
const queryTdengineNames = () => {
  axiosReq({
    url: '/api/mall3/cfg/table/tdengine',
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
      tdengineNameOptions.value = options
    })
}

let showResult = ref(false)
let writeBtnClick = () => {
  refForm.value.validate((valid) => {
    if (valid) {
      writeToTdengine()
    } else {
      return false
    }
  })
}
const { formRules, elMessage } = useElement()
const readResult = ref([])
const writeToTdengine = () => {
  axiosReq({
    url: '/api/mall3/cfg/table/write/tdengine',
    data: subForm,
    method: 'post',
    bfLoading: true
  }).then((resData) => {
    elMessage('Create table in TDengine successfully')
    readResult.value = resData.data
    showResult.value = true
    emit('hideComp')
  })
}

/*3.弹框相关*/
//显示弹框
const { dialogTitle, dialogVisible } = useCommon()
let showModal = (detailData) => {
  dialogTitle.value = `Create Table in TDegnine database [${detailData.database}] table [${detailData.name}]`
  dialogVisible.value = true
  subForm.tableMetaId = detailData.id
  queryTdengineNames()
}
//关闭弹框
let closeFormModal = () => {
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
