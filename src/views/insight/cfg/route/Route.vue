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
                <el-form-item label-width="0px" label="" prop="type" label-position="left">
                    <el-select v-model="searchForm.type" class="widthPx-150" placeholder="Source Type">
                        <el-option v-for="item in searchTypeOptions" :key="item.value" :label="item.display"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label-width="0px" label="" prop="database" label-position="left">
                    <!--  --c -->
                    <el-input v-model="searchForm.database" class="widthPx-150" placeholder="Source Database Name" />
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
                            <b>Destination：</b>
                            <el-table :data="props.row.destinations" :border="false">
                                <el-table-column label="Destination Type">
                                    <template #default="{ row }">
                                        {{ formatStorageType(row.type) }}
                                    </template>
                                </el-table-column>
                                <el-table-column label="Server Name" prop="name" />
                                <el-table-column label="Database" prop="database" />
                            </el-table>
                        </div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="id" label="Id" min-width="120" />
            <el-table-column align="center" label="Source Type" width="100">
                <template #default="{ row }">
                    {{ formatStorageType(row.sourceType) }}
                </template>
            </el-table-column>
            <el-table-column align="center" prop="sourceDatabase" label="Source Database" width="180" />
            <el-table-column align="center" prop="sourceTables" label="Source Table" min-width="120" />
            <el-table-column align="center" prop="createdTimeStr" label="Create Time" width="140" />
            <el-table-column align="center" prop="modifiedTimeStr" label="Update Time" width="140" />
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
                <div class="detail-container-item">Source Type：{{ formatStorageType(detailData.sourceType) }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Source Database：{{ detailData.sourceDatabase }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Source Table：{{ detailData.sourceTables }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Create Time：{{ detailData.createdTimeStr }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Update Time：{{ detailData.modifiedTimeStr }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">
                    Destination：
                    <el-table :data="detailData.destinations" :border="false">
                        <el-table-column label="Destination Type">
                            <template #default="{ row }">
                                {{ formatStorageType(row.type) }}
                            </template>
                        </el-table-column>
                        <el-table-column label="Server Name" prop="name" />
                        <el-table-column label="Database" prop="database" />
                    </el-table>
                </div>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button type="primary" @click="detailDialog = false">Ok</el-button>
                </span>
            </template>
        </el-dialog>
        <RouteEditForm v-if="showFrom" ref="refCRUDForm" @hideComp="hideComp" @selectPageReq="selectPageReq" />
    </div>
</template>
<script>
export default {
    name: 'Route'
}
</script>
<script setup>
import { FolderAdd } from '@element-plus/icons-vue'
import commonUtil from '@/utils/commonUtil'
/*1.初始化引入和实例化*/
import settings from '@/settings'
import RouteEditForm from './RouteEditForm.vue'

/*2.表格操作和查询*/
let mainTableData = ref([])
let searchForm = reactive({
    type: 0,
    database: ''
})
let searchTypeOptions = [
    {
        value: 0,
        display: 'All',
    },
    {
        value: 1,
        display: 'InfluxDB',
    },
    {
        value: 2,
        display: 'TDEngine',
    }
]
let formatStorageType = (type) => {
    return type === 1 ? 'InfluxDB' : 'TDEngine';
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
        else if (fItem === 'type' && postBody[fItem] < 1) {
            delete postBody[fItem]
        }
    })
    let reqConfig = {
        url: '/api/mall3/cfg/route',
        method: 'get',
        data: postBody,
        isParams: true
    }
    axiosReq(reqConfig).then((resData) => {
        let records = [];
        if (resData.data && resData.data.content) {
            records = resData.data.content;
            for (let i in records) {
                let record = records[i];
                if (record.createdTime) {
                    record['createdTimeStr'] = commonUtil.formatTimestamp(record.createdTime)
                }
                if (record.modifiedTime) {
                    record['modifiedTimeStr'] = commonUtil.formatTimestamp(record.modifiedTime)
                }
                if (record.sourceTables) {
                    record.sourceTables = record.sourceTables.join(',')
                } else {
                    record.sourceTables = ''
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
        url: '/api/mall3/cfg/route',
        data: { id: id },
        isParams: false,
        method: 'delete',
        bfLoading: true
    })
}
let tableDelClick = (row) => {
    elConfirm('Confirm', `Are you sure to delete route [${row.id}]?`)
        .then(() => {
            deleteByIdReq(row.id).then(() => {
                selectPageReq()
                elMessage(`Delete route [${row.id}] successfully`)
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
    dialogTitle.value = `Route Detail [${row.id}]`
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

.detailDialog-title {
    margin-bottom: 14px;
    font-weight: bold;
    font-size: 16px;
}
</style>
