<template>
    <div class="scroll-y">
        <!--操作-->
        <div class="mr-3 rowSS">
            <!--条件搜索-->
            <el-form ref="refsearchForm" :inline="true" class="demo-searchForm ml-2">
                <el-form-item label-width="0px" label="" prop="state" label-position="left">
                    <el-select v-model="searchForm.state" class="widthPx-150" placeholder="订单状态">
                        <el-option v-for="item in stateOptions" :key="item.value" :label="item.display"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label-width="0px" label="" prop="type" label-position="left">
                    <el-input v-model="searchForm.brand" placeholder="品牌" />
                </el-form-item>
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
                <el-form-item label-width="0px" label="" prop="type" label-position="left">
                    <el-select v-model="searchForm.saleChannel" class="widthPx-150" placeholder="销售渠道">
                        <el-option v-for="item in saleChannelOptions" :key="item.value" :label="item.display"
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
            <el-table-column align="center" prop="id" label="订单Id" width="80" />
            <el-table-column align="center" label="订单状态" width="100">
                <template #default="{ row }">
                    {{ formatState(row.state) }}
                </template>
            </el-table-column>
            <el-table-column align="center" prop="goodsId" label="商品Id" width="80" />
            <el-table-column align="center" prop="name" label="商品名称" min-width="140" />
            <el-table-column align="center" prop="sellerId" label="卖家ID" width="80" />
            <el-table-column align="center" prop="seller.name" label="卖家名称" width="100" />

            <el-table-column align="center" prop="count" label="购买数目" width="90" />
            <el-table-column align="center" prop="payAmount" label="金额" width="100" />
            <el-table-column align="center" prop="paidAmount" label="支付金额" width="100" />
            <el-table-column align="center" prop="gasAmount" label="手续费" width="80" />

            <el-table-column align="center" prop="createTime" label="创建时间" width="100" />
            <el-table-column align="center" prop="payTime" label="支付时间" width="100" />
            <el-table-column align="center" prop="brand" label="品牌" width="80" />
            <el-table-column align="center" prop="image" label="商品图片" min-width="120">
                <template #default="{ row }">
                    <el-image style="width: 60px; height: 60px" :src="row.image" />
                </template>
            </el-table-column>
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

            <el-table-column align="center" label="交易ID" min-width="120">
                <template #default="{ row }">
                    <el-link :href="`https://goerli.etherscan.io/tx/${row.txId}`" target="_blank" type="primary">{{
                            row.txId
                    }}</el-link>
                </template>
            </el-table-column>
        </el-table>

        <!--分页-->
        <div class="block columnCC mt-2">
            <el-pagination :current-page="pageNum" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize"
                layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" />
        </div>
        <ViewItem v-if="showItemViewForm" ref="refItemViewForm" @hideComp="hideComp" @selectPageReq="selectPageReq" />
        <BuyForm v-if="showBuyForm" ref="refBuyForm" @hideComp="hideBuyComp" @selectPageReq="selectPageReq" />
    </div>
</template>
<script>
export default {
    name: 'BuyerOrders'
}
</script>
<script setup>
/*1.初始化引入和实例化*/
import settings from '@/settings'
import { pinyin } from 'pinyin-pro';

/*2.表格操作和查询*/
let mainTableData = ref([])
let searchForm = reactive({
    state: 0,
    periodType: '',
    deviceType: '',
    saleChannel: '',
    brand: '',
    showSeller: false
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
        value: 0,
        display: '所有',
    },
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
let formatCurrencyType = (type) => {
    return type === 1 ? 'Vcoin' : '以太币';
}

let stateOptions = [
    {
        value: 0,
        display: '全部',
    },
    {
        value: 1,
        display: '待支付',
    },
    {
        value: 2,
        display: '已支付',
    },
    {
        value: 3,
        display: '支付失败',
    }
]
let formatState = (state) => {
    if (state == 2) {
        return '支付成功'
    } else
        if (state == 3) {
            return '支付失败'
        }
        else {
            return '待支付'
        }
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
        url: '/api/mall3/order',
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
