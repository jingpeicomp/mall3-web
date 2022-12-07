<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="50vw" :close-on-click-modal="false"
    :before-close="closeFormModal">
    <el-form ref="refForm" label-width="150px" :inline="false" :model="subForm" :rules="formRules" class="pr-5">
      <el-form-item label="Source Type" prop="sourceType" :rules="formRules.isNotNull" label-position="left">
        <el-select v-model="subForm.sourceType" min-width="300" placeholder="Source Type" :disabled="isEditDialog">
          <el-option v-for="item in typeOptions" :key="item.value" :label="item.display" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="Source Database" prop="sourceDatabase" :rules="formRules.isNotNull" label-position="left">
        <el-input v-model="subForm.sourceDatabase" min-width="300" placeholder="Source Database"
          :disabled="isEditDialog" />
      </el-form-item>
      <el-form-item label="Source Tables" prop="sourceTables" :rules="formRules.isNotNull" label-position="left"
        min-width="150">
        <el-input v-model="subForm.sourceTables" min-width="300"
          placeholder="* means all tables and , is used to split more tables" />
      </el-form-item>
      <el-form-item label="Destinamtion" prop="destinations" :rules="formRules.isNotNull" label-position="left">
        <div>
          <el-table :data="subForm.destinations" :border="false">
            <el-table-column label="Destination Type" prop="type" min-width="150">
              <template #default="{ row }">
                <el-select v-model="row.type" placeholder="Source Type" @change="destinationSourceTypeChange(row)">
                  <el-option v-for="item in typeOptions" :key="item.value" :label="item.display" :value="item.value" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="Server Name" prop="name" min-width="150">
              <template #default="{ row }">
                <el-select v-model="row.name" placeholder="Server Name">
                  <el-option v-for="item in row.nameOptions" :key="item.value" :label="item.display"
                    :value="item.value" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="Database" prop="database" min-width="120">
              <template #default="{ row }">
                <el-input v-model="row.database" />
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="Operations" width="120">
              <template #header>
                <el-button link type="primary" size="small" @click.prevent="addDestinationRow()">
                  <el-icon style="vertical-align: middle">
                    <FolderAdd />
                  </el-icon>
                  <span style="vertical-align: middle">Add</span>
                </el-button>
              </template>
              <template #default="scope">
                <el-button link type="primary" size="small" @click.prevent="deleteDestinationRow(scope.$index)">
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
import { watch } from 'vue';
/*1.初始化引入和实例化*/
const emit = defineEmits(['selectPageReq', 'hideComp'])
/*2.modal新增和修改*/
//新增
let typeOptions = [
  {
    value: 1,
    display: 'InfluxDB',
  },
  {
    value: 2,
    display: 'TDEngine',
  }
]

let subForm = reactive({
  id: '',
  sourceType: 1,
  sourceDatabase: '',
  sourceTables: '*',
  destinations: []
})
const refForm = ref(null)

//删除路由转发目的地
let deleteDestinationRow = (index) => {
  let destinations = JSON.parse(JSON.stringify(subForm.destinations))
  destinations.splice(index, 1)
  subForm.destinations = destinations
}
//添加路由转发目的地
let addDestinationRow = () => {
  let destinations = JSON.parse(JSON.stringify(subForm.destinations))
  if (destinations == null) {
    destinations = []
  }
  destinations.push({})
  subForm.destinations = destinations
}

//判断路由目的地是否合法
let validateDestination = () => {
  for (const destination of subForm.destinations) {
    if (!destination.type || !destination.name || !destination.database) {
      elMessage('Route destination is invalid', 'error')
      return false;
    }
  }

  return true;
}

let confirmBtnClick = () => {
  refForm.value.validate((valid) => {
    if (valid) {
      if (!validateDestination()) {
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

//tdengine name
let tdengineNameOptions = []
const queryTdengineNames = (callback) => {
  axiosReq({
    url: '/api/mall3/cfg/table/tdengine',
    method: 'get',
    bfLoading: true
  }).then((resData) => {
    let options = []
    if (resData.data) {
      for (const name of resData.data) {
        options.push({ value: name, display: name })
      }
    }
    tdengineNameOptions = options
  }).then(() => {
    if (callback) {
      callback()
    }
  })
}
//influx name
let influxNameOptions = []
const queryInfluxNames = (callback) => {
  axiosReq({
    url: '/api/mall3/cfg/table/influx',
    method: 'get',
    bfLoading: true
  })
    .then((resData) => {
      let options = []
      if (resData.data) {
        for (const name of resData.data) {
          options.push({ value: name, display: name })
        }
      }
      influxNameOptions = options
    })
    .then(() => {
      if (callback) {
        callback()
      }
    })
}

let destinationSourceTypeChange = (row) => {
  if (row.type === 1) {
    row.nameOptions = influxNameOptions
  } else {
    row.nameOptions = tdengineNameOptions
  }
}

let initDestinationServerName = () => {
  subForm.destinations.forEach(destination => {
    destinationSourceTypeChange(destination)
  })
}


const insertReq = () => {
  const data = JSON.parse(JSON.stringify(subForm))
  data.sourceTables = data.sourceTables.split(',')
  delete data.id
  if (data.destinations) {
    data.destinations.forEach(destination => {
      delete destination.nameOptions
    })
  }
  axiosReq({
    url: '/api/mall3/cfg/route',
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
  data.sourceTables = data.sourceTables.split(',')
  if (data.destinations) {
    data.destinations.forEach(destination => {
      delete destination.nameOptions
    })
  }
  return axiosReq({
    url: '/api/mall3/cfg/route',
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
    dialogTitle.value = `Edit Route [${detailData.id}]`
    dialogVisible.value = true
    isEditDialog.value = true
    reshowData(detailData)
  } else {
    dialogTitle.value = 'Add Route'
    dialogVisible.value = true
    isEditDialog.value = false
  }

  queryInfluxNames(() => queryTdengineNames(initDestinationServerName))
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
