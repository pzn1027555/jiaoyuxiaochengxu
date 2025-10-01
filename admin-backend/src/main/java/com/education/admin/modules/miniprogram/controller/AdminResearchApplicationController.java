package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin/research-application")
@RequiredArgsConstructor
public class AdminResearchApplicationController {

    private final com.education.admin.modules.miniprogram.mapper.ResearchApplicationMapper applicationMapper;
    private final com.education.admin.modules.miniprogram.mapper.ResearchPostMapper postMapper;
    private final com.education.admin.modules.teacher.mapper.TeacherMapper teacherMapper;

    @GetMapping("/list")
    public Result<PageInfo<Map<String, Object>>> list(@RequestParam(defaultValue = "1") Integer page,
                                                      @RequestParam(defaultValue = "10") Integer size,
                                                      @RequestParam(required = false) Long postId,
                                                      @RequestParam(required = false) Long teacherId) {
        PageHelper.startPage(page, size);
        java.util.List<com.education.admin.modules.miniprogram.entity.ResearchApplication> list = applicationMapper.listAll();
        List<Map<String, Object>> mapped = new ArrayList<>();
        for (com.education.admin.modules.miniprogram.entity.ResearchApplication a : list) {
            if (postId != null && !postId.equals(a.getPostId())) continue;
            if (teacherId != null && !teacherId.equals(a.getTeacherId())) continue;
            Map<String, Object> m = new HashMap<>();
            m.put("id", a.getId());
            m.put("postId", a.getPostId());
            m.put("teacherId", a.getTeacherId());
            m.put("createTime", a.getCreateTime());
            com.education.admin.modules.miniprogram.entity.ResearchPost p = postMapper.findById(a.getPostId());
            if (p != null) m.put("postTitle", p.getTitle());
            if (a.getTeacherId() != null) {
                com.education.admin.modules.teacher.entity.Teacher t = teacherMapper.findById(a.getTeacherId());
                if (t != null) {
                    m.put("teacherName", t.getTeacherName());
                    m.put("teacherPhone", t.getPhone());
                }
            }
            mapped.add(m);
        }
        return Result.success(new PageInfo<>(mapped));
    }
}


