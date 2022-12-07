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
                    <el-input v-model="searchForm.name" class="widthPx-150" placeholder="Name" />
                </el-form-item>
                <el-form-item label-width="0px" label="" prop="sourceDatabase" label-position="left">
                    <el-input v-model="searchForm.sourceDatabase" class="widthPx-150" placeholder="Source Database" />
                </el-form-item>
                <el-form-item label-width="0px" label="" prop="sourceTable" label-position="left">
                    <el-input v-model="searchForm.sourceTable" class="widthPx-150" placeholder="Source Table" />
                </el-form-item>
                <el-form-item label-width="0px" label="" prop="destDatabase" label-position="left">
                    <el-input v-model="searchForm.destDatabase" class="widthPx-150"
                        placeholder="Destination Database" />
                </el-form-item>
                <el-form-item label-width="0px" label="" prop="destTable" label-position="left">
                    <el-input v-model="searchForm.destTable" class="widthPx-150" placeholder="Destination Table" />
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
                    <div class="detail-container rowBC">
                        <div class="expand-container-item">
                            <b>Aggregate Fields：</b>
                            <el-table :data="props.row.fields" :border="false">
                                <el-table-column label="Original Name" prop="originalName" />
                                <el-table-column label="After Name" prop="afterName" />
                                <el-table-column label="Function">
                                    <template #default="{ row }">
                                        {{ formatFunction(row.function) }}
                                    </template>
                                </el-table-column>
                                <el-table-column label="Expression" prop="expression" />
                            </el-table>
                        </div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="id" label="Id" width="70" />
            <el-table-column align="center" prop="name" label="Name" width="100" />
            <el-table-column align="center" label="Period Type" width="90">
                <template #default="{ row }">
                    {{ formatPeriodType(row.periodType) }}
                </template>
            </el-table-column>
            <el-table-column align="center" prop="periodNum" label="Period Number" width="105" />
            <el-table-column align="center" label="Weighting Method" width="125">
                <template #default="{ row }">
                    {{ formatWeightingMethod(row.weightingMethod) }}
                </template>
            </el-table-column>
            <el-table-column align="center" prop="sourceDatabase" label="Source Database" width="120" />
            <el-table-column align="center" prop="sourceTable" label="Source Table" width="100" />
            <el-table-column align="center" prop="destDatabase" label="Destination Database" width="140" />
            <el-table-column align="center" prop="destTable" label="Destination Table" width="120" />
            <el-table-column align="center" prop="filterSqlSegment" label="Filter Sql" min-width="120" />
            <el-table-column align="center" prop="aggregateIntervalSeconds" label="Interval(s)" width="90" />

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
        <el-dialog v-model="detailDialog" :title="dialogTitle" width="600px" :close-on-click-modal="false">
            <div class="detail-container rowBC">
                <div class="detail-container-item">Id：{{ detailData.id }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Name：{{ detailData.name }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Period Type：{{ formatPeriodType(detailData.periodType) }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Period Number：{{ detailData.periodNum }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Weighting Method：{{ formatWeightingMethod(detailData.weightingMethod)
                }}</div>
            </div>

            <div class="detail-container rowBC">
                <div class="detail-container-item">Source Database：{{ detailData.sourceDatabase }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Source Table：{{ detailData.sourceTable }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Destination Database：{{ detailData.destDatabase }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Destination Table：{{ detailData.destTable }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Filter Sql：{{ detailData.filterSqlSegment }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Interval(s)：{{ detailData.aggregateIntervalSeconds }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Create Time：{{ detailData.createdTimeStr }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Update Time：{{ detailData.modifiedTimeStr }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">
                    Aggregate Field：
                    <el-table :data="detailData.fields" :border="false">
                        <el-table-column label="Original Name" prop="originalName" />
                        <el-table-column label="After Name" prop="afterName" />
                        <el-table-column label="Function">
                            <template #default="{ row }">
                                {{ formatFunction(row.function) }}
                            </template>
                        </el-table-column>
                        <el-table-column label="Expression" prop="expression" />
                    </el-table>
                </div>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button type="primary" @click="detailDialog = false">Ok</el-button>
                </span>
            </template>
        </el-dialog>
        <BaselineEditForm v-if="showFrom" ref="refCRUDForm" @hideComp="hideComp" @selectPageReq="selectPageReq" />
    </div>
</template>
<script>
export default {
    name: 'Baseline'
}
</script>
<script setup>
import { FolderAdd } from '@element-plus/icons-vue'
import commonUtil from '@/utils/commonUtil'
/*1.初始化引入和实例化*/
import settings from '@/settings'
import BaselineEditForm from './BaselineEditForm.vue'

/*2.表格操作和查询*/
let mainTableData = ref([])
let searchForm = reactive({
    name: '',
    sourceDatabase: '',
    sourceTable: '',
    destDatabase: '',
    destTable: ''
})

let formatPeriodType = (type) => {
    return type === 1 ? 'Week' : 'Day';
}
let formatWeightingMethod = (type) => {
    return type === 1 ? 'Average' : 'Weighting Average';
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
    const postBody = JSON.parse(JSON.stringify(data))
    Object.keys(postBody).forEach((fItem) => {
        if (postBody[fItem] === '' || postBody[fItem] === null || postBody[fItem] === undefined) {
            delete postBody[fItem]
        }
    })
    let reqConfig = {
        url: '/api/mall3/cfg/baseline',
        method: 'get',
        data: postBody,
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
        url: `/api/mall3/cfg/baseline/${id}`,
        method: 'delete',
        bfLoading: true
    })
}
let tableDelClick = (row) => {
    elConfirm('Confirm', `Are you sure to delete baseline [${row.id}]?`)
        .then(() => {
            deleteByIdReq(row.id).then(() => {
                selectPageReq()
                elMessage(`Delete baseline [${row.id}] successfully`)
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
    min-width: 50%;
    margin-bottom: 20px;
    margin-top: 10px;
    margin-left: 5px;
}
</style>
