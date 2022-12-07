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
                <el-form-item label-width="0px" label="" prop="database" label-position="left">
                    <el-input v-model="searchForm.database" class="widthPx-150" placeholder="Database" />
                </el-form-item>
                <el-form-item label-width="0px" label="" prop="table" label-position="left">
                    <el-input v-model="searchForm.table" class="widthPx-150" placeholder="Table" />
                </el-form-item>
            </el-form>
            <!--查询按钮-->
            <el-button type="primary" @click="searchBtnClick">Search</el-button>
        </div>
        <!--表格和分页-->
        <el-table id="detailElementDialog" ref="mainTable" :height="`calc(100vh - ${settings.delWindowHeight})`" border
            :data="mainTableData">
            <el-table-column align="center" prop="id" label="Id" width="60" />
            <el-table-column align="center" prop="name" label="Name" width="120" />
            <el-table-column align="center" prop="database" label="Database" width="80" />
            <el-table-column align="center" prop="table" label="Table" width="80" />
            <el-table-column align="center" prop="filterSqlSegment" label="Filter Sql" min-width="120" />
            <el-table-column align="center" prop="field" label="Field" width="80" />
            <el-table-column align="center" label="Function" width="70">
                <template #default="{ row }">
                    {{ formatFunction(row.function) }}
                </template>
            </el-table-column>
            <el-table-column align="center" prop="fieldExpression" label="Field Expression" min-width="120" />
            <el-table-column align="center" prop="aggregateIntervalSeconds" label="Interval(s)" width="75" />
            <el-table-column align="center" prop="sql" label="Sql Example" min-width="200" />
            <!--点击操作-->
            <el-table-column fixed="right" align="center" label="Operations" width="160">
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
                <div class="detail-container-item">Database：{{ detailData.database }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Table：{{ detailData.table }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Filter Sql：{{ detailData.filterSqlSegment }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Field：{{ detailData.field }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Function：{{ formatFunction(detailData.function) }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Field Expression：{{ detailData.fieldExpression }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Interval(s)：{{ detailData.aggregateIntervalSeconds }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Sql Example：{{ detailData.sql }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Create Time：{{ detailData.createdTimeStr }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Update Time：{{ detailData.modifiedTimeStr }}</div>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button type="primary" @click="detailDialog = false">Ok</el-button>
                </span>
            </template>
        </el-dialog>
        <MetricEditForm v-if="showFrom" ref="refCRUDForm" @hideComp="hideComp" @selectPageReq="selectPageReq" />
    </div>
</template>
<script>
export default {
    name: 'Metric'
}
</script>
<script setup>
import { FolderAdd } from '@element-plus/icons-vue'
import commonUtil from '@/utils/commonUtil'
/*1.初始化引入和实例化*/
import settings from '@/settings'
import MetricEditForm from './MetricEditForm.vue'

/*2.表格操作和查询*/
let mainTableData = ref([])
let searchForm = reactive({
    name: '',
    database: '',
    table: ''
})
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
        url: '/api/mall3/cfg/metric',
        method: 'get',
        data,
        isParams: true
    }
    axiosReq(reqConfig).then((resData) => {
        let records = [];
        if (resData.data && resData.data.content) {
            records = resData.data.content;
            for (const record of records) {
                if (record.createdTime) {
                    record['createdTimeStr'] = commonUtil.formatTimestamp(record.createdTime)
                }
                if (record.modifiedTime) {
                    record['modifiedTimeStr'] = commonUtil.formatTimestamp(record.modifiedTime)
                }
            }
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
        url: `/api/mall3/cfg/metric/${id}`,
        method: 'delete',
        bfLoading: true
    })
}
let tableDelClick = (row) => {
    elConfirm('Confirm', `Are you sure to delete metric [${row.id}]?`)
        .then(() => {
            deleteByIdReq(row.id).then(() => {
                selectPageReq()
                elMessage(`Delete metric [${row.id}] successfully`)
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
    dialogTitle.value = `Metric Detail [${row.id}]`
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
</style>