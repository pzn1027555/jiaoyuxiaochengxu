package com.education.admin.modules.miniprogram.service.impl;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.MiniStudentService;
import com.education.admin.modules.student.entity.Student;
import com.education.admin.modules.student.mapper.StudentMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MiniStudentServiceImpl implements MiniStudentService {

    private final StudentMapper studentMapper;

    @Override
    public Result<List<Map<String, Object>>> getAllStudents(String keyword, Integer page, Integer size) {
        List<Student> list = studentMapper.findAll();
        if (keyword != null && !keyword.isEmpty()) {
            final String kw = keyword.trim().toLowerCase();
            list = list.stream().filter(s -> {
                String name = s.getStudentName() == null ? "" : s.getStudentName();
                String phone = s.getPhone() == null ? "" : s.getPhone();
                return name.toLowerCase().contains(kw) || phone.toLowerCase().contains(kw);
            }).collect(Collectors.toList());
        }
        // 简单分页（内存）
        if (page != null && size != null && page > 0 && size > 0) {
            int from = (page - 1) * size;
            int to = Math.min(from + size, list.size());
            if (from < list.size()) {
                list = list.subList(from, to);
            } else {
                list = List.of();
            }
        }

        List<Map<String, Object>> dto = list.stream().map(s -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", s.getId());
            m.put("name", s.getStudentName());
            m.put("avatar", s.getAvatar());
            m.put("phone", s.getPhone());
            m.put("grade", s.getGrade());
            return m;
        }).collect(Collectors.toList());

        return Result.success(dto);
    }
}


