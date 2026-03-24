import os
import subprocess
import time
import requests
import fitz  # PyMuPDF
import json
from pathlib import Path

# --- 配置区 ---
# 线上部署的 API 根路径
API_BASE = "https://ppt.ai-knowledgepoints.cn/api"
# 本地 PPT 模板目录
SOURCE_DIR = "/Users/zhangqilai/project/ppt-project/ppt-websites/local_ppts"
# 临时文件存放目录 (会自动创建)
TEMP_DIR = os.path.expanduser("~/Downloads/ppt_silent_temp")
# LibreOffice 执行路径 (macOS 默认路径)
SOFFICE_PATH = "/Applications/LibreOffice.app/Contents/MacOS/soffice"
# 分类与价格方案文件
SCHEME_FILE = "scheme.json"

# 确保必要的目录存在
os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(SOURCE_DIR, exist_ok=True)

def load_scheme():
    if os.path.exists(SCHEME_FILE):
        with open(SCHEME_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def pptx_to_pdf_headless(pptx_path, output_dir):
    """使用 LibreOffice --headless 模式静默将 PPTX 转换为 PDF"""
    print(f"    > 正在后台转换 PPTX 为 PDF...")
    try:
        result = subprocess.run([
            SOFFICE_PATH,
            '--headless',
            '--convert-to', 'pdf',
            '--outdir', output_dir,
            pptx_path
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        if result.returncode == 0:
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
        for i in range(min(4, len(doc))):
            page = doc.load_page(i)
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
            
            if i == 0:
                img_path = os.path.join(output_dir, f"main_{int(time.time())}_{i}.png")
                pix.save(img_path)
                image_results["main"] = img_path
            else:
                img_path = os.path.join(output_dir, f"detail{i}_{int(time.time())}_{i}.png")
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
    if not os.path.exists(SOFFICE_PATH):
        print(f"❌ 错误: 未在 {SOFFICE_PATH} 找到 LibreOffice。")
        return

    scheme = load_scheme()
    pptx_files = list(Path(SOURCE_DIR).glob("*.pptx"))
    
    # 过滤出在 scheme 中的文件
    to_process = [f for f in pptx_files if f.name in scheme]
    
    if not to_process:
        print(f"ℹ️ 在 {SOURCE_DIR} 下未找到 scheme.json 中定义的待处理文件。")
        return

    print(f"🚀 准备上传 {len(to_process)} 个文件:")
    for f in to_process:
        info = scheme[f.name]
        print(f"  - {f.name} (分类: {info['categoryId']}, 价格: {info['price']})")
    
    confirm = input("\n确认开始上传？(y/n): ")
    if confirm.lower() != 'y':
        print("已取消任务。")
        return

    for index, ppt_path in enumerate(to_process):
        product_id = int(time.time() * 1000)
        title = ppt_path.stem
        info = scheme[ppt_path.name]
        
        print(f"\n[{index+1}/{len(to_process)}] 正在处理: {title}")

        pdf_path = pptx_to_pdf_headless(str(ppt_path), TEMP_DIR)
        if not pdf_path: continue

        images = pdf_to_images(pdf_path, TEMP_DIR)
        if not images["main"]: continue

        print("    > 正在同步文件到服务器...")
        main_info = upload_file_to_api(images["main"], product_id)
        if not main_info: continue

        screenshot_urls = []
        for d_path in images["details"]:
            up_info = upload_file_to_api(d_path, product_id)
            if up_info: screenshot_urls.append(up_info['url'])

        ppt_info = upload_file_to_api(str(ppt_path), product_id)
        if not ppt_info: continue

        template_metadata = {
            "id": product_id,
            "title": title,
            "price": info['price'],
            "categoryId": info['categoryId'],
            "image": main_info['url'],
            "pptFile": ppt_info['filename'],
            "screenshots": screenshot_urls,
            "source": "Admin"
        }

        try:
            resp = requests.post(f"{API_BASE}/templates", json=template_metadata, timeout=10)
            if resp.status_code == 201:
                print(f"    ✅ 成功上线！")
            else:
                print(f"    ❌ 元数据提交失败: {resp.text}")
        except Exception as e:
            print(f"    ❌ 网络异常: {e}")

        # 清理
        try:
            if os.path.exists(pdf_path): os.remove(pdf_path)
            if images["main"] and os.path.exists(images["main"]): os.remove(images["main"])
            for d_path in images["details"]:
                if os.path.exists(d_path): os.remove(d_path)
        except: pass

    print("\n🎉 全部自动化任务处理完成！")

if __name__ == "__main__":
    process_and_upload()
