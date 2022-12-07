<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="50vw" :close-on-click-modal="false"
    :before-close="closeFormModal">
    <el-form ref="refForm" label-width="150px" :inline="false" :model="subForm" :rules="formRules" class="pr-5">
      <el-form-item label="Password" prop="newPassword" label-position="left" :rules="formRules.isNotNull">
        <el-input v-model="subForm.newPassword" type="password" placeholder="New Password" show-password />
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
/*2.modal修改*/

let subForm = reactive({
  name: '',
  newPassword: ''
})
const refForm = ref(null)


let confirmBtnClick = () => {
  refForm.value.validate((valid) => {
    if (valid) {
      updateReq()
    } else {
      return false
    }
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
    url: `/api/mall3/admin/user/admin/password`,
    data: subForm,
    method: 'put',
    bfLoading: true
  }).then(() => {
    elMessage('Update password successfully')
    emit('selectPageReq')
    emit('hideComp')
  })
}

/*3.弹框相关*/
//显示弹框
const { dialogTitle, dialogVisible } = useCommon()
let showModal = (detailData) => {
  dialogTitle.value = `Edit Password [${detailData.name}]`
  dialogVisible.value = true
  reshowData(detailData)
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
