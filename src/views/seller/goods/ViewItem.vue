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
          <el-button v-if="row.recharged != 1 && row.sold != 1" link size="small" type="primary"
            @click="transferBtnClick(row)">转让</el-button>
          <el-button link size="small" type="primary" @click="queryBtnClick(row)">查询拥有者</el-button>
          <el-button v-if="row.recharged != 1 && row.sold != 1" link size="small" type="primary"
            @click="destroyBtnClick(row)">销毁</el-button>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeFormModal">Cancel</el-button>
      </span>
    </template>
    <el-dialog v-model="transferDialogVisible" :title="transferDialogTitle" width="40vw">
      <el-form label-width="100px" :inline="false" :model="transferData">
        <el-form-item label="转让账户" prop="toWeb3Address" label-position="left">
          <el-select v-model="transferData.toWeb3Address" min-width="200" placeholder="转让账户">
            <el-option v-for="item in allUserOptions" :key="item.value" :label="item.display" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="transferReq">转让</el-button>
        </span>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue';
const { elMessage } = useElement()
import { ElMessageBox } from 'element-plus'
const emit = defineEmits(['selectPageReq', 'hideComp'])

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
  dialogTitle.value = `商品【${data.name || ''}】附属卡号`
  dialogVisible.value = true
  goodsId.value = data.id
  goods.value = data
  queryItem()
  queryAllUser()
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

let destroyBtnClick = (row) => {
  let reqConfig = {
    url: '/api/mall3/goods/nft/destroy',
    method: 'post',
    data: { goodsId: row.goodsId, itemId: row.id },
    timeout: 60000,
    bfLoading: true
  }
  axiosReq(reqConfig).then((resData) => {
    elMessage('NFT销毁成功')
  })
}

let transferDialogVisible = ref(null)
let transferDialogTitle = ref(null)
let transferData = reactive({
  goodsId: "",
  itemId: "",
  toWeb3Address: ""
})

let transferBtnClick = (row) => {
  transferDialogVisible.value = true
  transferDialogTitle.value = `NFT【${row.id}】转让`
  transferData.goodsId = row.goodsId;
  transferData.itemId = row.id;
  transferData.toWeb3Address = "";
}

let transferReq = () => {
  let reqConfig = {
    url: '/api/mall3/goods/nft/transfer',
    method: 'post',
    data: transferData,
    timeout: 60000,
    bfLoading: true
  }
  axiosReq(reqConfig).then((resData) => {
    elMessage('NFT转移成功')
    transferData.goodsId = "";
    transferData.itemId = "";
    transferData.toWeb3Address = "";
  })
}

let allUserOptions = ref([])
let queryAllUser = () => {
  return axiosReq({
    url: '/api/mall3/user/all',
    method: 'get',
  }).then((resData) => {
    allUserOptions.value = resData.data
      .map((userObj, index) => {
        return { value: userObj.pubWeb3Addr, display: userObj.pubWeb3Addr }
      })
      .filter(obj => obj.value)
  })
}

//导出给refs使用
defineExpose({
  showModal
})
</script>

<style scoped lang="scss">

</style>
