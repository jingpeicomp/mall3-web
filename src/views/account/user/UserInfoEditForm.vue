<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="50vw" :close-on-click-modal="false"
    :before-close="closeFormModal">
    <el-form ref="refForm" label-width="200px" :inline="false" :model="subForm" :rules="formRules" class="pr-5">
      <el-form-item label="用户名" prop="name" label-position="left">
        <el-input v-model="subForm.name" />
      </el-form-item>
      <el-form-item label="品牌" prop="brand" label-position="left">
        <el-input v-model="subForm.brand" />
      </el-form-item>

      <el-form-item label="品牌图标" prop="brandIcon" label-position="left">
        <el-input v-model="subForm.brandIcon" />
        <el-image style="width: 60px; height: 60px" :src="subForm.brandIcon" fit="fill">
          <template #error>
            <div class="image-slot">
              <el-icon><icon-picture /></el-icon>
            </div>
          </template>
        </el-image>
      </el-form-item>
      <el-form-item label="密码" prop="password" label-position="left">
        <el-input v-model="subForm.password" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeFormModal">取消</el-button>
        <el-button type="primary" @click="confirmBtnClick">提交</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
/*1.初始化引入和实例化*/
const emit = defineEmits(['selectPageReq', 'hideComp'])

let subForm = reactive({
  name: '',
  brand: '',
  brandIcon: '',
  password: ''
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
  const data = JSON.parse(JSON.stringify(subForm))
  data['rePassword'] = data.password
  return axiosReq({
    url: `/api/mall3/user/set/info`,
    data,
    method: 'put',
    bfLoading: true
  }).then((resData) => {
    elMessage('更新用户信息成功')
    emit('selectPageReq')
    emit('hideComp')
  })
}

/*3.弹框相关*/
//显示弹框
const { dialogTitle, dialogVisible } = useCommon()
let showModal = (detailData) => {
  dialogTitle.value = `更新用户信息`
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
