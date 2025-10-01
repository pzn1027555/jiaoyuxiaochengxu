package com.education.admin.modules.miniprogram.service.impl;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.MiniHeadTeacherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MiniHeadTeacherServiceImpl implements MiniHeadTeacherService {

    private final com.education.admin.modules.system.mapper.HeadTeacherMapper headTeacherMapper;
    private final com.education.admin.modules.miniprogram.mapper.StudentHeadTeacherMapper studentHeadTeacherMapper;
    private final com.education.admin.modules.student.mapper.StudentMapper studentMapper;

    @Override
    public Result<java.util.Map<String, Object>> getCurrent() {
        java.util.Map<String,Object> m = headTeacherMapper.findEnabledOne();
        if(m!=null) return Result.success(m);
        // 回退：若未配置启用班主任，则走学生绑定逻辑
        Long studentId = getCurrentStudentId();
        java.util.Map<String,Object> bound = studentHeadTeacherMapper.findByStudentId(studentId);
        if(bound != null) return Result.success(bound);
        // 若仍无，任意随机一名（不限制启用），建立绑定
        java.util.Map<String,Object> any = headTeacherMapper.findRandomAny();
        if(any==null) return Result.error("未配置班主任二维码");
        Long headId = ((Number)any.get("id")).longValue();
        studentHeadTeacherMapper.insert(studentId, headId);
        return Result.success(studentHeadTeacherMapper.findByStudentId(studentId));
    }

    @Override
    public Result<java.util.Map<String, Object>> my() {
        Long studentId = getCurrentStudentId();
        java.util.Map<String,Object> bound = studentHeadTeacherMapper.findByStudentId(studentId);
        if(bound != null){ return Result.success(bound); }
        // 随机选择一个启用的班主任
        java.util.Map<String,Object> random = headTeacherMapper.findRandomEnabled();
        if(random == null){ return Result.error("未配置班主任"); }
        Long headId = ((Number)random.get("id")).longValue();
        studentHeadTeacherMapper.insert(studentId, headId);
        // 返回详情
        return Result.success(studentHeadTeacherMapper.findByStudentId(studentId));
    }

    private Long getCurrentStudentId(){
        try {
            org.springframework.web.context.request.ServletRequestAttributes attributes = (org.springframework.web.context.request.ServletRequestAttributes) org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                jakarta.servlet.http.HttpServletRequest request = attributes.getRequest();
                // 优先使用显式传入的 studentId
                String sidParam = request.getParameter("studentId");
                if (sidParam != null && !sidParam.isEmpty()) {
                    try {
                        Long sid = Long.valueOf(sidParam);
                        com.education.admin.modules.student.entity.Student s = studentMapper.findById(sid);
                        if (s != null) { return s.getId(); }
                    } catch (NumberFormatException ignored) {}
                }

                // 兼容旧逻辑：通过手机号识别学生
                String phone = request.getHeader("X-User-Phone");
                if (phone != null && !phone.isEmpty()) {
                    com.education.admin.modules.student.entity.Student s = studentMapper.findByPhone(phone);
                    if (s != null) { return s.getId(); }
                }
            }
        } catch (Exception ignored) {}
        throw new RuntimeException("无法获取学生信息");
    }
}


