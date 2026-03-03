import os
import subprocess
import time
import requests
import fitz  # PyMuPDF
from pathlib import Path

# --- 配置区 ---
# 线上部署的 API 根路径
API_BASE = "https://ppt.ai-knowledgepoints.cn/api"
# 本地 PPT 模板目录
SOURCE_DIR = "/Users/zhangqilai/project/ppt-project/files"
# 临时文件存放目录 (会自动创建)
TEMP_DIR = os.path.expanduser("~/Downloads/ppt_silent_temp")
# LibreOffice 执行路径 (macOS 默认路径)
SOFFICE_PATH = "/Applications/LibreOffice.app/Contents/MacOS/soffice"

# 默认业务配置
DEFAULT_PRICE = 1.9
DEFAULT_CATEGORY_ID = 1  # 对应 "教学竞赛/教学创新"

# 确保必要的目录存在
os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(SOURCE_DIR, exist_ok=True)

def pptx_to_pdf_headless(pptx_path, output_dir):
    """使用 LibreOffice --headless 模式静默将 PPTX 转换为 PDF"""
    print(f"    > 正在后台转换 PPTX 为 PDF...")
    try:
        # 运行 LibreOffice 命令行转换
        result = subprocess.run([
            SOFFICE_PATH,
            '--headless',
            '--convert-to', 'pdf',
            '--outdir', output_dir,
            pptx_path
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        if result.returncode == 0:
            # 转换后的 PDF 文件名与原 PPTX 同名
            pdf_name = Path(pptx_path).stem + ".pdf"
            pdf_full_path = os.path.join(output_dir, pdf_name)
            if os.path.exists(pdf_full_path):
                return pdf_full_path
        else:
            print(f"    ❌ LibreOffice 转换失败: {result.stderr.decode('utf-8')}")
    except Exception as e:
        print(f"    ❌ 转换 PDF 异常: {e}")
    return None

def pdf_to_images(pdf_path, output_dir):
    """使用 PyMuPDF 从 PDF 提取前 4 页作为 PNG 图片"""
    print(f"    > 正在从 PDF 提取缩略图 (前4页)...")
    image_results = {"main": None, "details": []}
    try:
        doc = fitz.open(pdf_path)
        # 遍历前 4 页 (索引 0, 1, 2, 3)
        for i in range(min(4, len(doc))):
            page = doc.load_page(i)
            # 设置缩放比例，2.0 表示 2倍清晰度 (DPI约为144)
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
            
            if i == 0:
                # 第一页作为主图
                img_path = os.path.join(output_dir, f"main_{int(time.time())}.png")
                pix.save(img_path)
                image_results["main"] = img_path
            else:
                # 后续页作为详情图
                img_path = os.path.join(output_dir, f"detail{i}_{int(time.time())}.png")
                pix.save(img_path)
                image_results["details"].append(img_path)
        doc.close()
    except Exception as e:
        print(f"    ❌ 提取图片异常: {e}")
    return image_results

def upload_file_to_api(file_path, product_id):
    """调用 /api/upload 接口上传单个文件"""
    url = f"{API_BASE}/upload?id={product_id}"
    try:
        with open(file_path, 'rb') as f:
            files = {'file': (os.path.basename(file_path), f)}
            response = requests.post(url, files=files, timeout=60)
            if response.status_code == 200:
                return response.json()
            else:
                print(f"    ❌ 上传失败 [{response.status_code}]: {response.text}")
    except Exception as e:
        print(f"    ❌ 上传请求异常: {e}")
    return None

def process_and_upload():
    # 检查 LibreOffice 是否存在
    if not os.path.exists(SOFFICE_PATH):
        print(f"❌ 错误: 未在 {SOFFICE_PATH} 找到 LibreOffice。请先安装或修改路径。")
        return

    pptx_files = list(Path(SOURCE_DIR).glob("*.pptx"))
    if not pptx_files:
        print(f"ℹ️ 在目录 {SOURCE_DIR} 下未找到任何 .pptx 文件。")
        return

    print(f"🚀 开始静默上传任务，共 {len(pptx_files)} 个文件...")

    for index, ppt_path in enumerate(pptx_files):
        # 生成唯一产品 ID (毫秒级时间戳)
        product_id = int(time.time() * 1000)
        title = ppt_path.stem
        print(f"\n[{index+1}/{len(pptx_files)}] 正在处理: {title}")

        # 1. 转换 PPTX 为 PDF (后台静默)
        pdf_path = pptx_to_pdf_headless(str(ppt_path), TEMP_DIR)
        if not pdf_path:
            continue

        # 2. 从 PDF 提取图片 (后台静默)
        images = pdf_to_images(pdf_path, TEMP_DIR)
        
        if not images["main"]:
            print("    ❌ 未能提取到主图，跳过。")
            continue

        # 3. 同步到线上服务器
        print("    > 正在同步文件到服务器...")
        
        # 上传主图
        main_info = upload_file_to_api(images["main"], product_id)
        if not main_info:
            continue

        # 上传详情图
        screenshot_urls = []
        for d_path in images["details"]:
            info = upload_file_to_api(d_path, product_id)
            if info:
                screenshot_urls.append(info['url'])

        # 上传 PPT 原文件
        ppt_info = upload_file_to_api(str(ppt_path), product_id)
        if not ppt_info:
            continue

        # 4. 提交元数据入库
        template_metadata = {
            "id": product_id,
            "title": title,
            "price": DEFAULT_PRICE,
            "categoryId": DEFAULT_CATEGORY_ID,
            "image": main_info['url'],
            "pptFile": ppt_info['filename'],
            "screenshots": screenshot_urls
        }

        try:
            resp = requests.post(f"{API_BASE}/templates", json=template_metadata, timeout=10)
            if resp.status_code == 201:
                print(f"    ✅ 成功入库并上线！")
            else:
                print(f"    ❌ 元数据提交失败: {resp.text}")
        except Exception as e:
            print(f"    ❌ 网络异常: {e}")

        # 5. 任务清理：删除本次生成的临时 PDF 和 PNG 图片
        try:
            if os.path.exists(pdf_path):
                os.remove(pdf_path)
            if images["main"] and os.path.exists(images["main"]):
                os.remove(images["main"])
            for d_path in images["details"]:
                if os.path.exists(d_path):
                    os.remove(d_path)
        except Exception as e:
            print(f"    ⚠️ 清理临时文件时出错: {e}")

    print("\n🎉 全部自动化任务处理完成！")

if __name__ == "__main__":
    process_and_upload()
