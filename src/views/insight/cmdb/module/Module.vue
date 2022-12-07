<template>
    <div class="scroll-y">
        <!--操作-->
        <div class="mr-3 rowSS">
            <!--条件搜索-->
            <el-form ref="refsearchForm" :inline="true" class="demo-searchForm ml-2">
                <el-form-item label-width="0px" label="" prop="businessName" label-position="left">
                    <el-input v-model="searchForm.businessName" class="widthPx-150" placeholder="Business Name" />
                </el-form-item>
                <el-form-item label-width="0px" label="" prop="systemName" label-position="left">
                    <el-input v-model="searchForm.systemName" class="widthPx-150" placeholder="System Name" />
                </el-form-item>
                <el-form-item label-width="0px" label="" prop="setName" label-position="left">
                    <el-input v-model="searchForm.setName" class="widthPx-150" placeholder="Set Name" />
                </el-form-item>
                <el-form-item label-width="0px" label="" prop="moduleName" label-position="left">
                    <el-input v-model="searchForm.moduleName" class="widthPx-150" placeholder="Module Name" />
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
                            <b>Host：</b>
                            <el-table :data="props.row.hosts" :border="false">
                                <!-- <el-table-column label="Host ID" prop="id" /> -->
                                <el-table-column label="Host Name" prop="name" />
                                <el-table-column label="Intranet Ip" prop="intranetIp" />
                                <el-table-column label="Internet Ip" prop="internetIp" />
                                <el-table-column prop="cpu" label="Cpu Core" />
                                <el-table-column prop="memory" label="Memory(MB)" />
                                <el-table-column prop="disk" label="Disk(GB)" />
                            </el-table>
                        </div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="id" label="Id" width="120" />
            <el-table-column align="center" prop="name" label="Name" min-width="150" />
            <el-table-column align="center" prop="weight" label="Weight" width="80" />
            <el-table-column align="center" prop="businessName" label="Business Name" min-width="120" />
            <el-table-column align="center" prop="systemName" label="System Name" min-width="120" />
            <el-table-column align="center" prop="setName" label="Set Name" min-width="120" />
            <!--点击操作-->
            <el-table-column fixed="right" align="center" label="Operations" width="160">
                <template #default="{ row }">
                    <el-button v-permission="['admin', 'editor']" link size="small" type="primary"
                        @click="weightEditClick(row)">Edit Weight</el-button>
                    <el-button link size="small" type="primary" @click="tableDetailClick(row)">Detail</el-button>
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
        <el-dialog v-model="detailDialog" :title="dialogTitle" width="800px" :close-on-click-modal="false">
            <div class="detail-container rowBC">
                <div class="detail-container-item">Id：{{ detailData.id }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Name：{{ detailData.name }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Weight：{{ detailData.weight }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Business Id：{{ detailData.businessId }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Business Name：{{ detailData.businessName }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">System Id：{{ detailData.systemId }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">System Name：{{ detailData.systemName }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Set Id：{{ detailData.setId }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Set Name：{{ detailData.setName }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Create Time：{{ detailData.createdTimeStr }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Update Time：{{ detailData.modifiedTimeStr }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">
                    Host：
                    <el-table :data="detailData.hosts" :border="false">
                        <el-table-column label="Host ID" prop="id" />
                        <el-table-column label="Host Name" prop="name" />
                        <el-table-column label="Intranet Ip" prop="intranetIp" />
                        <el-table-column label="Internet Ip" prop="internetIp" />
                        <el-table-column prop="cpu" label="Cpu Core" />
                        <el-table-column prop="memory" label="Memory(MB)" />
                        <el-table-column prop="disk" label="Disk(GB)" />
                    </el-table>
                </div>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button type="primary" @click="detailDialog = false">Ok</el-button>
                </span>
            </template>
        </el-dialog>
        <ModuleWeightEditForm v-if="showFrom" ref="refCRUDForm" @hideComp="hideComp" @selectPageReq="selectPageReq" />
    </div>
</template>
<script>
export default {
    name: 'Module'
}
</script>
<script setup>
import commonUtil from '@/utils/commonUtil'
/*1.初始化引入和实例化*/
import settings from '@/settings'
import ModuleWeightEditForm from './ModuleWeightEditForm.vue'

/*2.表格操作和查询*/
let mainTableData = ref([])
let searchForm = reactive({
    businessName: '',
    systemName: '',
    setName: '',
    moduleName: ''
})

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
        url: '/api/mall3/cmdb/module',
        method: 'get',
        data,
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

const mainTable = ref(null)
//添加和修改
let showFrom = ref(false)
const refCRUDForm = ref(null)

const hideComp = () => {
    showFrom.value = false
}
let weightEditClick = (row) => {
    showFrom.value = true
    nextTick(() => {
        refCRUDForm.value.showModal(true, row)
    })
}
/*3.详情modal*/
let detailData = ref({})
let { dialogTitle, detailDialog } = useElement()
let tableDetailClick = (row) => {
    dialogTitle.value = `Module Detail [${row.name}]`
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