<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="60vw" :close-on-click-modal="false"
    :before-close="closeFormModal">
    <el-form ref="refForm" label-width="200px" :inline="false" :model="subForm" :rules="formRules" class="pr-5">
      <el-form-item label="商品名称" prop="goodsName" :rules="formRules.isNotNull" label-position="left">
        <el-input v-model="subForm.goodsName" min-width="300" placeholder="商品名称" />
      </el-form-item>
      <el-form-item label="商品图片" prop="goodsImage" :rules="formRules.isNotNull" label-position="left">
        <el-input v-model="subForm.goodsImage" min-width="300" placeholder="商品图片" />
        <el-image style="width: 70px; height: 70px" :src="subForm.goodsImage" />
      </el-form-item>
      <el-form-item label="销售渠道" prop="saleChannel" :rules="formRules.isNotNull" label-position="left">
        <el-select v-model="subForm.saleChannel" min-width="300" placeholder="销售渠道">
          <el-option v-for="item in saleChannelOptions" :key="item.value" :label="item.display" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="currencyTypeRef.label" prop="price" :rules="formRules.isNotNull" label-position="left">
        <el-input-number v-model="subForm.price" :precision="currencyTypeRef.precision" :step="currencyTypeRef.step"
          :max="currencyTypeRef.max" :min="currencyTypeRef.min" />
      </el-form-item>
      <el-form-item label="上架库存" prop="count" :rules="formRules.isNotNull" label-position="left">
        <el-input-number v-model="subForm.count" precision="0" step="1" :max="subForm.stockCount" min="1" />
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
import { FolderAdd } from '@element-plus/icons-vue'
import { watch } from 'vue';
/*1.初始化引入和实例化*/
const emit = defineEmits(['selectPageReq', 'hideComp'])
/*2.modal*/
let saleChannelOptions = [
  {
    value: 1,
    display: 'Web2',
  },
  {
    value: 2,
    display: 'Web3',
  }
]
let currencyTypeOptions = [
  {
    value: 1,
    display: 'Vcoin',
  },
  {
    value: 2,
    display: '以太币',
  }
]

let subForm = reactive({
  stockId: '',
  goodsName: '',
  brand: '',
  goodsImage: '',
  periodType: '',
  deviceType: '',
  count: '',
  currencyType: '',
  price: '',
  saleChannel: ''
})

watch(
  () => subForm.saleChannel,
  (saleChannel) => {
    subForm.currencyType = saleChannel
  }
)

const currencyTypeRef = reactive({
  label: '商品价格(Vcoin)',
  precision: 0,
  max: 1000,
  step: 1,
  min: 1
})
watch(
  () => subForm.saleChannel,
  (saleChannel) => {
    if (saleChannel == 2) {
      currencyTypeRef.label = '商品价格(以太币)'
      currencyTypeRef.precision = 5
      currencyTypeRef.max = 1
      currencyTypeRef.step = 0.00001
      currencyTypeRef.min = 0.00001
      subForm.price = 0
    } else {
      currencyTypeRef.label = '商品价格(Vcoin)'
      currencyTypeRef.precision = 0
      currencyTypeRef.max = 1000
      currencyTypeRef.step = 1
      currencyTypeRef.min = 1
      subForm.price = 0
    }
  }
)

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

//上架
const reshowData = (row) => {
  Object.keys(row).forEach((fItem) => {
    Object.keys(subForm).forEach((sItem) => {
      if (fItem === sItem) {
        subForm[sItem] = row[sItem]
      }
    })
  })
}
let submitReq = () => {
  const data = JSON.parse(JSON.stringify(subForm))
  return axiosReq({
    url: `/api/mall3/stock/${data.stockId}/shelve`,
    data: data,
    method: 'post',
    bfLoading: true
  }).then(() => {
    elMessage('商品上架成功')
    emit('selectPageReq')
    emit('hideComp')
  })
}

/*3.弹框相关*/
//显示弹框
const { dialogTitle, dialogVisible } = useCommon()
let showModal = (stock) => {
  dialogTitle.value = `库存商品[${stock.id}]上架`
  dialogVisible.value = true
  reshowData(stock)
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
