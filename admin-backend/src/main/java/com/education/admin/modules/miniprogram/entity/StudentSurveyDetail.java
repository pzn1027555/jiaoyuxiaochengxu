package com.education.admin.modules.miniprogram.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class StudentSurveyDetail {
    private Long id;
    private Long teacherId;
    private Long studentId;
    /** 表单项原始JSON */
    private String dataJson;
    /** 附件JSON数组 */
    private String filesJson;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}


