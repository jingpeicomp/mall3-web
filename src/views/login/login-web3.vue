<template>
  <div class="login-container columnCC">
    <img src="@/assets/layout/mall3.svg" alt="Mall3" />
    <el-form ref="refloginForm" class="login-form" :model="formInline" :rules="formRules">
      <div class="title-container">
        <h3 class="title text-center">{{ settings.title }}</h3>
      </div>
      <el-divider content-position="center" border-style="dashed" class="divider">用户名登录</el-divider>
      <el-form-item prop="username" :rules="formRules.isNotNull">
        <div class="rowSC">
          <span class="svg-container">
            <svg-icon icon-class="user" />
          </span>
          <el-input v-model="formInline.username" placeholder="Please input name" />
          <!--占位-->
          <div class="show-pwd" />
        </div>
      </el-form-item>
      <!--<el-form-item prop="password" :rules="formRules.passwordValid">-->
      <el-form-item prop="password" :rules="formRules.isNotNull">
        <div class="rowSC flex-1">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input :key="passwordType" ref="refPassword" v-model="formInline.password" :type="passwordType"
            name="password" placeholder="Please input password" @keyup.enter="handleLoginPwd" />
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </div>
      </el-form-item>
      <el-button :loading="pwdloading" type="primary" class="login-btn" size="default" @click.prevent="handleLoginPwd">
        登陆
      </el-button>
      <el-divider content-position="center" border-style="dashed" class="divider"
        style="font-size: 12px;">Web3钱包登录</el-divider>
      <el-button :loading="web3loading" type="success" class="login-btn" size="default"
        @click.prevent="handleLoginWeb3">
        MetaMask钱包登陆
      </el-button>
    </el-form>
  </div>
</template>

<script setup>
import settings from '@/settings'

import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import Web3 from 'web3'

let web3 = undefined;

//element valid
const formRules = useElement().formRules
//form
let formInline = reactive({
  username: '',
  password: '',
})
let state = reactive({
  otherQuery: {},
  redirect: undefined
})

/* listen router change  */
const route = useRoute()
let getOtherQuery = (query) => {
  return Object.keys(query).reduce((acc, cur) => {
    if (cur !== 'redirect') {
      acc[cur] = query[cur]
    }
    return acc
  }, {})
}

watch(
  () => route.query,
  (query) => {
    if (query) {
      state.redirect = query.redirect
      state.otherQuery = getOtherQuery(query)
    }
  },
  { immediate: true }
)

/*
 *  login relative
 * */
let pwdloading = ref(false)
let web3loading = ref(false)

const refloginForm = ref(null)
let handleLoginPwd = () => {
  refloginForm.value.validate((valid) => {
    if (valid) {
      loginReqByPwd()
    } else {
      return false
    }
  })
}

//use the auto import from vite.config.js of AutoImport
const router = useRouter()
let loginReqByPwd = () => {
  pwdloading.value = true
  const userStore = useUserStore()
  userStore
    .login(formInline)
    .then(() => {
      ElMessage({ message: 'Login successfully', type: 'success' })
      router.push({ path: state.redirect || '/', query: state.otherQuery })
    })
    .catch((res) => {
      ElMessage({
        message: res.msg,
        type: 'error',
        duration: 3 * 1000
      })
      useCommon()
        .sleep(30)
        .then(() => {
          pwdloading.value = false
        })
    })
}

let handleLoginWeb3 = async () => {
  await loginReqByWeb3()
  web3loading.value = false
}

let loginReqByWeb3 = async () => {
  const userStore = useUserStore()
  web3loading.value = true
  if (!window.ethereum) {
    ElMessage({
      message: '请先安装MetaMask钱包',
      type: 'error',
      duration: 5 * 1000
    })
    return;
  }

  if (!web3) {
    try {
      // Request account access if needed
      await window.ethereum.enable()

      // We don't know window.web3 version, so we use our own instance of Web3
      // with the injected provider given by MetaMask
      web3 = new Web3(window.ethereum);
    } catch (error) {
      ElMessage({
        message: 'You need to allow MetaMask.',
        type: 'error',
        duration: 5 * 1000
      })
      return;
    }
  }

  const coinbase = await web3.eth.getCoinbase();
  if (!coinbase) {
    ElMessage({
      message: 'Please activate MetaMask first.',
      type: 'error',
      duration: 5 * 1000
    })
    return;
  }

  const publicAddress = coinbase.toLowerCase()
  let reqConfig = {
    url: '/api/mall3/auth/nonce',
    method: 'get',
    data: { pubAddress: publicAddress },
    isParams: true
  }
  axiosReq(reqConfig).then((resData) => {
    let nonce = resData.data
    if (!nonce) {
      ElMessage({
        message: '无法生成随机字符串',
        type: 'error',
        duration: 5 * 1000
      })
      return;
    }

    web3.eth.personal.sign(nonce, publicAddress, '')
      .then((signature) => {
        reqConfig = {
          url: '/api/mall3/auth/login/web3',
          method: 'post',
          data: { pubAddress: publicAddress, signature: signature, nonce: nonce },
        }
        axiosReq(reqConfig)
          .then((resData) => {
            userStore.set(resData)
              .then(() => {
                try {
                  // ElMessage({ message: 'Login successfully', type: 'success' })
                  router.push({ path: state.redirect || '/', query: state.otherQuery })
                }
                catch (error) {
                  console.log('========>', error)
                }
              })
          }).catch((res) => {
            ElMessage({
              message: res.msg,
              type: 'error',
              duration: 3 * 1000
            })
            useCommon()
              .sleep(30)
              .then(() => {
                web3loading.value = false
              })
          })
      })
  })
}
/*
 *  password show or hidden
 * */
let passwordType = ref('password')
const refPassword = ref(null)
let showPwd = () => {
  if (passwordType.value === 'password') {
    passwordType.value = ''
  } else {
    passwordType.value = 'password'
  }
  nextTick(() => {
    refPassword.value.focus()
  })
}
</script>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  height: 100vh;
  width: 100%;
  background-color: #2d3a4b;

  .login-form {
    margin-bottom: 20vh;
    width: 360px;
  }

  .title-container {
    .title {
      font-size: 26px;
      color: #eee;
      margin: 0px auto 25px auto;
      text-align: center;
      font-weight: bold;
    }
  }
}

.svg-container {
  padding-left: 6px;
  color: $dark_gray;
  text-align: center;
  width: 30px;
}

//错误提示信息
.tip-message {
  color: #e4393c;
  height: 30px;
  margin-top: -12px;
  font-size: 12px;
}

//登录按钮
.login-btn {
  width: 100%;
  margin-top: 10px;
  margin-bottom: 20px;
}

.show-pwd {
  width: 50px;
  font-size: 16px;
  color: $dark_gray;
  cursor: pointer;
  text-align: center;
}

.divider {
  font-size: 12px;
  font-weight: 300;
  margin-bottom: 20px;
  margin-top: 20px;
}
</style>

<style lang="scss">
//css 样式重置 增加个前缀避免全局污染
.login-container {
  .el-input__wrapper {
    background-color: transparent;
    box-shadow: none;
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }

  .el-input input {
    background: transparent;
    border: 0px;
    -webkit-appearance: none;
    border-radius: 0px;
    padding: 10px 5px 10px 15px;
    color: #fff;
    height: 42px; //此处调整item的高度
    caret-color: #fff;
  }

  //hiden the input border
  .el-input__inner {
    box-shadow: none !important;
  }
}
</style>
