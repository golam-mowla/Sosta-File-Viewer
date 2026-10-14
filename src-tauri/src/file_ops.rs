use crate::models::{
    DriveItem, FileEntry, FileMetadataDetails, HexChunk, HexLine, PsdInfo, ZipArchiveEntry,
};
use chrono::{DateTime, Utc};
use sha2::{Digest, Sha256};
use std::fs::{self, File};
use std::io::{Read, Seek, SeekFrom};
use std::path::Path;
use walkdir::WalkDir;

pub fn format_size(bytes: u64) -> String {
    const KB: u64 = 1024;
    const MB: u64 = KB * 1024;
    const GB: u64 = MB * 1024;
    const TB: u64 = GB * 1024;

    if bytes >= TB {
        format!("{:.2} TB", bytes as f64 / TB as f64)
    } else if bytes >= GB {
        format!("{:.2} GB", bytes as f64 / GB as f64)
    } else if bytes >= MB {
        format!("{:.2} MB", bytes as f64 / MB as f64)
    } else if bytes >= KB {
        format!("{:.2} KB", bytes as f64 / KB as f64)
    } else {
        format!("{} B", bytes)
    }
}

pub fn get_mime_type(ext: &str) -> String {
    match ext.to_lowercase().as_str() {
        "txt" | "log" => "text/plain".into(),
        "md" | "markdown" => "text/markdown".into(),
        "json" => "application/json".into(),
        "js" | "mjs" => "text/javascript".into(),
        "ts" | "tsx" => "text/typescript".into(),
        "html" | "htm" => "text/html".into(),
        "css" => "text/css".into(),
        "rs" => "text/x-rust".into(),
        "py" => "text/x-python".into(),
        "png" => "image/png".into(),
        "jpg" | "jpeg" => "image/jpeg".into(),
        "gif" => "image/gif".into(),
        "webp" => "image/webp".into(),
        "svg" => "image/svg+xml".into(),
        "ico" => "image/x-icon".into(),
        "bmp" => "image/bmp".into(),
        "pdf" => "application/pdf".into(),
        "docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document".into(),
        "xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet".into(),
        "psd" => "image/vnd.adobe.photoshop".into(),
        "zip" => "application/zip".into(),
        "mp3" | "wav" | "ogg" => "audio/mpeg".into(),
        "mp4" | "webm" | "mov" => "video/mp4".into(),
        _ => "application/octet-stream".into(),
    }
}

pub fn list_directory(dir_path: &str, show_hidden: bool) -> Result<Vec<FileEntry>, String> {
    let path = Path::new(dir_path);
    if !path.exists() {
        return Err(format!("Path does not exist: {}", dir_path));
    }
    if !path.is_dir() {
        return Err(format!("Path is not a directory: {}", dir_path));
    }

    let entries = fs::read_dir(path).map_err(|e| e.to_string())?;
    let mut result = Vec::new();

    for entry in entries.flatten() {
        let entry_path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();

        let is_hidden = name.starts_with('.') || is_windows_hidden(&entry_path);
        if !show_hidden && is_hidden {
            continue;
        }

        let metadata = entry.metadata().ok();
        let is_dir = metadata.as_ref().map(|m| m.is_dir()).unwrap_or(false);
        let is_symlink = metadata.as_ref().map(|m| m.is_symlink()).unwrap_or(false);
        let size = if is_dir { 0 } else { metadata.as_ref().map(|m| m.len()).unwrap_or(0) };
        let readonly = metadata.as_ref().map(|m| m.permissions().readonly()).unwrap_or(false);

        let extension = if is_dir {
            String::new()
        } else {
            entry_path
                .extension()
                .map(|e| e.to_string_lossy().to_lowercase())
                .unwrap_or_default()
        };

        let modified = metadata
            .as_ref()
            .and_then(|m| m.modified().ok())
            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
            .map(|d| d.as_secs() as i64);

        let created = metadata
            .as_ref()
            .and_then(|m| m.created().ok())
            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
            .map(|d| d.as_secs() as i64);

        result.push(FileEntry {
            name,
            path: entry_path.to_string_lossy().to_string(),
            is_dir,
            is_symlink,
            is_hidden,
            size,
            extension,
            modified,
            created,
            readonly,
        });
    }

    // Sort directories first, then files alphabetically
    result.sort_by(|a, b| {
        if a.is_dir != b.is_dir {
            b.is_dir.cmp(&a.is_dir)
        } else {
            a.name.to_lowercase().cmp(&b.name.to_lowercase())
        }
    });

    Ok(result)
}

