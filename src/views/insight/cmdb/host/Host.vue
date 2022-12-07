<template>
    <div class="scroll-y">
        <!--操作-->
        <div class="mr-3 rowSS">
            <el-button v-permission="['admin', 'editor']" type="primary" @click="synBtnClick">
                <el-icon style="vertical-align: middle">
                    <Upload />
                </el-icon>
                <span style="vertical-align: middle">Sync</span>
            </el-button>
            <!--条件搜索-->
            <el-form ref="refsearchForm" :inline="true" class="demo-searchForm ml-2">
                <el-form-item label-width="0px" label="" prop="name" label-position="left">
                    <el-input v-model="searchForm.name" class="widthPx-120" placeholder="Host Name" />
                </el-form-item>
                <el-form-item label-width="0px" label="" prop="ip" label-position="left">
                    <el-input v-model="searchForm.ip" class="widthPx-120" placeholder="Ip" />
                </el-form-item>
                <el-form-item label-width="0px" label="" prop="businessName" label-position="left">
                    <el-input v-model="searchForm.businessName" class="widthPx-120" placeholder="Business Name" />
                </el-form-item>
                <el-form-item label-width="0px" label="" prop="systemName" label-position="left">
                    <el-input v-model="searchForm.systemName" class="widthPx-120" placeholder="System Name" />
                </el-form-item>
                <el-form-item label-width="0px" label="" prop="setName" label-position="left">
                    <el-input v-model="searchForm.setName" class="widthPx-120" placeholder="Set Name" />
                </el-form-item>
                <el-form-item label-width="0px" label="" prop="moduleName" label-position="left">
                    <el-input v-model="searchForm.moduleName" class="widthPx-120" placeholder="Module Name" />
                </el-form-item>
            </el-form>
            <!--查询按钮-->
            <el-button type="primary" @click="searchBtnClick">Search</el-button>
        </div>
        <!--表格和分页-->
        <el-table id="detailElementDialog" ref="mainTable" :height="`calc(100vh - ${settings.delWindowHeight})`" border
            :data="mainTableData">
            <el-table-column align="center" prop="id" label="Id" width="120" />
            <el-table-column align="center" prop="name" label="Name" min-width="150" />
            <el-table-column align="center" label="Intranet Ip" prop="intranetIp" width="120" />
            <el-table-column align="center" label="Internet Ip" prop="internetIp" width="120" />
            <el-table-column align="center" prop="businessName" label="Business Name" min-width="120" />
            <el-table-column align="center" prop="systemName" label="System Name" min-width="120" />
            <el-table-column align="center" prop="setName" label="Set Name" min-width="120" />
            <el-table-column align="center" prop="moduleName" label="Module Name" min-width="120" />
            <el-table-column align="center" prop="cpu" label="Cpu Core" min-width="120" />
            <el-table-column align="center" prop="memory" label="Memory(MB)" min-width="120" />
            <el-table-column align="center" prop="disk" label="Disk(GB)" min-width="120" />
            <!--点击操作-->
            <el-table-column fixed="right" align="center" label="Operations" width="80">
                <template #default="{ row }">
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
        <el-dialog v-model="detailDialog" :title="dialogTitle" width="700px" :close-on-click-modal="false">
            <div class="detail-container rowBC">
                <div class="detail-container-item">Id：{{ detailData.id }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Name：{{ detailData.name }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Internet Ip：{{ detailData.internetIp }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Intranet Ip：{{ detailData.intranetIp }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Business Name：{{ detailData.businessName }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">System Name：{{ detailData.systemName }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Set Name：{{ detailData.setName }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Module Name：{{ detailData.moduleName }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">CPU(Core number)：{{ detailData.cpu }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Memory(MB)：{{ detailData.memory }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Disk(GB：{{ detailData.disk }}</div>
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
    </div>
</template>
<script>
export default {
    name: 'Host'
}
</script>
<script setup>
import commonUtil from '@/utils/commonUtil'
/*1.初始化引入和实例化*/
import settings from '@/settings'
import { Upload } from '@element-plus/icons-vue'

/*2.表格操作和查询*/
let mainTableData = ref([])
let searchForm = reactive({
    businessName: '',
    systemName: '',
    setName: '',
    moduleName: '',
    name: '',
    ip: ''
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
        url: '/api/mall3/cmdb/host',
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

let { elMessage, elConfirm } = useElement()
const synBtnClick = () => {
    elConfirm('Confirm', `The operation will synchronize modules and hosts from CMDB. It may take some time, are you sure to do that?`)
        .then(() => {
            axiosReq({
                url: '/api/mall3/cmdb/sync',
                method: 'post',
                bfLoading: true,
                timeout: 60000
            }).then((resData) => {
                selectPageReq()
                elMessage(`Synchronize modules and hosts from CMDB successfully`)
            })
        })
}

const mainTable = ref(null)
//添加和修改
let showFrom = ref(false)
const refCRUDForm = ref(null)

const hideComp = () => {
    showFrom.value = false
}

/*3.详情modal*/
let detailData = ref({})
let { dialogTitle, detailDialog } = useElement()
let tableDetailClick = (row) => {
    dialogTitle.value = `Host Detail [${row.name}]`
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