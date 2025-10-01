package com.education.admin.modules.miniprogram.entity;

import lombok.Data;

@Data
public class TeacherScheduleStudent {
    private Long id;
    private Long scheduleId;
    private Long studentId;
    private String studentName;
    private String studentAvatar;
}
