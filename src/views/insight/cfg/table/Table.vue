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
            <el-button v-permission="['admin', 'editor']" type="primary" @click="influxReadBtnClick">
                <el-icon style="vertical-align: middle">
                    <Upload />
                </el-icon>
                <span style="vertical-align: middle">Read From InfluxDB</span>
            </el-button>
            <!--条件搜索-->
            <el-form ref="refsearchForm" :inline="true" class="demo-searchForm ml-2">
                <el-form-item label-width="0px" label="" prop="database" label-position="left">
                    <el-input v-model="searchForm.database" class="widthPx-150" placeholder="Database Name" />
                </el-form-item>
                <el-form-item label-width="0px" label="" prop="name" label-position="left">
                    <el-input v-model="searchForm.name" class="widthPx-150" placeholder="Table Name" />
                </el-form-item>
            </el-form>
            <!--查询按钮-->
            <el-button type="primary" @click="searchBtnClick">Search</el-button>
        </div>
        <!--表格和分页-->
        <el-table id="mainElementDialog" ref="mainTable" :height="`calc(100vh - ${settings.delWindowHeight})`" border
            :data="mainTableData">
            <el-table-column type="expand">
                <template #default="props">
                    <div class="detail-container rowBC">
                        <div class="expand-container-item">
                            <b>Tag：</b>
                            <el-table :data="props.row.tags" :border="false">
                                <el-table-column label="Tag Name" prop="name" />
                                <el-table-column label="Tag Value Type">
                                    <template #default="{ row }">
                                        {{ formatValueType(row.valueType) }}
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </div>
                    <div class="detail-container rowBC expand-container-bottom">
                        <div class="expand-container-item">
                            <b>Field：</b>
                            <el-table :data="props.row.fields" :border="false">
                                <el-table-column label="Field Name" prop="name" />
                                <el-table-column label="Field Value Type">
                                    <template #default="{ row }">
                                        {{ formatValueType(row.valueType) }}
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="id" label="Id" width="120" />
            <el-table-column align="center" prop="database" label="Database" width="180" />
            <el-table-column align="center" prop="name" label="Table Name" min-width="120" />
            <el-table-column align="center" prop="createdTimeStr" label="Create Time" width="150" />
            <el-table-column align="center" prop="modifiedTimeStr" label="Update Time" width="150" />
            <!--点击操作-->
            <el-table-column fixed="right" align="center" label="Operations" width="300">
                <template #default="{ row }">
                    <el-button v-permission="['admin', 'editor']" link size="small" type="primary"
                        @click="tdengineWriteBtnClick(row)">Write to TDengine</el-button>
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
                <div class="detail-container-item">Database：{{ detailData.database }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">TableName：{{ detailData.name }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Create Time：{{ detailData.createdTimeStr }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Update Time：{{ detailData.modifiedTimeStr }}</div>
            </div>
            <div class="detail-container rowBC" :border="true">
                <div class="detail-container-item">
                    Tag:
                    <el-table :data="detailData.tags" :border="false">
                        <el-table-column label="Tag Name" prop="name" />
                        <el-table-column label="Tag Value Type">
                            <template #default="{ row }">
                                {{ formatValueType(row.valueType) }}
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">
                    Field:
                    <el-table :data="detailData.fields" :border="false">
                        <el-table-column label="Field Name" prop="name" />
                        <el-table-column label="Field Value Type">
                            <template #default="{ row }">
                                {{ formatValueType(row.valueType) }}
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button type="primary" @click="detailDialog = false">Ok</el-button>
                </span>
            </template>
        </el-dialog>
        <TableEditForm v-if="showFrom" ref="refCRUDForm" @hideComp="hideComp" @selectPageReq="selectPageReq" />
        <InfluxReadForm v-if="showReadForm" ref="refReadForm" @hideComp="hideReadForm" @selectPageReq="selectPageReq" />
        <TdengineWriteForm v-if="showWriteForm" ref="refWriteForm" @hideComp="hideWriteForm" />
    </div>
</template>
<script>
export default {
    name: 'Table'
}
</script>
<script setup>
import { FolderAdd, Upload } from '@element-plus/icons-vue'
import commonUtil from '@/utils/commonUtil'
/*1.初始化引入和实例化*/
import settings from '@/settings'
import TableEditForm from './TableEditForm.vue'
import InfluxReadForm from './InfluxReadForm.vue'
import TdengineWriteForm from './TdengineWriteForm.vue'

/*2.表格操作和查询*/
let mainTableData = ref([])
let searchForm = reactive({
    table: '',
    database: ''
})
let valueTypeOptions = [
    {
        value: 1,
        display: 'Int',
    },
    {
        value: 2,
        display: 'Float',
    },
    {
        value: 3,
        display: 'Double',
    },
    {
        value: 4,
        display: 'Smallint',
    }, {
        value: 5,
        display: 'Tinyint',
    }
    , {
        value: 6,
        display: 'String',
    },
    {
        value: 7,
        display: 'Bool',
    },
    {
        value: 8,
        display: 'Bigint',
    }
]
let formatValueType = (type) => {
    for (const item of valueTypeOptions) {
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
        url: '/api/mall3/cfg/table',
        method: 'get',
        data,
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
        url: `/api/mall3/cfg/table/${id}`,
        method: 'delete',
        bfLoading: true
    })
}
let tableDelClick = (row) => {
    elConfirm('Confirm', `Are you sure to delete table meta [${row.id}]?`)
        .then(() => {
            deleteByIdReq(row.id).then(() => {
                selectPageReq()
                elMessage(`Delete table meta [${row.id}] successfully`)
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
    dialogTitle.value = `Table Meta Detail [${row.id}]`
    detailData.value = row
    detailDialog.value = true
}
/*详情*/

/*4.同步influx表数据*/
let showReadForm = ref(false)
const refReadForm = ref(null)
let hideReadForm = () => {
    showReadForm.value = false
}
let influxReadBtnClick = (row) => {
    showReadForm.value = true
    nextTick(() => {
        refReadForm.value.showModal()
    })
}

/*5.TDengine同步创建表*/
let showWriteForm = ref(false)
const refWriteForm = ref(null)
let hideWriteForm = () => {
    showWriteForm.value = false
}
let tdengineWriteBtnClick = (row) => {
    showWriteForm.value = true
    nextTick(() => {
        refWriteForm.value.showModal(row)
    })
}

</script>

<style scoped lang="scss">
.detail-container {
    flex-wrap: wrap;
}

.detail-container-item {
    min-width: 60%;
    margin-bottom: 20px;
}

.expand-container-item {
    min-width: 50%;
    margin-top: 5px;
    margin-left: 5px;
}

.expand-container-bottom {
    margin-bottom: 20px;
}
</style>