<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="70vw" :close-on-click-modal="false"
    :before-close="closeFormModal">
    <el-table :data="items" :border="false">
      <el-table-column label="卡号" prop="id" min-width="200" />
      <el-table-column align="center" v-if="goods.saleChannel == 1" label="是否售出" width="100">
        <template #default="{ row }">
          {{ formatSold(row.sold) }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="是否充值" width="100">
        <template #default="{ row }">
          {{ formatRecharged(row.recharged) }}
        </template>
      </el-table-column>
      <el-table-column v-if="goods.saleChannel == 2" align="center" label="NFT操作" min-width="120">
        <template #default="{ row }">
          <el-button link size="small" type="primary" @click="nftBtnClick(row)">OpenSea</el-button>
          <el-button link size="small" type="primary" @click="queryBtnClick(row)">查询拥有者</el-button>
          <el-button link size="small" type="primary" @click="buyBtnClick(row)">购买</el-button>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeFormModal">Cancel</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue';
const { elMessage } = useElement()
import { ElMessageBox } from 'element-plus'
import web3Util from '@/utils/web3Util'
const emit = defineEmits(['selectPageReq', 'hideComp'])
const constratJson = '[{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256[]","name":"itemIds","type":"uint256[]"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"string","name":"contractUrl","type":"string"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"indexed":false,"internalType":"uint256[]","name":"values","type":"uint256[]"}],"name":"TransferBatch","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"TransferSingle","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"value","type":"string"},{"indexed":true,"internalType":"uint256","name":"id","type":"uint256"}],"name":"URI","type":"event"},{"stateMutability":"payable","type":"fallback"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"accounts","type":"address[]"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"}],"name":"balanceOfBatch","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"buy","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"contractURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getItemOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getItems","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeBatchTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"}],"name":"setPrice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"address","name":"to","type":"address"}],"name":"transfer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"uri","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"stateMutability":"payable","type":"receive"}]'

let formatSold = (type) => {
  return type === 1 ? '已售出' : '未售出';
}

let formatRecharged = (type) => {
  return type === 1 ? '已充值' : '未充值';
}

let items = ref([])
let goodsId = ref(null)
let goods = ref(null)

let queryItem = () => {
  return axiosReq({
    url: `/api/mall3/goods/${goodsId.value}/item`,
    method: 'get',
  }).then((res) => {
    items.value = res.data;
  })
}

/*3.弹框相关*/
//显示弹框
const { dialogTitle, dialogVisible } = useCommon()
let showModal = (data) => {
  dialogTitle.value = `商品【${data.name || ''}】附属卡`
  dialogVisible.value = true
  goodsId.value = data.id
  goods.value = data
  queryItem()
}
//关闭弹框
let closeFormModal = () => {
  emit('hideComp')
}

let nftBtnClick = (row) => {
  let url = `https://testnets.opensea.io/zh-CN/assets/goerli/${goods.value.contractAddress.toLowerCase()}/${row.id}`;
  window.open(url, '_blank')
}

let queryBtnClick = (row) => {
  let reqConfig = {
    url: '/api/mall3/goods/nft/owner',
    method: 'get',
    data: { goodsId: row.goodsId, itemId: row.id },
    isParams: true,
    timeout: 60000,
    bfLoading: true
  }
  axiosReq(reqConfig).then((resData) => {
    ElMessageBox.alert(`${resData.data}`, 'NFT持有者', {
      confirmButtonText: 'OK'
    })
  })
}

let buyBtnClick = (row) => {
  web3Util.getWeb3().then(res => {
    let web3 = res
    web3.eth.getAccounts().then(accounts => {
      console.log('===>Accounts:', accounts)
      let fromPubAddress = accounts[0]
      let mall3Goods = new web3.eth.Contract(JSON.parse(constratJson), goods.value.contractAddress)
      mall3Goods.methods.buy(row.id)
        .send({ from: fromPubAddress, value: web3.utils.toWei('' + goods.value.price, 'ether') })
        .on('transactionHash', function (hash) {
          console.log('===> web3 buy hash', hash)
          let buyBody = { goodsId: goods.value.id, count: 1, itemId: row.id, txId: hash }
          let reqConfig = {
            url: '/api/mall3/order',
            method: 'post',
            data: buyBody,
            timeout: 20000,
            bfLoading: true
          }
          axiosReq(reqConfig).then((resData) => {
            elMessage('提交订单成功')
          })
        })
        .on('error', (error, receipt) => {
          elMessage('Web3购买商品失败: ' + error, 'error')
        })
    });
  });
}

//导出给refs使用
defineExpose({
  showModal
})
</script>

<style scoped lang="scss">

</style>
