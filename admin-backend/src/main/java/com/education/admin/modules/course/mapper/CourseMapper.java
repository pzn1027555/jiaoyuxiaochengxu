package com.education.admin.modules.course.mapper;

import com.education.admin.modules.course.entity.Course;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 课程数据访问接口
 */
@Mapper
public interface CourseMapper {
    
    Course findById(@Param("id") Long id);
    List<Course> findAll();
    List<Course> findByPage(@Param("categoryId") Long categoryId,
                            @Param("teacherId") Long teacherId,
                            @Param("status") Integer status,
                            @Param("keyword") String keyword);
    int insert(Course course);
    int update(Course course);
    int deleteById(@Param("id") Long id);
}