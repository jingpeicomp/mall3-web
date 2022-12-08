import { ElMessage } from 'element-plus'
import Web3 from 'web3'

export default {
  async getWeb3() {
    let web3 = undefined
    if (window.ethereum) {
      try {
        await window.ethereum.enable()
        web3 = new Web3(window.ethereum)
        return web3
      } catch (error) {
        ElMessage({
          message: 'You need to allow MetaMask.',
          type: 'error',
          duration: 5 * 1000
        })
        throw error
      }
    } else if (window.web3) {
      web3 = window.web3
      return web3
    } else {
      ElMessage({
        message: '请先安装MetaMask钱包',
        type: 'error',
        duration: 5 * 1000
      })
      throw Error('请先安装MetaMask钱包')
    }
  }
}
