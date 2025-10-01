package com.education.admin.modules.miniprogram.service.impl;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.entity.EmploymentApplication;
import com.education.admin.modules.miniprogram.mapper.EmploymentApplicationMapper;
import com.education.admin.modules.miniprogram.service.EmploymentApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.education.admin.modules.miniprogram.mapper.EmploymentPostMapper;
import com.education.admin.modules.teacher.mapper.TeacherMapper;
import java.util.*;

@Service
@RequiredArgsConstructor
public class EmploymentApplicationServiceImpl implements EmploymentApplicationService {

    private final EmploymentApplicationMapper applicationMapper;
    private final EmploymentPostMapper postMapper;
    private final TeacherMapper teacherMapper;

    @Override
    public Result<Void> apply(Long postId, Long teacherId, String resumeUrl, String resumeName, Long resumeSize) {
        EmploymentApplication app = new EmploymentApplication();
        app.setPostId(postId);
        app.setTeacherId(teacherId);
        app.setResumeUrl(resumeUrl);
        app.setResumeName(resumeName);
        app.setResumeSize(resumeSize);
        applicationMapper.insert(app);
        return Result.success();
    }

    @Override
    public PageInfo<Map<String, Object>> adminList(Integer page, Integer size, Long postId, Long teacherId) {
        PageHelper.startPage(page, size);
        List<EmploymentApplication> list = applicationMapper.listAll();
        List<Map<String, Object>> mapped = new ArrayList<>();
        for (EmploymentApplication a : list) {
            if (postId != null && !postId.equals(a.getPostId())) continue;
            if (teacherId != null && !teacherId.equals(a.getTeacherId())) continue;
            Map<String, Object> m = new HashMap<>();
            m.put("id", a.getId());
            m.put("postId", a.getPostId());
            m.put("teacherId", a.getTeacherId());
            m.put("resumeUrl", a.getResumeUrl());
            m.put("resumeName", a.getResumeName());
            m.put("resumeSize", a.getResumeSize());
            m.put("createTime", a.getCreateTime());
            // 关联合并简要信息
            if (postMapper != null) {
                com.education.admin.modules.miniprogram.entity.EmploymentPost p = postMapper.findById(a.getPostId());
                if (p != null) { m.put("postTitle", p.getTitle()); }
            }
            if (teacherMapper != null && a.getTeacherId() != null) {
                com.education.admin.modules.teacher.entity.Teacher t = teacherMapper.findById(a.getTeacherId());
                if (t != null) {
                    m.put("teacherName", t.getTeacherName());
                    m.put("teacherPhone", t.getPhone());
                    m.put("teacherAvatar", t.getAvatar());
                }
            }
            mapped.add(m);
        }
        return new PageInfo<>(mapped);
    }
}


