package com.education.admin.modules.community.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.community.service.CommunityService;
import com.education.admin.modules.community.mapper.CommunityMapper;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;

/**
 * 小程序社区接口（前缀无 /api，避免形成 /api/api）
 */
@RestController
@RequestMapping({"/community","/api/community"})
@RequiredArgsConstructor
public class MiniCommunityController {

    private final CommunityService communityService;
    private final CommunityMapper communityMapper;
    @org.springframework.beans.factory.annotation.Autowired
    private com.education.admin.modules.auth.mapper.UserMapper userMapper;

    @GetMapping("/categories")
    public Result<List<Map<String, Object>>> categories() {
        // 前端已写死分类（问答、高分、经验），返回固定数据
        List<Map<String, Object>> categories = new ArrayList<>();
        
        String[] categoryNames = {"问答", "高分", "经验"};
        for (int i = 0; i < categoryNames.length; i++) {
            Map<String, Object> category = new HashMap<>();
            category.put("id", i + 1);
            category.put("name", categoryNames[i]);
            category.put("categoryName", categoryNames[i]);
            category.put("description", categoryNames[i] + "相关内容");
            category.put("postCount", 0);
            category.put("status", 1);
            categories.add(category);
        }
        
        return Result.success(categories);
    }

    @PostMapping("/posts/list")
    public Result<PageInfo<Map<String, Object>>> list(@RequestBody Map<String, Object> params) {
        String keyword = params.get("keyword") == null ? null : String.valueOf(params.get("keyword"));
        String authorName = params.get("authorName") == null ? null : String.valueOf(params.get("authorName"));
        Integer postStatus = null;
        Integer auditStatus = null;
        try { if (params.get("postStatus") != null && !String.valueOf(params.get("postStatus")).isEmpty()) postStatus = Integer.valueOf(String.valueOf(params.get("postStatus"))); } catch (Exception ignored) {}
        try { if (params.get("auditStatus") != null && !String.valueOf(params.get("auditStatus")).isEmpty()) auditStatus = Integer.valueOf(String.valueOf(params.get("auditStatus"))); } catch (Exception ignored) {}
        int pageNum = params.get("pageNum") == null ? 1 : Integer.parseInt(String.valueOf(params.get("pageNum")));
        int pageSize = params.get("pageSize") == null ? 10 : Integer.parseInt(String.valueOf(params.get("pageSize")));

        PageHelper.startPage(pageNum, pageSize);
        java.util.List<java.util.Map<String,Object>> rows = communityMapper.adminPagePosts(keyword, authorName, postStatus, auditStatus);
        PageInfo<Map<String, Object>> page = new PageInfo<>(rows);
        page.setPageNum(pageNum);
        page.setPageSize(pageSize);
        return Result.success(page);
    }

    @GetMapping("/posts/{id}")
    public Result<Map<String, Object>> detail(@PathVariable Long id,
                                              @RequestParam(required = false) Long userId) {
        // 后台详情：直接查详情（不强制增加view）
        Map<String,Object> detail = communityMapper.adminGetPostDetail(id);
        if (detail == null) return Result.error("帖子不存在");
        return Result.success(detail);
    }

    @GetMapping("/statistics")
    public Result<Map<String, Object>> statistics() {
        return Result.success(communityService.getStatistics());
    }

    @PostMapping("/posts")
    public Result<Map<String, Object>> create(@RequestBody Map<String, Object> post) {
        Long id = communityService.createPost(post);
        return Result.success(Map.of("id", id));
    }

    @PostMapping("/posts/{id}/like")
    public Result<Map<String, Object>> like(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        Long userId = body != null && body.get("userId") != null ? Long.valueOf(String.valueOf(body.get("userId"))) : 0L;
        String userType = body != null && body.get("userType") != null ? String.valueOf(body.get("userType")) : "student";
        boolean liked = communityService.toggleLike(id, userId, userType);
        return Result.success(Map.of("liked", liked));
    }

    @DeleteMapping("/posts/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        communityMapper.hardDeletePost(id);
        return Result.success();
    }

