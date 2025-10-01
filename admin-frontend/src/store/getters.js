const getters = {
  token: state => state.user.token,
  userInfo: state => state.user.userInfo,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  roles: state => state.user.roles,
  sidebar: state => state.app.sidebar,
  isCollapse: state => !state.app.sidebar.opened,
  device: state => state.app.device
}

export default getters