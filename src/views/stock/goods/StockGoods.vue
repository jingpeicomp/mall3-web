<template>
    <div class="scroll-y">
        <!--操作-->
        <div class="mr-3 rowSS">
            <!--条件搜索-->
            <el-form ref="refsearchForm" :inline="true" class="demo-searchForm ml-2">
                <el-form-item label-width="0px" label="" prop="type" label-position="left">
                    <el-select v-model="searchForm.deviceType" class="widthPx-150" placeholder="设备类型">
                        <el-option v-for="item in deviceTypeOptions" :key="item.value" :label="item.display"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label-width="0px" label="" prop="type" label-position="left">
                    <el-select v-model="searchForm.periodType" class="widthPx-150" placeholder="周期类型">
                        <el-option v-for="item in periodTypeOptions" :key="item.value" :label="item.display"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
            </el-form>
            <!--查询按钮-->
            <el-button type="primary" @click="searchBtnClick">查询</el-button>
        </div>
        <!--表格和分页-->
        <el-table id="mainTable" ref="mainTable" :height="`calc(100vh - ${settings.delWindowHeight})`" border
            :data="mainTableData">
            <el-table-column align="center" prop="id" label="Id" width="80" />
            <el-table-column align="center" prop="brand" label="品牌" width="140" />
            <el-table-column align="center" prop="brandIcon" label="品牌Logo" min-width="120">
                <template #default="{ row }">
                    <el-image style="width: 80px; height: 80px" :src="row.brandIcon" />
                </template>
            </el-table-column>
            <el-table-column align="center" label="设备类型" width="140">
                <template #default="{ row }">
                    {{ formatDeviceType(row.deviceType) }}
                </template>
            </el-table-column>
            <el-table-column align="center" label="周期类型" width="140">
                <template #default="{ row }">
                    {{ formatPeriodType(row.periodType) }}
                </template>
            </el-table-column>
            <el-table-column align="center" prop="count" label="库存" width="140" />
            <!--点击操作-->
            <el-table-column fixed="right" align="center" label="操作" min-width="200">
                <template #default="{ row }">
                    <el-button link size="small" type="primary" @click="shelveBtnClick(row)">上架</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--分页-->
        <div class="block columnCC mt-2">
            <el-pagination :current-page="pageNum" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize"
                layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" />
        </div>
        <StockGoodsEditForm v-if="showShelveForm" ref="refShelveForm" @hideComp="hideComp"
            @selectPageReq="selectPageReq" />
    </div>
</template>
<script>
export default {
    name: 'StockGoods'
}
</script>
<script setup>
/*1.初始化引入和实例化*/
import settings from '@/settings'
import StockGoodsEditForm from './StockGoodsEditForm.vue'
import { useUserStore } from '@/store/user'
const { elMessage } = useElement()

const userStore = useUserStore()

/*2.表格操作和查询*/
let mainTableData = ref([])
let searchForm = reactive({
    periodType: '',
    deviceType: '',
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
        url: '/api/mall3/stock',
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

//添加和修改
let showShelveForm = ref(false)
const refShelveForm = ref(null)
const hideComp = () => {
    showShelveForm.value = false
}
let shelveBtnClick = (row) => {
    if (!row.brand && !userStore.brand) {
        elMessage('请先到【账号-我的】菜单中配置品牌', 'error')
        return
    }
    showShelveForm.value = true
    const data = JSON.parse(JSON.stringify(row))
    data.goodsName = (data.brand || userStore.brand) + formatDeviceType(data.deviceType) + formatPeriodType(data.periodType)
    data.goodsImage = row.brandIcon || userStore.brandIcon
    data.count = 0
    data.stockId = row.id
    data.stockCount = row.count
    nextTick(() => {
        refShelveForm.value.showModal(data)
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
