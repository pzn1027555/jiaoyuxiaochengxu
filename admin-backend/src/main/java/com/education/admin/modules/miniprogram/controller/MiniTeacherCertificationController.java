package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.teacher.service.TeacherCertificationService;
import com.education.admin.modules.teacher.dto.TeacherCertificationRequest;
import com.education.admin.modules.teacher.dto.TeacherCertificationResponse;
import com.education.admin.modules.teacher.entity.Teacher;
import com.education.admin.modules.teacher.mapper.TeacherMapper;
import com.education.admin.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

/**
 * 小程序端教师认证控制器
 *
 * @author education
 * @since 2025-08-16
 */
@Slf4j
@RestController
@RequestMapping("/api/mini/teacher/certification")
@RequiredArgsConstructor
public class MiniTeacherCertificationController {

    private final TeacherCertificationService certificationService;
    private final TeacherMapper teacherMapper;
    private final JwtUtil jwtUtil;

    /**
     * 提交教师认证
     */
    @PostMapping("/submit")
    public Result<Void> submitCertification(@Valid @RequestBody TeacherCertificationRequest request) {
        try {
            Long teacherId = getCurrentTeacherId();
            if (teacherId == null) {
                return Result.error("获取教师信息失败");
            }

            return certificationService.submitCertification(teacherId, request);

        } catch (Exception e) {
            log.error("提交教师认证失败", e);
            return Result.error("提交认证失败");
        }
    }

    /**
     * 获取认证状态
     */
    @GetMapping("/status")
    public Result<TeacherCertificationResponse> getCertificationStatus() {
        try {
            Long teacherId = getCurrentTeacherId();
            if (teacherId == null) {
                return Result.error("获取教师信息失败");
            }

            return certificationService.getCertificationStatus(teacherId);

        } catch (Exception e) {
            log.error("获取认证状态失败", e);
            return Result.error("获取认证状态失败");
        }
    }

    /**
     * 签署合同：小程序端点击“签署合同”调用，设置合同状态=2并记录签署时间与URL
     */
    @PostMapping("/sign-contract")
    public Result<Void> signContract(@RequestParam(required = false) String contractUrl) {
        try {
            Long teacherId = getCurrentTeacherId();
            if (teacherId == null) {
                return Result.error("获取教师信息失败");
            }
            // 直接更新teacher_info：contract_status=2，contract_sign_time=NOW(), contract_url=传入(可覆盖)
            int updated = teacherMapperSignContract(teacherId, contractUrl);
            return updated > 0 ? Result.success() : Result.error("签署失败");
        } catch (Exception e) {
            log.error("签署合同失败", e);
            return Result.error("签署合同失败");
        }
    }

    private int teacherMapperSignContract(Long teacherId, String contractUrl) {
        // 由于TeacherMapper当前未暴露签署更新方法，这里通过通用update实现
        com.education.admin.modules.teacher.entity.Teacher t = new com.education.admin.modules.teacher.entity.Teacher();
        t.setId(teacherId);
        t.setContractUrl(contractUrl);
        t.setContractStatus(2);
        t.setContractSignTime(java.time.LocalDateTime.now());
        return teacherMapper.update(t);
    }

    /**
     * 获取当前登录教师ID
     */
    private Long getCurrentTeacherId() {
        try {
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String bearerToken = request.getHeader("Authorization");
            if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
                String jwt = bearerToken.substring(7);
                if (jwtUtil.validateToken(jwt)) {
                    String userIdStr = jwtUtil.getUserIdFromToken(jwt);
                    if (userIdStr != null) {
                        try {
                            return Long.parseLong(userIdStr);
                        } catch (NumberFormatException ex) {
                            log.warn("JWT user id 解析失败: {}", userIdStr, ex);
                        }
                    }
                    String phone = jwtUtil.getUsernameFromToken(jwt);
                    Teacher teacher = teacherMapper.findByPhone(phone);
                    return teacher != null ? teacher.getId() : null;
                }
            }
        } catch (Exception e) {
            log.error("获取当前教师ID失败", e);
        }

        return null;
    }
}
