# 数据库表检查清单

## 需要执行的SQL
```sql
-- 1. 创建小程序用户表（如果不存在）
CREATE TABLE IF NOT EXISTS `miniprogram_user` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `openid` varchar(64) DEFAULT NULL COMMENT '微信openid',
  `unionid` varchar(64) DEFAULT NULL COMMENT '微信unionid', 
  `session_key` varchar(64) DEFAULT NULL COMMENT '会话密钥',
  `nickname` varchar(100) DEFAULT NULL COMMENT '昵称',
  `avatar` varchar(500) DEFAULT NULL COMMENT '头像URL',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `user_type` int DEFAULT '0' COMMENT '用户类型：0-未知，1-学生，2-家长，3-教师',
  `status` int DEFAULT '1' COMMENT '状态：0-禁用，1-启用',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid` (`openid`),
  UNIQUE KEY `uk_phone` (`phone`),
  KEY `idx_unionid` (`unionid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='小程序用户表';

-- 2. 确保sms_verification_code表存在且结构正确
-- 该表在init.sql中已经存在，确认字段：
-- id, phone, code, expire_time, used, create_time, update_time

-- 3. 插入测试数据
INSERT IGNORE INTO `miniprogram_user` (`id`, `openid`, `phone`, `nickname`, `user_type`, `status`, `create_time`, `update_time`) VALUES
(1, 'test_openid_1', '13800138001', '测试用户1', 1, 1, '2025-01-01 10:00:00', '2025-01-01 10:00:00'),
(2, 'test_openid_2', '13800138002', '测试用户2', 2, 1, '2025-01-01 10:00:00', '2025-01-01 10:00:00');
```

## 需要验证的表
- [x] `sms_verification_code` - 短信验证码表
- [x] `student_info` - 学生信息表  
- [x] `parent_info` - 家长信息表
- [x] `teacher_info` - 教师信息表
- [x] `miniprogram_user` - 小程序用户表（新增）

## API接口检查
- [x] POST `/api/mini/auth/send-code` - 发送验证码
- [x] POST `/api/mini/auth/phone-login` - 手机号登录  
- [x] POST `/api/mini/auth/select-role` - 选择角色
- [x] GET `/api/mini/auth/verify` - 验证Token
- [x] POST `/api/mini/auth/logout` - 登出