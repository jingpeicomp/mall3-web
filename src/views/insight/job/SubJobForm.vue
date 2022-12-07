<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="80%" :close-on-click-modal="false"
    :before-close="closeFormModal">
    <div class="mr-3 rowSS">
      <el-button type="primary" @click="searchBtnClick">Refresh</el-button>
    </div>
    <p></p>
    <el-table id="detailElementDialog" ref="mainTable" border :data="mainTableData">
      <el-table-column align="center" prop="id" label="Sub Job Id" width="80" />
      <el-table-column align="center" prop="startTimeStr" label="Period Start Time" width="145" />
      <el-table-column align="center" prop="endTimeStr" label="Period End Time" width="145" />
      <el-table-column align="center" prop="executeTimeStr" label="Execute Time" width="145" />
      <el-table-column align="center" label="Status" prop="status" width="100">
        <template #default="{ row }">
          {{ formatExecuteStatus(row.status) }}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="costMills" label="Cost Time(ms)" width="110" />
      <el-table-column align="center" prop="recordNum" label="Record Number" width="110" />
      <el-table-column align="center" prop="errorMessage" label="Error Message" min-width="150" />
    </el-table>
    <!--分页-->
    <div class="block columnCC mt-2">
      <el-pagination :current-page="pageNum" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </div>
  </el-dialog>
</template>

<script setup>
/*1.初始化引入和实例化*/
const emit = defineEmits(['hideComp'])
import commonUtil from '@/utils/commonUtil'

let formatExecuteStatus = (status) => {
  if (status === 2) {
    return "Executing"
  } else if (status === 3) {
    return "Success"
  } else if (status === 4) {
    return "Fail"
  } else if (status === 5) {
    return "Stop"
  } else {
    return "Unexecuted"
  }
}

let mainTableData = ref([])
let searchForm = reactive({
  resultId: ''
})

const searchBtnClick = () => {
  //此处要重置页数，也是常出的bug
  pageNum.value = 1
  selectPageReq()
}

let total = ref(1)
let selectPageReq = () => {
  const data = Object.assign(searchForm, {
    pageNumber: pageNum.value - 1,
    pageSize: pageSize.value
  })
  const postBody = JSON.parse(JSON.stringify(data))
  Object.keys(postBody).forEach((fItem) => {
    if (postBody[fItem] === '' || postBody[fItem] === null || postBody[fItem] === undefined) {
      delete postBody[fItem]
    }
  })
  let reqConfig = {
    url: '/api/mall3/job/sync/sub',
    method: 'get',
    data: postBody,
    isParams: true
  }
  axiosReq(reqConfig).then((resData) => {
    let records = [];
    if (resData.data && resData.data.content) {
      records = resData.data.content;
      for (const record of records) {
        if (record.executeTime) {
          record['executeTimeStr'] = commonUtil.formatTimestamp(record.executeTime)
        }
        if (record.periodStartTime) {
          record['startTimeStr'] = commonUtil.formatTimestamp(record.periodStartTime)
        }
        if (record.periodEndTime) {
          record['endTimeStr'] = commonUtil.formatTimestamp(record.periodEndTime)
        }
        if (record.errorMessage && record.errorMessage.length > 200) {
          record.errorMessage = record.errorMessage.substring(0, 200) + '...';
        }
      }
    }
    mainTableData.value = records
    total.value = resData.data?.total
  })
}

import tablePageHook from '@/hooks/useTablePage'
let { pageNum, pageSize, handleCurrentChange, handleSizeChange } = tablePageHook(selectPageReq)

/*3.弹框相关*/
//显示弹框
const { dialogTitle, dialogVisible } = useCommon()
let showModal = (detailData) => {
  dialogTitle.value = `Sub Jobs on Job Result[${detailData.id}]`
  dialogVisible.value = true
  searchForm.resultId = detailData.id
  selectPageReq()
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
