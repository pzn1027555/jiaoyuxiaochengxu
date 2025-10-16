package com.education.admin.modules.miniprogram.service.impl;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.MiniSearchService;
import com.education.admin.modules.teacher.entity.Teacher;
import com.education.admin.modules.teacher.mapper.TeacherMapper;
import com.github.pagehelper.PageHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class MiniSearchServiceImpl implements MiniSearchService {

    private final TeacherMapper teacherMapper;
    private final com.education.admin.modules.course.mapper.CourseCategoryMapper courseCategoryMapper;

    @Override
    public Result<Object> searchTeachers(String keyword, Integer page, Integer size, Long subjectId, String province, String city, String district, String teacherLevel, String teachMode) {
        try{
            int pageNum = page == null || page < 1 ? 1 : page;
            int pageSize = size == null || size < 1 ? 10 : size;
            // 支持按一级科目联动二级 + 地区筛选 + 教师级别筛选 + 线上/线下筛选
            PageHelper.startPage(pageNum, pageSize);
            List<Teacher> list = teacherMapper.findByPage(keyword, null, null, subjectId, province, city, district, teacherLevel, teachMode);
            int total = teacherMapper.countTotal(keyword, null, null, subjectId, province, city, district, teacherLevel, teachMode);
            Map<String,Object> resp = new HashMap<>();
            resp.put("page", pageNum);
            resp.put("size", pageSize);
            resp.put("total", total);
            resp.put("items", list);
            return Result.success(resp);
        }catch(Exception e){
            log.error("搜索教师失败", e);
            return Result.error("搜索失败");
        }
    }
}


