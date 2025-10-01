package com.education.admin.modules.miniprogram.service.impl;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.MiniAuthService;
import com.education.admin.modules.miniprogram.service.SimpleCodeService;
import com.education.admin.modules.miniprogram.entity.MiniUser;
import com.education.admin.modules.miniprogram.mapper.MiniUserMapper;
import com.education.admin.modules.student.entity.Student;
import com.education.admin.modules.student.mapper.StudentMapper;
import com.education.admin.modules.parent.entity.Parent;
import com.education.admin.modules.parent.mapper.ParentMapper;
import com.education.admin.modules.teacher.entity.Teacher;
import com.education.admin.modules.teacher.mapper.TeacherMapper;
import com.education.admin.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 小程序认证服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MiniAuthServiceImpl implements MiniAuthService {

    private final MiniUserMapper miniUserMapper;
    private final StudentMapper studentMapper;
    private final ParentMapper parentMapper;
    private final TeacherMapper teacherMapper;
    private final JwtUtil jwtUtil;
    private final SimpleCodeService simpleCodeService;

    @Override
    public Result<Object> sendSmsCode(String phone) {
        try {
            // 校验手机号格式
            if (!isValidPhone(phone)) {
                return Result.error("手机号格式不正确");
            }

            // 使用简化的验证码服务
            String code = simpleCodeService.sendCode(phone);

            // 构建返回数据
            Map<String, Object> data = new HashMap<>();
            data.put("message", "验证码已发送");
            data.put("code", code); // 开发环境直接返回验证码

            return Result.success(data);

        } catch (Exception e) {
            log.error("发送验证码失败", e);
            return Result.error("发送验证码失败");
        }
    }

    @Override
    public Result<Object> phoneLogin(String phone, String code) {
        try {
            // 校验手机号格式
            if (!isValidPhone(phone)) {
                return Result.error("手机号格式不正确");
            }

            // 验证验证码
            if (!simpleCodeService.verifyCode(phone, code)) {
                return Result.error("验证码错误");
            }

            // 检查用户是否存在于小程序用户表
            MiniUser miniUser = miniUserMapper.findByPhone(phone);
            
            if (miniUser == null) {
                // 创建新的小程序用户
                miniUser = new MiniUser();
                miniUser.setPhone(phone);
                miniUser.setUserType(0); // 未知类型，需要选择角色
                miniUser.setStatus(1);
                miniUser.setCreateTime(LocalDateTime.now());
                miniUser.setUpdateTime(LocalDateTime.now());
                miniUserMapper.insert(miniUser);
            }

            // 构建登录响应
            return Result.success(buildLoginResponse(phone));

        } catch (Exception e) {
            log.error("手机号登录失败", e);
            return Result.error("登录失败");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Object> selectRole(String role) {
        try {
            String phone = getCurrentUserPhone();
            
            switch (role.toLowerCase()) {
                case "student":
                    createStudentRecord(phone);
                    break;
                case "parent":
                    createParentRecord(phone);
                    break;
                case "teacher":
                    createTeacherRecord(phone);
                    break;
                default:
                    return Result.error("不支持的角色类型");
            }

            // 更新小程序用户的角色类型
            MiniUser miniUser = miniUserMapper.findByPhone(phone);
            if (miniUser != null) {
                switch (role.toLowerCase()) {
                    case "student":
                        miniUser.setUserType(1);
                        break;
                    case "parent":
                        miniUser.setUserType(2);
                        break;
                    case "teacher":
                        miniUser.setUserType(3);
                        break;
                    default:
                        break;
                }
                miniUser.setUpdateTime(LocalDateTime.now());
                miniUserMapper.update(miniUser);
            }

            return Result.success(buildLoginResponse(phone));

        } catch (Exception e) {
            log.error("选择角色失败", e);
            return Result.error("角色设置失败");
        }
    }

    @Override
    public Result<Object> verifyToken() {
        try {
            String phone = getCurrentUserPhone();
            
            // 验证Token逻辑
            if (phone == null) {
                return Result.error("Token无效");
            }
            
            Map<String, Object> data = new HashMap<>();
            data.put("phone", phone);
            data.put("valid", true);
            
            return Result.success(data);
            
        } catch (Exception e) {
            log.error("验证Token失败", e);
            return Result.error("Token验证失败");
        }
    }

    @Override
    public Result<Void> logout() {
        // 小程序登出逻辑（如果需要的话，可以将token加入黑名单）
        return Result.success();
    }

    /**
     * 验证手机号格式
     */
    private boolean isValidPhone(String phone) {
        return phone != null && phone.matches("^1[3-9]\\d{9}$");
    }

    /**
     * 检查用户是否在任何角色表中存在
     */
    private Map<String, Object> buildLoginResponse(String phone) {
        boolean hasRole = checkUserRole(phone);

        Map<String, Object> data = new HashMap<>();
        data.put("needRoleSelection", !hasRole);

        Map<String, Object> userInfo = hasRole ? getUserInfo(phone) : new HashMap<>();
        if (userInfo == null) {
            userInfo = new HashMap<>();
        }
        if (!userInfo.containsKey("phone")) {
            userInfo.put("phone", phone);
        }

        Long userId = null;
        String role = null;
        if (userInfo != null) {
            Object idObj = userInfo.get("id");
            if (idObj != null) {
                try {
                    userId = Long.parseLong(String.valueOf(idObj));
                } catch (NumberFormatException ignored) {}
            }
            role = (String) userInfo.get("role");
        }

        data.put("userInfo", userInfo);
        if (userId != null) {
            data.put("userId", userId);
        }

        Map<String, Object> claims = new HashMap<>();
        if (userId != null) {
            claims.put("userId", userId);
        }
        if (role != null) {
            claims.put("role", role);
        }

        String token = jwtUtil.generateToken(claims, phone);
        data.put("token", token);

        return data;
    }

    private boolean checkUserRole(String phone) {
        Student student = studentMapper.findByPhone(phone);
        if (student != null) return true;

        Parent parent = parentMapper.findByPhone(phone);
        if (parent != null) return true;

        Teacher teacher = teacherMapper.findByPhone(phone);
        return teacher != null;
    }

    /**
     * 获取用户信息
     */
    private Map<String, Object> getUserInfo(String phone) {
        Map<String, Object> userInfo = new HashMap<>();
        
        Student student = studentMapper.findByPhone(phone);
        if (student != null) {
            userInfo.put("role", "student");
            userInfo.put("id", student.getId());
            userInfo.put("userId", student.getId());
            userInfo.put("name", student.getStudentName());
            userInfo.put("phone", phone);
            return userInfo;
        }
        
        Parent parent = parentMapper.findByPhone(phone);
        if (parent != null) {
            userInfo.put("role", "parent");
            userInfo.put("id", parent.getId());
            userInfo.put("userId", parent.getId());
            userInfo.put("name", parent.getParentName());
            userInfo.put("phone", phone);
            return userInfo;
        }
        
        Teacher teacher = teacherMapper.findByPhone(phone);
        if (teacher != null) {
            userInfo.put("role", "teacher");
            userInfo.put("id", teacher.getId());
            userInfo.put("userId", teacher.getId());
            userInfo.put("name", teacher.getTeacherName());
            userInfo.put("phone", phone);
            return userInfo;
        }
        
        return userInfo;
    }

    /**
     * 获取当前用户手机号
     */
    private String getCurrentUserPhone() {
        try {
            // 从HTTP请求头中获取JWT token
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String bearerToken = request.getHeader("Authorization");
            
            if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
                String jwt = bearerToken.substring(7);
                if (jwtUtil.validateToken(jwt)) {
                    // 从JWT token中获取用户手机号（作为subject）
                    String phone = jwtUtil.getUsernameFromToken(jwt);
                    log.debug("从JWT获取用户手机号: {}", phone);
                    return phone;
                }
            }
            
            // 如果无法从JWT获取，抛出异常
            throw new RuntimeException("无法获取当前用户信息");
            
        } catch (Exception e) {
            log.error("获取当前用户手机号失败", e);
            throw new RuntimeException("获取当前用户信息失败: " + e.getMessage());
        }
    }

    /**
     * 创建学生记录
     */
    private void createStudentRecord(String phone) {
        Student student = new Student();
        student.setStudentNo("S" + System.currentTimeMillis()); // 生成唯一学生编号
        student.setPhone(phone);
        student.setStudentName("学生用户_" + phone.substring(7)); // 使用手机号后4位作为默认名称
        student.setIsFirstLogin(1); // 1-是首次登录
        student.setCreateTime(LocalDateTime.now());
        student.setUpdateTime(LocalDateTime.now());
        
        studentMapper.insert(student);
        log.info("创建学生记录成功: {}", phone);
    }

    /**
     * 创建家长记录
     */
    private void createParentRecord(String phone) {
        Parent parent = new Parent();
        parent.setParentNo("P" + System.currentTimeMillis()); // 生成唯一家长编号
        parent.setPhone(phone);
        parent.setParentName("家长用户_" + phone.substring(7)); // 使用手机号后4位作为默认名称
        parent.setStatus(1); // 启用状态
        parent.setRegisterSource("miniprogram");
        parent.setIsFirstLogin(true); // 首次登录
        parent.setCreateTime(LocalDateTime.now());
        parent.setUpdateTime(LocalDateTime.now());
        
        parentMapper.insert(parent);
        log.info("创建家长记录成功: {}", phone);
    }

    /**
     * 创建教师记录
     */
    private void createTeacherRecord(String phone) {
        Teacher teacher = new Teacher();
        teacher.setTeacherNo("T" + System.currentTimeMillis()); // 生成唯一教师编号
        teacher.setPhone(phone);
        teacher.setTeacherName("教师用户_" + phone.substring(7)); // 使用手机号后4位作为默认名称
        teacher.setStatus(1); // 启用状态
        teacher.setAuditStatus(0); // 待审核状态：0-待审核，1-审核通过，2-审核拒绝
        teacher.setRegisterSource("miniprogram");
        teacher.setIsFirstLogin(1); // 首次登录
        teacher.setCreateTime(LocalDateTime.now());
        teacher.setUpdateTime(LocalDateTime.now());
        
        teacherMapper.insert(teacher);
        log.info("创建教师记录成功: {}", phone);
    }
}