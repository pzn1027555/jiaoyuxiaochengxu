package com.education.admin.modules.teacher.service.impl;

import com.education.admin.modules.teacher.entity.Teacher;
import com.education.admin.modules.teacher.mapper.TeacherMapper;
import com.education.admin.modules.teacher.service.TeacherService;
import com.github.pagehelper.PageHelper;
import com.education.admin.modules.system.entity.TeacherLevelConfig;
import com.education.admin.modules.system.service.TeacherLevelConfigService;
import com.github.pagehelper.PageInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 教师服务实现
 */
@Service
@RequiredArgsConstructor
public class TeacherServiceImpl implements TeacherService {
    
    private final TeacherMapper teacherMapper;
    private final TeacherLevelConfigService levelConfigService;
    
    @Override
    public PageInfo<Teacher> getTeacherList(int pageNum, int pageSize, String name, Integer status, Integer risk) {
        PageHelper.startPage(pageNum, pageSize);
        List<Teacher> teachers = teacherMapper.findByPage(
            name,
            status,
            risk,
            null,   // subjectId（管理端列表此处不筛选）
            null,   // province
            null,   // city
            null,   // district
            null,   // teacherLevel
            null    // teachMode
        );

        // 将课时费按照教师等级映射为配置金额（如配置存在则覆盖）
        try {
            List<TeacherLevelConfig> configs = levelConfigService.listAll();
            if (configs != null && !configs.isEmpty()) {
                java.util.Map<String, java.math.BigDecimal> levelToRate = new java.util.HashMap<>();
                for (TeacherLevelConfig c : configs) {
                    if (c.getIsEnabled() != null && c.getIsEnabled() == 1) {
                        levelToRate.put(c.getLevelKey(), c.getHourlyRate());
                    }
                }
                for (Teacher t : teachers) {
                    if (t.getTeacherLevel() != null && levelToRate.containsKey(t.getTeacherLevel())) {
                        t.setHourlyRate(levelToRate.get(t.getTeacherLevel()));
                    }
                }
            }
        } catch (Exception ignored) {}

        return new PageInfo<>(teachers);
    }
    
    @Override
    public Teacher getTeacherById(Long id) {
        Teacher teacher = teacherMapper.findById(id);
        if (teacher != null && teacher.getSubjectsMap() != null && !teacher.getSubjectsMap().isEmpty()) {
            teacher.setSubjects(teacher.getSubjectsMap().keySet().stream()
                .map(k -> {
                    try { return Long.valueOf(k); } catch (NumberFormatException e) { return null; }
                })
                .filter(java.util.Objects::nonNull)
                .collect(java.util.stream.Collectors.toList()));
            if (teacher.getSubjectsNameList() == null || teacher.getSubjectsNameList().isEmpty()) {
                teacher.setSubjectsNameList(new java.util.ArrayList<>(teacher.getSubjectsMap().values()));
            }
        }
        return teacher;
    }
    
    @Override
    public Teacher createTeacher(Teacher teacher) {
        teacher.setCreateTime(LocalDateTime.now());
        teacher.setUpdateTime(LocalDateTime.now());
        teacher.setAuditStatus(0); // 默认待审核状态
        
        teacherMapper.insert(teacher);
        return teacher;
    }
    
    @Override
    public Teacher updateTeacher(Teacher teacher) {
        teacher.setUpdateTime(LocalDateTime.now());
        teacherMapper.update(teacher);
        return teacher;
    }

    @Override
    public void updateTeacherLevelOnly(Long teacherId, String level) {
        com.education.admin.modules.teacher.entity.Teacher t = new com.education.admin.modules.teacher.entity.Teacher();
        t.setId(teacherId);
        t.setTeacherLevel(level);
        t.setUpdateTime(LocalDateTime.now());
        teacherMapper.update(t);
    }
    
    @Override
    public boolean auditTeacher(Long id, Integer status, String auditReason, Long auditUserId) {
        int result = teacherMapper.updateAuditStatus(id, status, auditReason, auditUserId);
        return result > 0;
    }
    
    @Override
    public boolean deleteTeacher(Long id) {
        int result = teacherMapper.deleteById(id);
        return result > 0;
    }

    @Override
    public boolean increaseCheckCount(Long id) {
        int result = teacherMapper.increaseCheckCount(id);
        return result > 0;
    }

    @Override
    public boolean markContractSent(Long teacherId, String contractUrl) {
        int updated = teacherMapper.markContractSent(teacherId, contractUrl);
        return updated > 0;
    }

    @Override
    public boolean toggleHidden(Long teacherId) {
        return teacherMapper.toggleHidden(teacherId) > 0;
    }

    @Override
    public boolean toggleRecommend(Long teacherId) {
        return teacherMapper.toggleRecommend(teacherId) > 0;
    }
}