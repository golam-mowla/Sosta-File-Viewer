use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub is_symlink: bool,
    pub is_hidden: bool,
    pub size: u64,
    pub extension: String,
    pub modified: Option<i64>,
    pub created: Option<i64>,
    pub readonly: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileMetadataDetails {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub size: u64,
    pub size_formatted: String,
    pub extension: String,
    pub mime_type: String,
    pub modified: Option<String>,
    pub created: Option<String>,
    pub accessed: Option<String>,
    pub readonly: bool,
    pub permissions: String,
    pub sha256: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PsdInfo {
    pub valid: bool,
    pub signature: String,
    pub version: u16,
    pub channels: u16,
    pub height: u32,
    pub width: u32,
    pub depth: u16,
    pub color_mode: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ZipArchiveEntry {
    pub name: String,
    pub is_dir: bool,
    pub compressed_size: u64,
    pub uncompressed_size: u64,
    pub last_modified: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct HexChunk {
    pub offset: usize,
    pub total_size: usize,
    pub hex_lines: Vec<HexLine>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct HexLine {
    pub offset: String,
    pub bytes: Vec<String>,
    pub ascii: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DriveItem {
    pub name: String,
    pub path: String,
    pub total_space: Option<u64>,
    pub available_space: Option<u64>,
}
