<template>
    <div class="scroll-y">
        <!--操作-->
        <div class="mr-3 rowSS">
            <!--条件搜索-->
            <el-form ref="refsearchForm" :inline="true" class="demo-searchForm ml-2">
                <el-form-item label-width="0px" label="" prop="level" label-position="left">
                    <el-select v-model="searchForm.healthCfgId" class="widthPx-150" placeholder="Health Config Name">
                        <el-option v-for="item in healthCfgOptions" :key="item.value" :label="item.display"
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
            <el-table-column type="expand">
                <template #default="props">
                    <div class="detail-container rowBC">
                        <div class="expand-container-item">
                            <h3>Rule Evaluation Score Detail:</h3>
                            <p v-for="item in formatRuleScoreDetail(props.row)">{{ item.description }}</p>
                        </div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="cfgName" label="Health Config Name" min-width="200" />
            <el-table-column align="center" prop="periodStartTimeStr" label="Time" width="160" />
            <el-table-column align="center" prop="score" label="Score" width="120">
                <template #default="{ row }">
                    <div :class="getScoreCellClassName(row.score)"> {{ row.score }}</div>
                </template>
            </el-table-column>
            <el-table-column align="center" label="Rule Score" min-width="350">
                <template #default="{ row }">
                    <div v-for="item in formatRuleScore(row.ruleScores)" :key="item.id">
                        {{ item.description }}
                    </div>
                </template>
            </el-table-column>
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
    name: 'HealthDegree'
}
</script>
<script setup>
import commonUtil from '@/utils/commonUtil'
/*1.初始化引入和实例化*/
import settings from '@/settings'

/*2.表格操作和查询*/
let mainTableData = ref([])
let searchForm = reactive({
    healthCfgId: null,
    startTime: '',
    endTime: ''
})

let healthCfgOptions = ref([])

let getScoreCellClassName = (score) => {
    if (score >= 100) {
        return "score-cell-100"
    }
    else if (score >= 95) {
        return "score-cell-95"
    }
    else if (score >= 90) {
        return "score-cell-90"
    }
    else if (score >= 80) {
        return "score-cell-80"
    }
    else if (score >= 60) {
        return "score-cell-60"
    }
    else if (score < 60) {
        return "score-cell-50"
    }
    return null
}

let formatRuleScore = (ruleScores) => {
    if (!ruleScores) {
        return []
    }
    return ruleScores
        .filter(ruleScore => ruleScore.score > 0)
        .map(ruleScore => {
            let ruleName = ruleCfgById[ruleScore.ruleId].name
            return { id: ruleScore.ruleId, description: ruleName + ' , score ' + ruleScore.score }
        });
}

let formatRuleScoreDetail = (healthDegree) => {
    let healthCfg = healthCfgById[healthDegree.cfgId]
    if (!healthCfg || !healthCfg.rules) {
        return formatRuleScore(healthDegree.ruleScores)
    }

    let ruleScores = healthDegree.ruleScores ? healthDegree.ruleScores : []
    let ruleScoreDetails = healthCfg.rules.map(ruleCfg => {
        let ruleScore = ruleScores.filter(item => item.ruleId === ruleCfg.id)[0]
        let description = ''
        if (ruleScore) {
            description = ruleCfg.name + ' , score ' + ruleScore.score + ' , detail ' + ruleScore.description
        } else {
            description = ruleCfg.name + ' , score 0'
        }
        return { id: ruleCfg.id, description: description }
    })
    return ruleScoreDetails
}

onMounted(() => {
    queryHealthCfg(selectPageReq)
})

let total = ref(1)
let { startEndArr } = useCommon()
let healthCfgById = {}
let ruleCfgById = {}

let queryHealthCfg = (processFunc) => {
    let reqConfig = {
        url: '/api/mall3/cfg/health',
        method: 'get',
        data: { pageSize: 1000 },
        isParams: true
    }
    axiosReq(reqConfig).then((resData) => {
        let records = resData.data?.content;
        if (records) {
            let healthCfgItems = records.map(cfg => {
                healthCfgById[cfg.id] = cfg
                if (cfg.rules) {
                    cfg.rules.forEach(ruleCfg => ruleCfgById[ruleCfg.id] = ruleCfg)
                }
                return {
                    value: cfg.id,
                    display: cfg.name
                }
            })
            healthCfgOptions.value = [{ value: '', display: 'All' }].concat(healthCfgItems)
        }
        if (processFunc) {
            processFunc()
        }
    })
}
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
    })
    let reqConfig = {
        url: '/api/mall3/health',
        method: 'get',
        data: body,
        isParams: true
    }
    axiosReq(reqConfig).then((resData) => {
        let records = resData.data?.content;
        if (records != null) {
            for (const record of records) {
                if (record.periodStartTime) {
                    record['periodStartTimeStr'] = commonUtil.formatTimestamp(record.periodStartTime)
                }
                if (record.cfgId) {
                    record['cfgName'] = healthCfgById[record.cfgId]?.name
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

.score-cell-100 {
    background: #d1edc4;
}

.score-cell-95 {
    background: #faecd8;
}

.score-cell-90 {
    background: #f3d19e;
}

.score-cell-80 {
    background: #fcd3d3;
}

.score-cell-60 {
    background: #f89898;
}

.score-cell-50 {
    background: #F56C6C;
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