fn is_windows_hidden(path: &Path) -> bool {
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::fs::MetadataExt;
        if let Ok(meta) = fs::metadata(path) {
            const FILE_ATTRIBUTE_HIDDEN: u32 = 0x2;
            return (meta.file_attributes() & FILE_ATTRIBUTE_HIDDEN) != 0;
        }
    }
    let _ = path;
    false
}

pub fn get_file_metadata(file_path: &str, compute_hash: bool) -> Result<FileMetadataDetails, String> {
    let path = Path::new(file_path);
    let meta = fs::metadata(path).map_err(|e| e.to_string())?;

    let is_dir = meta.is_dir();
    let size = if is_dir { 0 } else { meta.len() };
    let size_formatted = format_size(size);
    let name = path.file_name().unwrap_or_default().to_string_lossy().to_string();
    let ext = path
        .extension()
        .map(|e| e.to_string_lossy().to_lowercase())
        .unwrap_or_default();
    let mime_type = if is_dir { "folder".to_string() } else { get_mime_type(&ext) };

    let modified = meta.modified().ok().map(|t| {
        let dt: DateTime<Utc> = t.into();
        dt.format("%Y-%m-%d %H:%M:%S UTC").to_string()
    });

    let created = meta.created().ok().map(|t| {
        let dt: DateTime<Utc> = t.into();
        dt.format("%Y-%m-%d %H:%M:%S UTC").to_string()
    });

    let accessed = meta.accessed().ok().map(|t| {
        let dt: DateTime<Utc> = t.into();
        dt.format("%Y-%m-%d %H:%M:%S UTC").to_string()
    });

    let readonly = meta.permissions().readonly();
    let permissions = if readonly { "Read-only".to_string() } else { "Read/Write".to_string() };

    let sha256 = if compute_hash && !is_dir && size < 100 * 1024 * 1024 {
        if let Ok(mut f) = File::open(path) {
            let mut hasher = Sha256::new();
            let mut buffer = [0u8; 8192];
            while let Ok(n) = f.read(&mut buffer) {
                if n == 0 {
                    break;
                }
                hasher.update(&buffer[..n]);
            }
            Some(format!("{:x}", hasher.finalize()))
        } else {
            None
        }
    } else {
        None
    };

    Ok(FileMetadataDetails {
        name,
        path: path.to_string_lossy().to_string(),
        is_dir,
        size,
        size_formatted,
        extension: ext,
        mime_type,
        modified,
        created,
        accessed,
        readonly,
        permissions,
        sha256,
    })
}

pub fn read_text(file_path: &str, max_bytes: usize) -> Result<String, String> {
    let mut file = File::open(file_path).map_err(|e| e.to_string())?;
    let mut buffer = vec![0; max_bytes.min(2 * 1024 * 1024)]; // max 2MB text read
    let n = file.read(&mut buffer).map_err(|e| e.to_string())?;
    buffer.truncate(n);
    String::from_utf8(buffer).or_else(|_| Ok("[Binary file content cannot be displayed as UTF-8]".into()))
}

pub fn read_base64(file_path: &str) -> Result<String, String> {
    let mut file = File::open(file_path).map_err(|e| e.to_string())?;
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer).map_err(|e| e.to_string())?;
    Ok(base64::Engine::encode(&base64::engine::general_purpose::STANDARD, &buffer))
}

