package com.education.admin.modules.miniprogram.service.impl;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.mapper.MiniFavoriteMapper;
import com.education.admin.modules.miniprogram.service.MiniStudentFavoriteService;
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

/**
 * 学生收藏服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MiniStudentFavoriteServiceImpl implements MiniStudentFavoriteService {

    private final MiniFavoriteMapper miniFavoriteMapper;
    private final StudentMapper studentMapper;

    @Override
    public Result<Map<String, Object>> getFavoriteTeachers(Integer pageNum, Integer pageSize) {
        try {
            // 获取当前学生ID
            Long studentId = getCurrentStudentId();
            log.info("获取到的学生ID: {}", studentId);
            if (studentId == null) {
                log.warn("学生ID为空，可能未登录或获取失败");
                return Result.error("请先登录");
            }

            // 设置默认值
            if (pageNum == null || pageNum <= 0) pageNum = 1;
            if (pageSize == null || pageSize <= 0) pageSize = 10;

            // 计算offset
            int offset = (pageNum - 1) * pageSize;
            
            // 查询收藏的教师列表
            List<Map<String, Object>> teachers = miniFavoriteMapper.getFavoriteTeachers(studentId, pageSize, offset);
            
            // 处理教师标签与科目显示
            for (Map<String, Object> teacher : teachers) {
                // 处理 subjects 映射
                Object subjectsObj = teacher.get("subjects");
                if (subjectsObj instanceof java.util.Map) {
                    teacher.put("subjectsMap", subjectsObj);
                }

                // 处理教师标签数据
                String teacherTags = (String) teacher.get("teacherTags");
                if (teacherTags != null && !teacherTags.isEmpty()) {
                    try {
                        if (teacherTags.startsWith("[") && teacherTags.endsWith("]")) {
                            String[] tagsArray = teacherTags.substring(1, teacherTags.length() - 1)
                                                           .replace("\"", "")
                                                           .split(",");
                            java.util.List<String> tagsList = new java.util.ArrayList<>();
                            for (String tag : tagsArray) {
                                if (!tag.trim().isEmpty()) {
                                    tagsList.add(tag.trim());
                                }
                            }
                            teacher.put("tags", tagsList);
                        } else {
                            teacher.put("tags", new java.util.ArrayList<>());
                        }
                    } catch (Exception e) {
                        teacher.put("tags", new java.util.ArrayList<>());
                    }
                } else {
                    teacher.put("tags", new java.util.ArrayList<>());
                }
            }

            // 统计总数
            int total = miniFavoriteMapper.countFavoriteTeachers(studentId);

            Map<String, Object> result = new HashMap<>();
            result.put("list", teachers);
            result.put("total", total);
            result.put("pageNum", pageNum);
            result.put("pageSize", pageSize);
            result.put("pages", (total + pageSize - 1) / pageSize);

            return Result.success(result);

        } catch (Exception e) {
            log.error("获取收藏教师列表失败", e);
            return Result.error("获取收藏教师列表失败");
        }
    }

    @Override
    public Result<Map<String, Object>> getLikedPosts(Integer pageNum, Integer pageSize) {
        try {
            // 获取当前学生ID
            Long studentId = getCurrentStudentId();
            if (studentId == null) {
                return Result.error("请先登录");
            }

            // 设置默认值
            if (pageNum == null || pageNum <= 0) pageNum = 1;
            if (pageSize == null || pageSize <= 0) pageSize = 10;

            // 计算offset
            int offset = (pageNum - 1) * pageSize;
            
            // 查询点赞的帖子列表
            List<Map<String, Object>> posts = miniFavoriteMapper.getLikedPosts(studentId, pageSize, offset);

            // 处理媒体数据
            for (Map<String, Object> post : posts) {
                String images = (String) post.get("images");
                if (images != null && !images.isEmpty() && !images.equals("null")) {
                    // 简单处理images字段
                    try {
                        // 如果是JSON数组格式，转换为List
                        if (images.startsWith("[") && images.endsWith("]")) {
                            String[] imageArray = images.substring(1, images.length() - 1)
                                                       .replace("\"", "")
                                                       .split(",");
                            if (imageArray.length > 0 && !imageArray[0].trim().isEmpty()) {
                                post.put("hasImages", true);
                                post.put("imageCount", imageArray.length);
                            } else {
                                post.put("hasImages", false);
                                post.put("imageCount", 0);
                            }
                        } else {
                            post.put("hasImages", false);
                            post.put("imageCount", 0);
                        }
                    } catch (Exception e) {
                        post.put("hasImages", false);
                        post.put("imageCount", 0);
                    }
                } else {
                    post.put("hasImages", false);
                    post.put("imageCount", 0);
                }
            }

            // 统计总数
            int total = miniFavoriteMapper.countLikedPosts(studentId);

            Map<String, Object> result = new HashMap<>();
            result.put("list", posts);
            result.put("total", total);
            result.put("pageNum", pageNum);
            result.put("pageSize", pageSize);
            result.put("pages", (total + pageSize - 1) / pageSize);

            return Result.success(result);

        } catch (Exception e) {
            log.error("获取点赞帖子列表失败", e);
            return Result.error("获取点赞帖子列表失败");
        }
    }

    /**
     * 从请求头获取当前学生ID
     */
    private Long getCurrentStudentId() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String phone = request.getHeader("X-User-Phone");
                log.info("从请求头获取用户手机号: {}", phone);
                
                if (phone != null && !phone.isEmpty()) {
                    Student student = studentMapper.findByPhone(phone);
                    log.info("通过手机号{}查询到的学生: {}", phone, student != null ? student.getId() + "(" + student.getStudentName() + ")" : "null");
                    if (student != null) {
                        return student.getId();
                    }
                } else {
                    log.warn("请求头中没有X-User-Phone或为空");
                }
            } else {
                log.warn("RequestAttributes为空");
            }
            return null;
        } catch (Exception e) {
            log.error("获取当前学生ID失败", e);
            return null;
        }
    }
}