    // comments
    @GetMapping("/posts/{postId}/comments")
    public Result<Map<String, Object>> listComments(
            @PathVariable Long postId,
            @RequestParam(required = false) Long parentId,
            @RequestParam(required = false, defaultValue = "1") Integer pageNum,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String userType) {
        
        // 如果传入了userId，使用带点赞状态的查询
        if (userId != null && userId > 0 && userType != null) {
            if (parentId != null) {
                var pi = communityService.pageRepliesWithLikeStatus(postId, parentId, pageNum, pageSize, userId, userType);
                return Result.success(Map.of("list", pi.getList(), "total", pi.getTotal(), "pageNum", pi.getPageNum(), "pageSize", pi.getPageSize()));
            }
            var pi = communityService.pageCommentsWithLikeStatus(postId, pageNum, pageSize, userId, userType);
            return Result.success(Map.of("list", pi.getList(), "total", pi.getTotal(), "pageNum", pi.getPageNum(), "pageSize", pi.getPageSize()));
        }
        
        // 否则使用原有的查询（不包含点赞状态）
        if (parentId != null) {
            var pi = communityService.pageReplies(postId, parentId, pageNum, pageSize);
            return Result.success(Map.of("list", pi.getList(), "total", pi.getTotal(), "pageNum", pi.getPageNum(), "pageSize", pi.getPageSize()));
        }
        var pi = communityService.pageComments(postId, pageNum, pageSize);
        return Result.success(Map.of("list", pi.getList(), "total", pi.getTotal(), "pageNum", pi.getPageNum(), "pageSize", pi.getPageSize()));
    }

    @PostMapping("/posts/{postId}/comments")
    public Result<Map<String, Object>> addComment(@PathVariable Long postId, @RequestBody Map<String, Object> body) {
        body.put("postId", postId);
        Long id = communityService.addComment(body);
        return Result.success(Map.of("id", id));
    }

    @DeleteMapping("/comments/{id}")
    public Result<Void> deleteComment(@PathVariable Long id, @RequestParam Long postId) {
        communityService.deleteComment(id, postId);
        return Result.success();
    }

    @PostMapping("/comments/{id}/like")
    public Result<Map<String, Object>> likeComment(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        Long userId = body != null && body.get("userId") != null ? Long.valueOf(String.valueOf(body.get("userId"))) : 0L;
        String userType = body != null && body.get("userType") != null ? String.valueOf(body.get("userType")) : "student";
        boolean liked = communityService.toggleCommentLike(id, userId, userType);
        return Result.success(Map.of("liked", liked));
    }

    // top resources for download block
    @GetMapping("/resources/top")
    public Result<List<Map<String, Object>>> topResources(@RequestParam(defaultValue = "2") Integer limit) {
        return Result.success(communityService.listTopResources(limit == null ? 2 : limit));
    }

    // posts with subject + subtype filters
    @GetMapping("/posts/filter")
    public Result<Map<String, Object>> filterPosts(@RequestParam(required = false) Long subjectId,
                                                   @RequestParam(required = false) String subType,
                                                   @RequestParam(required = false) String keyword,
                                                   @RequestParam(required = false) Long categoryId,
                                                   @RequestParam(required = false) Long userId,
                                                   @RequestParam(required = false) String userType,
                                                   @RequestParam(defaultValue = "1") int pageNum,
                                                   @RequestParam(defaultValue = "10") int pageSize) {
        String resolvedUserType = (userType == null || userType.isEmpty()) ? "student" : userType;
        var pi = communityService.pagePostsFiltered(subjectId, subType, keyword, categoryId, userId, resolvedUserType, pageNum, pageSize);
        return Result.success(Map.of("list", pi.getList(), "total", pi.getTotal(), "pageNum", pi.getPageNum(), "pageSize", pi.getPageSize()));
    }

    // following teachers' resources
    @GetMapping("/resources/following")
    public Result<List<Map<String, Object>>> followingResources(@RequestParam Long studentId, @RequestParam(defaultValue = "6") Integer limit){
        return Result.success(communityService.listFollowingResources(studentId, limit==null?6:limit));
    }

    // resource list page
    @GetMapping("/resources")
    public Result<Map<String, Object>> resources(@RequestParam(required = false) String keyword,
                                                 @RequestParam(required = false) String fileType,
                                                 @RequestParam(defaultValue = "1") int pageNum,
                                                 @RequestParam(defaultValue = "10") int pageSize){
        var pi = communityService.pageResources(keyword, fileType, pageNum, pageSize);
        return Result.success(Map.of("list", pi.getList(), "total", pi.getTotal(), "pageNum", pi.getPageNum(), "pageSize", pi.getPageSize()));
    }

    @PostMapping("/resources/{id}/download")
    public Result<Void> resourceDownload(@PathVariable Long id){
        communityService.addResourceDownload(id);
        return Result.success();
    }

