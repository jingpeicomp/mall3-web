import request from '@/utils/axiosReq'

export function loginReq(data) {
  return request({
    url: '/api/mall3/auth/login/pwd',
    data,
    method: 'post',
    bfLoading: false,
    isAlertErrorMsg: false
  })
}

export function getInfoReq() {
  return request({
    url: '/api/mall3/auth/me',
    bfLoading: false,
    method: 'get',
    isAlertErrorMsg: false
  })
}