pub fn read_hex_chunk(file_path: &str, offset: usize, length: usize) -> Result<HexChunk, String> {
    let mut file = File::open(file_path).map_err(|e| e.to_string())?;
    let total_size = file.metadata().map_err(|e| e.to_string())?.len() as usize;

    file.seek(SeekFrom::Start(offset as u64)).map_err(|e| e.to_string())?;
    let mut buffer = vec![0u8; length.min(4096)];
    let bytes_read = file.read(&mut buffer).map_err(|e| e.to_string())?;
    buffer.truncate(bytes_read);

    let mut hex_lines = Vec::new();
    for (i, chunk) in buffer.chunks(16).enumerate() {
        let line_offset = offset + (i * 16);
        let hex_bytes: Vec<String> = chunk.iter().map(|b| format!("{:02X}", b)).collect();
        let ascii: String = chunk
            .iter()
            .map(|&b| if (32..=126).contains(&b) { b as char } else { '.' })
            .collect();

        hex_lines.push(HexLine {
            offset: format!("{:08X}", line_offset),
            bytes: hex_bytes,
            ascii,
        });
    }

    Ok(HexChunk {
        offset,
        total_size,
        hex_lines,
    })
}

pub fn parse_psd_metadata(file_path: &str) -> Result<PsdInfo, String> {
    let mut file = File::open(file_path).map_err(|e| e.to_string())?;
    let mut header = [0u8; 26];
    file.read_exact(&mut header).map_err(|e| e.to_string())?;

    // Check signature: 8BPS
    if &header[0..4] != b"8BPS" {
        return Ok(PsdInfo {
            valid: false,
            signature: String::from_utf8_lossy(&header[0..4]).to_string(),
            version: 0,
            channels: 0,
            height: 0,
            width: 0,
            depth: 0,
            color_mode: "Unknown".into(),
        });
    }

    let version = u16::from_be_bytes([header[4], header[5]]);
    let channels = u16::from_be_bytes([header[12], header[13]]);
    let height = u32::from_be_bytes([header[14], header[15], header[16], header[17]]);
    let width = u32::from_be_bytes([header[18], header[19], header[20], header[21]]);
    let depth = u16::from_be_bytes([header[22], header[23]]);
    let color_mode_code = u16::from_be_bytes([header[24], header[25]]);

    let color_mode = match color_mode_code {
        0 => "Bitmap",
        1 => "Grayscale",
        2 => "Indexed",
        3 => "RGB",
        4 => "CMYK",
        7 => "Multichannel",
        8 => "Duotone",
        9 => "Lab",
        _ => "Other",
    }
    .to_string();

    Ok(PsdInfo {
        valid: true,
        signature: "8BPS".to_string(),
        version,
        channels,
        height,
        width,
        depth,
        color_mode,
    })
}

pub fn inspect_zip_archive(file_path: &str) -> Result<Vec<ZipArchiveEntry>, String> {
    let file = File::open(file_path).map_err(|e| e.to_string())?;
    let mut archive = zip::ZipArchive::new(file).map_err(|e| e.to_string())?;
    let mut entries = Vec::new();

    for i in 0..archive.len() {
        if let Ok(file) = archive.by_index(i) {
            let last_modified = file.last_modified().map(|dt| {
                format!("{:04}-{:02}-{:02} {:02}:{:02}:{:02}", dt.year(), dt.month(), dt.day(), dt.hour(), dt.minute(), dt.second())
            });

            entries.push(ZipArchiveEntry {
                name: file.name().to_string(),
                is_dir: file.is_dir(),
                compressed_size: file.compressed_size(),
                uncompressed_size: file.size(),
                last_modified,
            });
        }
    }

    Ok(entries)
}

pub fn search_directory(
    dir_path: &str,
    query: &str,
    filter_ext: Option<&str>,
    max_results: usize,
) -> Result<Vec<FileEntry>, String> {
    let query_lower = query.to_lowercase();
    let ext_lower = filter_ext.map(|e| e.to_lowercase());
    let mut results = Vec::new();

    for entry in WalkDir::new(dir_path)
        .max_depth(8)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let file_name = entry.file_name().to_string_lossy().to_string();
        if file_name.starts_with('.') {
            continue;
        }

        let is_dir = entry.file_type().is_dir();
        let matches_name = query.is_empty() || file_name.to_lowercase().contains(&query_lower);

        let ext = entry
            .path()
            .extension()
            .map(|e| e.to_string_lossy().to_lowercase())
            .unwrap_or_default();

        let matches_ext = match &ext_lower {
            Some(target) => !target.is_empty() && &ext == target,
            None => true,
        };

        if matches_name && (is_dir || matches_ext) {
            let meta = entry.metadata().ok();
            let size = if is_dir { 0 } else { meta.as_ref().map(|m| m.len()).unwrap_or(0) };
            let modified = meta
                .as_ref()
                .and_then(|m| m.modified().ok())
                .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                .map(|d| d.as_secs() as i64);

            results.push(FileEntry {
                name: file_name,
                path: entry.path().to_string_lossy().to_string(),
                is_dir,
                is_symlink: entry.path_is_symlink(),
                is_hidden: false,
                size,
                extension: ext,
                modified,
                created: None,
                readonly: false,
            });

            if results.len() >= max_results {
                break;
            }
        }
    }

    Ok(results)
}