    @GetMapping("/resources/{id}/download")
    public Result<java.util.Map<String,String>> resourceDownloadGet(@PathVariable Long id,
                                                                    @RequestParam(defaultValue = "community") String source){
        communityService.addResourceDownload(id);
        String url = "teacher".equals(source)
                ? communityMapper.getTeacherResourceFileUrl(id)
                : communityMapper.getCommunityResourceFileUrl(id);
        if (url == null || url.isEmpty()) return Result.error("资源不存在");
        // 统一通过后端暴露静态路径 /api/uploads/** 访问
        String full = url.startsWith("/uploads/") ? ("/uploads" + url.substring("/uploads".length())) : url;
        return Result.success(java.util.Map.of("url", full));
    }

    // ===== 后台帖子管理：审核/批量审核/发布/下架/置顶/精华/推荐(占位) =====

    @PutMapping("/posts/{id}/audit")
    public Result<Void> auditPost(@PathVariable Long id,
                                  @RequestParam Integer auditStatus,
                                  @RequestParam(required = false) String auditRemark) {
        int n = communityMapper.updateAuditStatus(id, auditStatus, auditRemark, null);
        return n > 0 ? Result.success() : Result.error("审核失败");
    }

    @PutMapping("/posts/batch-audit")
    public Result<Void> batchAudit(@RequestParam String postIds,
                                   @RequestParam Integer auditStatus,
                                   @RequestParam(required = false) String auditRemark) {
        java.util.List<Long> ids = new java.util.ArrayList<>();
        if (postIds != null && !postIds.isEmpty()) {
            for (String s : postIds.split(",")) {
                try { ids.add(Long.valueOf(s.trim())); } catch (Exception ignored) {}
            }
        }
        if (ids.isEmpty()) return Result.error("postIds 不能为空");
        int n = communityMapper.batchUpdateAuditStatus(ids, auditStatus, auditRemark, null);
        return n > 0 ? Result.success() : Result.error("批量审核失败");
    }

    @PutMapping("/posts/{id}/publish")
    public Result<Void> publish(@PathVariable Long id) {
        int n = communityMapper.publishPost(id);
        return n > 0 ? Result.success() : Result.error("发布失败");
    }

    @PutMapping("/posts/{id}/take-down")
    public Result<Void> takeDown(@PathVariable Long id, @RequestParam(required = false) String reason) {
        int n = communityMapper.takeDownPost(id, reason);
        return n > 0 ? Result.success() : Result.error("下架失败");
    }

    @PutMapping("/posts/{id}/top")
    public Result<Void> top(@PathVariable Long id, @RequestParam Boolean isTop) {
        int n = communityMapper.updateTop(id, Boolean.TRUE.equals(isTop) ? 1 : 0);
        return n > 0 ? Result.success() : Result.error("操作失败");
    }

    @PutMapping("/posts/{id}/essence")
    public Result<Void> essence(@PathVariable Long id, @RequestParam Boolean isEssence) {
        int n = communityMapper.updateEssence(id, Boolean.TRUE.equals(isEssence) ? 1 : 0);
        return n > 0 ? Result.success() : Result.error("操作失败");
    }

    @PutMapping("/posts/{id}/recommend")
    public Result<Void> recommend(@PathVariable Long id, @RequestParam Boolean isRecommend) {
        // 当前库无 is_recommend 字段，这里先占位返回成功，前端将去除此入口
        return Result.success();
    }

    // ===== 资源管理：社区资源 & 教师资源 =====
    @PostMapping("/resources/list")
    public Result<PageInfo<java.util.Map<String,Object>>> resourceList(@RequestBody java.util.Map<String,Object> body){
        String keyword = body.get("keyword") == null ? null : String.valueOf(body.get("keyword"));
        String uploaderName = body.get("uploaderName") == null ? null : String.valueOf(body.get("uploaderName"));
        String fileType = body.get("resourceType") == null ? null : String.valueOf(body.get("resourceType"));
        String source = body.get("source") == null ? "community" : String.valueOf(body.get("source"));
        if ("teacher".equals(source) && "管理员".equals(uploaderName)) {
            uploaderName = null; // 管理员不是教师资源上传者，切到教师资源时忽略该筛选
        }
        int pageNum = body.get("pageNum") == null ? 1 : Integer.parseInt(String.valueOf(body.get("pageNum")));
        int pageSize = body.get("pageSize") == null ? 10 : Integer.parseInt(String.valueOf(body.get("pageSize")));
        PageHelper.startPage(pageNum, pageSize);
        java.util.List<java.util.Map<String,Object>> rows = "teacher".equals(source)
                ? communityMapper.adminPageTeacherResources(keyword, fileType, uploaderName)
                : communityMapper.adminPageCommunityResources(keyword, fileType, uploaderName);
        PageInfo<java.util.Map<String,Object>> page = new PageInfo<>(rows);
        page.setPageNum(pageNum); page.setPageSize(pageSize);
        return Result.success(page);
    }

