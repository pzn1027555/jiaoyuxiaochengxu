package com.education.admin.modules.miniprogram.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * 选择角色请求
 */
@Data
public class SelectRoleRequest {
    
    @NotBlank(message = "角色不能为空")
    @Pattern(regexp = "^(student|parent|teacher)$", message = "角色类型不正确")
    private String role;
}