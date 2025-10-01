package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.mapper.MiniIncomeMapper;
import com.education.admin.modules.teacher.entity.Teacher;
import com.education.admin.modules.teacher.mapper.TeacherMapper;
import com.education.admin.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/mini/income")
@RequiredArgsConstructor
public class MiniIncomeController {

    private final MiniIncomeMapper incomeMapper;
    private final TeacherMapper teacherMapper;
    private final JwtUtil jwtUtil;

    /** 收入汇总：本月、总 */
    @GetMapping("/summary")
    public Result<Map<String, Object>> summary(@RequestParam(required = false) String yearMonth) {
        Long teacherId = getCurrentTeacherId();
        if (teacherId == null) return Result.error("获取教师信息失败");
        if (yearMonth == null || yearMonth.isEmpty()) {
            java.time.LocalDate now = java.time.LocalDate.now();
            yearMonth = now.getYear() + "-" + String.format("%02d", now.getMonthValue());
        }
        BigDecimal month = incomeMapper.sumMonthlyIncome(teacherId, yearMonth);
        BigDecimal total = incomeMapper.sumTotalIncome(teacherId);

        Map<String, Object> data = new HashMap<>();
        data.put("month", month);
        data.put("total", total);
        return Result.success(data);
    }

    /** 月度明细：订单收入 + 结算打款 */
    @GetMapping("/monthly-detail")
    public Result<List<Map<String, Object>>> monthlyDetail(@RequestParam String yearMonth) {
        Long teacherId = getCurrentTeacherId();
        if (teacherId == null) return Result.error("获取教师信息失败");

        List<Map<String, Object>> records = new ArrayList<>();
        records.addAll(incomeMapper.listMonthlyOrderIncome(teacherId, yearMonth));
        records.addAll(incomeMapper.listMonthlySettlementPayout(teacherId, yearMonth));

        // 时间倒序（尽量不引入额外依赖，直接比较Date或字符串）
        records.sort((a, b) -> {
            Object taObj = a.get("time");
            Object tbObj = b.get("time");
            if (taObj instanceof Date && tbObj instanceof Date) {
                return ((Date) tbObj).compareTo((Date) taObj);
            }
            String ta = taObj != null ? taObj.toString() : "";
            String tb = tbObj != null ? tbObj.toString() : "";
            return tb.compareTo(ta);
        });

        return Result.success(records);
    }

    private Long getCurrentTeacherId() {
        try {
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String bearerToken = request.getHeader("Authorization");
            if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
                String jwt = bearerToken.substring(7);
                if (jwtUtil.validateToken(jwt)) {
                    String phone = jwtUtil.getUsernameFromToken(jwt);
                    Teacher teacher = teacherMapper.findByPhone(phone);
                    return teacher != null ? teacher.getId() : null;
                }
            }
        } catch (Exception ignored) {}
        return 12L; // 开发环境默认教师ID
    }
}


