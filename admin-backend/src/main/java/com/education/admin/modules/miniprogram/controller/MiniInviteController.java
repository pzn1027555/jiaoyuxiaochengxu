package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.MiniInviteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/mini/invite")
@RequiredArgsConstructor
public class MiniInviteController {

    private final MiniInviteService inviteService;

    /** 学生端获取邀请码 */
    @GetMapping("/code")
    public Result<Map<String, Object>> code(){
        return inviteService.generateStudentInviteCode();
    }

    /** 学生端获取家长绑定码（与邀请码区分 codeType=bind） */
    @GetMapping("/bind-code")
    public Result<Map<String, Object>> bindCode(){
        return inviteService.generateStudentBindCode();
    }

    /** 家长端获取家长邀请码 */
    @GetMapping("/parent/code")
    public Result<Map<String, Object>> parentCode(){
        return inviteService.generateParentInviteCode();
    }

    /** 家长端获取子女绑定码（家长提供给学生填写） */
    @GetMapping("/parent/bind-code")
    public Result<Map<String, Object>> parentBindCode(){
        return inviteService.generateParentBindCode();
    }

    /** 提交接受邀请码（学生填写他人码） */
    @PostMapping("/accept")
    public Result<String> accept(@RequestBody Map<String,Object> body){
        String code = body==null?null:String.valueOf(body.get("code"));
        return inviteService.acceptInviteCode(code);
    }

    /** 提交绑定码（学生/家长互绑：学生填家长bindCode，家长填学生bindCode） */
    @PostMapping("/accept-bind")
    public Result<String> acceptBind(@RequestBody Map<String,Object> body){
        String code = body==null?null:String.valueOf(body.get("code"));
        return inviteService.acceptBindCode(code);
    }

    /** 我的邀请列表 */
    @GetMapping("/list")
    public Result<java.util.List<java.util.Map<String,Object>>> list(){
        return inviteService.listInvited();
    }
}


