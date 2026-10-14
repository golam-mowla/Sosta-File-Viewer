pub mod file_ops;
pub mod models;

use models::{DriveItem, FileEntry, FileMetadataDetails, HexChunk, PsdInfo, ZipArchiveEntry};
use std::fs;
use std::path::Path;

#[tauri::command]
fn list_dir(dir_path: String, show_hidden: bool) -> Result<Vec<FileEntry>, String> {
    file_ops::list_directory(&dir_path, show_hidden)
}

#[tauri::command]
fn get_metadata(file_path: String, compute_hash: bool) -> Result<FileMetadataDetails, String> {
    file_ops::get_file_metadata(&file_path, compute_hash)
}

#[tauri::command]
fn read_text_file(file_path: String, max_bytes: Option<usize>) -> Result<String, String> {
    let limit = max_bytes.unwrap_or(1024 * 1024);
    file_ops::read_text(&file_path, limit)
}

#[tauri::command]
fn read_base64_file(file_path: String) -> Result<String, String> {
    file_ops::read_base64(&file_path)
}

#[tauri::command]
fn read_hex_data(file_path: String, offset: usize, length: usize) -> Result<HexChunk, String> {
    file_ops::read_hex_chunk(&file_path, offset, length)
}

#[tauri::command]
fn parse_psd(file_path: String) -> Result<PsdInfo, String> {
    file_ops::parse_psd_metadata(&file_path)
}

#[tauri::command]
fn inspect_zip(file_path: String) -> Result<Vec<ZipArchiveEntry>, String> {
    file_ops::inspect_zip_archive(&file_path)
}

#[tauri::command]
fn search_files(
    dir_path: String,
    query: String,
    filter_ext: Option<String>,
    max_results: Option<usize>,
) -> Result<Vec<FileEntry>, String> {
    file_ops::search_directory(&dir_path, &query, filter_ext.as_deref(), max_results.unwrap_or(200))
}

#[tauri::command]
fn get_drives() -> Vec<DriveItem> {
    file_ops::get_system_drives()
}

#[tauri::command]
fn copy_files(sources: Vec<String>, target_dir: String) -> Result<(), String> {
    file_ops::copy_items(sources, &target_dir)
}

#[tauri::command]
fn move_files(sources: Vec<String>, target_dir: String) -> Result<(), String> {
    file_ops::move_items(sources, &target_dir)
}

#[tauri::command]
fn delete_files(paths: Vec<String>) -> Result<(), String> {
    file_ops::delete_items(paths)
}

#[tauri::command]
fn rename_file(old_path: String, new_name: String) -> Result<String, String> {
    file_ops::rename_item(&old_path, &new_name)
}

#[tauri::command]
fn duplicate_file(path: String) -> Result<String, String> {
    file_ops::duplicate_item(&path)
}

#[tauri::command]
fn create_directory(parent_path: String, folder_name: String) -> Result<String, String> {
    let p = Path::new(&parent_path).join(&folder_name);
    fs::create_dir_all(&p).map_err(|e| e.to_string())?;
    Ok(p.to_string_lossy().to_string())
}

#[tauri::command]
fn create_file(parent_path: String, file_name: String, content: String) -> Result<String, String> {
    let p = Path::new(&parent_path).join(&file_name);
    fs::write(&p, content).map_err(|e| e.to_string())?;
    Ok(p.to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            list_dir,
            get_metadata,
            read_text_file,
            read_base64_file,
            read_hex_data,
            parse_psd,
            inspect_zip,
            search_files,
            get_drives,
            copy_files,
            move_files,
            delete_files,
            rename_file,
            duplicate_file,
            create_directory,
            create_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running Sosta File Viewer Tauri application");
}
