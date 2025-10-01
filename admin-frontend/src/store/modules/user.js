import { login, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'

const state = {
  token: getToken(),
  userInfo: null,
  name: '',
  avatar: '',
  roles: []
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_USER_INFO: (state, userInfo) => {
    state.userInfo = userInfo
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  // 用户登录
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response
        if (data && data.token) {
          commit('SET_TOKEN', data.token)
          commit('SET_USER_INFO', data.user)
          commit('SET_NAME', data.user.realName || data.user.username)
          commit('SET_ROLES', [data.user.role])
          setToken(data.token)
          resolve(data)
        } else {
          reject(new Error('登录失败：未获取到token'))
        }
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 获取用户信息
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      if (state.userInfo) {
        resolve(state.userInfo)
        return
      }
      
      getInfo().then(response => {
        const { data } = response
        if (!data) {
          reject(new Error('获取用户信息失败'))
        }
        const { username, realName, role } = data
        commit('SET_USER_INFO', data)
        commit('SET_NAME', realName || username)
        commit('SET_ROLES', [role])
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 用户登出
  logout({ commit, dispatch }) {
    return new Promise((resolve) => {
      commit('SET_TOKEN', '')
      commit('SET_USER_INFO', null)
      commit('SET_NAME', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  },

  // 重置token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_USER_INFO', null)
      commit('SET_NAME', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}