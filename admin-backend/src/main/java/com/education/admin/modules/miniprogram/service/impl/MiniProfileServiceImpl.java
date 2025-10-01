package com.education.admin.modules.miniprogram.service.impl;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.MiniProfileService;
import com.education.admin.modules.miniprogram.dto.UserProfileRequest;
import com.education.admin.modules.miniprogram.dto.TeacherStudentResponse;
import com.education.admin.modules.miniprogram.dto.SubjectCategoryResponse;
import com.education.admin.modules.teacher.entity.Teacher;
import com.education.admin.modules.teacher.mapper.TeacherMapper;
import com.education.admin.modules.parent.entity.Parent;
import com.education.admin.modules.parent.mapper.ParentMapper;
import com.education.admin.modules.student.entity.Student;
import com.education.admin.modules.student.mapper.StudentMapper;
import com.education.admin.modules.course.mapper.CourseCategoryMapper;
import com.education.admin.modules.course.entity.CourseCategory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import java.time.LocalDateTime;

/**
 * 小程序用户资料服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MiniProfileServiceImpl implements MiniProfileService {

    private final TeacherMapper teacherMapper;
    private final ParentMapper parentMapper;
    private final StudentMapper studentMapper;
    private final CourseCategoryMapper courseCategoryMapper;
    // 学生余额功能已移除
    private final com.education.admin.modules.miniprogram.mapper.MiniFavoriteMapper favoriteMapper;
    private final com.education.admin.modules.miniprogram.mapper.TeacherScheduleMapper teacherScheduleMapper;

    /**
     * 将 subjects 字段（可能为 List<Long>/List<Integer>/List<String>）转换为 [{id, name}] 列表
     */
    private java.util.List<java.util.Map<String,Object>> buildSubjectItems(java.util.List<?> subjectIdsRaw){
        java.util.List<java.util.Map<String,Object>> items = new java.util.ArrayList<>();
        if (subjectIdsRaw == null) return items;
        try{
            // 预先构建 id -> name 映射（通过 CourseCategoryMapper 查询）
            java.util.List<com.education.admin.modules.course.entity.CourseCategory> all = courseCategoryMapper.findAllEnabledCategories();
            java.util.Map<String,String> nameMap = new java.util.HashMap<>();
            for (com.education.admin.modules.course.entity.CourseCategory c : all){
                if (c.getLevel()!=null && c.getLevel()==2){
                    nameMap.put(String.valueOf(c.getId()), c.getCategoryName());
                }
            }
            for(Object sid : subjectIdsRaw){
                if (sid == null) continue;
                String key = String.valueOf(sid);
                String name = nameMap.getOrDefault(key, key);
                java.util.Map<String,Object> m = new java.util.HashMap<>();
                try{ m.put("id", Long.valueOf(key)); }catch(Exception e){ m.put("id", key); }
                m.put("name", name);
                items.add(m);
            }
        }catch(Exception ignore){}
        return items;
    }

    @Override
    public Result<Object> getUserProfile() {
        try {
            String phone = getCurrentUserPhone();
            
            // 检查用户角色并获取相应资料
            Teacher teacher = teacherMapper.findByPhone(phone);
            if (teacher != null) {
                return Result.success(buildTeacherProfile(teacher));
            }
            
            Parent parent = parentMapper.findByPhone(phone);
            if (parent != null) {
                return Result.success(buildParentProfile(parent));
            }
            
            Student student = studentMapper.findByPhone(phone);
            if (student != null) {
                return Result.success(buildStudentProfile(student));
            }
            
            return Result.error("用户信息不存在");
            
        } catch (Exception e) {
            log.error("获取用户资料失败", e);
            return Result.error("获取用户资料失败");
        }
    }

    @Override
    public Result<Object> getStudentProfile() {
        try {
            String phone = getCurrentUserPhone();
            Student student = studentMapper.findByPhone(phone);
            if (student != null) {
                return Result.success(buildStudentProfile(student));
            }
            return Result.error("学生信息不存在");
        } catch (Exception e) {
            log.error("获取学生资料失败", e);
            return Result.error("获取学生资料失败");
        }
    }

    @Override
    public Result<Object> getParentProfile() {
        try {
            String phone = getCurrentUserPhone();
            Parent parent = parentMapper.findByPhone(phone);
            if (parent != null) {
                return Result.success(buildParentProfile(parent));
            }
            return Result.error("家长信息不存在");
        } catch (Exception e) {
            log.error("获取家长资料失败", e);
            return Result.error("获取家长资料失败");
        }
    }

    // getStudentBalance 已移除

    @Override
    public Result<Integer> getStudentFollowedTeachersCount() {
        try {
            String phone = getCurrentUserPhone();
            Student student = studentMapper.findByPhone(phone);
            if (student == null) return Result.error("学生信息不存在");
            int cnt = favoriteMapper.countByStudentId(student.getId());
            return Result.success(cnt);
        } catch (Exception e) {
            log.error("统计关注老师数量失败", e);
            return Result.error("统计失败");
        }
    }

    @Override
    public Result<Integer> getStudentCourseCount() {
        try {
            String phone = getCurrentUserPhone();
            Student student = studentMapper.findByPhone(phone);
            if (student == null) return Result.error("学生信息不存在");
            int cnt = teacherScheduleMapper.countCoursesByStudent(student.getId());
            return Result.success(cnt);
        } catch (Exception e) {
            log.error("统计课程数量失败", e);
            return Result.error("统计失败");
        }
    }

    @Override
    @Transactional
    public Result<Object> updateUserProfile(UserProfileRequest request) {
        try {
            String phone = getCurrentUserPhone();
            
            // 检查用户角色并更新相应资料
            Teacher teacher = teacherMapper.findByPhone(phone);
            if (teacher != null) {
                return updateTeacherProfile(teacher, request);
            }
            
            Parent parent = parentMapper.findByPhone(phone);
            if (parent != null) {
                return updateParentProfile(parent, request);
            }
            
            Student student = studentMapper.findByPhone(phone);
            if (student != null) {
                return updateStudentProfile(student, request);
            }
            
            return Result.error("用户信息不存在");
            
        } catch (Exception e) {
            log.error("更新用户资料失败", e);
            return Result.error("更新用户资料失败");
        }
    }

    /**
     * 构建教师资料信息
     */
    private Map<String, Object> buildTeacherProfile(Teacher teacher) {
        Map<String, Object> profile = new HashMap<>();
        profile.put("role", "teacher");
        profile.put("id", teacher.getId());
        profile.put("name", teacher.getTeacherName());
        profile.put("phone", teacher.getPhone());
        profile.put("avatar", teacher.getAvatar());
        profile.put("gender", teacher.getGender());
        profile.put("province", teacher.getProvince());
        profile.put("city", teacher.getCity());
        profile.put("district", teacher.getDistrict());
        profile.put("address", teacher.getAddress());
        profile.put("introduction", teacher.getIntroduction());
        // subjects 返回 [{id, name}]，同时保留 subjectIds 兼容历史
        java.util.List<?> subjectIdsRaw = teacher.getSubjects();
        profile.put("subjectIds", subjectIdsRaw);
        profile.put("subjects", buildSubjectItems(subjectIdsRaw));
        // 同时返回科目中文名（由 TeacherMapper.findByPhone 联表 JSON_OBJECTAGG 填充）
        profile.put("subjectsNameList", teacher.getSubjectsNameList());
        profile.put("subjectsMap", teacher.getSubjectsMap());
        profile.put("teacherTags", teacher.getTeacherTags());
        // 基本表不再存教育信息，改用认证表派生字段
        profile.put("education", teacher.getCertEducation());
        profile.put("major", teacher.getCertMajor());
        profile.put("graduationSchool", teacher.getCertGraduateSchool());
        profile.put("teachingExperience", teacher.getTeachingExperience());
        return profile;
    }

    /**
     * 构建家长资料信息
     */
    private Map<String, Object> buildParentProfile(Parent parent) {
        Map<String, Object> profile = new HashMap<>();
        profile.put("role", "parent");
        profile.put("id", parent.getId());
        profile.put("name", parent.getParentName());
        profile.put("phone", parent.getPhone());
        profile.put("avatar", parent.getAvatar());
        profile.put("gender", parent.getGender());
        profile.put("province", parent.getProvince());
        profile.put("city", parent.getCity());
        profile.put("district", parent.getDistrict());
        profile.put("address", parent.getAddress());
        profile.put("occupation", parent.getOccupation());
        profile.put("emergencyContact", parent.getEmergencyContact());
        profile.put("emergencyPhone", parent.getEmergencyPhone());
        profile.put("introduction", parent.getIntroduction());
        profile.put("parentTags", parent.getParentTags());
        return profile;
    }

    /**
     * 构建学生资料信息
     */
    private Map<String, Object> buildStudentProfile(Student student) {
        Map<String, Object> profile = new HashMap<>();
        profile.put("role", "student");
        profile.put("id", student.getId());
        profile.put("name", student.getStudentName());
        profile.put("phone", student.getPhone());
        profile.put("avatar", student.getAvatar());
        profile.put("gender", student.getGender());
        // 返回出生日期供前端回显
        profile.put("birthDate", student.getBirthDate());
        profile.put("province", student.getProvince());
        profile.put("city", student.getCity());
        profile.put("district", student.getDistrict());
        profile.put("address", student.getAddress());
        profile.put("grade", student.getGrade());
        profile.put("school", student.getSchool());
        // 家长姓名/电话改由家长绑定关系获取，这里先不返回，前端如需可调用家长关系接口
        profile.put("introduction", student.getIntroduction());
        profile.put("studentTags", student.getStudentTags());
        // subjects 返回 [{id, name}]，同时保留 subjectIds 兼容历史
        java.util.List<?> subjectIdsRaw = student.getSubjects();
        profile.put("subjectIds", subjectIdsRaw);
        profile.put("subjects", buildSubjectItems(subjectIdsRaw));
        return profile;
    }

    /**
     * 更新教师资料
     */
    private Result<Object> updateTeacherProfile(Teacher teacher, UserProfileRequest request) {
        // 更新基本信息
        teacher.setTeacherName(request.getName());
        teacher.setAvatar(request.getAvatar());
        teacher.setGender(request.getGender());
        teacher.setProvince(request.getProvince());
        teacher.setCity(request.getCity());
        teacher.setDistrict(request.getDistrict());
        teacher.setAddress(request.getAddress());
        teacher.setPhone(request.getPhone());
        teacher.setIntroduction(request.getIntroduction());
        
        // 更新教师特有信息
        if (request.getSubjects() != null) {
            teacher.setSubjects(request.getSubjects());
        }
        if (request.getTeacherTags() != null) {
            teacher.setTeacherTags(request.getTeacherTags());
        }
        // 教育信息由认证表维护，这里不再写入 teacher_info
        teacher.setTeachingExperience(request.getTeachingExperience());
        
        teacher.setUpdateTime(LocalDateTime.now());
        
        teacherMapper.update(teacher);
        log.info("教师资料更新成功: {}", teacher.getPhone());
        
        return Result.success("资料更新成功");
    }

    /**
     * 更新家长资料
     */
    private Result<Object> updateParentProfile(Parent parent, UserProfileRequest request) {
        // 更新基本信息
        parent.setParentName(request.getName());
        parent.setAvatar(request.getAvatar());
        parent.setGender(request.getGender());
        parent.setProvince(request.getProvince());
        parent.setCity(request.getCity());
        parent.setDistrict(request.getDistrict());
        parent.setAddress(request.getAddress());
        parent.setPhone(request.getPhone());
        
        // 更新家长特有信息
        parent.setOccupation(request.getOccupation());
        parent.setEmergencyContact(request.getEmergencyContact());
        parent.setEmergencyPhone(request.getEmergencyPhone());
        parent.setIntroduction(request.getIntroduction());
        if (request.getParentTags() != null) {
            parent.setParentTags(request.getParentTags());
        }
        
        parent.setUpdateTime(LocalDateTime.now());
        
        parentMapper.update(parent);
        log.info("家长资料更新成功: {}", parent.getPhone());
        
        return Result.success("资料更新成功");
    }

    /**
     * 更新学生资料
     */
    private Result<Object> updateStudentProfile(Student student, UserProfileRequest request) {
        // 更新基本信息
        student.setStudentName(request.getName());
        student.setAvatar(request.getAvatar());
        student.setGender(request.getGender());
        // 出生日期
        try{
            if (request.getBirthDate() != null && !request.getBirthDate().isEmpty()) {
                student.setBirthDate(java.time.LocalDate.parse(request.getBirthDate()));
            }
        }catch(Exception ignored){}
        student.setProvince(request.getProvince());
        student.setCity(request.getCity());
        student.setDistrict(request.getDistrict());
        student.setAddress(request.getAddress());
        student.setPhone(request.getPhone());
        
        // 更新学生特有信息
        student.setGrade(request.getGrade());
        student.setSchool(request.getSchool());
        student.setParentName(request.getParentName());
        student.setParentPhone(request.getParentPhone());
        student.setIntroduction(request.getIntroduction());
        if (request.getStudentTags() != null) {
            student.setStudentTags(request.getStudentTags());
        }
        if (request.getSubjects() != null) {
            java.util.List<String> subjectNames = request.getSubjects().stream()
                .map(String::valueOf)
                .collect(java.util.stream.Collectors.toList());
            student.setSubjects(subjectNames);
        }
        
        student.setUpdateTime(LocalDateTime.now());
        
        studentMapper.update(student);
        log.info("学生资料更新成功: {}", student.getPhone());
        
        return Result.success("资料更新成功");
    }

    /**
     * 获取当前用户手机号（不依赖JWT）
     * 优先从请求参数/请求头中读取：phone 或 X-User-Phone；若无则使用开发环境测试账号
     */
    private String getCurrentUserPhone() {
        try {
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            // 1) URL 查询参数 ?phone=xxx
            String phone = request.getParameter("phone");
            if (phone != null && !phone.isEmpty()) {
                log.debug("从请求参数获取用户手机号: {}", phone);
                return phone;
            }
            // 2) 自定义请求头 X-User-Phone: xxx
            String headerPhone = request.getHeader("X-User-Phone");
            if (headerPhone != null && !headerPhone.isEmpty()) {
                log.debug("从请求头获取用户手机号: {}", headerPhone);
                return headerPhone;
            }
            // 3) 开发环境默认账号（便于联调）
            log.warn("请求未提供手机号，使用开发测试账号");
            return "18071403141";
        } catch (Exception e) {
            log.warn("获取当前用户手机号失败，使用开发测试账号: {}", e.getMessage());
            return "18071403141";
        }
    }

    @Override
    public Result<TeacherStudentResponse> getTeacherStudents() {
        try {
            String phone = getCurrentUserPhone();
            
            // 获取当前教师信息
            Teacher teacher = teacherMapper.findByPhone(phone);
            if (teacher == null) {
                return Result.error("教师信息不存在");
            }
            
            // 创建响应对象
            TeacherStudentResponse response = new TeacherStudentResponse();
            
            // 模拟学生数据（基于设计图内容）
            List<TeacherStudentResponse.StudentInfo> students = createMockStudentData();
            
            // 设置统计信息
            TeacherStudentResponse.Statistics statistics = new TeacherStudentResponse.Statistics();
            statistics.setTotalStudents(students.size());
            statistics.setMonthlyHours(230);
            statistics.setActiveStudents((int) students.stream().filter(s -> s.getStatus() == 1).count());
            
            response.setStudents(students);
            response.setStatistics(statistics);
            
            return Result.success(response);
            
        } catch (Exception e) {
            log.error("获取教师学生列表失败", e);
            return Result.error("获取学生列表失败");
        }
    }
    
    /**
     * 创建模拟学生数据（根据设计图）
     */
    private List<TeacherStudentResponse.StudentInfo> createMockStudentData() {
        List<TeacherStudentResponse.StudentInfo> students = new ArrayList<>();
        
        // 根据设计图创建学生数据
        String[] studentNames = {"吕晶莹", "傅宜豪", "花泽远", "葛欣源", "柏若萌", "张晚庆", "平雪瑶", "柳赛", "许美欣", "平润莎"};
        String[] subjects = {"IB数学", "AL数学", "AL数学", "AL数学", "AL数学", "AL数学", "AL数学", "AL数学", "AL数学", "AL数学"};
        String[] grades = {"高三", "高三", "高三", "高三", "高三", "高三", "高三", "高三", "高三", "高三"};
        String[] avatars = {
            "https://via.placeholder.com/100/FFB6C1/FFFFFF?text=吕",
            "https://via.placeholder.com/100/87CEEB/FFFFFF?text=傅", 
            "https://via.placeholder.com/100/DDA0DD/FFFFFF?text=花",
            "https://via.placeholder.com/100/F0E68C/FFFFFF?text=葛",
            "https://via.placeholder.com/100/98FB98/FFFFFF?text=柏",
            "https://via.placeholder.com/100/FFE4E1/FFFFFF?text=张",
            "https://via.placeholder.com/100/F5DEB3/FFFFFF?text=平",
            "https://via.placeholder.com/100/E0E0E0/FFFFFF?text=柳",
            "https://via.placeholder.com/100/FAFAD2/FFFFFF?text=许",
            "https://via.placeholder.com/100/D3D3D3/FFFFFF?text=平"
        };
        
        for (int i = 0; i < studentNames.length; i++) {
            TeacherStudentResponse.StudentInfo student = new TeacherStudentResponse.StudentInfo();
            student.setStudentId((long) (i + 1));
            student.setStudentName(studentNames[i]);
            student.setAvatar(avatars[i]);
            student.setGender(i % 2 == 0 ? 2 : 1); // 交替设置性别
            student.setGrade(grades[i]);
            student.setPhone("1390000100" + (i + 1));
            student.setStatus(1); // 在读状态
            
            // 创建课程进度
            List<TeacherStudentResponse.CourseProgress> courses = new ArrayList<>();
            TeacherStudentResponse.CourseProgress course = new TeacherStudentResponse.CourseProgress();
            course.setCourseId((long) (i + 1));
            course.setCourseName(subjects[i] + "基础课程");
            course.setSubject(subjects[i]);
            course.setCourseType("one_to_one");
            course.setTotalLessons(72);
            course.setCompletedLessons(6);
            course.setRemainingLessons(66);
            course.setCurrentChapter("第三章");
            course.setProgress("第三章已学完 第6课/72课");
            
            courses.add(course);
            student.setCourses(courses);
            
            students.add(student);
        }
        
        return students;
    }
    
    @Override
    public Result<SubjectCategoryResponse> getSubjectCategories() {
        try {
            // 获取所有启用的分类
            List<CourseCategory> allCategories = courseCategoryMapper.findAllEnabledCategories();
            
            // 构建两级结构
            SubjectCategoryResponse response = new SubjectCategoryResponse();
            List<SubjectCategoryResponse.CategoryLevel1> level1Categories = new ArrayList<>();

            // 先收集所有一级分类，确保父级在处理子级前已存在
            Map<Long, SubjectCategoryResponse.CategoryLevel1> level1Map = new LinkedHashMap<>();
            for (CourseCategory category : allCategories) {
                Integer level = category.getLevel();
                if (level != null && level == 1) {
                    SubjectCategoryResponse.CategoryLevel1 level1 = new SubjectCategoryResponse.CategoryLevel1();
                    level1.setId(category.getId());
                    level1.setCategoryName(category.getCategoryName());
                    level1.setCategoryCode(category.getCategoryCode());
                    level1.setDescription(category.getDescription());
                    level1.setSortOrder(category.getSortOrder());
                    level1.setChildren(new ArrayList<>());

                    level1Map.put(category.getId(), level1);
                    level1Categories.add(level1);
                }
            }

            // 再挂载所有二级分类
            for (CourseCategory category : allCategories) {
                Integer level = category.getLevel();
                if (level != null && level == 2) {
                    SubjectCategoryResponse.CategoryLevel2 level2 = new SubjectCategoryResponse.CategoryLevel2();
                    level2.setId(category.getId());
                    level2.setParentId(category.getParentId());
                    level2.setCategoryName(category.getCategoryName());
                    level2.setCategoryCode(category.getCategoryCode());
                    level2.setDescription(category.getDescription());
                    level2.setSortOrder(category.getSortOrder());

                    SubjectCategoryResponse.CategoryLevel1 parent = level1Map.get(category.getParentId());
                    if (parent != null) {
                        parent.getChildren().add(level2);
                    } else {
                        log.warn("未找到二级分类的父级，categoryId={}, parentId={}", category.getId(), category.getParentId());
                    }
                }
            }
            
            // 按排序字段排序
            level1Categories.sort((a, b) -> {
                int orderCompare = Integer.compare(
                    a.getSortOrder() != null ? a.getSortOrder() : 999,
                    b.getSortOrder() != null ? b.getSortOrder() : 999
                );
                return orderCompare != 0 ? orderCompare : a.getId().compareTo(b.getId());
            });
            
            // 对每个一级分类的子分类也进行排序
            for (SubjectCategoryResponse.CategoryLevel1 level1 : level1Categories) {
                level1.getChildren().sort((a, b) -> {
                    int orderCompare = Integer.compare(
                        a.getSortOrder() != null ? a.getSortOrder() : 999,
                        b.getSortOrder() != null ? b.getSortOrder() : 999
                    );
                    return orderCompare != 0 ? orderCompare : a.getId().compareTo(b.getId());
                });
            }
            
            response.setCategories(level1Categories);
            return Result.success(response);
            
        } catch (Exception e) {
            log.error("获取科目分类列表失败", e);
            return Result.error("获取科目分类列表失败");
        }
    }
}
