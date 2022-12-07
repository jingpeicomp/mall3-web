<template>
    <div class="scroll-y">
        <!--操作-->
        <div class="mr-3 rowSS">
            <!--条件搜索-->
            <el-form ref="refsearchForm" :inline="true" class="demo-searchForm ml-2">
                <el-form-item label-width="0px" label="" prop="zabbixName" label-position="left">
                    <el-select v-model="searchForm.zabbixName" class="widthPx-150" placeholder="Zabbix Name">
                        <el-option v-for="item in zabbixNameOptions" :key="item.value" :label="item.display"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label-width="0px" label="" prop="hostName" label-position="left">
                    <el-input v-model="searchForm.hostName" class="widthPx-160"
                        placeholder="Host name, fuzzy matching" />
                </el-form-item>
                <el-form-item label-width="0px" label="" prop="level" label-position="left">
                    <el-select v-model="searchForm.level" class="widthPx-150" placeholder="Level">
                        <el-option v-for="item in levelOptions" :key="item.value" :label="item.display"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label-width="0px" label="" prop="recovered" label-position="left">
                    <el-select v-model="searchForm.recovered" class="widthPx-130" placeholder="State">
                        <el-option v-for="item in recoveredOptions" :key="item.value" :label="item.display"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label-width="0px" label="" prop="createTime" label-position="left">
                    <el-date-picker v-model="startEndArr" type="datetimerange" format="YYYY-MM-DD HH:mm"
                        value-format="YYYY-MM-DD HH:mm:ss" class="widthPx-260" range-separator="-"
                        start-placeholder="Start Time" end-placeholder="End Time" @change="dateTimePacking" />
                </el-form-item>
            </el-form>
            <!--查询按钮-->
            <el-button type="primary" @click="searchBtnClick">Search</el-button>
        </div>
        <!--表格和分页-->
        <el-table id="detailElementDialog" ref="mainTable" :height="`calc(100vh - ${settings.delWindowHeight})`" border
            :data="mainTableData">
            <el-table-column align="center" prop="id" label="Id" width="70" />
            <el-table-column align="center" prop="zabbixName" label="Zabbix Name" width="100" />
            <el-table-column align="center" prop="zabbixAlarmId" label="Zabbix Alarm Id" width="110" />
            <el-table-column align="center" prop="hostName" label="Host" width="150" />
            <el-table-column align="center" prop="name" label="Name" min-width="120" />
            <el-table-column align="center" prop="timeStr" label="Alarm Time" width="150" />
            <el-table-column align="center" label="Level" width="100">
                <template #default="{ row }">
                    <div :class="getLevelCellClassName(row.level)"> {{ formatLevel(row.level) }}</div>
                </template>
            </el-table-column>
            <el-table-column align="center" label="State" width="100">
                <template #default="{ row }">
                    {{ formatRecovered(row.recovered) }}
                </template>
            </el-table-column>
            <el-table-column align="center" prop="recoveredTimeStr" label="Recovered Time" width="150" />
        </el-table>

        <!--分页-->
        <div class="block columnCC mt-2">
            <el-pagination :current-page="pageNum" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize"
                layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" />
        </div>
    </div>
</template>
<script>
export default {
    name: 'Alarm'
}
</script>
<script setup>
import commonUtil from '@/utils/commonUtil'
/*1.初始化引入和实例化*/
import settings from '@/settings'

/*2.表格操作和查询*/
let mainTableData = ref([])
let searchForm = reactive({
    zabbixName: null,
    hostName: '',
    recovered: null,
    level: null
})


let formatRecovered = (value) => {
    return value ? 'Recovered' : 'Unrecovered';
}
let zabbixNameOptions = [
    {
        value: 'mfc',
        display: 'MFC',
    },
    {
        value: 'live',
        display: 'Live',
    },
    {
        value: 'goose',
        display: 'GOOSE',
    },
    {
        value: '',
        display: 'All',
    },
]
let recoveredOptions = [
    {
        value: true,
        display: 'Recovered',
    },
    {
        value: false,
        display: 'Unrecovered',
    },
    {
        value: '',
        display: 'All',
    }
]
let levelOptions = [
    {
        value: -1,
        display: 'All',
    },
    {
        value: 0,
        display: 'Not classified',
    },
    {
        value: 1,
        display: 'Information',
    },
    {
        value: 2,
        display: 'Warning',
    },
    {
        value: 3,
        display: 'Average',
    },
    {
        value: 4,
        display: 'High',
    },
    {
        value: 5,
        display: 'Disaster',
    },
]
let formatLevel = (level) => {
    for (const item of levelOptions) {
        if (item.value === level) {
            return item.display;
        }
    }
    return '';
}

const getLevelCellClassName = (level) => {
    if (level <= 1) {
        return "level-cell-information"
    }
    else if (level === 2) {
        return "level-cell-warning"
    }
    else if (level === 3) {
        return "level-cell-average"
    }
    else if (level === 4) {
        return "level-cell-high"
    }
    else if (level === 5) {
        return "level-cell-disaster"
    }

    return null;
}

onMounted(() => {
    selectPageReq()
})

let total = ref(1)
let { startEndArr } = useCommon()
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
        else if (fItem === 'level' && body[fItem] < 0) {
            delete body[fItem]
        }
    })
    let reqConfig = {
        url: '/api/mall3/alarm',
        method: 'get',
        data: body,
        isParams: true
    }
    axiosReq(reqConfig).then((resData) => {
        let records = resData.data?.content;
        if (records != null) {
            for (const record of records) {
                if (record.time) {
                    record['timeStr'] = commonUtil.formatTimestamp(record.time)
                }
                if (record.recoveredTime) {
                    record['recoveredTimeStr'] = commonUtil.formatTimestamp(record.recoveredTime)
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
const dateTimePacking = (timeArr) => {
    if (timeArr && timeArr.length === 2) {
        searchForm.startTime = timeArr[0]
        searchForm.endTime = timeArr[1]
    } else {
        searchForm.startTime = ''
        searchForm.endTime = ''
    }
}
const searchBtnClick = () => {
    //此处要重置页数，也是常出的bug
    pageNum.value = 1
    selectPageReq()
}

const mainTable = ref(null)

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

.level-cell-information {
    background: var(--el-color-info-light-7);
}

.level-cell-warning {
    background: var(--el-color-warning-light-5);
}

.level-cell-average {
    background: var(--el-color-warning-light-3);
}

.level-cell-high {
    background: var(--el-color-danger-light-5);
}

.level-cell-disaster {
    background: var(--el-color-danger-light-3);
}
</style>
