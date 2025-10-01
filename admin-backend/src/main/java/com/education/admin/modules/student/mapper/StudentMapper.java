package com.education.admin.modules.student.mapper;

import com.education.admin.modules.student.entity.Student;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 学生数据访问接口
 */
@Mapper
public interface StudentMapper {
    
    Student findById(@Param("id") Long id);
    Student findByPhone(@Param("phone") String phone);
    List<Student> findAll();
    List<Student> findByPage(@Param("studentName") String studentName,
                             @Param("studentLevel") String studentLevel,
                             @Param("status") Integer status,
                             @Param("phone") String phone,
                             @Param("province") String province,
                             @Param("city") String city,
                             @Param("district") String district,
                             @Param("startTime") java.time.LocalDateTime startTime,
                             @Param("endTime") java.time.LocalDateTime endTime);
    int insert(Student student);
    int update(Student student);
    int deleteById(@Param("id") Long id);

    int updateLevel(@Param("id") Long id, @Param("studentLevel") String studentLevel);
}