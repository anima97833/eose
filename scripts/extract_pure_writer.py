#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
纯纯写作 (Pure Writer) 备份文件通用解析与 Markdown 导出脚本
Universal Pure Writer (.pwb / .db) to Markdown Exporter
=============================================================================
功能说明：
1. 本脚本为开源通用工具，不包含任何私人数据或硬编码路径。
2. 支持解析纯纯写作备份包 (*.pwb, 实为 7z 压缩包) 或解包后的 SQLite 数据库 (*.db)。
3. 基于纯纯写作的区间排位排序算法 (Interval Rank Algorithm)，将文章精准归入对应的
   「书籍(Folder) -> 分卷(Category) -> 章节(Article.md)」。
4. 导出后可直接生成 Markdown 树状目录，并自动打包为 .zip 压缩包。
5. 生成的 .zip 或文件夹可直接拖拽导入至云雀轻拟物桌面的「文件」App 中离线阅读与管理。

使用方法：
  python scripts/extract_pure_writer.py <path_to_backup.pwb_or_db> [output_directory]

示例：
  python scripts/extract_pure_writer.py my_novel.pwb
  python scripts/extract_pure_writer.py my_novel.pwb ./exported_books
=============================================================================
"""

import sys
import os
import re
import shutil
import sqlite3
import zipfile
import tempfile
import subprocess
from pathlib import Path

# 针对 Windows 控制台设置 UTF-8 输出防乱码与编码报错
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass


def sanitize_filename(name: str) -> str:
    """清理文件名中的非法字符 (适用于 Windows / macOS / Linux)"""
    if not name or not name.strip():
        return "未命名"
    # 替换 Windows 禁止字符 \ / : * ? " < > |
    clean = re.sub(r'[\\/*?:"<>|\r\n\t]', '_', name.strip())
    # 去除首尾点号和空格
    clean = clean.strip('. ')
    return clean if clean else "未命名"


def extract_pwb_archive(pwb_path: str, temp_dir: str) -> str:
    """
    解包 .pwb 文件 (7z 格式) 并寻找内部的 SQLite .db 数据库文件
    """
    pwb_file = Path(pwb_path)
    if not pwb_file.is_file():
        raise FileNotFoundError(f"找不到指定的备份文件: {pwb_path}")

    # 如果用户直接提供的是 SQLite .db 数据库文件
    if pwb_file.suffix.lower() == '.db':
        return str(pwb_file.resolve())

    # 优先尝试使用系统 7z 命令行解包
    unpacked_ok = False
    try:
        res = subprocess.run(
            ['7z', 'x', str(pwb_file.resolve()), f'-o{temp_dir}', '-y'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        if res.returncode == 0:
            unpacked_ok = True
    except FileNotFoundError:
        pass

    # 如果系统未安装 7z，尝试使用 Python py7zr 库
    if not unpacked_ok:
        try:
            import py7zr
            with py7zr.SevenZipFile(str(pwb_file), mode='r') as archive:
                archive.extractall(path=temp_dir)
            unpacked_ok = True
        except ImportError:
            pass

    if not unpacked_ok:
        raise RuntimeError(
            "解压 .pwb 文件失败！请确保系统中已安装 7-Zip (已加入 PATH) "
            "或者通过命令安装 py7zr: pip install py7zr"
        )

    # 在解压目录中查找 SQLite 数据库
    db_candidates = list(Path(temp_dir).rglob("*.db"))
    if not db_candidates:
        # 有些版本可能没有 .db 后缀，检查文件头部 magic bytes
        for f in Path(temp_dir).rglob("*"):
            if f.is_file() and f.stat().st_size > 100:
                try:
                    with open(f, 'rb') as fp:
                        header = fp.read(16)
                        if header.startswith(b'SQLite format 3'):
                            return str(f.resolve())
                except Exception:
                    pass
        raise FileNotFoundError("在解压后的备份中未找到 SQLite 格式的数据库文件！")

    return str(db_candidates[0].resolve())


def export_database_to_markdown(db_path: str, output_base_dir: str) -> tuple[int, int, int]:
    """
    连接 SQLite 数据库，还原书籍、分卷与章节结构并输出 Markdown 文件。
    返回: (books_count, categories_count, articles_count)
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 1. 查询所有书架/书籍 (Folder)，排除废纸篓 (PW_Trash) 与已删除书籍
    cursor.execute("""
        SELECT id, name, rank 
        FROM Folder 
        WHERE id != 'PW_Trash' AND (deleted IS NULL OR deleted = 0) 
        ORDER BY rank ASC, id ASC
    """)
    folders = cursor.fetchall()

    if not folders:
        folders = [("Default", "我的书架", 0)]

    # 2. 查询所有分卷 (Category)，排除已删除分卷
    cursor.execute("""
        SELECT id, name, rank, folderId 
        FROM Category 
        WHERE (deleted IS NULL OR deleted = 0) 
        ORDER BY folderId ASC, rank ASC
    """)
    categories = cursor.fetchall()

    # 按书籍 ID 分组分卷
    cat_by_folder: dict[str, list] = {}
    for cat in categories:
        cid, cname, crank, fid = cat
        cat_by_folder.setdefault(str(fid), []).append((cid, cname, crank))

    # 3. 查询所有章节文章 (Article)，排除已删除和废纸篓中的文章
    cursor.execute("""
        SELECT id, title, content, rank, folderId, deleted 
        FROM Article 
        WHERE (deleted IS NULL OR deleted = 0) AND folderId != 'PW_Trash'
    """)
    articles = cursor.fetchall()

    total_articles = 0
    total_categories = len(categories)
    total_folders = len(folders)

    out_path = Path(output_base_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    # 遍历每本书
    for fid, fname, _ in folders:
        clean_book_name = sanitize_filename(fname or "未命名书籍")
        book_dir = out_path / clean_book_name
        book_dir.mkdir(parents=True, exist_ok=True)

        cats = cat_by_folder.get(str(fid), [])
        # 筛选出属于本书的文章
        book_articles = [a for a in articles if str(a[4]) == str(fid)]

        if not cats:
            # 如果没有分卷，直接保存在书籍根目录下
            for art_idx, art in enumerate(sorted(book_articles, key=lambda x: x[3] if x[3] is not None else 0), 1):
                aid, atitle, acontent, _, _, _ = art
                title_str = sanitize_filename(atitle or f"章节_{art_idx}")
                file_path = book_dir / f"{title_str}.md"
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(f"# {atitle or '无标题'}\n\n{acontent or ''}\n")
                total_articles += 1
            continue

        # 排序分卷
        cats_sorted = sorted(cats, key=lambda x: x[2] if x[2] is not None else 0)

        # 遍历每个分卷，使用区间排位算法归类文章
        for i, (cid, cname, crank) in enumerate(cats_sorted):
            next_crank = cats_sorted[i + 1][2] if i + 1 < len(cats_sorted) else float('inf')
            clean_cat_name = sanitize_filename(cname or f"分卷_{i+1}")
            cat_dir = book_dir / clean_cat_name
            cat_dir.mkdir(parents=True, exist_ok=True)

            # 区间匹配：如果是第一个卷，把所有 rank < cats_sorted[0].rank 的也兜底收纳进来
            if i == 0:
                matched_articles = [
                    a for a in book_articles
                    if a[3] is not None and a[3] < next_crank
                ]
            else:
                matched_articles = [
                    a for a in book_articles
                    if a[3] is not None and crank <= a[3] < next_crank
                ]
            matched_articles.sort(key=lambda x: x[3])

            for art_idx, art in enumerate(matched_articles, 1):
                aid, atitle, acontent, _, _, _ = art
                title_str = sanitize_filename(atitle or f"章节_{art_idx}")
                file_path = cat_dir / f"{title_str}.md"
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(f"# {atitle or '无标题'}\n\n{acontent or ''}\n")
                total_articles += 1

    conn.close()
    return total_folders, total_categories, total_articles


def create_zip_archive(source_dir: str, output_zip_path: str):
    """将导出的文件夹打包为便于直接拖入网页的 .zip 压缩包"""
    with zipfile.ZipFile(output_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        src = Path(source_dir)
        for file in src.rglob('*'):
            if file.is_file():
                rel_path = file.relative_to(src)
                zipf.write(file, arcname=str(rel_path))


def main():
    if len(sys.argv) < 2:
        print("=" * 60)
        print("纯纯写作 (Pure Writer) 通用备份解析与 Markdown 导出工具")
        print("=" * 60)
        print("用法:")
        print("  python scripts/extract_pure_writer.py <备份文件.pwb 或 数据库.db> [导出目录]")
        print("\n说明:")
        print("  - 支持 .pwb 备份文件与解包后的 SQLite .db 数据库。")
        print("  - 会自动导出为完整的 [书籍 / 分卷 / 章节.md] 目录结构。")
        print("  - 并在同目录下生成便于直接导入轻拟物网页的 .zip 压缩包。")
        print("=" * 60)
        sys.exit(1)

    input_file = sys.argv[1]
    if not os.path.exists(input_file):
        print(f"错误: 找不到文件 '{input_file}'")
        sys.exit(1)

    out_dir = sys.argv[2] if len(sys.argv) >= 3 else os.path.join(os.path.dirname(input_file) or ".", "pure_writer_export")
    temp_dir = tempfile.mkdtemp(prefix="pw_extract_")

    try:
        print(f"[*] 正在分析备份文件: {os.path.basename(input_file)} ...")
        db_path = extract_pwb_archive(input_file, temp_dir)
        print(f"[*] 找到数据库文件: {os.path.basename(db_path)}")

        print(f"[*] 正在按 [书籍 / 分卷 / 章节] 导出 Markdown 文件到: {out_dir} ...")
        folders_count, cats_count, arts_count = export_database_to_markdown(db_path, out_dir)

        # 生成 zip 压缩包
        clean_dir = out_dir.rstrip('/\\')
        zip_path = f"{clean_dir}.zip"
        print(f"[*] 正在打包为便于浏览器导入的压缩包: {os.path.basename(zip_path)} ...")
        create_zip_archive(out_dir, zip_path)

        print("\n" + "=" * 60)
        print("[SUCCESS] 导出成功！")
        print(f"   * 书籍数量: {folders_count} 本")
        print(f"   * 分卷数量: {cats_count} 个")
        print(f"   * 章节总数: {arts_count} 篇 Markdown 文章")
        print(f"   * Markdown 文件夹: {os.path.abspath(out_dir)}")
        print(f"   * 一键导入压缩包: {os.path.abspath(zip_path)}")
        print("=" * 60)
        print("[HINT] 接下来您可以：")
        print("   1. 打开桌面的「文件」App -> 点击「导入笔记/小说」")
        print(f"   2. 直接把 {os.path.basename(zip_path)} 拖入网页窗口，秒级离线存入！")
        print("=" * 60)

    except Exception as e:
        print(f"\n[!] 导出出错: {e}")
        sys.exit(1)
    finally:
        # 清理临时解包目录
        shutil.rmtree(temp_dir, ignore_errors=True)


if __name__ == '__main__':
    main()
