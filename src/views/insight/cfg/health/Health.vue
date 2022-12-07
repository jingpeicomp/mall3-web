<template>
    <div class="scroll-y">
        <!--操作-->
        <div class="mr-3 rowSS">
            <el-button v-permission="['admin', 'editor']" type="primary" @click="addBtnClick">
                <el-icon style="vertical-align: middle">
                    <FolderAdd />
                </el-icon>
                <span style="vertical-align: middle">Add</span>
            </el-button>
            <!--条件搜索-->
            <el-form ref="refsearchForm" :inline="true" class="demo-searchForm ml-2">
                <el-form-item label-width="0px" label="" prop="name" label-position="left">
                    <el-input v-model="searchForm.name" class="widthPx-200"
                        placeholder="Name supports fuzzy matching" />
                </el-form-item>
            </el-form>
            <!--查询按钮-->
            <el-button type="primary" @click="searchBtnClick">Search</el-button>
        </div>
        <!--表格和分页-->
        <el-table id="detailElementDialog" ref="mainTable" :height="`calc(100vh - ${settings.delWindowHeight})`" border
            :data="mainTableData">
            <el-table-column type="expand">
                <template #default="props">
                    <div class="detail-container rowBC expand-container-bottom">
                        <div class="expand-container-item">
                            <b>Bind Modules：</b>
                            <el-table :data="props.row.bindModules" :border="false">
                                <el-table-column label="Module Id" prop="moduleId" />
                                <el-table-column label="Module Name" prop="instance.name" />
                                <el-table-column label="Module Weight" prop="instance.weight" />
                                <el-table-column label="Business Name" prop="instance.businessName" />
                                <el-table-column label="System Name" prop="instance.systemName" />
                                <el-table-column label="Set Name" prop="instance.setName" />
                            </el-table>
                        </div>
                    </div>
                    <div class="detail-container rowBC expand-container-bottom">
                        <div class="expand-container-item">
                            <b>Bind Hosts：</b>
                            <el-table :data="props.row.bindHosts" :border="false">
                                <el-table-column label="Host Id" prop="hostId" />
                                <el-table-column label="Host Name" prop="hostName" />
                                <el-table-column label="Intranet Ip" prop="detail.intranetIp" />
                                <el-table-column label="Internet Ip" prop="detail.internetIp" />
                            </el-table>
                        </div>
                    </div>
                    <div class="detail-container rowBC expand-container-bottom">
                        <div class="expand-container-item">
                            <b>Rules：</b>
                            <el-table :data="props.row.rules" :border="false">
                                <el-table-column label="Rule Id" prop="id" />
                                <el-table-column label="Weight" prop="weight" />
                                <el-table-column label="Rule Type">
                                    <template #default="{ row }">
                                        {{ formatRuleType(row.type) }}
                                    </template>
                                </el-table-column>
                                <el-table-column label="Metric Id" prop="metricId" />
                                <el-table-column label="Metric Name" prop="metricCfg.name" />
                                <el-table-column label="Detection Function">
                                    <template #default="{ row }">
                                        {{ formatdetectionFunction(row.detectionFunction) }}
                                    </template>
                                </el-table-column>
                                <el-table-column label="Baseline Id" prop="baselineCfgId" />
                                <el-table-column label="Baseline Name" prop="baselineCfg.name" />
                                <el-table-column label="Baseline Field Name" prop="baselineField" />
                                <el-table-column label="Baseline Function">
                                    <template #default="{ row }">
                                        {{ formatFunction(row.baselineFunction) }}
                                    </template>
                                </el-table-column>
                                <el-table-column label="Baseline Field Expression" prop="baselineFieldExpression" />
                                <el-table-column label="Condition JS Script" prop="conditionScript" />
                                <el-table-column label="Score JS Script" prop="scoreScript" />
                            </el-table>
                        </div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="id" label="Id" width="100" />
            <el-table-column align="center" prop="name" label="Name" min-width="300" />
            <el-table-column align="center" prop="secondPerPeriod" label="Interval(s)" width="120" />
            <!--点击操作-->
            <el-table-column fixed="right" align="center" label="Operations" width="200">
                <template #default="{ row }">
                    <el-button v-permission="['admin', 'editor']" link size="small" type="primary"
                        @click="tableEditClick(row)">Edit</el-button>
                    <el-button link size="small" type="primary" @click="tableDetailClick(row)">Detail</el-button>
                    <el-button v-permission="['admin', 'editor']" link size="small" type="primary"
                        @click="tableDelClick(row)">Remove</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--分页-->
        <div class="block columnCC mt-2">
            <el-pagination :current-page="pageNum" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize"
                layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" />
        </div>
        <!--详情-->
        <el-dialog v-model="detailDialog" :title="dialogTitle" width="900px" :close-on-click-modal="false">
            <div class="detail-container rowBC">
                <div class="detail-container-item">Id：{{ detailData.id }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Name：{{ detailData.name }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Interval(s)：{{ detailData.secondPerPeriod }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Create Time：{{ detailData.createdTimeStr }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Update Time：{{ detailData.modifiedTimeStr }}</div>
            </div>

            <div class="detail-container rowBC expand-container-bottom">
                <div class="detail-container-item">
                    Bind Modules：
                    <el-table :data="detailData.bindModules" :border="false">
                        <el-table-column label="Module Id" prop="moduleId" />
                        <el-table-column label="Module Name" prop="instance.name" />
                        <el-table-column label="Module Weight" prop="instance.weight" />
                        <el-table-column label="Business Name" prop="instance.businessName" />
                        <el-table-column label="System Name" prop="instance.systemName" />
                        <el-table-column label="Set Name" prop="instance.setName" />
                    </el-table>
                </div>
            </div>
            <div class="detail-container rowBC expand-container-bottom">
                <div class="detail-container-item">
                    Bind Hosts:
                    <el-table :data="detailData.bindHosts" :border="false">
                        <el-table-column label="Host Id" prop="hostId" />
                        <el-table-column label="Host Name" prop="hostName" />
                        <el-table-column label="Intranet Ip" prop="detail.intranetIp" />
                        <el-table-column label="Internet Ip" prop="detail.internetIp" />
                    </el-table>
                </div>
            </div>
            <div class="detail-container rowBC expand-container-bottom">
                <div class="detail-container-item">
                    Ruels:
                    <el-table :data="detailData.rules" :border="false">
                        <el-table-column label="Rule Id" prop="id" />
                        <el-table-column label="Weight" prop="weight" />
                        <el-table-column label="Rule Type">
                            <template #default="{ row }">
                                {{ formatRuleType(row.type) }}
                            </template>
                        </el-table-column>
                        <el-table-column label="Metric Id" prop="metricId" />
                        <el-table-column label="Metric Name" prop="metricCfg.name" />
                        <el-table-column label="Detection Function">
                            <template #default="{ row }">
                                {{ formatdetectionFunction(row.detectionFunction) }}
                            </template>
                        </el-table-column>
                        <el-table-column label="Baseline Id" prop="baselineCfgId" />
                        <el-table-column label="Baseline Name" prop="baselineCfg.name" />
                        <el-table-column label="Baseline Field Name" prop="baselineField" />
                        <el-table-column label="Baseline Function">
                            <template #default="{ row }">
                                {{ formatFunction(row.baselineFunction) }}
                            </template>
                        </el-table-column>
                        <el-table-column label="Baseline Field Expression" prop="baselineFieldExpression" />
                        <el-table-column label="Condition JS Script" prop="conditionScript" />
                        <el-table-column label="Score JS Script" prop="scoreScript" />
                    </el-table>
                </div>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button type="primary" @click="detailDialog = false">Ok</el-button>
                </span>
            </template>
        </el-dialog>
        <HealthEditForm v-if="showFrom" ref="refCRUDForm" @hideComp="hideComp" @selectPageReq="selectPageReq" />
    </div>
</template>
<script>
export default {
    name: 'Health'
}
</script>
<script setup>
import { FolderAdd } from '@element-plus/icons-vue'
import commonUtil from '@/utils/commonUtil'
/*1.初始化引入和实例化*/
import settings from '@/settings'
import HealthEditForm from './HealthEditForm.vue'

/*2.表格操作和查询*/
let mainTableData = ref([])
let searchForm = reactive({
    name: ''
})

let ruleTypeOptions = [
    {
        value: 1,
        display: 'Alarm',
    },
    {
        value: 2,
        display: 'Metric',
    },
    {
        value: 3,
        display: 'Availability',
    },
]
let formatRuleType = (type) => {
    for (const item of ruleTypeOptions) {
        if (item.value === type) {
            return item.display;
        }
    }
    return '';
}
let detectionFunctionOptions = [
    {
        value: 1,
        display: 'Value',
    },
    {
        value: 2,
        display: 'Change rate',
    },
    {
        value: 3,
        display: 'Baseline ratio',
    }
]
let formatdetectionFunction = (type) => {
    for (const item of detectionFunctionOptions) {
        if (item.value === type) {
            return item.display;
        }
    }
    return '';
}
let functionOptions = [
    {
        value: 1,
        display: 'COUNT',
    },
    {
        value: 2,
        display: 'AVG',
    },
    {
        value: 3,
        display: 'SUM',
    },
    {
        value: 4,
        display: 'TWA',
    },
    {
        value: 5,
        display: 'STDDEV',
    },
    {
        value: 6,
        display: 'MIN',
    }, {
        value: 7,
        display: 'MAX',
    },
    {
        value: 8,
        display: 'FIRST',
    },
    {
        value: 9,
        display: 'LAST',
    }
]
let formatFunction = (type) => {
    for (const item of functionOptions) {
        if (item.value === type) {
            return item.display;
        }
    }
    return '';
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
    Object.keys(data).forEach((fItem) => {
        if (data[fItem] === '' || data[fItem] === null || data[fItem] === undefined) {
            delete data[fItem]
        }
    })
    let reqConfig = {
        url: '/api/mall3/cfg/health',
        method: 'get',
        data: data,
        isParams: true
    }
    axiosReq(reqConfig).then((resData) => {
        let records = resData.data?.content;
        if (records != null) {
            for (const record of records) {
                if (record.createdTime) {
                    record['createdTimeStr'] = commonUtil.formatTimestamp(record.createdTime)
                }
                if (record.modifiedTime) {
                    record['modifiedTimeStr'] = commonUtil.formatTimestamp(record.modifiedTime)
                }
            }
        }
        else {
            records = []
        }

        mainTableData.value = records
        total.value = resData.data?.total
    })
}
import tablePageHook from '@/hooks/useTablePage'
let { pageNum, pageSize, handleCurrentChange, handleSizeChange } = tablePageHook(selectPageReq)

const searchBtnClick = () => {
    //此处要重置页数，也是常出的bug
    pageNum.value = 1
    selectPageReq()
}
//删除相关
let { elMessage, elConfirm } = useElement()
const mainTable = ref(null)
let deleteByIdReq = (id) => {
    return axiosReq({
        url: `/api/mall3/cfg/health/${id}`,
        method: 'delete',
        bfLoading: true
    })
}
let tableDelClick = (row) => {
    elConfirm('Confirm', `Are you sure to delete health config [${row.id}], this operation may make system error?`)
        .then(() => {
            deleteByIdReq(row.id).then(() => {
                selectPageReq()
                elMessage(`Delete health config [${row.id}] successfully`)
            })
        })
        .catch(() => { })
}
//添加和修改
let showFrom = ref(false)
const refCRUDForm = ref(null)
let addBtnClick = () => {
    showFrom.value = true
    nextTick(() => {
        refCRUDForm.value.showModal()
    })
}
onMounted(() => {
})
const hideComp = () => {
    showFrom.value = false
}
let tableEditClick = (row) => {
    showFrom.value = true
    nextTick(() => {
        refCRUDForm.value.showModal(true, row)
    })
}
/*3.详情modal*/
let detailData = ref({})
let { dialogTitle, detailDialog } = useElement()
let tableDetailClick = (row) => {
    dialogTitle.value = `Baseline Detail [${row.id}]`
    detailData.value = row
    detailDialog.value = true
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
    min-width: 95%;
    margin-top: 10px;
    margin-left: 5px;
}

.expand-container-bottom {
    margin-bottom: 20px;
}
</style>