pub fn get_system_drives() -> Vec<DriveItem> {
    let mut drives = Vec::new();

    #[cfg(target_os = "windows")]
    {
        for letter in b'A'..=b'Z' {
            let path_str = format!("{}:\\", letter as char);
            let path = Path::new(&path_str);
            if path.exists() {
                drives.push(DriveItem {
                    name: format!("Local Disk ({}:)", letter as char),
                    path: path_str,
                    total_space: None,
                    available_space: None,
                });
            }
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        drives.push(DriveItem {
            name: "Root".into(),
            path: "/".into(),
            total_space: None,
            available_space: None,
        });
        if let Ok(home) = std::env::var("HOME") {
            drives.push(DriveItem {
                name: "Home".into(),
                path: home,
                total_space: None,
                available_space: None,
            });
        }
    }

    drives
}

pub fn copy_items(sources: Vec<String>, target_dir: &str) -> Result<(), String> {
    let target = Path::new(target_dir);
    for src_str in sources {
        let src = Path::new(&src_str);
        if let Some(name) = src.file_name() {
            let dest = target.join(name);
            if src.is_dir() {
                copy_recursive(src, &dest)?;
            } else {
                fs::copy(src, &dest).map_err(|e| e.to_string())?;
            }
        }
    }
    Ok(())
}

fn copy_recursive(src: &Path, dest: &Path) -> Result<(), String> {
    fs::create_dir_all(dest).map_err(|e| e.to_string())?;
    for entry in fs::read_dir(src).map_err(|e| e.to_string())?.flatten() {
        let entry_path = entry.path();
        let dest_child = dest.join(entry.file_name());
        if entry_path.is_dir() {
            copy_recursive(&entry_path, &dest_child)?;
        } else {
            fs::copy(&entry_path, &dest_child).map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

pub fn move_items(sources: Vec<String>, target_dir: &str) -> Result<(), String> {
    let target = Path::new(target_dir);
    for src_str in sources {
        let src = Path::new(&src_str);
        if let Some(name) = src.file_name() {
            let dest = target.join(name);
            fs::rename(src, &dest).map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

pub fn delete_items(paths: Vec<String>) -> Result<(), String> {
    for p in paths {
        let path = Path::new(&p);
        if path.is_dir() {
            fs::remove_dir_all(path).map_err(|e| e.to_string())?;
        } else {
            fs::remove_file(path).map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

pub fn rename_item(old_path: &str, new_name: &str) -> Result<String, String> {
    let old = Path::new(old_path);
    let parent = old.parent().ok_or_else(|| "No parent directory".to_string())?;
    let new_path = parent.join(new_name);
    fs::rename(old, &new_path).map_err(|e| e.to_string())?;
    Ok(new_path.to_string_lossy().to_string())
}

pub fn duplicate_item(path_str: &str) -> Result<String, String> {
    let src = Path::new(path_str);
    let parent = src.parent().ok_or_else(|| "No parent directory".to_string())?;
    let stem = src.file_stem().unwrap_or_default().to_string_lossy();
    let ext = src.extension().map(|e| format!(".{}", e.to_string_lossy())).unwrap_or_default();

    let mut counter = 1;
    loop {
        let new_name = format!("{} - Copy ({}){}", stem, counter, ext);
        let candidate = parent.join(&new_name);
        if !candidate.exists() {
            if src.is_dir() {
                copy_recursive(src, &candidate)?;
            } else {
                fs::copy(src, &candidate).map_err(|e| e.to_string())?;
            }
            return Ok(candidate.to_string_lossy().to_string());
        }
        counter += 1;
    }
}
