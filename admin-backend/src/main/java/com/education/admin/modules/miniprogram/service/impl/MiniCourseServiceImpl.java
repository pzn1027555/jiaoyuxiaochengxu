package com.education.admin.modules.miniprogram.service.impl;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.MiniCourseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class MiniCourseServiceImpl implements MiniCourseService {

    private final com.education.admin.modules.miniprogram.mapper.MiniCourseMapper miniCourseMapper;

    @Override
    public Result<Object> list(Integer page, Integer size, String keyword, Long subjectId) {
        try {
            int pageNum = page == null || page < 1 ? 1 : page;
            int pageSize = size == null || size < 1 ? 10 : size;
            int offset = (pageNum - 1) * pageSize;
            List<Map<String, Object>> rows = miniCourseMapper.list(offset, pageSize, keyword, subjectId);
            int total = miniCourseMapper.count(keyword, subjectId);
            Map<String, Object> resp = new HashMap<>();
            resp.put("page", pageNum);
            resp.put("size", pageSize);
            resp.put("total", total);
            resp.put("items", rows);
            return Result.success(resp);
        } catch (Exception e) {
            log.error("小程序查询课程失败", e);
            return Result.error("查询课程失败");
        }
    }

    @Override
    public Result<Object> detail(Long id) {
        try{
            if (id == null) {
                return Result.badRequest("缺少参数id");
            }
            Map<String,Object> row = miniCourseMapper.detail(id);
            if(row == null){
                return Result.notFound("课程不存在");
            }
            return Result.success(row);
        }catch(Exception e){
            log.error("小程序课程详情失败", e);
            return Result.error("查询课程失败");
        }
    }
}



