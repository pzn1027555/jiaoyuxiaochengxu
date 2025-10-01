/*
 Navicat Premium Dump SQL

 Source Server         : local
 Source Server Type    : MySQL
 Source Server Version : 50744 (5.7.44-log)
 Source Host           : localhost:3306
 Source Schema         : education_admin

 Target Server Type    : MySQL
 Target Server Version : 50744 (5.7.44-log)
 File Encoding         : 65001

 Date: 18/09/2025 19:16:27
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for community_comment_like
-- ----------------------------
DROP TABLE IF EXISTS `community_comment_like`;
CREATE TABLE `community_comment_like`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `comment_id` bigint(20) NOT NULL COMMENT 'community_post_comment.id',
  `user_id` bigint(20) NOT NULL,
  `user_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'student/parent/teacher',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_comment_user`(`comment_id`, `user_id`, `user_type`) USING BTREE,
  INDEX `idx_comment_id`(`comment_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '评论点赞明细' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for community_post
-- ----------------------------
DROP TABLE IF EXISTS `community_post`;
CREATE TABLE `community_post`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '帖子ID',
  `post_title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '帖子标题',
  `post_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '帖子内容',
  `post_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '帖子类型：question-问题，share-分享，discussion-讨论',
  `author_id` bigint(20) NOT NULL COMMENT '作者ID',
  `author_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '作者类型：student-学生，teacher-教师，admin-管理员',
  `category_id` bigint(20) NULL DEFAULT NULL COMMENT '分类ID',
  `tags` json NULL COMMENT '标签JSON数组',
  `images` json NULL COMMENT '图片URL数组',
  `attachments` json NULL COMMENT '附件JSON数组',
  `view_count` int(10) NULL DEFAULT 0 COMMENT '浏览次数',
  `like_count` int(10) NULL DEFAULT 0 COMMENT '点赞数',
  `comment_count` int(10) NULL DEFAULT 0 COMMENT '评论数',
  `share_count` int(10) NULL DEFAULT 0 COMMENT '分享数',
  `is_pinned` tinyint(1) NULL DEFAULT 0 COMMENT '是否置顶：0-否，1-是',
  `is_featured` tinyint(1) NULL DEFAULT 0 COMMENT '是否精华：0-否，1-是',
  `audit_status` int(1) NOT NULL DEFAULT 0 COMMENT '审核状态：0-待审核，1-审核通过，2-审核拒绝',
  `audit_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '审核原因',
  `audit_time` datetime NULL DEFAULT NULL COMMENT '审核时间',
  `audit_user_id` bigint(20) NULL DEFAULT NULL COMMENT '审核人ID',
  `status` int(1) NOT NULL DEFAULT 1 COMMENT '状态：1-正常，2-下架，0-删除',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_author`(`author_id`, `author_type`) USING BTREE,
  INDEX `idx_post_type`(`post_type`) USING BTREE,
  INDEX `idx_category_id`(`category_id`) USING BTREE,
  INDEX `idx_audit_status`(`audit_status`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_is_pinned`(`is_pinned`) USING BTREE,
  INDEX `idx_create_time`(`create_time`) USING BTREE,
  FULLTEXT INDEX `ft_title_content`(`post_title`, `post_content`)
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '社区帖子表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for community_post_comment
-- ----------------------------
DROP TABLE IF EXISTS `community_post_comment`;
CREATE TABLE `community_post_comment`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `post_id` bigint(20) NOT NULL COMMENT 'community_post.id',
  `parent_id` bigint(20) NULL DEFAULT NULL COMMENT '父评论ID，可为空',
  `user_id` bigint(20) NOT NULL,
  `user_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'student/parent/teacher',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `like_count` int(11) NOT NULL DEFAULT 0,
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1-正常 0-删除',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_post_id`(`post_id`) USING BTREE,
  INDEX `idx_parent_id`(`parent_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '帖子评论' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for community_post_like
-- ----------------------------
DROP TABLE IF EXISTS `community_post_like`;
CREATE TABLE `community_post_like`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `post_id` bigint(20) NOT NULL COMMENT 'community_post.id',
  `user_id` bigint(20) NOT NULL,
  `user_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'student/parent/teacher',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_post_user`(`post_id`, `user_id`, `user_type`) USING BTREE,
  INDEX `idx_post_id`(`post_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 28 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '帖子点赞明细' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for community_resource
-- ----------------------------
DROP TABLE IF EXISTS `community_resource`;
CREATE TABLE `community_resource`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '资源ID',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '标题',
  `description` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '描述',
  `file_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '文件URL',
  `cover_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '封面URL(视频/文档缩略图)',
  `file_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT 'doc/docx/pdf/mp4等',
  `price` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '价格(元)',
  `publisher_user_id` bigint(20) NULL DEFAULT NULL COMMENT '发布管理员(sys_user.id)',
  `download_count` int(11) NOT NULL DEFAULT 0 COMMENT '下载次数',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1-上架 0-下架',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '社区-资源下载区' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for complaint_record
-- ----------------------------
DROP TABLE IF EXISTS `complaint_record`;
CREATE TABLE `complaint_record`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '投诉ID',
  `complaint_no` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '投诉编号',
  `complainant_id` bigint(20) NOT NULL COMMENT '投诉人ID',
  `complainant_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '投诉人类型：student-学生，teacher-教师',
  `complained_id` bigint(20) NOT NULL COMMENT '被投诉人ID',
  `complained_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '被投诉人类型',
  `complaint_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '投诉类型：service-服务态度，quality-教学质量，time-时间安排，other-其他',
  `complaint_title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '投诉标题',
  `complaint_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '投诉内容',
  `evidence_files` json NULL COMMENT '证据文件JSON数组',
  `related_order_id` bigint(20) NULL DEFAULT NULL COMMENT '相关订单ID',
  `related_course_id` bigint(20) NULL DEFAULT NULL COMMENT '相关课程ID',
  `complaint_status` int(1) NOT NULL DEFAULT 0 COMMENT '投诉状态：0-待处理，1-处理中，2-已解决，3-已关闭',
  `process_result` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '处理结果',
  `process_user_id` bigint(20) NULL DEFAULT NULL COMMENT '处理人ID',
  `process_time` datetime NULL DEFAULT NULL COMMENT '处理时间',
  `satisfaction_score` int(1) NULL DEFAULT NULL COMMENT '满意度评分：1-5分',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_complaint_no`(`complaint_no`) USING BTREE,
  INDEX `idx_complainant`(`complainant_id`, `complainant_type`) USING BTREE,
  INDEX `idx_complained`(`complained_id`, `complained_type`) USING BTREE,
  INDEX `idx_complaint_type`(`complaint_type`) USING BTREE,
  INDEX `idx_complaint_status`(`complaint_status`) USING BTREE,
  INDEX `idx_create_time`(`create_time`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '投诉记录表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for course_category
-- ----------------------------
DROP TABLE IF EXISTS `course_category`;
CREATE TABLE `course_category`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '类别ID',
  `parent_id` bigint(20) NULL DEFAULT NULL COMMENT '父级分类ID，NULL表示一级分类',
  `level` tinyint(1) NOT NULL DEFAULT 1 COMMENT '分类层级：1-一级分类，2-二级分类',
  `category_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '类别名称',
  `category_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '类别编码',
  `category_icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '类别图标',
  `sort_order` int(5) NULL DEFAULT 0 COMMENT '排序',
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '类别描述',
  `status` int(1) NOT NULL DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_category_code`(`category_code`) USING BTREE,
  INDEX `idx_parent_id`(`parent_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_level`(`level`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1205 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '课程类别表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for employment_application
-- ----------------------------
DROP TABLE IF EXISTS `employment_application`;
CREATE TABLE `employment_application`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `post_id` bigint(20) NOT NULL COMMENT 'employment_post.id',
  `teacher_id` bigint(20) NULL DEFAULT NULL COMMENT '申请教师ID（可空，未登录时）',
  `resume_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '简历文件URL',
  `resume_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '简历原始文件名',
  `resume_size` bigint(20) NULL DEFAULT NULL COMMENT '简历文件大小(字节)',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_post_id`(`post_id`) USING BTREE,
  INDEX `idx_teacher_id`(`teacher_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '就业应聘申请' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for employment_post
-- ----------------------------
DROP TABLE IF EXISTS `employment_post`;
CREATE TABLE `employment_post`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '标题',
  `description` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '简述',
  `banner_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '横幅图',
  `publish_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态：1-上架，0-下架',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '就业服务信息' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for financial_settlement
-- ----------------------------
DROP TABLE IF EXISTS `financial_settlement`;
CREATE TABLE `financial_settlement`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '结算ID',
  `settlement_no` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '结算单号',
  `teacher_id` bigint(20) NOT NULL COMMENT '教师ID',
  `settlement_period` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '结算周期：weekly-周结，monthly-月结',
  `start_date` date NOT NULL COMMENT '结算开始日期',
  `end_date` date NOT NULL COMMENT '结算结束日期',
  `total_orders` int(10) NULL DEFAULT 0 COMMENT '订单总数',
  `total_income` decimal(15, 2) NULL DEFAULT 0.00 COMMENT '总收入',
  `commission_amount` decimal(15, 2) NULL DEFAULT 0.00 COMMENT '平台佣金',
  `actual_income` decimal(15, 2) NULL DEFAULT 0.00 COMMENT '实际收入',
  `tax_amount` decimal(15, 2) NULL DEFAULT 0.00 COMMENT '税费',
  `final_amount` decimal(15, 2) NULL DEFAULT 0.00 COMMENT '最终结算金额',
  `settlement_status` int(1) NULL DEFAULT 0 COMMENT '结算状态：0-待结算，1-已结算，2-已打款',
  `settlement_time` datetime NULL DEFAULT NULL COMMENT '结算时间',
  `payment_time` datetime NULL DEFAULT NULL COMMENT '打款时间',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_settlement_no`(`settlement_no`) USING BTREE,
  INDEX `idx_teacher_id`(`teacher_id`) USING BTREE,
  INDEX `idx_settlement_status`(`settlement_status`) USING BTREE,
  INDEX `idx_settlement_period`(`start_date`, `end_date`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '财务结算表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for head_teacher
-- ----------------------------
DROP TABLE IF EXISTS `head_teacher`;
CREATE TABLE `head_teacher`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '姓名',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '联系电话',
  `wechat_qr_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '企业微信二维码URL',
  `remark` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '备注',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1-启用 0-停用',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '班主任信息（含企业微信二维码）' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for invitation_record
-- ----------------------------
DROP TABLE IF EXISTS `invitation_record`;
CREATE TABLE `invitation_record`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '邀请记录ID',
  `activity_id` bigint(20) NOT NULL COMMENT '活动ID',
  `inviter_id` bigint(20) NOT NULL COMMENT '邀请人ID',
  `inviter_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '邀请人类型：student-学生，teacher-教师',
  `invited_id` bigint(20) NOT NULL COMMENT '被邀请人ID',
  `invited_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '被邀请人类型',
  `invitation_code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '邀请码',
  `register_time` datetime NULL DEFAULT NULL COMMENT '被邀请人注册时间',
  `first_order_time` datetime NULL DEFAULT NULL COMMENT '首次下单时间',
  `first_order_amount` decimal(10, 2) NULL DEFAULT NULL COMMENT '首次订单金额',
  `invite_reward_amount` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '邀请人奖励金额',
  `invited_reward_amount` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '被邀请人奖励金额',
  `reward_status` int(1) NULL DEFAULT 0 COMMENT '奖励状态：0-未发放，1-已发放，2-已取消',
  `reward_time` datetime NULL DEFAULT NULL COMMENT '奖励发放时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_invitation_code`(`invitation_code`) USING BTREE,
  INDEX `idx_activity_id`(`activity_id`) USING BTREE,
  INDEX `idx_inviter`(`inviter_id`, `inviter_type`) USING BTREE,
  INDEX `idx_invited`(`invited_id`, `invited_type`) USING BTREE,
  INDEX `idx_reward_status`(`reward_status`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '邀请记录表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for miniprogram_config
-- ----------------------------
DROP TABLE IF EXISTS `miniprogram_config`;
CREATE TABLE `miniprogram_config`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `config_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '配置键',
  `config_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '配置值',
  `config_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'string' COMMENT '配置类型：string-字符串，number-数字，boolean-布尔，json-JSON',
  `config_group` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'general' COMMENT '配置分组',
  `config_description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '配置描述',
  `is_enabled` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否启用：1-启用，0-禁用',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_config_key`(`config_key`) USING BTREE,
  INDEX `idx_config_group`(`config_group`) USING BTREE,
  INDEX `idx_is_enabled`(`is_enabled`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '小程序配置表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for miniprogram_login_log
-- ----------------------------
DROP TABLE IF EXISTS `miniprogram_login_log`;
CREATE TABLE `miniprogram_login_log`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `user_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '用户类型：student-学生，teacher-教师，parent-家长',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID（对应各自表的ID）',
  `login_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '登录方式：phone-手机号，wechat-微信',
  `login_ip` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '登录IP',
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '用户代理信息',
  `login_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '登录时间',
  `is_success` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否成功：1-成功，0-失败',
  `fail_reason` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '失败原因',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_type_id`(`user_type`, `user_id`) USING BTREE,
  INDEX `idx_login_time`(`login_time`) USING BTREE,
  INDEX `idx_login_type`(`login_type`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '小程序登录日志表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for miniprogram_user
-- ----------------------------
DROP TABLE IF EXISTS `miniprogram_user`;
CREATE TABLE `miniprogram_user`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `openid` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '微信openid',
  `unionid` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '微信unionid',
  `session_key` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '会话密钥',
  `nickname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '昵称',
  `avatar` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '头像URL',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '手机号',
  `user_type` int(11) NULL DEFAULT 0 COMMENT '用户类型：0-未知，1-学生，2-家长，3-教师',
  `status` int(11) NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_openid`(`openid`) USING BTREE,
  UNIQUE INDEX `uk_phone`(`phone`) USING BTREE,
  INDEX `idx_unionid`(`unionid`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '小程序用户表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for mooc_application
-- ----------------------------
DROP TABLE IF EXISTS `mooc_application`;
CREATE TABLE `mooc_application`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '申请ID',
  `teacher_id` bigint(20) NOT NULL COMMENT '申请教师ID',
  `status` tinyint(1) NOT NULL DEFAULT 0 COMMENT '状态：0-待审核，1-通过，2-拒绝',
  `group_id` bigint(20) NULL DEFAULT NULL COMMENT '分配的小组ID',
  `audit_user_id` bigint(20) NULL DEFAULT NULL COMMENT '审核人',
  `audit_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '审核意见',
  `apply_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  `audit_time` datetime NULL DEFAULT NULL COMMENT '审核时间',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_group_id`(`group_id`) USING BTREE,
  INDEX `idx_teacher_id`(`teacher_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '磨课申请表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for mooc_group
-- ----------------------------
DROP TABLE IF EXISTS `mooc_group`;
CREATE TABLE `mooc_group`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '小组ID',
  `group_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '小组名称',
  `qrcode_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '磨课群二维码URL',
  `dispatch_teachers` json NULL COMMENT '派遣点评老师列表（teacher_id数组或姓名数组）',
  `creator_user_id` bigint(20) NULL DEFAULT NULL COMMENT '创建人',
  `schedule_time` datetime NULL DEFAULT NULL COMMENT '安排时间',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_group_name`(`group_name`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '磨课小组' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for mooc_notification
-- ----------------------------
DROP TABLE IF EXISTS `mooc_notification`;
CREATE TABLE `mooc_notification`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '通知ID',
  `teacher_id` bigint(20) NOT NULL COMMENT '接收教师ID',
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '类型：apply-申请状态，invite-邀请，group-分组',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '标题',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '内容',
  `related_id` bigint(20) NULL DEFAULT NULL COMMENT '关联ID（如group_id或application_id）',
  `is_read` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否已读：0-未读，1-已读',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_teacher_time`(`teacher_id`, `create_time`) USING BTREE,
  INDEX `idx_type`(`type`) USING BTREE,
  INDEX `idx_is_read`(`is_read`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '磨课通知表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for operation_log
-- ----------------------------
DROP TABLE IF EXISTS `operation_log`;
CREATE TABLE `operation_log`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `user_id` bigint(20) NULL DEFAULT NULL COMMENT '操作用户ID',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '操作用户名',
  `operation_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '操作类型',
  `operation_desc` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '操作描述',
  `request_method` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '请求方法',
  `request_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '请求URL',
  `request_params` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '请求参数',
  `response_result` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '响应结果',
  `ip_address` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT 'IP地址',
  `user_agent` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '用户代理',
  `execution_time` bigint(20) NULL DEFAULT NULL COMMENT '执行时间（毫秒）',
  `status` int(1) NULL DEFAULT 1 COMMENT '状态：1-成功，0-失败',
  `error_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '错误信息',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE,
  INDEX `idx_operation_type`(`operation_type`) USING BTREE,
  INDEX `idx_create_time`(`create_time`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '操作日志表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for order_info
-- ----------------------------
DROP TABLE IF EXISTS `order_info`;
CREATE TABLE `order_info`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '订单号',
  `parent_order_no` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '父订单号（分期订单）',
  `student_id` bigint(20) NOT NULL COMMENT '学生ID',
  `schedule_id` bigint(20) NULL DEFAULT NULL COMMENT '排课ID（可空，试听代付/尚未选课时为空）',
  `teacher_id` bigint(20) NULL DEFAULT NULL COMMENT '教师ID',
  `course_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '课程名称',
  `course_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '课程类型',
  `lesson_count` int(5) NOT NULL COMMENT '购买课时数',
  `unit_price` decimal(10, 2) NOT NULL COMMENT '单价',
  `total_amount` decimal(10, 2) NOT NULL COMMENT '订单总金额',
  `discount_amount` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '优惠金额',
  `actual_amount` decimal(10, 2) NOT NULL COMMENT '实际支付金额',
  `commission_amount` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '平台佣金',
  `teacher_income` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '教师收入',
  `payment_method` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '支付方式：wechat-微信，alipay-支付宝，bank-银行卡',
  `order_status` int(1) NOT NULL DEFAULT 1 COMMENT '订单状态：1-待支付，2-已支付，3-已完成，4-已取消，5-已退款，6-售后中',
  `payment_status` int(1) NULL DEFAULT 0 COMMENT '支付状态：0-未支付，1-已支付，2-部分退款，3-全额退款',
  `order_source` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'miniprogram' COMMENT '订单来源：miniprogram-小程序，web-网页，app-APP',
  `transaction_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '第三方交易号',
  `pay_time` datetime NULL DEFAULT NULL COMMENT '支付时间',
  `complete_time` datetime NULL DEFAULT NULL COMMENT '完成时间',
  `cancel_time` datetime NULL DEFAULT NULL COMMENT '取消时间',
  `cancel_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '取消原因',
  `refund_amount` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '退款金额',
  `refund_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '退款原因',
  `refund_time` datetime NULL DEFAULT NULL COMMENT '退款时间',
  `survey_id` bigint(20) NULL DEFAULT NULL COMMENT '关联的预约调查ID（student_survey表）',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '订单备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_order_no`(`order_no`) USING BTREE,
  INDEX `idx_student_id`(`student_id`) USING BTREE,
  INDEX `idx_teacher_id`(`teacher_id`) USING BTREE,
  INDEX `idx_order_status`(`order_status`) USING BTREE,
  INDEX `idx_payment_status`(`payment_status`) USING BTREE,
  INDEX `idx_pay_time`(`pay_time`) USING BTREE,
  INDEX `idx_create_time`(`create_time`) USING BTREE,
  INDEX `idx_schedule_id`(`schedule_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 30 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '订单信息表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for order_refund
-- ----------------------------
DROP TABLE IF EXISTS `order_refund`;
CREATE TABLE `order_refund`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) NOT NULL COMMENT 'order_info.id',
  `refund_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'refund' COMMENT '退款类型：refund-退款',
  `reason` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '申请原因',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'applied' COMMENT 'applied/processing/completed/revoked',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_order_id`(`order_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '订单售后(退款)表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for order_review
-- ----------------------------
DROP TABLE IF EXISTS `order_review`;
CREATE TABLE `order_review`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '评价ID',
  `order_id` bigint(20) NOT NULL COMMENT '订单ID（order_info.id）',
  `student_id` bigint(20) NOT NULL COMMENT '学生ID（student_info.id）',
  `teacher_id` bigint(20) NOT NULL COMMENT '教师ID（teacher_info.id）',
  `star_rating` int(1) NOT NULL COMMENT '星级评分：1-5分',
  `review_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '评价内容',
  `review_images` json NULL COMMENT '评价图片JSON数组',
  `is_anonymous` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否匿名：0-否，1-是',
  `status` int(1) NOT NULL DEFAULT 1 COMMENT '状态：1-正常，0-隐藏',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_student_order`(`student_id`, `order_id`) USING BTREE,
  INDEX `idx_order_id`(`order_id`) USING BTREE,
  INDEX `idx_teacher_id`(`teacher_id`) USING BTREE,
  INDEX `idx_student_id`(`student_id`) USING BTREE,
  CONSTRAINT `fk_or_order` FOREIGN KEY (`order_id`) REFERENCES `order_info` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_or_student` FOREIGN KEY (`student_id`) REFERENCES `student_info` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_or_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teacher_info` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '订单评价表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for parent_info
-- ----------------------------
DROP TABLE IF EXISTS `parent_info`;
CREATE TABLE `parent_info`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '家长ID',
  `parent_no` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '家长编号',
  `parent_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '家长姓名',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '手机号',
  `wx_openid` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '微信OpenID',
  `wx_unionid` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '微信UnionID',
  `nickname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '昵称',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '邮箱',
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '头像URL',
  `gender` tinyint(1) NULL DEFAULT NULL COMMENT '性别：1-男，2-女',
  `birth_date` date NULL DEFAULT NULL COMMENT '出生日期',
  `id_card` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '身份证号',
  `occupation` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '职业',
  `education` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '学历',
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '地址',
  `province` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '省份',
  `city` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '城市',
  `district` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '区县',
  `emergency_contact` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '紧急联系人',
  `emergency_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '紧急联系电话',
  `introduction` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '个人介绍',
  `parent_tags` json NULL COMMENT '家长标签JSON数组',
  `last_login_time` datetime NULL DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '最后登录IP',
  `is_first_login` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否首次登录：1-是，0-否',
  `register_source` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'miniprogram' COMMENT '注册来源：admin-后台创建，miniprogram-小程序注册',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_parent_no`(`parent_no`) USING BTREE,
  UNIQUE INDEX `uk_parent_phone`(`phone`) USING BTREE,
  UNIQUE INDEX `uk_parent_wx_openid`(`wx_openid`) USING BTREE,
  INDEX `idx_parent_wx_unionid`(`wx_unionid`) USING BTREE,
  INDEX `idx_parent_status`(`status`) USING BTREE,
  INDEX `idx_parent_create_time`(`create_time`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 17 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '家长信息表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for parent_student_relation
-- ----------------------------
DROP TABLE IF EXISTS `parent_student_relation`;
CREATE TABLE `parent_student_relation`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `parent_id` bigint(20) NOT NULL COMMENT '家长ID',
  `student_id` bigint(20) NOT NULL COMMENT '学生ID',
  `relation_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'parent' COMMENT '关系类型：parent-父母，guardian-监护人，relative-亲属',
  `is_primary` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否主要联系人：1-是，0-否',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态：1-正常，0-已解除',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_parent_student`(`parent_id`, `student_id`) USING BTREE,
  INDEX `idx_student_id`(`student_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  CONSTRAINT `fk_parent_id` FOREIGN KEY (`parent_id`) REFERENCES `parent_info` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_relation_student_id` FOREIGN KEY (`student_id`) REFERENCES `student_info` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 17 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '家长-学生关联表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for parent_wallet
-- ----------------------------
DROP TABLE IF EXISTS `parent_wallet`;
CREATE TABLE `parent_wallet`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `parent_id` bigint(20) NOT NULL COMMENT 'parent_info.id',
  `balance` decimal(15, 2) NOT NULL DEFAULT 0.00 COMMENT '当前可用余额',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_parent`(`parent_id`) USING BTREE,
  CONSTRAINT `fk_pw_parent` FOREIGN KEY (`parent_id`) REFERENCES `parent_info` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '家长钱包' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for parent_wallet_txn
-- ----------------------------
DROP TABLE IF EXISTS `parent_wallet_txn`;
CREATE TABLE `parent_wallet_txn`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `parent_id` bigint(20) NOT NULL COMMENT 'parent_info.id',
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'recharge-充值, consume-消费, refund-退款',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '摘要/标题',
  `amount` decimal(15, 2) NOT NULL DEFAULT 0.00 COMMENT '金额(consume为正数代表支出)',
  `order_id` bigint(20) NULL DEFAULT NULL COMMENT '关联订单(可选)',
  `extra` json NULL COMMENT '扩展',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_parent_time`(`parent_id`, `create_time`) USING BTREE,
  CONSTRAINT `fk_pwt_parent` FOREIGN KEY (`parent_id`) REFERENCES `parent_info` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '家长钱包流水' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for referral_activity
-- ----------------------------
DROP TABLE IF EXISTS `referral_activity`;
CREATE TABLE `referral_activity`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '活动ID',
  `activity_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '活动名称',
  `activity_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '活动编码',
  `activity_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '活动类型：student-学生推荐，teacher-教师推荐',
  `activity_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '活动描述',
  `invite_reward_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '邀请奖励类型：cash-现金，course-课程，coupon-优惠券',
  `invite_reward_amount` decimal(10, 2) NULL DEFAULT NULL COMMENT '邀请奖励金额',
  `invite_reward_course_id` bigint(20) NULL DEFAULT NULL COMMENT '奖励课程ID',
  `invite_reward_coupon_id` bigint(20) NULL DEFAULT NULL COMMENT '奖励优惠券ID',
  `invited_reward_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '被邀请奖励类型',
  `invited_reward_amount` decimal(10, 2) NULL DEFAULT NULL COMMENT '被邀请奖励金额',
  `min_order_amount` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '最小订单金额要求',
  `max_invite_count` int(5) NULL DEFAULT NULL COMMENT '最大邀请人数限制',
  `reward_period` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'immediate' COMMENT '奖励发放周期：immediate-立即，weekly-周发，monthly-月发',
  `start_time` datetime NOT NULL COMMENT '活动开始时间',
  `end_time` datetime NOT NULL COMMENT '活动结束时间',
  `participant_count` int(10) NULL DEFAULT 0 COMMENT '参与人数',
  `success_count` int(10) NULL DEFAULT 0 COMMENT '成功邀请数',
  `total_reward_amount` decimal(15, 2) NULL DEFAULT 0.00 COMMENT '总奖励金额',
  `status` int(1) NOT NULL DEFAULT 1 COMMENT '状态：1-进行中，2-已结束，0-已停止',
  `create_user_id` bigint(20) NULL DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_activity_code`(`activity_code`) USING BTREE,
  INDEX `idx_activity_type`(`activity_type`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_time_period`(`start_time`, `end_time`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '裂变活动配置表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for research_application
-- ----------------------------
DROP TABLE IF EXISTS `research_application`;
CREATE TABLE `research_application`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `post_id` bigint(20) NOT NULL COMMENT 'research_post.id',
  `teacher_id` bigint(20) NULL DEFAULT NULL COMMENT '报名教师ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_post_id`(`post_id`) USING BTREE,
  INDEX `idx_teacher_id`(`teacher_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '教研活动报名' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for research_post
-- ----------------------------
DROP TABLE IF EXISTS `research_post`;
CREATE TABLE `research_post`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '标题',
  `description` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '简述',
  `banner_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '横幅图',
  `publish_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态：1-上架，0-下架',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '教研活动信息' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for sms_verification_code
-- ----------------------------
DROP TABLE IF EXISTS `sms_verification_code`;
CREATE TABLE `sms_verification_code`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '手机号',
  `code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '验证码',
  `code_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'login' COMMENT '验证码类型：login-登录，register-注册，reset-重置密码',
  `expire_time` datetime NOT NULL COMMENT '过期时间',
  `is_used` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否已使用：1-已使用，0-未使用',
  `send_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间',
  `use_time` datetime NULL DEFAULT NULL COMMENT '使用时间',
  `send_ip` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '发送IP',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_phone_type`(`phone`, `code_type`) USING BTREE,
  INDEX `idx_expire_time`(`expire_time`) USING BTREE,
  INDEX `idx_send_time`(`send_time`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '短信验证码表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for student_head_teacher
-- ----------------------------
DROP TABLE IF EXISTS `student_head_teacher`;
CREATE TABLE `student_head_teacher`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `student_id` bigint(20) NOT NULL COMMENT '学生ID',
  `head_teacher_id` bigint(20) NOT NULL COMMENT '班主任ID（head_teacher.id）',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_student`(`student_id`) USING BTREE,
  INDEX `idx_head_teacher`(`head_teacher_id`) USING BTREE,
  CONSTRAINT `fk_sht_headteacher` FOREIGN KEY (`head_teacher_id`) REFERENCES `head_teacher` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_sht_student` FOREIGN KEY (`student_id`) REFERENCES `student_info` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '学生-班主任绑定关系' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for student_info
-- ----------------------------
DROP TABLE IF EXISTS `student_info`;
CREATE TABLE `student_info`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '学生ID',
  `student_no` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '学生编号',
  `student_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '学生姓名',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '手机号',
  `wx_openid` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '微信OpenID',
  `wx_unionid` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '微信UnionID',
  `nickname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '昵称',
  `last_login_time` datetime NULL DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '最后登录IP',
  `is_first_login` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否首次登录：1-是，0-否',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '邮箱',
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '头像URL',
  `gender` tinyint(1) NULL DEFAULT NULL COMMENT '性别：1-男，2-女',
  `birth_date` date NULL DEFAULT NULL COMMENT '出生日期',
  `grade` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '年级',
  `school` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '学校',
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '地址',
  `introduction` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '个人介绍',
  `student_tags` json NULL COMMENT '学生标签JSON数组',
  `subjects` json NULL COMMENT '感兴趣的科目JSON数组',
  `province` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '省份',
  `city` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '城市',
  `district` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '区县',
  `student_level` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'bronze' COMMENT '学生等级：bronze-铜牌，silver-银牌，gold-金牌',
  `total_amount` decimal(15, 2) NULL DEFAULT 0.00 COMMENT '累计消费金额',
  `avg_unit_price` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '平均客单价',
  `last_course_time` datetime NULL DEFAULT NULL COMMENT '最后上课时间',
  `renewal_reminder_sent` tinyint(1) NULL DEFAULT 0 COMMENT '续课提醒是否已发送：0-否，1-是',
  `renewal_reminder_time` datetime NULL DEFAULT NULL COMMENT '续课提醒时间',
  `complaint_count` int(10) NULL DEFAULT 0 COMMENT '投诉次数',
  `referral_count` int(10) NULL DEFAULT 0 COMMENT '推荐新学生数量',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_student_no`(`student_no`) USING BTREE,
  UNIQUE INDEX `uk_student_wx_openid`(`wx_openid`) USING BTREE,
  INDEX `idx_student_level`(`student_level`) USING BTREE,
  INDEX `idx_province_city`(`province`, `city`) USING BTREE,
  INDEX `idx_last_course_time`(`last_course_time`) USING BTREE,
  INDEX `idx_student_wx_unionid`(`wx_unionid`) USING BTREE,
  INDEX `idx_student_phone`(`phone`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 18 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '学生信息表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for student_notification
-- ----------------------------
DROP TABLE IF EXISTS `student_notification`;
CREATE TABLE `student_notification`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '通知ID',
  `student_id` bigint(20) NOT NULL COMMENT '学生ID',
  `user_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'student' COMMENT '用户类型：student/parent',
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '类型：order-订单，system-系统，activity-活动',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '标题',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '内容',
  `related_id` bigint(20) NULL DEFAULT NULL COMMENT '关联ID（如订单ID）',
  `is_read` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否已读：0-未读，1-已读',
  `read_time` datetime NULL DEFAULT NULL COMMENT '阅读时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_student_time`(`student_id`, `create_time`) USING BTREE,
  INDEX `idx_user_type`(`user_type`) USING BTREE,
  INDEX `idx_type`(`type`) USING BTREE,
  INDEX `idx_is_read`(`is_read`) USING BTREE,
  CONSTRAINT `fk_sn_student` FOREIGN KEY (`student_id`) REFERENCES `student_info` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 14 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '学生通知表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for student_review
-- ----------------------------
DROP TABLE IF EXISTS `student_review`;
CREATE TABLE `student_review`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '评价ID',
  `student_id` bigint(20) NOT NULL COMMENT '学生ID',
  `teacher_id` bigint(20) NOT NULL COMMENT '教师ID',
  `schedule_id` bigint(20) NULL DEFAULT NULL COMMENT '排课ID（teacher_schedule表）',
  `course_id` bigint(20) NOT NULL COMMENT '课程ID',
  `order_id` bigint(20) NOT NULL COMMENT '订单ID',
  `star_rating` int(1) NOT NULL COMMENT '星级评分：1-5分',
  `review_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '评价内容',
  `review_tags` json NULL COMMENT '评价标签JSON数组',
  `review_images` json NULL COMMENT '评价图片JSON数组',
  `is_anonymous` tinyint(1) NULL DEFAULT 0 COMMENT '是否匿名：0-否，1-是',
  `audit_status` int(1) NOT NULL DEFAULT 1 COMMENT '审核状态：0-待审核，1-审核通过，2-审核拒绝',
  `audit_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '审核原因',
  `audit_time` datetime NULL DEFAULT NULL COMMENT '审核时间',
  `audit_user_id` bigint(20) NULL DEFAULT NULL COMMENT '审核人ID',
  `like_count` int(10) NULL DEFAULT 0 COMMENT '点赞数',
  `reply_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '教师回复内容',
  `reply_time` datetime NULL DEFAULT NULL COMMENT '回复时间',
  `status` int(1) NOT NULL DEFAULT 1 COMMENT '状态：1-正常，0-隐藏',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_student_id`(`student_id`) USING BTREE,
  INDEX `idx_teacher_id`(`teacher_id`) USING BTREE,
  INDEX `idx_course_id`(`course_id`) USING BTREE,
  INDEX `idx_order_id`(`order_id`) USING BTREE,
  INDEX `idx_star_rating`(`star_rating`) USING BTREE,
  INDEX `idx_audit_status`(`audit_status`) USING BTREE,
  INDEX `idx_create_time`(`create_time`) USING BTREE,
  INDEX `idx_schedule_id`(`schedule_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 28 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '学生评价表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for student_survey
-- ----------------------------
DROP TABLE IF EXISTS `student_survey`;
CREATE TABLE `student_survey`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `teacher_id` bigint(20) NOT NULL COMMENT '教师ID',
  `student_id` bigint(20) NOT NULL COMMENT '学生ID',
  `data_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '问卷JSON（表单项）',
  `files_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '附件JSON（可选）',
  `status` int(1) NULL DEFAULT 0 COMMENT '预约状态：0-待处理，1-已同意，2-已拒绝',
  `reject_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '拒绝原因',
  `course_id` bigint(20) NULL DEFAULT NULL COMMENT '选定课程ID（可选）',
  `course_title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '选定课程标题（显示用）',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `booking_date` date NULL DEFAULT NULL COMMENT '预约日期',
  `booking_start_time` time NULL DEFAULT NULL COMMENT '预约开始时间',
  `booking_duration` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '预约时长(trial/formal)',
  `booking_price` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '预约价格',
  `booking_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'trial' COMMENT '预约类型: trial-试听, formal-正式课',
  `paid` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否已支付/可展示：1-可展示(已付或无需付)，0-未支付',
  `detail_id` bigint(20) NULL DEFAULT NULL COMMENT '问卷明细ID（student_survey_detail.id）',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_student`(`student_id`) USING BTREE,
  INDEX `idx_teacher`(`teacher_id`) USING BTREE,
  INDEX `idx_booking_date`(`booking_date`) USING BTREE,
  INDEX `idx_booking_type`(`booking_type`) USING BTREE,
  INDEX `idx_paid`(`paid`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 12 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '学生调查问卷' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for student_survey_detail
-- ----------------------------
DROP TABLE IF EXISTS `student_survey_detail`;
CREATE TABLE `student_survey_detail`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `teacher_id` bigint(20) NULL DEFAULT NULL COMMENT '教师ID（冗余写入，便于运营侧检索）',
  `student_id` bigint(20) NULL DEFAULT NULL COMMENT '学生ID（冗余写入）',
  `data_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '问卷表单项JSON',
  `files_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '附件JSON（数组）',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '学生问卷明细' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for student_teacher_favorite
-- ----------------------------
DROP TABLE IF EXISTS `student_teacher_favorite`;
CREATE TABLE `student_teacher_favorite`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `student_id` bigint(20) NOT NULL COMMENT '学生ID',
  `teacher_id` bigint(20) NOT NULL COMMENT '教师ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_student_teacher`(`student_id`, `teacher_id`) USING BTREE,
  INDEX `idx_teacher`(`teacher_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '学生收藏老师' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for study_plan
-- ----------------------------
DROP TABLE IF EXISTS `study_plan`;
CREATE TABLE `study_plan`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `plan_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '计划编码，用于关联teacher_schedule',
  `teacher_id` bigint(20) NOT NULL COMMENT '教师ID',
  `student_id` bigint(20) NOT NULL COMMENT '学生ID',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '学习计划标题',
  `total_lessons` int(11) NOT NULL COMMENT '总课时数',
  `unit_price` decimal(10, 2) NOT NULL COMMENT '每节课价格',
  `total_amount` decimal(10, 2) NOT NULL COMMENT '总金额',
  -- 计划页面填写的扩展字段（用于生成日程）
  `subject_id` bigint(20) NULL DEFAULT NULL COMMENT '科目ID',
  `subject_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '科目名称',
  `start_date` date NULL DEFAULT NULL COMMENT '开始日期',
  `start_time` time NULL DEFAULT NULL COMMENT '开始时间(HH:mm:ss)',
  `duration_minutes` int(11) NULL DEFAULT 120 COMMENT '单节时长(分钟)',
  `repeat_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'daily' COMMENT '重复规则：daily/every3days/every5days/weekly/monthly',
  `class_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'one_to_one' COMMENT '课程类别：one_to_one/big_class',
  `teach_mode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'online' COMMENT '授课方式：online/offline',
  `cover_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '封面图(班课可用)',
  `tags` json NULL COMMENT '课程标签JSON数组',
  `intro` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '课程介绍',
  `confirmation_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'unconfirmed' COMMENT '确认状态：unconfirmed-未确认，confirmed-已确认付款',
  `order_id` bigint(20) NULL DEFAULT NULL COMMENT '关联的订单ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_plan_code`(`plan_code`) USING BTREE,
  INDEX `idx_teacher_student`(`teacher_id`, `student_id`) USING BTREE,
  INDEX `idx_order_id`(`order_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '学习计划表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for sys_menu
-- ----------------------------
DROP TABLE IF EXISTS `sys_menu`;
CREATE TABLE `sys_menu`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '菜单ID',
  `parent_id` bigint(20) NOT NULL DEFAULT 0 COMMENT '父菜单ID（0为根菜单）',
  `menu_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '菜单名称',
  `menu_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '菜单编码',
  `menu_icon` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '菜单图标',
  `menu_url` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '菜单URL',
  `menu_type` int(1) NOT NULL DEFAULT 1 COMMENT '菜单类型：1-菜单，2-按钮',
  `sort_order` int(5) NOT NULL DEFAULT 0 COMMENT '排序',
  `status` int(1) NOT NULL DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_menu_code`(`menu_code`) USING BTREE,
  INDEX `idx_parent_id`(`parent_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_sort_order`(`sort_order`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 22 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '系统菜单表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for sys_user
-- ----------------------------
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '用户名',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '密码（明文）',
  `real_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '真实姓名',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '邮箱',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '手机号',
  `status` int(1) NOT NULL DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `role` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'admin' COMMENT '角色：admin-管理员，teacher-教师，operator-运营',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `last_login_time` datetime NULL DEFAULT NULL COMMENT '最后登录时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_username`(`username`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_role`(`role`) USING BTREE,
  INDEX `idx_create_time`(`create_time`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '系统用户表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for system_config
-- ----------------------------
DROP TABLE IF EXISTS `system_config`;
CREATE TABLE `system_config`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `config_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '配置键',
  `config_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '配置值',
  `config_group` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '配置分组',
  `config_description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '配置描述',
  `value_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'string' COMMENT '值类型：string-字符串，number-数字，boolean-布尔，json-JSON',
  `is_public` tinyint(1) NULL DEFAULT 0 COMMENT '是否公开：0-否，1-是',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_config_key`(`config_key`) USING BTREE,
  INDEX `idx_config_group`(`config_group`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '系统配置表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for course_banner
-- ----------------------------
DROP TABLE IF EXISTS `course_banner`;
CREATE TABLE `course_banner`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '标题',
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '图片URL',
  `link_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'none' COMMENT '跳转类型：none-miniapp-web',
  `link_value` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '跳转值：小程序路径或H5链接',
  `sort_order` int(11) NOT NULL DEFAULT 0 COMMENT '排序(越大越前)',
  `is_enabled` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否启用：1-启用 0-禁用',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '课程页轮播图' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for teacher_certification
-- ----------------------------
DROP TABLE IF EXISTS `teacher_certification`;
CREATE TABLE `teacher_certification`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '认证ID',
  `teacher_id` bigint(20) NOT NULL COMMENT '教师ID',
  `real_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '真实姓名',
  `gender` tinyint(1) NOT NULL COMMENT '性别：1-男，2-女',
  `id_card_front` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '身份证人像面URL',
  `id_card_back` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '身份证国徽面URL',
  `graduate_school` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '毕业院校',
  `education` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '学历：专科，本科，硕士，博士',
  `diploma_certs` json NULL COMMENT '学历证书URL数组',
  `teacher_certs` json NULL COMMENT '教师资格证URL数组',
  `award_certs` json NULL COMMENT '获奖认证URL数组',
  `bank_card` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '银行卡号',
  `bank_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '开户行名称',
  `certification_status` int(1) NOT NULL DEFAULT 0 COMMENT '认证状态：0-待审核，1-审核通过，2-审核拒绝，3-待面试，4-面试通过，5-面试不通过',
  `submit_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
  `audit_time` datetime NULL DEFAULT NULL COMMENT '审核时间',
  `audit_user_id` bigint(20) NULL DEFAULT NULL COMMENT '审核人ID',
  `audit_user_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '审核人姓名',
  `audit_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '审核意见',
  `interview_time` datetime NULL DEFAULT NULL COMMENT '面试时间',
  `interview_result` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '面试结果',
  `teacher_level` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '认证评级：junior-初级，intermediate-中级，senior-高级，expert-专家',
  `grade_time` datetime NULL DEFAULT NULL COMMENT '评级时间',
  `grade_user_id` bigint(20) NULL DEFAULT NULL COMMENT '评级人ID',
  `grade_user_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '评级人姓名',
  `grade_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '评级说明',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_teacher_id`(`teacher_id`) USING BTREE,
  INDEX `idx_certification_status`(`certification_status`) USING BTREE,
  INDEX `idx_submit_time`(`submit_time`) USING BTREE,
  INDEX `idx_audit_time`(`audit_time`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '教师认证表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for teacher_info
-- ----------------------------
DROP TABLE IF EXISTS `teacher_info`;
CREATE TABLE `teacher_info`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '教师ID',
  `teacher_no` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '教师编号',
  `teacher_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '教师姓名',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '手机号',
  `wx_openid` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '微信OpenID',
  `wx_unionid` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '微信UnionID',
  `nickname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '昵称',
  `last_login_time` datetime NULL DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '最后登录IP',
  `is_first_login` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否首次登录：1-是，0-否',
  `register_source` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'admin' COMMENT '注册来源：admin-后台创建，miniprogram-小程序注册',
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '头像URL',
  `gender` tinyint(1) NULL DEFAULT NULL COMMENT '性别：1-男，2-女',
  `birth_date` date NULL DEFAULT NULL COMMENT '出生日期',
  `province` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '省份',
  `city` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '城市',
  `district` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '区县',
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '详细地址',
  `teaching_experience` int(5) NULL DEFAULT NULL COMMENT '教学经验（年）',
  `introduction` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '个人介绍',
  `subjects` json NULL COMMENT '教授科目JSON数组',
  `teacher_level` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'junior' COMMENT '教师等级：junior-初级，intermediate-中级，senior-高级，expert-专家',
  `teacher_tags` json NULL COMMENT '教师标签JSON数组',
  `audit_status` int(1) NOT NULL DEFAULT 0 COMMENT '审核状态：0-待审核，1-审核通过，2-审核拒绝',
  `audit_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '审核原因',
  `audit_time` datetime NULL DEFAULT NULL COMMENT '审核时间',
  `audit_user_id` bigint(20) NULL DEFAULT NULL COMMENT '审核人ID',
  `contract_status` int(1) NULL DEFAULT 0 COMMENT '合同状态：0-未发送，1-已发送待签，2-已签署，3-已过期',
  `contract_send_time` datetime NULL DEFAULT NULL COMMENT '合同发送时间',
  `contract_sign_time` datetime NULL DEFAULT NULL COMMENT '合同签署时间',
  `contract_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '合同文件URL',
  `risk_level` int(1) NULL DEFAULT 0 COMMENT '风险等级：0-正常，1-低风险，2-中风险，3-高风险',
  `complaint_count` int(10) NULL DEFAULT 0 COMMENT '投诉次数',
  `complaint_rate` decimal(5, 2) NULL DEFAULT 0.00 COMMENT '投诉率（%）',
  `conversion_rate` decimal(5, 2) NULL DEFAULT 0.00 COMMENT '转化率（%）',
  `active_score` decimal(5, 2) NULL DEFAULT 0.00 COMMENT '活跃度评分',
  `total_students` int(10) NULL DEFAULT 0 COMMENT '累计学生数',
  `total_courses` int(10) NULL DEFAULT 0 COMMENT '累计课程数',
  `total_income` decimal(15, 2) NULL DEFAULT 0.00 COMMENT '累计收入',
  `star_rating` decimal(3, 1) NULL DEFAULT 5.0 COMMENT '学生评价星级',
  `check_count` int(10) NULL DEFAULT 0 COMMENT '抽查次数',
  `violation_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '违规内容记录',
  `is_hidden` tinyint(1) NULL DEFAULT 0 COMMENT '是否雪藏：0-正常，1-雪藏',
  `is_recommended` tinyint(1) NULL DEFAULT 0 COMMENT '是否推荐：0-否，1-是',
  `recommend_order` int(5) NULL DEFAULT 0 COMMENT '推荐排序',
  `status` int(1) NOT NULL DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_teacher_no`(`teacher_no`) USING BTREE,
  UNIQUE INDEX `uk_teacher_wx_openid`(`wx_openid`) USING BTREE,
  INDEX `idx_audit_status`(`audit_status`) USING BTREE,
  INDEX `idx_contract_status`(`contract_status`) USING BTREE,
  INDEX `idx_teacher_level`(`teacher_level`) USING BTREE,
  INDEX `idx_risk_level`(`risk_level`) USING BTREE,
  INDEX `idx_is_hidden`(`is_hidden`) USING BTREE,
  INDEX `idx_is_recommended`(`is_recommended`) USING BTREE,
  INDEX `idx_star_rating`(`star_rating`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_teacher_wx_unionid`(`wx_unionid`) USING BTREE,
  INDEX `idx_teacher_phone`(`phone`) USING BTREE,
  INDEX `idx_province_city`(`province`, `city`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '教师信息表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for teacher_level_config
-- ----------------------------
DROP TABLE IF EXISTS `teacher_level_config`;
CREATE TABLE `teacher_level_config`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `level_key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '等级键：junior/intermediate/senior/expert',
  `display_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '等级显示名',
  `hourly_rate` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '课时费(元)',
  `is_enabled` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否启用：1-启用，0-禁用',
  `remark` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `commission_rate` decimal(5, 2) NOT NULL DEFAULT 15.00 COMMENT '佣金比例（%）',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_level_key`(`level_key`) USING BTREE,
  INDEX `idx_enabled`(`is_enabled`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '教师等级-课时费配置表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for teacher_notification
-- ----------------------------
DROP TABLE IF EXISTS `teacher_notification`;
CREATE TABLE `teacher_notification`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '通知ID',
  `teacher_id` bigint(20) NOT NULL COMMENT '教师ID',
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '通知类型：interview-面试通知，grade-评级通知，audit-审核通知',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '通知标题',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '通知内容',
  `certification_id` bigint(20) NULL DEFAULT NULL COMMENT '关联的认证ID',
  `interview_time` datetime NULL DEFAULT NULL COMMENT '面试时间（面试通知用）',
  `teacher_level` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '评定等级（评级通知用）',
  `is_read` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否已读：0-未读，1-已读',
  `read_time` datetime NULL DEFAULT NULL COMMENT '阅读时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_teacher_id`(`teacher_id`) USING BTREE,
  INDEX `idx_type`(`type`) USING BTREE,
  INDEX `idx_is_read`(`is_read`) USING BTREE,
  INDEX `idx_create_time`(`create_time`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '教师通知表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for teacher_recommend
-- ----------------------------
DROP TABLE IF EXISTS `teacher_recommend`;
CREATE TABLE `teacher_recommend`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '推荐ID',
  `teacher_id` bigint(20) NOT NULL COMMENT '教师ID',
  `recommend_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '推荐类型：featured-精选推荐，new-新人推荐，hot-热门推荐',
  `recommend_title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '推荐标题',
  `recommend_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '推荐理由',
  `recommend_order` int(5) NULL DEFAULT 0 COMMENT '推荐排序',
  `start_time` datetime NOT NULL COMMENT '推荐开始时间',
  `end_time` datetime NOT NULL COMMENT '推荐结束时间',
  `click_count` int(10) NULL DEFAULT 0 COMMENT '点击次数',
  `order_count` int(10) NULL DEFAULT 0 COMMENT '产生订单数',
  `status` int(1) NOT NULL DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `create_user_id` bigint(20) NULL DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_teacher_id`(`teacher_id`) USING BTREE,
  INDEX `idx_recommend_type`(`recommend_type`) USING BTREE,
  INDEX `idx_recommend_order`(`recommend_order`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_time_period`(`start_time`, `end_time`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '教师推荐榜单表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for teacher_resource
-- ----------------------------
DROP TABLE IF EXISTS `teacher_resource`;
CREATE TABLE `teacher_resource`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `teacher_id` bigint(20) NOT NULL COMMENT '教师ID，关联 teacher_info.id',
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'trial_video/material/certificate',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `file_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `cover_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `file_size` bigint(20) NULL DEFAULT NULL COMMENT '文件大小(字节)',
  `price` decimal(10, 2) NOT NULL DEFAULT 0.00,
  `is_published` tinyint(1) NOT NULL DEFAULT 1,
  `like_count` int(11) NOT NULL DEFAULT 0,
  `view_count` int(11) NOT NULL DEFAULT 0,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_teacher_type`(`teacher_id`, `type`) USING BTREE,
  INDEX `idx_published`(`is_published`) USING BTREE,
  INDEX `idx_create_time`(`create_time`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '教师资源：试听视频/学习资料/证书' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for teacher_schedule
-- ----------------------------
DROP TABLE IF EXISTS `teacher_schedule`;
CREATE TABLE `teacher_schedule`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `teacher_id` bigint(20) NOT NULL COMMENT '教师ID',
  `course_id` bigint(20) NULL DEFAULT NULL COMMENT '课程ID，可为空',
  `subject_id` bigint(20) NULL DEFAULT NULL COMMENT '科目分类ID（关联course_category.id）',
  `subject_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '科目名称（便于查询显示）',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '课程标题',
  `class_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'one_to_one' COMMENT 'one_to_one/small_class/big_class',
  `total_lessons` int(11) NULL DEFAULT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `cover_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `student_count` int(11) NULL DEFAULT 0,
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `intro` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `course_tags` json NULL COMMENT '课程标签(JSON数组)',
  `duration_minutes` int(11) NULL DEFAULT 90,
  `teach_mode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'offline',
  `address` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `province` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `city` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `district` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `detail_address` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `contact_phone` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lesson_number` int(11) NULL DEFAULT 1 COMMENT '第几节课\r\n',
  `plan_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '学习计划ID，用于关联同一计划下的多节课',
  `lesson_price` decimal(10, 2) NULL DEFAULT NULL COMMENT '班课单价(元/课时)',
  `confirmation_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'unconfirmed' COMMENT '确认状态：unconfirmed-未确认，confirmed-已确认付款',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_teacher_time`(`teacher_id`, `start_time`) USING BTREE,
  INDEX `idx_subject_id`(`subject_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 35 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '教师日程排课' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for teacher_schedule_feedback
-- ----------------------------
DROP TABLE IF EXISTS `teacher_schedule_feedback`;
CREATE TABLE `teacher_schedule_feedback`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `schedule_id` bigint(20) NOT NULL,
  `teacher_id` bigint(20) NOT NULL,
  `student_id` bigint(20) NULL DEFAULT NULL,
  `role_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'teacher' COMMENT 'teacher=教师反馈, student=学生评价',
  `star_rating` int(1) NULL DEFAULT 5 COMMENT '星级(1-5)',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_schedule_role`(`schedule_id`, `role_type`) USING BTREE,
  INDEX `idx_teacher`(`teacher_id`) USING BTREE,
  INDEX `idx_student`(`student_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '教师单节课反馈' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for teacher_schedule_student
-- ----------------------------
DROP TABLE IF EXISTS `teacher_schedule_student`;
CREATE TABLE `teacher_schedule_student`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `schedule_id` bigint(20) NOT NULL COMMENT '排课ID',
  `student_id` bigint(20) NOT NULL COMMENT '学生ID',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_schedule_student`(`schedule_id`, `student_id`) USING BTREE,
  INDEX `idx_schedule_id`(`schedule_id`) USING BTREE,
  INDEX `fk_tss_student`(`student_id`) USING BTREE,
  CONSTRAINT `fk_tss_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `teacher_schedule` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_tss_student` FOREIGN KEY (`student_id`) REFERENCES `student_info` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 104 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '排课-学生关联' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for teacher_tag_audit
-- ----------------------------
DROP TABLE IF EXISTS `teacher_tag_audit`;
CREATE TABLE `teacher_tag_audit`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '审核ID',
  `teacher_id` bigint(20) NOT NULL COMMENT '教师ID',
  `tag_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '标签名称',
  `tag_description` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '标签描述',
  `audit_status` int(1) NOT NULL DEFAULT 0 COMMENT '审核状态：0-待审核，1-审核通过，2-审核拒绝',
  `audit_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '审核原因',
  `audit_time` datetime NULL DEFAULT NULL COMMENT '审核时间',
  `audit_user_id` bigint(20) NULL DEFAULT NULL COMMENT '审核人ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_teacher_id`(`teacher_id`) USING BTREE,
  INDEX `idx_audit_status`(`audit_status`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '教师自定义标签审核表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for user_badge_notification
-- ----------------------------
DROP TABLE IF EXISTS `user_badge_notification`;
CREATE TABLE `user_badge_notification`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `user_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '用户类型：teacher-教师, student-学生, parent-家长',
  `badge_key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '红点标识键',
  `module_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '模块名称',
  `is_visible` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否显示红点：0-不显示，1-显示',
  `badge_count` int(11) NOT NULL DEFAULT 0 COMMENT '红点数量（0表示只显示红点不显示数字）',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_user_badge`(`user_id`, `user_type`, `badge_key`) USING BTREE,
  INDEX `idx_user_type`(`user_id`, `user_type`) USING BTREE,
  INDEX `idx_badge_key`(`badge_key`) USING BTREE,
  INDEX `idx_is_visible`(`is_visible`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '用户红点通知管理表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for user_invite_code
-- ----------------------------
DROP TABLE IF EXISTS `user_invite_code`;
CREATE TABLE `user_invite_code`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID（学生/家长/教师）',
  `user_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '用户类型：student/parent/teacher',
  `code_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'invite' COMMENT 'invite-邀请码/绑定码等',
  `code` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '唯一邀请码',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_user_type`(`user_id`, `user_type`, `code_type`) USING BTREE,
  UNIQUE INDEX `uk_code`(`code`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '用户固定邀请码/绑定码' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for learning_system_config
-- ----------------------------
DROP TABLE IF EXISTS `learning_system_config`;
CREATE TABLE `learning_system_config`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `system_key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '体系键：gaokao/ap/alevel/ib/competition',
  `display_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '显示名称',
  `is_enabled` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否启用：1-启用 0-禁用',
  `sort_order` int(11) NOT NULL DEFAULT 0 COMMENT '排序(升序)',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_system_key`(`system_key`) USING BTREE,
  INDEX `idx_enabled`(`is_enabled`) USING BTREE,
  INDEX `idx_sort`(`sort_order`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '学习体系配置' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for lesson_price_config
-- ----------------------------
DROP TABLE IF EXISTS `lesson_price_config`;
CREATE TABLE `lesson_price_config` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `price` decimal(10,2) NOT NULL COMMENT '统一课时价格(元/课时)',
  `currency` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'CNY' COMMENT '币种',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '统一课时价格配置(仅一条记录生效)' ROW_FORMAT = DYNAMIC;

-- 初始化数据
INSERT INTO `learning_system_config` (`system_key`, `display_name`, `is_enabled`, `sort_order`) VALUES
('gaokao', '国内中考/高考', 1, 10),
('ap', 'AP', 1, 20),
('alevel', 'A-Level', 1, 30),
('ib', 'IB', 1, 40),
('competition', '竞赛', 1, 50);

-- 初始化课时价格（可按需调整）
INSERT INTO `lesson_price_config` (`price`, `currency`) VALUES (199.00, 'CNY');

SET FOREIGN_KEY_CHECKS = 1;
