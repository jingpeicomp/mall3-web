<template>
    <div class="scroll-y" width="50vw">
        <el-form label-width="200px" :inline="false" :model="userInfo" class="pr-5">
            <el-form-item label="用户名" prop="name" label-position="left">
                <el-input v-model="userInfo.name" readonly />
            </el-form-item>
            <el-form-item label="品牌" prop="brand" label-position="left">
                <el-input v-model="userInfo.brand" readonly />
            </el-form-item>
            <el-form-item label="品牌图标" prop="brandIcon" label-position="left">
                <el-image style="width: 100px; height: 100px" :src="userInfo.brandIcon" fit="fill">
                    <template #error>
                        <div class="image-slot">
                            <el-icon><icon-picture /></el-icon>
                        </div>
                    </template>
                </el-image>
            </el-form-item>
            <el-form-item label="Web3钱包地址" prop="pubWeb3Addr" label-position="left">
                <el-input v-model="userInfo.pubWeb3Addr" readonly />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="editBtnClick">修改用户信息</el-button>
                <el-button type="warning" @click="bindWeb3BtnClick">绑定Web3钱包</el-button>
            </el-form-item>
        </el-form>
        <UserInfoEditForm v-if="showEditForm" ref="refEditForm" @hideComp="hideEditComp" @selectPageReq="getUserInfo" />
    </div>
</template>
<script>
export default {
    name: 'UserMng'
}
</script>
<script setup>
import web3Util from '@/utils/web3Util'
import { useUserStore } from '@/store/user'
/*1.初始化引入和实例化*/
import UserInfoEditForm from './UserInfoEditForm.vue'
const { elMessage } = useElement()

/*2. 用户信息查询*/
let userInfo = reactive({
    name: '',
    brand: '',
    brandIcon: '',
    pubWeb3Addr: ''
})
onMounted(() => {
    getUserInfo()
})

let getUserInfo = () => {
    axiosReq({
        url: '/api/mall3/auth/me',
        method: 'get',
    }).then((resData) => {
        Object.keys(resData.data).forEach((fItem) => {
            Object.keys(userInfo).forEach((sItem) => {
                if (fItem === sItem) {
                    userInfo[sItem] = resData.data[sItem]
                }
            })
        })
    })
}


//编辑个人信息
let showEditForm = ref(false)
const refEditForm = ref(null)
const hideEditComp = () => {
    showEditForm.value = false
}
let editBtnClick = () => {
    showEditForm.value = true
    nextTick(() => {
        refEditForm.value.showModal(userInfo)
    })
}

//绑定web3钱包
let bindWeb3BtnClick = () => {
    const userStore = useUserStore()

    if (userInfo.pubWeb3Addr) {
        elMessage('用户已经绑定Web3钱包, 不可以重复绑定', 'error')
        return
    }

    web3Util.getWeb3()
        .then(res => {
            let web3 = res
            web3.eth.getCoinbase().then((coinbase) => {
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
                        elMessage('无法生成随机字符串', 'error')
                        return;
                    }

                    web3.eth.personal.sign(nonce, publicAddress, '')
                        .then((signature) => {
                            reqConfig = {
                                url: '/api/mall3/user/set/web3',
                                method: 'put',
                                data: { pubAddress: publicAddress, signature: signature },
                            }
                            axiosReq(reqConfig)
                                .then((resData) => {
                                    // userStore.set(resData);
                                    getUserInfo();
                                }).catch((res) => {
                                    // elMessage(res.msg, 'error')
                                })
                        })
                });
            })
        })
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

.amount-balance {
    // background-color: #79bbff;
    color: #c45656;
    margin-right: 30px;
    margin-left: 10px;
    font-size: large;
    font-weight: 600;
}

.top-div {
    margin-bottom: 20px;
    margin-top: 10px;
}
</style>