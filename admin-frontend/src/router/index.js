import Vue from 'vue'
import VueRouter from 'vue-router'
import Layout from '@/views/layout/Layout.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面未找到' }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: { title: '仪表盘', icon: 'el-icon-data-analysis' }
      }
    ]
  },
  {
    path: '/hr',
    component: Layout,
    meta: { title: '人事行政', icon: 'el-icon-user' },
    children: [
      {
        path: 'teacher-list',
        name: 'TeacherList',
        component: () => import('@/views/hr/TeacherList.vue'),
        meta: { title: '教师管理', icon: 'el-icon-user-solid' }
      },
      {
        path: 'student-list',
        name: 'StudentList',
        component: () => import('@/views/hr/StudentList.vue'),
        meta: { title: '学生管理', icon: 'el-icon-user' }
      },
      {
        path: 'teacher-certification',
        name: 'TeacherCertification',
        component: () => import('@/views/hr/TeacherCertification.vue'),
        meta: { title: '教师认证', icon: 'el-icon-medal' }
      },
      {
        path: 'employment-application',
        name: 'EmploymentApplication',
        component: () => import('@/views/hr/EmploymentApplication.vue'),
        meta: { title: '应聘申请管理', icon: 'el-icon-suitcase' }
      },
      {
        path: 'post-publish',
        name: 'PostPublish',
        component: () => import('@/views/hr/PostPublish.vue'),
        meta: { title: '招聘发布管理', icon: 'el-icon-document' }
      },
      {
        path: 'research-post',
        name: 'ResearchPost',
        component: () => import('@/views/hr/ResearchPost.vue'),
        meta: { title: '教研活动管理', icon: 'el-icon-reading' }
      },
      {
        path: 'research-application',
        name: 'ResearchApplication',
        component: () => import('@/views/hr/ResearchApplication.vue'),
        meta: { title: '活动报名管理', icon: 'el-icon-document-checked' }
      },
      {
        path: 'big-class-publish',
        name: 'BigClassPublish',
        component: () => import('@/views/hr/BigClassPublish.vue'),
        meta: { title: '班课发布', icon: 'el-icon-s-release' }
      }
    ]
  },
  {
    path: '/spark-plan',
    component: Layout,
    meta: { title: '薪火计划', icon: 'el-icon-star-on' },
    children: [
      {
        path: 'course-feedback',
        name: 'CourseFeedback',
        component: () => import('@/views/spark-plan/CourseFeedback.vue'),
        meta: { title: '课程反馈', icon: 'el-icon-chat-dot-round' }
      },
      
    ]
  },
  
  {
    path: '/competition',
    component: Layout,
    meta: { title: '课程管理', icon: 'el-icon-trophy' },
    children: [
      {
        path: 'course-list',
        name: 'CourseList',
        component: () => import('@/views/competition/CourseList.vue'),
        meta: { title: '课程列表', icon: 'el-icon-document' }
      },
      {
        path: 'course-category',
        name: 'CourseCategory',
        component: () => import('@/views/competition/CourseCategory.vue'),
        meta: { title: '课程分类', icon: 'el-icon-menu' }
      },
      {
        path: 'lesson-price',
        name: 'LessonPrice',
        component: () => import('@/views/competition/LessonPrice.vue'),
        meta: { title: '课时价格', icon: 'el-icon-money' }
      },
      
    ]
  },
  {
    path: '/system',
    component: Layout,
    meta: { title: '系统管理', icon: 'el-icon-setting' },
    children: [
      {
        path: 'subject-category',
        name: 'SubjectCategory',
        component: () => import('@/views/system/SubjectCategory.vue'),
        meta: { title: '科目管理', icon: 'el-icon-collection' }
      },
      {
        path: 'teacher-level',
        name: 'TeacherLevelManagement',
        component: () => import('@/views/system/TeacherLevelManagement.vue'),
        meta: { title: '教师评级管理', icon: 'el-icon-coin' }
      },
      {
        path: 'learning-system',
        name: 'LearningSystemManagement',
        component: () => import('@/views/system/LearningSystemManagement.vue'),
        meta: { title: '学习体系管理', icon: 'el-icon-collection-tag' },
        hidden: true
      },
      {
        path: 'head-teacher',
        name: 'HeadTeacher',
        component: () => import('@/views/system/HeadTeacher.vue'),
        meta: { title: '班主任管理', icon: 'el-icon-user-solid' }
      },
      
      {
        path: 'survey',
        name: 'Survey',
        component: () => import('@/views/system/Survey.vue'),
        meta: { title: '问卷调查管理', icon: 'el-icon-chat-line-round' }
      },
      {
        path: 'course-banner',
        name: 'CourseBanner',
        component: () => import('@/views/system/CourseBanner.vue'),
        meta: { title: '课程轮播图', icon: 'el-icon-picture' }
      },
      {
        path: 'teacher-stats-removed',
        name: 'TeacherStatsRemoved',
        component: () => import('@/views/system/Survey.vue'),
        meta: { title: '问卷调查管理(占位)', icon: 'el-icon-chat-line-round' },
        hidden: true
      }
    ]
  },


  {
    path: '/complaint',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Complaint',
        component: () => import('@/views/complaint/Complaint.vue'),
        meta: { title: '投诉管理', icon: 'el-icon-warning' }
      }
    ]
  },
  
  {
    path: '/finance',
    component: Layout,
    meta: { title: '财务管理', icon: 'el-icon-money' },
    children: [
      {
        path: 'orders',
        name: 'OrderManagement',
        component: () => import('@/views/finance/OrderManagement.vue'),
        meta: { title: '订单管理', icon: 'el-icon-s-order' }
      },
      {
        path: 'refunds',
        name: 'RefundManagement',
        component: () => import('@/views/finance/RefundManagement.vue'),
        meta: { title: '退款管理', icon: 'el-icon-warning-outline' }
      },
      {
        path: 'statistics',
        name: 'FinancialStatistics',
        component: () => import('@/views/finance/FinancialStatistics.vue'),
        meta: { title: '财务统计', icon: 'el-icon-data-analysis' }
      }
    ]
  },
  {
    path: '/community',
    component: Layout,
    meta: { title: '社区管理', icon: 'el-icon-chat-dot-round' },
    children: [
      {
        path: 'posts',
        name: 'PostManagement',
        component: () => import('@/views/community/PostManagement.vue'),
        meta: { title: '帖子管理', icon: 'el-icon-document' }
      },
      {
        path: 'resources',
        name: 'ResourceManagement',
        component: () => import('@/views/community/ResourceManagement.vue'),
        meta: { title: '资源管理', icon: 'el-icon-folder' }
      }
    ]
  },
  {
    path: '*',
    redirect: '/404'
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router