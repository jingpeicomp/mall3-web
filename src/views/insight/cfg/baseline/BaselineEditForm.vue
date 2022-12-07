<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px" :close-on-click-modal="false"
    :before-close="closeFormModal">
    <el-form ref="refForm" label-width="150px" :inline="false" :model="subForm" :rules="formRules" class="pr-5">
      <el-form-item label="Name" prop="name" :rules="formRules.isNotNull" label-position="left">
        <el-input v-model="subForm.name" min-width="300" placeholder="Name" :disabled="isEditDialog" />
      </el-form-item>
      <el-form-item label="Period Type" prop="periodType" :rules="formRules.isNotNull" label-position="left">
        <el-select v-model="subForm.periodType" min-width="300" placeholder="Period Type">
          <el-option v-for="item in periodTypeOptions" :key="item.value" :label="item.display" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="Period Number" prop="periodNum" :rules="formRules.isNotNull" label-position="left">
        <el-input v-model="subForm.periodNum" min-width="300" placeholder="Period Number" />
      </el-form-item>
      <el-form-item label="Weighting Method" prop="weightingMethod" :rules="formRules.isNotNull" label-position="left">
        <el-select v-model="subForm.weightingMethod" min-width="300" placeholder="Weighting Method">
          <el-option v-for="item in weightingMethodOptions" :key="item.value" :label="item.display"
            :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="Source Database" prop="sourceDatabase" :rules="formRules.isNotNull" label-position="left">
        <el-input v-model="subForm.sourceDatabase" min-width="300" placeholder="Source Database"
          :disabled="isEditDialog" />
      </el-form-item>
      <el-form-item label="Source Table" prop="sourceTable" :rules="formRules.isNotNull" label-position="left">
        <el-input v-model="subForm.sourceTable" min-width="300" placeholder="Source Table" :disabled="isEditDialog" />
      </el-form-item>
      <el-form-item label="Destination Database" prop="destDatabase" :rules="formRules.isNotNull" label-position="left">
        <el-input v-model="subForm.destDatabase" min-width="300" placeholder="Destination Database" />
      </el-form-item>
      <el-form-item label="Destination Table" prop="destTable" :rules="formRules.isNotNull" label-position="left">
        <el-input v-model="subForm.destTable" min-width="300" placeholder="Destination Table" />
      </el-form-item>
      <el-form-item label="Aggregate Interval(s)" prop="aggregateIntervalSeconds" :rules="formRules.isNotNull"
        label-position="left">
        <el-input v-model="subForm.aggregateIntervalSeconds" min-width="300" placeholder="Aggregate Interval(s)" />
      </el-form-item>
      <el-form-item label="Filter Sql" prop="filterSqlSegment" label-position="left">
        <el-input v-model="subForm.filterSqlSegment" min-width="300" placeholder="Filter Sql" :rows="3"
          type="textarea" />
      </el-form-item>

      <el-form-item label="Aggregate Field" prop="fields" :rules="formRules.isNotNull" label-position="left">
        <div>
          <el-table :data="subForm.fields" :border="false">
            <el-table-column label="Original Name" prop="originalName" width="140">
              <template #default="{ row }">
                <el-input v-model="row.originalName" />
              </template>
            </el-table-column>
            <el-table-column label="After Name" prop="afterName" width="140">
              <template #default="{ row }">
                <el-input v-model="row.afterName" />
              </template>
            </el-table-column>
            <el-table-column label="Function" prop="function" width="90">
              <template #default="{ row }">
                <el-select v-model="row.function" placeholder="Source Type">
                  <el-option v-for="item in functionOptions" :key="item.value" :label="item.display"
                    :value="item.value" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="Expression" prop="expression" min-width="120">
              <template #default="{ row }">
                <el-input v-model="row.expression" />
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="Operations" width="100">
              <template #header>
                <el-button link type="primary" size="small" @click.prevent="addField()">
                  <el-icon style="vertical-align: middle">
                    <FolderAdd />
                  </el-icon>
                  <span style="vertical-align: middle">Add</span>
                </el-button>
              </template>
              <template #default="scope">
                <el-button link type="primary" size="small" @click.prevent="deleteField(scope.$index)">
                  Remove
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeFormModal">Cancel</el-button>
        <el-button type="primary" @click="confirmBtnClick">Submit</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { FolderAdd } from '@element-plus/icons-vue'
