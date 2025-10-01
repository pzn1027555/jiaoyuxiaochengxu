package com.education.admin.modules.miniprogram.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class StudentSurvey {
    private Long id;
    private Long teacherId;
    private Long studentId;
    /** 问卷明细ID（指向 student_survey_detail.id） */
    private Long detailId;
    /** 附件JSON（可选） */
    private String filesJson;
    /** 预约状态：0-待处理，1-已同意，2-已拒绝 */
    private Integer status;
    private String rejectReason;
    /** 选定的课程（可选） */
    private Long courseId;
    private String courseTitle;
    
    /** 预约相关字段 */
    private LocalDate bookingDate;
    private LocalTime bookingStartTime;
    private String bookingDuration;
    private BigDecimal bookingPrice;
    private String bookingType;
    /** 是否已支付/可展示：1-可展示(已付或无需付)，0-未支付 */
    private Integer paid;
    
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}


