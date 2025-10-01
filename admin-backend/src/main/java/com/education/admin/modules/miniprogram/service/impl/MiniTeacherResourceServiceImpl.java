package com.education.admin.modules.miniprogram.service.impl;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.MiniTeacherResourceService;
import com.education.admin.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class MiniTeacherResourceServiceImpl implements MiniTeacherResourceService {

    private final JwtUtil jwtUtil;
    private final com.education.admin.modules.teacher.mapper.TeacherMapper teacherMapper;
    private final com.education.admin.modules.miniprogram.mapper.TeacherResourceMapper teacherResourceMapper;

    private String getCurrentPhone() {
        try {
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String bearerToken = request.getHeader("Authorization");
            if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
                String jwt = bearerToken.substring(7);
                if (jwtUtil.validateToken(jwt)) {
                    return jwtUtil.getUsernameFromToken(jwt);
                }
            }
        } catch (Exception ignored) {}
        return "18071403141"; // fallback 测试账号
    }

    @Override
    public Result<Object> list(String type, Integer page, Integer size, Long teacherId) {
        try {
            var teacher = teacherId != null ? teacherMapper.findById(teacherId) : null;
            if (teacher == null) {
                String phone = getCurrentPhone();
                teacher = teacherMapper.findByPhone(phone);
            }
            if (teacher == null) return Result.error("教师不存在");
            var list = teacherResourceMapper.findByTeacherAndType(teacher.getId(), type);
            // 简单内存分页（表数据量少时可用，后续可改SQL分页）
            int p = page == null || page < 1 ? 1 : page;
            int s = size == null || size < 1 ? 10 : Math.min(size, 100);
            int from = Math.min((p - 1) * s, list.size());
            int to = Math.min(from + s, list.size());
            var pageList = list.subList(from, to);
            Map<String, Object> resp = new java.util.HashMap<>();
            resp.put("records", pageList);
            resp.put("total", list.size());
            resp.put("page", p);
            resp.put("size", s);
            return Result.success(resp);
        } catch (Exception e) {
            log.error("查询教师资源失败", e);
            return Result.error("查询失败");
        }
    }

    @Override
    public Result<Object> create(Map<String, Object> payload) {
        try {
            String phone = getCurrentPhone();
            var teacher = teacherMapper.findByPhone(phone);
            if (teacher == null) return Result.error("教师不存在");

            var entity = new com.education.admin.modules.miniprogram.entity.TeacherResource();
            entity.setTeacherId(teacher.getId());
            entity.setType((String) payload.getOrDefault("type", "material"));
            entity.setTitle((String) payload.getOrDefault("title", "未命名"));
            entity.setDescription((String) payload.getOrDefault("description", ""));
            entity.setFileUrl((String) payload.getOrDefault("fileUrl", ""));
            entity.setCoverUrl((String) payload.getOrDefault("coverUrl", ""));
            entity.setPrice(new java.math.BigDecimal(String.valueOf(payload.getOrDefault("price", "0.00"))));
            // 记录文件大小（字节）
            try {
                Object sizeObj = payload.get("fileSize");
                if (sizeObj != null) entity.setFileSize(Long.valueOf(String.valueOf(sizeObj)));
            } catch (Exception ignore) {}
            entity.setIsPublished(1);
            entity.setLikeCount(0);
            entity.setViewCount(0);
            teacherResourceMapper.insert(entity);
            return Result.success("创建成功", null);
        } catch (Exception e) {
            log.error("创建教师资源失败", e);
            return Result.error("创建失败");
        }
    }

    @Override
    public Result<Object> update(Long id, Map<String, Object> payload) {
        try {
            String phone = getCurrentPhone();
            var teacher = teacherMapper.findByPhone(phone);
            if (teacher == null) return Result.error("教师不存在");

            var entity = new com.education.admin.modules.miniprogram.entity.TeacherResource();
            entity.setId(id);
            entity.setTeacherId(teacher.getId());
            entity.setTitle((String) payload.getOrDefault("title", "未命名"));
            entity.setDescription((String) payload.getOrDefault("description", ""));
            entity.setFileUrl((String) payload.getOrDefault("fileUrl", ""));
            entity.setCoverUrl((String) payload.getOrDefault("coverUrl", ""));
            entity.setPrice(new java.math.BigDecimal(String.valueOf(payload.getOrDefault("price", "0.00"))));
            try {
                Object sizeObj = payload.get("fileSize");
                if (sizeObj != null) entity.setFileSize(Long.valueOf(String.valueOf(sizeObj)));
            } catch (Exception ignore) {}
            entity.setType((String) payload.getOrDefault("type", "material"));
            teacherResourceMapper.update(entity);
            return Result.success("更新成功", null);
        } catch (Exception e) {
            log.error("更新教师资源失败", e);
            return Result.error("更新失败");
        }
    }

    @Override
    public Result<Object> detail(Long id) {
        try {
            var entity = teacherResourceMapper.findById(id);
            if (entity == null) return Result.notFound("资源不存在");
            return Result.success(entity);
        } catch (Exception e) {
            log.error("查询资源详情失败", e);
            return Result.error("查询失败");
        }
    }

    @Override
    public Result<Object> delete(Long id) {
        try {
            String phone = getCurrentPhone();
            var teacher = teacherMapper.findByPhone(phone);
            if (teacher == null) return Result.error("教师不存在");
            int rows = teacherResourceMapper.deleteByIdAndTeacher(id, teacher.getId());
            if (rows > 0) return Result.success("删除成功", null);
            return Result.notFound("资源不存在或无权限删除");
        } catch (Exception e) {
            log.error("删除资源失败", e);
            return Result.error("删除失败");
        }
    }
}