/*1.初始化引入和实例化*/
const emit = defineEmits(['selectPageReq', 'hideComp'])
/*2.modal新增和修改*/
//新增
let periodTypeOptions = [
  {
    value: 1,
    display: 'Week',
  },
  {
    value: 2,
    display: 'Day',
  }
]
let weightingMethodOptions = [
  {
    value: 1,
    display: 'Average',
  },
  {
    value: 2,
    display: 'Weighting Average',
  }
]
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

let subForm = reactive({
  id: null,
  name: '',
  periodType: 1,
  periodNum: 4,
  weightingMethod: 2,
  sourceDatabase: '',
  sourceTable: '',
  destDatabase: '',
  destTable: '',
  filterSqlSegment: '',
  aggregateIntervalSeconds: 60,
  fields: []
})
const refForm = ref(null)

//删除路由转发目的地
let deleteField = (index) => {
  let fields = JSON.parse(JSON.stringify(subForm.fields))
  fields.splice(index, 1)
  subForm.fields = fields
}
//添加字段
let addField = () => {
  let fields = JSON.parse(JSON.stringify(subForm.fields))
  if (fields === null) {
    fields = []
  }
  fields.push({})
  subForm.fields = fields
}

//判断聚合字段是否合法
let validateField = () => {
  for (const field of subForm.fields) {
    let isValid = true
    if (!field.originalName) {
      isValid = field.expression && field.afterName
    }
    else {
      if (field.expression) {
        isValid = true;
      } else {
        isValid = field.function
      }
    }

    if (!isValid) {
      elMessage('Aggregate field config is invalid', 'error')
      return false;
    }
  }

  return true;
}

let confirmBtnClick = () => {
  refForm.value.validate((valid) => {
    if (valid) {
      if (!validateField()) {
        return false
      }
      if (subForm.id) {
        updateReq()
      } else {
        insertReq()
      }
    } else {
      return false
    }
  })
}
const { formRules, elMessage } = useElement()

const insertReq = () => {
  const data = JSON.parse(JSON.stringify(subForm))
  delete data.id
  axiosReq({
    url: '/api/mall3/cfg/baseline',
    data: data,
    method: 'post', //--c
    bfLoading: true
  }).then(() => {
    elMessage('Add successfully')
    emit('selectPageReq')
    emit('hideComp')
  })
}
//修改
const reshowData = (row) => {
  Object.keys(row).forEach((fItem) => {
    Object.keys(subForm).forEach((sItem) => {
      if (fItem === sItem) {
        subForm[sItem] = row[sItem]
      }
    })
  })
}
let updateReq = () => {
  const data = JSON.parse(JSON.stringify(subForm))
  return axiosReq({
    url: `/api/mall3/cfg/baseline/${data.id}`,
    data,
    method: 'put',
    bfLoading: true
  }).then(() => {
    elMessage('Update successfully')
    emit('selectPageReq')
    emit('hideComp')
  })
}

/*3.弹框相关*/
//显示弹框
const { dialogTitle, dialogVisible } = useCommon()
const isEditDialog = ref(false);
let showModal = (isEdit, detailData) => {
  if (isEdit) {
    dialogTitle.value = `Edit Baseline [${detailData.id}]`
    dialogVisible.value = true
    isEditDialog.value = true
    reshowData(detailData)
  } else {
    dialogTitle.value = 'Add Baseline'
    dialogVisible.value = true
    isEditDialog.value = false
  }
}
//关闭弹框
let closeFormModal = () => {
  emit('hideComp')
}

//导出给refs使用
defineExpose({
  showModal
})

//导出属性到页面中使用
// let {levelList} = toRefs(state);
</script>

<style scoped lang="scss">
</style>
