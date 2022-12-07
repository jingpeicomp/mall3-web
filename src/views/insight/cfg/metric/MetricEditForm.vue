<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="50vw" :close-on-click-modal="false"
    :before-close="closeFormModal">
    <el-form ref="refForm" label-width="150px" :inline="false" :model="subForm" :rules="formRules" class="pr-5">
      <el-form-item label="Name" prop="name" :rules="formRules.isNotNull" label-position="left">
        <el-input v-model="subForm.name" min-width="300" placeholder="Name" :disabled="isEditDialog" />
      </el-form-item>
      <el-form-item label="Database" prop="database" :rules="formRules.isNotNull" label-position="left">
        <el-input v-model="subForm.database" min-width="300" placeholder="Database" />
      </el-form-item>
      <el-form-item label="Table" prop="table" :rules="formRules.isNotNull" label-position="left" min-width="150">
        <el-input v-model="subForm.table" min-width="300" placeholder="Table" />
      </el-form-item>

      <el-form-item label="Filter Sql" prop="filterSqlSegment" label-position="left" min-width="150">
        <el-input v-model="subForm.filterSqlSegment" min-width="300" placeholder="Filter Sql" :rows="2"
          type="textarea" />
      </el-form-item>

      <el-form-item label="Field" prop="field" label-position="left" min-width="150">
        <el-input v-model="subForm.field" min-width="300" placeholder="Field" />
      </el-form-item>

      <el-form-item label="Function" prop="function" label-position="left">
        <el-select v-model="subForm.function" min-width="300" placeholder="Function">
          <el-option v-for="item in functionOptions" :key="item.value" :label="item.display" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="Field Expression" prop="fieldExpression" label-position="left" min-width="150">
        <el-input v-model="subForm.fieldExpression" min-width="300" placeholder="Field Expression" />
      </el-form-item>

      <el-form-item label="Interval(s)" prop="aggregateIntervalSeconds" :rules="formRules.isNotNull"
        label-position="left" min-width="150">
        <el-input v-model="subForm.aggregateIntervalSeconds" min-width="300" placeholder="Aggregate time interval" />
      </el-form-item>

      <el-form-item label="Expamle Sql" prop="exampleSql" label-position="left" min-width="150">
        <el-input v-model="subForm.exampleSql" min-width="300" placeholder="Example sql" :rows="3" type="textarea"
          readonly />
      </el-form-item>

    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeFormModal">Cancel</el-button>
        <el-button @click="analyseSql">Analysed Sql</el-button>
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
  id: '',
  name: '',
  database: '',
  table: '',
  filterSqlSegment: '',
  field: '',
  function: null,
  fieldExpression: '',
  aggregateIntervalSeconds: 60,
  exampleSql: ''
})
const refForm = ref(null)

//判断字段配置是否合法
let validateFiled = () => {
  if (!((subForm.field && subForm.function) || subForm.fieldExpression)) {
    elMessage('Field config is invalid, field or function or filed expression cannot be all null', 'error')
    return false;
  }

  return true;
}

let confirmBtnClick = () => {
  refForm.value.validate((valid) => {
    if (valid) {
      if (!validateFiled()) {
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

let analyseSql = () => {
  refForm.value.validate((valid) => {
    if (valid) {
      if (!validateFiled()) {
        return false
      }
      return axiosReq({
        url: `/api/mall3/cfg/metric/sql`,
        data: subForm,
        method: 'post',
        bfLoading: true
      }).then((resData) => {
        elMessage('Analyse sql successfully')
        if (resData.data) {
          subForm.exampleSql = resData.data
        }
      })
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
    url: '/api/mall3/cfg/metric',
    data,
    method: 'post',
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
  return axiosReq({
    url: `/api/mall3/cfg/metric/${subForm.id}`,
    data: subForm,
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
    dialogTitle.value = `Edit Metric [${detailData.id}]`
    dialogVisible.value = true
    isEditDialog.value = true
    reshowData(detailData)
  } else {
    dialogTitle.value = 'Add Metric'
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
