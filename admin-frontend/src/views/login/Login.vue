<template>
  <div class="login-page">
    <div class="login-card">
      <div class="left-panel">
        <div class="brand-title"><i class="el-icon-reading"></i><span>新文枢教育 · 管理平台</span></div>
        <div class="slogan">连接教务、教师、学生的高效协同平台</div>
        <ul class="features">
          <li><i class="el-icon-s-management"></i> 教务流程一体化</li>
          <li><i class="el-icon-s-check"></i> 课程与排课智能化</li>
          <li><i class="el-icon-s-data"></i> 财务结算可视化</li>
        </ul>
        <div class="brand-footer">© 2025 XinWenshu Education</div>
      </div>
      <div class="right-panel">
        <div class="form-header">
          <div class="title">欢迎登录</div>
          <div class="subtitle">请使用管理员账号登录</div>
        </div>
        <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" @keyup.enter.native="handleLogin">
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" placeholder="用户名 / 手机号" name="username" type="text" tabindex="1" autocomplete="on" prefix-icon="el-icon-user" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input ref="passwordInput" v-model="loginForm.password" :type="passwordType" placeholder="请输入密码" name="password" tabindex="2" autocomplete="on" prefix-icon="el-icon-lock" @keyup.enter.native="handleLogin">
              <i slot="suffix" :class="passwordType === 'password' ? 'el-icon-view' : 'el-icon-hide'" class="show-pwd" @click="showPwd" />
            </el-input>
          </el-form-item>
          <div class="form-extras">
            <el-checkbox v-model="loginForm.remember">记住账号</el-checkbox>
          </div>
          <el-button :loading="loading" type="primary" class="login-btn" @click.native.prevent="handleLogin">登录</el-button>
          <div class="tips"><span>默认账号密码：</span><span>admin / admin123</span></div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        username: 'admin',
        password: 'admin123',
        remember: true
      },
      loginRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度至少6位', trigger: 'blur' }
        ]
      },
      passwordType: 'password',
      loading: false,
      redirect: undefined,
      otherQuery: {}
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  created(){
    try{ const u = localStorage.getItem('admin_last_username'); if (u) this.loginForm.username = u }catch(e){}
  },
  methods: {
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = 'text'
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => { this.$refs.passwordInput && this.$refs.passwordInput.focus() })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/login', this.loginForm)
            .then(() => {
              try { if (this.loginForm.remember) localStorage.setItem('admin_last_username', this.loginForm.username) } catch(e) {}
              this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
              this.loading = false
            })
            .catch(() => { this.loading = false })
        } else {
          return false
        }
      })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') { acc[cur] = query[cur] }
        return acc
      }, {})
    }
  }
}
</script>

<style lang="scss" scoped>
.login-page { min-height:100vh; width:100%; background: radial-gradient(1200px 600px at 80% -20%, #e8f7ff 10%, transparent 60%), radial-gradient(900px 500px at -10% 110%, #eef7ff 10%, transparent 60%), linear-gradient(135deg, #f6f9ff 0%, #f0f7ff 100%); display:flex; align-items:center; justify-content:center; padding:24px }
.login-card { display:grid; grid-template-columns:1.1fr 1fr; width:1024px; max-width:100%; background:#fff; border-radius:16px; box-shadow:0 20px 60px rgba(27,55,112,.12); overflow:hidden }
.left-panel { background:linear-gradient(135deg,#4CAF50 0%, #6fd17f 100%); color:#fff; padding:48px 40px; display:flex; flex-direction:column; justify-content:center }
.brand-title{ font-size:22px; font-weight:700; display:flex; align-items:center; gap:10px }
.slogan{ margin-top:14px; opacity:.92 }
.features{ margin-top:24px; line-height:2; opacity:.95; list-style:none; padding:0 }
.features li i{ margin-right:6px }
.brand-footer{ margin-top:36px; opacity:.75; font-size:12px }
.right-panel{ padding:48px 40px; display:flex; flex-direction:column; justify-content:center }
.form-header{ margin-bottom:18px }
.form-header .title{ font-size:22px; font-weight:700; color:#1f2d3d }
.form-header .subtitle{ color:#6b7785; margin-top:6px }
.login-form{ width:100% }
.login-btn{ width:100%; margin:6px 0 12px }
.form-extras{ display:flex; justify-content:space-between; align-items:center; margin:-4px 0 10px; color:#6b7785 }
.form-extras .link{ color:#4CAF50; cursor:pointer }
.tips{ text-align:center; color:#9aa1a9; font-size:12px }
::v-deep .el-input__inner{ height:44px }
::v-deep .el-form-item{ margin-bottom:16px }
@media (max-width:900px){ .login-card{ grid-template-columns:1fr } .left-panel{ display:none } }
</style>