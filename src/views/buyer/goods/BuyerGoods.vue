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
            <el-table-column align="center" prop="id" label="Id" width="80" />
            <el-table-column align="center" prop="name" label="商品名称" min-width="140" />
            <el-table-column align="center" prop="brand" label="品牌" width="100" />
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
            <el-table-column align="center" label="货币类型" width="100">
                <template #default="{ row }">
                    {{ formatCurrencyType(row.currencyType) }}
                </template>
            </el-table-column>
            <el-table-column align="center" prop="price" label="价格" width="100" />
            <el-table-column align="center" prop="count" label="上架库存" width="100" />
            <el-table-column align="center" prop="contractAddress" label="智能合约地址" min-width="160">
                <template #default="{ row }">
                    <el-link :href="`https://goerli.etherscan.io/address/${row.contractAddress}`" target="_blank"
                        type="primary">{{
                                row.contractAddress
                        }}</el-link>
                </template>
            </el-table-column>
            <!--点击操作-->
            <el-table-column fixed="right" align="center" label="操作" min-width="105">
                <template #default="{ row }">
                    <el-button link size="small" type="primary" @click="itemViewBtnClick(row)">附属卡</el-button>
                    <el-button v-if="row.saleChannel == 2" link size="small" type="primary"
                        @click="nftBtnClick(row)">OpenSea NFT</el-button>
                    <el-button v-if="row.saleChannel == 1" link size="small" type="primary"
                        @click="buyBtnClick(row)">购买</el-button>
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
    name: 'BuyGoods'
}
</script>
<script setup>
/*1.初始化引入和实例化*/
import settings from '@/settings'
import ViewItem from './ViewItem.vue'
import BuyForm from './BuyForm.vue'
import { pinyin } from 'pinyin-pro';

/*2.表格操作和查询*/
let mainTableData = ref([])
let searchForm = reactive({
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
        url: '/api/mall3/goods',
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
let showItemViewForm = ref(false)
const refItemViewForm = ref(null)
const hideComp = () => {
    showItemViewForm.value = false
}
let itemViewBtnClick = (row) => {
    showItemViewForm.value = true
    nextTick(() => {
        refItemViewForm.value.showModal(row)
    })
}

let nftBtnClick = (row) => {
    let url;
    let reg = new RegExp("[\\u4E00-\\u9FFF]+", "g")
    if (reg.test(row.brand)) {
        let pinyinBrand = pinyin(row.brand, { type: 'string', toneType: 'none' }).replace(' ', '-')
        url = `https://testnets.opensea.io/zh-CN/collection/${pinyinBrand}-${row.id}`;
    } else {
        url = `https://testnets.opensea.io/zh-CN/collection/${row.brand.toLowerCase()}-${row.id}`;
    }
    window.open(url, '_blank')
}

let showBuyForm = ref(false)
const refBuyForm = ref(null)
const hideBuyComp = () => {
    showBuyForm.value = false
}
let buyBtnClick = (row) => {
    showBuyForm.value = true
    nextTick(() => {
        refBuyForm.value.showModal(row)
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
