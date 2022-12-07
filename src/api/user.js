import request from '@/utils/axiosReq'

export function loginReq(data) {
  return request({
    url: '/api/mall3/admin/login',
    data,
    method: 'post',
    bfLoading: false,
    isAlertErrorMsg: false
  })
}

export function getInfoReq() {
  return request({
    url: '/api/mall3/admin/user/me',
    bfLoading: false,
    method: 'get',
    isAlertErrorMsg: false
  })
}
