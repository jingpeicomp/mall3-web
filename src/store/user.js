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
      roles: []
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
    // get user info
    getInfo() {
      return new Promise((resolve, reject) => {
        getInfoReq()
          .then((response) => {
            const { data } = response
            if (!data || !data.roles) {
              return reject('Verification failed, please Login again.')
            }

            localStorage.setItem('roles', JSON.stringify(data.roles))
            const { roles, name } = data
            this.M_username(name)
            this.M_roles(roles)
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
