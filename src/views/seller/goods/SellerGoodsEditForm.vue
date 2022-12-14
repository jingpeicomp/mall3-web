<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="40vw" :close-on-click-modal="false"
    :before-close="closeFormModal">
    <el-table :data="items" :border="false">
      <el-table-column label="卡号" prop="id" min-width="200" />
    </el-table>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeFormModal">Cancel</el-button>
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

let items = ref([])
let goodsId = ref(null)

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
  dialogTitle.value = `商品【${data.name}】附属卡号`
  dialogVisible.value = true
  goodsId.value = data.id
  queryItem()
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
