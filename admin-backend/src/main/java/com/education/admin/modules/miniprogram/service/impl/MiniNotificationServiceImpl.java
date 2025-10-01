package com.education.admin.modules.miniprogram.service.impl;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.mapper.StudentNotificationMapper;
import com.education.admin.modules.miniprogram.mapper.ParentStudentRelationMapper;
import com.education.admin.modules.miniprogram.service.MiniNotificationService;
import com.education.admin.modules.student.entity.Student;
import com.education.admin.modules.parent.entity.Parent;
import com.education.admin.modules.parent.mapper.ParentMapper;
import com.education.admin.modules.student.mapper.StudentMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;

@Slf4j
@Service
@RequiredArgsConstructor
public class MiniNotificationServiceImpl implements MiniNotificationService {

    private final StudentMapper studentMapper;
    private final ParentMapper parentMapper;
    private final ParentStudentRelationMapper parentStudentRelationMapper;
    private final StudentNotificationMapper studentNotificationMapper;

    private String getPhone(){
        try{
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String phone = request.getParameter("phone");
            if (phone != null && !phone.isEmpty()) return phone;
            String headerPhone = request.getHeader("X-User-Phone");
            if (headerPhone != null && !headerPhone.isEmpty()) return headerPhone;
        }catch(Exception ignored){}
        return "18071403141";
    }

    private String getUserType(){
        try{
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String ut = request.getParameter("userType");
            if (ut != null && !ut.isEmpty()) return ut;
        }catch(Exception ignored){}
        return "student";
    }

    private Long getCurrentUserIdByType(){
        String phone = getPhone();
        String userType = getUserType();
        if ("parent".equalsIgnoreCase(userType)) {
            Parent p = parentMapper.findByPhone(phone);
            if (p == null) return null;
            Long sid = parentStudentRelationMapper.findFirstStudentIdByParentId(p.getId());
            return sid;
        }
        Student s = studentMapper.findByPhone(phone);
        return s == null ? null : s.getId();
    }

    @Override
    public Result<java.util.List<java.util.Map<String, Object>>> list() {
        String userType = getUserType();
        if ("parent".equalsIgnoreCase(userType)) {
            String phone = getPhone();
            Parent p = parentMapper.findByPhone(phone);
            if (p == null) return Result.error("家长信息不存在");
            java.util.List<Long> sids = parentStudentRelationMapper.findStudentIdsByParentId(p.getId());
            if (sids.isEmpty()) return Result.success(java.util.Collections.emptyList());
            return Result.success(studentNotificationMapper.list(null, sids, userType));
        } else {
            Long sid = getCurrentUserIdByType();
            if (sid == null) return Result.error("学生信息不存在");
            return Result.success(studentNotificationMapper.list(sid, null, userType));
        }
    }

    @Override
    public Result<Object> markRead(Long id) {
        String userType = getUserType();
        if ("parent".equalsIgnoreCase(userType)) {
            String phone = getPhone();
            Parent p = parentMapper.findByPhone(phone);
            if (p == null) return Result.error("家长信息不存在");
            java.util.List<Long> sids = parentStudentRelationMapper.findStudentIdsByParentId(p.getId());
            if (sids.isEmpty()) return Result.error("未绑定学生");
            studentNotificationMapper.markRead(id, null, sids, userType);
            return Result.success("OK");
        } else {
            Long sid = getCurrentUserIdByType();
            if (sid == null) return Result.error("学生信息不存在");
            studentNotificationMapper.markRead(id, sid, null, userType);
            return Result.success("OK");
        }
    }

    @Override
    public Result<Object> markAll() {
        String userType = getUserType();
        if ("parent".equalsIgnoreCase(userType)) {
            String phone = getPhone();
            Parent p = parentMapper.findByPhone(phone);
            if (p == null) return Result.error("家长信息不存在");
            java.util.List<Long> sids = parentStudentRelationMapper.findStudentIdsByParentId(p.getId());
            if (sids.isEmpty()) return Result.success("OK");
            studentNotificationMapper.markAll(null, sids, userType);
            return Result.success("OK");
        } else {
            Long sid = getCurrentUserIdByType();
            if (sid == null) return Result.error("学生信息不存在");
            studentNotificationMapper.markAll(sid, null, userType);
            return Result.success("OK");
        }
    }
}


