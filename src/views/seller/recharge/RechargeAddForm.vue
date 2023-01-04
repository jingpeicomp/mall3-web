<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="60vw" :close-on-click-modal="false"
    :before-close="closeFormModal">
    <el-form ref="refForm" label-width="200px" :inline="false" :model="subForm" :rules="formRules" class="pr-5">
      <el-form-item label="充值卡号" prop="itemId" :rules="formRules.isNotNull" label-position="left">
        <el-input v-model="subForm.itemId" min-width="300" placeholder="充值卡号" />
      </el-form-item>
      <el-form-item label="充值账户" prop="toUserId" :rules="formRules.isNotNull" label-position="left">
        <el-select v-model="subForm.toUserId" min-width="300" placeholder="充值账户">
          <el-option v-for="item in allUserOptions" :key="item.value" :label="item.display" :value="item.value" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeFormModal">取消</el-button>
        <el-button type="primary" @click="confirmBtnClick">充值</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
/*1.初始化引入和实例化*/
const emit = defineEmits(['selectPageReq', 'hideComp'])
let subForm = reactive({
  itemId: '',
  toUserId: '',
})

let allUserOptions = ref([])

const refForm = ref(null)
let confirmBtnClick = () => {
  refForm.value.validate((valid) => {
    if (valid) {
      submitReq()
    } else {
      return false
    }
  })
}
const { formRules, elMessage } = useElement()

let submitReq = () => {
  const data = JSON.parse(JSON.stringify(subForm))
  return axiosReq({
    url: `/api/mall3/recharge`,
    data: data,
    method: 'post',
    bfLoading: true,
    timeout: 60000
  }).then(() => {
    elMessage('商品上架成功')
    emit('selectPageReq')
    emit('hideComp')
  })
}

let queryAllUser = () => {
  return axiosReq({
    url: '/api/mall3/user/all',
    method: 'get',
  }).then((resData) => {
    allUserOptions.value = resData.data.map((userObj, index) => {
      return { value: userObj.id, display: userObj.name || userObj.id }
    })
  })
}

/*3.弹框相关*/
//显示弹框
const { dialogTitle, dialogVisible } = useCommon()
let showModal = () => {
  dialogTitle.value = "充值"
  dialogVisible.value = true
  queryAllUser()
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
