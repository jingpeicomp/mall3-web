import { loginReq, getInfoReq } from '@/api/user'
import { setToken, removeToken } from '@/utils/auth'
import router, { asyncRoutes } from '@/router'
import { defineStore } from 'pinia'
import { usePermissionStore } from '@/store/permission'
import { useTagsViewStore } from '@/store/tagsView'

const resetRouter = () => {
  const asyncRouterNameArr = asyncRoutes.map((mItem) => mItem.name)
  asyncRouterNameArr.forEach((name) => {
    if (router.hasRoute(name)) {
      router.removeRoute(name)
    }
  })
}

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      username: '',
      avatar: '',
      brand: '',
      brandIcon: '',
      pubWeb3Addr: ''
    }
  },

  actions: {
    M_username(username) {
      this.$patch((state) => {
        state.username = username
      })
    },
    M_roles(roles) {
      this.$patch((state) => {
        state.roles = roles
      })
    },
    M_userInfo(userInfo) {
      this.$patch((state) => {
        state.brand = userInfo.brand
        state.brandIcon = userInfo.brandIcon
        state.pubWeb3Addr = userInfo.pubWeb3Addr
      })
    },

    login(data) {
      return new Promise((resolve, reject) => {
        loginReq(data)
          .then((res) => {
            if (res.code === 'E000000') {
              //commit('SET_Token', res.data?.jwtToken)
              setToken(res.data?.token)
              resolve(null)
            } else {
              reject(res)
            }
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    set(res) {
      return new Promise((resolve, reject) => {
        setToken(res?.token)
        resolve(null)
      })
    },
    // get user info
    getInfo() {
      return new Promise((resolve, reject) => {
        getInfoReq()
          .then((response) => {
            const { data } = response
            if (!data) {
              return reject('Verification failed, please Login again.')
            }

            const roles = ['admin']
            localStorage.setItem('roles', JSON.stringify(roles))
            const { name, pubWeb3Addr } = data
            this.M_username(name || pubWeb3Addr)
            this.M_roles(roles)
            this.M_userInfo(data)
            resolve(data)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    // user logout
    logout() {
      return new Promise((resolve, reject) => {
        this.resetState()
        resolve(null)
      })
    },
    resetState() {
      return new Promise((resolve) => {
        this.M_username('')
        this.M_roles([])
        removeToken() // must remove  token  first
        resetRouter() // reset the router
        const permissionStore = usePermissionStore()
        permissionStore.M_isGetUserInfo(false)
        const tagsViewStore = useTagsViewStore()
        tagsViewStore.delAllViews()
        resolve(null)
      })
    }
  }
})
