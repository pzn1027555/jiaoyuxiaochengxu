package com.education.admin.modules.miniprogram.service.impl;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.MiniTeacherService;
import com.education.admin.modules.teacher.entity.Teacher;
import com.education.admin.modules.teacher.mapper.TeacherMapper;
import com.education.admin.modules.miniprogram.mapper.MiniFavoriteMapper;
import com.education.admin.modules.student.mapper.StudentMapper;
import com.education.admin.modules.student.entity.Student;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class MiniTeacherServiceImpl implements MiniTeacherService {

    private final TeacherMapper teacherMapper;
    private final MiniFavoriteMapper favoriteMapper;
    private final StudentMapper studentMapper;

    @Override
    public Result<Object> recommended(Integer limit) {
        try{
            int lim = (limit==null || limit<=0) ? 8 : limit;
            List<Teacher> list = teacherMapper.findRecommended(lim);
            Map<String,Object> resp = new HashMap<>();
            resp.put("items", list);
            return Result.success(resp);
        }catch(Exception e){
            log.error("获取推荐老师失败", e);
            return Result.error("获取推荐老师失败");
        }
    }

    @Override
    public Result<Object> recommendedList() {
        try{
            List<Teacher> list = teacherMapper.findRecommended(null);
            return Result.success(list);
        }catch(Exception e){
            log.error("获取推荐老师失败", e);
            return Result.error("获取推荐老师失败");
        }
    }

    @Override
    public Result<Object> favorite(Long teacherId, String action) {
        try{
            // 简化获取当前学生ID：从 JWT phone 反查 student_info.id（此处快速实现，若无JWT则使用演示ID=1）
            Long studentId = resolveCurrentStudentId();
            if (studentId == null) return Result.error("未登录学生");
            int exists = favoriteMapper.exists(studentId, teacherId);
            if ("add".equalsIgnoreCase(action)) {
                if (exists == 0) favoriteMapper.insert(studentId, teacherId);
                return Result.success("已收藏");
            } else if ("remove".equalsIgnoreCase(action) || "del".equalsIgnoreCase(action)) {
                if (exists > 0) favoriteMapper.delete(studentId, teacherId);
                return Result.success("已取消收藏");
            } else {
                return Result.error("非法操作");
            }
        }catch(Exception e){
            log.error("收藏老师失败", e);
            return Result.error("收藏失败");
        }
    }

    @Override
    public Result<Object> favoriteStatus(Long teacherId) {
        try{
            Long studentId = resolveCurrentStudentId();
            if (studentId == null) return Result.error("未登录学生");
            int exists = favoriteMapper.exists(studentId, teacherId);
            return Result.success(exists > 0);
        }catch(Exception e){
            log.error("查询收藏状态失败", e);
            return Result.error("查询收藏状态失败");
        }
    }

    private Long resolveCurrentStudentId(){
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String phone = request.getHeader("X-User-Phone");
                log.debug("从请求头获取用户手机号: {}", phone);
                
                if (phone != null && !phone.isEmpty()) {
                    Student student = studentMapper.findByPhone(phone);
                    if (student != null) {
                        return student.getId();
                    }
                }
            }
            return null;
        } catch (Exception e) {
            log.error("获取当前学生ID失败", e);
            return null;
        }
    }
}



