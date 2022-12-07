<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="50vw" :close-on-click-modal="false"
    :before-close="closeFormModal">
    <el-form ref="refForm" label-width="150px" :inline="false" :model="subForm" :rules="formRules" class="pr-5">
      <el-form-item label="Name" prop="name" :rules="formRules.isNotNull" label-position="left">
        <el-input v-model="subForm.name" min-width="300" placeholder="Name" :disabled="isEditDialog" />
      </el-form-item>
      <el-form-item label="Role Type" prop="roleType" :rules="formRules.isNotNull" label-position="left">
        <el-select v-model="subForm.roleType" min-width="300" placeholder="Role Type">
          <el-option v-for="item in roleTypeOptions" :key="item.value" :label="item.display" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="Locked State" prop="lockedState" :rules="formRules.isNotNull" label-position="left">
        <el-select v-model="subForm.lockedState" min-width="300" placeholder="Locked State">
          <el-option v-for="item in lockStateOptions" :key="item.value" :label="item.display" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item v-show="!isEditDialog" label="Password" prop="password" label-position="left">
        <el-input v-model="subForm.password" type="password" placeholder="Password" show-password />
      </el-form-item>
      <el-form-item label="Description" prop="description" label-position="left" min-width="150">
        <el-input v-model="subForm.description" min-width="300" placeholder="Description" :rows="3" type="textarea" />
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
let roleTypeOptions = [
  {
    value: 'admin',
    display: 'admin',
  },
  {
    value: 'editor',
    display: 'editor',
  },
  {
    value: 'viewer',
    display: 'viewer',
  }
]
let lockStateOptions = [
  {
    value: 0,
    display: 'Unlocked',
  },
  {
    value: 1,
    display: 'Locked',
  }
]

let subForm = reactive({
  name: '',
  roleType: 'viewer',
  lockedState: 0,
  description: '',
  password: ''
})
const refForm = ref(null)

//判断字段配置是否合法
let validateFiled = () => {
  if (!isEditDialog && !subForm.password) {
    elMessage('Password cannot be null', 'error')
    return false;
  }

  return true;
}

let confirmBtnClick = () => {
  refForm.value.validate((valid) => {
    if (valid) {
      if (!validateFiled()) {
        return false
      }
      if (isEditDialog.value) {
        updateReq()
      } else {
        insertReq()
      }
    } else {
      return false
    }
  })
}

const { formRules, elMessage } = useElement()

const insertReq = () => {
  axiosReq({
    url: '/api/mall3/admin/user',
    data: subForm,
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
  return axiosReq({
    url: `/api/mall3/admin/user/${subForm.name}`,
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
    dialogTitle.value = `Edit User [${detailData.name}]`
    dialogVisible.value = true
    isEditDialog.value = true
    reshowData(detailData)
  } else {
    dialogTitle.value = 'Add User'
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

//导出属性到页面中使用
// let {levelList} = toRefs(state);
</script>

<style scoped lang="scss">
</style>
