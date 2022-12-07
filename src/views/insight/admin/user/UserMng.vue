<template>
    <div class="scroll-y">
        <!--操作-->
        <div class="mr-3 rowSS">
            <el-button type="primary" @click="addBtnClick">
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
                <el-form-item label-width="0px" label="" prop="roleType" label-position="left">
                    <el-select v-model="searchForm.roleType" class="widthPx-150" placeholder="Role Type">
                        <el-option v-for="item in roleTypeOptions" :key="item.value" :label="item.display"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
            </el-form>
            <!--查询按钮-->
            <el-button type="primary" @click="searchBtnClick">Search</el-button>
        </div>
        <!--表格和分页-->
        <el-table id="detailElementDialog" ref="mainTable" :height="`calc(100vh - ${settings.delWindowHeight})`" border
            :data="mainTableData">
            <el-table-column align="center" prop="name" label="Name" width="150" />
            <el-table-column align="center" prop="roleType" label="Role Type" width="100" />
            <el-table-column align="center" label="Locked State" width="130">
                <template #default="{ row }">
                    {{ formatLockState(row.lockedState) }}
                </template>
            </el-table-column>
            <el-table-column align="center" prop="description" label="Description" min-width="200" />
            <el-table-column align="center" prop="createdTimeStr" label="Created Time" width="150" />
            <el-table-column align="center" prop="modifiedTimeStr" label="Modified Time" width="150" />
            <!--点击操作-->
            <el-table-column fixed="right" align="center" label="Operations" width="200">
                <template #default="{ row }">
                    <el-button link size="small" type="primary" @click="tableEditClick(row)">Edit</el-button>
                    <el-button link size="small" type="primary" @click="passwordEditClick(row)">Modify Password
                    </el-button>
                    <el-button link size="small" type="primary" @click="tableDetailClick(row)">Detail</el-button>
                    <el-button link size="small" type="primary" @click="tableDelClick(row)">Remove</el-button>
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
                <div class="detail-container-item">Name：{{ detailData.name }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Role Type：{{ detailData.roleType }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Locked State：{{ formatLockState(detailData.lockedState) }}</div>
            </div>
            <div class="detail-container rowBC">
                <div class="detail-container-item">Description：{{ detailData.description }}</div>
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
        <UserEditForm v-if="showForm" ref="refCRUDForm" @hideComp="hideComp" @selectPageReq="selectPageReq" />
        <UserPasswordEditForm v-if="showPasswordForm" ref="refPasswordCRUDForm" @hideComp="hidePasswordComp"
            @selectPageReq="selectPageReq" />
    </div>
</template>
<script>
export default {
    name: 'UserMng'
}
</script>
<script setup>
import { FolderAdd } from '@element-plus/icons-vue'
import commonUtil from '@/utils/commonUtil'
/*1.初始化引入和实例化*/
import settings from '@/settings'
import UserEditForm from './UserEditForm.vue'
import UserPasswordEditForm from './UserPasswordEditForm.vue'

/*2.表格操作和查询*/
let mainTableData = ref([])
let searchForm = reactive({
    roleType: 'all',
    name: '',
})
let roleTypeOptions = [
    {
        value: 'admin',
        display: 'admin',
    },
    {
        value: 'editor',
        display: 'editor',
    },
    {
        value: 'viewer',
        display: 'viewer',
    },
    {
        value: 'all',
        display: 'all',
    }
]
let lockStateOptions = [
    {
        value: 0,
        display: 'Unlocked',
    },
    {
        value: 1,
        display: 'Locked',
    }
]
let formatLockState = (state) => {
    return state === 1 ? 'Locked' : 'Unlocked';
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

    const body = JSON.parse(JSON.stringify(data))
    Object.keys(body).forEach((fItem) => {
        if (body[fItem] === '' || body[fItem] === null || body[fItem] === undefined) {
            delete body[fItem]
        }
        else if (fItem === 'roleType' && body[fItem] === 'all') {
            delete body[fItem]
        }
    })
    let reqConfig = {
        url: '/api/mall3/admin/user',
        method: 'get',
        data: body,
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
let deleteByIdReq = (name) => {
    return axiosReq({
        url: `/api/mall3/admin/user/${name}`,
        method: 'delete',
        bfLoading: true
    })
}
let tableDelClick = (row) => {
    elConfirm('Confirm', `Are you sure to delete user [${row.name}]?`)
        .then(() => {
            deleteByIdReq(row.name).then(() => {
                selectPageReq()
                elMessage(`Delete user [${row.name}] successfully`)
            })
        })
        .catch(() => { })
}
//添加和修改
let showForm = ref(false)
const refCRUDForm = ref(null)
let addBtnClick = () => {
    showForm.value = true
    nextTick(() => {
        refCRUDForm.value.showModal()
    })
}
const hideComp = () => {
    showForm.value = false
}
let tableEditClick = (row) => {
    showForm.value = true
    nextTick(() => {
        refCRUDForm.value.showModal(true, row)
    })
}
/*3.详情modal*/
let detailData = ref({})
let { dialogTitle, detailDialog } = useElement()
let tableDetailClick = (row) => {
    dialogTitle.value = `User Detail [${row.name}]`
    detailData.value = row
    detailDialog.value = true
}
//修改密码
let showPasswordForm = ref(false)
const refPasswordCRUDForm = ref(null)
let passwordEditClick = (row) => {
    showPasswordForm.value = true
    nextTick(() => {
        refPasswordCRUDForm.value.showModal(row)
    })
}
const hidePasswordComp = () => {
    showPasswordForm.value = false
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