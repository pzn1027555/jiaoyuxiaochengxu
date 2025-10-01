package com.education.admin.modules.miniprogram.service.impl;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.MiniInviteService;
import com.education.admin.modules.student.mapper.StudentMapper;
import com.education.admin.modules.parent.mapper.ParentMapper;
import com.education.admin.modules.parent.entity.Parent;
import com.education.admin.modules.miniprogram.mapper.ParentStudentRelationMapper;
import com.education.admin.modules.miniprogram.mapper.UserInviteCodeMapper;
import com.education.admin.modules.miniprogram.mapper.InvitationRecordMapper;
import com.education.admin.modules.student.entity.Student;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class MiniInviteServiceImpl implements MiniInviteService {

    private final StudentMapper studentMapper;
    private final UserInviteCodeMapper inviteCodeMapper;
    private final InvitationRecordMapper invitationRecordMapper;
    private final ParentMapper parentMapper;
    private final ParentStudentRelationMapper parentStudentRelationMapper;

    @Override
    public Result<Map<String, Object>> generateStudentInviteCode() {
        try{
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String phone = request.getHeader("X-User-Phone");
            Student s = (phone==null||phone.isEmpty()) ? null : studentMapper.findByPhone(phone);
            if (s == null) return Result.error("学生信息获取失败");
            // 查询是否已生成
            Map<String,Object> exist = inviteCodeMapper.findByUser(s.getId(), "student", "invite");
            String code;
            if (exist != null && exist.get("code") != null) {
                code = String.valueOf(exist.get("code"));
            } else {
                code = generateCodeFromId(s.getId());
                inviteCodeMapper.insert(s.getId(), "student", "invite", code);
            }
            Map<String,Object> data = new HashMap<>();
            data.put("inviteCode", code);
            data.put("studentId", s.getId());
            data.put("studentName", s.getStudentName());
            return Result.success(data);
        }catch(Exception e){
            log.error("生成邀请码失败", e);
            return Result.error("生成邀请码失败");
        }
    }

    @Override
    public Result<Map<String, Object>> generateStudentBindCode() {
        try{
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String phone = request.getHeader("X-User-Phone");
            Student s = (phone==null||phone.isEmpty()) ? null : studentMapper.findByPhone(phone);
            if (s == null) return Result.error("学生信息获取失败");
            Map<String,Object> exist = inviteCodeMapper.findByUser(s.getId(), "student", "bind");
            String code;
            if (exist != null && exist.get("code") != null) {
                code = String.valueOf(exist.get("code"));
            } else {
                code = generateCodeFromId(s.getId()+10000); // 区分生成
                inviteCodeMapper.insert(s.getId(), "student", "bind", code);
            }
            Map<String,Object> data = new HashMap<>();
            data.put("bindCode", code);
            data.put("studentId", s.getId());
            data.put("studentName", s.getStudentName());
            return Result.success(data);
        }catch(Exception e){
            log.error("生成绑定码失败", e);
            return Result.error("生成绑定码失败");
        }
    }

    @Override
    public Result<Map<String, Object>> generateParentInviteCode() {
        try{
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String phone = request.getHeader("X-User-Phone");
            Parent p = (phone==null||phone.isEmpty()) ? null : parentMapper.findByPhone(phone);
            if (p == null) return Result.error("家长信息获取失败");
            Map<String,Object> exist = inviteCodeMapper.findByUser(p.getId(), "parent", "invite");
            String code;
            if (exist != null && exist.get("code") != null) {
                code = String.valueOf(exist.get("code"));
            } else {
                code = generateCodeFromId(p.getId());
                inviteCodeMapper.insert(p.getId(), "parent", "invite", code);
            }
            Map<String,Object> data = new HashMap<>();
            data.put("inviteCode", code);
            data.put("parentId", p.getId());
            data.put("parentName", p.getParentName());
            return Result.success(data);
        }catch(Exception e){
            log.error("生成家长邀请码失败", e);
            return Result.error("生成邀请码失败");
        }
    }

    @Override
    public Result<Map<String, Object>> generateParentBindCode() {
        try{
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String phone = request.getHeader("X-User-Phone");
            Parent p = (phone==null||phone.isEmpty()) ? null : parentMapper.findByPhone(phone);
            if (p == null) return Result.error("家长信息获取失败");
            Map<String,Object> exist = inviteCodeMapper.findByUser(p.getId(), "parent", "bind");
            String code;
            if (exist != null && exist.get("code") != null) {
                code = String.valueOf(exist.get("code"));
            } else {
                code = generateCodeFromId(p.getId()+10000);
                inviteCodeMapper.insert(p.getId(), "parent", "bind", code);
            }
            Map<String,Object> data = new HashMap<>();
            data.put("bindCode", code);
            data.put("parentId", p.getId());
            data.put("parentName", p.getParentName());
            return Result.success(data);
        }catch(Exception e){
            log.error("生成家长绑定码失败", e);
            return Result.error("生成绑定码失败");
        }
    }

    @Override
    public Result<String> acceptInviteCode(String code) {
        try{
            if(code==null || code.trim().isEmpty()) return Result.error("邀请码不能为空");
            code = code.trim().toUpperCase();
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String phone = request.getHeader("X-User-Phone");

            // 识别当前用户（支持学生/家长）
            Student student = (phone==null||phone.isEmpty()) ? null : studentMapper.findByPhone(phone);
            Parent parent = (phone==null||phone.isEmpty()) ? null : parentMapper.findByPhone(phone);
            if (student == null && parent == null) return Result.error("用户信息获取失败");

            // 自己的邀请码（同类型用户才可能冲突），仅在我已有邀请码时校验
            if (student != null) {
                Map<String,Object> myInvite = inviteCodeMapper.findByUser(student.getId(), "student", "invite");
                if (myInvite!=null && code.equalsIgnoreCase(String.valueOf(myInvite.get("code")))){
                    return Result.error("不能填写自己的邀请码");
                }
            }
            if (parent != null) {
                Map<String,Object> myInvite = inviteCodeMapper.findByUser(parent.getId(), "parent", "invite");
                if (myInvite!=null && code.equalsIgnoreCase(String.valueOf(myInvite.get("code")))){
                    return Result.error("不能填写自己的邀请码");
                }
            }

            // 查找被填邀请码所属用户
            Map<String,Object> target = inviteCodeMapper.findByCode(code);
            if (target==null) return Result.error("无效邀请码");
            Long inviterId = ((Number)target.get("userId")).longValue();
            String inviterType = String.valueOf(target.get("userType")); // student/parent

            Long invitedId; String invitedType;
            if (student != null) { invitedId = student.getId(); invitedType = "student"; }
            else { invitedId = parent != null ? parent.getId() : null; invitedType = "parent"; }
            if (invitedId == null) return Result.error("用户信息获取失败");

            if (inviterId.equals(invitedId) && inviterType.equalsIgnoreCase(invitedType)) {
                return Result.error("不能填写自己的邀请码");
            }

            if (invitationRecordMapper.exists(inviterId, invitedId)==0) {
                invitationRecordMapper.insert(null, inviterId, inviterType, invitedId, invitedType, code);
            }
            return Result.success("接受成功");
        }catch(Exception e){
            log.error("接受邀请码失败", e);
            return Result.error("提交失败");
        }
    }

    @Override
    public Result<String> acceptBindCode(String code) {
        try{
            if(code==null || code.trim().isEmpty()) return Result.error("绑定码不能为空");
            code = code.trim().toUpperCase();
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String phone = request.getHeader("X-User-Phone");

            // 尝试识别当前是学生还是家长
            Student s = (phone==null||phone.isEmpty()) ? null : studentMapper.findByPhone(phone);
            Parent p = (phone==null||phone.isEmpty()) ? null : parentMapper.findByPhone(phone);

            Map<String,Object> target = inviteCodeMapper.findByCode(code);
            if (target == null) return Result.error("无效绑定码");
            String targetUserType = String.valueOf(target.get("userType"));
            Long targetUserId = ((Number)target.get("userId")).longValue();
            String targetCodeType = String.valueOf(target.get("codeType"));
            if (!"bind".equalsIgnoreCase(targetCodeType)) return Result.error("不是绑定码");

            if (s != null && p == null) {
                // 当前是学生：对方应为家长bind码
                if (!"parent".equalsIgnoreCase(targetUserType)) return Result.error("绑定对象必须为家长");
                if (parentStudentRelationMapper.checkParentStudentRelation(targetUserId, s.getId()) == 0) {
                    parentStudentRelationMapper.insertRelation(targetUserId, s.getId(), "parent", 0);
                }
                return Result.success("绑定成功");
            } else if (p != null && s == null) {
                // 当前是家长：对方应为学生bind码
                if (!"student".equalsIgnoreCase(targetUserType)) return Result.error("绑定对象必须为学生");
                if (parentStudentRelationMapper.checkParentStudentRelation(p.getId(), targetUserId) == 0) {
                    parentStudentRelationMapper.insertRelation(p.getId(), targetUserId, "parent", 0);
                }
                return Result.success("绑定成功");
            } else {
                return Result.error("用户身份识别失败");
            }
        }catch(Exception e){
            log.error("接受绑定码失败", e);
            return Result.error("提交失败");
        }
    }

    @Override
    public Result<java.util.List<java.util.Map<String, Object>>> listInvited() {
        try{
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String phone = request.getHeader("X-User-Phone");
            Student me = (phone==null||phone.isEmpty()) ? null : studentMapper.findByPhone(phone);
            if (me == null) return Result.error("学生信息获取失败");
            return Result.success(invitationRecordMapper.listInvitees(me.getId()));
        }catch(Exception e){
            log.error("获取邀请列表失败", e);
            return Result.error("获取邀请列表失败");
        }
    }

    private String generateCodeFromId(Long id){
        long base = (id == null ? 0L : id) * 1315423911L;
        long mixed = (base ^ (base >>> 16) ^ (base >>> 32)) & 0x7FFFFFFFL;
        int code = (int)(mixed % 900000) + 100000; // 6位数字，范围 100000-999999
        return String.format("%06d", code);
    }
}


