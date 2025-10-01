package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.awt.*;
import java.awt.image.BufferedImage;
import javax.imageio.ImageIO;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/mini/upload")
public class MiniUploadController {

    @Value("${upload.base-dir:uploads}")
    private String baseDir;

    @Value("${upload.ffmpeg.path:ffmpeg}")
    private String ffmpegPath;

    /**
     * 通用文件上传（图片/视频/文档）
     */
    @PostMapping("/file")
    public Result<Object> upload(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return Result.badRequest("文件不能为空");
        }
        try {
            // 计算绝对基路径：若配置为相对路径，则基于应用启动目录
            Path basePath = Paths.get(baseDir);
            if (!basePath.isAbsolute()) {
                String appDir = System.getProperty("user.dir");
                basePath = Paths.get(appDir).resolve(basePath);
            }

            // 目录：uploads/yyyy/MM/dd
            LocalDate today = LocalDate.now();
            File dir = basePath
                    .resolve(String.valueOf(today.getYear()))
                    .resolve(String.format("%02d", today.getMonthValue()))
                    .resolve(String.format("%02d", today.getDayOfMonth()))
                    .toFile();
            if (!dir.exists() && !dir.mkdirs()) {
                return Result.error("创建上传目录失败");
            }

            String original = file.getOriginalFilename();
            String ext = StringUtils.getFilenameExtension(original);
            String filename = UUID.randomUUID().toString().replace("-", "") + (ext != null ? ("." + ext) : "");
            File dest = new File(dir, filename);
            file.transferTo(dest);

            // 返回相对URL，统一以 /uploads/ 前缀暴露
            String url = "/uploads/" + today.getYear() + "/" + String.format("%02d", today.getMonthValue()) + "/" + String.format("%02d", today.getDayOfMonth()) + "/" + filename;

            // 简化封面生成：
            // - 图片：封面即文件本身
            // - 视频：尝试用 ffmpeg 截取首帧生成 jpg 封面
            // - 其它：不生成（前端将按扩展名回退到默认图标）
            String extLower = (ext == null ? "" : ext.toLowerCase());
            String coverUrl = null;
            if (extLower.matches("jpg|jpeg|png|gif|webp")) {
                coverUrl = url;
            } else if (extLower.matches("mp4|mov|avi|mkv|flv|wmv")) {
                try {
                    String baseName = filename;
                    int dot = baseName.lastIndexOf('.');
                    if (dot > 0) baseName = baseName.substring(0, dot);
                    File coverFile = new File(dir, baseName + "_cover.jpg");
                    // ffmpeg -ss 00:00:01 -i input -frames:v 1 -q:v 2 output
                    ProcessBuilder pb = new ProcessBuilder(
                            ffmpegPath, "-ss", "00:00:01",
                            "-i", dest.getAbsolutePath(),
                            "-frames:v", "1",
                            "-q:v", "2",
                            coverFile.getAbsolutePath()
                    );
                    pb.redirectErrorStream(true);
                    Process p = pb.start();
                    p.waitFor();
                    if (coverFile.exists() && coverFile.length() > 0) {
                        coverUrl = "/uploads/" + today.getYear() + "/" + String.format("%02d", today.getMonthValue()) + "/" + String.format("%02d", today.getDayOfMonth()) + "/" + coverFile.getName();
                    }
                } catch (Exception ff) {
                    log.warn("生成视频封面失败: {}", ff.getMessage());
                }
            } else if (extLower.matches("pdf|doc|docx|ppt|pptx")) {
                // 为常见文档类型生成一张简单占位封面图（PNG）
                try {
                    String label = extLower.toUpperCase();
                    String baseName = filename;
                    int dot = baseName.lastIndexOf('.');
                    if (dot > 0) baseName = baseName.substring(0, dot);
                    File coverFile = new File(dir, baseName + "_cover.png");

                    int width = 640;
                    int height = 360;
                    BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
                    Graphics2D g = image.createGraphics();
                    // 背景色
                    Color bg;
                    if (extLower.startsWith("pdf")) bg = new Color(220, 53, 69); // 红
                    else if (extLower.startsWith("ppt")) bg = new Color(255, 140, 0); // 橙
                    else if (extLower.startsWith("doc")) bg = new Color(0, 123, 255); // 蓝
                    else bg = new Color(108, 117, 125); // 灰
                    g.setColor(bg);
                    g.fillRect(0, 0, width, height);
                    // 文本
                    g.setColor(Color.WHITE);
                    g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
                    Font font = new Font("SansSerif", Font.BOLD, 120);
                    g.setFont(font);
                    FontMetrics fm = g.getFontMetrics();
                    int textWidth = fm.stringWidth(label);
                    int x = (width - textWidth) / 2;
                    int y = (height - fm.getHeight()) / 2 + fm.getAscent();
                    g.drawString(label, x, y);
                    g.dispose();

                    ImageIO.write(image, "png", coverFile);
                    if (coverFile.exists() && coverFile.length() > 0) {
                        coverUrl = "/uploads/" + today.getYear() + "/" + String.format("%02d", today.getMonthValue()) + "/" + String.format("%02d", today.getDayOfMonth()) + "/" + coverFile.getName();
                    }
                } catch (Exception e) {
                    log.warn("生成文档封面失败: {}", e.getMessage());
                }
            }

            Map<String, Object> data = new HashMap<>();
            data.put("url", url);
            data.put("name", original);
            data.put("size", file.getSize());
            if (coverUrl != null) data.put("coverUrl", coverUrl);
            return Result.success(data);
        } catch (IOException e) {
            log.error("文件上传失败", e);
            return Result.error("文件上传失败");
        }
    }
}


