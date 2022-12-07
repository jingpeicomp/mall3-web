<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="50vw" :close-on-click-modal="false"
    :before-close="closeFormModal">
    <el-form ref="refForm" label-width="150px" :inline="false" :model="subForm" :rules="formRules" class="pr-5">
      <el-form-item label="Database" prop="database" :rules="formRules.isNotNull" label-position="left">
        <el-input v-model="subForm.database" min-width="300" placeholder="Database" :disabled="isEditDialog" />
      </el-form-item>
      <el-form-item label="Table Name" prop="name" :rules="formRules.isNotNull" label-position="left" min-width="150">
        <el-input v-model="subForm.name" min-width="300" placeholder="Table Name" :disabled="isEditDialog" />
      </el-form-item>
      <el-form-item label="Tag" prop="tags" :rules="formRules.isNotNull" label-position="left">
        <div>
          <el-table :data="subForm.tags" :border="false">
            <el-table-column label="Tag Name" prop="name" min-width="200">
              <template #default="{ row }">
                <el-input v-model="row.name" />
              </template>
            </el-table-column>
            <el-table-column label="Tag Value Type" prop="valueType" min-width="150">
              <template #default="{ row }">
                <el-select v-model="row.valueType" placeholder="Tag Value Type">
                  <el-option v-for="item in valueTypeOptions" :key="item.value" :label="item.display"
                    :value="item.value" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="Operations" width="120">
              <template #header>
                <el-button link type="primary" size="small" @click.prevent="() => addColumn('tag')">
                  <el-icon style="vertical-align: middle">
                    <FolderAdd />
                  </el-icon>
                  <span style="vertical-align: middle">Add</span>
                </el-button>
              </template>
              <template #default="scope">
                <el-button link type="primary" size="small" @click.prevent="() => deleteColumn(scope.$index, 'tag')">
                  Remove
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form-item>

      <el-form-item label="Field" prop="fields" :rules="formRules.isNotNull" label-position="left">
        <div>
          <el-table :data="subForm.fields" :border="false">
            <el-table-column label="Field Name" prop="name" min-width="200">
              <template #default="{ row }">
                <el-input v-model="row.name" />
              </template>
            </el-table-column>
            <el-table-column label="Field Value Type" prop="valueType" min-width="150">
              <template #default="{ row }">
                <el-select v-model="row.valueType" placeholder="Field Value Type">
                  <el-option v-for="item in valueTypeOptions" :key="item.value" :label="item.display"
                    :value="item.value" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="Operations" width="120">
              <template #header>
                <el-button link type="primary" size="small" @click.prevent="() => addColumn('field')">
                  <el-icon style="vertical-align: middle">
                    <FolderAdd />
                  </el-icon>
                  <span style="vertical-align: middle">Add</span>
                </el-button>
              </template>
              <template #default="scope">
                <el-button link type="primary" size="small" @click.prevent="() => deleteColumn(scope.$index, 'field')">
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

let subForm = reactive({
  id: '',
  database: '',
  name: '',
  tags: [],
  fields: []
})
const refForm = ref(null)

//删除列
let deleteColumn = (index, type) => {
  if (type === 'tag') {
    let tags = JSON.parse(JSON.stringify(subForm.tags))
    tags.splice(index, 1)
    subForm.tags = tags
  }
  else if (type == 'field') {
    let fields = JSON.parse(JSON.stringify(subForm.fields))
    fields.splice(index, 1)
    subForm.fields = fields
  }
}
//添加列
let addColumn = (type) => {
  if (type === 'tag') {
    let tags = JSON.parse(JSON.stringify(subForm.tags))
    if (tags == null) {
      tags = []
    }
    tags.push({})
    subForm.tags = tags
  } else if (type === 'field') {
    let fields = JSON.parse(JSON.stringify(subForm.fields))
    if (fields == null) {
      fields = []
    }
    fields.push({})
    subForm.fields = fields
  }
}

//判断路由目的地是否合法
let validateColumn = () => {
  for (const column of subForm.tags) {
    if (!column.valueType || !column.name) {
      elMessage('Tag is invalid', 'error')
      return false;
    }
  }

  for (const column of subForm.fields) {
    if (!column.valueType || !column.name) {
      elMessage('Field is invalid', 'error')
      return false;
    }
  }

  return true;
}

let confirmBtnClick = () => {
  refForm.value.validate((valid) => {
    if (valid) {
      if (!validateColumn()) {
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
    url: '/api/mall3/cfg/table',
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
    url: `/api/mall3/cfg/table/${data.id}`,
    data: data,
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
    dialogTitle.value = `Edit Table Meta [${detailData.id}]`
    dialogVisible.value = true
    isEditDialog.value = true
    reshowData(detailData)
  } else {
    dialogTitle.value = 'Add Table Meta'
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
