<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="30vw" :close-on-click-modal="false"
    :before-close="closeFormModal">
    <el-form ref="refForm" label-width="100px" :inline="false" :model="subForm" :rules="formRules" class="pr-5">
      <el-form-item label="购买数量" prop="count" :rules="formRules.isNotNull" label-position="left">
        <el-input-number v-model="subForm.count" :precision="0" :step="1" :max="10" :min="1" step-strictly />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeFormModal">取消</el-button>
        <el-button type="primary" @click="confirmBtnClick">购买</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
/*1.初始化引入和实例化*/
const emit = defineEmits(['selectPageReq', 'hideComp'])
/*2.modal*/

let subForm = reactive({
  goodsId: '',
  count: 0,
})

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
  return axiosReq({
    url: `/api/mall3/order`,
    data: subForm,
    method: 'post',
    bfLoading: true,
    timeout: 20000
  }).then(() => {
    elMessage('商品购买成功')
    emit('selectPageReq')
    emit('hideComp')
  })
}

/*3.弹框相关*/
//显示弹框
const { dialogTitle, dialogVisible } = useCommon()
let showModal = (goods) => {
  dialogTitle.value = `购买商品【${goods.name}】`
  dialogVisible.value = true
  subForm.goodsId = goods.id
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