    @GetMapping("/resources/{id}")
    public Result<java.util.Map<String,Object>> resourceDetail(@PathVariable Long id, @RequestParam(defaultValue = "community") String source){
        java.util.Map<String,Object> data = "teacher".equals(source)
                ? communityMapper.adminGetTeacherResourceDetail(id)
                : communityMapper.adminGetCommunityResourceDetail(id);
        if (data == null) return Result.error("资源不存在");
        return Result.success(data);
    }

    @DeleteMapping("/resources/{id}")
    public Result<Void> resourceDelete(@PathVariable Long id, @RequestParam(defaultValue = "community") String source){
        int n = "teacher".equals(source)
                ? communityMapper.hardDeleteTeacherResource(id)
                : communityMapper.hardDeleteCommunityResource(id);
        return n > 0 ? Result.success() : Result.error("删除失败");
    }

    @PostMapping("/resources/create")
    public Result<java.util.Map<String,Object>> resourceCreate(@RequestBody java.util.Map<String,Object> body){
        String title = String.valueOf(body.getOrDefault("title", ""));
        String description = body.get("description") == null ? null : String.valueOf(body.get("description"));
        String fileUrl = body.get("fileUrl") == null ? null : String.valueOf(body.get("fileUrl"));
        String coverUrl = body.get("coverUrl") == null ? null : String.valueOf(body.get("coverUrl"));
        String fileType = body.get("fileType") == null ? null : String.valueOf(body.get("fileType"));
        java.math.BigDecimal price = null;
        try { if (body.get("price") != null) price = new java.math.BigDecimal(String.valueOf(body.get("price"))); } catch (Exception ignored) {}
        String uploaderName = body.get("uploaderName") == null ? null : String.valueOf(body.get("uploaderName"));
        Long publisherUserId = null;
        if (uploaderName == null || uploaderName.isEmpty() || "管理员".equals(uploaderName)) {
            uploaderName = "admin"; // 默认管理员账号
        }
        if (uploaderName != null && !uploaderName.isEmpty()) {
            var u = userMapper.findByUsername(uploaderName);
            if (u != null) publisherUserId = u.getId();
        }
        if (title.isEmpty()) return Result.error("标题不能为空");
        communityMapper.insertCommunityResource(title, description, fileUrl, coverUrl, fileType, price, publisherUserId);
        return Result.success(java.util.Map.of("ok", true));
    }

    @PutMapping("/resources/update")
    public Result<Void> resourceUpdate(@RequestBody java.util.Map<String,Object> body){
        if (body == null || body.get("id") == null) return Result.error("id 不能为空");
        Long id = Long.valueOf(String.valueOf(body.get("id")));
        String title = String.valueOf(body.getOrDefault("title", ""));
        String description = body.get("description") == null ? null : String.valueOf(body.get("description"));
        String fileUrl = body.get("fileUrl") == null ? null : String.valueOf(body.get("fileUrl"));
        String coverUrl = body.get("coverUrl") == null ? null : String.valueOf(body.get("coverUrl"));
        String fileType = body.get("fileType") == null ? null : String.valueOf(body.get("fileType"));
        String source = body.get("source") == null ? "community" : String.valueOf(body.get("source"));

        if (title.isEmpty()) return Result.error("标题不能为空");

        java.math.BigDecimal price = null;
        try { if (body.get("price") != null) price = new java.math.BigDecimal(String.valueOf(body.get("price"))); } catch (Exception ignored) {}

        int n = "teacher".equals(source)
                ? communityMapper.updateTeacherResource(id, title, description, fileUrl, coverUrl, fileType)
                : communityMapper.updateCommunityResource(id, title, description, fileUrl, coverUrl, fileType, price);
        return n > 0 ? Result.success() : Result.error("更新失败");
    }
}


