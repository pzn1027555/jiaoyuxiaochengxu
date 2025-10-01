package com.education.admin.modules.miniprogram.service.impl;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.MiniSearchService;
import com.education.admin.modules.teacher.entity.Teacher;
import com.education.admin.modules.teacher.mapper.TeacherMapper;
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
    public Result<Object> searchTeachers(String keyword, Integer page, Integer size, Long subjectId, String province, String city, String district) {
        try{
            int pageNum = page == null || page < 1 ? 1 : page;
            int pageSize = size == null || size < 1 ? 10 : size;
            int offset = (pageNum - 1) * pageSize;
            // 支持按一级科目联动二级 + 地区筛选
            List<Teacher> list = teacherMapper.findByPage(offset, pageSize, keyword, null, null, subjectId, province, city, district);
            int total = teacherMapper.countTotal(keyword, null, null, subjectId, province, city, district);
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


