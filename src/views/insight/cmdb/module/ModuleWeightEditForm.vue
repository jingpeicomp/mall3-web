<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="400px" :close-on-click-modal="false"
    :before-close="closeFormModal">
    <el-form ref="refForm" label-width="150px" :inline="false" :model="subForm" :rules="formRules" class="pr-5">
      <el-form-item label="Name" prop="name" :rules="formRules.isNotNull" label-position="left">
        <el-input v-model="subForm.name" min-width="300" placeholder="Name" :disabled="isEditDialog" />
      </el-form-item>
      <el-form-item label="Weight" prop="weight" :rules="formRules.isNotNull" label-position="left">
        <el-input-number v-model="subForm.weight" style="width: 300px;" :precision="3" :step="1" placeholder="Weight" />
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
let subForm = reactive({
  id: '',
  name: '',
  weight: 1.0
})
const refForm = ref(null)

let confirmBtnClick = () => {
  refForm.value.validate((valid) => {
    if (valid) {
      if (subForm.id) {
        updateReq()
      }
    }
    return false
  })
}
const { formRules, elMessage } = useElement()
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
  return axiosReq({
    url: `/api/mall3/cmdb/module/${subForm.id}/weight`,
    data: subForm,
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
  if (isEdit) {
    dialogTitle.value = `Edit Module Weight [${detailData.name}]`
    dialogVisible.value = true
    isEditDialog.value = true
    reshowData(detailData)
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

//导出属性到页面中使用
// let {levelList} = toRefs(state);
</script>

<style scoped lang="scss">
</style>
