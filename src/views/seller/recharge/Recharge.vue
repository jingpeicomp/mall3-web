<template>
    <div class="scroll-y">
        <!--操作-->
        <div class="mr-3 rowSS">
            <!--条件搜索-->
            <el-form ref="refsearchForm" :inline="true" class="demo-searchForm ml-2">
                <el-form-item label-width="0px" label="" prop="type" label-position="left">
                    <el-input v-model="searchForm.brand" placeholder="品牌" />
                </el-form-item>
                <el-form-item label-width="0px" label="" prop="type" label-position="left">
                    <el-select v-model="searchForm.saleChannel" class="widthPx-150" placeholder="销售渠道">
                        <el-option v-for="item in saleChannelOptions" :key="item.value" :label="item.display"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
            </el-form>
            <!--查询按钮-->
            <el-button type="primary" @click="searchBtnClick">查询</el-button>
            <el-button type="warning" @click="addBtnClick">充值</el-button>
        </div>
        <!--表格和分页-->
        <el-table id="mainTable" ref="mainTable" :height="`calc(100vh - ${settings.delWindowHeight})`" border
            :data="mainTableData">
            <el-table-column align="center" prop="id" label="Id" width="80" />
            <el-table-column align="center" prop="goodsItemId" label="卡号" min-width="120" />
            <el-table-column align="center" prop="toUserId" label="充值用户ID" width="120" />
            <el-table-column align="center" prop="goodsId" label="销售商品ID" width="120" />
            <el-table-column align="center" prop="name" label="商品名称" min-width="140" />
            <el-table-column align="center" prop="brand" label="品牌" width="100" />
            <el-table-column align="center" label="设备类型" width="100">
                <template #default="{ row }">
                    {{ formatDeviceType(row.deviceType) }}
                </template>
            </el-table-column>
            <el-table-column align="center" label="周期类型" width="100">
                <template #default="{ row }">
                    {{ formatPeriodType(row.periodType) }}
                </template>
            </el-table-column>
            <el-table-column align="center" label="销售渠道" width="100">
                <template #default="{ row }">
                    {{ formatSaleChannel(row.saleChannel) }}
                </template>
            </el-table-column>
            <el-table-column align="center" prop="time" label="充值时间" width="170" />
        </el-table>

        <!--分页-->
        <div class="block columnCC mt-2">
            <el-pagination :current-page="pageNum" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize"
                layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" />
        </div>
        <RechargeAddForm v-if="showAddForm" ref="refAddForm" @hideComp="hideComp" @selectPageReq="selectPageReq" />
    </div>
</template>
<script>
export default {
    name: 'Recharge'
}
</script>
<script setup>
/*1.初始化引入和实例化*/
import settings from '@/settings'
import RechargeAddForm from './RechargeAddForm.vue'
const { elMessage } = useElement()

/*2.表格操作和查询*/
let mainTableData = ref([])
let searchForm = reactive({
    brand: '',
    saleChannel: ''
})
let periodTypeOptions = [
    {
        value: 0,
        display: '所有',
    },
    {
        value: 1,
        display: '月卡(30天)',
    },
    {
        value: 2,
        display: '年卡(365天)',
    }
]
let formatPeriodType = (type) => {
    return type === 1 ? '月卡(30天)' : '年卡(365天)';
}
let deviceTypeOptions = [
    {
        value: 0,
        display: '所有',
    },
    {
        value: 1,
        display: '个人(单设备)',
    },
    {
        value: 2,
        display: '家庭(4设备)',
    }
]
let formatDeviceType = (type) => {
    return type === 1 ? '个人(单设备)' : '家庭(4设备)';
}
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
let formatSaleChannel = (type) => {
    return type === 1 ? 'Web2' : 'Web3';
}

onMounted(() => {
    selectPageReq()
})

let total = ref(1)
let selectPageReq = () => {
    const data = Object.assign(searchForm, {
        pageNumber: pageNum.value - 1,
        pageSize: pageSize.value
    })
    const postBody = JSON.parse(JSON.stringify(data))
    Object.keys(postBody).forEach((fItem) => {
        if (postBody[fItem] === '' || postBody[fItem] === null || postBody[fItem] === undefined || postBody[fItem] === 0) {
            delete postBody[fItem]
        }
    })
    let reqConfig = {
        url: '/api/mall3/recharge',
        method: 'get',
        data: postBody,
        isParams: true
    }
    axiosReq(reqConfig).then((resData) => {
        mainTableData.value = resData.data?.content;
        total.value = resData.data?.total
    })
}
import tablePageHook from '@/hooks/useTablePage'
let { pageNum, pageSize, handleCurrentChange, handleSizeChange } = tablePageHook(selectPageReq)

const searchBtnClick = () => {
    pageNum.value = 1
    selectPageReq()
}

//查询卡号
let showAddForm = ref(false)
const refAddForm = ref(null)
const hideComp = () => {
    showAddForm.value = false
}
let addBtnClick = (row) => {
    showAddForm.value = true
    nextTick(() => {
        refAddForm.value.showModal(row)
    })
}

</script>

<style scoped lang="scss">
/*详情*/
.detail-container {
    flex-wrap: wrap;
}

.detail-container-item {
    min-width: 80%;
    margin-bottom: 20px;
}

.expand-container-item {
    min-width: 50%;
    margin-bottom: 20px;
    margin-top: 10px;
    margin-left: 5px;
}

.detailDialog-title {
    margin-bottom: 14px;
    font-weight: bold;
    font-size: 16px;
}
</style>
