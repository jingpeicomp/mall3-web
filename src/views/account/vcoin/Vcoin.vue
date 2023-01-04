<template>
    <div>
        <div class="mr-3 rowSS top-div">
            <div class="amount-balance">Vcoin账户余额: {{ balanceAmount }}</div>
            <el-button type="primary" @click="rechargeBtnClick">
                <el-icon style="vertical-align: middle">
                    <FolderAdd />
                </el-icon>
                <span style="vertical-align: middle">充值</span>
            </el-button>
            <el-form ref="refsearchForm" :inline="true" class="demo-searchForm ml-2">
                <el-form-item label-width="0px" label="" prop="state" label-position="left">
                    <el-select v-model="searchForm.state" class="widthPx-150" placeholder="支付单状态">
                        <el-option v-for="item in stateOptions" :key="item.value" :label="item.display"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
            </el-form>
            <el-button type="primary" @click="searchBtnClick">刷新</el-button>
        </div>
        <div class="scroll-y">
            <!--表格和分页-->
            <el-table id="detailElementDialog" ref="mainTable" :height="`calc(100vh - ${'250px'})`" border
                :data="mainTableData">
                <el-table-column align="center" prop="id" label="ID" width="80" />
                <el-table-column align="center" prop="amount" label="充值Vcoin金额" width="100" />
                <el-table-column align="center" label="支付单状态" width="100">
                    <template #default="{ row }">
                        {{ formatState(row.state) }}
                    </template>
                </el-table-column>
                <el-table-column align="center" prop="payAmount" label="支付金额（以太币）" width="120" />
                <el-table-column align="center" prop="actualPayAmount" label="实际支付金额（以太币）" width="130" />
                <el-table-column align="center" prop="gasAmount" label="手续费（以太币）" width="130" />
                <el-table-column align="center" prop="payEthPubAddr" label="付款Web3钱包账户" min-width="200">
                    <template #default="{ row }">
                        <el-link :href="`https://goerli.etherscan.io/address/${row.payEthPubAddr}`" target="_blank"
                            type="primary">{{
                                    row.payEthPubAddr
                            }}</el-link>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="交易ID" min-width="220">
                    <template #default="{ row }">
                        <el-link :href="`https://goerli.etherscan.io/tx/${row.txId}`" target="_blank" type="primary">{{
                                row.txId
                        }}</el-link>
                    </template>
                </el-table-column>
                <el-table-column align="center" prop="createTime" label="创建时间" width="170" />
                <el-table-column align="center" prop="payTime" label="支付时间" width="170" />
            </el-table>
            <!--分页-->
            <div class="block columnCC mt-2">
                <el-pagination :current-page="pageNum" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize"
                    layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
                    @current-change="handleCurrentChange" />
            </div>
            <VcoinRechargeForm v-if="showRechargeForm" ref="refRechargeForm" @hideComp="hideRechargeComp"
                @selectPageReq="selectPageReq" />
        </div>
    </div>
</template>
<script>
export default {
    name: 'UserMng'
}
</script>
<script setup>
import { FolderAdd } from '@element-plus/icons-vue'
import web3Util from '@/utils/web3Util'
import commonUtil from '@/utils/commonUtil'
/*1.初始化引入和实例化*/
import settings from '@/settings'
import Web3 from 'web3';
import VcoinRechargeForm from './VcoinRechargeForm.vue'


/*2.表格操作和查询*/
let mainTableData = ref([])
let searchForm = reactive({
    state: 0
})

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

onMounted(() => {
    selectPageReq()
})

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

const searchBtnClick = () => {
    pageNum.value = 1
    selectPageReq()
}

let total = ref(1)
let balanceAmount = ref(1)
let selectPageReq = () => {
    const data = {
        pageNumber: pageNum.value - 1,
        pageSize: pageSize.value
    }
    if (searchForm.state != 0) {
        data.state = searchForm.state
    }


    axiosReq({
        url: '/api/mall3/account/me',
        method: 'get',
    }).then((resData) => {
        balanceAmount.value = resData.data?.balanceAmount
    })

    let reqConfig = {
        url: '/api/mall3/vcoin/recharge',
        method: 'get',
        data: data,
        isParams: true
    }
    axiosReq(reqConfig).then((resData) => {
        mainTableData.value = resData.data.content
        for (const item of resData.data.content) {
            item['actualPayAmount'] = (item.paidAmount || 0) + (item.gasAmount || 0);
        }
        total.value = resData.data?.total
    })
}
import tablePageHook from '@/hooks/useTablePage'
let { pageNum, pageSize, handleCurrentChange, handleSizeChange } = tablePageHook(selectPageReq)
const mainTable = ref(null)

//充值
let showRechargeForm = ref(false)
const refRechargeForm = ref(null)
const hideRechargeComp = () => {
    showRechargeForm.value = false
}
let rechargeBtnClick = (row) => {
    web3Util.getWeb3().then(res => {
        let web3 = res
        web3.eth.getAccounts().then(accounts => {
            console.log('===>Accounts:', accounts)
            let data = { fromPubAddress: accounts[0] }
            showRechargeForm.value = true
            nextTick(() => {
                refRechargeForm.value.showModal(data)
            })
        });
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

.amount-balance {
    // background-color: #79bbff;
    color: #c45656;
    margin-right: 30px;
    margin-left: 10px;
    font-size: large;
    font-weight: 600;
}

.top-div {
    margin-bottom: 20px;
    margin-top: 10px;
}
</style>