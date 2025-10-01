package com.education.admin.modules.teacher.mapper;

import com.education.admin.modules.teacher.entity.Teacher;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 教师数据访问接口
 */
@Mapper
public interface TeacherMapper {
    
    /**
     * 根据ID查询教师
     */
    Teacher findById(@Param("id") Long id);
    
    /**
     * 根据手机号查询教师
     */
    Teacher findByPhone(@Param("phone") String phone);
    
    /**
     * 分页查询教师列表
     */
    List<Teacher> findByPage(@Param("offset") Integer offset, 
                           @Param("limit") Integer limit,
                           @Param("name") String name,
                           @Param("status") Integer status,
                           @Param("risk") Integer risk,
                           @Param("subjectId") Long subjectId,
                           @Param("province") String province,
                           @Param("city") String city,
                           @Param("district") String district);
    
    /**
     * 查询教师总数
     */
    int countTotal(@Param("name") String name, @Param("status") Integer status, @Param("risk") Integer risk,
                   @Param("subjectId") Long subjectId,
                   @Param("province") String province,
                   @Param("city") String city,
                   @Param("district") String district);
    
    /**
     * 查询所有教师
     */
    List<Teacher> findAll();

    /** 推荐老师列表（SQL过滤） */
    List<Teacher> findRecommended(@org.apache.ibatis.annotations.Param("limit") Integer limit);
    
    /** 风险教师列表：投诉率>10% 或 星级<3（已通过面试认证） */
    List<Teacher> findRiskTeachers();
    
    /**
     * 创建教师
     */
    int insert(Teacher teacher);
    
    /**
     * 更新教师信息
     */
    int update(Teacher teacher);
    
    /**
     * 更新审核状态
     */
    int updateAuditStatus(@Param("id") Long id, 
                         @Param("status") Integer status,
                         @Param("auditReason") String auditReason,
                         @Param("auditUserId") Long auditUserId);
    
    /**
     * 删除教师
     */
    int deleteById(@Param("id") Long id);

    /**
     * 抽查次数+1
     */
    int increaseCheckCount(@Param("id") Long id);

    int markContractSent(@Param("id") Long id, @Param("contractUrl") String contractUrl);

    /** 雪藏/解除雪藏 */
    int toggleHidden(@Param("id") Long id);

    /** 推荐/取消推荐 */
    int toggleRecommend(@Param("id") Long id);
}