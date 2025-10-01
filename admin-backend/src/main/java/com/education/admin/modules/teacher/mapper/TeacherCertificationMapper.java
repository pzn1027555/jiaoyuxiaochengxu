package com.education.admin.modules.teacher.mapper;

import com.education.admin.modules.teacher.entity.TeacherCertification;
import com.education.admin.modules.teacher.dto.TeacherCertificationResponse;
import com.github.pagehelper.Page;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 教师认证Mapper接口
 *
 * @author education
 * @since 2025-08-16
 */
@Mapper
public interface TeacherCertificationMapper {

    /**
     * 插入认证记录
     */
    int insertCertification(TeacherCertification certification);

    /**
     * 根据ID更新认证记录
     */
    int updateCertificationById(TeacherCertification certification);

    /**
     * 根据ID删除认证记录
     */
    int deleteCertificationById(@Param("id") Long id);

    /**
     * 根据ID查询认证记录
     */
    TeacherCertification selectCertificationById(@Param("id") Long id);

    /**
     * 分页查询教师认证列表（关联教师信息）
     */
    Page<TeacherCertificationResponse> selectCertificationPage(
            @Param("teacherName") String teacherName,
            @Param("realName") String realName,
            @Param("certificationStatus") Integer certificationStatus
    );

    /**
     * 根据认证ID查询认证详情（关联教师信息）
     */
    TeacherCertificationResponse selectCertificationDetailById(@Param("id") Long id);

    /**
     * 根据教师ID查询最新认证记录
     */
    TeacherCertification selectLatestByTeacherId(@Param("teacherId") Long teacherId);

    /**
     * 根据条件查询认证列表
     */
    List<TeacherCertification> selectCertificationList(TeacherCertification certification);
}
