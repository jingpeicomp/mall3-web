<template>
    <div class="scroll-y">
        <div class="mb-1 rowSS">
            <el-alert
                title="It is used for data cutover mainly. 
            It supports data synchronization from InfluxDB measurement to TDengine table. 
            Because of the big amount of data, the synchronization operation may consume a lot of system resources and you could not execute more than two jobs at the same time!"
                type="info" />
        </div>
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
                <el-form-item label-width="0px" label="" prop="influxName" label-position="left">
                    <el-select v-model="searchForm.influxName" class="widthPx-150" placeholder="InfluxDB name">
                        <el-option v-for="item in influxNameOptions" :key="item.value" :label="item.display"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label-width="0px" label="" prop="influxDatabase" label-position="left">
                    <el-input v-model="searchForm.influxDatabase" class="widthPx-150" placeholder="InfluxDB Database" />
                </el-form-item>
                <el-form-item label-width="0px" label="" prop="influxTable" label-position="left">
                    <el-input v-model="searchForm.influxTable" class="widthPx-150"
                        placeholder="InfluxDB Meausurement" />
                </el-form-item>
                <el-form-item label-width="0px" label="" prop="tdengineDatabase" label-position="left">
                    <el-input v-model="searchForm.tdengineDatabase" class="widthPx-150"
                        placeholder="TDengine Database" />
                </el-form-item>
                <el-form-item label-width="0px" label="" prop="tdengineTable" label-position="left">
                    <el-input v-model="searchForm.tdengineTable" class="widthPx-150" placeholder="TDengine Table" />
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
                            <b>Exeucte Result:</b>
                            <el-table :data="props.row.results" :border="false">
                                <el-table-column label="ID" prop="id" />
                                <el-table-column label="Execute Time" prop="executeTimeStr" />
                                <el-table-column label="Period Start Time" prop="startTimeStr" width="100" />
                                <el-table-column label="Period End Time" prop="endTimeStr" width="100" />
                                <el-table-column label="Status" prop="status">
                                    <template #default="{ row }">
                                        {{ formatExecuteStatus(row.status) }}
                                    </template>
                                </el-table-column>
                                <el-table-column label="Cost Time(s)" prop="costSeconds" />
                                <el-table-column label="Record Number" prop="recordNum" />
                                <el-table-column label="Error Message" prop="errorMessage" width="300" />
                                <!--点击操作-->
                                <el-table-column fixed="right" align="center" label="Operations" width="100">
                                    <template #default="{ row }">
                                        <el-button link size="small" type="primary" @click="tableSubJobClick(row)">Sub
                                            Job</el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="id" label="Id" width="80" />
            <el-table-column align="center" prop="influxName" label="InfluxDB Name" width="180" />
            <el-table-column align="center" prop="influxDatabase" label="InfluxDB Database" min-width="120" />
            <el-table-column align="center" prop="influxTable" label="InfluxDB Measurement" min-width="120" />
            <el-table-column align="center" prop="tdengineName" label="TDengine Name" min-width="120" />
            <el-table-column align="center" prop="tdengineDatabase" label="TDengine Database" min-width="120" />
            <el-table-column align="center" prop="tdengineTable" label="TDengine Table" min-width="120" />
            <el-table-column align="center" label="Status" prop="status" width="120">
                <template #default="{ row }">
                    {{ formatExecuteStatus(row.status) }}
                </template>
            </el-table-column>
            <!--点击操作-->
            <el-table-column fixed="right" align="center" label="Operations" width="200">
                <template #default="{ row }">
                    <el-button v-permission="['admin', 'editor']" link size="small" type="primary"
                        @click="tableExecuteClick(row)">Execute</el-button>
                    <el-button v-permission="['admin', 'editor']" link size="small" type="primary"
                        @click="tableStopClick(row)">Stop</el-button>
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
                <div class="detail-container-item">Id: {{ detailData.id }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">InfluxDB Name: {{ detailData.influxName }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">InfluxDB Database: {{ detailData.influxDatabase }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">InfluxDB Measurement: {{ detailData.influxTable }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">TDengine Name: {{ detailData.tdengineName }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">TDengine Database: {{ detailData.tdengineDatabase }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">TDengine Table: {{ detailData.tdengineTable }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Status: {{ formatExecuteStatus(detailData.status) }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">
                    Exeucte Result:
                    <el-table :data="detailData.results" :border="false">
                        <el-table-column label="ID" prop="id" width="80" />
                        <el-table-column label="Execute Time" prop="executeTimeStr" width="160" />
                        <el-table-column label="Period Start Time" prop="startTimeStr" width="100" />
                        <el-table-column label="Period End Time" prop="endTimeStr" width="100" />
                        <el-table-column label="Status" prop="status">
                            <template #default="{ row }">
                                {{ formatExecuteStatus(row.status) }}
                            </template>
                        </el-table-column>
                        <el-table-column label="Cost Time(s)" prop="costSeconds" />
                        <el-table-column label="Record Number" prop="recordNum" />
                        <el-table-column label="Error Message" prop="errorMessage" />
                    </el-table>
                </div>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button type="primary" @click="detailDialog = false">Ok</el-button>
                </span>
            </template>
        </el-dialog>
        <SyncJobEditForm v-if="showFrom" ref="refCRUDForm" @hideComp="hideComp" @selectPageReq="selectPageReq" />
        <SyncJobExecuteForm v-if="showExecuteFrom" ref="refExecuteForm" @hideComp="hideExecuteComp"
            @selectPageReq="selectPageReq" />
        <SubJobForm v-if="showSubJobFrom" ref="refSubJobForm" @hideComp="hideSubJobComp" />
    </div>
</template>
<script>
export default {
    name: 'SyncJob'
}
</script>
<script setup>
import { FolderAdd } from '@element-plus/icons-vue'
import commonUtil from '@/utils/commonUtil'
/*1.初始化引入和实例化*/
import settings from '@/settings'
import SyncJobEditForm from './SyncJobEditForm.vue'
import SyncJobExecuteForm from './SyncJobExecuteForm.vue'
import SubJobForm from './SubJobForm.vue'

/*2.表格操作和查询*/
let mainTableData = ref([])
let searchForm = reactive({
    influxName: '',
    influxDatabase: '',
    influxTable: '',
    tdengineDatabase: '',
    tdengineTable: ''
})
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
//influx name
let influxNameOptions = ref([])
const queryInfluxNames = () => {
    axiosReq({
        url: '/api/mall3/cfg/table/influx',
        method: 'get',
        bfLoading: true
    }).then((resData) => {
        let options = []
        if (resData.data) {
            for (const name of resData.data) {
                options.push({ value: name, display: name })
            }
        }
        options.push({ value: '', display: 'All' })
        influxNameOptions.value = options
    })
}
onMounted(() => {
    queryInfluxNames()
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
        url: '/api/mall3/job/sync',
        method: 'get',
        data: postBody,
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
                if (record.results) {
                    record.results.forEach(result => {
                        if (result.executeTime) {
                            result['executeTimeStr'] = commonUtil.formatTimestamp(result.executeTime)
                        }
                        if (result.startTime) {
                            result['startTimeStr'] = commonUtil.formatDayTimestamp(result.startTime)
                        }
                        if (result.endTime) {
                            result['endTimeStr'] = commonUtil.formatDayTimestamp(result.endTime)
                        }
                        if (result.errorMessage && result.errorMessage.length > 200) {
                            result.errorMessage = result.errorMessage.substring(0, 200) + '...';
                        }
                    });
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
        url: `/api/mall3/job/sync/${id}`,
        method: 'delete',
        bfLoading: true
    })
}
let tableDelClick = (row) => {
    elConfirm('Confirm', `Are you sure to delete data sync job [${row.id}]?`)
        .then(() => {
            deleteByIdReq(row.id).then(() => {
                selectPageReq()
                elMessage(`Delete data sync job [${row.id}] successfully`)
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
const hideComp = () => {
    showFrom.value = false
}
/*3.详情modal*/
let detailData = ref({})
let { dialogTitle, detailDialog } = useElement()
let tableDetailClick = (row) => {
    dialogTitle.value = `Data Sync Job [${row.id}]`
    detailData.value = row
    detailDialog.value = true
}

//执行任务
let showExecuteFrom = ref(false)
const refExecuteForm = ref(null)
const hideExecuteComp = () => {
    showExecuteFrom.value = false
}
let tableExecuteClick = (row) => {
    showExecuteFrom.value = true
    nextTick(() => {
        refExecuteForm.value.showModal(row)
    })
}

//停止任务
let tableStopClick = (row) => {
    elConfirm('Confirm', `Are you sure to stop data sync job [${row.id}]?`)
        .then(() => {
            return axiosReq({
                url: `/api/mall3/job/sync/stop/${row.id}`,
                method: 'post',
                bfLoading: true
            }).then(() => {
                selectPageReq()
                elMessage(`Stop data sync job [${row.id}] successfully`)
            })
        })
        .catch(() => { })
}

//子任务列表
let showSubJobFrom = ref(false)
const refSubJobForm = ref(null)
const hideSubJobComp = () => {
    showSubJobFrom.value = false
}
let tableSubJobClick = (row) => {
    showSubJobFrom.value = true
    nextTick(() => {
        refSubJobForm.value.showModal(row)
    })
}

</script>

<style scoped lang="scss">
.detail-container {
    flex-wrap: wrap;
}

.detail-container-item {
    min-width: 80%;
    margin-bottom: 20px;
}

.expand-container-item {
    min-width: 90%;
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
