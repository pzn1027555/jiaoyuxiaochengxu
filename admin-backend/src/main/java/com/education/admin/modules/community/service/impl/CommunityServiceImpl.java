package com.education.admin.modules.community.service.impl;

import com.education.admin.modules.community.mapper.CommunityMapper;
import com.education.admin.modules.community.service.CommunityService;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CommunityServiceImpl implements CommunityService {

    private final CommunityMapper communityMapper;

    @Override
    public PageInfo<Map<String, Object>> pagePosts(String keyword, Long categoryId, int pageNum, int pageSize) {
        PageHelper.startPage(pageNum, pageSize);
        List<Map<String, Object>> list = communityMapper.pagePosts(keyword, categoryId);
        return new PageInfo<>(list);
    }

    @Override
    public Map<String, Object> getPostDetail(Long id) {
        return communityMapper.getPostById(id);
    }

    @Override
    public Map<String, Object> getPostDetail(Long id, Long userId) {
        return communityMapper.getPostByIdWithUser(id, userId);
    }

    @Override
    public Map<String, Object> getStatistics() {
        return communityMapper.getStatistics();
    }

    @Override
    public Long createPost(Map<String, Object> post) {
        communityMapper.insertPost(post);
        Object id = post.get("id");
        return id == null ? null : Long.valueOf(String.valueOf(id));
    }

    @Override
    public void addView(Long id) {
        communityMapper.incrementView(id);
    }

    @Override
    public void addLike(Long id) {
        communityMapper.incrementLike(id);
    }

    @Override
    public void deletePost(Long id) {
        communityMapper.softDelete(id);
    }

    @Override
    public com.github.pagehelper.PageInfo<Map<String, Object>> pageComments(Long postId, Integer pageNum, Integer pageSize) {
        com.github.pagehelper.PageHelper.startPage(pageNum==null?1:pageNum, pageSize==null?10:pageSize);
        // 统一走带 parentId 的签名，避免 MyBatis 在缺参时的 OGNL 取值异常
        List<Map<String, Object>> list = communityMapper.listComments(postId, null);
        return new com.github.pagehelper.PageInfo<>(list);
    }

    @Override
    public com.github.pagehelper.PageInfo<Map<String, Object>> pageReplies(Long postId, Long parentId, Integer pageNum, Integer pageSize) {
        com.github.pagehelper.PageHelper.startPage(pageNum==null?1:pageNum, pageSize==null?10:pageSize);
        List<Map<String, Object>> list = communityMapper.listComments(postId, parentId);
        return new com.github.pagehelper.PageInfo<>(list);
    }

    @Override
    public com.github.pagehelper.PageInfo<Map<String, Object>> pageCommentsWithLikeStatus(Long postId, Integer pageNum, Integer pageSize, Long userId, String userType) {
        com.github.pagehelper.PageHelper.startPage(pageNum==null?1:pageNum, pageSize==null?10:pageSize);
        List<Map<String, Object>> list = communityMapper.listCommentsWithLikeStatus(postId, null, userId, userType);
        return new com.github.pagehelper.PageInfo<>(list);
    }

    @Override
    public com.github.pagehelper.PageInfo<Map<String, Object>> pageRepliesWithLikeStatus(Long postId, Long parentId, Integer pageNum, Integer pageSize, Long userId, String userType) {
        com.github.pagehelper.PageHelper.startPage(pageNum==null?1:pageNum, pageSize==null?10:pageSize);
        List<Map<String, Object>> list = communityMapper.listCommentsWithLikeStatus(postId, parentId, userId, userType);
        return new com.github.pagehelper.PageInfo<>(list);
    }

    @Override
    public Long addComment(Map<String, Object> params) {
        communityMapper.insertComment(params);
        Object id = params.get("id");
        if (params.get("postId") != null) {
            Long postId = Long.valueOf(String.valueOf(params.get("postId")));
            communityMapper.incrementPostComment(postId);
        }
        return id == null ? null : Long.valueOf(String.valueOf(id));
    }

    @Override
    public void deleteComment(Long id, Long postId) {
        communityMapper.softDeleteComment(id);
        if (postId != null) {
            communityMapper.decrementPostComment(postId);
        }
    }

    @Override
    public boolean toggleLike(Long postId, Long userId, String userType) {
        int count = communityMapper.countLike(postId, userId, userType);
        if (count > 0) {
            communityMapper.deleteLike(postId, userId, userType);
            communityMapper.decrementLike(postId);
            return false; // now unliked
        } else {
            communityMapper.insertLike(postId, userId, userType);
            communityMapper.incrementLike(postId);
            return true; // now liked
        }
    }

    @Override
    public boolean toggleCommentLike(Long commentId, Long userId, String userType) {
        int count = communityMapper.countCommentLike(commentId, userId, userType);
        if (count > 0) {
            communityMapper.deleteCommentLike(commentId, userId, userType);
            communityMapper.decrementCommentLike(commentId);
            return false; // now unliked
        } else {
            communityMapper.insertCommentLike(commentId, userId, userType);
            communityMapper.incrementCommentLike(commentId);
            return true; // now liked
        }
    }

    @Override
    public java.util.List<java.util.Map<String, Object>> listTopResources(int limit) {
        return communityMapper.listTopResources(limit);
    }

    @Override
    public com.github.pagehelper.PageInfo<java.util.Map<String, Object>> pagePostsFiltered(Long subjectId, String subType, String keyword, Long categoryId, Long userId, String userType, int pageNum, int pageSize) {
        com.github.pagehelper.PageHelper.startPage(pageNum, pageSize);
        java.util.List<java.util.Map<String,Object>> list = communityMapper.pagePostsFiltered(subjectId, subType, keyword, categoryId, userId, userType);
        return new com.github.pagehelper.PageInfo<>(list);
    }

    @Override
    public java.util.List<java.util.Map<String, Object>> listFollowingResources(Long studentId, int limit) {
        return communityMapper.listFollowingResources(studentId, limit);
    }

    @Override
    public com.github.pagehelper.PageInfo<java.util.Map<String, Object>> pageResources(String keyword, String fileType, int pageNum, int pageSize) {
        com.github.pagehelper.PageHelper.startPage(pageNum, pageSize);
        java.util.List<java.util.Map<String,Object>> list = communityMapper.listResources(keyword, fileType);
        return new com.github.pagehelper.PageInfo<>(list);
    }

    @Override
    public void addResourceDownload(Long id) {
        communityMapper.incrementResourceDownload(id);
    }
}


