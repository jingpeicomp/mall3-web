<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="50vw" :close-on-click-modal="false"
    :before-close="closeFormModal">
    <el-form ref="refForm" label-width="200px" :inline="false" :model="subForm" :rules="formRules" class="pr-5">
      <el-form-item label="Vcoin数目(10000倍数)" prop="vcoinAmount" label-position="left" :rules="formRules.isNotNull">
        <el-input-number v-model="subForm.vcoinAmount" :step="10000" step-strictly />
      </el-form-item>
      <el-form-item label="需要支付的以太币" prop="ethAmount" label-position="left">
        <el-input v-model="subForm.ethAmount" readonly />
      </el-form-item>
      <el-form-item label="付款Web3钱包地址" prop="fromPubAddress" label-position="left">
        <el-input v-model="subForm.fromPubAddress" readonly />
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
import Web3 from 'web3';
import web3Util from '@/utils/web3Util'
import { watch } from 'vue';

let subForm = reactive({
  fromPubAddress: '',
  toPubAddress: '0XE5A70661C17AC8B012CB9A822EBAB93A27C19859',
  vcoinAmount: 10000,
  ethAmount: 10000 / 100000000,
  txId: '',
  id: null,
})

watch(
  () => subForm.vcoinAmount,
  (vcoinAmount) => {
    subForm.ethAmount = vcoinAmount / 100000000
  }
)

const refForm = ref(null)
let confirmBtnClick = () => {
  refForm.value.validate((valid) => {
    if (valid) {
      createReq()
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

let createReq = () => {
  return axiosReq({
    url: `/api/mall3/vcoin/recharge`,
    data: subForm,
    method: 'post',
    bfLoading: true
  }).then((resData) => {
    let data = resData?.data
    subForm.id = data.id
    subForm.toPubAddress = data.ethPubAddr
    subForm.ethAmount = data.payAmount
    web3Util.getWeb3().then(res => {
      let web3 = res
      web3.eth.getTransactionCount(subForm.fromPubAddress)
        .then(transCount => {
          let transactionObject = {
            from: subForm.fromPubAddress,
            to: subForm.toPubAddress,
            value: web3.utils.toWei('' + subForm.ethAmount, 'ether'),
            nonce: transCount
          }

          web3.eth.sendTransaction(transactionObject, (err, res) => {
            let output = ''
            if (!err) {
              output = res
              subForm.txId = res
              payReq()
            }
            else {
              output = "ERROR:" + err
              elMessage('Web3转账交易失败: ' + err, 'error')
            }
            console.log('转账结果: ', output)
          })
        })
    });
  })
}

let payReq = () => {
  return axiosReq({
    url: `/api/mall3/vcoin/recharge/pay`,
    data: subForm,
    method: 'put',
    bfLoading: true
  }).then(() => {
    elMessage('Vcoin充值单支付信息提交成功, 稍后刷新页面!')
    emit('selectPageReq')
    emit('hideComp')
  })
}

/*3.弹框相关*/
//显示弹框
const { dialogTitle, dialogVisible } = useCommon()
let showModal = (detailData) => {
  dialogTitle.value = `Web3虚拟货币充值Vcoin`
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
